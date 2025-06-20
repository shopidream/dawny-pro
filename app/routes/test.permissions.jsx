// app/routes/test.permissions.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  try {
    console.log('=== TESTING PERMISSIONS ===');
    
    const { admin } = await authenticate.admin(request);
    console.log('✅ Authentication successful');
    
    // 테스트 1: 현재 앱의 설치 정보 확인
    console.log('📊 Testing app installation info...');
    const appQuery = `
      query {
        appInstallation {
          id
          accessScopes {
            handle
          }
        }
      }
    `;
    
    const appResponse = await admin.graphql(appQuery);
    const appData = await appResponse.json();
    
    console.log('App installation data:', JSON.stringify(appData, null, 2));
    
    // 테스트 2: 간단한 shop 정보 (기본 권한)
    console.log('🏪 Testing basic shop access...');
    const shopQuery = `
      query {
        shop {
          id
          name
          myshopifyDomain
        }
      }
    `;
    
    const shopResponse = await admin.graphql(shopQuery);
    const shopData = await shopResponse.json();
    
    console.log('Shop data:', JSON.stringify(shopData, null, 2));
    
    // 테스트 3: 테마 접근 시도
    console.log('🎨 Testing themes access...');
    const themesQuery = `
      query {
        themes(first: 3) {
          nodes {
            id
            name
            role
          }
        }
      }
    `;
    
    const themesResponse = await admin.graphql(themesQuery);
    const themesData = await themesResponse.json();
    
    console.log('Themes data:', JSON.stringify(themesData, null, 2));
    
    return json({
      success: true,
      appInstallation: appData,
      shop: shopData,
      themes: themesData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Permission test error:', error.message);
    console.error('Full error:', error);
    
    return json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export default function TestPermissions() {
  const data = useLoaderData();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>권한 테스트 결과</h1>
      <p>테스트 시간: {data.timestamp}</p>
      
      {data.success ? (
        <div>
          <h2>✅ 성공!</h2>
          <details>
            <summary>앱 설치 정보</summary>
            <pre>{JSON.stringify(data.appInstallation, null, 2)}</pre>
          </details>
          
          <details>
            <summary>스토어 정보</summary>
            <pre>{JSON.stringify(data.shop, null, 2)}</pre>
          </details>
          
          <details>
            <summary>테마 정보</summary>
            <pre>{JSON.stringify(data.themes, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <div>
          <h2>❌ 실패</h2>
          <p>에러: {data.error}</p>
        </div>
      )}
    </div>
  );
}
