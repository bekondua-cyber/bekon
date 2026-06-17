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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
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
            ? "bg-white/90 backdrop-blur-md border-b border-white/40 shadow-md"
            : "bg-white/50 backdrop-blur-sm border-b border-transparent shadow-none"
        )}
      >
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              aria-label="BEKON Bangun Eka Konstruksi - Beranda"
              className="flex items-center gap-3"
            >
              <div className="flex flex-col leading-none">
                <span className="font-bold tracking-[0.18em] text-xl text-[#1A1A1A]">
                  BEKON
                </span>
                <span className="uppercase tracking-[0.06em] text-[9px] text-[#1A1A1A]">
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
                      "text-sm transition-colors text-[#1A1A1A] hover:text-bekon-gold px-2 py-1",
                      isActive && "text-bekon-gold"
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
                className="px-5 py-2 rounded-full text-sm font-medium bg-[#1A1A1A] text-[#F8F5F0] hover:bg-[#3D3936] hover:-translate-y-0.5 transition-all duration-200"
              >
                Konsultasi Gratis
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -mr-2"
              aria-label="Buka menu navigasi"
            >
              <Menu className="text-bekon-near-black" size={24} />
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
