"use client";

export function isAuthenticated() {
  if (typeof window === "undefined") return false
  return !!document.cookie
    .split("; ")
    .find((c) => c.startsWith("next-auth.session-token=") || c.startsWith("__Secure-next-auth.session-token="))
}

export function logout() {
  import("next-auth/react").then(({ signOut }) => {
    signOut({ callbackUrl: "/admin/login" })
  })
}
