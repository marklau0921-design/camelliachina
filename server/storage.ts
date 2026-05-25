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
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads 目录位于项目外
// 在 Hostinger 上使用绝对路径，在本地开发使用相对路径
let UPLOADS_ROOT_PATH: string;

const cwd = process.cwd();
console.log(`[Storage] Detecting environment - cwd: ${cwd}`);

// 检测是否在 Hostinger 上（cwd 包含 /domains/）
if (cwd.includes("/domains/")) {
  // Hostinger: 使用绝对路径
  // 从 /home/u932753542/domains/morachinatravel.com/nodejs 推导出 /home/u932753542/domains/morachinatravel.com/uploads
  const cwdParts = cwd.split("/");
  const domainsIndex = cwdParts.indexOf("domains");
  if (domainsIndex !== -1 && domainsIndex + 1 < cwdParts.length) {
    const domainRoot = cwdParts.slice(0, domainsIndex + 2).join("/");
    UPLOADS_ROOT_PATH = path.join(domainRoot, "uploads");
    console.log(`[Storage] Hostinger detected - using absolute path: ${UPLOADS_ROOT_PATH}`);
  } else {
    // Fallback: 使用相对路径
    const projectRoot = path.resolve(__dirname, "..");
    const parentDir = path.resolve(projectRoot, "..");
    UPLOADS_ROOT_PATH = path.join(parentDir, "uploads");
    console.log(`[Storage] Fallback to relative path: ${UPLOADS_ROOT_PATH}`);
  }
} else {
  // 本地开发: 使用相对路径
  const projectRoot = path.resolve(__dirname, "..");
  const parentDir = path.resolve(projectRoot, "..");
  UPLOADS_ROOT_PATH = path.join(parentDir, "uploads");
  console.log(`[Storage] Local development - using relative path: ${UPLOADS_ROOT_PATH}`);
}

export const UPLOADS_ROOT = UPLOADS_ROOT_PATH;
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
  const normalized = normalizeKey(relKey);
  console.log(`[Storage.storagePut] relKey: "${relKey}", normalized: "${normalized}"`);
  const key = appendHashSuffix(normalized);
  console.log(`[Storage.storagePut] after appendHashSuffix: "${key}"`);
  const filePath = path.join(UPLOADS_ROOT, key);
  console.log(`[Storage.storagePut] filePath: "${filePath}"`);


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
