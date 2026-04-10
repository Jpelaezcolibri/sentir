"use client";

import { motion } from "framer-motion";
import { Truck, MessageCircle, Star, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Calidad que se siente",
    text: "Cada producto pasa por un control riguroso antes de llegar a tus manos. Materiales seleccionados con criterio, no con prisa. Cuando abres tu pedido SENTIR, lo notas.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Siempre hay alguien para ti",
    text: "No somos un chatbot. Somos personas reales que responden en menos de 5 minutos por WhatsApp. Te ayudamos a elegir, resolver dudas y asegurarnos de que quedes feliz.",
  },
  {
    icon: Truck,
    number: "03",
    title: "Llegamos donde estés",
    text: "Enviamos a toda Colombia y al exterior. Seguimiento en tiempo real, empaque cuidadoso, y la tranquilidad de saber que tu pedido está en buenas manos.",
  },
  {
    icon: Star,
    number: "04",
    title: "Comprar no debería ser difícil",
    text: "Elige lo que quieres, agrégalo al carrito, y confirma por WhatsApp. Sin formularios interminables, sin esperas. Tu pedido listo en minutos.",
  },
];

export default function WhyUs() {
  return (
    <section id="por-que-nosotros" className="py-24 md:py-32 bg-gradient-to-b from-white to-cream relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-xs font-bold tracking-[0.25em] uppercase">La filosofía SENTIR</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mt-4 leading-tight">
              Más que un catálogo.<br />
              <span className="gradient-text">Una experiencia.</span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-accent leading-relaxed font-light lg:pb-2"
          >
            Construimos SENTIR con una convicción: que cada persona merece una experiencia
            de compra que la haga sentir bien desde el primer clic hasta que abre su pedido.
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group bg-white rounded-3xl p-8 md:p-10 hover:shadow-lg transition-all duration-300 border border-cream-dark hover:border-primary/20"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <pillar.icon size={22} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-primary/40 text-xs font-bold tracking-widest">{pillar.number}</span>
                  <h3 className="text-lg font-bold text-brown-dark mt-1 mb-3">{pillar.title}</h3>
                  <p className="text-accent text-sm leading-relaxed font-light">{pillar.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
