"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Halo! Saya asisten AI BEKON. Ada yang bisa saya bantu seputar layanan kami?" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!mounted) return null;

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8),
        }),
      });
      const json = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.reply || json.error || "Maaf, terjadi kesalahan." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, koneksi bermasalah. Silakan coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-xl border border-gray-100 w-80 sm:w-96 overflow-hidden flex flex-col"
                style={{ height: 420 }}
              >
                <div className="bg-bekon-near-black px-4 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-bekon-gold/20 flex items-center justify-center">
                      <Bot size={18} className="text-bekon-gold" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Asisten BEKON</p>
                      <p className="text-white/60 text-xs">AI Assistant</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} aria-label="Tutup">
                    <X size={18} className="text-white/70 hover:text-white" />
                  </button>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          m.role === "user"
                            ? "bg-bekon-gold text-white"
                            : "bg-white border border-gray-200 text-bekon-near-black"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">
                        Mengetik...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    placeholder="Tulis pertanyaan..."
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-full bg-bekon-gold flex items-center justify-center text-white disabled:opacity-40 shrink-0"
                    aria-label="Kirim"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setOpen(!open)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-14 h-14 bg-bekon-near-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            aria-label={open ? "Tutup chatbot" : "Buka chatbot AI"}
          >
            {open ? <X size={24} className="text-white" /> : <Bot size={24} className="text-bekon-gold" />}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
