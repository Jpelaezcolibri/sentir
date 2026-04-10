export const dynamic = 'force-dynamic';

import { getCollectionsWithProducts, getQuizOptions, getTestimonials, getBundles, getSiteSettings, getEntregaInmediataProducts } from '@/lib/data';
import Navigation from "@/components/Navigation";
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
      <Navigation collections={collections} />
      <CartDrawer whatsappNumber={settings.whatsapp_number} />

      {/* 1. Hero — bienvenida emocional */}
      <Hero />

      {/* 2. Historia de marca — por qué existe SENTIR */}
      <BrandStory />

      {/* 3. Colecciones — explorar el catálogo */}
      <Collections collections={collections} whatsappNumber={settings.whatsapp_number} />

      {/* 4. Quiz — encontrar el producto ideal */}
      <Quiz quizOptions={quizOptions} collections={collections} whatsappNumber={settings.whatsapp_number} />

      {/* 5. Stock disponible — entrega inmediata */}
      <EntregaInmediata products={entregaInmediataProducts} whatsappNumber={settings.whatsapp_number} />

      {/* 6. Filosofía SENTIR — por qué elegirnos */}
      <WhyUs />

      {/* 7. Combos especiales */}
      <Bundles bundles={bundlesData} whatsappNumber={settings.whatsapp_number} />

      {/* 8. Testimonios — voces reales */}
      <Testimonials testimonials={testimonials} />

      {/* Footer */}
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </main>
  );
}
