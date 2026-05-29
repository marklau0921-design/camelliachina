import { useState } from "react";
import { Move, X } from "lucide-react";

type FitMode = "cover" | "contain";

type AspectPreset = {
  label: string;
  value: string;
};

const aspectPresets: AspectPreset[] = [
  { label: "Hero", value: "16 / 7" },
  { label: "Wide", value: "16 / 9" },
  { label: "Card", value: "4 / 3" },
  { label: "Square", value: "1 / 1" },
  { label: "Portrait", value: "3 / 4" },
  { label: "Logo", value: "5 / 2" },
];

interface ImageCropPreviewProps {
  imageUrl: string;
  onClose: () => void;
  initialPosition?: string;
  onPositionChange?: (position: string) => void;
}

function parsePosition(position?: string) {
  const match = position?.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  return {
    x: match ? Number(match[1]) : 50,
    y: match ? Number(match[2]) : 50,
  };
}

function clampPosition(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function ImageCropPreview({
  imageUrl,
  onClose,
  initialPosition = "50% 50%",
  onPositionChange,
}: ImageCropPreviewProps) {
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [aspectRatio, setAspectRatio] = useState("16 / 9");
  const [position, setPosition] = useState(parsePosition(initialPosition));

  const objectPosition = `${position.x}% ${position.y}%`;

  const updatePosition = (x: number, y: number) => {
    const next = { x: clampPosition(x), y: clampPosition(y) };
    setPosition(next);
    onPositionChange?.(`${next.x}% ${next.y}%`);
  };

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (fitMode !== "cover") return;
    const rect = event.currentTarget.getBoundingClientRect();
    updatePosition(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px",
      }}
    >
      <div
        onClick={event => event.stopPropagation()}
        style={{
          width: "min(980px, 94vw)",
          maxHeight: "92vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #eee" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a" }}>Crop Preview</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Drag inside the frame to test the visible focus area.</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{ width: 32, height: 32, border: "1px solid #e5e5e5", background: "#fff", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 22px 24px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {aspectPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => setAspectRatio(preset.value)}
                style={{
                  padding: "7px 11px",
                  border: "1px solid #ddd",
                  borderColor: aspectRatio === preset.value ? "#F5569B" : "#ddd",
                  background: aspectRatio === preset.value ? "#fff0f6" : "#fff",
                  color: aspectRatio === preset.value ? "#F5569B" : "#555",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setFitMode(fitMode === "cover" ? "contain" : "cover")}
              style={{
                marginLeft: "auto",
                padding: "7px 12px",
                border: "1px solid #ddd",
                background: "#f8f8f8",
                color: "#333",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {fitMode === "cover" ? "Cover crop" : "Contain fit"}
            </button>
          </div>

          <div
            onPointerDown={handlePointer}
            onPointerMove={event => { if (event.buttons === 1) handlePointer(event); }}
            style={{
              width: "100%",
              aspectRatio,
              maxHeight: "62vh",
              background: "#151515",
              overflow: "hidden",
              position: "relative",
              cursor: fitMode === "cover" ? "crosshair" : "default",
              borderRadius: 6,
            }}
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: fitMode,
                objectPosition,
                display: "block",
                userSelect: "none",
              }}
            />
            {fitMode === "cover" && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "33.333% 33.333%" }} />
            )}
            {fitMode === "cover" && (
              <div
                style={{
                  position: "absolute",
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#F5569B",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
                  pointerEvents: "none",
                }}
              >
                <Move size={15} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              Current object-position: <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{objectPosition}</span>
            </div>
            <button
              onClick={() => updatePosition(50, 50)}
              style={{ padding: "8px 13px", border: "1px solid #ddd", background: "#fff", color: "#555", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
            >
              Reset center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
