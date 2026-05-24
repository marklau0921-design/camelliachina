import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import AdminLayout from "@/components/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImageStoryForm {
  title: string;
  thumbnailUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

interface VideoStoryForm {
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

interface SponsorForm {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

const emptyImageStory: ImageStoryForm = { title: "", thumbnailUrl: "", isVisible: true, sortOrder: 0 };
const emptyVideoStory: VideoStoryForm = { title: "", youtubeId: "", thumbnailUrl: "", isVisible: true, sortOrder: 0 };
const emptySponsor: SponsorForm = { name: "", logoUrl: "", websiteUrl: "", isVisible: true, sortOrder: 0 };

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, visible, onToggle }: { title: string; visible: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#1a1a1a", textTransform: "uppercase", margin: 0 }}>
        {title}
      </h2>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#666", fontFamily: "Lato, sans-serif" }}>
        <span>Show on homepage</span>
        <div
          onClick={onToggle}
          style={{
            width: 40, height: 22, borderRadius: 11, background: visible ? "#F5569B" : "#ccc",
            position: "relative", cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: visible ? 21 : 3, width: 16, height: 16,
            borderRadius: "50%", background: "#fff", transition: "left 0.2s",
          }} />
        </div>
      </label>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 4,
  fontFamily: "Lato, sans-serif", fontSize: 14, color: "#1a1a1a", background: "#fff",
  outline: "none", boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", minHeight: 100,
};

const btnPrimary: React.CSSProperties = {
  background: "#F5569B", color: "#fff", border: "none", borderRadius: 4,
  padding: "9px 22px", fontFamily: "Lato, sans-serif", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent", color: "#1a1a1a", border: "1px solid #e0e0e0", borderRadius: 4,
  padding: "9px 22px", fontFamily: "Lato, sans-serif", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  background: "transparent", color: "#e53e3e", border: "1px solid #e53e3e", borderRadius: 4,
  padding: "7px 14px", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 20, marginBottom: 12,
};

// ─── Image Story Modal ────────────────────────────────────────────────────────
function ImageStoryModal({ initial, onSave, onClose }: {
  initial?: ImageStoryForm & { id?: number };
  onSave: (data: ImageStoryForm & { id?: number }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ImageStoryForm>(initial ?? emptyImageStory);
  const set = (k: keyof ImageStoryForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, color: "#1a1a1a" }}>
          {initial?.id ? "Edit Image Card" : "Add Image Card"}
        </h3>
        <Field label="Title (internal label)">
          <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Guilin Landscape" />
        </Field>
        <Field label="Image">
          <ImageUploader value={form.thumbnailUrl} onChange={v => set("thumbnailUrl", v ?? "")} category="homepage" />
        </Field>
        <Field label="Sort Order">
          <input style={inputStyle} type="number" value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </Field>
        <Field label="Visible">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isVisible} onChange={e => set("isVisible", e.target.checked)} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 13 }}>Show on homepage</span>
          </label>
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={() => { if (!form.title) return; onSave({ ...form, id: initial?.id }); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Story Modal ────────────────────────────────────────────────────────
function VideoStoryModal({ initial, onSave, onClose }: {
  initial?: VideoStoryForm & { id?: number };
  onSave: (data: VideoStoryForm & { id?: number }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<VideoStoryForm>(initial ?? emptyVideoStory);
  const set = (k: keyof VideoStoryForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Auto-derive YouTube thumbnail when youtubeId changes
  const youtubeThumbnail = form.youtubeId
    ? `https://img.youtube.com/vi/${form.youtubeId}/maxresdefault.jpg`
    : "";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, color: "#1a1a1a" }}>
          {initial?.id ? "Edit Video Card" : "Add Video Card"}
        </h3>
        <Field label="Title (internal label)">
          <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Guilin Journey" />
        </Field>
        <Field label="YouTube Video ID">
          <input
            style={inputStyle}
            value={form.youtubeId}
            onChange={e => set("youtubeId", e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
          />
          {form.youtubeId && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#888", fontFamily: "Lato, sans-serif", marginBottom: 6 }}>
                Auto-fetched cover:
              </div>
              <img
                src={youtubeThumbnail}
                alt="YouTube thumbnail"
                style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 4, border: "1px solid #eee" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`;
                }}
              />
            </div>
          )}
        </Field>
        <Field label="Sort Order">
          <input style={inputStyle} type="number" value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </Field>
        <Field label="Visible">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isVisible} onChange={e => set("isVisible", e.target.checked)} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 13 }}>Show on homepage</span>
          </label>
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={() => { if (!form.title) return; onSave({ ...form, id: initial?.id }); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sponsor Modal ────────────────────────────────────────────────────────────
function SponsorModal({ initial, onSave, onClose }: { initial?: SponsorForm & { id?: number }; onSave: (data: SponsorForm & { id?: number }) => void; onClose: () => void }) {
  const [form, setForm] = useState<SponsorForm>(initial ?? emptySponsor);
  const set = (k: keyof SponsorForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, color: "#1a1a1a" }}>
          {initial?.id ? "Edit Sponsor" : "Add Sponsor"}
        </h3>
        <Field label="Sponsor Name">
          <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Cathay Pacific" />
        </Field>
        <Field label="Logo Image">
          <ImageUploader value={form.logoUrl} onChange={v => set("logoUrl", v ?? "")} category="homepage" />
        </Field>
        <Field label="Website URL (optional)">
          <input style={inputStyle} value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Sort Order">
          <input style={inputStyle} type="number" value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </Field>
        <Field label="Visible">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isVisible} onChange={e => set("isVisible", e.target.checked)} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 13 }}>Show on homepage</span>
          </label>
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={() => { if (!form.name || !form.logoUrl) return; onSave({ ...form, id: initial?.id }); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminHomepage() {
  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroQuery = trpc.homepage.getHero.useQuery();
  const updateHero = trpc.homepage.updateHero.useMutation({ onSuccess: () => { heroQuery.refetch(); toast.success("Hero saved"); } });
  const [heroForm, setHeroForm] = useState<{ title: string; subtitle: string; backgroundImage: string; isVisible: boolean } | null>(null);

  const hero = heroQuery.data;
  const heroEdit = heroForm ?? { title: hero?.title ?? "", subtitle: hero?.subtitle ?? "", backgroundImage: hero?.backgroundImage ?? "", isVisible: hero?.isVisible ?? true };
  const setHero = (k: string, v: any) => setHeroForm(f => ({ ...(f ?? heroEdit), [k]: v }));

  // ── Intro ─────────────────────────────────────────────────────────────────
  const introQuery = trpc.homepage.getIntro.useQuery();
  const updateIntro = trpc.homepage.updateIntro.useMutation({ onSuccess: () => { introQuery.refetch(); toast.success("Intro saved"); } });
  const [introForm, setIntroForm] = useState<{ title: string; content: string; isVisible: boolean } | null>(null);

  const intro = introQuery.data;
  const introEdit = introForm ?? { title: intro?.title ?? "", content: intro?.content ?? "", isVisible: intro?.isVisible ?? true };
  const setIntro = (k: string, v: any) => setIntroForm(f => ({ ...(f ?? introEdit), [k]: v }));

  // ── Image Stories Section ─────────────────────────────────────────────────
  const imageSectionQuery = trpc.homepage.getStorySection.useQuery({ sectionType: "image" });
  const updateImageSection = trpc.homepage.updateStorySection.useMutation({ onSuccess: () => { imageSectionQuery.refetch(); toast.success("Image section saved"); } });
  const [imageSectionForm, setImageSectionForm] = useState<{ title: string; subtitle: string } | null>(null);

  const imageSection = imageSectionQuery.data;
  const imageSectionEdit = imageSectionForm ?? { title: imageSection?.title ?? "Stories From the Road", subtitle: imageSection?.subtitle ?? "Real stories. Meaningful journeys." };
  const setImageSection = (k: string, v: any) => setImageSectionForm(f => ({ ...(f ?? imageSectionEdit), [k]: v }));

  const imageStoriesQuery = trpc.homepage.listStoriesByType.useQuery({ type: "image" });
  const createImageStory = trpc.homepage.createStory.useMutation({ onSuccess: () => { imageStoriesQuery.refetch(); setImageStoryModal(null); toast.success("Image card added"); } });
  const updateImageStory = trpc.homepage.updateStory.useMutation({ onSuccess: () => { imageStoriesQuery.refetch(); setImageStoryModal(null); toast.success("Image card updated"); } });
  const deleteImageStory = trpc.homepage.deleteStory.useMutation({ onSuccess: () => { imageStoriesQuery.refetch(); toast.success("Image card deleted"); } });
  const [imageStoryModal, setImageStoryModal] = useState<(ImageStoryForm & { id?: number }) | null>(null);

  // ── Video Stories Section ─────────────────────────────────────────────────
  const videoSectionQuery = trpc.homepage.getStorySection.useQuery({ sectionType: "video" });
  const updateVideoSection = trpc.homepage.updateStorySection.useMutation({ onSuccess: () => { videoSectionQuery.refetch(); toast.success("Video section saved"); } });
  const [videoSectionForm, setVideoSectionForm] = useState<{ title: string; subtitle: string } | null>(null);

  const videoSection = videoSectionQuery.data;
  const videoSectionEdit = videoSectionForm ?? { title: videoSection?.title ?? "Stories From the Road", subtitle: videoSection?.subtitle ?? "Real stories. Meaningful journeys." };
  const setVideoSection = (k: string, v: any) => setVideoSectionForm(f => ({ ...(f ?? videoSectionEdit), [k]: v }));

  const videoStoriesQuery = trpc.homepage.listStoriesByType.useQuery({ type: "video" });
  const createVideoStory = trpc.homepage.createStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); setVideoStoryModal(null); toast.success("Video card added"); } });
  const updateVideoStory = trpc.homepage.updateStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); setVideoStoryModal(null); toast.success("Video card updated"); } });
  const deleteVideoStory = trpc.homepage.deleteStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); toast.success("Video card deleted"); } });
  const [videoStoryModal, setVideoStoryModal] = useState<(VideoStoryForm & { id?: number }) | null>(null);

  // ── Sponsors ──────────────────────────────────────────────────────────────
  const sponsorsQuery = trpc.homepage.listSponsors.useQuery();
  const createSponsor = trpc.homepage.createSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); setSponsorModal(null); toast.success("Sponsor added"); } });
  const updateSponsor = trpc.homepage.updateSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); setSponsorModal(null); toast.success("Sponsor updated"); } });
  const deleteSponsor = trpc.homepage.deleteSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); toast.success("Sponsor deleted"); } });
  const [sponsorModal, setSponsorModal] = useState<(SponsorForm & { id?: number }) | null>(null);

  const imageStories = imageStoriesQuery.data ?? [];
  const videoStories = videoStoriesQuery.data ?? [];
  const sponsors = sponsorsQuery.data ?? [];

  const handleImageStorySave = (data: ImageStoryForm & { id?: number }) => {
    if (data.id) {
      updateImageStory.mutate({ id: data.id, title: data.title, thumbnailUrl: data.thumbnailUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    } else {
      createImageStory.mutate({ title: data.title, type: "image", thumbnailUrl: data.thumbnailUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    }
  };

  const handleVideoStorySave = (data: VideoStoryForm & { id?: number }) => {
    if (data.id) {
      updateVideoStory.mutate({ id: data.id, title: data.title, youtubeId: data.youtubeId || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    } else {
      createVideoStory.mutate({ title: data.title, type: "video", youtubeId: data.youtubeId || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    }
  };

  const handleSponsorSave = (data: SponsorForm & { id?: number }) => {
    if (data.id) {
      updateSponsor.mutate({ id: data.id, name: data.name, logoUrl: data.logoUrl, websiteUrl: data.websiteUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    } else {
      createSponsor.mutate({ name: data.name, logoUrl: data.logoUrl, websiteUrl: data.websiteUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    }
  };

  return (
    <AdminLayout title="Homepage Management">
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", fontFamily: "Lato, sans-serif" }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Hero Banner"
          visible={heroEdit.isVisible}
          onToggle={() => { setHero("isVisible", !heroEdit.isVisible); updateHero.mutate({ isVisible: !heroEdit.isVisible }); }}
        />
        <Field label="Background Image">
          <ImageUploader value={heroEdit.backgroundImage} onChange={v => setHero("backgroundImage", v ?? "")} category="homepage" />
        </Field>
        <Field label="Main Title">
          <input style={inputStyle} value={heroEdit.title} onChange={e => setHero("title", e.target.value)} placeholder="THE LUXURY TRAVEL EXPERTS" />
        </Field>
        <Field label="Subtitle / Description">
          <input style={inputStyle} value={heroEdit.subtitle} onChange={e => setHero("subtitle", e.target.value)} placeholder="TAILOR-MADE TRIPS, AWARD WINNING SERVICE. EST. 2005." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnPrimary} onClick={() => updateHero.mutate({ title: heroEdit.title, subtitle: heroEdit.subtitle, backgroundImage: heroEdit.backgroundImage || null, isVisible: heroEdit.isVisible })}>
            Save Hero
          </button>
        </div>
      </div>

      {/* ── Intro Section ───────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Introduction Section"
          visible={introEdit.isVisible}
          onToggle={() => { setIntro("isVisible", !introEdit.isVisible); updateIntro.mutate({ isVisible: !introEdit.isVisible }); }}
        />
        <Field label="Title">
          <input style={inputStyle} value={introEdit.title} onChange={e => setIntro("title", e.target.value)} placeholder="Section title" />
        </Field>
        <Field label="Content">
          <textarea style={textareaStyle} value={introEdit.content} onChange={e => setIntro("content", e.target.value)} placeholder="Introduction text..." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnPrimary} onClick={() => updateIntro.mutate({ title: introEdit.title, content: introEdit.content, isVisible: introEdit.isVisible })}>
            Save Intro
          </button>
        </div>
      </div>

      {/* ── Section 1: Image Stories ─────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 4px 0" }}>
            Section 1 — Image Stories
          </h2>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: 0 }}>
            Pure image carousel. No play button. Drag to scroll.
          </p>
        </div>

        {/* Section title/subtitle edit */}
        <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 6, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
            Section Heading
          </div>
          <Field label="Section Title">
            <input style={inputStyle} value={imageSectionEdit.title} onChange={e => setImageSection("title", e.target.value)} placeholder="Stories From the Road" />
          </Field>
          <Field label="Section Subtitle">
            <input style={inputStyle} value={imageSectionEdit.subtitle} onChange={e => setImageSection("subtitle", e.target.value)} placeholder="Real stories. Meaningful journeys." />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btnPrimary} onClick={() => updateImageSection.mutate({ sectionType: "image", title: imageSectionEdit.title, subtitle: imageSectionEdit.subtitle })}>
              Save Heading
            </button>
          </div>
        </div>

        {/* Image cards list */}
        <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
          Image Cards
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {imageStories.length === 0 && (
            <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
              No image cards yet. Add one below.
            </div>
          )}
          {imageStories.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid #f0f0f0", borderRadius: 6, background: "#fafafa" }}>
              {s.image && (
                <img src={s.image} alt={s.name} style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, color: "#aaa", marginTop: 2 }}>Image card</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: s.isVisible ? "#F5569B" : "#aaa", fontFamily: "Lato, sans-serif", fontWeight: 600 }}>
                  {s.isVisible ? "Visible" : "Hidden"}
                </span>
                <button style={btnSecondary} onClick={() => setImageStoryModal({ id: s.id, title: s.name, thumbnailUrl: s.image ?? "", isVisible: s.isVisible ?? true, sortOrder: s.sortOrder ?? 0 })}>Edit</button>
                <button style={btnDanger} onClick={() => { if (confirm("Delete this image card?")) deleteImageStory.mutate({ id: s.id }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button style={btnPrimary} onClick={() => setImageStoryModal(emptyImageStory)}>+ Add Image Card</button>
      </div>

      {/* ── Section 2: Video Stories ─────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#1a1a1a", textTransform: "uppercase", margin: "0 0 4px 0" }}>
            Section 2 — Video Stories
          </h2>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: 0 }}>
            YouTube video carousel. Click to play. Auto-fetches cover from YouTube.
          </p>
        </div>

        {/* Section title/subtitle edit */}
        <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 6, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
            Section Heading
          </div>
          <Field label="Section Title">
            <input style={inputStyle} value={videoSectionEdit.title} onChange={e => setVideoSection("title", e.target.value)} placeholder="Stories From the Road" />
          </Field>
          <Field label="Section Subtitle">
            <input style={inputStyle} value={videoSectionEdit.subtitle} onChange={e => setVideoSection("subtitle", e.target.value)} placeholder="Real stories. Meaningful journeys." />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btnPrimary} onClick={() => updateVideoSection.mutate({ sectionType: "video", title: videoSectionEdit.title, subtitle: videoSectionEdit.subtitle })}>
              Save Heading
            </button>
          </div>
        </div>

        {/* Video cards list */}
        <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
          Video Cards
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {videoStories.length === 0 && (
            <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
              No video cards yet. Add one below.
            </div>
          )}
          {videoStories.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid #f0f0f0", borderRadius: 6, background: "#fafafa" }}>
              {s.videoId && (
                <img
                  src={`https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`}
                  alt={s.name}
                  style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                {s.videoId && <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, color: "#888", marginTop: 2 }}>YouTube: {s.videoId}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: s.isVisible ? "#F5569B" : "#aaa", fontFamily: "Lato, sans-serif", fontWeight: 600 }}>
                  {s.isVisible ? "Visible" : "Hidden"}
                </span>
                <button style={btnSecondary} onClick={() => setVideoStoryModal({ id: s.id, title: s.name, youtubeId: s.videoId ?? "", thumbnailUrl: s.image ?? "", isVisible: s.isVisible ?? true, sortOrder: s.sortOrder ?? 0 })}>Edit</button>
                <button style={btnDanger} onClick={() => { if (confirm("Delete this video card?")) deleteVideoStory.mutate({ id: s.id }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button style={btnPrimary} onClick={() => setVideoStoryModal(emptyVideoStory)}>+ Add Video Card</button>
      </div>

      {/* ── Sponsors ────────────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader title="Sponsor Logos" visible={true} onToggle={() => {}} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {sponsors.length === 0 && (
            <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "20px 0", width: "100%", textAlign: "center" }}>
              No sponsors yet. Add one below.
            </div>
          )}
          {sponsors.map(sp => (
            <div key={sp.id} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 12, background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 140 }}>
              {sp.logo && <img src={sp.logo} alt={sp.name} style={{ width: 80, height: 48, objectFit: "contain" }} />}
              <div style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#1a1a1a", fontWeight: 600, textAlign: "center" }}>{sp.name}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ ...btnSecondary, padding: "5px 10px", fontSize: 11 }} onClick={() => setSponsorModal({ id: sp.id, name: sp.name, logoUrl: sp.logo ?? "", websiteUrl: sp.url ?? "", isVisible: sp.isVisible ?? true, sortOrder: sp.sortOrder ?? 0 })}>Edit</button>
                <button style={{ ...btnDanger, padding: "5px 10px", fontSize: 11 }} onClick={() => { if (confirm("Delete this sponsor?")) deleteSponsor.mutate({ id: sp.id }); }}>Del</button>
              </div>
            </div>
          ))}
        </div>
        <button style={btnPrimary} onClick={() => setSponsorModal(emptySponsor)}>+ Add Sponsor</button>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {imageStoryModal !== null && (
        <ImageStoryModal initial={imageStoryModal} onSave={handleImageStorySave} onClose={() => setImageStoryModal(null)} />
      )}
      {videoStoryModal !== null && (
        <VideoStoryModal initial={videoStoryModal} onSave={handleVideoStorySave} onClose={() => setVideoStoryModal(null)} />
      )}
      {sponsorModal !== null && (
        <SponsorModal initial={sponsorModal} onSave={handleSponsorSave} onClose={() => setSponsorModal(null)} />
      )}
    </div>
    </AdminLayout>
  );
}
