import React from "react";
import { Lock } from "lucide-react";
import Card from "../../../../components/ui/card";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState } from "../../components/StateViews";
import { formatDate } from "../../utils/format";
import useProfile from "../../hooks/useProfile";

interface ProfileFieldProps {
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ marginTop: "0.3rem", fontSize: "0.95rem", color: "#e2e8f0" }}>{value || "—"}</div>
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
          <Card>
            <h3 style={{ margin: 0, color: "#63f5e8", marginBottom: "1.25rem" }}>Account Metadata</h3>
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <ProfileField label="Username" value={profile.data.username} />
              <ProfileField label="Email Address" value={profile.data.email} />
              <ProfileField
                label="Full Name"
                value={`${profile.data.first_name} ${profile.data.last_name}`.trim()}
              />
              <ProfileField label="Role" value={profile.data.role} />
              <ProfileField label="Member Since" value={formatDate(profile.data.date_joined)} />
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8", marginBottom: "0.5rem" }}>
              <Lock size={16} />
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem", letterSpacing: "0.1em" }}>
                ACCESS NOTES
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.7 }}>
              This profile is read-only. The backend does not currently expose a profile update endpoint for client
              users, so no frontend-only editing is provided. Data shown above is fetched from the live
              <span style={{ fontFamily: "IBM Plex Mono, monospace" }}> /auth/me/</span> endpoint.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default Profile;