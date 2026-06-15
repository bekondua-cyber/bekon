import Link from "next/link";
import { articles } from "@/data/articles";

export const metadata = { title: "Artikel" };

export default function AdminArtikelPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
        <Link
          href="/admin/artikel/tambah"
          className="px-4 py-2 bg-bekon-gold text-white rounded-lg text-sm font-medium hover:bg-bekon-gold-dark transition-colors"
        >
          + Tambah Artikel
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Judul
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Kategori
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Tanggal
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
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {article.title}
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {article.category.replace(/-/g, " ")}
                </td>
                <td className="px-4 py-3 text-gray-600">{article.date}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Published
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
