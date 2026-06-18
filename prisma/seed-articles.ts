import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

const articles = [
  {
    title: "7 Kesalahan Fatal Saat Membangun Rumah Pertama dan Cara Menghindarinya",
    slug: "7-kesalahan-fatal-saat-membangun-rumah-pertama-dan-cara-menghindarinya",
    category: "blog",
    excerpt: "Membangun hunian impian butuh perencanaan matang. Simak 7 kesalahan fatal saat membangun rumah pertama dan tips praktis untuk menghindarinya agar proyek berjalan lancar.",
    thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    metaTitle: "7 Kesalahan Fatal Saat Membangun Rumah Pertama | BEKON",
    metaDesc: "Membangun hunian impian butuh perencanaan matang. Simak 7 kesalahan fatal saat membangun rumah pertama dan tips praktis untuk menghindarinya.",
    content: `
<p>Mewujudkan hunian idaman adalah salah satu pencapaian terbesar dalam hidup, namun proses membangun rumah pertama sering kali dipenuhi dengan tantangan yang tidak terduga. Banyak pemilik lahan yang antusias namun kurang persiapan, sehingga berujung pada pembengkakan anggaran hingga kualitas bangunan yang tidak sesuai harapan.</p>

<img src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80" alt="Perencanaan membangun rumah" style="width:100%;border-radius:12px;margin:24px 0;" />

<p>Proses membangun rumah pertama memerlukan kolaborasi yang solid antara pemilik, desainer, dan pelaksana di lapangan. Tanpa pemahaman yang cukup, keputusan yang diambil secara terburu-buru bisa berakibat fatal pada hasil akhir bangunan.</p>

<h2>Kesalahan Umum dalam Membangun Rumah Pertama</h2>
<p>Salah satu kesalahan paling mendasar adalah tidak memiliki gambaran desain yang jelas sebelum pekerjaan dimulai. Banyak pemilik rumah yang sering mengubah desain di tengah jalan, yang tidak hanya membingungkan tukang tetapi juga memicu biaya tambahan untuk pembongkaran.</p>

<h2>7 Kesalahan Fatal yang Wajib Dihindari</h2>
<ul>
  <li><strong>Tidak memiliki RAB yang detail dan realistis</strong> — tanpa rencana anggaran yang jelas, biaya bisa membengkak 2x lipat.</li>
  <li><strong>Mengurus perizinan IMB/PBG secara dadakan</strong> — izin yang terlambat bisa menghentikan proyek di tengah jalan.</li>
  <li><strong>Salah memilih kontraktor</strong> — pilih kontraktor dengan portofolio jelas dan kontrak kerja tertulis.</li>
  <li><strong>Tidak mengawasi proyek secara berkala</strong> — pengawasan rutin mencegah penyimpangan material dan pengerjaan.</li>
  <li><strong>Membayar penuh di awal</strong> — gunakan sistem termin pembayaran bertahap sesuai progress.</li>
  <li><strong>Mengabaikan sistem utilitas</strong> — drainase, sirkulasi udara, dan pencahayaan alami wajib direncanakan sejak awal.</li>
  <li><strong>Tidak menyiapkan dana darurat</strong> — sisihkan minimal 10-15% dari total anggaran untuk kejadian tak terduga.</li>
</ul>

<img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80" alt="Konstruksi rumah" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Cara Menghindari Kesalahan Saat Membangun Rumah Pertama</h2>
<p>Kunci utama adalah perencanaan yang matang dan komprehensif. Mulailah dengan menyusun RAB yang detail, mengurus perizinan secara legal, dan membuat desain yang benar-benar final sebelum tukang mulai bekerja.</p>
<p>Selain itu, libatkan profesional untuk mengawasi jalannya proyek agar kualitas material dan pengerjaan tetap sesuai spesifikasi yang dijanjikan. Komunikasi yang terbuka dan rutin dengan tim pelaksana juga akan meminimalisir kesalahpahaman di lapangan.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">💡 Konsultasi Gratis dengan BEKON</strong>
  <p style="margin:8px 0 0;">Jika Anda membutuhkan panduan lebih lanjut atau ingin mewujudkan hunian impian tanpa ribet, <strong>Bangun Eka Konstruksi (BEKON)</strong> siap membantu. Hubungi tim kami hari ini untuk konsultasi gratis!</p>
</div>
`,
  },
  {
    title: "Berapa Biaya Bangun Rumah 2 Lantai di Serang Banten? Ini Rincian Lengkapnya",
    slug: "berapa-biaya-bangun-rumah-2-lantai-di-serang-banten-ini-rincian-lengkapnya",
    category: "blog",
    excerpt: "Ingin tahu estimasi biaya bangun rumah 2 lantai Serang? Simak rincian lengkap, faktor penentu, dan tips hematnya di artikel ini sebelum Anda mulai membangun.",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    metaTitle: "Biaya Bangun Rumah 2 Lantai di Serang Banten | BEKON",
    metaDesc: "Estimasi biaya bangun rumah 2 lantai Serang Banten lengkap dengan rincian dan faktor penentu harga. Konsultasi gratis dengan BEKON.",
    content: `
<p>Memiliki hunian dua lantai adalah solusi cerdas untuk memaksimalkan lahan yang terbatas, terutama di area perkotaan yang semakin padat. Namun, sebelum memulai proyek, memahami estimasi biaya bangun rumah 2 lantai Serang menjadi langkah paling krusial agar keuangan Anda tetap aman dan terkontrol.</p>

<img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80" alt="Rumah 2 lantai modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Faktor yang Mempengaruhi Biaya Bangun Rumah 2 Lantai Serang</h2>
<p>Tinggi rendahnya biaya sangat ditentukan oleh beberapa faktor utama:</p>
<ul>
  <li><strong>Spesifikasi material</strong> — material premium vs standar bisa selisih 40-60%</li>
  <li><strong>Kompleksitas desain</strong> — desain dengan banyak lekukan membutuhkan keahlian khusus</li>
  <li><strong>Kondisi tanah</strong> — tanah lunak memerlukan pondasi lebih dalam seperti tiang pancang</li>
  <li><strong>Akses lokasi</strong> — jalan sempit mempersulit mobilisasi alat berat dan material</li>
</ul>

<h2>Rincian Estimasi Biaya Bangun Rumah 2 Lantai Serang</h2>
<p>Secara umum, biaya bangun rumah 2 lantai di Serang berkisar antara <strong>Rp 3,5 juta hingga Rp 5,5 juta per meter persegi</strong>, tergantung tingkat kerumitan dan kualitas material.</p>

<img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" alt="Denah rumah 2 lantai" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Tips Menghemat Biaya Tanpa Mengorbankan Kualitas</h2>
<ul>
  <li>Finalkan desain sebelum memulai — perubahan di tengah jalan sangat mahal</li>
  <li>Beli material langsung dari distributor, bukan pengecer</li>
  <li>Gunakan sistem termin pembayaran bertahap sesuai progress</li>
  <li>Manfaatkan momen promo material bangunan akhir tahun</li>
</ul>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">💡 Hitung Estimasi Biaya Bersama BEKON</strong>
  <p style="margin:8px 0 0;"><strong>Bangun Eka Konstruksi (BEKON)</strong> menyediakan layanan konsultasi gratis termasuk estimasi RAB yang transparan. Hubungi kami sekarang dan dapatkan gambaran biaya yang akurat untuk rumah impian Anda!</p>
</div>
`,
  },
  {
    title: "Desain Eksterior Rumah Minimalis Modern yang Sedang Tren di 2025",
    slug: "desain-eksterior-rumah-minimalis-modern-yang-sedang-tren-di-2025",
    category: "blog",
    excerpt: "Tampilan luar rumah adalah kesan pertama. Temukan tren desain eksterior rumah minimalis modern 2025 yang memukau, mulai dari material, warna, hingga detail finishing.",
    thumbnail: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    metaTitle: "Tren Desain Eksterior Rumah Minimalis Modern 2025 | BEKON",
    metaDesc: "Temukan tren desain eksterior rumah minimalis modern 2025 terpopuler. Inspirasi tampilan luar rumah yang memukau dari BEKON.",
    content: `
<p>Di era modern ini, tampilan eksterior rumah bukan sekadar pelindung dari cuaca — ia adalah pernyataan identitas dan gaya hidup penghuninya. Desain eksterior rumah minimalis modern hadir sebagai jawaban atas kebutuhan hunian yang estetis, fungsional, dan mudah dirawat.</p>

<img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" alt="Eksterior rumah minimalis modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Filosofi Desain Eksterior Minimalis Modern</h2>
<p>Prinsip utamanya adalah <strong>"less is more"</strong> — setiap elemen yang hadir harus memiliki tujuan fungsional sekaligus estetis. Tidak ada ornamen yang berlebihan, tidak ada detail yang sekadar hiasan tanpa makna.</p>

<h2>Tren Material Eksterior 2025</h2>
<ul>
  <li><strong>Beton ekspos (exposed concrete)</strong> — tekstur kasar yang elegan dan tahan lama</li>
  <li><strong>Aluminium composite panel (ACP)</strong> — ringan, modern, dan mudah dirawat</li>
  <li><strong>Kayu WPC (Wood Plastic Composite)</strong> — tampilan kayu tanpa perawatan intensif</li>
  <li><strong>Kaca low-e</strong> — memantulkan panas sambil memaksimalkan cahaya alami</li>
</ul>

<img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" alt="Detail eksterior rumah modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Palet Warna Eksterior yang Sedang Tren</h2>
<p>Warna <strong>off-white, abu-abu muda, dan greige (grey+beige)</strong> mendominasi tren 2025. Dikombinasikan dengan aksen kayu atau beton gelap, hasilnya adalah tampilan yang hangat namun tetap kontemporer.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🏠 Wujudkan Eksterior Impian Anda</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> berpengalaman merancang dan membangun eksterior rumah minimalis modern sejak 2009. Konsultasi desain gratis — hubungi tim kami sekarang!</p>
</div>
`,
  },
  {
    title: "Tips Memilih Kontraktor Rumah Terpercaya: Jangan Sampai Salah Pilih!",
    slug: "tips-memilih-kontraktor-rumah-terpercaya-jangan-sampai-salah-pilih",
    category: "blog",
    excerpt: "Memilih kontraktor yang salah bisa berujung proyek mangkrak dan kerugian besar. Simak panduan lengkap memilih kontraktor rumah terpercaya di Banten.",
    thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    metaTitle: "Tips Memilih Kontraktor Rumah Terpercaya di Banten | BEKON",
    metaDesc: "Panduan lengkap memilih kontraktor rumah terpercaya agar proyek berjalan lancar. Tips dari BEKON, kontraktor berpengalaman sejak 2009.",
    content: `
<p>Memilih kontraktor adalah keputusan paling kritis dalam proses membangun rumah. Kesalahan dalam memilih mitra konstruksi bukan hanya berarti kualitas bangunan yang buruk — dalam kasus terparah, ini bisa berujung pada proyek yang terbengkalai dan kerugian finansial yang sangat besar.</p>

<img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" alt="Konsultasi dengan kontraktor" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Red Flag Kontraktor yang Harus Diwaspadai</h2>
<ul>
  <li>Tidak memiliki portofolio proyek yang bisa diverifikasi</li>
  <li>Harga penawaran jauh di bawah rata-rata pasar</li>
  <li>Meminta pembayaran penuh di awal sebelum pekerjaan dimulai</li>
  <li>Tidak mau membuat kontrak kerja tertulis yang detail</li>
  <li>Tidak bisa menunjukkan legalitas perusahaan (SIUJK, NPWP)</li>
</ul>

<h2>Checklist Memilih Kontraktor Terpercaya</h2>
<p>Gunakan checklist ini sebelum memutuskan:</p>
<ul>
  <li>✅ Cek portofolio dan kunjungi proyek yang sudah selesai</li>
  <li>✅ Minta referensi dari klien sebelumnya dan hubungi mereka</li>
  <li>✅ Pastikan ada kontrak kerja dengan spesifikasi teknis yang detail</li>
  <li>✅ Sistem pembayaran termin sesuai progress (20-30-30-20)</li>
  <li>✅ Ada garansi purna jual minimal 6 bulan</li>
  <li>✅ Tim memiliki pengawas lapangan yang berpengalaman</li>
</ul>

<img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80" alt="Proyek konstruksi berjalan" style="width:100%;border-radius:12px;margin:24px 0;" />

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🤝 BEKON — Kontraktor Terpercaya Sejak 2009</strong>
  <p style="margin:8px 0 0;"><strong>Bangun Eka Konstruksi (BEKON)</strong> hadir dengan portofolio 200+ proyek, kontrak kerja transparan, dan garansi kepuasan klien. Konsultasi gratis — hubungi kami sekarang!</p>
</div>
`,
  },
  {
    title: "Renovasi Rumah Lama Jadi Modern: Panduan Lengkap dan Estimasi Biaya",
    slug: "renovasi-rumah-lama-jadi-modern-panduan-lengkap-dan-estimasi-biaya",
    category: "blog",
    excerpt: "Renovasi rumah lama jadi modern bisa jadi pilihan lebih hemat dari bangun baru. Simak panduan lengkap, estimasi biaya, dan tips agar renovasi berjalan lancar.",
    thumbnail: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    metaTitle: "Renovasi Rumah Lama Jadi Modern: Panduan & Biaya | BEKON",
    metaDesc: "Panduan lengkap renovasi rumah lama jadi modern beserta estimasi biaya. Dapatkan inspirasi dan konsultasi gratis dari BEKON.",
    content: `
<p>Renovasi adalah solusi cerdas bagi Anda yang ingin memiliki hunian modern tanpa harus menanggung beban membangun dari nol. Dengan renovasi yang tepat, rumah lama yang terlihat kusam dan ketinggalan zaman bisa bertransformasi menjadi hunian kontemporer yang memukau.</p>

<img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" alt="Renovasi rumah lama" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Kapan Harus Merenovasi vs Membangun Baru?</h2>
<p>Renovasi lebih disarankan jika kondisi struktur utama (pondasi, kolom, balok) masih kuat. Namun jika kerusakan sudah mencapai 60% lebih dari total bangunan, membangun baru mungkin lebih ekonomis dalam jangka panjang.</p>

<h2>Tahapan Renovasi yang Benar</h2>
<ul>
  <li><strong>Asesmen kondisi bangunan</strong> — pemeriksaan struktur oleh tenaga ahli</li>
  <li><strong>Perencanaan desain</strong> — tentukan konsep dan gaya yang diinginkan</li>
  <li><strong>Penyusunan RAB</strong> — breakdown biaya per pekerjaan secara detail</li>
  <li><strong>Pelaksanaan bertahap</strong> — prioritaskan pekerjaan struktural dulu</li>
  <li><strong>Finishing dan dekorasi</strong> — sentuhan akhir yang menyempurnakan tampilan</li>
</ul>

<img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Hasil renovasi rumah modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Estimasi Biaya Renovasi</h2>
<p>Biaya renovasi di Banten berkisar <strong>Rp 1,5 juta — Rp 3,5 juta per m²</strong> tergantung scope pekerjaan dan material yang dipilih. Renovasi ringan (cat, keramik, plafon) jauh lebih murah dibanding renovasi berat yang melibatkan struktur.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🔨 Renovasi Bersama BEKON</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> berpengalaman menangani renovasi rumah dari yang ringan hingga total renovation. Konsultasi gratis dan survei lokasi tanpa biaya — hubungi kami sekarang!</p>
</div>
`,
  },
  {
    title: "Desain Interior Rumah Type 36: Ide Kreatif Agar Terasa Luas dan Nyaman",
    slug: "desain-interior-rumah-type-36-ide-kreatif-agar-terasa-luas-dan-nyaman",
    category: "blog",
    excerpt: "Rumah type 36 terasa sempit? Dengan trik desain interior yang tepat, rumah kecil bisa terasa luas, fungsional, dan tetap estetik. Simak idenya di sini!",
    thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    metaTitle: "Desain Interior Rumah Type 36 yang Luas dan Nyaman | BEKON",
    metaDesc: "Ide desain interior rumah type 36 agar terasa luas dan nyaman. Tips dan trik dari BEKON untuk memaksimalkan ruang di rumah kecil.",
    content: `
<p>Rumah type 36 dengan luas bangunan hanya 36 meter persegi sering kali membuat penghuninya merasa terkungkung dan tidak nyaman. Namun dengan pendekatan desain interior yang tepat, keterbatasan luas ini bisa disulap menjadi kelebihan yang justru menciptakan hunian yang hangat, fungsional, dan estetis.</p>

<img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80" alt="Interior rumah minimalis" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Prinsip Dasar Desain untuk Rumah Kecil</h2>
<ul>
  <li><strong>Maksimalkan cahaya alami</strong> — jendela besar dan warna terang membuat ruang terasa lega</li>
  <li><strong>Furnitur multifungsi</strong> — sofa bed, meja lipat, tempat tidur dengan laci penyimpanan</li>
  <li><strong>Open plan layout</strong> — minimalisir sekat ruang untuk kesan lebih luas</li>
  <li><strong>Vertical storage</strong> — manfaatkan tinggi dinding untuk lemari built-in</li>
</ul>

<h2>Pilihan Warna yang Membuat Ruang Terasa Lega</h2>
<p>Warna-warna terang seperti putih, krem, dan abu-abu muda memantulkan cahaya dan membuat ruang terasa lebih besar. Gunakan satu warna dominan (60%) dan dua warna pendamping (30% dan 10%) untuk tampilan yang harmonis.</p>

<img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80" alt="Desain interior minimalis" style="width:100%;border-radius:12px;margin:24px 0;" />

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🎨 Konsultasi Desain Interior Gratis</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> menyediakan layanan desain interior yang terjangkau dan berkualitas. Tim desainer kami siap membantu memaksimalkan setiap sudut rumah Anda!</p>
</div>
`,
  },
  {
    title: "Keuntungan Membangun Kost-kostan: Investasi Properti yang Menggiurkan",
    slug: "keuntungan-membangun-kost-kostan-investasi-properti-yang-menggiurkan",
    category: "blog",
    excerpt: "Kost-kostan adalah investasi properti paling stabil dengan passive income bulanan. Simak keuntungan, estimasi ROI, dan tips membangun kost yang menguntungkan.",
    thumbnail: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
    metaTitle: "Keuntungan Membangun Kost-kostan sebagai Investasi | BEKON",
    metaDesc: "Keuntungan membangun kost-kostan sebagai investasi properti. Estimasi ROI dan tips dari BEKON untuk membangun kost yang menguntungkan.",
    content: `
<p>Di tengah kebutuhan hunian sementara yang terus meningkat — terutama di kota-kota dengan banyak kampus dan kawasan industri — kost-kostan menjadi salah satu instrumen investasi properti yang paling menjanjikan. Return of Investment (ROI) yang stabil dan passive income bulanan menjadikannya pilihan cerdas bagi investor pemula maupun berpengalaman.</p>

<img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" alt="Kost modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Mengapa Kost-kostan adalah Investasi Cerdas?</h2>
<ul>
  <li><strong>Passive income bulanan</strong> yang stabil dan dapat diprediksi</li>
  <li><strong>Nilai properti meningkat</strong> seiring waktu (capital gain)</li>
  <li><strong>Permintaan selalu ada</strong> — mahasiswa, karyawan, dan pekerja selalu butuh tempat tinggal</li>
  <li><strong>ROI 8-15% per tahun</strong> — lebih tinggi dari deposito bank</li>
</ul>

<h2>Tips Membangun Kost yang Menguntungkan</h2>
<ul>
  <li>Pilih lokasi strategis dekat kampus, pabrik, atau pusat bisnis</li>
  <li>Desain kamar dengan fasilitas modern (AC, kamar mandi dalam, WiFi)</li>
  <li>Bangun dengan material berkualitas untuk meminimalkan biaya perawatan</li>
  <li>Pertimbangkan kost eksklusif dengan harga premium untuk ROI lebih tinggi</li>
</ul>

<img src="https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80" alt="Kamar kost modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🏢 Bangun Kost Bersama BEKON</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> telah membangun puluhan kost-kostan dan ruko di Serang-Cilegon. Konsultasi gratis untuk menghitung potensi investasi dan RAB kost Anda!</p>
</div>
`,
  },
  {
    title: "RAB Rumah: Cara Membuat Rencana Anggaran Biaya yang Akurat",
    slug: "rab-rumah-cara-membuat-rencana-anggaran-biaya-yang-akurat",
    category: "blog",
    excerpt: "RAB yang akurat adalah fondasi proyek yang sukses. Pelajari cara membuat Rencana Anggaran Biaya rumah yang benar sebelum Anda memulai pembangunan.",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    metaTitle: "Cara Membuat RAB Rumah yang Akurat | BEKON Banten",
    metaDesc: "Panduan lengkap membuat RAB rumah yang akurat. Komponen biaya, tips hemat, dan konsultasi gratis dari BEKON kontraktor Serang Banten.",
    content: `
<p>Rencana Anggaran Biaya (RAB) adalah dokumen paling vital dalam proyek pembangunan rumah. Tanpa RAB yang akurat, proyek bisa mengalami pembengkakan biaya yang tidak terkendali, bahkan berakhir dengan bangunan yang tidak selesai karena kehabisan dana di tengah jalan.</p>

<img src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80" alt="Perencanaan anggaran rumah" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Komponen Utama RAB Rumah</h2>
<ul>
  <li><strong>Pekerjaan Persiapan</strong> — pembersihan lahan, pengukuran, pagar sementara</li>
  <li><strong>Pekerjaan Pondasi</strong> — galian, pasir urug, batu kali/cakar ayam/bore pile</li>
  <li><strong>Pekerjaan Struktur</strong> — kolom, balok, plat lantai, ring balok</li>
  <li><strong>Pekerjaan Atap</strong> — rangka baja ringan/kayu, genteng, talang</li>
  <li><strong>Pekerjaan Dinding & Plafon</strong> — pasangan bata, plester, acian, cat</li>
  <li><strong>Pekerjaan MEP</strong> — instalasi listrik, air bersih, sanitasi</li>
  <li><strong>Pekerjaan Finishing</strong> — keramik, pintu, jendela, kusen</li>
</ul>

<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Dokumen RAB" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Tips Membuat RAB yang Akurat</h2>
<p>Kunci RAB yang akurat adalah <strong>volume perhitungan yang teliti</strong>. Setiap item pekerjaan harus dihitung berdasarkan gambar teknis yang sudah final. Gunakan harga satuan material dan upah terkini di lokasi proyek Anda.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">📊 Dapatkan RAB Gratis dari BEKON</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> menyediakan penyusunan RAB secara transparan dan terperinci — gratis untuk konsultasi awal. Hubungi kami sekarang!</p>
</div>
`,
  },
  {
    title: "Perbedaan Kontraktor dan Developer Properti: Mana yang Tepat untuk Anda?",
    slug: "perbedaan-kontraktor-dan-developer-properti-mana-yang-tepat-untuk-anda",
    category: "blog",
    excerpt: "Masih bingung bedanya kontraktor dan developer? Pahami perbedaan mendasar keduanya agar Anda bisa memilih mitra yang tepat untuk proyek properti Anda.",
    thumbnail: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    metaTitle: "Perbedaan Kontraktor dan Developer Properti | BEKON",
    metaDesc: "Pahami perbedaan kontraktor dan developer properti agar tidak salah pilih mitra. Panduan lengkap dari BEKON kontraktor Serang Banten.",
    content: `
<p>Dalam dunia properti dan konstruksi, istilah kontraktor dan developer sering kali digunakan secara bergantian oleh masyarakat awam, padahal keduanya memiliki peran, fungsi, dan ruang lingkup kerja yang sangat berbeda. Memahami perbedaan ini adalah langkah awal yang krusial sebelum Anda memutuskan untuk membangun atau membeli properti.</p>

<img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="Properti dan konstruksi" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Apa itu Developer Properti?</h2>
<p>Developer adalah pihak yang <strong>memiliki atau membeli lahan</strong>, merencanakan kawasan, membangun properti, lalu menjual atau menyewakannya untuk mencari keuntungan. Developer adalah pemilik proyek yang mengelola seluruh siklus properti dari hulu ke hilir.</p>

<h2>Apa itu Kontraktor?</h2>
<p>Kontraktor adalah perusahaan atau individu yang <strong>disewa oleh pemilik lahan</strong> untuk melaksanakan pekerjaan konstruksi berdasarkan gambar dan spesifikasi yang telah disepakati. Kontraktor tidak memiliki lahan — mereka menyediakan jasa tenaga kerja, alat, dan manajemen konstruksi.</p>

<img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" alt="Kontraktor bekerja" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Kapan Harus Memilih Kontraktor?</h2>
<p>Jika Anda <strong>sudah memiliki lahan</strong> dan ingin membangun rumah, ruko, atau kost di atasnya — Anda membutuhkan kontraktor. Anda bertindak sebagai owner yang menyewa jasa kontraktor untuk mengeksekusi desain Anda.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🏗️ BEKON Siap Jadi Mitra Konstruksi Anda</strong>
  <p style="margin:8px 0 0;">Sudah punya lahan? <strong>BEKON</strong> hadir sebagai kontraktor terpercaya yang siap mengeksekusi proyek impian Anda. Konsultasi gratis — hubungi kami sekarang!</p>
</div>
`,
  },
  {
    title: "Desain Rumah Industrial Modern: Konsep, Ciri Khas, dan Cara Mewujudkannya",
    slug: "desain-rumah-industrial-modern-konsep-ciri-khas-dan-cara-mewujudkannya",
    category: "blog",
    excerpt: "Tampil berani dan berkarakter! Pelajari konsep, ciri khas, dan cara mewujudkan desain rumah industrial modern yang estetik, maskulin, namun tetap nyaman ditinggali.",
    thumbnail: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
    metaTitle: "Desain Rumah Industrial Modern: Konsep & Cara Mewujudkannya | BEKON",
    metaDesc: "Panduan lengkap desain rumah industrial modern dari konsep hingga eksekusi. Wujudkan hunian berkarakter bersama BEKON.",
    content: `
<p>Gaya arsitektur industrial modern terus bertahan dan semakin digemari karena menawarkan estetika yang mentah, jujur, dan penuh karakter. Gaya ini sangat cocok bagi mereka yang bosan dengan tampilan rumah konvensional dan menginginkan hunian yang tampil berani.</p>

<img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80" alt="Rumah industrial modern" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Konsep Dasar: Kejujuran Material</h2>
<p>Prinsip inti adalah <strong>"kejujuran material"</strong> — mengekspos struktur dan material bangunan apa adanya. Dinding bata tidak diplester, pipa dan ducting dibiarkan terekspos di langit-langit sebagai elemen dekoratif.</p>

<h2>Ciri Khas Desain Industrial Modern</h2>
<ul>
  <li><strong>Palet warna gelap</strong> — abu-abu, hitam, cokelat, dan earth tone</li>
  <li><strong>Material spesifik</strong> — beton ekspos, besi hitam, kayu rustic, kaca</li>
  <li><strong>Plafon tinggi</strong> — memberikan kesan loft yang megah</li>
  <li><strong>Lampu filamen</strong> — bohlam terekspos dengan kap dari logam</li>
  <li><strong>Jendela besar berbingkai besi</strong> — memaksimalkan cahaya alami</li>
</ul>

<img src="https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80" alt="Interior industrial" style="width:100%;border-radius:12px;margin:24px 0;" />

<h2>Cara Membuat Industrial Modern Terasa Nyaman</h2>
<p>Kuncinya adalah keseimbangan. Tambahkan elemen tekstil lembut (karpet, sofa velvet), tanaman hias, dan pencahayaan hangat untuk mengimbangi kesan dingin dari material industrial yang dominan.</p>

<div style="background:#F8F5F0;border-left:4px solid #B8963E;padding:20px 24px;border-radius:8px;margin:32px 0;">
  <strong style="color:#B8963E;">🏭 Wujudkan Rumah Industrial Impian Anda</strong>
  <p style="margin:8px 0 0;"><strong>BEKON</strong> berpengalaman membangun berbagai gaya rumah termasuk industrial modern. Konsultasi desain gratis — hubungi tim kami sekarang!</p>
</div>
`,
  },
];

async function main() {
  console.log("Seeding 10 artikel blog BEKON...");

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        ...article,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log(`✅ ${article.title}`);
  }

  console.log("\n🎉 Selesai! 10 artikel berhasil ditambahkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
