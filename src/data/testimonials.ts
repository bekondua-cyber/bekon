export interface TestimonialItem {
  id: string;
  client_name: string;
  initials: string;
  project_type: string;
  location: string;
  content: string;
  rating: number;
  avatar_color: string;
}

export const testimonials: TestimonialItem[] = [
  {
    id: "1",
    client_name: "Budi Santoso",
    initials: "BS",
    project_type: "Bangun Rumah",
    location: "Serang, 2023",
    content:
      "Kami sangat puas dengan hasil pembangunan rumah oleh BEKON. Tepat waktu, rapi, dan sesuai desain yang dijanjikan. Komunikasi selama proyek berjalan sangat transparan.",
    rating: 5,
    avatar_color: "#B8963E",
  },
  {
    id: "2",
    client_name: "Sari Dewi Rahayu",
    initials: "SR",
    project_type: "Desain Interior",
    location: "Cilegon, 2023",
    content:
      "Desain interior rumah kami melebihi ekspektasi. Tim BEKON sangat mendengarkan keinginan kami dan memberikan solusi kreatif yang sesuai budget. Highly recommended!",
    rating: 5,
    avatar_color: "#4A7C3F",
  },
  {
    id: "3",
    client_name: "Ahmad Fauzan",
    initials: "AF",
    project_type: "Renovasi Rumah",
    location: "Tangerang, 2024",
    content:
      "Proses renovasi berjalan lancar tanpa mengganggu aktivitas keluarga. BEKON sangat profesional dalam manajemen waktu dan kebersihan area kerja.",
    rating: 5,
    avatar_color: "#B8963E",
  },
  {
    id: "4",
    client_name: "Ratna Wulandari",
    initials: "RW",
    project_type: "Bangun Kost",
    location: "Serang, 2022",
    content:
      "Pembangunan kost 3 lantai selesai lebih cepat dari jadwal. Kualitas bangunan sangat baik dan semua kamar langsung terisi penuh. Investasi yang tepat!",
    rating: 5,
    avatar_color: "#4A7C3F",
  },
];
