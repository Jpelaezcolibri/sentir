"use client";

import { motion } from "framer-motion";
import { ChevronDown, ShoppingBag, MessageCircle, ChevronRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#3D9E8C] via-[#4AADA3] to-[#7EC8A0]">
      {/* Organic blob shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-white/6 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-primary-dark/15 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left — Storytelling */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-10">
              <Sparkles size={14} className="text-white/90" />
              <span className="text-white/90 text-sm font-medium">Esencias naturales · Compra fácil por WhatsApp</span>
            </div>

            {/* Brand name */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-none tracking-widest mb-6 drop-shadow-lg">
              sentir
            </h1>

            {/* Emotional taglines */}
            <p className="text-xl md:text-2xl text-white font-light leading-relaxed mb-2">
              Cada sensación tiene un producto.
            </p>
            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-12">
              Cada producto, una historia que vale la pena vivir.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-10">
              <a
                href="#colecciones"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-base font-semibold hover:bg-white/90 transition-all hover:scale-105 hover:shadow-xl"
              >
                <ShoppingBag size={18} />
                Explorar colecciones
              </a>
              <a
                href="#quiz"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white/25 transition-all"
              >
                Encuentra tu estilo
                <ChevronRight size={16} />
              </a>
            </div>

            {/* Flow hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <ShoppingBag size={14} /> Agrega al carrito
              </span>
              <ChevronRight size={11} className="text-white/50" />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <MessageCircle size={14} /> Confirma por WhatsApp
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right — Visual area (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex-1 hidden lg:flex items-center justify-center"
        >
          <div className="relative w-[380px] h-[460px]">
            {/* Outer organic shape */}
            <div
              className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20"
              style={{ borderRadius: "60% 40% 40% 60% / 60% 60% 40% 40%" }}
            />
            {/* Inner shape */}
            <div
              className="absolute inset-10 bg-white/8 border border-white/15 flex items-center justify-center"
              style={{ borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%" }}
            >
              <div className="text-center px-10">
                <div className="text-white/30 text-8xl mb-6 leading-none">✿</div>
                <p className="text-white/75 text-sm font-light leading-loose italic">
                  &ldquo;Productos que despiertan<br />los sentidos y el alma&rdquo;
                </p>
              </div>
            </div>

            {/* Floating pills */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2"
            >
              <span className="text-white text-xs font-semibold">🌿 100% Natural</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2"
            >
              <span className="text-white text-xs font-semibold">✨ Artesanal</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2"
            >
              <span className="text-white text-xs font-semibold">💛 Hecho con amor</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <a href="#marca" className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors">
          <span className="text-[10px] tracking-widest uppercase font-medium">Descubrir</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
