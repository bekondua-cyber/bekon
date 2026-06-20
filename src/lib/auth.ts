"use client";

export function isAuthenticated() {
  if (typeof window === "undefined") return false
  return !!document.cookie
    .split("; ")
    .find((c) => c.startsWith("next-auth.session-token=") || c.startsWith("__Secure-next-auth.session-token="))
}

export async function logout() {
  const { signOut } = await import("next-auth/react")
  await signOut({ redirect: false })
}
