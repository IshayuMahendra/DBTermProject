"use client";

import React, { useState } from "react";
import { useUser } from "@/app/provider/userProvider";
import "@/app/styles/global_styles.css";

const SettingsPage: React.FC = () => {
  const { user, isLoggedIn } = useUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="w-full flex justify-center p-6">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-2xl font-mono mb-4">Settings</h1>
          <p>You must be logged in to change your password.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErr("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/update-password`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,  
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        }
      );

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // backend might return plain text; ignore parse error
      }

      if (!res.ok) {
        setErr(data.message ?? "Failed to update password.");
        return;
      }

      setMsg(data.message ?? "Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setErr(error.message ?? "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full md:w-2/3 lg:w-1/2 space-y-8">
        <h1 className="text-2xl font-mono mb-4">Settings</h1>

        {/* Change Password */}
        <div className="bg-[#1E4147] p-4 rounded border border-[#AAC789] text-white">
          <h2 className="text-xl mb-2">Change Password</h2>

          {err && <p className="text-red-400 mb-2">{err}</p>}
          {msg && <p className="text-green-400 mb-2">{msg}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block mb-1">Current Password</label>
              <input
                type="password"
                className="w-full rounded px-2 py-1 text-black"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">New Password</label>
              <input
                type="password"
                className="w-full rounded px-2 py-1 text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full rounded px-2 py-1 text-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="pol-button px-4 py-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;