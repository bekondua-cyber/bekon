import { portfolioItems } from "@/data/portfolio";
import { articles } from "@/data/articles";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm">Portfolio</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {portfolioItems.length}
          </p>
          <p className="text-gray-400 text-xs mt-1">Projects</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm">Artikel</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {articles.length}
          </p>
          <p className="text-gray-400 text-xs mt-1">Articles</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm">Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
          <p className="text-gray-400 text-xs mt-1">Bulan ini</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm">Pesan Baru</p>
          <p className="text-3xl font-bold text-bekon-gold mt-1">3</p>
          <p className="text-gray-400 text-xs mt-1">Perlu respon</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-bekon-gold" />
            <span className="text-gray-600">
              Portfolio &ldquo;Villa Modern Tropis&rdquo; ditambahkan
            </span>
            <span className="text-gray-400 ml-auto">2 jam lalu</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">
              Lead baru: Budi Santoso (Bangun Rumah)
            </span>
            <span className="text-gray-400 ml-auto">4 jam lalu</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">
              Artikel &ldquo;Tips Renovasi&rdquo; dipublish
            </span>
            <span className="text-gray-400 ml-auto">1 hari lalu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
