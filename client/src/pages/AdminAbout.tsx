import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const SLUG_TO_EDIT_PATH: Record<string, string> = {
  'our-team': '/admin/about/our-team',
  'why-us': '/admin/about/why-us',
};

export default function AdminAbout() {
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.about.listSections.useQuery();
  const [showAdd, setShowAdd] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  const invalidate = () => utils.about.listSections.invalidate();

  const createMutation = trpc.about.createSection.useMutation({
    onSuccess: () => { invalidate(); setShowAdd(false); setNewName(''); },
  });
  const updateMutation = trpc.about.updateSection.useMutation({ onSuccess: invalidate });
  const deleteMutation = trpc.about.deleteSection.useMutation({ onSuccess: invalidate });

  const toggleVisible = (id: number, current: boolean) => {
    updateMutation.mutate({ id, isVisible: !current });
  };

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const getEditPath = (section: { slug: string | null; name: string }) => {
    const slug = section.slug || slugify(section.name);
    return SLUG_TO_EDIT_PATH[slug] ?? null;
  };

  return (
    <AdminLayout title="About">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontWeight: 400 }}>About Page</h1>
          <p style={{ color: '#777', marginTop: '6px' }}>
            Manage the sections shown in the About menu. Toggle visibility and click Edit to update content.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: '#F5569B', color: '#fff', border: 0, padding: '11px 18px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '12px' }}
        >
          + Add Section
        </button>
      </div>

      {/* Add section form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', padding: '20px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#555' }}>Enter the name for the new About section:</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Our Story"
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px' }}
              onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate({ name: newName.trim(), slug: slugify(newName.trim()) }); }}
            />
            <button
              onClick={() => { if (newName.trim()) createMutation.mutate({ name: newName.trim(), slug: slugify(newName.trim()) }); }}
              disabled={createMutation.isPending || !newName.trim()}
              style={{ background: '#111', color: '#fff', border: 0, padding: '10px 18px', cursor: 'pointer' }}
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); }}
              style={{ background: '#f3f3f3', color: '#333', border: '1px solid #ddd', padding: '10px 18px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#999' }}>Loading...</p>
      ) : (
        <div>
          {sections.map(section => {
            const editPath = getEditPath(section);
            return (
              <div
                key={section.id}
                style={{ background: '#fff', border: '1px solid #e5e5e5', marginBottom: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                {/* Drag handle placeholder */}
                <span style={{ color: '#ccc', fontSize: '18px', cursor: 'grab', userSelect: 'none' }}>⠿</span>

                {/* Section name */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Georgia, serif', fontWeight: 400 }}>{section.name}</h3>
                  {section.slug && (
                    <span style={{ fontSize: '11px', color: '#bbb', letterSpacing: '0.08em' }}>/about/{section.slug}</span>
                  )}
                </div>

                {/* Show on page toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#777' }}>Show on page</span>
                  <button
                    onClick={() => toggleVisible(section.id, section.isVisible ?? true)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: section.isVisible ? '#F5569B' : '#ddd',
                      position: 'relative', transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                    title={section.isVisible ? 'Hide from page' : 'Show on page'}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: section.isVisible ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Edit button */}
                {editPath ? (
                  <a
                    href={editPath}
                    style={{ border: '1px solid #ddd', background: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', textDecoration: 'none', color: '#333', display: 'inline-block' }}
                  >
                    Edit
                  </a>
                ) : (
                  <button
                    disabled
                    style={{ border: '1px solid #eee', background: '#fafafa', padding: '8px 14px', fontSize: '13px', color: '#bbb', cursor: 'not-allowed' }}
                    title="No editor available for this section yet"
                  >
                    Edit
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => { if (confirm(`Delete "${section.name}"?`)) deleteMutation.mutate({ id: section.id }); }}
                  style={{ border: '1px solid #f1c5c5', color: '#b00020', background: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Delete
                </button>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <p style={{ fontSize: '14px' }}>No sections yet. Click "+ Add Section" to get started.</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
