import { getDb, getPool } from "./db";
import { mediaAssets } from "../drizzle/schema";
import { eq, like, or, desc, and } from "drizzle-orm";

// ─── 新增媒体资产 ──────────────────────────────────────────────────────────────
export async function createMediaAsset(data: {
  url: string;
  storageKey?: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  source?: string;
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
  assetType?: "logo" | "banner" | "cta" | "general";
  isActive?: boolean;
  sortOrder?: number;
}) {
  const pool = await getPool();
  if (!pool) return null;
  // Use raw mysql2 pool to execute parameterized SQL directly
  const [result] = await pool.execute(
    `INSERT INTO media_assets (url, storageKey, filename, mimeType, fileSize, source, sourceId, sourceLabel, sourceUrl, assetType, isActive, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.url,
      data.storageKey ?? null,
      data.filename,
      data.mimeType ?? null,
      data.fileSize ?? null,
      data.source ?? "general",
      data.sourceId ?? null,
      data.sourceLabel ?? null,
      data.sourceUrl ?? null,
      data.assetType ?? "general",
      data.isActive !== false ? 1 : 0,
      data.sortOrder ?? 0,
    ]
  ) as any;
  return { insertId: result?.insertId ?? null };
}

// ─── 查询所有媒体资产（支持搜索）──────────────────────────────────────────────
export async function listMediaAssets(search?: string, assetType?: "logo" | "banner" | "cta" | "general") {
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    filters.push(or(like(mediaAssets.filename, q), like(mediaAssets.url, q)));
  }
  if (assetType) {
    filters.push(eq(mediaAssets.assetType, assetType));
  }

  return db
    .select()
    .from(mediaAssets)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(mediaAssets.createdAt));
}

// ─── 查询 Homepage Assets（按类型）──────────────────────────────────────────
export async function listHomepageAssets(assetType: "logo" | "banner" | "cta") {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.assetType, assetType))
    .orderBy(mediaAssets.sortOrder);
}

// ─── 获取当前激活的 Homepage Asset ──────────────────────────────────────────
export async function getActiveHomepageAsset(assetType: "logo" | "cta") {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.assetType, assetType), eq(mediaAssets.isActive, true)))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

// ─── 获取激活的 Banner 列表 ──────────────────────────────────────────────────
export async function getActiveBanners() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.assetType, "banner"), eq(mediaAssets.isActive, true)))
    .orderBy(mediaAssets.sortOrder);
}

// ─── 设置激活状态（Logo/CTA：单选；Banner：多选）────────────────────────────
export async function setAssetActive(id: number, isActive: boolean, assetType: "logo" | "banner" | "cta") {
  const db = await getDb();
  if (!db) return;
  if (assetType !== "banner" && isActive) {
    await db
      .update(mediaAssets)
      .set({ isActive: false })
      .where(eq(mediaAssets.assetType, assetType));
  }
  await db.update(mediaAssets).set({ isActive }).where(eq(mediaAssets.id, id));
}

// ─── 更新排序 ────────────────────────────────────────────────────────────────
export async function updateAssetSortOrder(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set({ sortOrder }).where(eq(mediaAssets.id, id));
}

// ─── 替换图片（保持 URL 不变，更新 storageKey）──────────────────────────────
export async function replaceMediaAsset(id: number, newUrl: string, newStorageKey: string, newFilename: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set({
    url: newUrl,
    storageKey: newStorageKey,
    filename: newFilename,
  }).where(eq(mediaAssets.id, id));
}

// ─── 删除媒体资产（检查引用）────────────────────────────────────────────────
export async function deleteMediaAsset(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}

// ─── 获取单个资产 ────────────────────────────────────────────────────────────
export async function getMediaAsset(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return rows[0] ?? null;
}

// ─── 更新引用信息 ────────────────────────────────────────────────────────────
export async function updateMediaAssetRef(id: number, data: {
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set(data).where(eq(mediaAssets.id, id));
}
