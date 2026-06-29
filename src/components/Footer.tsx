import Link from "next/link";
import { siteConfig, footerQuickLinks, footerServices } from "@/data/site-config";
import { prisma } from "@/lib/prisma";
import { SocialLinksRenderer, parseSocialLinks } from "@/components/SocialLinksRenderer";

export async function Footer() {
  const dbSettings = await prisma.setting.findMany();
  const stgs: Record<string, string> = {};
  for (const s of dbSettings) {
    if (s.value !== null) stgs[s.key] = s.value;
  }
  const s = (key: string, fallback: string) => stgs[key] || fallback;
  const socialLinks = parseSocialLinks(stgs["social_links"], {
    instagram: stgs["instagram"] || siteConfig.social.instagram,
    youtube: stgs["youtube"] || siteConfig.social.youtube,
    tiktok: stgs["tiktok"] || siteConfig.social.tiktok,
  });
  return (
    <footer className="bg-bekon-near-black text-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold tracking-[0.18em] text-xl">BEKON</span>
              <span className="block uppercase tracking-[0.06em] text-[9px] text-white/50 mt-0.5">
                Bangun Eka Konstruksi
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mt-4 max-w-xs">
              Mitra terpercaya untuk hunian dan bangunan berkualitas sejak 2009.
            </p>
            <SocialLinksRenderer
              links={socialLinks}
              className="flex gap-4 mt-6"
              iconClassName="text-white/50"
            />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/80">
              Menu Cepat
            </h3>
            <ul className="space-y-3">
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-bekon-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/80">
              Layanan
            </h3>
            <ul className="space-y-3">
              {footerServices.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-white/50 hover:text-bekon-gold transition-colors text-sm"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/80">
              Kontak
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="text-white/50 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-bekon-gold">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {s("alamat", siteConfig.address)}
              </li>
              <li>
                <a
                  href={`tel:${s("telepon", siteConfig.phone1).replace(/\s/g, "")}`}
                  className="text-white/50 hover:text-bekon-gold transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bekon-gold">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {s("telepon", siteConfig.phone1)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${s("email", siteConfig.email)}`}
                  className="text-white/50 hover:text-bekon-gold transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bekon-gold">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {s("email", siteConfig.email)}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={s("maps_url", siteConfig.maps_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bekon-gold hover:text-bekon-gold-light transition-colors text-sm underline underline-offset-2"
                >
                  Google Maps &rarr;
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${s("wa_admin_1", siteConfig.whatsapp1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bekon-whatsapp hover:text-white transition-colors text-sm underline underline-offset-2"
                >
                  WhatsApp &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-xs">{siteConfig.getCopyright()}</p>
        </div>
      </div>
    </footer>
  );
}
