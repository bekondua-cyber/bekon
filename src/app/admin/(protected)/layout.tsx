"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Toaster } from "sonner";
import { AdminSidebar } from "./admin-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main id="main" tabIndex={-1} className="flex-1 ml-64 p-8">
        {children}
      </main>
      {/* WAJIB ADA. Seluruh admin memakai `toast.success/error` dari sonner —
          178 pemanggilan — tapi sonner hanya merender lewat komponen ini.
          Tanpa <Toaster />, semua konfirmasi simpan/hapus dan setiap pesan
          error hilang tanpa jejak: admin menekan "Simpan" dan tidak pernah
          tahu apakah berhasil atau gagal. */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
