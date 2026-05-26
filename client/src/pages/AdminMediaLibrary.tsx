import { useState, useRef, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import { trpc } from "../lib/trpc";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadZone({
  onUpload,
  loading,
  label = "Upload image (drag & drop or click)",
}: {
  onUpload: (file: File) => void;
  loading?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "#F5569B" : "#ccc"}`,
        borderRadius: 8,
        padding: "18px 12px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: dragging ? "#fff0f6" : "#fafafa",
        color: "#888",
        fontSize: 13,
        transition: "all 0.2s",
        userSelect: "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {loading ? "Uploading..." : label}
    </div>
  );
}

type MediaAsset = {
  id: number;
  url: string;
  filename: string;
  source?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  assetType: "logo" | "banner" | "cta" | "general";
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

function ImageCard({
  asset,
  onDelete,
  onReplace,
}: {
  asset: MediaAsset;
  onDelete?: (id: number) => void;
  onReplace?: (id: number, file: File) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const isInUse = !!asset.sourceUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplace = async (file: File) => {
    setReplaceLoading(true);
    try {
      await onReplace?.(asset.id, file);
    } finally {
      setReplaceLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img src={asset.url} alt={asset.filename} style={{ width: "100%", height: 200, objectFit: "cover" }} />
      <div style={{ padding: 12, background: "#fff", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.filename}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={handleCopy} style={{ flex: 1, minWidth: 50, padding: "4px 8px", fontSize: 10, background: copied ? "#4CAF50" : "#f0f0f0", color: copied ? "#fff" : "#666", border: "none", borderRadius: 3, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={() => setShowUsage(!showUsage)} style={{ flex: 1, minWidth: 50, padding: "4px 8px", fontSize: 10, background: "#f0f0f0", color: "#666", border: "none", borderRadius: 3, cursor: "pointer" }}>
            Usage
          </button>
          {onReplace && (
            <label style={{ flex: 1, minWidth: 50, padding: "4px 8px", fontSize: 10, background: "#f0f0f0", color: "#666", border: "none", borderRadius: 3, cursor: replaceLoading ? "not-allowed" : "pointer", textAlign: "center", display: "block" }}>
              {replaceLoading ? "..." : "Replace"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplace(f); e.target.value = ""; }} />
            </label>
          )}
          {onDelete && (
            <button onClick={() => onDelete(asset.id)} style={{ flex: 1, minWidth: 50, padding: "4px 8px", fontSize: 10, background: "#ffebee", color: "#c62828", border: "none", borderRadius: 3, cursor: "pointer" }}>
              Delete
            </button>
          )}
        </div>
      </div>
      {showUsage && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 4, padding: 8, marginTop: 4, fontSize: 11, color: "#666", zIndex: 10 }}>
          {isInUse ? (
            <>
              <div><strong>Used in:</strong> {asset.sourceLabel}</div>
              {asset.sourceUrl && <div style={{ marginTop: 4, wordBreak: "break-all", color: "#999" }}>{asset.sourceUrl}</div>}
            </>
          ) : (
            <div style={{ color: "#aaa" }}>Not in use</div>
          )}
        </div>
      )}
    </div>
  );
}

function HomepageAssetsTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const { data: assets = [], isLoading: assetsLoading } = trpc.media.list.useQuery({ search: debouncedSearch, assetType: "logo" });
  const { data: banners = [], isLoading: bannersLoading } = trpc.media.list.useQuery({ search: debouncedSearch, assetType: "banner" });
  const { data: ctas = [], isLoading: ctasLoading } = trpc.media.list.useQuery({ search: debouncedSearch, assetType: "cta" });
  const uploadMut = trpc.media.upload.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const deleteMut = trpc.media.delete.useMutation({ onSuccess: () => utils.media.list.invalidate(), onError: (err) => alert(err.message) });
  const setActiveMut = trpc.media.setActive.useMutation({ onSuccess: () => utils.media.list.invalidate() });

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const handleUpload = async (file: File, assetType: "logo" | "banner" | "cta") => {
    const base64 = await fileToBase64(file);
    await uploadMut.mutateAsync({ filename: file.name, base64, mimeType: file.type || "image/jpeg", fileSize: file.size, source: "homepage", assetType });
  };

  const handleReplace = async (id: number, file: File) => {
    const base64 = await fileToBase64(file);
    await replaceMut.mutateAsync({ id, filename: file.name, base64, mimeType: file.type || "image/jpeg" });
  };

  const sectionStyle: React.CSSProperties = { marginBottom: 32, background: "#fff", padding: 20, borderRadius: 8 };
  const sectionTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 };

  return (
    <div>
      {/* Logos */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Logo</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {assetsLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : assets.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No logos uploaded yet.</div> : (assets as MediaAsset[]).map((logo) => (
            <div key={logo.id} onClick={() => setActiveMut.mutate({ id: logo.id, isActive: !logo.isActive, assetType: "logo" })}
              style={{ width: 160, border: `2px solid ${logo.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: logo.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={logo.url} alt={logo.filename} style={{ width: "100%", height: 80, objectFit: "contain", padding: 8 }} />
              {logo.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{logo.filename.length > 16 ? logo.filename.slice(0, 14) + "…" : logo.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "logo")} loading={uploadMut.isPending} label="Upload new logo (drag & drop or click)" />
      </div>

      {/* Banners */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Hero Banner</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {bannersLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : banners.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No banners uploaded yet.</div> : (banners as MediaAsset[]).map((banner) => (
            <div key={banner.id} onClick={() => setActiveMut.mutate({ id: banner.id, isActive: !banner.isActive, assetType: "banner" })}
              style={{ width: 160, border: `2px solid ${banner.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: banner.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={banner.url} alt={banner.filename} style={{ width: "100%", height: 90, objectFit: "cover" }} />
              {banner.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{banner.filename.length > 16 ? banner.filename.slice(0, 14) + "…" : banner.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "banner")} loading={uploadMut.isPending} label="Upload new banner (drag & drop or click)" />
      </div>

      {/* Background Texture */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Background Texture Image</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {ctasLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : ctas.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No CTA backgrounds uploaded yet.</div> : (ctas as MediaAsset[]).map((cta) => (
            <div key={cta.id} onClick={() => setActiveMut.mutate({ id: cta.id, isActive: !cta.isActive, assetType: "cta" })}
              style={{ width: 160, border: `2px solid ${cta.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: cta.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={cta.url} alt={cta.filename} style={{ width: "100%", height: 90, objectFit: "cover" }} />
              {cta.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{cta.filename.length > 18 ? cta.filename.slice(0, 16) + "…" : cta.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "cta")} loading={uploadMut.isPending} label="Upload new CTA background (drag & drop or click)" />
      </div>
    </div>
  );
}

function AllImagesTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const { data: assets = [], isLoading } = trpc.media.list.useQuery({ search: debouncedSearch });
  const uploadMut = trpc.media.upload.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const deleteMut = trpc.media.delete.useMutation({ onSuccess: () => { utils.media.list.invalidate(); setSelectedIds(new Set()); }, onError: (err) => alert(err.message) });
  const batchDeleteMut = trpc.media.batchDelete.useMutation({ onSuccess: () => { utils.media.list.invalidate(); setSelectedIds(new Set()); setShowDeleteConfirm(false); }, onError: (err) => alert(err.message) });

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const handleUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    await uploadMut.mutateAsync({ filename: file.name, base64, mimeType: file.type || "image/jpeg", fileSize: file.size, source: "general", assetType: "general" });
  };

  const handleReplace = async (id: number, file: File) => {
    const base64 = await fileToBase64(file);
    await replaceMut.mutateAsync({ id, filename: file.name, base64, mimeType: file.type || "image/jpeg" });
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length && assets.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set((assets as MediaAsset[]).map(a => a.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDeleteMut.mutateAsync({ ids: Array.from(selectedIds) });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by filename or URL..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, padding: "8px 14px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, background: "#f2f2f2", color: "#1a1a1a", outline: "none" }}
        />
        <label style={{ padding: "8px 18px", borderRadius: 6, background: "#F5569B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: uploadMut.isPending ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {uploadMut.isPending ? "Uploading..." : "+ Upload Image"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
        </label>
      </div>

      {isLoading ? (
        <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: 40 }}>Loading...</div>
      ) : assets.length === 0 ? (
        <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: 40 }}>{debouncedSearch ? "No images found." : "No images uploaded yet."}</div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: selectedIds.size === assets.length && assets.length > 0 ? "#F5569B" : "#fff",
                color: selectedIds.size === assets.length && assets.length > 0 ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {selectedIds.size === assets.length && assets.length > 0 ? "Deselect All" : "Select All"}
            </button>
            {selectedIds.size > 0 && (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>已选 {selectedIds.size} 张</span>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #ff4444",
                    background: "#fff",
                    color: "#ff4444",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Delete Selected
                </button>
              </>
            )}
          </div>

          {showDeleteConfirm && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                maxWidth: 400,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px 0", color: "#1a1a1a" }}>确认删除</h2>
                <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px 0" }}>确定要删除这 {selectedIds.size} 张图片吗？此操作无法撤销。</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#333",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={batchDeleteMut.isPending}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: "#ff4444",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: batchDeleteMut.isPending ? "not-allowed" : "pointer",
                      opacity: batchDeleteMut.isPending ? 0.6 : 1,
                    }}
                  >
                    {batchDeleteMut.isPending ? "删除中..." : "确认删除"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {(assets as MediaAsset[]).map((asset) => (
              <div
                key={asset.id}
                style={{
                  position: "relative",
                  border: selectedIds.has(asset.id) ? "3px solid #F5569B" : "1px solid #e8e8e8",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: selectedIds.has(asset.id) ? "#fff0f6" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    width: 20,
                    height: 20,
                    background: selectedIds.has(asset.id) ? "#F5569B" : "#fff",
                    border: selectedIds.has(asset.id) ? "2px solid #F5569B" : "2px solid #ddd",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(asset.id);
                  }}
                >
                  {selectedIds.has(asset.id) && (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>✓</span>
                  )}
                </div>

                {/* Image Card Content */}
                <div onClick={() => toggleSelect(asset.id)} style={{ cursor: "pointer" }}>
                  <ImageCard
                    asset={asset as MediaAsset}
                    onDelete={(id) => deleteMut.mutate({ id })}
                    onReplace={handleReplace}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMediaLibrary() {
  const [activeTab, setActiveTab] = useState<"homepage" | "all">("homepage");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 22px",
    borderRadius: "6px 6px 0 0",
    border: "1px solid #e8e8e8",
    borderBottom: active ? "1px solid #fff" : "1px solid #e8e8e8",
    background: active ? "#fff" : "#f2f2f2",
    color: active ? "#F5569B" : "#888",
    fontWeight: active ? 700 : 400,
    fontSize: 13,
    cursor: "pointer",
    marginRight: 4,
    transition: "all 0.15s",
  });

  return (
    <AdminLayout>
      <div style={{ padding: "32px 36px", background: "#f2f2f2", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Media Library</h1>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 24 }}>
          <button style={tabStyle(activeTab === "homepage")} onClick={() => setActiveTab("homepage")}>Brand Assets</button>
          <button style={tabStyle(activeTab === "all")} onClick={() => setActiveTab("all")}>All Images</button>
        </div>
        {activeTab === "homepage" ? <HomepageAssetsTab /> : <AllImagesTab />}
      </div>
    </AdminLayout>
  );
}
