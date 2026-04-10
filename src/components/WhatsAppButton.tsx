"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

export default function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}
            className="absolute bottom-full right-0 mb-3 bg-white rounded-2xl shadow-xl p-4 w-64"
          >
            <button onClick={() => setShowTooltip(false)} className="absolute top-2 right-2 text-accent hover:text-brown-dark">
              <X size={14} />
            </button>
            <p className="text-sm text-brown-dark font-medium mb-1">¿Necesitas ayuda?</p>
            <p className="text-xs text-accent">Escríbenos por WhatsApp y te asesoramos con tu compra.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={getWhatsAppLink(whatsappNumber, "Hola! Quiero información sobre los productos SENTIR.")}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pulse flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        onClick={() => setShowTooltip(false)}
        aria-label="Escríbenos por WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
