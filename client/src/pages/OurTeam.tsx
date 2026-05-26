import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio1?: string | null;
  bio2?: string | null;
  quote?: string | null;
  image?: string | null;
  specialty?: string | null;
  storyTitle?: string | null;
  storySubtitle?: string | null;
  storyText?: string | null;
  storyImage?: string | null;
  storyImage2?: string | null;
}


const bioStyle: React.CSSProperties = {
  color: '#333',
  fontSize: 'clamp(14px, 1.3vw, 16px)',
  lineHeight: 1.8,
  fontWeight: 300,
};

const quoteTextStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 'clamp(14px, 1.4vw, 17px)',
  fontWeight: 700,
  color: '#2a7a6a',
  lineHeight: 1.55,
  margin: 0,
  fontStyle: 'normal',
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function TeamMemberSection({ member, index }: { member: TeamMember; index: number }) {
  const mirrored = index % 2 === 1;
  const layoutClass = mirrored ? 'layout-mirror' : 'layout-normal';
  const storyClass = mirrored ? 'story-mirror' : 'story-normal';

  const photo = (
    <div className="ot-photo-col" style={{ flex: '0 0 27vw', maxWidth: '425px', aspectRatio: '425 / 525', marginTop: '-65px', position: 'relative', zIndex: 2 }}>
      {member.image && <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />}
    </div>
  );

  const text = (
    <div className="ot-text-col" style={{ flex: '1 1 0', paddingTop: '40px', minWidth: 0 }}>
      <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.05, letterSpacing: '-0.01em', margin: '0 0 10px' }}>{member.name}</h1>
      <p style={{ color: '#555', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 28px', fontWeight: 400 }}>{member.role}</p>
      {member.bio1 && <p style={{ ...bioStyle, margin: '0 0 18px' }}>{member.bio1}</p>}
      {member.bio2 && <p style={{ ...bioStyle, margin: 0 }}>{member.bio2}</p>}
      {member.specialty && <p style={{ color: '#2a7a6a', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '26px 0 0' }}>{member.specialty}</p>}
    </div>
  );

  const quote = (
    <div className="ot-quote-col" style={{ flexShrink: 0, width: 'clamp(160px, 18vw, 220px)', paddingTop: '151px' }}>
      {member.quote && <p style={quoteTextStyle}>{member.quote}</p>}
    </div>
  );

  return (
    <>
      {index > 0 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 60px)' }}>
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #c8bfb0 20%, #c8bfb0 80%, transparent)' }} />
        </div>
      )}
      <div id={`member-${slugify(member.name)}`} style={{ background: '#f5f2ee', position: 'relative', paddingBottom: '80px', paddingTop: index > 0 ? '0' : undefined }}>
        <div className={`ot-three-col ${layoutClass}`} style={{ display: 'flex', maxWidth: '100%', margin: '0', gap: 'clamp(24px, 4vw, 56px)' }}>
          {mirrored ? <>{quote}{text}{photo}</> : <>{photo}{text}{quote}</>}
        </div>

        <div className={`ot-story-row ${storyClass}`} style={{ maxWidth: '1200px', margin: '72px auto 0', padding: '0 clamp(24px, 5vw, 60px)', gap: 'clamp(32px, 5vw, 72px)' }}>
          {mirrored && <StoryImages member={member} mirrored />}
          <StoryText member={member} />
          {!mirrored && <StoryImages member={member} />}
        </div>
      </div>
    </>
  );
}

function StoryText({ member }: { member: TeamMember }) {
  return (
    <div className="ot-story-text" style={{ flex: '0 0 auto', width: 'clamp(260px, 35vw, 420px)' }}>
      {member.storyTitle && <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{member.storyTitle}</h2>}
      {member.storySubtitle && <p style={{ color: '#888', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>{member.storySubtitle}</p>}
      {member.storyText && <p style={{ ...bioStyle, color: '#444', margin: 0 }}>{member.storyText}</p>}
    </div>
  );
}

function StoryImages({ member, mirrored = false }: { member: TeamMember; mirrored?: boolean }) {
  return (
    <div className="ot-story-images" style={{ flex: 1, minWidth: 0, position: 'relative', height: 'clamp(280px, 32vw, 420px)' }}>
      {member.storyImage && <img src={member.storyImage} alt={member.storySubtitle || member.name} style={{ position: 'absolute', top: 0, [mirrored ? 'left' : 'right']: 0, width: '72%', height: '78%', objectFit: 'cover', display: 'block', zIndex: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }} />}
      {member.storyImage2 && <img src={member.storyImage2} alt={member.name} style={{ position: 'absolute', bottom: 0, [mirrored ? 'right' : 'left']: 0, width: '55%', height: '82%', objectFit: 'cover', objectPosition: 'top center', display: 'block', zIndex: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />}
    </div>
  );
}

export default function OurTeam() {
  const { data } = trpc.cms.listTeamMembers.useQuery(undefined, { retry: false });
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const ctaBg = homepageAssets?.cta?.url;
  const members = data ?? [];

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f5f2ee', minHeight: '100vh' }}>
      <style>{`
        .ot-three-col { padding-left: clamp(28px, calc(-645px + 49.82vw), 305px); padding-right: clamp(24px, 5vw, 60px); flex-wrap: nowrap; align-items: flex-start; }
        .ot-three-col.layout-normal .ot-photo-col { order: 1; }
        .ot-three-col.layout-normal .ot-text-col { order: 2; }
        .ot-three-col.layout-normal .ot-quote-col { order: 3; }
        .ot-three-col.layout-mirror .ot-quote-col { order: 1; }
        .ot-three-col.layout-mirror .ot-text-col { order: 2; }
        .ot-three-col.layout-mirror .ot-photo-col { order: 3; }
        .ot-story-row { display: flex; align-items: center; }
        .ot-story-row.story-normal .ot-story-text { order: 1; }
        .ot-story-row.story-normal .ot-story-images { order: 2; }
        .ot-story-row.story-mirror .ot-story-images { order: 1; }
        .ot-story-row.story-mirror .ot-story-text { order: 2; }
        @media (min-width: 768px) and (max-width: 1024px) {
          .ot-three-col { display: grid !important; grid-template-rows: auto auto !important; padding-left: 20px !important; padding-right: 20px !important; gap: 20px 30px !important; align-items: start !important; }
          .ot-three-col.layout-normal { grid-template-columns: 38vw 1fr !important; grid-template-areas: "photo text" "quote text" !important; }
          .ot-three-col.layout-mirror { grid-template-columns: 1fr 38vw !important; grid-template-areas: "text photo" "text quote" !important; }
          .ot-three-col.layout-normal .ot-photo-col, .ot-three-col.layout-mirror .ot-photo-col { grid-area: photo !important; }
          .ot-three-col.layout-normal .ot-quote-col, .ot-three-col.layout-mirror .ot-quote-col { grid-area: quote !important; }
          .ot-three-col.layout-normal .ot-text-col, .ot-three-col.layout-mirror .ot-text-col { grid-area: text !important; }
          .ot-photo-col { flex: unset !important; max-width: 360px !important; width: 100% !important; aspect-ratio: 425 / 525 !important; margin-top: -65px !important; margin-bottom: 0 !important; }
          .ot-quote-col { flex: unset !important; width: 100% !important; padding-top: 0 !important; padding-bottom: 0 !important; }
          .ot-text-col { flex: unset !important; padding-top: 40px !important; min-width: 0 !important; align-self: start !important; }
          .ot-story-row { flex-direction: row !important; gap: clamp(24px, 4vw, 48px) !important; align-items: center !important; }
          .ot-story-text { flex: 0 0 auto !important; width: clamp(220px, 38vw, 380px) !important; }
          .ot-story-images { flex: 1 !important; min-width: 0 !important; height: clamp(220px, 28vw, 340px) !important; }
        }
        @media (max-width: 767px) {
          .ot-three-col { flex-direction: column !important; flex-wrap: nowrap !important; align-items: center !important; padding-left: 20px !important; padding-right: 20px !important; }
          .ot-photo-col { order: 1 !important; flex: 0 0 auto !important; width: calc(100vw - 200px) !important; max-width: calc(100vw - 200px) !important; margin-top: -98px !important; margin-bottom: 0 !important; align-self: center !important; aspect-ratio: 425 / 525 !important; }
          .ot-text-col { order: 2 !important; padding-top: 24px !important; width: 100% !important; flex: unset !important; }
          .ot-quote-col { order: 3 !important; flex: unset !important; width: 100% !important; max-width: 100% !important; padding-top: 0 !important; padding-bottom: 24px !important; }
          .ot-story-row { flex-direction: column !important; gap: 32px !important; }
          .ot-story-text { order: 1 !important; width: 100% !important; }
          .ot-story-images { order: 2 !important; width: 100% !important; flex: unset !important; min-width: 0 !important; height: clamp(220px, 55vw, 320px) !important; }
        }
      `}</style>
      <Navigation />
      <div style={{ height: '218px', background: '#3d9e8c', position: 'relative', overflow: 'hidden' }}>
        {ctaBg && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${ctaBg})`,
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat',
            opacity: 0.65,
            mixBlendMode: 'multiply',
          }} />
        )}
        {/* Hidden image to detect if texture loads */}
        {ctaBg && (
          <img
            src={ctaBg}
            alt=""
            style={{ display: 'none' }}
          />
        )}
      </div>
      {members.map((member, index) => <TeamMemberSection key={member.id} member={member} index={index} />)}
      <Footer />
    </div>
  );
}
