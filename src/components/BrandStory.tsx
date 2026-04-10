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
    <section id="marca" className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">Nuestra historia</span>
          <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mt-4 mb-6">
            Por qué existe <span className="gradient-text">SENTIR</span>
          </h2>
          <p className="text-lg md:text-xl text-accent max-w-2xl mx-auto leading-relaxed font-light">
            Creemos que cada producto debe tener alma. Que lo que usas en tu cuerpo,
            en tu hogar, para las personas que amas — merece ser escogido con cuidado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group text-center p-8 md:p-10 rounded-3xl hover:bg-cream transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto mb-7 group-hover:scale-110 transition-transform duration-300">
                <pillar.icon size={26} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-brown-dark mb-4">{pillar.title}</h3>
              <p className="text-accent leading-relaxed text-sm font-light">{pillar.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="mt-20 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
      </div>
    </section>
  );
}
