"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const messages = [
  "Envío disponible a todo Colombia",
  "Personalización disponible en productos seleccionados",
  "Pedidos por WhatsApp — respuesta en menos de 5 minutos",
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#111111] text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center relative">
        <p
          className="text-[11px] font-light tracking-[0.25em] uppercase transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[current]}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
