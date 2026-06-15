export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: "tips-bangun-rumah" | "inspirasi-desain" | "panduan-rab" | "berita";
  excerpt: string;
  content?: string;
  thumbnail: string;
  date: string;
  read_time: string;
  author: string;
}

export const articles: ArticleItem[] = [
  {
    id: "1",
    title: "7 Kesalahan Umum Saat Membangun Rumah Pertama",
    slug: "7-kesalahan-umum-saat-membangun-rumah-pertama",
    category: "tips-bangun-rumah",
    excerpt:
      "Hindari 7 kesalahan fatal yang sering dilakukan pemilik rumah pertama saat membangun hunian impian mereka.",
    thumbnail:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
    date: "10 Juni 2025",
    read_time: "5 min baca",
    author: "Tim BEKON",
  },
  {
    id: "2",
    title: "Tren Desain Interior 2025: Minimalis Modern yang Hangat",
    slug: "tren-desain-interior-2025",
    category: "inspirasi-desain",
    excerpt:
      "Temukan tren desain interior terbaru 2025 yang menggabungkan estetika minimalis dengan kehangatan natural.",
    thumbnail:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
    date: "5 Juni 2025",
    read_time: "4 min baca",
    author: "Tim BEKON",
  },
  {
    id: "3",
    title: "Cara Menghitung RAB Bangun Rumah 2 Lantai",
    slug: "cara-menghitung-rab-bangun-rumah-2-lantai",
    category: "panduan-rab",
    excerpt:
      "Panduan lengkap menghitung Rencana Anggaran Biaya untuk rumah 2 lantai beserta contoh simulasi.",
    thumbnail:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    date: "1 Juni 2025",
    read_time: "7 min baca",
    author: "Tim BEKON",
  },
];
