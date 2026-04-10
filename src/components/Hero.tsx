"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles, ShoppingBag, MessageCircle, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient — teal/mint de la marca */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D9E8C] via-[#4AADA3] to-[#7EC8A0]" />

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-dark/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-8">
            <Sparkles size={16} className="text-white/90" />
            <span className="text-white/90 text-sm font-medium">Catálogo exclusivo · Compra fácil por WhatsApp</span>
          </div>

          {/* Brand logo text */}
          <h1 className="text-7xl md:text-9xl font-bold text-white mb-4 leading-none tracking-widest drop-shadow-lg">
            sentir
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 font-light tracking-wide">
            Cada producto, una experiencia
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="#colecciones" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-base font-semibold hover:bg-white/90 transition-all hover:scale-105 hover:shadow-xl">
              <ShoppingBag size={18} />
              Ver colecciones
            </a>
            <a href="#quiz" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white/25 transition-all">
              Encuentra tu estilo
              <ChevronRight size={16} />
            </a>
          </div>
        </motion.div>

        {/* Flow hint */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <ShoppingBag size={15} /> Agrega al carrito
          </span>
          <ChevronRight size={12} className="text-white/50" />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <MessageCircle size={15} /> Confirma por WhatsApp
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <a href="#colecciones" className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="text-xs tracking-widest uppercase">Explorar</span>
          <ChevronDown size={20} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
