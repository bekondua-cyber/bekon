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
  },
  // Add headers to control indexing and admin routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'index, follow' }],
      },
      {
        source: '/admin/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  // Optimize package imports to reduce unused JS
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.git', 'C:/Users/**'],
    }
    return config
  },
};

export default nextConfig;
