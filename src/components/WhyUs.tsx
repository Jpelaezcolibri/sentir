"use client";

import { motion } from "framer-motion";
import { Shield, Truck, MessageCircle, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Calidad garantizada",
    description:
      "Cada producto pasa por un control de calidad riguroso antes de llegar a tus manos. Materiales cuidadosamente seleccionados para durar.",
    highlight: "100% verificado",
  },
  {
    icon: Truck,
    title: "Envíos a todo el país",
    description:
      "Despachamos a toda Colombia y al exterior. Seguimiento en tiempo real de tu pedido desde que sale hasta que llega.",
    highlight: "Cobertura nacional",
  },
  {
    icon: MessageCircle,
    title: "Asesoría personalizada",
    description:
      "Nuestro equipo te atiende por WhatsApp para ayudarte a elegir el producto perfecto. Respuesta en menos de 5 minutos.",
    highlight: "Siempre disponibles",
  },
  {
    icon: Star,
    title: "Experiencia de compra fácil",
    description:
      "Elige, agrega al carrito y confirma por WhatsApp. Sin formularios complicados, sin esperas. Tu pedido en simples pasos.",
    highlight: "Simple y rápido",
  },
];

export default function WhyUs() {
  return (
    <section
      id="por-que-nosotros"
      className="py-20 md:py-28 bg-gradient-to-b from-cream-dark to-cream"
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mb-4">
            Por qué elegir <span className="gradient-text">SENTIR</span>?
          </h2>
          <p className="text-lg text-accent max-w-xl mx-auto">
            Más que un catálogo. Una experiencia de compra pensada para ti.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-3xl p-8 hover:shadow-lg transition-shadow group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-primary/20 to-secondary/20"
              >
                <feature.icon
                  size={28}
                  className="text-primary-dark group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                {feature.highlight}
              </div>
              <h3 className="text-2xl font-bold text-brown-dark mb-3">
                {feature.title}
              </h3>
              <p className="text-accent leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
