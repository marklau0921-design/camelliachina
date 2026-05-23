import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { MapPin, Compass, Map, BookOpen, Video, Tag, Mail, ArrowRight } from "lucide-react";

const ACCENT = "#F5569B";

function StatCard({ icon: Icon, label, count, path, color = ACCENT }: {
  icon: React.ComponentType<any>;
  label: string;
  count: number | undefined;
  path: string;
  color?: string;
}) {
  return (
    <Link
      href={path}
      style={{
        display: "block",
        background: "#fff",
        padding: "24px",
        textDecoration: "none",
        transition: "box-shadow 0.18s",
        cursor: "pointer",
        border: "1px solid #eee",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ width: "40px", height: "40px", background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} style={{ color }} />
        </div>
        <ArrowRight size={14} style={{ color: "#ccc" }} />
      </div>
      <div style={{ fontSize: "28px", fontWeight: "300", color: "#1a1a1a", marginBottom: "4px" }}>
        {count ?? "—"}
      </div>
      <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>
        {label}
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data: cities = [] } = trpc.admin.listCities.useQuery();
  const { data: experiences = [] } = trpc.admin.listExperiences.useQuery();
  const { data: itineraries = [] } = trpc.admin.listItineraries.useQuery();
  const { data: stories = [] } = trpc.admin.listStories.useQuery();
  const { data: videos = [] } = trpc.admin.listVideos.useQuery();
  const { data: tags = [] } = trpc.admin.listTags.useQuery();
  const { data: enquiries = [] } = trpc.admin.listEnquiries.useQuery();

  return (
    <AdminLayout title="Dashboard">
      <div style={{ padding: "32px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
            Content Overview
          </h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
            Manage all your website content from here.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
          <StatCard icon={Mail}    label="Enquiries"   count={enquiries.length}   path="/admin/enquiries"   color="#F5569B" />
          <StatCard icon={MapPin}  label="Cities"      count={cities.length}      path="/admin/cities"      color="#c9a96e" />
          <StatCard icon={Compass} label="Experiences" count={experiences.length} path="/admin/experiences" color="#6e9ec9" />
          <StatCard icon={Map}     label="Itineraries" count={itineraries.length} path="/admin/itineraries" color="#6ec98b" />
          <StatCard icon={BookOpen}label="Stories"     count={stories.length}     path="/admin/stories"     color="#c96e9e" />
          <StatCard icon={Video}   label="Videos"      count={videos.length}      path="/admin/videos"      color="#9e6ec9" />
          <StatCard icon={Tag}     label="Tags"        count={tags.length}        path="/admin/tags"        color="#c9896e" />
        </div>

        {/* Recent enquiries */}
        {enquiries.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Recent Enquiries
              </h2>
              <Link href="/admin/enquiries" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ background: "#fff", border: "1px solid #eee" }}>
              {enquiries.slice(0, 5).map((enq, idx) => {
                const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
                return (
                  <div key={enq.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: bg, gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", background: "rgba(245,86,155,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: ACCENT }}>
                        {enq.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: "#1a1a1a" }}>{enq.firstName} {enq.lastName}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>{enq.email}</div>
                    </div>
                    {enq.destination && (
                      <span style={{ fontSize: "11px", color: "#888", background: "#fff", padding: "2px 8px" }}>{enq.destination}</span>
                    )}
                    <span style={{ fontSize: "11px", color: "#aaa", flexShrink: 0 }}>
                      {new Date(enq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
