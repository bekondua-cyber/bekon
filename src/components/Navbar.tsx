"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/site-config";
import { cn } from "@/lib/utils";

const portfolioDropdown = [
  { label: "Semua Portfolio", href: "/portfolio" },
  { label: "Eksterior", href: "/portfolio?category=eksterior" },
  { label: "Interior", href: "/portfolio?category=interior" },
  { label: "Bangun", href: "/portfolio?category=bangun" },
  { label: "Renovasi", href: "/portfolio?category=renovasi" },
  { label: "Kost & Ruko", href: "/portfolio?category=kost-ruko" },
];

const videoDropdown = [
  { label: "Semua Video", href: "/video" },
  { label: "Home Tour", href: "/video#hometour" },
  { label: "3D Desain", href: "/video#3d-desain" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Navigasi utama"
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300"
      >
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              aria-label="BEKON - Bangun Eka Konstruksi"
              className="flex items-center gap-2 md:gap-3"
            >
              <div className="flex-shrink-0">
                {logoError ? (
                  <div className="w-10 h-10 bg-bekon-gold rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                ) : (
                  <Image
                    src="/logo-icon.png"
                    alt="BEKON Logo"
                    width={40}
                    height={40}
                    className="object-contain md:w-12 md:h-12"
                    priority
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-base md:text-xl tracking-wide">
                  BEKON
                </span>
                <span className="text-gray-400 text-[9px] md:text-xs leading-tight">
                  Bangun Eka Konstruksi
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                if (link.href === "/portfolio") {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setPortfolioOpen(true)}
                      onMouseLeave={() => setPortfolioOpen(false)}
                    >
                      <button
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors text-white/90 hover:text-bekon-gold px-2 py-1",
                          (isActive("/portfolio") || portfolioOpen) && "text-bekon-gold"
                        )}
                      >
                        Portfolio
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            portfolioOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {portfolioOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                          >
                            {portfolioDropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "block px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0",
                                  isActive(item.href)
                                    ? "text-bekon-gold bg-white/5"
                                    : "text-white/80 hover:text-bekon-gold hover:bg-white/5"
                                )}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                if (link.href === "/video") {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setVideoOpen(true)}
                      onMouseLeave={() => setVideoOpen(false)}
                    >
                      <button
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors text-white/90 hover:text-bekon-gold px-2 py-1",
                          (isActive("/video") || videoOpen) && "text-bekon-gold"
                        )}
                      >
                        Video
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            videoOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {videoOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                          >
                            {videoDropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "block px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0",
                                  isActive(item.href)
                                    ? "text-bekon-gold bg-white/5"
                                    : "text-white/80 hover:text-bekon-gold hover:bg-white/5"
                                )}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors text-white/90 hover:text-bekon-gold px-2 py-1",
                      isActive(link.href) && "text-bekon-gold"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <Link
                href="/kontak"
                className="px-5 py-2 rounded-full text-sm font-medium bg-bekon-gold text-bekon-near-black hover:bg-bekon-gold-dark hover:-translate-y-0.5 transition-all duration-200"
              >
                Konsultasi Gratis
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -mr-2"
              aria-label="Buka menu navigasi"
            >
              <Menu className="text-white" size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
              <span className="font-bold tracking-[0.18em] text-xl text-white">
                BEKON
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Tutup menu">
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-7 px-6">
              {navLinks.map((link, i) => {
                if (link.href === "/portfolio") {
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="text-center"
                    >
                      <span
                        className={cn(
                          "font-display text-[36px] font-light transition-colors",
                          isActive("/portfolio")
                            ? "text-bekon-gold"
                            : "text-white/90"
                        )}
                      >
                        Portfolio
                      </span>
                      <div className="mt-4 flex flex-col items-center gap-3">
                        {portfolioDropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "text-sm transition-colors",
                              isActive(item.href)
                                ? "text-bekon-gold"
                                : "text-white/60 hover:text-bekon-gold"
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  );
                }
                if (link.href === "/video") {
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="text-center"
                    >
                      <span
                        className={cn(
                          "font-display text-[36px] font-light transition-colors",
                          isActive("/video")
                            ? "text-bekon-gold"
                            : "text-white/90"
                        )}
                      >
                        Video
                      </span>
                      <div className="mt-4 flex flex-col items-center gap-3">
                        {videoDropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "text-sm transition-colors",
                              isActive(item.href)
                                ? "text-bekon-gold"
                                : "text-white/60 hover:text-bekon-gold"
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "transition-colors text-center font-display text-[36px] font-light",
                        isActive(link.href)
                          ? "text-bekon-gold"
                          : "text-white hover:text-bekon-gold"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06, duration: 0.3 }}
              >
                <Link
                  href="/kontak"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "transition-colors text-center font-display text-[36px] font-light",
                    isActive("/kontak")
                      ? "text-bekon-gold"
                      : "text-white hover:text-bekon-gold"
                  )}
                >
                  Konsultasi Gratis
                </Link>
              </motion.div>
            </div>

            <div className="px-6 pb-8 text-center">
              <p className="text-white/40 text-xs">
                &copy; {new Date().getFullYear()} Bangun Eka Konstruksi
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
