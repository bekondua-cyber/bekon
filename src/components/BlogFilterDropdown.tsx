"use client";
import { useRouter } from "next/navigation";

const FILTERS = [
  { value: "semua", label: "Semua" },
  { value: "eksterior", label: "Eksterior" },
  { value: "interior", label: "Interior" },
  { value: "umum", label: "Umum" },
];

export default function BlogFilterDropdown({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div className="flex justify-center mb-10">
      <select
        value={current}
        onChange={(e) => {
          const val = e.target.value;
          router.push(
            val === "semua" ? "/informasi/blog" : `/informasi/blog?filter=${val}`
          );
        }}
        className="px-5 py-2.5 rounded-lg border border-bekon-border bg-white text-bekon-near-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bekon-gold cursor-pointer"
      >
        {FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}
