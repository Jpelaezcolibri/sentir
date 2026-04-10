export const dynamic = 'force-dynamic';

import { getCollectionsWithProducts, getQuizOptions, getTestimonials, getBundles, getSiteSettings, getEntregaInmediataProducts } from '@/lib/data';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Quiz from "@/components/Quiz";
import Collections from "@/components/Collections";
import WhyUs from "@/components/WhyUs";
import Bundles from "@/components/Bundles";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import EntregaInmediata from "@/components/EntregaInmediata";

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
      <Hero />
      <EntregaInmediata products={entregaInmediataProducts} whatsappNumber={settings.whatsapp_number} />
      <Quiz quizOptions={quizOptions} collections={collections} whatsappNumber={settings.whatsapp_number} />
      <Collections collections={collections} whatsappNumber={settings.whatsapp_number} />
      <WhyUs />
      <Bundles bundles={bundlesData} whatsappNumber={settings.whatsapp_number} />
      <Testimonials testimonials={testimonials} />
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </main>
  );
}
