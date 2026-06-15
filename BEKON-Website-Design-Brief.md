# BEKON Website — Master Design Brief
### Bangun Eka Konstruksi | Premium Architecture & Contractor Website

> **Dokumen ini adalah single source of truth untuk desain Figma, development Next.js, dan semua keputusan arsitektur website BEKON.**
> Versi: 1.0 | Status: Locked & Ready for Design

---

## 📋 Daftar Isi

1. [Brand Overview](#1-brand-overview)
2. [Design System](#2-design-system)
3. [Arsitektur Website (Sitemap)](#3-arsitektur-website-sitemap)
4. [Wireframe Per Halaman](#4-wireframe-per-halaman)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Tech Stack](#6-tech-stack)
7. [Database Schema](#7-database-schema)
8. [Komponen UI Library](#8-komponen-ui-library)
9. [SEO & Performance](#9-seo--performance)
10. [Deployment Flow](#10-deployment-flow)

---

## 1. Brand Overview

### Identitas Perusahaan
| Field | Detail |
|---|---|
| **Nama Perusahaan** | Bangun Eka Konstruksi |
| **Brand Name** | BEKON |
| **Tagline** | *Wujudkan Hunian Impian Anda* |
| **Berdiri** | 2009 |
| **Lokasi** | Serang, Cilegon, Banten & sekitarnya |
| **Layanan Online** | Seluruh Indonesia & luar negeri |
| **Segmen** | Residensial, Komersial, Ruko, Kost |

### Brand Positioning
> BEKON bukan sekadar kontraktor — BEKON adalah mitra jangka panjang yang mewujudkan investasi hunian berkualitas dengan transparansi, estetika, dan ketepatan.

### Tone of Voice
- **Profesional** — berbicara sebagai ahli, bukan penjual
- **Warm** — dekat dengan klien, tidak kaku
- **Confident** — yakin dengan kualitas, tidak over-promise
- **Aspirational** — menjual mimpi yang bisa diwujudkan

---

## 2. Design System

### 2.1 Color Palette

```
PRIMARY COLORS
──────────────────────────────────────────
Off-White (Base)        #F8F5F0    RGB(248, 245, 240)
Cream (Surface)         #EDE8DF    RGB(237, 232, 223)
Near-Black (Text)       #1A1A1A    RGB(26, 26, 26)

ACCENT COLORS
──────────────────────────────────────────
Warm Gold (Primary Accent)   #B8963E    RGB(184, 150, 62)
Gold Light (Hover)           #CBA84A    RGB(203, 168, 74)
Gold Dark (Active)           #9A7C2E    RGB(154, 124, 46)

Deep Sage (Secondary Accent) #4A7C3F    RGB(74, 124, 63)
Sage Light                   #5A9A4D    RGB(90, 154, 77)

UTILITY COLORS
──────────────────────────────────────────
WhatsApp Green          #25D366    → HANYA untuk tombol WhatsApp
Border / Divider        #E0D9CE    RGB(224, 217, 206)
Text Muted              #6B6560    RGB(107, 101, 96)
Text Secondary          #3D3936    RGB(61, 57, 54)
Error                   #C0392B
Success                 #27AE60
Warning                 #F39C12
```

> ⚠️ **Aturan Warna:**
> - Hijau terang dari logo (#6ABF3A) TIDAK digunakan di UI
> - Gold hanya sebagai accent, bukan background utama
> - WhatsApp Green HANYA untuk tombol WA, nowhere else
> - Background halaman selalu Off-White atau Cream

### 2.2 Typography

```
FONT FAMILIES
──────────────────────────────────────────
Display / Hero     → Cormorant Garamond
                     Weight: 300, 400, 600
                     Style: Italic untuk quote/tagline

Body / UI          → Inter
                     Weight: 400, 500, 600, 700

Label / Badge      → Inter Uppercase
                     Letter-spacing: 0.1em - 0.15em
                     Weight: 500, 600
```

```
TYPE SCALE (Desktop)
──────────────────────────────────────────
Display XL   → Cormorant 72px / line-height 1.1 / weight 300
Display L    → Cormorant 56px / line-height 1.15 / weight 300
Display M    → Cormorant 42px / line-height 1.2 / weight 400
Heading 1    → Inter 36px / line-height 1.25 / weight 700
Heading 2    → Inter 28px / line-height 1.3 / weight 600
Heading 3    → Inter 22px / line-height 1.35 / weight 600
Heading 4    → Inter 18px / line-height 1.4 / weight 600
Body L       → Inter 18px / line-height 1.6 / weight 400
Body M       → Inter 16px / line-height 1.6 / weight 400
Body S       → Inter 14px / line-height 1.5 / weight 400
Label        → Inter 12px / line-height 1.4 / weight 500 / uppercase / tracking-wider
Caption      → Inter 12px / line-height 1.4 / weight 400 / color: Text Muted
```

```
TYPE SCALE (Mobile — 375px base)
──────────────────────────────────────────
Display XL   → Cormorant 42px
Display L    → Cormorant 36px
Display M    → Cormorant 28px
Heading 1    → Inter 28px
Heading 2    → Inter 22px
Heading 3    → Inter 18px
Body M       → Inter 15px
```

### 2.3 Spacing System

```
Base unit: 4px

Scale:
  xs   →  4px   (0.25rem)
  sm   →  8px   (0.5rem)
  md   →  16px  (1rem)
  lg   →  24px  (1.5rem)
  xl   →  32px  (2rem)
  2xl  →  48px  (3rem)
  3xl  →  64px  (4rem)
  4xl  →  96px  (6rem)
  5xl  →  128px (8rem)

Section padding (Desktop): 96px - 128px top/bottom
Section padding (Mobile):  48px - 64px top/bottom
Container max-width: 1280px
Container padding: 24px (mobile) / 80px (desktop)
```

### 2.4 Border Radius

```
None    →  0px      (untuk full-bleed image)
Sm      →  4px      (badge, tag)
Md      →  8px      (card kecil, input)
Lg      →  12px     (card standard)
Xl      →  16px     (card besar, modal)
Full    →  9999px   (pill button, avatar)
```

### 2.5 Shadow System

```
Sm      →  0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)
Md      →  0 4px 6px rgba(26,26,26,0.05), 0 2px 4px rgba(26,26,26,0.04)
Lg      →  0 10px 15px rgba(26,26,26,0.08), 0 4px 6px rgba(26,26,26,0.04)
Xl      →  0 20px 25px rgba(26,26,26,0.10), 0 8px 10px rgba(26,26,26,0.04)
Gold    →  0 4px 20px rgba(184,150,62,0.20)   → untuk CTA button hover
```

### 2.6 Animation & Motion

```
EASING
──────────────────────────────────────────
Standard     →  cubic-bezier(0.4, 0, 0.2, 1)
Enter        →  cubic-bezier(0, 0, 0.2, 1)
Exit         →  cubic-bezier(0.4, 0, 1, 1)
Bounce       →  cubic-bezier(0.34, 1.56, 0.64, 1)

DURATION
──────────────────────────────────────────
Fast         →  150ms   (hover state, toggle)
Standard     →  300ms   (modal open, dropdown)
Slow         →  500ms   (page transition, reveal)
Cinematic    →  800ms   (hero animation, parallax)

MICRO-INTERACTIONS
──────────────────────────────────────────
Scroll reveal         → translateY(40px) → 0 + opacity 0→1, stagger 100ms antar item
Page transition       → opacity + translateY(20px), 500ms
Image hover (portfolio) → scale(1.05) + overlay fade, 400ms
Button hover          → translateY(-2px) + shadow-gold, 200ms
Custom cursor         → Di area portfolio: lingkaran kecil + teks "VIEW"
Counter animation     → Angka naik dari 0 saat section masuk viewport
Parallax (hero)       → Image bergerak 30% lebih lambat dari scroll
```

---

## 3. Arsitektur Website (Sitemap)

```
BEKON Website
│
├── / (Home)
├── /tentang-kami
│   ├── /tentang-kami#perusahaan
│   └── /tentang-kami#tim
├── /layanan
│   ├── /layanan/desain-eksterior
│   ├── /layanan/desain-interior
│   ├── /layanan/bangun-rumah-renovasi
│   ├── /layanan/interior-rumah
│   └── /layanan/bangun-kost-ruko
├── /portfolio
│   └── /portfolio/[slug]
├── /video
│   ├── /video#hometour
│   └── /video#3d-desain
├── /informasi
│   ├── /informasi/blog
│   ├── /informasi/blog/[slug]
│   └── /informasi/berita
├── /kontak
│
└── /admin (Protected)
    ├── /admin/dashboard
    ├── /admin/portfolio
    ├── /admin/portfolio/tambah
    ├── /admin/portfolio/[id]/edit
    ├── /admin/artikel
    ├── /admin/artikel/tambah
    ├── /admin/artikel/[id]/edit
    ├── /admin/video
    ├── /admin/testimoni
    ├── /admin/tim
    ├── /admin/leads
    ├── /admin/media
    └── /admin/settings
```

---

## 4. Wireframe Per Halaman

### 4.1 HOME PAGE

#### Section 1: HERO
```
┌─────────────────────────────────────────────────────────────┐
│ [LOGO]    Home  Tentang  Layanan  Portfolio  Info  [Kontak] │  ← Navbar transparent
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │                         │  │                         │  │
│  │   FULL HEIGHT IMAGE     │  │  Bangun                 │  │
│  │   (foto proyek terbaik) │  │  Eka                    │  │
│  │                         │  │  Konstruksi             │  │
│  │   [overlay gradient     │  │                         │  │
│  │    cream dari kanan]    │  │  ─────────────────────  │  │
│  │                         │  │  Kami wujudkan hunian   │  │
│  │                         │  │  impian Anda dengan     │  │
│  │                         │  │  desain berkualitas     │  │
│  │                         │  │  dan konstruksi kokoh.  │  │
│  │                         │  │                         │  │
│  │                         │  │  [Konsultasi Gratis]    │  │
│  │                         │  │  [Lihat Portfolio →]    │  │
│  │                         │  │                         │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ● ○ ○ ○    ↓ Scroll                                       │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- Split layout 55% (gambar) / 45% (teks)
- Background teks: Off-White #F8F5F0
- Title font: Cormorant Garamond 72px weight 300
- Tombol Konsultasi: bg Gold #B8963E, text white, rounded-full
- Tombol Portfolio: border Gold, text Gold, hover fill Gold
- Phase 2: ganti image dengan video autoplay loop muted
```

#### Section 2: SOCIAL PROOF BAR
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Near-Black #1A1A1A                                     │
│                                                             │
│   200+          15+          50+          100%             │
│  Proyek      Tahun          Kota       Kepuasan            │
│  Selesai    Pengalaman    Terlayani      Klien             │
│                                                             │
│  [angka semua animated counter saat scroll masuk viewport]  │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- Full-width bar, bg Near-Black
- Angka: Cormorant 56px Gold #B8963E
- Label: Inter 14px uppercase tracking-wider Off-White
- Divider antar stat: 1px Gold dengan opacity 30%
```

#### Section 3: LAYANAN UNGGULAN
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  LABEL: LAYANAN KAMI                                        │
│  Solusi Lengkap Untuk                                       │
│  Hunian & Bangunan Anda                                     │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  [ikon]  │ │  [ikon]  │ │  [ikon]  │ │  [ikon]  │      │
│  │          │ │          │ │          │ │          │      │
│  │ Desain   │ │ Desain   │ │ Bangun   │ │ Interior │      │
│  │Eksterior │ │Interior  │ │  Rumah   │ │  Rumah   │      │
│  │          │ │          │ │          │ │          │      │
│  │ Deskripsi│ │ Deskripsi│ │ Deskripsi│ │ Deskripsi│      │
│  │ singkat  │ │ singkat  │ │ singkat  │ │ singkat  │      │
│  │          │ │          │ │          │ │          │      │
│  │ Selengkap│ │ Selengkap│ │ Selengkap│ │ Selengkap│      │
│  │  nya →   │ │  nya →   │ │  nya →   │ │  nya →   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│            + Bangun Kost & Ruko (card ke-5, centered)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- bg: Off-White
- Card: bg White, border Border/Divider, rounded-lg
- Hover: translateY(-8px) + shadow-lg + border Gold
- Ikon: custom SVG line-art, color Gold
- Label section: Inter 12px uppercase tracking-widest, color Gold
- Heading: Cormorant 42px Near-Black
```

#### Section 4: PORTFOLIO PILIHAN
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Cream #EDE8DF                                          │
│                                                             │
│  LABEL: PORTFOLIO                                           │
│  Karya Terbaik Kami                                         │
│                                   [Lihat Semua Portfolio →] │
│                                                             │
│  ┌──────────────────────┐  ┌──────────┐  ┌──────────┐      │
│  │                      │  │          │  │          │      │
│  │                      │  │          │  │          │      │
│  │   FEATURED (BESAR)   │  │  ITEM B  │  │  ITEM C  │      │
│  │      2 kolom         │  │          │  │          │      │
│  │                      │  ├──────────┤  └──────────┘      │
│  │  [hover: overlay +   │  │          │                     │
│  │   nama + lokasi +    │  │  ITEM D  │  ┌──────────┐      │
│  │   "VIEW" cursor]     │  │          │  │          │      │
│  │                      │  │          │  │  ITEM E  │      │
│  └──────────────────────┘  └──────────┘  └──────────┘      │
│                                                             │
│  Filter tabs: [Semua] [Desain] [Bangun] [Renovasi] [Ruko]  │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- Asymmetric masonry layout
- Hover overlay: bg gradient from bottom, Near-Black 80%
- Teks hover: nama proyek (Inter 18px bold white) + lokasi (Inter 14px muted)
- Custom cursor: lingkaran 60px + teks "VIEW" 10px uppercase
- Filter tabs: pill style, active: bg Gold text white
- Scroll reveal: setiap item muncul stagger 100ms
```

#### Section 5: KEUNGGULAN BEKON
```
┌─────────────────────────────────────────────────────────────┐
│  Split layout                                               │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │                         │  │                         │  │
│  │   FOTO / ILUSTRASI      │  │  LABEL: KEUNGGULAN      │  │
│  │   (proyek atau tim)     │  │  Mengapa Memilih BEKON? │  │
│  │                         │  │                         │  │
│  │                         │  │  ✓ Berpengalaman Sejak  │  │
│  │                         │  │    2009                 │  │
│  │                         │  │                         │  │
│  │                         │  │  ✓ Transparansi Biaya   │  │
│  │                         │  │    & Anggaran           │  │
│  │                         │  │                         │  │
│  │                         │  │  ✓ Desain Online untuk  │  │
│  │                         │  │    Seluruh Indonesia    │  │
│  │                         │  │                         │  │
│  │                         │  │  ✓ Material Berkualitas │  │
│  │                         │  │    & Bergaransi         │  │
│  │                         │  │                         │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- bg: Off-White
- Checklist ikon: SVG Gold
- Setiap item: judul Inter 18px semibold + deskripsi 14px muted
- Animate: slide dari kiri (foto) dan kanan (teks) saat scroll
```

#### Section 6: PROSES KERJA
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Near-Black #1A1A1A                                     │
│                                                             │
│  LABEL: PROSES KERJA                                        │
│  Perjalanan Membangun                                       │
│  Bersama BEKON                                              │
│                                                             │
│    01              02              03              04       │
│  [ikon]          [ikon]          [ikon]          [ikon]     │
│                                                             │
│  Konsultasi      Perencanaan     Pelaksanaan    Serah       │
│  & Survey        & Desain        Konstruksi     Terima      │
│                                                             │
│  Diskusi         Gambar kerja,   Pengerjaan     Proyek      │
│  kebutuhan &     RAB, dan        dengan         selesai     │
│  anggaran        visualisasi 3D  pengawasan     & garansi   │
│                                                             │
│  ────────────────────────────────────────── (connector line)│
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- bg: Near-Black, text Off-White
- Nomor urut: Cormorant 64px Gold opacity 20% (di belakang ikon)
- Ikon: SVG white line-art
- Connector: dashed line Gold
- Animate: step muncul berurutan kiri ke kanan
```

#### Section 7: TESTIMONI
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Cream #EDE8DF                                          │
│                                                             │
│  LABEL: TESTIMONI                                           │
│  Apa Kata Klien Kami                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  " Kami sangat puas dengan hasil pembangunan        │    │
│  │    rumah oleh BEKON. Tepat waktu, rapi, dan         │    │
│  │    sesuai desain yang dijanjikan. "                 │    │
│  │                                                     │    │
│  │  ★ ★ ★ ★ ★                                         │    │
│  │                                                     │    │
│  │  [foto]  Budi Santoso                               │    │
│  │          Klien Bangun Rumah · Serang, 2023          │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                      ← ●  ○  ○ →                           │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- Quote mark: Cormorant 120px Gold opacity 15% di background
- Teks: Cormorant Italic 24px Near-Black
- Avatar: lingkaran 56px
- Carousel: swipe mobile, auto-play 5 detik
```

#### Section 8: VIDEO PROYEK
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Off-White                                              │
│                                                             │
│  LABEL: VIDEO                                               │
│  Lihat Hasil Nyata Proyek Kami                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │         [YOUTUBE EMBED - FEATURED VIDEO]            │    │
│  │              aspect ratio 16:9                      │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │[thumbnail│  │[thumbnail│  │[thumbnail│                  │
│  │ video 2] │  │ video 3] │  │ video 4] │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│                    [Lihat Semua Video →]                    │
└─────────────────────────────────────────────────────────────┘
```

#### Section 9: ARTIKEL TERBARU
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Cream                                                  │
│                                                             │
│  LABEL: BLOG                                                │
│  Tips & Inspirasi Rumah                    [Semua Artikel] │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  [thumbnail] │  │  [thumbnail] │  │  [thumbnail] │      │
│  │              │  │              │  │              │      │
│  │  Kategori    │  │  Kategori    │  │  Kategori    │      │
│  │  Judul       │  │  Judul       │  │  Judul       │      │
│  │  Artikel     │  │  Artikel     │  │  Artikel     │      │
│  │              │  │              │  │              │      │
│  │  14 Jun 2025 │  │  10 Jun 2025 │  │  5 Jun 2025  │      │
│  │  Baca →      │  │  Baca →      │  │  Baca →      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

#### Section 10: CTA FINAL
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Gold #B8963E (satu-satunya section full Gold)          │
│                                                             │
│         Siap Membangun Rumah Impian Anda?                   │
│                                                             │
│    Konsultasikan proyek Anda bersama tim BEKON hari ini.    │
│         Gratis, tanpa komitmen, tanpa biaya awal.           │
│                                                             │
│         [WhatsApp Admin 1]    [WhatsApp Admin 2]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

CATATAN FIGMA:
- bg: Gold #B8963E
- Judul: Cormorant 48px White
- Tombol WA: bg White, text Gold, ikon WA, hover bg Near-Black text white
```

#### NAVBAR
```
NAVBAR STATES:
─────────────────────────────────────────────────────────────
Transparent (di atas hero):
  bg: transparent
  Logo: white version
  Links: white, weight 400
  CTA button: border white, text white

Scrolled (setelah hero):
  bg: Off-White dengan blur backdrop
  border-bottom: 1px Border/Divider
  Logo: color version
  Links: Near-Black, weight 400
  CTA button: bg Gold, text white

Mobile:
  Hamburger menu
  Full-screen overlay menu
  bg: Near-Black
  Links: Cormorant 36px White, centered
─────────────────────────────────────────────────────────────
```

#### FOOTER
```
┌─────────────────────────────────────────────────────────────┐
│  bg: Near-Black #1A1A1A                                     │
│                                                             │
│  [LOGO BEKON White]                                         │
│  Mitra terpercaya untuk hunian dan                          │
│  bangunan berkualitas sejak 2009.                           │
│                                                             │
│  [IG] [YT] [TikTok]                                         │
│                                                             │
│  ──────────────────────────────────────────────────────     │
│                                                             │
│  Menu Cepat        Layanan           Kontak                 │
│  ──────────        ───────           ──────                 │
│  Home              Desain Eksterior  📍 Serang, Banten      │
│  Tentang Kami      Desain Interior   📞 [Nomor]             │
│  Portfolio         Bangun Rumah      ✉️  [Email]            │
│  Video             Interior Rumah    [Google Maps →]        │
│  Blog              Bangun Kost       [WhatsApp →]           │
│  Kontak            & Ruko                                   │
│                                                             │
│  ──────────────────────────────────────────────────────     │
│  © 2025 Bangun Eka Konstruksi. All rights reserved.        │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 HALAMAN LAYANAN (Template)

Setiap halaman layanan menggunakan template yang sama:

```
1. HERO          → Foto proyek terkait + judul layanan + breadcrumb
2. DESKRIPSI     → Split: teks kiri, foto kanan
3. PROSES        → Timeline vertikal 4-6 langkah
4. KEUNGGULAN    → Grid 3 kolom dengan ikon
5. PORTFOLIO     → Grid 3 kolom, filtered by layanan ini
6. FAQ           → Accordion expand/collapse
7. CTA           → Konsultasi WhatsApp
```

---

### 4.3 HALAMAN PORTFOLIO

```
PORTFOLIO INDEX
───────────────────────────────────────────
Header: "Portfolio" + total project count
Filter: pill tabs animasi slide
Grid: masonry, 3 kolom desktop / 2 kolom tablet / 1 kolom mobile
Load more: infinite scroll atau "Load More" button
Hover: overlay dengan info proyek

PORTFOLIO DETAIL (/portfolio/[slug])
───────────────────────────────────────────
1. Hero: featured image full-width
2. Info bar: kategori, lokasi, luas, tahun
3. Deskripsi proyek
4. Gallery: lightbox grid
5. Before/After slider (jika ada)
6. Share button
7. Proyek serupa (3 card)
8. CTA konsultasi
```

---

### 4.4 HALAMAN KONTAK

```
┌─────────────────────────────┬──────────────────────────────┐
│                             │                              │
│   Hubungi Kami              │   [Google Maps Embed]        │
│                             │                              │
│   📍 Alamat lengkap         │                              │
│   📞 Nomor telepon          │                              │
│   ✉️  Email                  │                              │
│                             │                              │
│   WhatsApp:                 │                              │
│   [WA Admin 1 - Button]     │                              │
│   [WA Admin 2 - Button]     │                              │
│                             │                              │
│   Sosial Media:             │                              │
│   [IG] [YT] [TikTok]        │                              │
│                             │                              │
│   ─────────────────────     │                              │
│   Form Konsultasi:          │                              │
│   Nama: [_____________]     │                              │
│   WA:   [_____________]     │                              │
│   Layanan: [Select ▼]       │                              │
│   Pesan: [______________]   │                              │
│   [Kirim via WhatsApp]      │                              │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

---

## 5. Admin Dashboard

### 5.1 Layout System Admin

```
┌────────────────────────────────────────────────────────────┐
│ BEKON Admin          [🔍 Search...]      [🔔 3] [Avatar ▼] │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ 📊 Dashboard         CONTENT AREA                         │
│ ──────── │           (berubah sesuai menu)                 │
│ 📁 Portfolio                                               │
│ ✍️ Artikel │                                               │
│ 🎥 Video  │                                                │
│ 💬 Testimoni                                               │
│ 👥 Tim    │                                                │
│           │                                                │
│ ──────── │                                                 │
│ 📥 Leads  │                                                │
│ 🖼️ Media  │                                                │
│           │                                                │
│ ──────── │                                                 │
│ ⚙️ Settings│                                               │
│           │                                                │
│ [◀ Collapse]                                               │
└──────────┴─────────────────────────────────────────────────┘

Admin Design Tokens:
- bg sidebar: #111827 (gray-900)
- bg content: #F9FAFB (gray-50)
- accent: Gold #B8963E
- font: Inter only (tidak pakai Cormorant di admin)
- border: #E5E7EB (gray-200)
```

### 5.2 Dashboard Overview Screen

```
STATS CARDS ROW:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 📁 Portfolio │ │ ✍️ Artikel   │ │ 📥 Leads    │ │ 💬 Unread   │
│             │ │             │ │             │ │             │
│     24      │ │     12      │ │   8 baru    │ │   3 pesan   │
│   Projects  │ │   Articles  │ │  bulan ini  │ │   ⚡ ALERT  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

CHARTS ROW:
┌─────────────────────────────┐ ┌───────────────────────────┐
│  Leads per Bulan (Bar chart)│ │  Leads Terbaru            │
│  [Jan][Feb][Mar]...         │ │  • Budi - Bangun Rumah    │
│                             │ │    2 jam lalu · 📞 Hubungi│
│                             │ │  • Sari - Renovasi        │
│                             │ │    5 jam lalu · 📞 Hubungi│
└─────────────────────────────┘ └───────────────────────────┘

AKTIVITAS TERBARU:
┌──────────────────────────────────────────────────────────────┐
│  🕐  Portfolio "Rumah Minimalis Serang" ditambahkan — 2j lalu│
│  🕐  Lead baru: Ahmad Fauzi (Bangun Kost) — 4j lalu          │
│  🕐  Artikel "Tips Renovasi" dipublish — 1 hari lalu         │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Portfolio Manager

```
LIST VIEW:
─────────────────────────────────────────────────────────────
Header: "Portfolio"                    [+ Tambah Project]
Filter: [Semua ▼] [Kategori ▼] [Status ▼]    [🔍 Search]

TABLE:
┌──────┬────────────────────┬──────────────┬──────────┬────────┬──────────┐
│Thumb │Nama Project        │Kategori      │Lokasi    │Status  │Aksi      │
├──────┼────────────────────┼──────────────┼──────────┼────────┼──────────┤
│[img] │Rumah Modern 2 Lantai│Bangun Rumah │Serang    │✅ Live │✏️ 🗑️ 👁️ │
│[img] │Ruko 3 Lantai       │Bangun Ruko   │Cilegon   │✅ Live │✏️ 🗑️ 👁️ │
│[img] │Interior Minimalis  │Interior      │Serang    │📝 Draft│✏️ 🗑️ 👁️ │
└──────┴────────────────────┴──────────────┴──────────┴────────┴──────────┘

FORM TAMBAH/EDIT PROJECT:
─────────────────────────────────────────────────────────────
┌──────────────────────────────┬───────────────────────────────┐
│  INFO PROJECT                │  GAMBAR PROYEK                │
│  ─────────────               │  ──────────────────────────── │
│  Nama:      [____________]   │  ┌───────────────────────┐    │
│  Slug:      [____________]   │  │  Drag & drop atau     │    │
│  Kategori:  [Select ▼]       │  │  [Browse Files]       │    │
│  Lokasi:    [____________]   │  │                       │    │
│  Luas:      [______] m²      │  │  JPG/PNG → Auto WebP  │    │
│  Tahun:     [______]         │  └───────────────────────┘    │
│                              │                               │
│  DESKRIPSI                   │  THUMBNAIL TERPILIH:          │
│  ─────────                   │  ┌────┐ ┌────┐ ┌────┐        │
│  [Rich text editor]          │  │img1│ │img2│ │img3│        │
│                              │  └──┬─┘ └────┘ └────┘        │
│                              │     ↑ COVER (drag reorder)    │
│  STATUS                      │                               │
│  ○ Draft   ● Published       │  Before/After Toggle:         │
│                              │  [OFF ──────────────]         │
│  Featured di Homepage:       │                               │
│  [Toggle OFF]                │  Info: semua gambar otomatis  │
│                              │  dikonversi ke .webp dan      │
│  SEO                         │  dikompres 85% sebelum upload │
│  ─────────────────────────── │                               │
│  Meta Title: [____________]  │                               │
│  Meta Desc:  [____________]  │                               │
│                              │                               │
│  [Batal]        [Simpan ✓]   │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### 5.4 Lead Manager

```
HEADER:
"Leads & Konsultasi"          [📊 Export Excel]

FILTER TABS:
[Semua (24)] [🔴 Baru (3)] [🟡 Diproses (8)] [🔵 Penawaran (5)] [🟢 Closing (7)] [⚫ Batal (1)]

LEAD CARDS:
┌─────────────────────────────────────────────────────────────┐
│ 🔴 BARU                                          2 jam lalu │
│ ─────────────────────────────────────────────────────────── │
│ 👤 Budi Santoso          📱 0812-3456-7890                  │
│ 🏠 Bangun Rumah          💰 Budget: Rp 500-800 juta         │
│ 📍 Serang, Banten                                           │
│                                                             │
│ "Ingin membangun rumah 2 lantai konsep minimalis modern..." │
│                                                             │
│ [📱 Hubungi via WA]  [Ubah Status ▼]  [Lihat Detail]       │
└─────────────────────────────────────────────────────────────┘

DETAIL MODAL:
- Semua info lead
- Timeline perubahan status
- Catatan internal admin
- Tombol ubah status
```

### 5.5 Media Library

```
HEADER: "Media Library"                [📤 Upload Gambar]
STATS:  124 file · 48.2 MB used · Semua dalam format .webp

GRID VIEW (5 kolom desktop):
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │ │      │ │      │
│ img  │ │ img  │ │ img  │ │ img  │ │ img  │
│      │ │      │ │      │ │      │ │      │
│.webp │ │.webp │ │.webp │ │.webp │ │.webp │
│ 24kb │ │ 31kb │ │ 18kb │ │ 42kb │ │ 28kb │
│[Copy]│ │[Copy]│ │[Copy]│ │[Copy]│ │[Copy]│
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

Hover image: [✓ Pilih] [🗑️ Hapus] [🔗 Copy URL]
Bulk action: [Hapus Terpilih (3)]
```

### 5.6 Settings

```
TABS: [Perusahaan] [WhatsApp & Kontak] [SEO Global] [Tampilan] [Akun]

TAB PERUSAHAAN:
  Nama Perusahaan: [_____________________]
  Alamat:          [_____________________]
  Telepon:         [_____________________]
  Email:           [_____________________]
  Tahun Berdiri:   [_____]
  Deskripsi:       [text area]

TAB WHATSAPP & KONTAK:
  WA Admin 1:  [62812xxxxxxxx] [Nama: _______]
  WA Admin 2:  [62813xxxxxxxx] [Nama: _______]
  Instagram:   [@______________]
  YouTube:     [URL_____________]
  TikTok:      [@______________]

TAB SEO GLOBAL:
  Default Meta Title:       [_____________________]
  Default Meta Description: [_____________________]
  OG Image:                 [Upload gambar]
  Google Analytics ID:      [G-XXXXXXXXXX]

TAB TAMPILAN:
  Maintenance Mode: [Toggle]
  Popup Konsultasi: [Toggle] + delay [5] detik
```

---

## 6. Tech Stack

```
FRONTEND
────────────────────────────────────────────────────
Framework          Next.js 14 (App Router)
Styling            Tailwind CSS v3
UI Components      shadcn/ui (admin only)
Animation          Framer Motion
Icons              Lucide React
Font loader        next/font (Google Fonts)
Image optimization next/image (WebP auto)

BACKEND
────────────────────────────────────────────────────
API                Next.js Route Handlers (App Router)
Database           Supabase (PostgreSQL)
ORM                Prisma
Authentication     Supabase Auth (email + password)
File Upload        Cloudinary + Sharp (WebP convert)
Email              Resend

INFRA & DEPLOYMENT
────────────────────────────────────────────────────
Deploy             Vercel
Repository         GitHub (auto-deploy on push)
CDN                Vercel Edge Network
Images CDN         Cloudinary CDN
Environment        .env.local → Vercel Environment Variables

IMAGE PIPELINE
────────────────────────────────────────────────────
Upload → Next.js API Route → Sharp (resize + WebP + compress 85%)
→ Cloudinary Storage → Return CDN URL → Save to Supabase
```

---

## 7. Database Schema

```sql
-- PORTFOLIO
CREATE TABLE portfolios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,  -- 'eksterior'|'interior'|'bangun'|'renovasi'|'kost-ruko'
  location    TEXT,
  area_sqm    INTEGER,
  year        INTEGER,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  cover_image TEXT,           -- Cloudinary URL
  images      TEXT[],         -- Array of Cloudinary URLs
  before_image TEXT,
  after_image  TEXT,
  meta_title  TEXT,
  meta_desc   TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- ARTICLES
CREATE TABLE articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT,           -- 'blog'|'berita'
  excerpt     TEXT,
  content     TEXT,           -- Rich HTML
  thumbnail   TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  meta_title  TEXT,
  meta_desc   TEXT,
  og_image    TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- VIDEOS
CREATE TABLE videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id  TEXT,
  thumbnail   TEXT,
  category    TEXT,           -- 'hometour'|'3d-desain'
  is_featured BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT now()
);

-- TESTIMONIALS
CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  project_type TEXT,
  location    TEXT,
  content     TEXT NOT NULL,
  rating      INTEGER DEFAULT 5,
  photo       TEXT,
  portfolio_id UUID REFERENCES portfolios(id),
  is_published BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT now()
);

-- TEAM
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  bio         TEXT,
  photo       TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT now()
);

-- LEADS
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  service     TEXT,
  budget      TEXT,
  location    TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'new',  -- 'new'|'contacted'|'survey'|'proposal'|'closing'|'cancelled'
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- MEDIA
CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  public_id   TEXT,           -- Cloudinary public_id
  size_bytes  INTEGER,
  width       INTEGER,
  height      INTEGER,
  created_at  TIMESTAMP DEFAULT now()
);

-- SETTINGS
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMP DEFAULT now()
);
```

---

## 8. Komponen UI Library

### Komponen Public Website

```
ATOMS
─────────────────────────────────────────────
Button          → variants: primary (gold), secondary (outline), ghost, whatsapp
Badge           → variants: kategori, status
Icon            → Lucide icons wrapper
Image           → next/image wrapper dengan aspect ratio
Label           → uppercase tracking-wide kapil

MOLECULES
─────────────────────────────────────────────
NavLink         → link dengan active state dan hover underline
PortfolioCard   → thumbnail + overlay hover + info
ArticleCard     → thumbnail + kategori + judul + tanggal
ServiceCard     → ikon + judul + deskripsi + link
TestimonialCard → quote + rating + avatar + nama
VideoCard       → thumbnail youtube + play button + judul
StatCounter     → angka animasi + label
ProcessStep     → nomor + ikon + judul + deskripsi

ORGANISMS
─────────────────────────────────────────────
Navbar          → logo + links + CTA + mobile menu
Footer          → 4 kolom + sosmed + copyright
HeroSection     → split layout + CTA buttons
PortfolioGrid   → masonry grid + filter tabs
TestimonialSlider → carousel + auto-play
CTASection      → full-width gold + 2 WA buttons
ContactForm     → form + WA redirect
Lightbox        → gallery modal full-screen

PAGE TEMPLATES
─────────────────────────────────────────────
HomePage
ServicePage
PortfolioIndexPage
PortfolioDetailPage
ArticleIndexPage
ArticleDetailPage
VideoPage
AboutPage
ContactPage
```

### Komponen Admin Dashboard

```
DataTable       → sortable, filterable, paginated
FormField       → input, select, textarea, toggle
ImageUploader   → drag-drop + preview + progress + WebP info
RichTextEditor  → Tiptap dengan toolbar standar
StatusBadge     → colored badges untuk status lead
LeadCard        → card lead dengan actions
StatCard        → stat angka untuk dashboard
AreaChart       → recharts wrapper untuk leads chart
SidebarNav      → collapsible navigation
Breadcrumb      → navigasi halaman admin
```

---

## 9. SEO & Performance

### SEO Strategy

```
ON-PAGE SEO (setiap halaman):
─────────────────────────────────────────────────────
Title format:    [Judul Halaman] | BEKON - Jasa Bangun Rumah Serang
Meta desc:       150-160 karakter, natural, mengandung keyword
OG Image:        1200x630px, auto-generate atau manual set
Canonical URL:   selalu di-set
Structured Data: Organization, LocalBusiness, BreadcrumbList
                 Article (untuk blog), ImageObject (portfolio)

TARGET KEYWORDS:
─────────────────────────────────────────────────────
Primary:   "jasa bangun rumah Serang"
           "kontraktor rumah Banten"
           "bangun rumah Cilegon"
Secondary: "jasa desain eksterior Serang"
           "renovasi rumah Serang"
           "interior rumah Banten"
           "bangun ruko Cilegon"
Long-tail: "biaya bangun rumah 2 lantai Serang"
           "kontraktor terpercaya Banten"
           "desain rumah minimalis modern Serang"
```

### Performance Target

```
Core Web Vitals Target:
  LCP (Largest Contentful Paint)  < 2.5s
  FID (First Input Delay)         < 100ms
  CLS (Cumulative Layout Shift)   < 0.1

Optimizations:
  ✓ All images → WebP via Cloudinary + next/image
  ✓ Fonts → next/font (zero layout shift)
  ✓ Static generation (SSG) untuk portfolio & artikel
  ✓ ISR (Incremental Static Regeneration) 60 detik
  ✓ Lazy load images below fold
  ✓ Code splitting otomatis (Next.js)
  ✓ Prefetch internal links
```

---

## 10. Deployment Flow

```
DEVELOPMENT WORKFLOW
─────────────────────────────────────────────────────
1. Developer push ke branch 'main' di GitHub
2. Vercel auto-detect push → trigger build
3. Build Next.js (next build)
4. Deploy ke Vercel Edge Network
5. URL auto-update (zero downtime)

ENVIRONMENT VARIABLES (set di Vercel Dashboard)
─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=

BRANCH STRATEGY
─────────────────────────────────────────────────────
main          → Production (auto deploy)
develop       → Staging (preview URL)
feature/*     → Feature branches (preview URL)

Vercel Preview URL:
Setiap push ke branch non-main → dapat preview URL unik
https://bekon-[hash]-username.vercel.app
```

---

## 📌 Catatan untuk Figma

### Frame Sizes yang Harus Dibuat

```
Desktop:    1440 x 900px  (primary)
Tablet:     768 x 1024px
Mobile:     375 x 812px   (iPhone SE / standard)

Artboard per halaman:
□ Home (semua section)
□ Layanan Index
□ Layanan Detail (template)
□ Portfolio Index
□ Portfolio Detail
□ Video
□ Blog Index
□ Blog Detail
□ Tentang Kami
□ Kontak
□ Admin - Dashboard
□ Admin - Portfolio List
□ Admin - Portfolio Form
□ Admin - Leads
□ Admin - Media Library
□ Admin - Settings
□ 404 Page
```

### Design Tokens untuk Figma Variables

```
Buat Figma Variables dengan nama persis ini:
(agar handoff ke developer zero-confusion)

COLOR/base/off-white       → #F8F5F0
COLOR/base/cream           → #EDE8DF
COLOR/base/near-black      → #1A1A1A
COLOR/accent/gold          → #B8963E
COLOR/accent/gold-light    → #CBA84A
COLOR/accent/gold-dark     → #9A7C2E
COLOR/accent/sage          → #4A7C3F
COLOR/utility/border       → #E0D9CE
COLOR/utility/text-muted   → #6B6560
COLOR/utility/text-secondary → #3D3936
COLOR/utility/whatsapp     → #25D366

FONT/display               → Cormorant Garamond
FONT/body                  → Inter

SPACING/xs  → 4
SPACING/sm  → 8
SPACING/md  → 16
SPACING/lg  → 24
SPACING/xl  → 32
SPACING/2xl → 48
SPACING/3xl → 64
SPACING/4xl → 96
SPACING/5xl → 128
```

---

*Dokumen ini dibuat sebagai panduan lengkap desain dan development website BEKON.*
*Update dokumen ini setiap ada perubahan keputusan desain atau teknis.*

**Status:** ✅ Ready for Figma Design Phase
