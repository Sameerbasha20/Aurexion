import React from "react";
import { Lock, UserCheck, Shield, Mail, Calendar, User } from "lucide-react";
import Card from "../../../../components/ui/card";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState } from "../../components/StateViews";
import { formatDate } from "../../utils/format";
import useProfile from "../../hooks/useProfile";

interface ProfileFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, icon }) => (
  <div
    style={{
      backgroundColor: "rgba(5, 8, 17, 0.6)",
      border: "1px solid #1e293b",
      borderRadius: "6px",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.72rem",
        color: "#64748b",
        fontFamily: "IBM Plex Mono, monospace",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
    <div
      style={{
        fontSize: "0.95rem",
        color: "#e2e8f0",
        fontWeight: 500,
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </div>
  </div>
);

export const Profile: React.FC = () => {
  const profile = useProfile();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="IDENTITY SCOPE"
        title="Client Profile"
        description="Account information associated with your client login."
      />

      {profile.isLoading ? (
        <LoadingState rows={3} label="Loading profile" />
      ) : profile.isError ? (
        <ErrorState error={profile.error} onRetry={profile.refetch} title="Unable to load profile" />
      ) : profile.data ? (
        <>
          <Card glowOnHover style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserCheck size={18} style={{ color: "#63f5e8" }} />
              <h3 style={{ margin: 0, color: "#63f5e8", fontSize: "1.1rem" }}>Account Metadata</h3>
            </div>
            <div
              style={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <ProfileField
                label="Username"
                value={profile.data.username}
                icon={<User size={13} style={{ color: "#63f5e8" }} />}
              />
              <ProfileField
                label="Email Address"
                value={profile.data.email}
                icon={<Mail size={13} style={{ color: "#63f5e8" }} />}
              />
              <ProfileField
                label="Full Name"
                value={`${profile.data.first_name || ""} ${profile.data.last_name || ""}`.trim()}
                icon={<UserCheck size={13} style={{ color: "#63f5e8" }} />}
              />
              <ProfileField
                label="Role"
                value={profile.data.role}
                icon={<Shield size={13} style={{ color: "#63f5e8" }} />}
              />
              <ProfileField
                label="Member Since"
                value={formatDate(profile.data.date_joined)}
                icon={<Calendar size={13} style={{ color: "#63f5e8" }} />}
              />
            </div>
          </Card>

          <Card
            style={{
              backgroundColor: "rgba(8, 14, 26, 0.7)",
              border: "1px solid #1e293b",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8" }}>
              <Lock size={16} />
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 600 }}>
                ACCESS NOTES
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.7 }}>
              This profile is read-only. The backend does not currently expose a profile update endpoint for client
              users, so no frontend-only editing is provided. Data shown above is fetched from the live
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}> /auth/me/</span> endpoint.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default Profile;