import React, { useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  ButtonGroup,
  Text,
  BlockStack,
  Select,
  Toast,
  Frame,
  Loading,
  Banner,
  List,
  Badge,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { 
  getThemes, 
  uploadCSSToTheme, 
  addCSSToThemeLayout
} from "../utils/theme.server";

// Load theme list when page loads
export const loader = async ({ request }) => {
  try {
    const themes = await getThemes(request);
    return json({ 
      themes: themes || [],
      success: true,
      message: "Successfully loaded theme list."
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ 
      themes: [], 
      success: false, 
      error: error.message || "Failed to load theme list."
    });
  }
};

// Handle form submissions  
export const action = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("action");
  const themeId = formData.get("themeId");

  try {
    switch (actionType) {
      case "uploadCSS": {
        const cssContent = `
/* Dawny Pro - Premium Theme Styles */
:root {
  --premium-gold: #d4af37;
  --premium-black: #1a1a1a;
  --premium-white: #ffffff;
  --premium-gray: #f8f8f8;
  --premium-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.btn-premium {
  background: linear-gradient(45deg, var(--premium-gold), #b8941f);
  color: var(--premium-black);
  border: none;
  padding: 15px 30px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--premium-shadow);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(212,175,55,0.4);
}

.premium-card {
  background: var(--premium-white);
  border-radius: 15px;
  padding: 40px;
  box-shadow: var(--premium-shadow);
  border: 1px solid var(--premium-gold);
  transition: all 0.3s ease;
}

.premium-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.premium-header {
  background: linear-gradient(135deg, var(--premium-black), #2a2a2a);
  color: var(--premium-gold);
  padding: 80px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.premium-title {
  font-size: 3.5rem;
  font-weight: 300;
  margin: 0;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.dawny-pro-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--premium-gold);
  color: var(--premium-black);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--premium-shadow);
  z-index: 1000;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.dawny-pro-badge:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .premium-title {
    font-size: 2.5rem;
  }
  
  .premium-header {
    padding: 60px 20px;
  }
  
  .premium-card {
    padding: 25px;
  }
}`;
        
        await uploadCSSToTheme(request, themeId, cssContent);
        await addCSSToThemeLayout(request, themeId);
        
        return json({ 
          success: true, 
          message: "Premium CSS styles have been successfully uploaded and applied to your theme!" 
        });
      }

      default:
        return json({ success: false, error: "Unknown action." });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ 
      success: false, 
      error: error.message || "An error occurred during the operation." 
    });
  }
};

export default function Index() {
  const { themes, success: loaderSuccess, error: loaderError } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [selectedTheme, setSelectedTheme] = useState("");
  const [showToast, setShowToast] = useState(false);

  const isLoading = navigation.state === "submitting";

  const themeOptions = [
    { label: "Select a theme", value: "" },
    ...(themes || []).map((theme) => ({
      label: `${theme.name} ${theme.role === 'MAIN' ? '(Current Theme)' : ''}`,
      value: theme.id,
    })),
  ];

  const handleSubmit = useCallback((action, extraData = {}) => {
    if (!selectedTheme) {
      alert("Please select a theme first.");
      return;
    }

    const formData = new FormData();
    formData.append("action", action);
    formData.append("themeId", selectedTheme);
    
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "post" });
  }, [selectedTheme, submit]);

  React.useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setShowToast(true);
      } else {
        alert(actionData.error || "An error occurred during the operation.");
      }
    }
  }, [actionData]);

  const toastMarkup = showToast ? (
    <Toast
      content={actionData?.message || "Operation completed successfully."}
      onDismiss={() => setShowToast(false)}
    />
  ) : null;

  if (!loaderSuccess) {
    return (
      <Page>
        <TitleBar title="Dawny Pro - Premium Theme Manager" />
        <Banner status="critical">
          <p>Failed to load theme list: {loaderError}</p>
          <p>Please check your permissions and try again.</p>
        </Banner>
      </Page>
    );
  }

  return (
    <Frame>
      <Page>
        <TitleBar title="Dawny Pro - Premium Theme Manager" />
        
        {isLoading && <Loading />}
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack vertical spacing="loose">
                <Text variant="headingLg">🎯 Theme Selection</Text>
                
                <Select
                  label="Select Theme"
                  options={themeOptions}
                  value={selectedTheme}
                  onChange={setSelectedTheme}
                  disabled={isLoading}
                />

                {selectedTheme && (
                  <Banner status="info">
                    <p>Selected theme: {themes.find(t => t.id === selectedTheme)?.name}</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack vertical spacing="loose">
                <Text variant="headingLg">🚀 Premium Styles</Text>
                
                <Button
                  primary
                  size="large"
                  onClick={() => handleSubmit("uploadCSS")}
                  disabled={!selectedTheme || isLoading}
                  loading={isLoading && navigation.formData?.get("action") === "uploadCSS"}
                >
                  Install Premium CSS Styles
                </Button>

                <Text variant="bodyMd" color="subdued">
                  • Luxury design elements with premium styling
                  • Golden color scheme with elegant animations
                  • Mobile-responsive design
                  • Professional hover effects and transitions
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack vertical spacing="loose">
                <Text variant="headingLg">ℹ️ How to Use</Text>
                
                <List type="number">
                  <List.Item>Select a theme from the dropdown above</List.Item>
                  <List.Item>Click "Install Premium CSS Styles" to apply the premium design</List.Item>
                  <List.Item>Go to your theme customizer to see the changes</List.Item>
                  <List.Item>The styles will be automatically applied to your theme</List.Item>
                </List>

                <Divider />

                <BlockStack alignment="center" spacing="tight">
                  <Badge status="success">Theme API Enabled</Badge>
                  <Text variant="bodyMd" color="subdued">
                    Theme modification permissions are active and ready to use.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {toastMarkup}
      </Page>
    </Frame>
  );
}
