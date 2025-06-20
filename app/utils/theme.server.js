import { authenticate } from "../shopify.server.js";

// Get list of themes from Shopify
export async function getThemes(request) {
  try {
    const { admin } = await authenticate.admin(request);
    
    const response = await admin.graphql(`
      query {
        themes(first: 50) {
          nodes {
            id
            name
            role
            processing
            createdAt
            updatedAt
          }
        }
      }
    `);
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }
    
    return data.data.themes.nodes;
  } catch (error) {
    console.error('Error fetching themes:', error);
    return [];
  }
}

// Upload CSS file to theme
export async function uploadCSSToTheme(request, themeId, cssContent, fileName = 'dawny-pro-styles.css') {
  try {
    const { admin } = await authenticate.admin(request);
    const numericThemeId = themeId.replace('gid://shopify/OnlineStoreTheme/', '');
    
    const asset = new admin.rest.resources.Asset({session: admin.session});
    asset.theme_id = numericThemeId;
    asset.key = `assets/${fileName}`;
    asset.value = cssContent;
    
    await asset.save({
      update: true,
    });
    
    console.log(`CSS file ${fileName} uploaded to theme ${numericThemeId}`);
    return { success: true, fileName, themeId: numericThemeId };
  } catch (error) {
    console.error('Error uploading CSS:', error);
    throw error;
  }
}

// Add CSS link to theme.liquid
export async function addCSSToThemeLayout(request, themeId, cssFileName = 'dawny-pro-styles.css') {
  try {
    const { admin } = await authenticate.admin(request);
    const numericThemeId = themeId.replace('gid://shopify/OnlineStoreTheme/', '');
    
    // Get current theme.liquid content
    const themeAsset = await admin.rest.resources.Asset.find({
      session: admin.session,
      theme_id: numericThemeId,
      key: 'layout/theme.liquid'
    });
    
    const currentContent = themeAsset.value;
    const cssLink = `{{ "${cssFileName}" | asset_url | stylesheet_tag }}`;
    
    // Check if CSS link already exists
    if (currentContent.includes(cssFileName)) {
      console.log('CSS link already exists in theme.liquid');
      return { success: true, message: 'CSS link already exists' };
    }
    
    // Add CSS link before </head> tag
    const updatedContent = currentContent.replace(
      '</head>', 
      `  ${cssLink}\n</head>`
    );
    
    // Save updated theme.liquid
    const asset = new admin.rest.resources.Asset({session: admin.session});
    asset.theme_id = numericThemeId;
    asset.key = 'layout/theme.liquid';
    asset.value = updatedContent;
    
    await asset.save({
      update: true,
    });
    
    console.log(`CSS link added to theme.liquid for theme ${numericThemeId}`);
    return { success: true, message: 'CSS link added to theme.liquid' };
  } catch (error) {
    console.error('Error updating theme.liquid:', error);
    throw error;
  }
}

// Generate deep link (placeholder for now)
export async function generateDeepLink(request, styleType) {
  return {
    success: true,
    deepLinkUrl: `https://dawny-pro.myshopify.com/admin/themes/current/editor`,
    message: "Theme editor link generated"
  };
}

// Get installation guide (placeholder for now)
export async function getInstallationGuide(styleType) {
  return {
    success: true,
    steps: [
      "Go to your theme editor",
      `Activate the ${styleType} style extension`,
      "Save your changes",
      "Preview your store"
    ]
  };
}
