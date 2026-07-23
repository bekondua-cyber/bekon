"use client"
import Link from "next/link"
import { Sparkles, User as UserIcon, Image as ImageIcon, History } from "lucide-react"

const TABS = [
  { href: "/admin/video-prompt", icon: Sparkles, label: "Generator" },
  { href: "/admin/video-prompt/characters", icon: UserIcon, label: "Karakter" },
  { href: "/admin/video-prompt/materials", icon: ImageIcon, label: "Bahan" },
  { href: "/admin/video-prompt/history", icon: History, label: "Riwayat" },
]

export function VideoPromptTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.href === active
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isActive ? "border-bekon-gold text-bekon-gold" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={15} /> {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
