"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

interface FirstPurchaseBannerProps {
  whatsappNumber: string;
}

export default function FirstPurchaseBanner({ whatsappNumber }: FirstPurchaseBannerProps) {
  const waLink = whatsappNumber
    ? getWhatsAppLink(whatsappNumber, "Hola! Es mi primera compra en SENTIR. Me gustaría aprovechar el descuento.")
    : "#";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-primary"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Texto */}
        <div className="text-center md:text-left">
          <p className="text-white/70 text-[10px] font-semibold tracking-[0.35em] uppercase mb-2">
            Oferta de bienvenida
          </p>
          <h3 className="text-white text-2xl md:text-3xl font-light tracking-wide">
            Primera compra con{" "}
            <span className="font-semibold">descuento especial</span>
          </h3>
          <p className="text-white/70 text-sm font-light mt-2 tracking-wide">
            Menciona <span className="font-semibold text-white">SENTIR10</span> al escribirnos por WhatsApp
          </p>
        </div>

        {/* CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-cream transition-all duration-300 whitespace-nowrap group flex-shrink-0"
        >
          <MessageCircle size={15} />
          Escribir ahora
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.section>
  );
}
