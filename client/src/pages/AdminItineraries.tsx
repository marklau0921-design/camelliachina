import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import TagSelector from "@/components/TagSelector";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const ACCENT = "#F5569B";

const emptyForm = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  coverImage: "",
  days: 1,
  price: "",
  difficulty: "easy" as "easy" | "medium" | "hard",
  maxPeople: undefined as number | undefined,
  details: "",
  isActive: true,
  sortOrder: 0,
  tagIds: [] as number[],
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#888", marginBottom: "8px",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: "13px",
  background: "#f2f2f2", border: "1px solid #ddd", outline: "none",
  color: "#2d2d2d", boxSizing: "border-box",
};
const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: "none", border: "none", cursor: "pointer", color,
  padding: "4px", display: "flex", alignItems: "center", opacity: 0.7,
});

function ItineraryForm({ initial, onSave, onCancel, saving }: {
  initial: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof emptyForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: "28px", marginBottom: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Itinerary Name *</label>
          <input value={form.name} onChange={e => { set("name", e.target.value); if (!initial.slug) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")); }} placeholder="e.g. 5-Day Chengdu Deep Dive" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div>
          <label style={labelStyle}>URL Slug</label>
          <input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generated" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Short Description</label>
          <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="One-line summary" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Overview</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Overview of the itinerary..." style={{ ...inputStyle, resize: "vertical" }} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <ImageUploader value={form.coverImage} onChange={url => set("coverImage", url)} category="itinerary" label="Cover Image" />
        </div>
        <div>
          <label style={labelStyle}>Number of Days *</label>
          <input type="number" min={1} value={form.days} onChange={e => set("days", parseInt(e.target.value) || 1)} style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div>
          <label style={labelStyle}>Price</label>
          <input value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. From $1,200pp" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div>
          <label style={labelStyle}>Difficulty</label>
          <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Max People</label>
          <input type="number" value={form.maxPeople ?? ""} onChange={e => set("maxPeople", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="No limit" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Day-by-Day Details (JSON or text)</label>
          <textarea value={form.details} onChange={e => set("details", e.target.value)} rows={5} placeholder={'[{"day":1,"title":"Arrival","description":"..."}]'} style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "12px" }} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <TagSelector selectedIds={form.tagIds} onChange={ids => set("tagIds", ids)} label="Tags" />
        </div>
        <div>
          <label style={labelStyle}>Sort Order</label>
          <input type="number" value={form.sortOrder} onChange={e => set("sortOrder", parseInt(e.target.value) || 0)} style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} style={{ accentColor: ACCENT, width: "16px", height: "16px" }} />
            <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" }}>Active</span>
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()} style={{ padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer", opacity: saving || !form.name.trim() ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{ padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminItineraries() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: itineraries = [], isLoading } = trpc.admin.listItineraries.useQuery();
  const createItin = trpc.admin.createItinerary.useMutation({ onSuccess: () => { utils.admin.listItineraries.invalidate(); setShowForm(false); } });
  const updateItin = trpc.admin.updateItinerary.useMutation({ onSuccess: () => { utils.admin.listItineraries.invalidate(); setEditId(null); } });
  const deleteItin = trpc.admin.deleteItinerary.useMutation({ onSuccess: () => utils.admin.listItineraries.invalidate() });
  const { data: itinDetail } = trpc.admin.getItinerary.useQuery({ id: editId! }, { enabled: editId !== null });

  return (
    <AdminLayout title="Itineraries">
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Itineraries</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{itineraries.length} itineraries</p>
          </div>
          {!showForm && editId === null && (
            <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}>
              <Plus size={14} /> New Itinerary
            </button>
          )}
        </div>

        {showForm && (
          <ItineraryForm initial={emptyForm} onSave={data => createItin.mutate(data)} onCancel={() => setShowForm(false)} saving={createItin.isPending} />
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8" }}>
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Itinerary</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Days</span>
              <span style={{ width: "100px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Price</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Status</span>
              <span style={{ width: "100px" }} />
            </div>

            {itineraries.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: "13px" }}>No itineraries yet.</div>
            )}

            {itineraries.map((itin, idx) => {
              const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
              const isEditing = editId === itin.id;

              if (isEditing && itinDetail) {
                return (
                  <div key={itin.id} style={{ background: "#fff", padding: "20px", borderBottom: "1px solid #ddd" }}>
                    <ItineraryForm
                      initial={{
                        name: itinDetail.name,
                        slug: itinDetail.slug,
                        shortDescription: itinDetail.shortDescription || "",
                        description: itinDetail.description || "",
                        coverImage: itinDetail.coverImage || "",
                        days: itinDetail.days,
                        price: itinDetail.price || "",
                        difficulty: itinDetail.difficulty || "easy",
                        maxPeople: itinDetail.maxPeople ?? undefined,
                        details: itinDetail.details || "",
                        isActive: itinDetail.isActive,
                        sortOrder: itinDetail.sortOrder ?? 0,
                        tagIds: itinDetail.tagIds || [],
                      }}
                      onSave={data => updateItin.mutate({ id: itin.id, ...data })}
                      onCancel={() => setEditId(null)}
                      saving={updateItin.isPending}
                    />
                  </div>
                );
              }

              return (
                <div key={itin.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", background: bg, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ width: "48px", height: "32px", background: "#ddd", marginRight: "14px", flexShrink: 0, overflow: "hidden" }}>
                    {itin.coverImage && <img src={itin.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", color: "#1a1a1a" }}>{itin.name}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{itin.shortDescription || "—"}</div>
                  </div>
                  <div style={{ width: "80px", textAlign: "center", fontSize: "13px", color: "#888" }}>{itin.days}d</div>
                  <div style={{ width: "100px", textAlign: "center", fontSize: "12px", color: "#888" }}>{itin.price || "—"}</div>
                  <div style={{ width: "80px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: itin.isActive ? "#4caf50" : "#aaa" }}>{itin.isActive ? "Active" : "Hidden"}</span>
                  </div>
                  <div style={{ width: "100px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    {deleteConfirm === itin.id ? (
                      <>
                        <button onClick={() => { deleteItin.mutate({ id: itin.id }); setDeleteConfirm(null); }} style={iconBtnStyle("#e53e3e")}><Check size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} style={iconBtnStyle("#888")}><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(itin.id); setShowForm(false); }} style={iconBtnStyle("#888")}><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(itin.id)} style={iconBtnStyle("#e53e3e")}><Trash2 size={14} /></button>
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
