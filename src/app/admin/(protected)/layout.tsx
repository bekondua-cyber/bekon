"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const loggedIn = isAuthenticated();

  useEffect(() => {
    if (!loggedIn) {
      router.push("/admin/login");
    }
  }, [loggedIn, router]);

  if (!loggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
