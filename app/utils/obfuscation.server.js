// utils/obfuscation.server.js
// Dawny Pro - 강력한 랜덤 난독화 시스템

/**
 * 시드 기반 랜덤 숫자 생성
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 연한 파스텔 색상 랜덤 생성
 */
function generateRandomPastelColor(seed) {
  const random1 = seededRandom(seed * 1.1);
  const random2 = seededRandom(seed * 2.3);
  const random3 = seededRandom(seed * 3.7);
  
  // 연한 색상 범위 (200-255)
  const r = Math.floor(200 + random1 * 55);
  const g = Math.floor(200 + random2 * 55);
  const b = Math.floor(200 + random3 * 55);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 숫자 값 랜덤 변환 (8~25배 + 랜덤 오프셋)
 */
function randomizeNumber(originalValue, position, seed) {
  const random1 = seededRandom(seed + position * 13.7);
  const random2 = seededRandom(seed + position * 27.3);
  
  // 8~25배 랜덤 곱하기
  const multiplier = 8 + random1 * 17;
  // 0~50 랜덤 오프셋
  const offset = random2 * 50;
  
  return Math.floor(originalValue * multiplier + offset);
}

/**
 * CSS 강력한 랜덤 난독화
 */
export function obfuscateCSS(originalCSS) {
  console.log('=== 🔐 ADVANCED RANDOM OBFUSCATION START ===');
  console.log('Original length:', originalCSS.length);
  
  const dailyKey = new Date().toISOString().split('T')[0];
  const seedBase = dailyKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let obfuscated = originalCSS;
  let position = 0;
  const transformMap = {}; // 복원용 매핑 저장
  
  // 1. 폰트 크기 랜덤 변환
  obfuscated = obfuscated.replace(/font-size:\s*(\d+)px/g, (match, num) => {
    const original = parseInt(num);
    const newVal = randomizeNumber(original, position++, seedBase + 100);
    transformMap[`font-${original}`] = newVal;
    console.log(`Font: ${num}px → ${newVal}px (${Math.round(newVal/original * 10)/10}x)`);
    return `font-size: ${newVal}px`;
  });
  
  // 2. 패딩/마진 랜덤 변환  
  obfuscated = obfuscated.replace(/padding:\s*(\d+)px/g, (match, num) => {
    const original = parseInt(num);
    const newVal = randomizeNumber(original, position++, seedBase + 200);
    transformMap[`padding-${original}`] = newVal;
    console.log(`Padding: ${num}px → ${newVal}px`);
    return `padding: ${newVal}px`;
  });
  
  obfuscated = obfuscated.replace(/margin:\s*(\d+)px/g, (match, num) => {
    const original = parseInt(num);
    const newVal = randomizeNumber(original, position++, seedBase + 300);
    transformMap[`margin-${original}`] = newVal;
    console.log(`Margin: ${num}px → ${newVal}px`);
    return `margin: ${newVal}px`;
  });
  
  // 3. gap 값 랜덤 변환
  obfuscated = obfuscated.replace(/gap:\s*(\d+)px/g, (match, num) => {
    const original = parseInt(num);
    const newVal = randomizeNumber(original, position++, seedBase + 400);
    transformMap[`gap-${original}`] = newVal;
    console.log(`Gap: ${num}px → ${newVal}px`);
    return `gap: ${newVal}px`;
  });
  
  // 4. border-radius 랜덤 변환
  obfuscated = obfuscated.replace(/border-radius:\s*(\d+)px/g, (match, num) => {
    const original = parseInt(num);
    const newVal = randomizeNumber(original, position++, seedBase + 500);
    transformMap[`radius-${original}`] = newVal;
    console.log(`Border-radius: ${num}px → ${newVal}px`);
    return `border-radius: ${newVal}px`;
  });
  
  // 5. 색상 랜덤 변환 (각각 다른 파스텔 색상)
  let colorPosition = 0;
  obfuscated = obfuscated.replace(/#([A-Fa-f0-9]{6})/g, (match, hex) => {
    const seed = seedBase + hex.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + colorPosition++;
    const newColor = generateRandomPastelColor(seed);
    transformMap[`color-${hex.toLowerCase()}`] = newColor;
    console.log(`Color: ${match} → ${newColor}`);
    return newColor;
  });
  
  console.log('=== 🔐 ADVANCED RANDOM OBFUSCATION COMPLETE ===');
  console.log('Obfuscated length:', obfuscated.length);
  console.log('Transform map entries:', Object.keys(transformMap).length);
  
  // 전역 변수에 변환 맵 저장 (복원용)
  global.dawnyTransformMap = transformMap;
  
  return obfuscated;
}

/**
 * Liquid 파일 난독화
 */
export function obfuscateLiquid(originalLiquid) {
  console.log('=== LIQUID OBFUSCATION START ===');
  
  const result = originalLiquid
    .replace(/Video/g, 'Demo')
    .replace(/Premium/g, 'Basic')
    .replace(/Luxury/g, 'Standard')
    .replace(/Professional/g, 'Trial');
  
  console.log('=== LIQUID OBFUSCATION COMPLETE ===');
  return result;
}

/**
 * 매일 새로운 라이센스 키 생성
 */
export function generateDailyKey() {
  const today = new Date().toISOString().split('T')[0];
  const randomHash = Math.random().toString(36).substring(2, 8);
  return `DWP-${today}-${randomHash}`;
}

/**
 * 변환 맵 가져오기 (복원용)
 */
export function getTransformMap() {
  return global.dawnyTransformMap || {};
}
