"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const FILTERS = [
  { value: "semua", label: "Semua" },
  { value: "eksterior", label: "Eksterior" },
  { value: "interior", label: "Interior" },
  { value: "umum", label: "Umum" },
];

interface Props {
  current: string;
  currentQ?: string;
}

export default function BlogFilterDropdown({ current, currentQ = "" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ);
  const [, startTransition] = useTransition();

  function buildUrl(filter: string, search: string) {
    const params = new URLSearchParams();
    if (filter && filter !== "semua") params.set("filter", filter);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    return `/informasi/blog${qs ? `?${qs}` : ""}`;
  }

  function handleFilter(val: string) {
    startTransition(() => {
      router.push(buildUrl(val, q));
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl(current, q));
    });
  }

  function handleClear() {
    setQ("");
    startTransition(() => {
      router.push(buildUrl(current, ""));
    });
  }

  return (
    <div className="flex flex-col items-center gap-5 mb-10">

      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              current === f.value
                ? "bg-bekon-gold text-white border-bekon-gold shadow-sm"
                : "bg-white text-bekon-text-muted border-bekon-border hover:border-bekon-gold hover:text-bekon-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <div className="relative flex items-center">
          <svg
            className="absolute left-4 w-4 h-4 text-bekon-text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full pl-11 pr-24 py-2.5 rounded-full border border-bekon-border bg-white text-sm text-bekon-near-black placeholder:text-bekon-text-muted focus:outline-none focus:ring-2 focus:ring-bekon-gold focus:border-bekon-gold transition-all"
          />
          {q && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 text-bekon-text-muted hover:text-bekon-near-black transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-bekon-gold text-white text-xs font-semibold rounded-full hover:bg-bekon-gold/90 transition-colors"
          >
            Cari
          </button>
        </div>
      </form>
    </div>
  );
}
