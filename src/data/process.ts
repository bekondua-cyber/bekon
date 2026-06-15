export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}

export const processSteps: ProcessStep[] = [
  {
    id: "1",
    number: "01",
    title: "Konsultasi & Survey",
    description:
      "Diskusi kebutuhan, anggaran, dan survei lokasi. Gratis dan tanpa komitmen.",
    icon: "consultation",
  },
  {
    id: "2",
    number: "02",
    title: "Perencanaan & Desain",
    description:
      "Gambar kerja, RAB transparan, dan visualisasi 3D sebelum konstruksi dimulai.",
    icon: "planning",
  },
  {
    id: "3",
    number: "03",
    title: "Pelaksanaan Konstruksi",
    description:
      "Pengerjaan dengan material pilihan dan pengawasan ketat dari tim profesional.",
    icon: "construction",
  },
  {
    id: "4",
    number: "04",
    title: "Serah Terima & Garansi",
    description:
      "Proyek selesai tepat waktu, bersih, dan disertai garansi pengerjaan.",
    icon: "handover",
  },
];
