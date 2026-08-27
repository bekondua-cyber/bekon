import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // TIDAK ADA Cache-Control menyeluruh di sini — sengaja.
          //
          // Dulu baris ini memaksa `public, max-age=3600,
          // stale-while-revalidate=86400` ke SETIAP path, termasuk halaman HTML.
          // Selama semua halaman dinamis, Next menimpanya dan tidak ada yang
          // terasa. Begitu satu halaman menjadi statis, CDN langsung
          // menyajikannya selama 1 jam dan versi basi sampai 24 jam — persis
          // yang terjadi pada beranda: perubahan admin tidak muncul selama
          // belasan jam tanpa satu pun tanda kesalahan.
          //
          // Next.js dan Vercel sudah mengeluarkan Cache-Control yang benar per
          // rute (aset statis immutable, halaman dinamis no-store). Biarkan
          // mereka yang menentukan; jangan pukul rata dari sini.
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://img.youtube.com https://images.unsplash.com https://www.google-analytics.com https://www.facebook.com https://analytics.tiktok.com https://www.google.com https://www.google.co.id https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net",
              "connect-src 'self' https://www.google-analytics.com https://www.facebook.com https://analytics.tiktok.com https://www.google.com https://www.google.co.id https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net",
              "frame-src https://www.youtube.com https://youtube.com https://www.facebook.com https://www.google.com",
              "media-src 'self' https://res.cloudinary.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://www.facebook.com",
            ].join('; '),
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    outputFileTracingRoot: __dirname,

    // CATATAN: pernah ada `outputFileTracingIncludes` di sini untuk memaksa
    // jsdom ikut dipaketkan. Sudah dicabut karena jalur render tidak lagi
    // memakai jsdom sama sekali — `sanitize-html` bekerja tanpa DOM dan
    // ikut di-bundle webpack. Lihat catatan panjang di src/lib/sanitize-html.ts.
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        providedExports: true,
        concatenateModules: true,
      }
    }
    return config
  },
};

export default nextConfig;
