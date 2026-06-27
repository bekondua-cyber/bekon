"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { normalizeWA } from "@/lib/utils";

export function FloatingWhatsApp({ settings: initialSettings }: { settings?: Record<string, string> }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});

  useEffect(() => {
    if (initialSettings) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setSettings(json.data);
      })
      .catch(() => {});
  }, [initialSettings]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-xl border border-gray-100 w-72 overflow-hidden"
              >
                <div className="bg-bekon-whatsapp px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">BEKON</p>
                      <p className="text-white/80 text-xs">Online</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} aria-label="Tutup">
                    <X size={18} className="text-white/70 hover:text-white" />
                  </button>
                </div>
                <div className="px-4 py-4 bg-gray-50">
                  <p className="text-xs text-bekon-text-muted mb-3">
                    Halo! Ada yang bisa kami bantu?
                  </p>
                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${normalizeWA(settings.wa_admin_1 || siteConfig.whatsapp1)}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi%20gratis`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-bekon-gold/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold font-semibold text-xs">
                        {(settings.wa_admin_1_name || siteConfig.whatsapp1_name)[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-bekon-near-black">
                          {settings.wa_admin_1_name || siteConfig.whatsapp1_name}
                        </p>
                        <p className="text-xs text-bekon-text-muted">
                          Chat via WhatsApp
                        </p>
                      </div>
                    </a>
                    <a
                      href={`https://wa.me/${normalizeWA(settings.wa_admin_2 || siteConfig.whatsapp2)}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi%20gratis`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-bekon-gold/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-bekon-sage/10 flex items-center justify-center text-bekon-sage font-semibold text-xs">
                        {(settings.wa_admin_2_name || siteConfig.whatsapp2_name)[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-bekon-near-black">
                          {settings.wa_admin_2_name || siteConfig.whatsapp2_name}
                        </p>
                        <p className="text-xs text-bekon-text-muted">
                          Chat via WhatsApp
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setOpen(!open)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-14 h-14 bg-bekon-whatsapp rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            aria-label={open ? "Tutup chat WhatsApp" : "Hubungi via WhatsApp"}
          >
            {open ? (
              <X size={24} className="text-white" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            )}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
