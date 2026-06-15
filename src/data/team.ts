export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
  initials: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Ir. Ahmad Rizky",
    role: "Founder & Arsitek Utama",
    bio: "Berpengalaman 20+ tahun di bidang arsitektur dan konstruksi. Alumni ITB.",
    initials: "AR",
  },
  {
    id: "2",
    name: "Dian Permata, S.T.",
    role: "Desainer Interior Senior",
    bio: "Spesialis desain interior residensial dan komersial dengan sentuhan modern klasik.",
    initials: "DP",
  },
  {
    id: "3",
    name: "Bambang Wijaya",
    role: "Kepala Proyek",
    bio: "Berpengalaman menangani 100+ proyek bangunan residensial dan komersial.",
    initials: "BW",
  },
  {
    id: "4",
    name: "Fitri Handayani",
    role: "Arsitek Desain",
    bio: "Alumni UI, fokus pada desain berkelanjutan dan hunian tropis modern.",
    initials: "FH",
  },
];
