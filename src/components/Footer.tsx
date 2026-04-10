"use client";

import { Instagram, MessageCircle, Heart, Music2 } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import type { SiteSettings } from "@/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-brown-dark text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para encontrar tu producto favorito?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Escríbenos y te asesoramos gratis. Sin presión, sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppLink(
                settings.whatsapp_number,
                "Hola! Quiero información sobre los productos SENTIR."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              <MessageCircle size={20} />
              Escribir por WhatsApp
            </a>
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-semibold transition-all"
              >
                <Instagram size={20} />
                Síguenos en Instagram
              </a>
            )}
          </div>
          {settings.tiktok_url && (
            <a
              href={settings.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mt-4 text-sm transition-colors"
            >
              <Music2 size={16} />
              También estamos en TikTok
              {settings.tiktok_handle ? ` @${settings.tiktok_handle}` : ""}
            </a>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
                SENTIR
              </span>
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {settings.site_description || "Cada producto, una experiencia. Calidad, diseño y atención personalizada en cada pedido."}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">
              Navegación rápida
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#quiz" className="hover:text-white transition-colors">
                  Encuentra tu estilo
                </a>
              </li>
              <li>
                <a href="#colecciones" className="hover:text-white transition-colors">
                  Colecciones
                </a>
              </li>
              <li>
                <a href="#por-que-nosotros" className="hover:text-white transition-colors">
                  Por qué SENTIR
                </a>
              </li>
              <li>
                <a href="#bundles" className="hover:text-white transition-colors">
                  Combos especiales
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">
              Encuéntranos en
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="text-[#25D366]" />
                <a
                  href={getWhatsAppLink(settings.whatsapp_number, "Hola! Quiero información.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              {settings.instagram_handle && (
                <li className="flex items-center gap-2">
                  <Instagram size={14} className="text-primary-light" />
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    @{settings.instagram_handle}
                  </a>
                </li>
              )}
              {settings.tiktok_handle && (
                <li className="flex items-center gap-2">
                  <Music2 size={14} className="text-white/80" />
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    @{settings.tiktok_handle}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-6 bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/50">
                Envíos a toda Colombia
                <br />
                Pago: Nequi, Daviplata, Transferencia
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-sm text-white/40 flex items-center justify-center gap-1">
            Hecho con <Heart size={12} className="text-primary fill-primary" />{" "}
            en Colombia &copy; {new Date().getFullYear()} SENTIR
          </p>
        </div>
      </div>
    </footer>
  );
}
