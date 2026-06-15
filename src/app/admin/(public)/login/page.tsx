"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(username, password);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error ?? "");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">BEKON</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none text-sm"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold outline-none text-sm"
                placeholder="bekon123"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-bekon-gold text-white py-2.5 rounded-lg font-medium hover:bg-bekon-gold/90 transition-colors text-sm"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
