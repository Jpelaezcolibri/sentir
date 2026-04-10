"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Sparkles, Clock } from "lucide-react";

const messages = [
  { icon: Truck, text: "Envío disponible a todo Colombia" },
  { icon: Sparkles, text: "Personalización disponible en productos seleccionados" },
  { icon: Clock, text: "Pedidos por WhatsApp — respuesta en menos de 5 minutos" },
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const { icon: Icon, text } = messages[current];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-brown-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium"
          >
            <Icon size={14} className="text-primary-light flex-shrink-0" />
            <span>{text}</span>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
