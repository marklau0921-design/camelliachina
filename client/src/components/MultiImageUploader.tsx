import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Maximize2, Upload, X } from "lucide-react";
import ImageCropPreview from "./ImageCropPreview";
import { useMediaObjectPosition } from "@/lib/media-position";
import { prepareImageForUpload } from "@/lib/image-upload";

interface MultiImageUploaderProps {
  value?: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  category?: string;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  source?: string;
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
}

export default function MultiImageUploader({
  value = [],
  onChange,
  category = "other",
  label = "Images",
  placeholder = "Paste URL or upload files",
  compact = false,
  source,
  sourceId,
  sourceLabel,
  sourceUrl,
}: MultiImageUploaderProps) {
  const isDark = compact;
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const getObjectPosition = useMediaObjectPosition();
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = trpc.media.upload.useMutation();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const uploadFile = await prepareImageForUpload(file);
      const result = await upload.mutateAsync({
        filename: uploadFile.filename,
        base64: uploadFile.base64,
        mimeType: uploadFile.mimeType,
        fileSize: uploadFile.fileSize,
        source: source ?? category ?? "general",
        sourceId,
        sourceLabel,
        sourceUrl,
        assetType: "general",
      });
      // Add new URL to the array
      onChange([...value, result.url]);
      setUrlInput("");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFile(file));
  };

  const handleUrlChange = (url: string) => {
    if (url && !value.includes(url)) {
      onChange([...value, url]);
      setUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const inputBg = isDark ? "#0d0d0d" : "#f2f2f2";
  const inputBorder = isDark ? "#2a2a2a" : "#ddd";
  const inputColor = isDark ? "#fff" : "#2d2d2d";
  const uploadBg = isDark ? "#0d0d0d" : "#fafafa";
  const uploadBorderColor = isDark ? "#2a2a2a" : "#ccc";
  const uploadTextColor = isDark ? "#555" : "#888";

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: isDark ? "#666" : "#888", marginBottom: "8px" }}>
          {label}
        </label>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginBottom: "10px" }}>
          {value.map((url, index) => (
            <div key={index} style={{ position: "relative", display: "inline-block" }}>
              <img
                src={url}
                alt={`Preview ${index}`}
                style={{ height: "100px", width: "100px", objectFit: "cover", background: isDark ? "#1a1a1a" : "#e8e8e8", display: "block" }}
                onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <button
                onClick={() => removeImage(index)}
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer",
                  color: "#fff", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "2px",
                }}
              >
                <X size={12} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewUrl(url)}
                title="Preview crop"
                style={{
                  position: "absolute", bottom: "4px", right: "4px",
                  background: "rgba(0,0,0,0.62)", border: "none", cursor: "pointer",
                  color: "#fff", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "2px",
                }}
              >
                <Maximize2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* URL input */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyPress={e => { if (e.key === "Enter") handleUrlChange(urlInput); }}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "8px 12px", fontSize: "13px",
            background: inputBg, border: `1px solid ${inputBorder}`, outline: "none",
            color: inputColor,
          }}
          onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
          onBlur={e => { e.target.style.borderColor = inputBorder; }}
        />
        <button
          onClick={() => handleUrlChange(urlInput)}
          style={{
            padding: "8px 16px", fontSize: "13px",
            background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${uploadBorderColor}`,
          padding: "12px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: uploadTextColor,
          fontSize: "12px",
          letterSpacing: "0.05em",
          transition: "border-color 0.18s, color 0.18s",
          background: uploadBg,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5569B"; e.currentTarget.style.color = "#F5569B"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = uploadBorderColor; e.currentTarget.style.color = uploadTextColor; }}
      >
        {uploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <Upload size={14} />
            <span>Upload images (drag & drop or click)</span>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => { const files = Array.from(e.target.files || []); files.forEach(f => handleFile(f)); }}
      />

      {error && (
        <p style={{ fontSize: "12px", color: "#e53e3e", marginTop: "6px" }}>{error}</p>
      )}

      {previewUrl && (
        <ImageCropPreview imageUrl={previewUrl} initialPosition={getObjectPosition(previewUrl)} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}
