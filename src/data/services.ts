export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  icon: string;
  short_desc: string;
  description: string;
  image: string;
}

export const services: ServiceItem[] = [
  {
    id: "1",
    title: "Desain Eksterior",
    slug: "desain-eksterior",
    icon: "building",
    short_desc:
      "Tampilan luar rumah yang estetis, fungsional, dan mencerminkan kepribadian Anda.",
    description:
      "Kami merancang tampilan eksterior bangunan Anda dengan pendekatan arsitektural yang memadukan estetika, fungsi, dan nilai jual. Dari fasad, taman, hingga pencahayaan luar ruangan.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
  {
    id: "2",
    title: "Desain Interior",
    slug: "desain-interior",
    icon: "layout",
    short_desc:
      "Ruangan yang nyaman, elegan, dan harmonis dengan konsep yang personal.",
    description:
      "Layanan desain interior mencakup konsep ruang, pemilihan material, furnitur, pencahayaan, dan aksesori untuk menciptakan ruang yang mencerminkan karakter Anda.",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  },
  {
    id: "3",
    title: "Bangun Rumah & Renovasi",
    slug: "bangun-rumah-renovasi",
    icon: "hard-hat",
    short_desc:
      "Konstruksi berkualitas dengan material pilihan dan pengawasan ketat.",
    description:
      "Layanan konstruksi rumah baru dan renovasi. Kami menangani seluruh proses dari persiapan lahan hingga finishing dengan standar kualitas tinggi.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  },
  {
    id: "4",
    title: "Interior Rumah",
    slug: "interior-rumah",
    icon: "sofa",
    short_desc:
      "Pemasangan furniture, dekorasi, dan finishing interior profesional.",
    description:
      "Layanan interior rumah meliputi pembuatan dan pemasangan furniture custom, dekrorasi dinding, pemilihan warna cat, dan semua elemen finishing interior.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  },
  {
    id: "5",
    title: "Bangun Kost & Ruko",
    slug: "bangun-kost-ruko",
    icon: "store",
    short_desc:
      "Investasi properti yang menguntungkan dengan desain yang optimal.",
    description:
      "Layanan pembangunan kost, ruko, dan properti komersial lainnya. Desain dioptimalkan untuk nilai investasi dan fungsionalitas bisnis.",
    image:
      "https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80",
  },
];
