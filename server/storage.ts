/**
 * Local Disk Storage
 *
 * 所有上传文件保存在项目根目录的 `uploads/` 文件夹下。
 * 文件通过 Express 静态服务以 `/uploads/xxx` URL 对外提供访问。
 *
 * 迁移时只需带走：
 *   1. 项目代码
 *   2. 数据库
 *   3. uploads/ 文件夹
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

// uploads 目录位于 Hostinger FTP 根目录（../uploads）
// 在 Hostinger 上，Node.js 应用目录是 nodejs/，FTP 根目录是上一级
export const UPLOADS_ROOT = path.join(process.cwd(), "..", "uploads");
console.log(`[Storage] UPLOADS_ROOT initialized: ${UPLOADS_ROOT}`);

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * 将文件写入本地 uploads 目录
 * @param relKey  相对路径，例如 "media/photo.jpg" 或 "banner/home.jpg"
 * @returns { key, url }  key = 相对路径, url = "/uploads/media/photo_a1b2c3d4.jpg"
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const filePath = path.join(UPLOADS_ROOT, key);

  ensureDir(path.dirname(filePath));

  const buffer =
    typeof data === "string"
      ? Buffer.from(data, "utf-8")
      : Buffer.from(data as Uint8Array);
  
  console.log(`[Storage] Writing file: ${filePath}`);
  fs.writeFileSync(filePath, buffer);
  console.log(`[Storage] File written successfully: ${filePath} (${buffer.byteLength} bytes)`);
  console.log(`[Storage] File exists: ${fs.existsSync(filePath)}`);

  return { key, url: `/uploads/${key}` };
}

/**
 * 根据 key 获取文件的本地访问 URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}

/**
 * 兼容旧接口：本地存储无需签名，直接返回 URL
 */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return `/uploads/${key}`;
}

/**
 * 删除本地文件
 */
export function storageDelete(relKey: string): void {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOADS_ROOT, key);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
