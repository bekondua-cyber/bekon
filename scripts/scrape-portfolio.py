import asyncio
import os
import re
import aiohttp
import time
from playwright.async_api import async_playwright

BASE_URL = "https://bangunrumahbekon.com"
PORTFOLIO_URL = f"{BASE_URL}/portofolio/"
DOWNLOAD_DIR = "downloads"

def sanitize_folder(name):
    return re.sub(r'[<>:"/\\|?*]', '_', name.strip())

def get_extension(url):
    base = os.path.basename(url.split("?")[0])
    _, ext = os.path.splitext(base)
    return ext.lower() if ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif'] else '.jpg'

async def download_image(session, url, path):
    async with session.get(url) as resp:
        if resp.status == 200:
            with open(path, 'wb') as f:
                f.write(await resp.read())

async def main():
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()

        print(f"Membuka halaman portofolio...")
        await page.goto(PORTFOLIO_URL, wait_until='networkidle', timeout=30000)
        await asyncio.sleep(3)

        # Ambil semua link proyek
        links = await page.eval_on_selector_all(
            'a[href*="bangunrumahbekon.com"]',
            'els => els.map(e => ({href: e.href, text: e.innerText.trim()}))'
        )

        # Filter hanya link proyek portfolio
        project_links = []
        seen = set()
        for link in links:
            href = link['href']
            # Filter: bukan menu, bukan halaman utama, bukan sosmed
            skip_patterns = [
                '/portofolio/', '/tentang-kami/', '/f-a-q/', '/kontak',
                '/tahapan', '/harga', '/testimonial', '/artikel', '/catalogue',
                'facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com',
                'google.com', 'wa.me', 'drive.google'
            ]
            if any(p in href for p in skip_patterns):
                continue
            if 'bangunrumahbekon.com' in href and href not in seen:
                seen.add(href)
                project_links.append(href)

        print(f"\nDitemukan {len(project_links)} proyek:\n")
        for i, l in enumerate(project_links, 1):
            print(f"  {i}. {l}")

        if len(project_links) == 0:
            print("\nTidak ada proyek ditemukan. Cek URL website.")
            await browser.close()
            return

        # Scrape setiap proyek
        async with aiohttp.ClientSession(headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }) as session:
            for idx, url in enumerate(project_links, 1):
                try:
                    print(f"\n[{idx}/{len(project_links)}] Membuka: {url}")
                    await page.goto(url, wait_until='networkidle', timeout=30000)
                    await asyncio.sleep(2)

                    # Ambil judul
                    title = await page.title()
                    h1 = await page.query_selector('h1')
                    if h1:
                        title = await h1.inner_text()
                    title = title.strip()
                    print(f"  Judul: {title}")

                    # Ambil semua gambar di konten
                    img_urls = await page.eval_on_selector_all(
                        '.entry-content img, article img, .post-content img, .wp-block-image img, .gallery img, img',
                        '''els => els.map(e => e.src || e.dataset.src || '').filter(src => 
                            src && src.startsWith('http') && 
                            !src.includes('logo') && 
                            !src.includes('avatar') &&
                            !src.includes('icon') &&
                            !src.includes('gravatar') &&
                            (src.includes('.jpg') || src.includes('.jpeg') || 
                             src.includes('.png') || src.includes('.webp'))
                        )'''
                    )

                    # Hapus duplikat
                    img_urls = list(dict.fromkeys(img_urls))
                    print(f"  Foto ditemukan: {len(img_urls)}")

                    if len(img_urls) == 0:
                        print(f"  Tidak ada foto, skip.")
                        continue

                    # Buat folder
                    folder_name = sanitize_folder(title)
                    folder_path = os.path.join(DOWNLOAD_DIR, folder_name)

                    # Skip jika sudah lengkap
                    if os.path.isdir(folder_path):
                        existing = [f for f in os.listdir(folder_path) 
                                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
                        if len(existing) >= len(img_urls):
                            print(f"  Sudah ada {len(existing)} foto, skip.")
                            continue

                    os.makedirs(folder_path, exist_ok=True)

                    # Download foto
                    for i, img_url in enumerate(img_urls, 1):
                        ext = get_extension(img_url)
                        img_path = os.path.join(folder_path, f"{i}{ext}")
                        try:
                            print(f"  Downloading foto {i}/{len(img_urls)}...")
                            await download_image(session, img_url, img_path)
                        except Exception as e:
                            print(f"  Gagal foto {i}: {e}")

                    # Simpan info.txt
                    with open(os.path.join(folder_path, 'info.txt'), 'w', encoding='utf-8') as f:
                        f.write(f"Judul: {title}\n")
                        f.write(f"URL: {url}\n")
                        f.write(f"Jumlah Foto: {len(img_urls)}\n")
                        f.write(f"URLs Foto:\n")
                        for img_url in img_urls:
                            f.write(f"  {img_url}\n")

                    print(f"  Selesai! {len(img_urls)} foto tersimpan di: downloads/{folder_name}/")

                except Exception as e:
                    print(f"  [ERROR] {url}: {e}")

        await browser.close()

    print("\n\n=== SEMUA SELESAI ===")
    print(f"Hasil download ada di folder: {os.path.abspath(DOWNLOAD_DIR)}")

if __name__ == "__main__":
    asyncio.run(main())
