export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: "eksterior" | "interior" | "bangun" | "renovasi" | "kost-ruko";
  location: string;
  area_sqm?: number;
  year: number;
  description: string;
  is_featured: boolean;
  is_published: boolean;
  cover_image: string;
  images: string[];
  before_image?: string;
  after_image?: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Villa Modern Tropis",
    slug: "villa-modern-tropis",
    category: "eksterior",
    location: "Serang, Banten",
    year: 2023,
    description:
      "Villa modern dengan konsep tropis yang menyatu dengan alam. Menggunakan material alami dengan sentuhan desain kontemporer.",
    is_featured: true,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
  },
  {
    id: "2",
    title: "Rumah Minimalis 2 Lantai",
    slug: "rumah-minimalis-2-lantai",
    category: "bangun",
    location: "Cilegon, Banten",
    year: 2023,
    description:
      "Rumah tinggal 2 lantai dengan desain minimalis modern. Fasad bersih dengan garis horizontal yang tegas.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    ],
  },
  {
    id: "3",
    title: "Living Room Modern",
    slug: "living-room-modern",
    category: "interior",
    location: "Serang, Banten",
    year: 2024,
    description:
      "Desain interior ruang keluarga dengan konsep open plan. Warna netral dipadukan dengan aksen kayu hangat.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    ],
  },
  {
    id: "4",
    title: "Hunian Mewah Tropis",
    slug: "hunian-mewah-tropis",
    category: "eksterior",
    location: "Tangerang, Banten",
    year: 2023,
    description:
      "Hunian mewah dengan kolam renang dan taman tropis. Desain indoor-outdoor living yang seamless.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1745761320791-5ae142edee8c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1745761320791-5ae142edee8c?w=800&q=80",
    ],
  },
  {
    id: "5",
    title: "Interior Kamar Tidur",
    slug: "interior-kamar-tidur",
    category: "interior",
    location: "Serang, Banten",
    year: 2024,
    description:
      "Kamar tidur utama dengan desain yang menenangkan. Pencahayaan hangat dan material tekstur lembut.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
  },
  {
    id: "6",
    title: "Renovasi Ruang Keluarga",
    slug: "renovasi-ruang-keluarga",
    category: "renovasi",
    location: "Cilegon, Banten",
    year: 2023,
    description:
      "Renovasi total ruang keluarga menjadi lebih modern dan fungsional. Termasuk penambahan skylight dan bukaan besar.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
    ],
  },
  {
    id: "7",
    title: "Kost Modern 3 Lantai",
    slug: "kost-modern-3-lantai",
    category: "kost-ruko",
    location: "Serang, Banten",
    year: 2022,
    description:
      "Bangunan kost 3 lantai dengan 24 kamar. Desain fungsional dengan sirkulasi udara yang baik.",
    is_featured: false,
    is_published: true,
    cover_image:
      "https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80",
    ],
  },
];

export const portfolioCategories = [
  { value: "semua", label: "Semua" },
  { value: "eksterior", label: "Eksterior" },
  { value: "interior", label: "Interior" },
  { value: "bangun", label: "Bangun" },
  { value: "renovasi", label: "Renovasi" },
  { value: "kost-ruko", label: "Kost & Ruko" },
];
