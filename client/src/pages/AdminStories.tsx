import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import TagSelector from "@/components/TagSelector";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const ACCENT = "#F5569B";

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  coverImage: "",
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

function StoryForm({ initial, onSave, onCancel, saving }: {
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
          <label style={labelStyle}>Story Title *</label>
          <input value={form.title} onChange={e => { set("title", e.target.value); if (!initial.slug) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")); }} placeholder="e.g. A Morning in the Tea Mountains" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div>
          <label style={labelStyle}>URL Slug</label>
          <input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generated" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Story Content</label>
          <textarea value={form.content} onChange={e => set("content", e.target.value)} rows={8} placeholder="Write the story content here..." style={{ ...inputStyle, resize: "vertical" }} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <ImageUploader value={form.coverImage} onChange={url => set("coverImage", url)} category="story" label="Cover Image" />
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
        <button onClick={() => onSave(form)} disabled={saving || !form.title.trim()} style={{ padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer", opacity: saving || !form.title.trim() ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{ padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminStories() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: stories = [], isLoading } = trpc.admin.listStories.useQuery();
  const createStory = trpc.admin.createStory.useMutation({ onSuccess: () => { utils.admin.listStories.invalidate(); setShowForm(false); } });
  const updateStory = trpc.admin.updateStory.useMutation({ onSuccess: () => { utils.admin.listStories.invalidate(); setEditId(null); } });
  const deleteStory = trpc.admin.deleteStory.useMutation({ onSuccess: () => utils.admin.listStories.invalidate() });
  const { data: storyDetail } = trpc.admin.getStory.useQuery({ id: editId! }, { enabled: editId !== null });

  return (
    <AdminLayout title="Stories">
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Stories</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{stories.length} stories</p>
          </div>
          {!showForm && editId === null && (
            <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}>
              <Plus size={14} /> New Story
            </button>
          )}
        </div>

        {showForm && (
          <StoryForm initial={emptyForm} onSave={data => createStory.mutate(data)} onCancel={() => setShowForm(false)} saving={createStory.isPending} />
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8" }}>
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Story</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Status</span>
              <span style={{ width: "100px" }} />
            </div>

            {stories.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: "13px" }}>No stories yet.</div>
            )}

            {stories.map((story, idx) => {
              const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
              const isEditing = editId === story.id;

              if (isEditing && storyDetail) {
                return (
                  <div key={story.id} style={{ background: "#fff", padding: "20px", borderBottom: "1px solid #ddd" }}>
                    <StoryForm
                      initial={{
                        title: storyDetail.title,
                        slug: storyDetail.slug,
                        content: storyDetail.content || "",
                        coverImage: storyDetail.coverImage || "",
                        isActive: storyDetail.isActive,
                        sortOrder: storyDetail.sortOrder ?? 0,
                        tagIds: storyDetail.tagIds || [],
                      }}
                      onSave={data => updateStory.mutate({ id: story.id, ...data })}
                      onCancel={() => setEditId(null)}
                      saving={updateStory.isPending}
                    />
                  </div>
                );
              }

              return (
                <div key={story.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", background: bg, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ width: "48px", height: "32px", background: "#ddd", marginRight: "14px", flexShrink: 0, overflow: "hidden" }}>
                    {story.coverImage && <img src={story.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", color: "#1a1a1a" }}>{story.title}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>/{story.slug}</div>
                  </div>
                  <div style={{ width: "80px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: story.isActive ? "#4caf50" : "#aaa" }}>{story.isActive ? "Active" : "Hidden"}</span>
                  </div>
                  <div style={{ width: "100px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    {deleteConfirm === story.id ? (
                      <>
                        <button onClick={() => { deleteStory.mutate({ id: story.id }); setDeleteConfirm(null); }} style={iconBtnStyle("#e53e3e")}><Check size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} style={iconBtnStyle("#888")}><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(story.id); setShowForm(false); }} style={iconBtnStyle("#888")}><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm(story.id)} style={iconBtnStyle("#e53e3e")}><Trash2 size={14} /></button>
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
