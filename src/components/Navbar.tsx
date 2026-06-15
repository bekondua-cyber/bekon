"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/site-config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-bekon-off-white/95 backdrop-blur-md shadow-sm border-b border-bekon-border"
            : isHome
              ? "bg-transparent"
              : "bg-bekon-off-white/95 backdrop-blur-md border-b border-bekon-border"
        )}
      >
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              aria-label="BEKON - Beranda"
              className="flex items-center gap-3"
            >
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "font-bold tracking-[0.18em] text-xl transition-colors",
                    scrolled || !isHome
                      ? "text-bekon-near-black"
                      : "text-white"
                  )}
                >
                  BEKON
                </span>
                <span
                  className={cn(
                    "uppercase tracking-[0.06em] text-[9px] transition-colors",
                    scrolled || !isHome
                      ? "text-bekon-text-muted"
                      : "text-white/60"
                  )}
                >
                  Bangun Eka Konstruksi
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-sm transition-colors group",
                      scrolled || !isHome
                        ? "text-bekon-text-secondary hover:text-bekon-gold"
                        : "text-white/90 hover:text-white",
                      isActive && "text-bekon-gold"
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-0 w-0 h-px bg-bekon-gold transition-all duration-300 group-hover:w-full",
                        isActive && "w-full"
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <Link
                href="/kontak"
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  scrolled || !isHome
                    ? "bg-bekon-gold text-white hover:bg-bekon-gold-dark hover:-translate-y-0.5"
                    : "border border-white text-white hover:bg-white hover:text-bekon-near-black"
                )}
              >
                Konsultasi Gratis
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -mr-2"
              aria-label="Buka menu navigasi"
            >
              <Menu
                className={cn(
                  "transition-colors",
                  scrolled || !isHome ? "text-bekon-near-black" : "text-white"
                )}
                size={24}
              />
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
            className="fixed inset-0 z-[100] bg-bekon-near-black flex flex-col"
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
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="text-white hover:text-bekon-gold transition-colors text-center font-display text-[36px] font-light"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.a
                href="/kontak"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06 + 0.1 }}
                className="mt-4 px-8 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium"
              >
                Konsultasi Gratis
              </motion.a>
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
