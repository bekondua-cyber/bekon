import Link from "next/link";
import { portfolioItems } from "@/data/portfolio";

export const metadata = { title: "Portfolio" };

export default function AdminPortfolioPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <Link
          href="/admin/portfolio/tambah"
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold-dark transition-colors"
        >
          + Tambah Project
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Thumb
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Nama Project
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Kategori
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Lokasi
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {portfolioItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <div className="w-12 h-8 rounded overflow-hidden">
                    <img
                      src={item.cover_image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {item.title}
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {item.category.replace("-", " & ")}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.location}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Live
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-bekon-gold transition-colors" title="Edit">
                      &#9998;
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                      &#128465;
                    </button>
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="Lihat"
                    >
                      &#128065;
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
