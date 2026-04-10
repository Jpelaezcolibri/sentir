"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-cream">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mb-4">
            Lo que dicen nuestros{" "}
            <span className="gradient-text">clientes</span>
          </h2>
          <p className="text-lg text-accent">
            Experiencias reales de quienes ya eligieron SENTIR
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote size={24} className="text-primary/30 mb-4" />

              <p className="text-brown-dark text-lg leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brown-dark">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-accent">{testimonial.city}</p>
                </div>
                <div className="text-right">
                  <div className="flex gap-0.5 justify-end mb-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-secondary text-secondary"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-accent">
                    Compró: {testimonial.product}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
