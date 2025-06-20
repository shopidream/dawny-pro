import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

export const loader = async ({ request }) => {
  try {
    const { 
      getInstallationStatus,
      getCSSHistory
    } = await import("../utils/metafield.server.js");

    const status = await getInstallationStatus(request);
    const history = await getCSSHistory(request);
    
    return json({
      status,
      history: history || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return json({
      error: error.message,
      status: null,
      history: [],
      timestamp: new Date().toISOString()
    });
  }
};

export const action = async ({ request }) => {
  try {
    const { 
      saveInstallationStatus,
      saveCSSHistory,
      createHistoryItem
    } = await import("../utils/metafield.server.js");

    // 테스트 데이터 저장
    await saveInstallationStatus(request, {
      isInstalled: true,
      installedAt: new Date().toISOString(),
      cssFileName: 'test-style.css',
      fileSize: 2048,
      themeId: 'test-theme-123',
      themeName: 'Test Theme',
      installMethod: 'metafield_test'
    });

    const historyItem = createHistoryItem('test_install', {
      cssFileName: 'test-style.css',
      fileSize: 2048,
      themeId: 'test-theme-123',
      themeName: 'Test Theme',
      success: true
    });
    
    await saveCSSHistory(request, historyItem);

    return json({ success: true, message: "Test data saved!" });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
};

export default function TestMetafield() {
  const data = useLoaderData();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Metafield Test</h1>
      
      {data.error && (
        <div style={{ background: '#ffebee', padding: '10px', border: '1px solid #f44336', marginBottom: '20px' }}>
          <strong>Error:</strong> {data.error}
        </div>
      )}

      <Form method="post">
        <button type="submit" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#2196F3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Test Metafield Save
        </button>
      </Form>

      <h3>Current Status:</h3>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        {JSON.stringify(data.status, null, 2)}
      </pre>

      <h3>History ({data.history.length} items):</h3>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        {JSON.stringify(data.history, null, 2)}
      </pre>

      <p style={{ color: '#666', fontSize: '12px' }}>
        Last updated: {data.timestamp}
      </p>
    </div>
  );
}
