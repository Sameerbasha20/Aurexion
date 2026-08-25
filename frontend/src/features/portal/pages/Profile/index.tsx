import React, { useState } from "react";
import { Lock, UserCheck, Shield, Mail, Calendar, User, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState } from "../../components/StateViews";
import { formatDate } from "../../utils/format";
import useProfile from "../../hooks/useProfile";
import axiosClient from "../../../../api/axiosClient";

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

          {/* Security & Password Management Card */}
          <Card
            borderAccent
            style={{
              backgroundColor: "rgba(8, 14, 26, 0.9)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8" }}>
              <Lock size={18} />
              <h3 style={{ margin: 0, color: "#63f5e8", fontSize: "1.1rem" }}>Security & Change Password</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
              Update your account password. For maximum security, use a combination of uppercase letters, numbers, and special characters.
            </p>

            <ChangePasswordForm />
          </Card>
        </>
      ) : null}
    </div>
  );
};

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosClient.post("auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(response.data?.detail || "Password changed successfully! Please use your new password on your next login.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {success && (
        <div style={{
          padding: "0.75rem 1rem",
          backgroundColor: "rgba(74, 222, 128, 0.12)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          borderRadius: "6px",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#ef4444",
          borderRadius: "6px",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
            Current Password *
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              padding: "0.6rem 0.85rem",
              backgroundColor: "#050811",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
            New Password *
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              padding: "0.6rem 0.85rem",
              backgroundColor: "#050811",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", textTransform: "uppercase" }}>
            Confirm New Password *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              padding: "0.6rem 0.85rem",
              backgroundColor: "#050811",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <Button glow type="submit" disabled={isLoading} style={{ minWidth: "160px" }}>
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
};

export default Profile;