import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import type { CulinaryTravelSection } from "@/lib/culinary-travel";

const ACCENT = "#F5569B";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: "13px",
  background: "#f2f2f2",
  border: "1px solid #ddd",
  outline: "none",
  color: "#2d2d2d",
  boxSizing: "border-box",
};

export default function CulinaryTravelEditor({
  title,
  sections,
  onTitleChange,
  onSectionsChange,
}: {
  title: string;
  sections: CulinaryTravelSection[];
  onTitleChange: (title: string) => void;
  onSectionsChange: (sections: CulinaryTravelSection[]) => void;
}) {
  const updateSection = (index: number, patch: Partial<CulinaryTravelSection>) => {
    onSectionsChange(sections.map((section, i) => i === index ? { ...section, ...patch } : section));
  };

  const addSection = () => {
    onSectionsChange([...sections, { image: "", title: "", description: "" }]);
  };

  const removeSection = (index: number) => {
    if (!confirm(`Delete culinary section ${index + 1}?`)) return;
    onSectionsChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <label style={labelStyle}>Section Title</label>
        <input
          value={title}
          onChange={event => onTitleChange(event.target.value)}
          placeholder="e.g. Culinary Travel"
          style={inputStyle}
          onFocus={event => { event.currentTarget.style.borderColor = ACCENT; }}
          onBlur={event => { event.currentTarget.style.borderColor = "#ddd"; }}
        />
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {sections.map((section, index) => (
          <div key={index} style={{ border: "1px solid #e6e6e6", background: "#fafafa", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontSize: "12px", color: "#555", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Content Section {index + 1} · Image {index % 2 === 0 ? "Left" : "Right"}
              </div>
              <button
                type="button"
                onClick={() => removeSection(index)}
                aria-label={`Delete culinary section ${index + 1}`}
                style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "transparent", color: "#d14343", cursor: "pointer", fontSize: 11 }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <ImageUploader
                value={section.image}
                onChange={image => updateSection(index, { image })}
                category="city"
                label={`Section ${index + 1} Large Image`}
              />
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  value={section.title}
                  onChange={event => updateSection(index, { title: event.target.value })}
                  placeholder="Content title"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={section.description}
                  onChange={event => updateSection(index, { description: event.target.value })}
                  placeholder="Content description"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        style={{ marginTop: 18, padding: "10px 18px", border: `1px solid ${ACCENT}`, background: "#fff", color: ACCENT, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        <Plus size={15} /> Add Content Section
      </button>
    </div>
  );
}
