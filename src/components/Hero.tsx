"use client";

import { motion } from "framer-motion";
import { ChevronDown, ShoppingBag, ChevronRight } from "lucide-react";

// Paleta mint editorial — de más oscuro a más claro
const MINT = {
  deep:    "#1A6B62", // verde menta profundo — ancla visual
  mid:     "#2E8077", // medio — tagline principal
  soft:    "#4AADA3", // suave — etiquetas y CTAs
  light:   "#8ED4CF", // claro — textos secundarios
  whisper: "#C8E9E6", // casi blanco — detalles sutiles
};

export default function Hero({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">

      {/* Línea de acento superior */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(to right, ${MINT.deep}, ${MINT.soft}, ${MINT.whisper})` }} />

      {/* Fondo: mancha de color muy sutil en esquina */}
      <div
        className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 40%, ${MINT.whisper}55 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 lg:py-0 lg:min-h-screen flex flex-col lg:flex-row items-center">

        {/* Panel izquierdo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center items-start py-24"
        >
          {/* Etiqueta superior — tono deep */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-10" style={{ background: MINT.deep }} />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: MINT.deep }}>
              Colección 2026
            </span>
          </div>

          {/* Nombre de marca — siempre en el tono original de la marca */}
          <h1
            className="text-[clamp(5rem,14vw,11rem)] font-thin leading-none tracking-[0.12em] uppercase mb-6"
            style={{ color: MINT.soft }}
          >
            SENTIR
          </h1>

          {/* Tagline principal — tono medio */}
          <p className="text-sm font-light tracking-[0.2em] uppercase mb-2" style={{ color: MINT.mid }}>
            Cada sensación tiene un producto.
          </p>

          {/* Tagline secundario — tono claro */}
          <p className="text-sm font-light tracking-widest mb-14" style={{ color: MINT.light }}>
            Moda que se siente · Colombia
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#colecciones"
              className="inline-flex items-center gap-3 text-white px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90"
              style={{ background: MINT.soft }}
            >
              <ShoppingBag size={15} />
              Explorar colecciones
            </a>
            <a
              href="#colecciones"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300"
              style={{ border: `1px solid ${MINT.whisper}`, color: MINT.mid }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = MINT.soft; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = MINT.whisper; }}
            >
              Encuentra tu estilo
              <ChevronRight size={13} />
            </a>
          </div>
        </motion.div>

        {/* Separador vertical — tono whisper */}
        <div className="hidden lg:block w-px h-64 mx-16 self-center" style={{ background: MINT.whisper }} />

        {/* Panel derecho — label en whisper, valor en mid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-12 items-start justify-center py-24 min-w-[240px]"
        >
          {[
            { label: "Colecciones", value: "Activas" },
            { label: "Pedidos", value: "Por WhatsApp" },
            { label: "Entrega", value: "A todo Colombia" },
          ].map((item) => (
            <div key={item.label} className="group">
              <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-2"
                style={{ color: MINT.light }}
              >
                {item.label}
              </p>
              <p className="text-base font-light tracking-wide" style={{ color: MINT.mid }}>
                {item.value}
              </p>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <a href="#marca" className="flex flex-col items-center gap-3 transition-colors duration-300 group"
          style={{ color: MINT.light }}
        >
          <span className="text-[9px] tracking-[0.35em] uppercase font-medium">Descubrir</span>
          <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
        </a>
      </motion.div>
    </section>
  );
}
