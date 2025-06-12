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
  Grid,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

export default function Index() {
  const [currentPlan, setCurrentPlan] = useState("professional");
  const [selectedThemes, setSelectedThemes] = useState(["dawn-enhanced"]);

  const plans = {
    starter: { name: "Starter Plan", price: "$9.99", color: "subdued" },
    professional: { name: "Professional Plan", price: "$19.99", color: "success" },
    enterprise: { name: "Enterprise Plan", price: "$39.99", color: "attention" }
  };

  const themes = {
    "dawn-enhanced": { name: "Dawn Enhanced", description: "Improved version of the classic Dawn theme", available: true },
    "prestige-premium": { name: "Prestige Premium", description: "Elegant styles for luxury brands", available: true },
    "concept-tech": { name: "Concept Tech", description: "Innovative design for tech and gadget brands", available: true },
    "impact-storyteller": { name: "Impact Storyteller", description: "Impactful design focused on brand storytelling", available: true }
  };

  const sections = [
    { id: "shoppable-videos", name: "Shoppable Videos", description: "Video content linked with products", installed: true },
    { id: "before-after", name: "Before & After", description: "Before and after comparison section", installed: false },
    { id: "logo-list", name: "Logo List", description: "Company logo showcase section", installed: true },
    { id: "text-with-icons", name: "Text with Icons", description: "Text content with icon elements", installed: false },
    { id: "tabs", name: "Tabs", description: "Tabbed content organization", installed: true },
  ];

  return (
    <Page>
      <TitleBar title="Dawny Pro Dashboard" />
      <BlockStack gap="500">
        
        {/* 현재 플랜 상태 */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <BlockStack gap="200">
                <Text as="h2" variant="headingLg">
                  🎨 Dawny Pro
                </Text>
                <Text variant="bodyMd" color="subdued">
                  Upgrade your theme to the next level
                </Text>
              </BlockStack>
              <Badge tone={plans[currentPlan].color} size="large">
                {plans[currentPlan].name}
              </Badge>
            </InlineStack>
            
            <Box background="bg-surface-secondary" padding="400" borderRadius="200">
              <InlineStack align="space-between">
                <BlockStack gap="100">
                  <Text variant="headingMd">
                    👑 {plans[currentPlan].name}
                  </Text>
                  <Text variant="bodyMd" color="subdued">
                    {plans[currentPlan].price}/month - Next billing: July 12, 2025
                  </Text>
                </BlockStack>
                <Button variant="primary" size="large">
                  Change Plan
                </Button>
              </InlineStack>
            </Box>
          </BlockStack>
        </Card>

        <Layout>
          <Layout.Section variant="oneThird">
            {/* CSS 테마 선택 */}
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🎨 CSS Theme Styles
                </Text>
                
                <BlockStack gap="300">
                  {Object.entries(themes).map(([key, theme]) => (
                    <Box
                      key={key}
                      padding="300"
                      background={selectedThemes.includes(key) ? "bg-surface-selected" : "bg-surface"}
                      borderRadius="200"
                      borderWidth="025"
                      borderColor={selectedThemes.includes(key) ? "border-brand" : "border"}
                    >
                      <InlineStack align="space-between">
                        <BlockStack gap="100">
                          <InlineStack gap="200" align="center">
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                backgroundColor: selectedThemes.includes(key) ? "#00A96E" : "#DDD"
                              }}
                            />
                            <Text variant="bodyMd" fontWeight="semibold">
                              {theme.name}
                            </Text>
                          </InlineStack>
                          <Text variant="bodySm" color="subdued">
                            {theme.description}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>

                <InlineStack gap="200">
                  <Button variant="primary" size="large">
                    Apply Selected Themes
                  </Button>
                  <Button variant="secondary">
                    Preview
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            {/* 프리미엄 섹션 */}
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🧩 Premium Sections
                </Text>
                
                <BlockStack gap="200">
                  {sections.map((section) => (
                    <Box
                      key={section.id}
                      padding="300"
                      background="bg-surface"
                      borderRadius="200"
                      borderWidth="025"
                    >
                      <InlineStack align="space-between">
                        <BlockStack gap="100">
                          <InlineStack gap="200" align="center">
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: section.installed ? "#00A96E" : "#DC3545"
                              }}
                            />
                            <Text variant="bodyMd" fontWeight="semibold">
                              {section.name}
                            </Text>
                          </InlineStack>
                          <Text variant="bodySm" color="subdued">
                            {section.description}
                          </Text>
                        </BlockStack>
                        <Badge tone={section.installed ? "success" : "subdued"}>
                          {section.installed ? "Installed" : "Not Installed"}
                        </Badge>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>

                <Button variant="primary" size="large">
                  Install/Manage Sections
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            {/* 설치 상태 및 도움말 */}
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  📊 Installation Status
                </Text>
                
                <Box padding="300" background="bg-surface-success-subdued" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="bodyMd" fontWeight="semibold" color="success">
                      ✅ Active Theme: Dawn Enhanced
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      Last updated: June 10, 2025
                    </Text>
                  </BlockStack>
                </Box>

                <Divider />

                <BlockStack gap="300">
                  <Text variant="bodyMd" fontWeight="semibold">
                    🚀 Quick Actions
                  </Text>
                  
                  <BlockStack gap="200">
                    <Button variant="secondary" fullWidth>
                      Create Theme Backup
                    </Button>
                    <Button variant="secondary" fullWidth>
                      Export Settings
                    </Button>
                    <Button variant="secondary" fullWidth>
                      Contact Support
                    </Button>
                  </BlockStack>
                </BlockStack>

                <Box padding="300" background="bg-surface-info-subdued" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="bodyMd" fontWeight="semibold">
                      💡 Need Help?
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      Check out our installation and usage guides.
                    </Text>
                    <Button variant="secondary" size="micro">
                      View Guide
                    </Button>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}