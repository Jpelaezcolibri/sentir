"use client";

import { motion } from "framer-motion";
import { Leaf, Heart, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: Leaf,
    title: "De la naturaleza",
    text: "Cada producto nace de ingredientes seleccionados con cuidado. Lo que la tierra ofrece, nosotros lo transformamos con respeto y conciencia.",
  },
  {
    icon: Heart,
    title: "Hecho con intención",
    text: "No producimos en masa. Cada esencia, cada fórmula, tiene detrás una historia y un propósito. SENTIR no es un catálogo — es una experiencia.",
  },
  {
    icon: Sparkles,
    title: "Para ti, contigo",
    text: "Te acompañamos desde que eliges hasta que recibes. Nuestro equipo está siempre disponible para encontrar exactamente lo que necesitas.",
  },
];

export default function BrandStory() {
  return (
    <section id="marca" className="py-24 md:py-32 bg-white border-t border-black/5">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-primary" />
            <span className="text-primary text-[10px] font-semibold tracking-[0.35em] uppercase">Nuestra historia</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-6 max-w-xl">
            Por qué existe <span className="font-semibold text-primary">SENTIR</span>
          </h2>
          <p className="text-lg text-accent max-w-2xl leading-relaxed font-light">
            Creemos que cada producto debe tener alma. Que lo que usas en tu cuerpo,
            en tu hogar, para las personas que amas — merece ser escogido con cuidado.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              className="bg-white p-10 md:p-12 group hover:bg-cream transition-colors duration-300"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-8 border border-primary/30 group-hover:border-primary group-hover:bg-primary/5 transition-all">
                <pillar.icon size={18} className="text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-4 tracking-wide">{pillar.title}</h3>
              <p className="text-accent leading-relaxed text-sm font-light">{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
