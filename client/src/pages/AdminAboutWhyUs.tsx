import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { trpc } from '@/lib/trpc';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '16px' }}>
      <span style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#777', marginBottom: '6px' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' };
const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight: '100px', resize: 'vertical' };

interface SectionForm {
  title: string;
  content: string;
  image: string;
  sortOrder: number;
}

const emptySection: SectionForm = { title: '', content: '', image: '', sortOrder: 0 };

function SectionFormPanel({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: Partial<SectionForm>;
  onSubmit: (data: SectionForm) => void;
  onCancel?: () => void;
  isPending?: boolean;
}) {
  const [form, setForm] = React.useState<SectionForm>({ ...emptySection, ...initial });
  const update = <K extends keyof SectionForm>(key: K, value: SectionForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      style={{ background: '#fff', border: '1px solid #e5e5e5', padding: '24px', marginBottom: '20px' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
        <Field label="Title">
          <input value={form.title} onChange={e => update('title', e.target.value)} style={inputStyle} required />
        </Field>
        <Field label="Sort Order">
          <input type="number" value={form.sortOrder} onChange={e => update('sortOrder', Number(e.target.value))} style={{ ...inputStyle, width: '90px' }} />
        </Field>
      </div>
      <Field label="Content">
        <textarea value={form.content} onChange={e => update('content', e.target.value)} style={textAreaStyle} required />
      </Field>
      <ImageUploader
        label="Section Image"
        value={form.image}
        onChange={value => update('image', value)}
        category="about"
        source="why-us"
        sourceLabel={form.title || 'Why Us Section'}
        sourceUrl="/about/why-us"
      />
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{ background: '#111', color: '#fff', border: 0, padding: '10px 18px', cursor: 'pointer' }}
        >
          {isPending ? 'Saving...' : 'Save Section'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#f3f3f3', color: '#333', border: '1px solid #ddd', padding: '10px 18px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminAboutWhyUs() {
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.about.listWhyUsSections.useQuery();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  const invalidate = () => utils.about.listWhyUsSections.invalidate();

  const createMutation = trpc.about.createWhyUsSection.useMutation({
    onSuccess: () => { invalidate(); setShowCreate(false); },
  });
  const updateMutation = trpc.about.updateWhyUsSection.useMutation({
    onSuccess: () => { invalidate(); setEditingId(null); },
  });
  const deleteMutation = trpc.about.deleteWhyUsSection.useMutation({ onSuccess: invalidate });

  return (
    <AdminLayout title="Why Us?">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <a
            href="/admin/about"
            style={{ fontSize: '12px', color: '#999', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}
          >
            ← Back to About
          </a>
          <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontWeight: 400 }}>Why Us? Sections</h1>
          <p style={{ color: '#777', marginTop: '6px' }}>
            Manage the sections displayed on the <strong>/about/why-us</strong> page. Each section has a title, content, and image.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ background: '#F5569B', color: '#fff', border: 0, padding: '11px 18px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '12px' }}
        >
          + Add Section
        </button>
      </div>

      {showCreate && (
        <SectionFormPanel
          onSubmit={data => createMutation.mutate({ ...data, image: data.image || undefined })}
          onCancel={() => setShowCreate(false)}
          isPending={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <p style={{ color: '#999' }}>Loading...</p>
      ) : sections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <p style={{ fontSize: '14px' }}>No sections yet. Click "+ Add Section" to get started.</p>
        </div>
      ) : (
        sections.map((section, idx) => (
          <div key={section.id} style={{ background: '#fff', border: '1px solid #e5e5e5', marginBottom: '14px' }}>
            {editingId === section.id ? (
              <div style={{ padding: '0' }}>
                <SectionFormPanel
                  initial={{
                    title: section.title,
                    content: section.content,
                    image: section.image || '',
                    sortOrder: section.sortOrder ?? idx,
                  }}
                  onSubmit={data => updateMutation.mutate({ id: section.id, ...data, image: data.image || undefined })}
                  onCancel={() => setEditingId(null)}
                  isPending={updateMutation.isPending}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center', padding: '18px' }}>
                {section.image ? (
                  <img
                    src={section.image}
                    alt={section.title}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '60px', background: '#f2f2f2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Image</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#c8b89a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Georgia, serif', fontWeight: 400 }}>{section.title}</h3>
                  </div>
                  <p style={{ margin: 0, color: '#777', fontSize: '13px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {section.content}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => setEditingId(section.id)}
                    style={{ border: '1px solid #ddd', background: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this section?')) deleteMutation.mutate({ id: section.id }); }}
                    style={{ border: '1px solid #f1c5c5', color: '#b00020', background: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </AdminLayout>
  );
}
