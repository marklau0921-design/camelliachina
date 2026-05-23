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
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReplaceFile = async (file: File) => {
    if (!onReplace) return;
    setReplaceLoading(true);
    await onReplace(asset.id, file);
    setReplaceLoading(false);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", aspectRatio: "4/3", background: "#f2f2f2", overflow: "hidden" }}>
        <img src={asset.url} alt={asset.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", wordBreak: "break-all", lineHeight: 1.4 }}>{asset.filename}</div>
        <div style={{ fontSize: 11, color: "#888", wordBreak: "break-all", lineHeight: 1.4 }}>{asset.url}</div>
        <div>
          {isInUse ? (
            <button onClick={() => setShowUsage(!showUsage)} style={{ fontSize: 11, color: "#F5569B", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {showUsage ? "Hide usage" : "Used in 1 page ▾"}
            </button>
          ) : (
            <span style={{ fontSize: 11, color: "#bbb" }}>Not in use</span>
          )}
          {showUsage && isInUse && (
            <div style={{ marginTop: 4, fontSize: 11, color: "#555", background: "#f9f9f9", borderRadius: 4, padding: "4px 8px" }}>
              {asset.sourceLabel && <div style={{ fontWeight: 600 }}>{asset.sourceLabel}</div>}
              <div style={{ color: "#888" }}>{asset.sourceUrl}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          <button onClick={handleCopy} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: copied ? "#e8f5e9" : "#f2f2f2", color: copied ? "#388e3c" : "#555", cursor: "pointer" }}>
            {copied ? "Copied!" : "Copy URL"}
          </button>
          {onReplace && (
            <label style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: "#f2f2f2", color: "#555", cursor: replaceLoading ? "not-allowed" : "pointer" }}>
              {replaceLoading ? "Replacing..." : "Replace"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceFile(f); e.target.value = ""; }} />
            </label>
          )}
          {onDelete && (
            <button
              onClick={() => { if (isInUse) { alert("This image is currently in use."); return; } if (confirm("Delete this image?")) onDelete(asset.id); }}
              title={isInUse ? "This image is currently in use." : "Delete"}
              style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: "#f2f2f2", color: isInUse ? "#ccc" : "#e53935", cursor: isInUse ? "not-allowed" : "pointer" }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HomepageAssetsTab() {
  const utils = trpc.useUtils();
  const { data: logos = [], isLoading: logosLoading } = trpc.media.listByType.useQuery({ assetType: "logo" });
  const { data: banners = [], isLoading: bannersLoading } = trpc.media.listByType.useQuery({ assetType: "banner" });
  const { data: ctas = [], isLoading: ctasLoading } = trpc.media.listByType.useQuery({ assetType: "cta" });

  const invalidate = () => { utils.media.listByType.invalidate(); utils.media.list.invalidate(); };

  const uploadMut = trpc.media.upload.useMutation({ onSuccess: invalidate });
  const setActiveMut = trpc.media.setActive.useMutation({ onSuccess: () => utils.media.listByType.invalidate() });
  const updateSortMut = trpc.media.updateSortOrder.useMutation({ onSuccess: () => utils.media.listByType.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: invalidate });

  const handleUpload = async (file: File, assetType: "logo" | "banner" | "cta") => {
    const base64 = await fileToBase64(file);
    await uploadMut.mutateAsync({ filename: file.name, base64, mimeType: file.type || "image/jpeg", fileSize: file.size, source: assetType, assetType });
  };

  const handleReplace = async (id: number, file: File) => {
    const base64 = await fileToBase64(file);
    await replaceMut.mutateAsync({ id, filename: file.name, base64, mimeType: file.type || "image/jpeg" });
  };

  const handleReorder = (items: MediaAsset[], idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    updateSortMut.mutate({ id: items[idx].id, sortOrder: swapIdx });
    updateSortMut.mutate({ id: items[swapIdx].id, sortOrder: idx });
  };

  const sectionStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "24px 28px", marginBottom: 24 };
  const sectionTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 10 };

  return (
    <div>
      {/* Logo */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Logo</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {logosLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : logos.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No logos uploaded yet.</div> : (logos as MediaAsset[]).map((logo) => (
            <div key={logo.id} onClick={() => setActiveMut.mutate({ id: logo.id, isActive: !logo.isActive, assetType: "logo" })}
              style={{ width: 120, border: `2px solid ${logo.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: logo.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={logo.url} alt={logo.filename} style={{ width: "100%", height: 80, objectFit: "contain", padding: 8 }} />
              {logo.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{logo.filename.length > 16 ? logo.filename.slice(0, 14) + "…" : logo.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "logo")} loading={uploadMut.isPending} label="Upload new logo (drag & drop or click)" />
      </div>

      {/* Banner */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Homepage Banner</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {bannersLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : banners.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No banners uploaded yet.</div> : (banners as MediaAsset[]).map((banner, idx) => (
            <div key={banner.id} style={{ width: 180, border: `2px solid ${banner.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", background: "#fafafa", position: "relative" }}>
              <img src={banner.url} alt={banner.filename} style={{ width: "100%", height: 100, objectFit: "cover" }} />
              <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 4, borderTop: "1px solid #f0f0f0" }}>
                <button onClick={() => handleReorder(banners as MediaAsset[], idx, -1)} disabled={idx === 0} style={{ fontSize: 12, background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#ccc" : "#555" }}>↑</button>
                <button onClick={() => handleReorder(banners as MediaAsset[], idx, 1)} disabled={idx === banners.length - 1} style={{ fontSize: 12, background: "none", border: "none", cursor: idx === banners.length - 1 ? "default" : "pointer", color: idx === banners.length - 1 ? "#ccc" : "#555" }}>↓</button>
                <button onClick={() => setActiveMut.mutate({ id: banner.id, isActive: !banner.isActive, assetType: "banner" })} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "none", background: banner.isActive ? "#F5569B" : "#e8e8e8", color: banner.isActive ? "#fff" : "#888", cursor: "pointer", marginLeft: "auto" }}>
                  {banner.isActive ? "ON" : "OFF"}
                </button>
              </div>
              <label style={{ display: "block", textAlign: "center", fontSize: 10, color: "#888", padding: "4px", cursor: "pointer", borderTop: "1px solid #f0f0f0" }}>
                Replace
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplace(banner.id, f); e.target.value = ""; }} />
              </label>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "banner")} loading={uploadMut.isPending} label="Upload new banner (drag & drop or click)" />
      </div>

      {/* CTA */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>CTA Background Image</div>
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
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const { data: assets = [], isLoading } = trpc.media.list.useQuery({ search: debouncedSearch });
  const uploadMut = trpc.media.upload.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const deleteMut = trpc.media.delete.useMutation({ onSuccess: () => utils.media.list.invalidate(), onError: (err) => alert(err.message) });

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {(assets as MediaAsset[]).map((asset) => (
            <ImageCard
              key={asset.id}
              asset={asset as MediaAsset}
              onDelete={(id) => deleteMut.mutate({ id })}
              onReplace={handleReplace}
            />
          ))}
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
          <button style={tabStyle(activeTab === "homepage")} onClick={() => setActiveTab("homepage")}>Homepage Assets</button>
          <button style={tabStyle(activeTab === "all")} onClick={() => setActiveTab("all")}>All Images</button>
        </div>
        {activeTab === "homepage" ? <HomepageAssetsTab /> : <AllImagesTab />}
      </div>
    </AdminLayout>
  );
}
