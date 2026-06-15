"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/site-config";
import { getCurrentUser, updateCredentials } from "@/lib/auth";

export default function AdminSettingsPage() {
  const [currentUser, setCurrentUser] = useState({ username: "", password: "" });
  const [oldUsername, setOldUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const result = updateCredentials(oldUsername, oldPassword, newUsername, newPassword);
    if (result.success) {
      setMsg({ type: "success", text: "Username & password berhasil diubah!" });
      const updated = getCurrentUser();
      setCurrentUser(updated);
      setOldUsername("");
      setOldPassword("");
      setNewUsername("");
      setNewPassword("");
    } else {
      setMsg({ type: "error", text: result.error ?? "" });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Akun Admin</h2>
          <p className="text-sm text-gray-500 mb-4">
            Username saat ini: <span className="font-medium text-gray-700">{currentUser.username}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username Lama
              </label>
              <input
                type="text"
                value={oldUsername}
                onChange={(e) => setOldUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password Lama
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
                required
              />
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username Baru
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none"
                required
              />
            </div>
            {msg && (
              <p
                className={`text-sm ${
                  msg.type === "success" ? "text-green-600" : "text-red-500"
                }`}
              >
                {msg.text}
              </p>
            )}
            <button
              type="submit"
              className="bg-bekon-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bekon-gold/90 transition-colors"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Perusahaan</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                defaultValue={siteConfig.fullName}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Alamat
              </label>
              <input
                type="text"
                defaultValue={siteConfig.address}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Telepon
              </label>
              <input
                type="text"
                defaultValue={siteConfig.phone1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="text"
                defaultValue={siteConfig.email}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">WhatsApp & Kontak</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                WA Admin 1
              </label>
              <input
                type="text"
                defaultValue={siteConfig.whatsapp1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                WA Admin 2
              </label>
              <input
                type="text"
                defaultValue={siteConfig.whatsapp2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
