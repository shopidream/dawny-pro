import { authenticate } from "../shopify.server.js";

export async function debugAuth(request) {
  try {
    const auth = await authenticate.admin(request);
    
    console.log('=== FULL AUTH DEBUG ===');
    console.log('Auth object keys:', Object.keys(auth));
    console.log('Admin keys:', auth.admin ? Object.keys(auth.admin) : 'NO ADMIN');
    console.log('Session keys:', auth.session ? Object.keys(auth.session) : 'NO SESSION');
    console.log('Session shop:', auth.session?.shop);
    console.log('Session accessToken exists:', !!auth.session?.accessToken);
    
    // GraphQL을 통해 shop 정보 가져오기 시도
    if (auth.admin && auth.admin.graphql) {
      try {
        const shopResponse = await auth.admin.graphql(`
          query {
            shop {
              name
              myshopifyDomain
            }
          }
        `);
        const shopData = await shopResponse.json();
        console.log('Shop from GraphQL:', shopData.data?.shop);
      } catch (error) {
        console.log('GraphQL shop query error:', error.message);
      }
    }
    
    return auth;
  } catch (error) {
    console.log('Auth error:', error.message);
    return { success: false, error: error.message };
  }
}
