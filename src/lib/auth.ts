"use client";

export function isAuthenticated() {
  if (typeof window === "undefined") return false
  return !!document.cookie
    .split("; ")
    .find((c) => c.startsWith("next-auth.session-token=") || c.startsWith("__Secure-next-auth.session-token="))
}

export function getCurrentUser() {
  return { username: "Admin", password: "" }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateCredentials(_oldUsername: string, _oldPassword: string, _newUsername: string, _newPassword: string) {
  return { success: true, error: "Fitur ini akan diintegrasikan dengan database" }
}

export function logout() {
  import("next-auth/react").then(({ signOut }) => {
    signOut({ callbackUrl: "/admin/login" })
  })
}
