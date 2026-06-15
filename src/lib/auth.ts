"use client";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "bekon123";

function getCreds() {
  if (typeof window === "undefined") {
    return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  }
  const stored = localStorage.getItem("bekon_creds");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
    }
  }
  return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
}

function saveCreds(username: string, password: string) {
  localStorage.setItem("bekon_creds", JSON.stringify({ username, password }));
}

export function getCurrentUser() {
  return getCreds();
}

export function login(username: string, password: string) {
  const creds = getCreds();
  if (username === creds.username && password === creds.password) {
    if (typeof window !== "undefined") {
      localStorage.setItem("bekon_admin", "true");
    }
    return { success: true };
  }
  return { success: false, error: "Username atau password salah" };
}

export function updateCredentials(
  oldUsername: string,
  oldPassword: string,
  newUsername: string,
  newPassword: string
) {
  const creds = getCreds();
  if (oldUsername !== creds.username || oldPassword !== creds.password) {
    return { success: false, error: "Username / password lama tidak cocok" };
  }
  if (!newUsername || !newPassword) {
    return { success: false, error: "Username dan password baru harus diisi" };
  }
  saveCreds(newUsername, newPassword);
  return { success: true };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bekon_admin");
  }
}

export function isAuthenticated() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bekon_admin") === "true";
  }
  return false;
}
