"use client";

import { useState, useRef } from "react";
import { Camera, Save, Lock, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setUser } from "@/store/slices/authSlice";
import { PageHeader } from "@/components/layout/page-header";
import apiClient from "@/lib/api-client";

export function ProfilePage({ backHref }: { backHref?: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar?.url || null,
  );
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setAvatarPreview(base64);
      setAvatarFile(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setProfileMsg({
        type: "error",
        text: "Name must be at least 2 characters",
      });
      return;
    }

    setProfileLoading(true);
    setProfileMsg({ type: "", text: "" });

    try {
      let avatarData: { url: string; public_id: string } | null | undefined =
        undefined;

      // If a new file was selected, upload it first
      if (avatarFile) {
        const uploadRes = await apiClient.post("/upload", {
          image: avatarFile,
          folder: "avatars",
        });
        avatarData = uploadRes.data.data;
      }

      const payload: {
        name: string;
        avatar?: { url: string; public_id: string } | null;
      } = {
        name: name.trim(),
      };
      if (avatarData !== undefined) {
        payload.avatar = avatarData;
      }

      const { data } = await apiClient.patch("/auth/profile", payload);
      dispatch(setUser(data.data));
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.data));
      }
      setAvatarFile(null);
      setProfileMsg({ type: "success", text: "Profile updated successfully" });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Current password is required" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: "", text: "" });

    try {
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({
        type: "success",
        text: "Password changed successfully",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account settings" backHref={backHref} />

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Info Card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.replace("-", " ")}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Read-only fields */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <input
                type="text"
                value={user.phone}
                disabled
                className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Role</label>
              <input
                type="text"
                value={user.role.replace("-", " ")}
                disabled
                className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground capitalize cursor-not-allowed"
              />
            </div>
          </div>

          {profileMsg.text && (
            <p
              className={`mt-3 text-sm ${profileMsg.type === "error" ? "text-destructive" : "text-green-600"}`}
            >
              {profileMsg.text}
            </p>
          )}

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Change Password Card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {passwordMsg.text && (
            <p
              className={`mt-3 text-sm ${passwordMsg.type === "error" ? "text-destructive" : "text-green-600"}`}
            >
              {passwordMsg.text}
            </p>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Lock className="h-4 w-4" />
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
