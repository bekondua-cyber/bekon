import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* Satu-satunya <main> di rute ini, dan pemegang anchor "#main" yang
          dituju skip link di root layout. Navbar dan Footer sengaja berada di
          luar: keduanya bukan konten utama. */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ChatbotWidget />
      <FloatingWhatsApp />
    </>
  );
}
