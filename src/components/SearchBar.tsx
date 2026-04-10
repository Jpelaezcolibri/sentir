"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/SafeImage";
import { formatPrice } from "@/lib/utils";
import type { Collection, Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  catalog: string;
  collectionName: string;
  fullProduct: Product;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function QuickAddButton({ product, collectionName }: { product: Product; collectionName: string }) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0] || "U",
      collectionName,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
        added
          ? "bg-[#25D366] text-white"
          : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
      }`}
      title="Agregar al carrito"
    >
      <ShoppingBag size={11} />
      {added ? "¡Listo!" : "Agregar"}
    </button>
  );
}

export default function SearchBar({
  collections,
  inNav = false,
}: {
  collections: Collection[];
  inNav?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allProducts: SearchProduct[] = collections.flatMap((col) =>
    col.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      catalog: p.catalog || "",
      collectionName: col.name,
      fullProduct: p,
    }))
  );

  const filtered =
    query.trim().length >= 2
      ? allProducts
          .filter((p) => {
            const q = normalize(query.trim());
            return (
              normalize(p.name).includes(q) ||
              normalize(p.catalog).includes(q) ||
              normalize(p.collectionName).includes(q)
            );
          })
          .slice(0, 8)
      : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const ResultItem = ({ product, i }: { product: SearchProduct; i: number }) => (
    <div
      className={`flex items-center gap-3 px-4 py-3 hover:bg-cream transition-colors ${
        i < filtered.length - 1 ? "border-b border-cream-dark" : ""
      }`}
    >
      <div className={`rounded-xl overflow-hidden bg-cream-dark flex-shrink-0 relative ${inNav ? "w-10 h-10" : "w-12 h-12"}`}>
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          fallbackIconSize={14}
          sizes="48px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brown-dark truncate">{product.name}</p>
        <p className="text-xs text-accent truncate">
          {product.collectionName}
          {product.catalog ? ` · Ref: ${product.catalog}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
        <QuickAddButton product={product.fullProduct} collectionName={product.collectionName} />
      </div>
    </div>
  );

  const Dropdown = () => (
    <AnimatePresence>
      {isOpen && query.trim().length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-cream-dark overflow-hidden z-50"
        >
          {filtered.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                  {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              {filtered.map((product, i) => (
                <ResultItem key={product.id} product={product} i={i} />
              ))}
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-accent">No encontramos &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-accent/60 mt-1">Intenta con otro nombre o referencia</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (inNav) {
    return (
      <div ref={containerRef} className="relative w-full max-w-xs lg:max-w-sm">
        <div
          className={`flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 border transition-all duration-200 ${
            isOpen || query ? "border-primary/40 shadow-md shadow-primary/10" : "border-cream-dark shadow-sm"
          }`}
        >
          <Search size={15} className="text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => { if (e.key === "Escape") { setIsOpen(false); inputRef.current?.blur(); } }}
            placeholder="Buscar..."
            className="flex-1 bg-transparent text-brown-dark placeholder:text-accent/50 focus:outline-none text-xs min-w-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setIsOpen(false); inputRef.current?.focus(); }}
              className="p-0.5 hover:bg-cream-dark rounded-full transition-colors flex-shrink-0"
              aria-label="Limpiar búsqueda"
            >
              <X size={13} className="text-accent" />
            </button>
          )}
        </div>
        <Dropdown />
      </div>
    );
  }

  return (
    <section className="relative z-30 px-4 py-4 max-w-2xl mx-auto">
      <div ref={containerRef} className="relative">
        <div
          className={`flex items-center gap-3 bg-white rounded-full px-5 py-3.5 shadow-lg border-2 transition-all duration-200 ${
            isOpen || query ? "border-primary/40 shadow-primary/10" : "border-cream-dark"
          }`}
        >
          <Search size={18} className="text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => { if (e.key === "Escape") { setIsOpen(false); inputRef.current?.blur(); } }}
            placeholder="Busca por nombre o referencia..."
            className="flex-1 bg-transparent text-brown-dark placeholder:text-accent/50 focus:outline-none text-sm min-w-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setIsOpen(false); inputRef.current?.focus(); }}
              className="p-1 hover:bg-cream-dark rounded-full transition-colors flex-shrink-0"
              aria-label="Limpiar búsqueda"
            >
              <X size={15} className="text-accent" />
            </button>
          )}
        </div>
        <Dropdown />
      </div>
    </section>
  );
}
