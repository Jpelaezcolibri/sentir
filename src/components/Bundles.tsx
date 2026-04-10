"use client";

import { motion } from "framer-motion";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import type { Bundle } from "@/types";
import { Package, MessageCircle, Truck } from "lucide-react";

export default function Bundles({ bundles, whatsappNumber }: { bundles: Bundle[]; whatsappNumber: string }) {
  if (!bundles || bundles.length === 0) return null;

  return (
    <section id="bundles" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mb-4">
            Combos <span className="gradient-text">especiales</span>
          </h2>
          <p className="text-lg text-accent max-w-xl mx-auto">
            Ahorra combinando tus favoritos. Más productos, mejor precio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {bundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative rounded-3xl p-8 border-2 transition-shadow hover:shadow-xl ${
                index === 1
                  ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30 shadow-lg"
                  : "bg-white border-cream-dark"
              }`}
            >
              {index === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                  MÁS POPULAR
                </span>
              )}

              <Package
                size={32}
                className={index === 1 ? "text-primary" : "text-accent"}
              />

              <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">
                {bundle.name}
              </h3>
              <p className="text-sm text-accent mb-4">{bundle.description}</p>

              <ul className="space-y-2 mb-6">
                {bundle.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-brown-dark"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(bundle.bundlePrice)}
                  </span>
                  <span className="text-sm text-accent line-through">
                    {formatPrice(bundle.originalPrice)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#25D366]">
                  Ahorras {formatPrice(bundle.saving)}
                </span>
              </div>

              <a
                href={getWhatsAppLink(
                  whatsappNumber,
                  `Hola! Me interesa el combo "${bundle.name}" por ${formatPrice(bundle.bundlePrice)}. Quiero más información.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-all hover:scale-[1.02] ${
                  index === 1
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-cream-dark text-brown-dark hover:bg-cream"
                }`}
              >
                <MessageCircle size={16} />
                Lo quiero
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#25D366]/10 to-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left"
        >
          <Truck size={32} className="text-[#25D366]" />
          <div>
            <p className="text-lg font-bold text-brown-dark">
              Envíos Nacionales e Internacionales
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
