"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, MessageCircle, ShoppingBag, Check, PackageCheck } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER = "/placeholder-product.svg";

// ─── Festivos & lógica de fecha Colombia ─────────────────────────────────────

const FESTIVOS: string[] = [
  "2026-01-01","2026-01-12","2026-03-23","2026-04-02","2026-04-03",
  "2026-05-01","2026-05-18","2026-06-08","2026-06-15","2026-06-29",
  "2026-07-20","2026-08-07","2026-08-17","2026-10-12","2026-11-02",
  "2026-11-16","2026-12-08","2026-12-25",
];
const DAY_NAMES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MONTH_NAMES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function getColombiaDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + -5 * 3600000);
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function isFestivo(d: Date) { return FESTIVOS.includes(dateKey(d)); }
function isNonBusinessDay(d: Date) { const dow=d.getDay(); return dow===0||dow===6||isFestivo(d); }
function getNextBusinessDay(from: Date) {
  const next=new Date(from); next.setDate(next.getDate()+1);
  while(isNonBusinessDay(next)) next.setDate(next.getDate()+1);
  return next;
}
function formatDay(d: Date) { return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`; }

// ─── Delivery message ─────────────────────────────────────────────────────────

function DeliveryMessage() {
  const [msg, setMsg] = useState<{ label: string; sub: string; urgent: boolean } | null>(null);

  useEffect(() => {
    const d = getColombiaDate();
    if (isNonBusinessDay(d)) {
      const next = getNextBusinessDay(d);
      setMsg({ label: `Enviamos el ${formatDay(next)}`, sub: "siguiente día hábil", urgent: false });
    } else if (d.getHours() < 14) {
      const left = 14 - d.getHours();
      setMsg({ label: "Enviamos HOY", sub: `si confirmas en las próximas ${left} hora${left!==1?"s":""}`, urgent: true });
    } else {
      const next = getNextBusinessDay(d);
      setMsg({ label: `Enviamos el ${formatDay(next)}`, sub: "a primera hora del día", urgent: false });
    }
  }, []);

  if (!msg) return null;

  return (
    <div className={`inline-flex items-center gap-3 rounded-full px-6 py-3 border ${
      msg.urgent
        ? "bg-primary/10 border-primary/25 text-primary"
        : "bg-cream-dark border-cream-dark text-accent"
    }`}>
      <Clock size={15} className={msg.urgent ? "text-primary animate-pulse" : "text-accent"} />
      <span className="text-sm font-semibold">{msg.label}</span>
      <span className="text-xs opacity-70">·</span>
      <span className="text-xs opacity-70">{msg.sub}</span>
    </div>
  );
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function getEntregaItems(product: Product) {
  if (product.entregaInmediataItems && product.entregaInmediataItems.length > 0) {
    return product.entregaInmediataItems
      .filter((item) => item.size && item.color)
      .map((item) => ({
        image: product.images[item.imageIndex] || product.image || PLACEHOLDER,
        size: item.size,
        color: item.color,
      }));
  }
  const colors = product.entregaInmediataColors || "";
  return (product.entregaInmediataSizes || []).map((size) => ({
    image: product.image || PLACEHOLDER,
    size,
    color: colors,
  }));
}

type DisplayItem = { product: Product; item: { image: string; size: string; color: string }; key: string };

function buildDisplayItems(products: Product[]): DisplayItem[] {
  const items: DisplayItem[] = [];
  for (const product of products) {
    const eiItems = getEntregaItems(product);
    for (let i = 0; i < eiItems.length; i++) {
      items.push({ product, item: eiItems[i], key: `${product.id}-${i}` });
    }
  }
  return items;
}

// ─── Boutique Card ────────────────────────────────────────────────────────────

function BoutiqueCard({ product, item, index, whatsappNumber }: {
  product: Product;
  item: { image: string; size: string; color: string };
  index: number;
  whatsappNumber: string;
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: item.image,
      size: item.size,
      color: item.color || undefined,
      collectionName: "Stock Disponible",
      isEntregaInmediata: true,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Hola! Quiero este producto disponible ahora:\n\n"${product.name}"\nOpción: ${item.size}${item.color ? `\nColor: ${item.color}` : ""}\n\n¿Me lo pueden enviar hoy?`;
    window.open(getWhatsAppLink(whatsappNumber, msg), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="group bg-white rounded-2xl overflow-hidden border border-cream-dark hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <SafeImage
          src={item.image}
          alt={product.name}
          fill
          fallbackIconSize={32}
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Stock badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
          <Zap size={9} className="fill-primary" />
          DISPONIBLE
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h4 className="font-semibold text-brown-dark text-sm truncate mb-1">{product.name}</h4>

        {/* Size / Color pills */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cream-dark text-accent">{item.size}</span>
          {item.color && (
            <span className="text-[10px] text-accent truncate">{item.color}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-primary font-bold text-base">{formatPrice(product.price)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              added
                ? "bg-[#25D366] text-white"
                : "bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary"
            }`}
          >
            {added ? <Check size={13} /> : <ShoppingBag size={13} />}
            {added ? "Listo!" : "Agregar"}
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-10 h-9 flex items-center justify-center rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/20 hover:border-[#25D366] transition-all"
            title="Consultar por WhatsApp"
          >
            <MessageCircle size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EntregaInmediata({ products, whatsappNumber }: { products: Product[]; whatsappNumber: string }) {
  const validProducts = (products || []).filter((p) => getEntregaItems(p).length > 0);
  const [allItems, setAllItems] = useState<DisplayItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setAllItems(buildDisplayItems(validProducts));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validProducts.length]);

  if (validProducts.length === 0) return null;

  const INITIAL_COUNT = 8;
  const visibleItems = showAll ? allItems : allItems.slice(0, INITIAL_COUNT);
  const hasMore = allItems.length > INITIAL_COUNT;

  return (
    <section id="stock-disponible" className="py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Subtle background blobs */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PackageCheck size={18} className="text-primary" />
                <span className="text-primary text-xs font-bold tracking-[0.25em] uppercase">Ya está aquí</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-brown-dark leading-tight">
                Listo para{" "}
                <span className="gradient-text">ti hoy</span>
              </h2>
              <p className="text-accent font-light mt-3 max-w-md">
                Estos productos están en stock ahora mismo. Sin esperas, sin pedidos anticipados.
              </p>
            </div>

            {/* Delivery time - right side */}
            <div className="flex-shrink-0">
              <DeliveryMessage />
            </div>
          </div>
        </motion.div>

        {/* Boutique grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {visibleItems.map((entry, i) => (
            <BoutiqueCard
              key={entry.key}
              product={entry.product}
              item={entry.item}
              index={i}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-primary/25 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300"
            >
              {showAll ? "Ver menos" : `Ver los ${allItems.length - INITIAL_COUNT} restantes`}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
