// app/utils/metafield.server.js
import { authenticate } from "../shopify.server.js";

/**
 * Dawny Pro Metafield 네임스페이스
 */
const NAMESPACE = 'dawny_pro';

/**
 * Metafield 키 정의
 */
const KEYS = {
  INSTALLATION_STATUS: 'installation_status',
  CSS_HISTORY: 'css_history',
  APP_SETTINGS: 'app_settings',
  THEME_CONFIGS: 'theme_configs'
};

/**
 * CSS 설치 상태를 metafield에 저장
 */
export async function saveInstallationStatus(request, status) {
  const { admin } = await authenticate.admin(request);
  
  const installationData = {
    isInstalled: status.isInstalled,
    installedAt: status.installedAt || new Date().toISOString(),
    cssFileName: status.cssFileName,
    fileSize: status.fileSize,
    themeId: status.themeId,
    themeName: status.themeName,
    version: '1.0.0',
    installMethod: status.installMethod || 'theme_api'
  };

  try {
    const metafield = new admin.rest.resources.Metafield({ session: admin.session });
    metafield.namespace = NAMESPACE;
    metafield.key = KEYS.INSTALLATION_STATUS;
    metafield.value = JSON.stringify(installationData);
    metafield.type = 'json';
    
    await metafield.save({
      update: true,
    });

    console.log('✅ Installation status saved to metafield');
    return installationData;
  } catch (error) {
    console.error('❌ Failed to save installation status:', error);
    throw error;
  }
}

/**
 * CSS 설치 히스토리를 metafield에 저장
 */
export async function saveCSSHistory(request, historyItem) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const existingHistory = await getCSSHistory(request);
    const updatedHistory = [historyItem, ...existingHistory].slice(0, 10);
    
    const metafield = new admin.rest.resources.Metafield({ session: admin.session });
    metafield.namespace = NAMESPACE;
    metafield.key = KEYS.CSS_HISTORY;
    metafield.value = JSON.stringify(updatedHistory);
    metafield.type = 'json';
    
    await metafield.save({
      update: true,
    });

    console.log('✅ CSS history saved to metafield');
    return updatedHistory;
  } catch (error) {
    console.error('❌ Failed to save CSS history:', error);
    throw error;
  }
}

/**
 * 설치 상태 조회
 */
export async function getInstallationStatus(request) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const metafields = await admin.rest.resources.Metafield.all({
      session: admin.session,
      namespace: NAMESPACE,
      key: KEYS.INSTALLATION_STATUS,
    });

    if (metafields.data.length > 0) {
      return JSON.parse(metafields.data[0].value);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to get installation status:', error);
    return null;
  }
}

/**
 * CSS 히스토리 조회
 */
export async function getCSSHistory(request) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const metafields = await admin.rest.resources.Metafield.all({
      session: admin.session,
      namespace: NAMESPACE,
      key: KEYS.CSS_HISTORY,
    });

    if (metafields.data.length > 0) {
      return JSON.parse(metafields.data[0].value);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to get CSS history:', error);
    return [];
  }
}

/**
 * 히스토리 항목 생성
 */
export function createHistoryItem(action, details) {
  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    timestamp: new Date().toISOString(),
    details: {
      cssFileName: details.cssFileName,
      fileSize: details.fileSize,
      themeId: details.themeId,
      themeName: details.themeName,
      success: details.success,
      error: details.error || null,
      ...details
    }
  };
}
