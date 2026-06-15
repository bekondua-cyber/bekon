export interface VideoItem {
  id: string;
  title: string;
  youtube_id: string;
  category: "hometour" | "3d-desain" | "behind-the-build";
  is_featured: boolean;
  thumbnail?: string;
}

export const videos: VideoItem[] = [
  {
    id: "1",
    title: "Home Tour Rumah Modern 2 Lantai - Serang",
    youtube_id: "dQw4w9WgXcQ",
    category: "hometour",
    is_featured: true,
  },
  {
    id: "2",
    title: "Desain 3D Villa Tropical Modern",
    youtube_id: "dQw4w9WgXcQ",
    category: "3d-desain",
    is_featured: false,
  },
  {
    id: "3",
    title: "Interior Tour Ruang Keluarga Minimalis",
    youtube_id: "dQw4w9WgXcQ",
    category: "hometour",
    is_featured: false,
  },
  {
    id: "4",
    title: "Proses Pembangunan Kost 3 Lantai",
    youtube_id: "dQw4w9WgXcQ",
    category: "behind-the-build",
    is_featured: false,
  },
];
