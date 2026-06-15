export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

export const stats: StatItem[] = [
  { value: "200", label: "Proyek Selesai", suffix: "+" },
  { value: "15", label: "Tahun Pengalaman", suffix: "+" },
  { value: "50", label: "Kota Terlayani", suffix: "+" },
  { value: "100", label: "Kepuasan Klien", suffix: "%" },
];
