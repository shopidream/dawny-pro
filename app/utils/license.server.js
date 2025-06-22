// utils/license.server.js
// Dawny Pro - License Validation System

/**
 * 구독 상태 확인 (임시 - 나중에 Metafield 연동)
 */
export async function checkValidLicense(shopDomain, dailyKey) {
  console.log('=== LICENSE CHECK ===');
  console.log('Shop:', shopDomain);
  console.log('Key:', dailyKey);
  
  // 임시: 특정 조건으로 테스트
  // 나중에 실제 구독 API로 교체
  const isSubscribed = shopDomain.includes('dawny-pro'); // 임시 조건
  
  console.log('License valid:', isSubscribed);
  return isSubscribed;
}

/**
 * 구독자를 위한 원본 파일 제공 여부
 */
export async function shouldProvideOriginal(shopDomain) {
  const dailyKey = generateDailyKey();
  return await checkValidLicense(shopDomain, dailyKey);
}

/**
 * 라이센스 키 생성 (매일 새로운 키)
 */
function generateDailyKey() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const randomHash = Math.random().toString(36).substring(2, 8);
  return `DWP-${today}-${randomHash}`;
}
