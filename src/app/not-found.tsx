import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bekon-off-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-light text-bekon-gold/20 leading-none mb-4">
          404
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] text-bekon-near-black mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-bekon-text-muted mb-8">
          Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium hover:bg-bekon-gold-dark transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
