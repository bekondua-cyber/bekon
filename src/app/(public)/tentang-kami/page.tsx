import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/data/site-config";
import { teamMembers } from "@/data/team";
import { whyBekon, type WhyBekonItem } from "@/data/why-bekon";
import { prisma } from "@/lib/prisma";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Tentang ${siteConfig.fullName} (BEKON) — kontraktor dan arsitek profesional sejak ${siteConfig.since} di Serang, Cilegon, Banten.`,
  alternates: { canonical: "/tentang-kami" },
};

interface DisplayTeamMember {
  id: string; name: string; role: string; bio: string; photo?: string; initials: string;
}

function getSettingsMap(rows: { key: string; value: string | null }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.value !== null) map[r.key] = r.value;
  }
  return map;
}

export default async function TentangKamiPage() {
  let teamFromDb: Array<{ id: string; name: string; role: string | null; bio: string | null; photo: string | null }> = [];
  let settings: Record<string, string> = {};
  try {
    const [teamRows, settingsRows] = await Promise.all([
      prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, role: true, bio: true, photo: true },
      }),
      prisma.setting.findMany(),
    ]);
    teamFromDb = teamRows;
    settings = getSettingsMap(settingsRows);
  } catch {}

  const displayTeam: DisplayTeamMember[] = teamFromDb.length > 0
    ? teamFromDb.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role || "",
        bio: m.bio || "",
        photo: m.photo ?? undefined,
        initials: getInitials(m.name),
      }))
    : teamMembers;

  const companyName = settings.nama_perusahaan || siteConfig.fullName;
  const deskripsi = settings.deskripsi || "";
  const tahunBerdiri = settings.tahun_berdiri ? parseInt(settings.tahun_berdiri) : siteConfig.since;
  const statProyek = settings.stat_proyek || "200";

  const tentangJudul = settings.tentang_judul || "Mengapa Memilih BEKON?";
  const tentangGambar = settings.tentang_gambar || "https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80";
  let tentangItems = whyBekon;
  try {
    const raw = settings.tentang_items;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item: WhyBekonItem) => item.title?.trim());
        if (valid.length > 0) {
          tentangItems = valid;
        }
      }
    }
  } catch {}
  return (
    <div className="min-h-screen bg-bekon-off-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16" id="perusahaan">
          <span className="section-label">Tentang Kami</span>
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black mt-5">
            Mitra Terpercaya Untuk
            <br />
            Hunian & Bangunan Berkualitas
          </h1>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-bekon-near-black mb-4">
              {companyName}
            </h2>
            {deskripsi ? (
              deskripsi.split("\n").filter(Boolean).map((p, i) => (
                <p key={i} className="text-bekon-text-muted leading-relaxed mb-4 last:mb-6">
                  {p}
                </p>
              ))
            ) : (
              <>
                <p className="text-bekon-text-muted leading-relaxed mb-4">
                  Bangun Eka Konstruksi (BEKON) yang berdiri tahun 2009 adalah perusahaan
                  yang bergerak di bidang jasa konstruksi pekerjaan bangunan seperti;
                  rumah tinggal pribadi, perumahan, kantor, toko/kios, ruko, infrastruktur, dll.
                </p>
                <p className="text-bekon-text-muted leading-relaxed mb-4">
                  Perusahaan kami juga mengerjakan proyek konstruksi mulai dari tahap
                  perencanaan sampai dengan pelaksanaan.
                </p>
                <p className="text-bekon-text-muted leading-relaxed mb-4">
                  – Perencanaan meliputi; pembuatan gambar kerja, gambar 3 dimensi,
                  site plan, RAB (Rencana Anggaran Biaya).
                </p>
                <p className="text-bekon-text-muted leading-relaxed mb-4">
                  – Pelaksanaan meliputi; pekerjaan bangunan baru, renovasi, penambahan
                  lantai/tingkat, pagar, teras, tangga, penggantian keramik, plafond,
                  pengecatan ulang, pembuatan dan pemasangan kusen pintu &amp; jendela
                  kayu, aluminium, dll.
                </p>
                <p className="text-bekon-text-muted leading-relaxed mb-6">
                  Kami selalu berusaha untuk terus mengembangkan diri dan meningkatkan
                  kualitas pekerjaan dan hasil kerja sehingga suatu saat diharapkan dapat
                  ikut serta memberi sumbangsih hasil karya terbaik untuk kemajuan bangsa
                  Indonesia dalam bidang desain, konstruksi dan pengembangan perumahan.
                </p>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-bekon-border text-center">
                <div className="font-display text-3xl font-semibold text-bekon-gold">
                  {new Date().getFullYear() - tahunBerdiri}+
                </div>
                <div className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium mt-1">
                  Tahun Pengalaman
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-bekon-border text-center">
                <div className="font-display text-3xl font-semibold text-bekon-gold">
                  {statProyek}+
                </div>
                <div className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium mt-1">
                  Proyek Selesai
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              <Image
                src={tentangGambar}
                alt="Tim BEKON"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="mb-20" id="visi-misi">
          <h2 className="text-2xl font-bold text-bekon-near-black mb-8">
            Visi &amp; Misi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visi */}
            <div className="bg-white rounded-xl p-6 border border-bekon-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-bekon-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <h3 className="text-lg font-bold text-bekon-near-black">Visi</h3>
              </div>
              <p className="text-bekon-text-muted leading-relaxed">
                Meningkatkan, mengembangkan kemampuan keteknikan dalam bidang desain,
                konstruksi dan pengembangan perumahan untuk memenuhi kebutuhan dan
                bermanfaat bagi masyarakat pengguna.
              </p>
            </div>
            {/* Misi */}
            <div className="bg-white rounded-xl p-6 border border-bekon-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-bekon-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h3 className="text-lg font-bold text-bekon-near-black">Misi</h3>
              </div>
              <p className="text-bekon-text-muted leading-relaxed mb-3">
                Membangun, mengembangkan Sumber Daya Manusia dan teknologi untuk
                menjadi yang terbaik dengan:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-bekon-text-muted">
                  <span className="text-bekon-gold font-bold mt-0.5">–</span>
                  <span>Meningkatkan kemampuan SDM secara berkesinambungan</span>
                </li>
                <li className="flex items-start gap-2 text-bekon-text-muted">
                  <span className="text-bekon-gold font-bold mt-0.5">–</span>
                  <span>Mengembangkan sistem manajemen secara konsisten</span>
                </li>
                <li className="flex items-start gap-2 text-bekon-text-muted">
                  <span className="text-bekon-gold font-bold mt-0.5">–</span>
                  <span>Inovasi teknologi di bidang konstruksi</span>
                </li>
                <li className="flex items-start gap-2 text-bekon-text-muted">
                  <span className="text-bekon-gold font-bold mt-0.5">–</span>
                  <span>Memperluas jaringan dengan industri dan masyarakat pengguna</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why BEKON */}
        <div className="mb-20" id="keunggulan">
          <h2 className="text-2xl font-bold text-bekon-near-black mb-8">
            {tentangJudul}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tentangItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-bekon-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-bekon-gold shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <h3 className="font-semibold text-bekon-near-black">
                    {item.title}
                  </h3>
                </div>
                <p className="text-bekon-text-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div id="tim">
          <h2 className="text-2xl font-bold text-bekon-near-black mb-8">
            Tim Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-6 border border-bekon-border text-center"
              >
                {member.photo ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 relative">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold font-display text-2xl font-semibold mx-auto mb-4">
                    {member.initials}
                  </div>
                )}
                <h3 className="font-semibold text-bekon-near-black">
                  {member.name}
                </h3>
                <p className="text-bekon-gold text-sm font-medium mt-0.5 mb-2">
                  {member.role}
                </p>
                <p className="text-bekon-text-muted text-xs leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
