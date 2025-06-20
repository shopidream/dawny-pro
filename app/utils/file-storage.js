// app/utils/file-storage.js - 새 파일 생성
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// CSS 파일 저장 디렉토리
const UPLOADS_DIR = '/var/www/dawny-pro-uploads';

// 디렉토리 생성 함수
export async function ensureUploadDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// CSS 파일 저장 함수
export async function saveStyleFile(fileName, cssContent, shopDomain) {
  await ensureUploadDir();
  
  // 파일 경로 생성
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  // 메타데이터
  const metadata = {
    fileName,
    shopDomain,
    uploadedAt: new Date().toISOString(),
    size: cssContent.length,
    hash: crypto.createHash('md5').update(cssContent).digest('hex')
  };
  
  // CSS 파일 저장
  await fs.writeFile(filePath, cssContent, 'utf8');
  
  // 메타데이터 저장
  const metaPath = path.join(UPLOADS_DIR, `${fileName}.meta.json`);
  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf8');
  
  console.log(`✅ CSS file saved: ${filePath}`);
  return { filePath, metadata };
}

// CSS 파일 읽기 함수
export async function getStyleFile(fileName) {
  const filePath = path.join(UPLOADS_DIR, fileName);
  const metaPath = path.join(UPLOADS_DIR, `${fileName}.meta.json`);
  
  try {
    const cssContent = await fs.readFile(filePath, 'utf8');
    const metadata = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    
    return { cssContent, metadata };
  } catch (error) {
    throw new Error(`File not found: ${fileName}`);
  }
}

// 업로드된 파일 목록 조회
export async function listStyleFiles(shopDomain = null) {
  await ensureUploadDir();
  
  const files = await fs.readdir(UPLOADS_DIR);
  const metaFiles = files.filter(file => file.endsWith('.meta.json'));
  
  const fileList = [];
  
  for (const metaFile of metaFiles) {
    try {
      const metaPath = path.join(UPLOADS_DIR, metaFile);
      const metadata = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      
      // 특정 shop만 필터링 (옵션)
      if (!shopDomain || metadata.shopDomain === shopDomain) {
        fileList.push(metadata);
      }
    } catch (error) {
      console.error(`Error reading metadata: ${metaFile}`, error);
    }
  }
  
  // 업로드 시간순 정렬
  return fileList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

// 파일 삭제 함수
export async function deleteStyleFile(fileName) {
  const filePath = path.join(UPLOADS_DIR, fileName);
  const metaPath = path.join(UPLOADS_DIR, `${fileName}.meta.json`);
  
  try {
    await fs.unlink(filePath);
    await fs.unlink(metaPath);
    console.log(`✅ CSS file deleted: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file: ${fileName}`, error);
    return false;
  }
}
