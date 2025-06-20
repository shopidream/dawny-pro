import { json } from "@remix-run/node";
import { useActionData, useLoaderData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, Page, Layout, Button, Text, Banner, Select, TextField } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { saveStyleFile, listStyleFiles } from "../utils/file-storage";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // 업로드된 파일 목록 조회
  try {
    const uploadedFiles = await listStyleFiles(session.shop);
    return json({ shop: session.shop, uploadedFiles });
  } catch (error) {
    return json({ shop: session.shop, uploadedFiles: [] });
  }
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const cssFile = formData.get("cssFile");
    const styleTheme = formData.get("styleTheme");
    const version = formData.get("version");
    
    if (!cssFile) {
      return json({ error: "Please select a CSS file." }, { status: 400 });
    }

    if (!styleTheme) {
      return json({ error: "Please select a style theme." }, { status: 400 });
    }

    // CSS 파일 내용 읽기
    const cssContent = await cssFile.text();
    
    // CSS 내용 검증
    if (!cssContent.includes("{") || !cssContent.includes("}")) {
      return json({ error: "Invalid CSS file format." }, { status: 400 });
    }

    // 파일 크기 제한 (1MB)
    if (cssContent.length > 1024 * 1024) {
      return json({ error: "File size must be less than 1MB." }, { status: 400 });
    }

    // 파일명 생성: style-[theme]-v[version].css
    const fileName = `style-${styleTheme}-v${version}.css`;
    
    // 실제 파일 저장
    const { filePath, metadata } = await saveStyleFile(fileName, cssContent, session.shop);
    
    console.log(`✅ CSS file saved: ${fileName}`);
    console.log(`📁 Path: ${filePath}`);
    console.log(`📊 Size: ${metadata.size} bytes`);
    
    return json({ 
      success: true, 
      message: `${fileName} has been uploaded and saved successfully!`,
      fileName: fileName,
      theme: styleTheme,
      version: version,
      size: metadata.size,
      filePath: filePath
    });
    
  } catch (error) {
    console.error("Style Upload Error:", error);
    return json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
};

export default function StyleManager() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [selectedTheme, setSelectedTheme] = useState('luxury');
  const [version, setVersion] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);

  const themeOptions = [
    { label: 'Luxury (Premium & Sophisticated)', value: 'luxury' },
    { label: 'Elegance (Graceful & Classic)', value: 'elegance' },
    { label: 'Minimal (Clean & Simple)', value: 'minimal' },
    { label: 'Vibrant (Bold & Energetic)', value: 'vibrant' },
  ];

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  }, []);

  const generateFileName = () => {
    return `style-${selectedTheme}-v${version}.css`;
  };

  return (
    <Page 
      title="Style Manager" 
      backAction={{content: 'Dashboard', url: '/app'}}
    >
      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <Banner status="critical">
              <p>{actionData.error}</p>
            </Banner>
          )}
          
          {actionData?.success && (
            <Banner status="success">
              <p>{actionData.message}</p>
              <div>
                <Text variant="bodyMd">📁 File: {actionData.fileName}</Text><br/>
                <Text variant="bodyMd">🎨 Theme: {actionData.theme}</Text><br/>
                <Text variant="bodyMd">📦 Version: v{actionData.version}</Text><br/>
                <Text variant="bodyMd">📊 Size: {actionData.size} bytes</Text><br/>
                <Text variant="bodyMd">💾 Saved to: {actionData.filePath}</Text>
              </div>
            </Banner>
          )}

          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Upload CSS Style
              </Text>
              <br />
              <Text variant="bodyMd" color="subdued">
                Upload CSS styles for your shoppable videos. 
                Filename will be automatically generated: <strong>{generateFileName()}</strong>
              </Text>
              <br />
              
              <Form method="post" encType="multipart/form-data">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Theme Selection */}
                  <Select
                    label="Style Theme"
                    options={themeOptions}
                    value={selectedTheme}
                    onChange={setSelectedTheme}
                    name="styleTheme"
                  />

                  {/* Version Input */}
                  <TextField
                    label="Version"
                    value={version}
                    onChange={setVersion}
                    name="version"
                    placeholder="1"
                    helpText="Enter numbers only (e.g., 1, 2, 3)"
                  />

                  {/* File Upload */}
                  <div>
                    <Text variant="bodyMd" fontWeight="medium">Select CSS File</Text>
                    <br />
                    <input 
                      type="file" 
                      name="cssFile" 
                      accept=".css,text/css" 
                      onChange={handleFileChange}
                      style={{ 
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                    />
                    {selectedFile && (
                      <Text variant="bodyMd" color="subdued">
                        Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                      </Text>
                    )}
                  </div>

                  {/* Generated filename preview */}
                  <Card sectioned>
                    <div>
                      <Text variant="bodyMd" fontWeight="medium">Generated filename:</Text>
                      <Text variant="bodyMd" color="success">{generateFileName()}</Text>
                    </div>
                  </Card>

                  <Button submit primary disabled={!selectedFile}>
                    Upload Style
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h3">
                Uploaded Files
              </Text>
              <br />
              {loaderData.uploadedFiles.length > 0 ? (
                <div>
                  {loaderData.uploadedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      padding: '10px', 
                      border: '1px solid #eee', 
                      borderRadius: '4px', 
                      marginBottom: '10px' 
                    }}>
                      <Text variant="bodyMd" fontWeight="medium">{file.fileName}</Text><br/>
                      <Text variant="bodyMd" color="subdued">Size: {file.size} bytes</Text><br/>
                      <Text variant="bodyMd" color="subdued">Uploaded: {new Date(file.uploadedAt).toLocaleString()}</Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Text variant="bodyMd" color="subdued">No files uploaded yet.</Text>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h3">
                Style Guide
              </Text>
              <br />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text variant="bodyMd"><strong>Luxury:</strong> Premium and sophisticated design</Text>
                <Text variant="bodyMd"><strong>Elegance:</strong> Graceful and classic styling</Text>
                <Text variant="bodyMd"><strong>Minimal:</strong> Clean and simple design</Text>
                <Text variant="bodyMd"><strong>Vibrant:</strong> Bold and energetic styling</Text>
              </div>
              <br />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text variant="bodyMd">• CSS files only</Text>
                <Text variant="bodyMd">• Maximum file size: 1MB</Text>
                <Text variant="bodyMd">• Automatic file naming</Text>
                <Text variant="bodyMd">• Secure server storage</Text>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
