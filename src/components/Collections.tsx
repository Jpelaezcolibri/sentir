"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import type { Collection, Product } from "@/types";
import { X, MessageCircle, ChevronRight, Check, ShoppingBag, Zap } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER = "/placeholder-product.svg";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCollectionCover(collection: Collection): string {
  for (const p of collection.products) {
    if (p.coverImage) return p.coverImage;
  }
  for (const p of collection.products) {
    if (p.image && p.image !== PLACEHOLDER) return p.image;
  }
  return PLACEHOLDER;
}

// ─── Badges ─────────────────────────────────────────────────────────────────

function ProductBadges({ product }: { product: Product }) {
  return (
    <>
      {product.isNew && (
        <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-10">
          NUEVO
        </span>
      )}
      {product.isPersonalizable && !product.isNew && (
        <span className="absolute top-2 right-2 bg-secondary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-10">
          PERSONAL.
        </span>
      )}
      {product.isEntregaInmediata && (
        <span className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-0.5">
          <Zap size={10} /> STOCK
        </span>
      )}
    </>
  );
}

// ─── Add to Cart ─────────────────────────────────────────────────────────────

function AddToCartButton({ product, collectionName }: { product: Product; collectionName: string }) {
  const { addItem, openCart } = useCart();
  const [showPopover, setShowPopover] = useState(false);
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const colorOptions = (() => {
    if (!product.colors) return [];
    let raw: string[] = [];
    const trimmed = product.colors.trim();
    if (trimmed.startsWith("[")) {
      try { raw = JSON.parse(trimmed); } catch { raw = [trimmed]; }
    } else {
      raw = trimmed.split(",").map((c) => c.trim());
    }
    return raw.filter((c) => {
      if (!c) return false;
      const norm = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z ]/g, "").trim();
      return !norm.includes("segun disponibilidad");
    });
  })();
  const needsColor = colorOptions.length > 1;

  const handleAdd = (size: string, color?: string) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      color: color || (colorOptions.length === 1 ? colorOptions[0] : undefined),
      collectionName,
      isEntregaInmediata: product.isEntregaInmediata || collectionName === "Stock Disponible",
    });
    setShowPopover(false);
    setPickedSize(null);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSizeClick = (size: string) => {
    if (needsColor) setPickedSize(size);
    else handleAdd(size);
  };

  if (added) {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold"
      >
        <Check size={14} />
        <span>Agregado!</span>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (product.sizes.length === 1 && !needsColor) handleAdd(product.sizes[0]);
          else if (product.sizes.length === 1 && needsColor) { setPickedSize(product.sizes[0]); setShowPopover(true); }
          else { setShowPopover(!showPopover); setPickedSize(null); }
        }}
        className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-full transition-all text-[10px] sm:text-xs font-bold hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      >
        <ShoppingBag size={14} />
        <span>Agregar</span>
      </button>
      {showPopover && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-white border border-cream-dark rounded-xl shadow-xl p-3 z-20 min-w-[140px]"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {!pickedSize ? (
            <>
              <p className="text-[10px] text-accent mb-1.5 font-semibold uppercase tracking-wide">
                {product.sizes.length > 1 ? "Elige tu talla:" : "Confirmar:"}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSizeClick(size); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cream hover:bg-primary hover:text-white transition-all text-brown-dark hover:scale-105"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] text-accent mb-1.5 font-semibold uppercase tracking-wide">
                {pickedSize} — Elige color:
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(pickedSize, color); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cream hover:bg-primary hover:text-white transition-all text-brown-dark hover:scale-105"
                  >
                    {color}
                  </button>
                ))}
              </div>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickedSize(null); }}
                className="text-[10px] text-primary mt-2 hover:underline"
              >
                Cambiar talla
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Product Card (inside modal) ─────────────────────────────────────────────

function ProductCard({ product, collectionName, index }: { product: Product; collectionName: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="product-card bg-white rounded-2xl overflow-hidden group"
    >
      <div className="relative aspect-square bg-cream-dark overflow-hidden">
        {product.image && product.image !== PLACEHOLDER ? (
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            fallbackIconSize={32}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={32} className="text-accent/30" />
          </div>
        )}
        <ProductBadges product={product} />
      </div>
      <div className="p-2.5 sm:p-3">
        <h4 className="font-semibold text-brown-dark text-xs sm:text-sm truncate">{product.name}</h4>
        {product.story && (
          <p className="text-[10px] sm:text-xs text-accent mt-0.5 line-clamp-1 italic">{product.story}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-xs sm:text-sm">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} collectionName={collectionName} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Collection Modal ─────────────────────────────────────────────────────────

function CollectionModal({ collection, whatsappNumber, onClose }: { collection: Collection; whatsappNumber: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-cream rounded-t-3xl md:rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur-md p-4 sm:p-6 border-b border-cream-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{collection.icon}</span>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-brown-dark">{collection.name}</h3>
              <p className="text-xs sm:text-sm text-accent">
                {collection.products.length} productos · {collection.priceRange}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-cream-dark transition-colors">
            <X size={20} className="text-brown-dark" />
          </button>
        </div>


        {/* Description */}
        <div className="px-4 sm:px-6 py-4">
          <p className="text-accent text-sm sm:text-base">{collection.description}</p>
          {collection.story && (
            <p className="text-xs sm:text-sm text-primary/80 mt-2 italic">{collection.story}</p>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 pt-2">
          {collection.products.map((product, index) => (
            <ProductCard key={product.id} product={product} collectionName={collection.name} index={index} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-cream/90 backdrop-blur-md p-3 sm:p-4 border-t border-cream-dark flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href={getWhatsAppLink(whatsappNumber, `Hola! Me interesa la colección "${collection.name}". Quiero más información.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-5 sm:px-6 py-3 rounded-full font-semibold hover:bg-[#20BD5A] transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <MessageCircle size={18} />
            Consultar por esta colección
          </a>
          <span className="text-xs sm:text-sm text-accent">Respuesta en menos de 5 minutos</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Featured Collection Card ────────────────────────────────────────────────

function FeaturedCard({ collection, onClick }: { collection: Collection; onClick: () => void }) {
  const cover = getCollectionCover(collection);
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative w-full rounded-3xl overflow-hidden text-left"
      style={{ aspectRatio: "16/7" }}
    >
      <SafeImage
        src={cover}
        alt={collection.name}
        fill
        fallbackIconSize={48}
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 sm:px-12 md:px-16 max-w-xl">
          <span className="text-primary-light text-xs font-bold tracking-[0.25em] uppercase mb-3 block">
            Colección destacada
          </span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
            <span className="mr-2">{collection.icon}</span>
            {collection.name}
          </h3>
          <p className="text-white/80 text-sm sm:text-base mb-6 line-clamp-2 font-light">
            {collection.shortDescription}
          </p>
          <span className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold text-sm group-hover:bg-white/90 transition-colors">
            Ver {collection.products.length} productos
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Regular Collection Card ─────────────────────────────────────────────────

function CollectionCard({ collection, onClick, index }: { collection: Collection; onClick: () => void; index: number }) {
  const cover = getCollectionCover(collection);
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden text-left"
      style={{ aspectRatio: "3/4" }}
    >
      <SafeImage
        src={cover}
        alt={collection.name}
        fill
        fallbackIconSize={32}
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl">{collection.icon}</span>
          <span className="text-white/60 text-[10px] font-semibold tracking-widest uppercase">
            {collection.products.length} productos
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{collection.name}</h3>
        <p className="text-white/65 text-xs line-clamp-2 font-light mb-3">{collection.shortDescription}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary-light font-bold text-sm">{collection.priceRange}</span>
          <span className="text-white/70 text-xs flex items-center gap-1 group-hover:text-white transition-colors">
            Ver más <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Collections({ collections, whatsappNumber }: { collections: Collection[]; whatsappNumber: string }) {
  const searchParams = useSearchParams();
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  useEffect(() => {
    if (deepLinkHandled || collections.length === 0) return;
    const slug = searchParams.get("coleccion");
    if (!slug) return;
    const match = collections.find((c) => c.slug === slug);
    if (match) setSelectedCollection(match);
    setDeepLinkHandled(true);
  }, [searchParams, collections, deepLinkHandled]);

  if (collections.length === 0) return null;

  const [featured, ...rest] = collections;

  return (
    <section id="colecciones" className="py-20 sm:py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <span className="text-primary text-xs font-bold tracking-[0.25em] uppercase">Nuestros mundos</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brown-dark mt-3 leading-tight">
              Descubre tu <span className="gradient-text">colección</span>
            </h2>
          </div>
        </motion.div>

        {/* Featured collection */}
        <div className="mb-6">
          <FeaturedCard collection={featured} onClick={() => setSelectedCollection(featured)} />
        </div>

        {/* Rest of collections grid */}
        {rest.length > 0 && (
          <div className={`grid gap-4 sm:gap-6 ${
            rest.length === 1 ? "grid-cols-1" :
            rest.length === 2 ? "grid-cols-2" :
            rest.length === 3 ? "grid-cols-2 sm:grid-cols-3" :
            "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          }`}>
            {rest.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={index}
                onClick={() => setSelectedCollection(collection)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCollection && (
          <CollectionModal
            collection={selectedCollection}
            whatsappNumber={whatsappNumber}
            onClose={() => setSelectedCollection(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
