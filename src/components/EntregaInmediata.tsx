"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, ChevronRight, ChevronLeft, ShoppingBag, MessageCircle, Search, X as XIcon } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER = "/placeholder-product.svg";

// Festivos Colombia 2026
const FESTIVOS: string[] = [
  "2026-01-01","2026-01-12","2026-03-23","2026-04-02","2026-04-03",
  "2026-05-01","2026-05-18","2026-06-08","2026-06-15","2026-06-29",
  "2026-07-20","2026-08-07","2026-08-17","2026-10-12","2026-11-02",
  "2026-11-16","2026-12-08","2026-12-25",
];

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getColombiaDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + -5 * 3600000);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isFestivo(d: Date): boolean {
  return FESTIVOS.includes(dateKey(d));
}

function isNonBusinessDay(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6 || isFestivo(d);
}

function getNextBusinessDay(from: Date): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (isNonBusinessDay(next)) next.setDate(next.getDate() + 1);
  return next;
}

function formatDay(d: Date): string {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
}

function TimeIndicator() {
  const [info, setInfo] = useState<{ hour: number; isNonBusiness: boolean; nextBizDay: Date } | null>(null);

  useEffect(() => {
    function calc() {
      const d = getColombiaDate();
      setInfo({ hour: d.getHours(), isNonBusiness: isNonBusinessDay(d), nextBizDay: getNextBusinessDay(d) });
    }
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!info) return null;

  const { hour, isNonBusiness, nextBizDay } = info;

  if (isNonBusiness) {
    return (
      <div className="inline-flex items-center gap-2 text-amber-200/80 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium">
        <Clock size={16} />
        <span>Este pedido se envía el {formatDay(nextBizDay)}</span>
      </div>
    );
  }

  const cutoff = 14;
  const isBefore2pm = hour < cutoff;
  const hoursLeft = cutoff - hour;

  if (isBefore2pm) {
    return (
      <div className="inline-flex items-center gap-2 text-amber-300 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium">
        <Clock size={16} className="animate-pulse text-amber-400" />
        <span>
          {hoursLeft <= 1 ? "Última hora para envío hoy!" : `Quedan ${hoursLeft} horas para envío hoy`}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-amber-200/80 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium">
      <Clock size={16} />
      <span>Pedidos de hoy se envían el {formatDay(nextBizDay)} a primera hora</span>
    </div>
  );
}

function DeliverySubtitle() {
  const [text, setText] = useState<{ main: string; highlight: string; rest: string } | null>(null);

  useEffect(() => {
    const d = getColombiaDate();
    if (isNonBusinessDay(d)) {
      const nextBiz = getNextBusinessDay(d);
      setText({ main: "Los enviamos el ", highlight: formatDay(nextBiz).toUpperCase(), rest: " (siguiente día hábil)" });
    } else if (d.getHours() < 14) {
      setText({ main: "Los enviamos ", highlight: "HOY", rest: " si pides antes de las 2:00 PM" });
    } else {
      const nextBiz = getNextBusinessDay(d);
      setText({ main: "Los enviamos ", highlight: formatDay(nextBiz).toUpperCase(), rest: " a primera hora" });
    }
  }, []);

  if (!text) return (
    <p className="text-white/60 max-w-xl mx-auto text-base sm:text-lg">
      Estos productos ya están disponibles y listos para ti
    </p>
  );

  return (
    <p className="text-white/60 max-w-xl mx-auto text-base sm:text-lg">
      Disponibles ahora.{" "}
      {text.main}
      <strong className="text-amber-400">{text.highlight}</strong>
      {text.rest}
    </p>
  );
}

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

function ImmediateCard({
  product,
  item,
  index,
  whatsappNumber,
}: {
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
    const msg = `Hola! Quiero este producto con ENVIO HOY:\n\n"${product.name}"\nTalla/Opción: ${item.size}\n${item.color ? `Color: ${item.color}\n` : ""}\nMe lo pueden enviar hoy?`;
    const url = getWhatsAppLink(whatsappNumber, msg);
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 overflow-hidden hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 flex-shrink-0 w-[260px] sm:w-auto snap-start"
    >
      {/* Image — no link */}
      <div className="relative aspect-square overflow-hidden">
        <SafeImage
          src={item.image}
          alt={product.name}
          fill
          fallbackIconSize={32}
          className="object-cover hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 33vw, 25vw"
        />
        <span className="absolute top-2 left-2 bg-amber-400 text-brown-dark text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1">
          <Zap size={10} /> STOCK
        </span>
      </div>

      <div className="p-3 sm:p-4 space-y-2.5">
        <h4 className="text-sm font-semibold text-white truncate">
          {product.name}
        </h4>

        <p className="text-lg font-bold text-amber-400">{formatPrice(product.price)}</p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white border border-white/20">
              {item.size}
            </span>
            {item.color && (
              <span className="text-xs text-white/70">{item.color}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            added
              ? "bg-emerald-500 text-white"
              : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
          }`}
        >
          <ShoppingBag size={14} />
          {added ? "Agregado!" : "Agregar al carrito"}
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-brown-dark py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-400/20"
        >
          <MessageCircle size={14} />
          Lo quiero hoy
        </button>
      </div>
    </motion.div>
  );
}

const SEARCH_PLACEHOLDERS = [
  "¿Qué talla buscas?",
  "¿Qué color te gusta?",
  "¿Qué producto buscas?",
];

function StockSearchBar({
  allItems,
  onFilter,
}: {
  allItems: { product: Product; item: { image: string; size: string; color: string }; key: string }[];
  onFilter: (filtered: typeof allItems) => void;
}) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) return;
    const id = setInterval(() => {
      setPlaceholderIdx((p) => (p + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [isFocused]);

  const availableSizes = [...new Set(allItems.map((e) => e.item.size))].sort();
  const availableColors = (() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const e of allItems) {
      const c = e.item.color?.trim();
      if (!c) continue;
      const key = c.toLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(c); }
    }
    return result.slice(0, 8);
  })();

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) { onFilter(allItems); return; }
    const isExactSize = availableSizes.some((s) => s.toLowerCase() === q);
    if (isExactSize) { onFilter(allItems.filter((e) => e.item.size.toLowerCase() === q)); return; }
    const isExactColor = availableColors.some((c) => c.toLowerCase() === q);
    if (isExactColor) { onFilter(allItems.filter((e) => e.item.color.toLowerCase() === q)); return; }
    onFilter(allItems.filter((e) =>
      e.item.size.toLowerCase().includes(q) ||
      e.item.color.toLowerCase().includes(q) ||
      e.product.name.toLowerCase().includes(q)
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, allItems.length]);

  const handleChip = (value: string) => {
    setQuery((prev) => (prev === value ? "" : value));
    inputRef.current?.focus();
  };

  return (
    <div className="mb-8 sm:mb-10">
      <div className="relative max-w-lg mx-auto">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/35 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
            <XIcon size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {availableSizes.length > 0 && (
          <>
            <span className="text-white/40 text-xs self-center mr-1">Talla:</span>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleChip(size)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  query === size ? "bg-amber-400 text-brown-dark border-amber-400" : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                }`}
              >
                {size}
              </button>
            ))}
          </>
        )}
        {availableColors.length > 0 && (
          <>
            <span className="text-white/40 text-xs self-center ml-2 mr-1">Color:</span>
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleChip(color)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  query === color ? "bg-amber-400 text-brown-dark border-amber-400" : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                }`}
              >
                {color}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function useItemsPerPage() {
  const [perPage, setPerPage] = useState(4);
  useEffect(() => {
    function calc() {
      const w = window.innerWidth;
      if (w >= 1280) return 4;
      if (w >= 1024) return 3;
      return 2;
    }
    setPerPage(calc());
    const onResize = () => setPerPage(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return perPage;
}

type DisplayItem = { product: Product; item: { image: string; size: string; color: string }; key: string };

function buildDisplayItems(products: Product[]) {
  const items: DisplayItem[] = [];
  for (const product of products) {
    const eiItems = getEntregaItems(product);
    for (let i = 0; i < eiItems.length; i++) {
      items.push({ product, item: eiItems[i], key: `${product.id}-${i}` });
    }
  }
  return items;
}

function DesktopCarouselFiltered({
  items,
  whatsappNumber,
}: {
  items: DisplayItem[];
  whatsappNumber: string;
}) {
  const perPage = useItemsPerPage();
  const totalPages = Math.ceil(items.length / perPage);
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [items.length]);
  useEffect(() => { setPage((prev) => Math.min(prev, Math.max(0, totalPages - 1))); }, [totalPages]);

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]);

  const start = page * perPage;
  const visible = items.slice(start, start + perPage);

  return (
    <div className="hidden sm:block relative">
      {page > 0 && (
        <button onClick={goPrev} className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110" aria-label="Anterior">
          <ChevronLeft size={20} />
        </button>
      )}
      {page < totalPages - 1 && (
        <button onClick={goNext} className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110" aria-label="Siguiente">
          <ChevronRight size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${page}-${items.length}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {visible.map((entry, i) => (
            <ImmediateCard key={entry.key} product={entry.product} item={entry.item} index={i} whatsappNumber={whatsappNumber} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-amber-400" : "w-2 bg-white/30 hover:bg-white/50"}`} aria-label={`Pagina ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EntregaInmediata({
  products,
  whatsappNumber,
}: {
  products: Product[];
  whatsappNumber: string;
}) {
  const validProducts = (products || []).filter((p) => getEntregaItems(p).length > 0);
  const allItems = buildDisplayItems(validProducts);
  const [filteredItems, setFilteredItems] = useState(allItems);

  useEffect(() => {
    setFilteredItems(buildDisplayItems(validProducts));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validProducts.length]);

  if (validProducts.length === 0) return null;

  return (
    <section id="stock-disponible" className="py-20 md:py-28 bg-[#0d2626] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
      </div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap size={14} />
            En stock ahora
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Disponibles ahora, <span className="text-amber-400">entrega inmediata</span>
          </h2>
          <DeliverySubtitle />

          <div className="mt-6 flex justify-center">
            <TimeIndicator />
          </div>
        </motion.div>

        <StockSearchBar allItems={allItems} onFilter={setFilteredItems} />

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50 text-sm">No encontramos productos con esos criterios.</p>
            <p className="text-white/30 text-xs mt-1">Intenta con otros filtros.</p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <>
            <div className="sm:hidden -mx-4 px-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                {filteredItems.map((entry, i) => (
                  <ImmediateCard key={entry.key} product={entry.product} item={entry.item} index={i} whatsappNumber={whatsappNumber} />
                ))}
              </div>
            </div>
            <DesktopCarouselFiltered items={filteredItems} whatsappNumber={whatsappNumber} />
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="#colecciones"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-amber-400 transition font-medium"
          >
            Ver todas las colecciones
            <ChevronRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
