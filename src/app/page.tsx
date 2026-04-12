export const dynamic = 'force-dynamic';

import { getCollectionsWithProducts, getQuizOptions, getTestimonials, getBundles, getSiteSettings, getEntregaInmediataProducts } from '@/lib/data';
import Navigation from "@/components/Navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import BrandStory from "@/components/BrandStory";
import Collections from "@/components/Collections";
import Quiz from "@/components/Quiz";
import EntregaInmediata from "@/components/EntregaInmediata";
import WhyUs from "@/components/WhyUs";
import Bundles from "@/components/Bundles";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import FirstPurchaseBanner from "@/components/FirstPurchaseBanner";
import EditorialBanner from "@/components/EditorialBanner";

export default async function Home() {
  const [collections, quizOptions, testimonials, bundlesData, settings, entregaInmediataProducts] = await Promise.all([
    getCollectionsWithProducts(),
    getQuizOptions(),
    getTestimonials(),
    getBundles(),
    getSiteSettings(),
    getEntregaInmediataProducts(),
  ]);

  return (
    <main>
      <AnnouncementBar />
      <Navigation collections={collections} whatsappNumber={settings.whatsapp_number} />
      <CartDrawer whatsappNumber={settings.whatsapp_number} />

      {/* 1. Hero — bienvenida editorial */}
      <Hero whatsappNumber={settings.whatsapp_number} />

      {/* 2. Banner de primera compra */}
      <FirstPurchaseBanner whatsappNumber={settings.whatsapp_number} />

      {/* 3. Historia de marca */}
      <BrandStory />

      {/* 4. Colecciones */}
      <Collections collections={collections} whatsappNumber={settings.whatsapp_number} />

      {/* 6. Quiz — oculto temporalmente */}

      {/* 7. Stock disponible — oculto temporalmente */}

      {/* 8. Banner editorial — Por qué SENTIR */}
      <EditorialBanner
        eyebrow="Filosofía SENTIR"
        headline="Productos que despiertan los sentidos."
        subline="Ingredientes naturales, procesos conscientes, entrega a tu puerta en todo Colombia."
        cta="Conocernos"
        href="#por-que-nosotros"
        variant="accent"
      />

      {/* 9. Por qué elegirnos */}
      <WhyUs />

      {/* 10. Combos especiales */}
      <Bundles bundles={bundlesData} whatsappNumber={settings.whatsapp_number} />

      {/* 11. Testimonios */}
      <Testimonials testimonials={testimonials} />

      {/* Footer */}
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </main>
  );
}
