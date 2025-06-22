import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
  Divider,
  Banner,
  Modal,
  Icon,
  Scrollable,
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CheckIcon, AlertTriangleIcon, DeleteIcon, ViewIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server.js";
import { getThemes, installThemePackage, removeThemePackage } from "../utils/theme.server.js";
import { debugAuth } from "../utils/debug-auth.js";
import fs from 'fs';
import path from 'path';

// Loader function - get themes and files
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  // 🔍 디버깅 추가
  await debugAuth(request);
  
  try {
    // Get theme list
    const themes = await getThemes(request);
    const currentTheme = themes.find(theme => theme.role === 'main') || themes[0];
    
    // Read uploaded files with new structure
    const sectionPath = path.join(process.cwd(), 'uploads', 'sections', 'shoppable-video.liquid');
    const dawnStylePath = path.join(process.cwd(), 'uploads', 'styles', 'dawn', 'luxury-v1.css');
    
    let sectionContent = '';
    let dawnStyleContent = '';
    
    try {
      sectionContent = fs.readFileSync(sectionPath, 'utf8');
    } catch (error) {
      console.warn('Section file not found:', error.message);
    }
    
    try {
      dawnStyleContent = fs.readFileSync(dawnStylePath, 'utf8');
    } catch (error) {
      console.warn('Dawn style file not found:', error.message);
    }
    
    return json({
      themes,
      currentTheme,
      sectionContent,
      dawnStyleContent,
      hasFiles: sectionContent && dawnStyleContent
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json({
      themes: [],
      currentTheme: null,
      sectionContent: '',
      dawnStyleContent: '',
      hasFiles: false,
      error: error.message
    });
  }
};

// Action function - handle installations and removals
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  // 🔍 액션에서도 디버깅
  await debugAuth(request);
  
  try {
    const formData = await request.formData();
    const actionType = formData.get("action");
    
    if (actionType === "install_styles") {
      const styleContent = formData.get("style_content");
      const themeId = formData.get("theme_id");
      
      console.log('=== STYLE INSTALL DEBUG ===');
      console.log('Style content length:', styleContent?.length || 0);
      console.log('Theme ID:', themeId);
      
      if (!styleContent) {
        return json({
          success: false,
          message: "Style content is missing."
        });
      }
      
      if (!themeId) {
        return json({
          success: false,
          message: "Theme ID is missing."
        });
      }
      
      // Install style to theme (백엔드에서 자동으로 스마트 보안 적용)
      const result = await installThemePackage(request, themeId, styleContent, null, null);
      
      return json(result);
    }
    
    if (actionType === "install_sections") {
      const sectionContent = formData.get("section_content");
      const themeId = formData.get("theme_id");
      
      console.log('=== SECTION INSTALL DEBUG ===');
      console.log('Section content length:', sectionContent?.length || 0);
      console.log('Theme ID:', themeId);
      
      if (!sectionContent) {
        return json({
          success: false,
          message: "Section content is missing."
        });
      }
      
      if (!themeId) {
        return json({
          success: false,
          message: "Theme ID is missing."
        });
      }
      
      // Install section to theme (백엔드에서 자동으로 스마트 보안 적용)
      const result = await installThemePackage(request, themeId, null, sectionContent, null);
      
      return json(result);
    }
    
    if (actionType === "remove_styles") {
      const themeId = formData.get("theme_id");
      
      console.log('=== STYLE REMOVAL DEBUG ===');
      console.log('Theme ID:', themeId);
      
      if (!themeId) {
        return json({
          success: false,
          message: "Theme ID is missing."
        });
      }
      
      // Remove CSS from theme
      const result = await removeThemePackage(request, themeId, 'css');
      
      return json(result);
    }
    
    if (actionType === "remove_sections") {
      const themeId = formData.get("theme_id");
      
      console.log('=== SECTION REMOVAL DEBUG ===');
      console.log('Theme ID:', themeId);
      
      if (!themeId) {
        return json({
          success: false,
          message: "Theme ID is missing."
        });
      }
      
      // Remove section from theme
      const result = await removeThemePackage(request, themeId, 'section');
      
      return json(result);
    }
    
    if (actionType === "remove_all") {
      const themeId = formData.get("theme_id");
      
      console.log('=== ALL REMOVAL DEBUG ===');
      console.log('Theme ID:', themeId);
      
      if (!themeId) {
        return json({
          success: false,
          message: "Theme ID is missing."
        });
      }
      
      // Remove all packages from theme
      const result = await removeThemePackage(request, themeId, 'all');
      
      return json(result);
    }
    
    return json({
      success: false,
      message: "Unknown action."
    });
  } catch (error) {
    console.error('Action error:', error);
    return json({
      success: false,
      message: error.message
    });
  }
};

export default function Index() {
  const { 
    themes,
    currentTheme,
    sectionContent,
    dawnStyleContent, 
    hasFiles, 
    error 
  } = useLoaderData();
  
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  // State management
  const [isInstallingSections, setIsInstallingSections] = useState(false);
  const [isInstallingStyles, setIsInstallingStyles] = useState(false);
  const [isRemovingSections, setIsRemovingSections] = useState(false);
  const [isRemovingStyles, setIsRemovingStyles] = useState(false);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [selectedStyleTheme, setSelectedStyleTheme] = useState('dawn');
  const [selectedTemplateTheme, setSelectedTemplateTheme] = useState('dawn');

  // Helper function to get theme type
  const getThemeType = (theme) => {
    const name = theme.name.toLowerCase();
    if (name.includes('dawn')) return 'dawn';
    if (name.includes('horizon')) return 'horizon';
    return 'unknown';
  };

  // Filter themes by type
  const filterThemesByType = (type) => {
    return themes.filter(theme => getThemeType(theme) === type);
  };

  // Section packages configuration (universal)
  const sectionPackages = [
    {
      id: "shoppable-video",
      name: "Shoppable Video",
      description: "Interactive video content with product links",
      features: ["Product tagging support", "Auto-play options", "Mobile optimized", "Custom styling"],
      status: "ready",
      file: "shoppable-video.liquid",
      available: !!sectionContent,
      preview: {
        type: "liquid",
        title: "Shoppable Video Section",
        description: "A Liquid template for creating interactive video content with embedded product links and customizable settings.",
        highlights: [
          "Video background support",
          "Product overlay functionality",
          "Customizable video settings",
          "Mobile-optimized layout",
          "Schema settings for easy customization"
        ]
      }
    }
  ];

  // Style packages configuration (theme-specific)
  const stylePackages = {
    dawn: [
      {
        id: "luxury-v1-dawn",
        name: "Luxury V1",
        description: "Premium luxury design with elegant styling for Dawn theme",
        features: ["Golden color scheme", "Elegant animations", "Mobile responsive", "Professional hover effects"],
        status: "ready",
        file: "luxury-v1.css",
        available: !!dawnStyleContent,
        preview: {
          type: "css",
          title: "Luxury V1 CSS Styles (Dawn)",
          description: "This CSS file contains luxury styling with golden colors, elegant animations, and professional hover effects optimized for Dawn theme.",
          highlights: [
            "Golden color scheme (#FFD700, #FFA500)",
            "Smooth transitions and animations",
            "Professional button hover effects",
            "Mobile-responsive design",
            "Dawn theme optimized"
          ]
        }
      }
    ],
    horizon: [
      {
        id: "luxury-v1-horizon",
        name: "Luxury V1",
        description: "Premium luxury design with elegant styling for Horizon theme",
        features: ["Golden color scheme", "Elegant animations", "Mobile responsive", "Professional hover effects"],
        status: "coming-soon",
        file: "luxury-v1.css",
        available: false,
        preview: {
          type: "css",
          title: "Luxury V1 CSS Styles (Horizon)",
          description: "This CSS file contains luxury styling optimized for Horizon theme structure.",
          highlights: [
            "Horizon theme optimized",
            "Golden color scheme",
            "Coming soon..."
          ]
        }
      }
    ]
  };

  // Template packages configuration (theme-specific)
  const templatePackages = {
    dawn: [
      {
        id: "premium-product-dawn",
        name: "Premium Product Page",
        description: "Advanced product page template for Dawn theme",
        features: ["Extended gallery", "Detailed info tabs", "Review section", "Related products"],
        status: "coming-soon",
        available: false
      }
    ],
    horizon: [
      {
        id: "premium-product-horizon",
        name: "Premium Product Page",
        description: "Advanced product page template for Horizon theme", 
        features: ["Extended gallery", "Detailed info tabs", "Review section", "Related products"],
        status: "coming-soon",
        available: false
      }
    ]
  };

  // Handle action results
  useEffect(() => {
    if (actionData) {
      setIsInstallingSections(false);
      setIsInstallingStyles(false);
      setIsRemovingSections(false);
      setIsRemovingStyles(false);
      setIsRemovingAll(false);
      
      if (actionData.success) {
        alert(`Success! ${actionData.message}`);
      } else {
        alert(`Error: ${actionData.message}`);
      }
    }
  }, [actionData]);

  // Install sections
  const handleInstallSections = () => {
    if (!sectionContent) {
      alert('Section file is not ready.');
      return;
    }

    if (!currentTheme) {
      alert('No theme available for installation.');
      return;
    }

    setIsInstallingSections(true);
    
    const formData = new FormData();
    formData.append("action", "install_sections");
    formData.append("section_content", sectionContent);
    formData.append("theme_id", currentTheme.id);
    
    submit(formData, { method: "post" });
  };

  // Install styles
  const handleInstallStyles = (themeType) => {
    const styleContent = themeType === 'dawn' ? dawnStyleContent : null;
    
    if (!styleContent) {
      alert(`${themeType} style file is not ready.`);
      return;
    }

    const availableThemes = filterThemesByType(themeType);
    if (availableThemes.length === 0) {
      alert(`No ${themeType} themes found in your store.`);
      return;
    }

    // For now, use the first available theme of this type
    const targetTheme = availableThemes[0];

    setIsInstallingStyles(true);
    
    const formData = new FormData();
    formData.append("action", "install_styles");
    formData.append("style_content", styleContent);
    formData.append("theme_id", targetTheme.id);
    
    submit(formData, { method: "post" });
  };

  // Remove sections
  const handleRemoveSections = () => {
    if (!currentTheme) {
      alert('No theme available.');
      return;
    }

    if (!confirm('Are you sure you want to remove the section package?')) {
      return;
    }

    setIsRemovingSections(true);
    
    const formData = new FormData();
    formData.append("action", "remove_sections");
    formData.append("theme_id", currentTheme.id);
    
    submit(formData, { method: "post" });
  };

  // Remove styles
  const handleRemoveStyles = () => {
    if (!currentTheme) {
      alert('No theme available.');
      return;
    }

    if (!confirm('Are you sure you want to remove the style package?')) {
      return;
    }

    setIsRemovingStyles(true);
    
    const formData = new FormData();
    formData.append("action", "remove_styles");
    formData.append("theme_id", currentTheme.id);
    
    submit(formData, { method: "post" });
  };

  // Remove all packages
  const handleRemoveAll = () => {
    if (!currentTheme) {
      alert('No theme available.');
      return;
    }

    setIsRemovingAll(true);
    
    const formData = new FormData();
    formData.append("action", "remove_all");
    formData.append("theme_id", currentTheme.id);
    
    submit(formData, { method: "post" });
    setShowRemoveModal(false);
  };

  // Preview package
  const handlePreview = (packageData, content) => {
    setPreviewContent({
      ...packageData.preview,
      content: content,
      fileName: packageData.file
    });
    setShowPreviewModal(true);
  };

  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case "installed": return "success";
      case "ready": return "info";
      case "coming-soon": return "subdued";
      default: return "subdued";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "installed": return "Installed";
      case "ready": return "Ready";
      case "coming-soon": return "Coming Soon";
      default: return "Unknown";
    }
  };

  // Format code for preview
  const formatCodePreview = (content, type) => {
    if (!content) return "Content not available";
    
    const lines = content.split('\n');
    const maxLines = 20;
    const preview = lines.slice(0, maxLines).join('\n');
    const hasMore = lines.length > maxLines;
    
    return (
      <div style={{ 
        fontFamily: 'monospace', 
        fontSize: '12px', 
        backgroundColor: '#f6f6f7', 
        padding: '12px', 
        borderRadius: '4px',
        border: '1px solid #e1e3e5',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {preview}
          {hasMore && '\n... (truncated)'}
        </pre>
      </div>
    );
  };

  return (
    <Page>
      <TitleBar title="Dawny Pro - Premium Theme Packages" />
      
      <Layout>
        <Layout.Section>
          {/* Header */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <BlockStack gap="200">
                  <Text as="h1" variant="headingXl">🎬 Dawny Pro</Text>
                  <Text variant="bodyLg" color="subdued">
                    Upgrade your theme to the next level with luxury design elements
                  </Text>
                </BlockStack>
                <Badge tone="success" size="large">Professional Plan</Badge>
              </InlineStack>
              
              {/* Current theme info */}
              {currentTheme && (
                <Box padding="400" background="surface-neutral" borderRadius="200">
                  <BlockStack gap="100">
                    <Text variant="bodyMd" fontWeight="semibold">
                      Current Active Theme: {currentTheme.name}
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      Theme Type: {getThemeType(currentTheme) || 'Unknown'}
                    </Text>
                  </BlockStack>
                </Box>
              )}
            </BlockStack>
          </Card>

          {/* Error banner */}
          {error && (
            <Banner status="critical" title="Error Loading Themes">
              <p>{error}</p>
            </Banner>
          )}

          {/* Action result banner */}
          {actionData && (
            <Banner
              status={actionData.success ? "success" : "critical"}
              title={actionData.success ? "Operation Complete!" : "Operation Failed"}
            >
              <p>{actionData.message}</p>
            </Banner>
          )}

          {/* Main content grid */}
          <Layout>
            {/* 1. Section Packages (Left) */}
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">💎 Sections</Text>
                  
                  <Box padding="300" background="surface-success-subdued" borderRadius="200">
                    <Text variant="bodySm" alignment="center" fontWeight="semibold">
                      🔄 Works with ANY theme!
                    </Text>
                  </Box>
                  
                  <BlockStack gap="300">
                    {sectionPackages.map((section) => (
                      <Box key={section.id} padding="400" background="surface-subdued" borderRadius="200">
                        <BlockStack gap="300">
                          <InlineStack align="space-between">
                            <Text variant="headingMd">{section.name}</Text>
                            <Badge tone={getBadgeColor(section.status)}>
                              {getStatusText(section.status)}
                            </Badge>
                          </InlineStack>
                          
                          <Text variant="bodyMd" color="subdued">
                            {section.description}
                          </Text>
                          
                          <BlockStack gap="100">
                            {section.features.map((feature, index) => (
                              <Text key={index} variant="bodySm" color="subdued">
                                • {feature}
                              </Text>
                            ))}
                          </BlockStack>
                          
                          <Divider />
                          
                          <InlineStack gap="200" align="space-between">
                            <Text variant="bodySm" color="subdued">
                              File: {section.file}
                            </Text>
                            <InlineStack gap="200" align="center">
                              <Icon source={section.available ? CheckIcon : AlertTriangleIcon} />
                              <Text variant="bodySm" color={section.available ? "success" : "critical"}>
                                {section.available ? "Ready" : "File Missing"}
                              </Text>
                            </InlineStack>
                          </InlineStack>
                          
                          <InlineStack gap="200">
                            <Button 
                              variant="secondary" 
                              size="medium"
                              onClick={() => handlePreview(section, sectionContent)}
                              icon={ViewIcon}
                              disabled={!section.available}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="primary" 
                              size="medium"
                              loading={isInstallingSections}
                              disabled={!section.available || isInstallingSections || !currentTheme}
                              onClick={handleInstallSections}
                            >
                              {isInstallingSections ? "Installing..." : "Install"}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="medium"
                              tone="critical"
                              loading={isRemovingSections}
                              disabled={isRemovingSections || !currentTheme}
                              onClick={handleRemoveSections}
                              icon={DeleteIcon}
                            >
                              Remove
                            </Button>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* 2. Style Packages (Center) */}
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">🎨 Styles</Text>
                  
                  <Box padding="300" background="surface-warning-subdued" borderRadius="200">
                    <Text variant="bodySm" alignment="center" fontWeight="semibold">
                      🎯 Theme-specific packages
                    </Text>
                  </Box>

                  <Select
                    label="Choose Theme Type"
                    options={[
                      {label: 'Dawn Themes', value: 'dawn'},
                      {label: 'Horizon Themes', value: 'horizon'},
                    ]}
                    value={selectedStyleTheme}
                    onChange={setSelectedStyleTheme}
                  />

                  <BlockStack gap="100">
                    <Text variant="bodySm" color="subdued">
                      Available {selectedStyleTheme} themes: {filterThemesByType(selectedStyleTheme).length}
                    </Text>
                    {filterThemesByType(selectedStyleTheme).map((theme, index) => (
                      <Text key={index} variant="bodySm" color="subdued">
                        • {theme.name} ({theme.role})
                      </Text>
                    ))}
                  </BlockStack>
                  
                  <BlockStack gap="300">
                    {stylePackages[selectedStyleTheme]?.map((style) => (
                      <Box key={style.id} padding="400" background="surface-subdued" borderRadius="200">
                        <BlockStack gap="300">
                          <InlineStack align="space-between">
                            <Text variant="headingMd">{style.name}</Text>
                            <Badge tone={getBadgeColor(style.status)}>
                              {getStatusText(style.status)}
                            </Badge>
                          </InlineStack>
                          
                          <Text variant="bodyMd" color="subdued">
                            {style.description}
                          </Text>
                          
                          <BlockStack gap="100">
                            {style.features.map((feature, index) => (
                              <Text key={index} variant="bodySm" color="subdued">
                                • {feature}
                              </Text>
                            ))}
                          </BlockStack>
                          
                          <Divider />
                          
                          <InlineStack gap="200" align="space-between">
                            <Text variant="bodySm" color="subdued">
                              File: {style.file}
                            </Text>
                            <InlineStack gap="200" align="center">
                              <Icon source={style.available ? CheckIcon : AlertTriangleIcon} />
                              <Text variant="bodySm" color={style.available ? "success" : "critical"}>
                                {style.available ? "Ready" : style.status === "coming-soon" ? "Coming Soon" : "File Missing"}
                              </Text>
                            </InlineStack>
                          </InlineStack>
                          
                          <InlineStack gap="200">
                            <Button 
                              variant="secondary" 
                              size="medium"
                              onClick={() => handlePreview(style, selectedStyleTheme === 'dawn' ? dawnStyleContent : null)}
                              icon={ViewIcon}
                              disabled={!style.available}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="primary" 
                              size="medium"
                              loading={isInstallingStyles}
                              disabled={!style.available || isInstallingStyles || filterThemesByType(selectedStyleTheme).length === 0}
                              onClick={() => handleInstallStyles(selectedStyleTheme)}
                            >
                              {isInstallingStyles ? "Installing..." : "Install"}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="medium"
                              tone="critical"
                              loading={isRemovingStyles}
                              disabled={isRemovingStyles || !currentTheme}
                              onClick={handleRemoveStyles}
                              icon={DeleteIcon}
                            >
                              Remove
                            </Button>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* 3. Template Packages (Right) */}
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">📄 Templates</Text>
                  
                  <Box padding="300" background="surface-warning-subdued" borderRadius="200">
                    <Text variant="bodySm" alignment="center" fontWeight="semibold">
                      🎯 Theme-specific packages
                    </Text>
                  </Box>

                  <Select
                    label="Choose Theme Type"
                    options={[
                      {label: 'Dawn Themes', value: 'dawn'},
                      {label: 'Horizon Themes', value: 'horizon'},
                    ]}
                    value={selectedTemplateTheme}
                    onChange={setSelectedTemplateTheme}
                  />

                  <BlockStack gap="100">
                    <Text variant="bodySm" color="subdued">
                      Available {selectedTemplateTheme} themes: {filterThemesByType(selectedTemplateTheme).length}
                    </Text>
                    {filterThemesByType(selectedTemplateTheme).map((theme, index) => (
                      <Text key={index} variant="bodySm" color="subdued">
                        • {theme.name} ({theme.role})
                      </Text>
                    ))}
                  </BlockStack>
                  
                  <BlockStack gap="300">
                    {templatePackages[selectedTemplateTheme]?.map((template) => (
                      <Box key={template.id} padding="400" background="surface-subdued" borderRadius="200">
                        <BlockStack gap="300">
                          <InlineStack align="space-between">
                            <Text variant="headingMd">{template.name}</Text>
                            <Badge tone={getBadgeColor(template.status)}>
                              {getStatusText(template.status)}
                            </Badge>
                          </InlineStack>
                          
                          <Text variant="bodyMd" color="subdued">
                            {template.description}
                          </Text>
                          
                          <BlockStack gap="100">
                            {template.features.map((feature, index) => (
                              <Text key={index} variant="bodySm" color="subdued">
                                • {feature}
                              </Text>
                            ))}
                          </BlockStack>
                          
                          <Button 
                            variant="secondary" 
                            fullWidth
                            disabled={template.status === "coming-soon"}
                          >
                            {template.status === "coming-soon" ? "Coming Soon" : "Install Template"}
                          </Button>
                        </BlockStack>
                      </Box>
                    ))}
                  </BlockStack>
                  
                  <Box padding="300" background="surface-neutral" borderRadius="200">
                    <Text variant="bodySm" color="subdued" alignment="center">
                      💡 More templates will be added soon
                    </Text>
                  </Box>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>

          {/* Bottom action buttons */}
          <Card>
            <InlineStack gap="300" align="center">
              <Button size="large" variant="secondary">
                📖 User Guide
              </Button>
              <Button 
                size="large" 
                variant="secondary"
                onClick={() => setShowPreviewModal(true)}
                icon={ViewIcon}
              >
                🎨 Preview All
              </Button>
              <Button 
                size="large" 
                variant="secondary"
                tone="critical"
                onClick={() => setShowRemoveModal(true)}
                icon={DeleteIcon}
              >
                🗑️ Remove All Packages
              </Button>
            </InlineStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Preview Modal */}
      <Modal
        open={showPreviewModal && previewContent}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewContent(null);
        }}
        title={previewContent?.title || "Package Preview"}
        large
        secondaryActions={[
          {
            content: "Close",
            onAction: () => {
              setShowPreviewModal(false);
              setPreviewContent(null);
            },
          },
        ]}
      >
        <Modal.Section>
          {previewContent && (
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingMd">{previewContent.title}</Text>
<Text variant="bodyMd" color="subdued">
                 {previewContent.description}
               </Text>
             </BlockStack>
             
             <Divider />
             
             <BlockStack gap="200">
               <Text variant="headingS">Key Features:</Text>
               <BlockStack gap="100">
                 {previewContent.highlights?.map((highlight, index) => (
                   <Text key={index} variant="bodySm" color="subdued">
                     • {highlight}
                   </Text>
                 ))}
               </BlockStack>
             </BlockStack>
             
             <Divider />
             
             <BlockStack gap="200">
               <InlineStack align="space-between">
                 <Text variant="headingS">File Content Preview:</Text>
                 <Badge>{previewContent.fileName}</Badge>
               </InlineStack>
               <Scrollable style={{ maxHeight: '300px' }}>
                 {formatCodePreview(previewContent.content, previewContent.type)}
               </Scrollable>
             </BlockStack>
           </BlockStack>
         )}
       </Modal.Section>
     </Modal>

     {/* Remove All Modal */}
     <Modal
       open={showRemoveModal}
       onClose={() => setShowRemoveModal(false)}
       title="Remove All Packages"
       primaryAction={{
         content: isRemovingAll ? "Removing..." : "Remove All",
         onAction: handleRemoveAll,
         destructive: true,
         loading: isRemovingAll
       }}
       secondaryActions={[
         {
           content: "Cancel",
           onAction: () => setShowRemoveModal(false),
         },
       ]}
     >
       <Modal.Section>
         <BlockStack gap="300">
           <Text variant="bodyMd">
             This will remove all Dawny Pro packages from your theme:
           </Text>
           <BlockStack gap="100">
             <Text variant="bodySm" color="subdued">• CSS files will be deleted</Text>
             <Text variant="bodySm" color="subdued">• CSS links will be removed from theme.liquid</Text>
             <Text variant="bodySm" color="subdued">• Section files will be deleted</Text>
             <Text variant="bodySm" color="subdued">• This action cannot be undone</Text>
           </BlockStack>
           <Text variant="bodyMd" fontWeight="semibold">
             Are you sure you want to continue?
           </Text>
         </BlockStack>
       </Modal.Section>
     </Modal>
   </Page>
 );
}
