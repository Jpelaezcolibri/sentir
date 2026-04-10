"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "fill-secondary text-secondary" : "text-cream-dark fill-cream-dark"}
        />
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  const [featured, ...rest] = testimonials;

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-cream to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-xs font-bold tracking-[0.25em] uppercase">Experiencias reales</span>
          <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mt-4 mb-4">
            Lo que dicen quienes{" "}
            <span className="gradient-text">ya sintieron</span>
          </h2>
          <p className="text-lg text-accent font-light max-w-xl mx-auto">
            No te lo contamos nosotros. Te lo cuentan ellos.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/8 to-secondary/8 border border-primary/15 rounded-3xl p-8 sm:p-12 md:p-14 mb-6 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <Quote size={40} className="text-primary/20 mb-6" />
          <p className="text-xl sm:text-2xl md:text-3xl text-brown-dark leading-relaxed font-light mb-8 relative z-10">
            &ldquo;{featured.text}&rdquo;
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{featured.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-brown-dark">{featured.name}</p>
                <p className="text-sm text-accent">{featured.city}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <StarRow rating={featured.rating} />
              <p className="text-xs text-accent mt-1.5">Compró: {featured.product}</p>
            </div>
          </div>
        </motion.div>

        {/* Rest of testimonials */}
        {rest.length > 0 && (
          <div className={`grid gap-4 ${rest.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
            {rest.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-dark hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <Quote size={20} className="text-primary/20 mb-3" />
                <p className="text-brown-dark text-base leading-relaxed mb-5 font-light">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-brown-dark text-sm">{testimonial.name}</p>
                      <p className="text-xs text-accent">{testimonial.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRow rating={testimonial.rating} />
                    <p className="text-[10px] text-accent mt-1">{testimonial.product}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
