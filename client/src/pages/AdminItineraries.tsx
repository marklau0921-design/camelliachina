import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import TagSelector from "@/components/TagSelector";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, X } from "lucide-react";

const ACCENT = "#F5569B";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ItineraryBlock {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  image?: string;
}

export interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  daysRange: string;
  blocks: ItineraryBlock[];
  galleryImages: string[];
}

const emptyForm = {
  place: "",
  name: "",
  slug: "",
  shortDescription: "",
  bannerImage: "",
  coverImage: "",
  overviewTitle: "",
  description: "",
  when: "",
  price: "",
  howLong: "",
  days: 1,
  sections: [] as ItinerarySection[],
  isActive: true,
  sortOrder: 0,
  tagIds: [] as number[],
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#888", marginBottom: "8px",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: "13px",
  background: "#f2f2f2", border: "1px solid #ddd", outline: "none",
  color: "#2d2d2d", boxSizing: "border-box",
};
const sectionStyle: React.CSSProperties = {
  marginBottom: "32px",
};
const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase",
  color: ACCENT, fontWeight: 700, marginBottom: "16px",
  paddingBottom: "8px", borderBottom: `2px solid ${ACCENT}`,
};
const dividerStyle: React.CSSProperties = {
  border: "none", borderTop: "1px solid #eee", margin: "28px 0",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function FocusInput({ value, onChange, placeholder, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, ...style }}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = "#ddd"; }}
    />
  );
}

function FocusTextarea({ value, onChange, placeholder, rows = 3, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; style?: React.CSSProperties;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: "vertical", ...style }}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = "#ddd"; }}
    />
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange, onDelete }: {
  block: ItineraryBlock;
  onChange: (b: ItineraryBlock) => void;
  onDelete: () => void;
}) {
  const set = <K extends keyof ItineraryBlock>(k: K, v: ItineraryBlock[K]) => onChange({ ...block, [k]: v });

  return (
    <div style={{ border: "1px solid #e8e8e8", background: "#fafafa", marginBottom: "10px", padding: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <GripVertical size={14} color="#bbb" />
          <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, fontWeight: 600 }}>
            Day {block.dayNumber}
          </span>
        </div>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "2px", display: "flex" }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "10px", marginBottom: "10px" }}>
        <div>
          <label style={labelStyle}>Day #</label>
          <input
            type="number" min={1}
            value={block.dayNumber}
            onChange={e => set("dayNumber", parseInt(e.target.value) || 1)}
            style={{ ...inputStyle, textAlign: "center" }}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Day Title</label>
          <FocusInput value={block.title} onChange={v => set("title", v)} placeholder="e.g. Arrival in Kunming" />
        </div>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label style={labelStyle}>Description</label>
        <FocusTextarea value={block.description} onChange={v => set("description", v)} placeholder="What happens on this day..." rows={4} />
      </div>
      <div>
        <label style={labelStyle}>Day Image (optional)</label>
        <ImageUploader value={block.image || ""} onChange={url => set("image", url)} category="itinerary" label="" />
      </div>
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────────────────────────

function SectionEditor({ section, onChange, onDelete, index }: {
  section: ItinerarySection;
  onChange: (s: ItinerarySection) => void;
  onDelete: () => void;
  index: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const set = <K extends keyof ItinerarySection>(k: K, v: ItinerarySection[K]) => onChange({ ...section, [k]: v });

  const addBlock = () => {
    const nextDay = section.blocks.length > 0
      ? Math.max(...section.blocks.map(b => b.dayNumber)) + 1
      : 1;
    set("blocks", [...section.blocks, { id: genId(), dayNumber: nextDay, title: "", description: "", image: "" }]);
  };

  const updateBlock = (i: number, b: ItineraryBlock) => {
    const updated = [...section.blocks];
    updated[i] = b;
    set("blocks", updated);
  };

  const deleteBlock = (i: number) => set("blocks", section.blocks.filter((_, j) => j !== i));

  return (
    <div style={{ border: "1px solid #ddd", background: "#fff", marginBottom: "16px" }}>
      {/* Section Header */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f5f5f5", cursor: "pointer", userSelect: "none" }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>
            Section {index + 1}
          </span>
          <span style={{ fontSize: "13px", color: "#444" }}>
            {section.title || <span style={{ color: "#bbb" }}>Untitled</span>}
          </span>
          {section.daysRange && (
            <span style={{ fontSize: "11px", color: "#999", background: "#e8e8e8", padding: "2px 8px" }}>{section.daysRange}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#aaa" }}>{section.blocks.length} day{section.blocks.length !== 1 ? "s" : ""}</span>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", display: "flex", padding: "2px" }}>
            <Trash2 size={13} />
          </button>
          {collapsed ? <ChevronDown size={16} color="#888" /> : <ChevronUp size={16} color="#888" />}
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Section Title</label>
              <FocusInput value={section.title} onChange={v => set("title", v)} placeholder="e.g. The Ancient Tea Horse Road" />
            </div>
            <div>
              <label style={labelStyle}>Days Range</label>
              <FocusInput value={section.daysRange} onChange={v => set("daysRange", v)} placeholder="e.g. Days 1–3" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Section Description</label>
              <FocusTextarea value={section.description} onChange={v => set("description", v)} placeholder="Overview of this section..." rows={3} />
            </div>
          </div>

          {/* Days */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Days ({section.blocks.length})</label>
              <button onClick={addBlock} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}>
                <Plus size={11} /> Add Day
              </button>
            </div>
            {section.blocks.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #ddd", color: "#bbb", fontSize: "12px" }}>
                No days yet — click "Add Day" to start.
              </div>
            )}
            {section.blocks.map((block, i) => (
              <BlockEditor key={block.id} block={block} onChange={b => updateBlock(i, b)} onDelete={() => deleteBlock(i)} />
            ))}
          </div>

          {/* Gallery */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <ImageIcon size={13} color="#888" />
              <label style={{ ...labelStyle, marginBottom: 0 }}>Section Gallery</label>
            </div>
            {/* Existing gallery thumbnails */}
            {section.galleryImages.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {section.galleryImages.map((img, i) => (
                  <div key={i} style={{ position: "relative", width: "80px", height: "60px", background: "#eee", overflow: "hidden" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => set("galleryImages", section.galleryImages.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add image — same style as standard ImageUploader */}
            <ImageUploader
              value=""
              onChange={url => { if (url) set("galleryImages", [...section.galleryImages, url]); }}
              category="itinerary"
              label=""
              placeholder="Paste image URL or upload file"
            />
            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "6px", marginBottom: 0 }}>{section.galleryImages.length} image{section.galleryImages.length !== 1 ? "s" : ""} in gallery</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

function ItineraryForm({ initial, onSave, onCancel, saving, title }: {
  initial: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  saving: boolean;
  title: string;
}) {
  const [form, setForm] = useState<typeof emptyForm>(initial);
  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) => setForm(f => ({ ...f, [k]: v }));

  const totalDays = (Array.isArray(form.sections) ? form.sections : []).reduce((acc, s) => acc + s.blocks.length, 0);

  const addSection = () => {
    const currentSections = Array.isArray(form.sections) ? form.sections : [];
    set("sections", [...currentSections, { id: genId(), title: "", description: "", daysRange: "", blocks: [], galleryImages: [] }]);
  };

  const SaveBar = () => (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <a
        href={form.slug ? `/itinerary/${form.slug}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => { if (!form.slug) e.preventDefault(); }}
        style={{ padding: "9px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: form.slug ? "#888" : "#ccc", border: "1px solid #ddd", cursor: form.slug ? "pointer" : "default", textDecoration: "none", display: "inline-block" }}
      >
        Preview
      </a>
      <button
        onClick={() => onSave(form)}
        disabled={saving || !form.name.trim()}
        style={{ padding: "9px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: saving || !form.name.trim() ? "not-allowed" : "pointer", opacity: saving || !form.name.trim() ? 0.5 : 1 }}
      >
        {saving ? "Saving..." : "Save Itinerary"}
      </button>
    </div>
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0" }}>
      {/* Form Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #eee", background: "#fafafa" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a1a" }}>{title}</h2>
          {form.name && <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#aaa" }}>{form.name}</p>}
        </div>
        <SaveBar />
      </div>

      {/* Form Body — single scrollable page */}
      <div style={{ padding: "28px 28px 0" }}>

        {/* ── Section: Basic Info ── */}
        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Basic Info</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Itinerary Name *</label>
              <FocusInput
                value={form.name}
                onChange={v => { set("name", v); if (!initial.slug) set("slug", v.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")); }}
                placeholder="e.g. 10-Day Yunnan Discovery"
              />
            </div>
            <div>
              <label style={labelStyle}>URL Slug</label>
              <FocusInput value={form.slug} onChange={v => set("slug", v)} placeholder="auto-generated" />
            </div>
            <div>
              <label style={labelStyle}>Place / Region</label>
              <FocusInput value={form.place} onChange={v => set("place", v)} placeholder="e.g. YUNNAN" />
            </div>
            <div>
              <label style={labelStyle}>Price</label>
              <FocusInput value={form.price} onChange={v => set("price", v)} placeholder="e.g. From $1,200pp" />
            </div>
            <div>
              <label style={labelStyle}>When</label>
              <FocusInput value={form.when} onChange={v => set("when", v)} placeholder="e.g. March – May" />
            </div>
            <div>
              <label style={labelStyle}>How Long</label>
              <FocusInput value={form.howLong} onChange={v => set("howLong", v)} placeholder="e.g. 10 nights" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Short Description (card summary)</label>
              <FocusInput value={form.shortDescription} onChange={v => set("shortDescription", v)} placeholder="One-line summary shown on listing cards" />
            </div>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* ── Section: Images ── */}
        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Images</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <ImageUploader value={form.coverImage} onChange={url => set("coverImage", url)} category="itinerary" label="Cover Image (card thumbnail)" />
            </div>
            <div>
              <ImageUploader value={form.bannerImage} onChange={url => set("bannerImage", url)} category="itinerary" label="Banner Image (full-width hero)" />
            </div>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* ── Section: Overview ── */}
        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Overview</p>
          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Overview Title</label>
              <FocusInput value={form.overviewTitle} onChange={v => set("overviewTitle", v)} placeholder="e.g. YUNNAN: MOUNTAINS AND MIST" />
            </div>
            <div>
              <label style={labelStyle}>Overview Description</label>
              <FocusTextarea value={form.description} onChange={v => set("description", v)} placeholder="Full overview text shown at the top of the itinerary detail page..." rows={7} />
            </div>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* ── Section: Itinerary Sections ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "8px", borderBottom: `2px solid ${ACCENT}` }}>
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>Itinerary Sections</span>
              <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "10px" }}>
                {form.sections.length} section{form.sections.length !== 1 ? "s" : ""} · {totalDays} days total
              </span>
            </div>
            <button
              onClick={addSection}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <Plus size={12} /> Add Section
            </button>
          </div>

          {form.sections.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", border: "1px dashed #ddd", color: "#bbb", fontSize: "13px" }}>
              No sections yet. Sections group days together (e.g. "Arrival & Kunming", "Tiger Leaping Gorge Trek").
              <br />
              <button onClick={addSection} style={{ marginTop: "12px", padding: "8px 20px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}>
                Add First Section
              </button>
            </div>
          )}

          {(Array.isArray(form.sections) ? form.sections : []).map((section, i) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={i}
              onChange={s => {
                const updated = [...form.sections];
                updated[i] = s;
                set("sections", updated);
              }}
              onDelete={() => set("sections", form.sections.filter((_, j) => j !== i))}
            />
          ))}
        </div>

        <hr style={dividerStyle} />

        {/* ── Section: Settings ── */}
        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Settings</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <TagSelector selectedIds={form.tagIds} onChange={ids => set("tagIds", ids)} label="Tags" />
            </div>
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => set("sortOrder", parseInt(e.target.value) || 0)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = ACCENT; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => set("isActive", e.target.checked)}
                  style={{ accentColor: ACCENT, width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" }}>Active (visible on site)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Save Bar */}
      <div style={{ display: "flex", gap: "10px", padding: "16px 28px", borderTop: "1px solid #eee", background: "#fafafa", position: "sticky", bottom: 0, zIndex: 10 }}>
        <SaveBar />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminItineraries() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: itineraries = [], isLoading } = trpc.admin.listItineraries.useQuery();
  const createItin = trpc.admin.createItinerary.useMutation({
    onSuccess: () => { utils.admin.listItineraries.invalidate(); setShowForm(false); },
  });
  const updateItin = trpc.admin.updateItinerary.useMutation({
    onSuccess: () => { utils.admin.listItineraries.invalidate(); /* Keep form open */ },
  });
  const deleteItin = trpc.admin.deleteItinerary.useMutation({
    onSuccess: () => utils.admin.listItineraries.invalidate(),
  });
  const { data: itinDetail } = trpc.admin.getItinerary.useQuery(
    { id: editId! },
    { enabled: editId !== null },
  );

  return (
    <AdminLayout title="Itineraries">
      <div style={{ padding: "32px" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Itineraries</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{itineraries.length} itinerar{itineraries.length !== 1 ? "ies" : "y"}</p>
          </div>
          {!showForm && editId === null && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => navigate("/template/itinerary")}
                style={{ padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer" }}
              >
                View Template
              </button>
              <button
                onClick={() => setShowForm(true)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Plus size={14} /> New Itinerary
              </button>
            </div>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={{ marginBottom: "32px" }}>
            <ItineraryForm
              title="New Itinerary"
              initial={emptyForm}
              onSave={data => createItin.mutate(data)}
              onCancel={() => setShowForm(false)}
              saving={createItin.isPending}
            />
          </div>
        )}

        {/* Edit Form */}
        {editId !== null && itinDetail && (
          <div style={{ marginBottom: "32px" }}>
            <ItineraryForm
              title={`Edit: ${itinDetail.name}`}
              initial={{
                place: itinDetail.place || "",
                name: itinDetail.name,
                slug: itinDetail.slug,
                shortDescription: itinDetail.shortDescription || "",
                bannerImage: itinDetail.bannerImage || "",
                coverImage: itinDetail.coverImage || "",
                overviewTitle: itinDetail.overviewTitle || "",
                description: itinDetail.description || "",
                when: itinDetail.when || "",
                price: itinDetail.price || "",
                howLong: itinDetail.howLong || "",
                days: itinDetail.days,
                sections: (() => {
                  if (Array.isArray(itinDetail.sections)) return itinDetail.sections;
                  if (typeof itinDetail.sections === 'string') {
                    try {
                      return JSON.parse(itinDetail.sections);
                    } catch (e) {
                      return [];
                    }
                  }
                  return [];
                })(),
                isActive: itinDetail.isActive,
                sortOrder: itinDetail.sortOrder ?? 0,
                tagIds: itinDetail.tagIds || [],
              }}
              onSave={data => updateItin.mutate({ id: editId, ...data }, { onSuccess: () => { /* Keep form open after save */ } })}
              onCancel={() => setEditId(null)}
              saving={updateItin.isPending}
            />
          </div>
        )}

        {/* Itinerary List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8" }}>
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Itinerary</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Days</span>
              <span style={{ width: "120px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Price</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Status</span>
              <span style={{ width: "140px" }} />
            </div>

            {itineraries.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: "13px" }}>
                No itineraries yet. Click "New Itinerary" to create one.
              </div>
            )}

            {itineraries.map((itin, idx) => {
              const bg = idx % 2 === 0 ? "#f9f9f9" : "#fff";
              if (editId === itin.id) return null;

              return (
                <div key={itin.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", background: bg, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ width: "56px", height: "40px", background: "#ddd", marginRight: "14px", flexShrink: 0, overflow: "hidden" }}>
                    {itin.coverImage && (
                      <img src={itin.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 500 }}>{itin.name}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                      {itin.place && <span style={{ color: ACCENT, marginRight: "8px" }}>{itin.place}</span>}
                      {itin.shortDescription || "—"}
                    </div>
                  </div>
                  <div style={{ width: "80px", textAlign: "center", fontSize: "13px", color: "#888" }}>{itin.days}d</div>
                  <div style={{ width: "120px", textAlign: "center", fontSize: "12px", color: "#888" }}>{itin.price || "—"}</div>
                  <div style={{ width: "80px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", background: itin.isActive ? "#fce4ec" : "#f5f5f5", color: itin.isActive ? ACCENT : "#aaa" }}>
                      {itin.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div style={{ width: "140px", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    {deleteConfirm === itin.id ? (
                      <>
                        <button onClick={() => { deleteItin.mutate({ id: itin.id }); setDeleteConfirm(null); }} style={{ padding: "5px 10px", fontSize: "11px", background: "#d32f2f", color: "#fff", border: "none", cursor: "pointer" }}>
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: "5px 10px", fontSize: "11px", background: "#eee", color: "#666", border: "none", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/itinerary/${itin.slug}`)}
                          style={{ background: "none", border: "1px solid #ddd", cursor: "pointer", color: "#888", padding: "5px 8px", fontSize: "11px" }}
                        >
                          Preview
                        </button>
                        <button onClick={() => setEditId(itin.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px", display: "flex" }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(itin.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "4px", display: "flex" }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
