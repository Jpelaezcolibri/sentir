"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import type { Collection, Product } from "@/types";
import { X, MessageCircle, ChevronRight, Check, ShoppingBag, Zap, Eye, ChevronLeft, ChevronRight as ChevronRightIcon, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
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
        <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 z-10 tracking-widest">
          RECIÉN LLEGADA
        </span>
      )}
      {product.isPersonalizable && !product.isNew && (
        <span className="absolute top-2 right-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 z-10 tracking-widest">
          LA HACEMOS TUYA
        </span>
      )}
      {product.isEntregaInmediata && (
        <span className="absolute bottom-2 right-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 z-10 flex items-center gap-0.5 tracking-widest">
          <Zap size={10} /> DISPONIBLE HOY
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

function ProductCard({ product, collectionName, index, onQuickView }: {
  product: Product;
  collectionName: string;
  index: number;
  onQuickView: (product: Product) => void;
}) {
  const { toggle, isWished } = useWishlist();
  const wished = isWished(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="product-card bg-white rounded-2xl overflow-hidden group cursor-pointer"
    >
      <div
        className="relative aspect-square bg-cream-dark overflow-hidden"
        onClick={() => onQuickView(product)}
      >
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
        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          aria-label={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={14}
            className={wished ? "text-rose-500 fill-rose-500" : "text-foreground/50"}
            fill={wished ? "currentColor" : "none"}
          />
        </button>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-white text-brown-dark text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Eye size={12} /> Ver detalle
          </span>
        </div>
      </div>
      <div className="p-2.5 sm:p-3">
        <h4 className="font-medium text-foreground text-xs sm:text-sm truncate tracking-wide">{product.name}</h4>
        {product.story && (
          <p className="text-[10px] sm:text-xs text-primary mt-0.5 line-clamp-1 italic font-light">
            "{product.story}"
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-foreground font-semibold text-xs sm:text-sm">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} collectionName={collectionName} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Quick View ───────────────────────────────────────────────────────

function ProductQuickView({ product, collectionName, whatsappNumber, onClose }: {
  product: Product;
  collectionName: string;
  whatsappNumber: string;
  onClose: () => void;
}) {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.image && product.image !== PLACEHOLDER ? [product.image] : []);
  const [activeIdx, setActiveIdx] = useState(0);
  const { addItem, openCart } = useCart();
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  const colorOptions = (() => {
    if (!product.colors) return [];
    const trimmed = product.colors.trim();
    let raw: string[] = [];
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

  const handleAddToCart = () => {
    if (!pickedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: pickedSize,
      color: pickedColor || (colorOptions.length === 1 ? colorOptions[0] : undefined),
      collectionName,
      isEntregaInmediata: product.isEntregaInmediata,
    });
    openCart();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-cream-dark transition-colors"
        >
          <X size={18} className="text-brown-dark" />
        </button>

        <div className="md:flex">
          {/* Images */}
          <div className="md:w-[48%] flex-shrink-0">
            {images.length > 0 ? (
              <>
                <div className="relative aspect-square bg-cream-dark overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <SafeImage
                        src={images[activeIdx]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        fallbackIconSize={48}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <ProductBadges product={product} />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                      >
                        <ChevronLeft size={16} className="text-brown-dark" />
                      </button>
                      <button
                        onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                      >
                        <ChevronRightIcon size={16} className="text-brown-dark" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          i === activeIdx ? "border-primary shadow-md" : "border-transparent opacity-50 hover:opacity-80"
                        }`}
                      >
                        <SafeImage src={img} alt={`Vista ${i + 1}`} fill className="object-cover" sizes="56px" fallbackIconSize={16} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-cream-dark rounded-t-3xl md:rounded-l-3xl flex items-center justify-center">
                <ShoppingBag size={48} className="text-accent/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-[52%] p-5 md:p-6 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-6 bg-primary" />
                <span className="text-[10px] text-primary font-semibold uppercase tracking-[0.3em]">{collectionName}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-light text-foreground mt-1 leading-tight tracking-wide">{product.name}</h2>
              <p className="text-xl font-semibold text-primary mt-2">{formatPrice(product.price)}</p>
            </div>

            {product.story && (
              <div className="border-l-2 border-primary/40 pl-4 py-1">
                <p className="text-[10px] text-primary/60 font-semibold tracking-[0.25em] uppercase mb-1">Lo que sentirás</p>
                <p className="text-sm text-accent leading-relaxed italic font-light">"{product.story}"</p>
              </div>
            )}

            {product.fabric && (
              <div>
                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-[0.2em]">Hecha de</span>
                <p className="text-sm text-accent mt-0.5 font-light">{product.fabric}</p>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-[0.2em] block mb-2">
                  {pickedSize ? `${pickedSize} — ${needsColor ? "Elige tu color" : "Lista para llevártela"}` : "¿Cuál es tu talla?"}
                </span>
                {!pickedSize ? (
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setPickedSize(size);
                          if (!needsColor) setPickedColor(null);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cream hover:bg-primary hover:text-white text-brown-dark border border-cream-dark hover:border-primary transition-all"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-white">
                      {pickedSize}
                    </span>
                    <button
                      onClick={() => {
                        setPickedSize(null);
                        setPickedColor(null);
                      }}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            )}

            {pickedSize && colorOptions.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-[0.2em] block mb-2">¿Cómo la quieres sentir?</span>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPickedColor(color)}
                      className={`px-3 py-1.5 text-xs font-semibold transition-all tracking-wide ${
                        pickedColor === color
                          ? "bg-primary text-white"
                          : "bg-cream text-foreground border border-cream-dark hover:border-primary hover:text-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!pickedSize && colorOptions.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-[0.2em] block mb-1">Disponible en</span>
                <p className="text-sm text-accent font-light">{colorOptions.join(" · ")}</p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 mt-auto pt-3 border-t border-black/8">
              {pickedSize ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 justify-center bg-foreground text-white px-4 py-3 font-semibold text-xs tracking-[0.2em] uppercase hover:bg-primary transition-colors"
                  >
                    <ShoppingBag size={15} />
                    La quiero — agregar
                  </button>
                  <a
                    href={getWhatsAppLink(whatsappNumber, `Hola! Quiero sentir *"${product.name}"* de la colección ${collectionName}. Talla: ${pickedSize}${pickedColor ? ` / Color: ${pickedColor}` : ''}. Precio: ${formatPrice(product.price)}. ¿Está disponible hoy?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 justify-center bg-[#25D366] text-white px-4 py-3 font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle size={15} />
                    Preguntar por WhatsApp
                  </a>
                </>
              ) : (
                <p className="text-xs text-accent/70 text-center py-2 italic">Elige tu talla para llevarla contigo hoy</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Collection Modal ─────────────────────────────────────────────────────────

function CollectionModal({ collection, whatsappNumber, onClose }: { collection: Collection; whatsappNumber: string; onClose: () => void }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
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
          className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        >
          {/* Línea de acento superior */}
          <div className="h-[3px] bg-primary w-full" />
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-primary" />
              <div>
                <h3 className="text-lg sm:text-2xl font-light text-foreground tracking-wide">{collection.name}</h3>
                <p className="text-[10px] sm:text-xs text-accent tracking-[0.2em] uppercase font-medium">
                  {collection.products.length} piezas para sentir
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-cream-dark transition-colors">
              <X size={20} className="text-brown-dark" />
            </button>
          </div>

          {/* Description */}
          <div className="px-4 sm:px-6 py-5 border-b border-black/5">
            <p className="text-foreground/70 text-sm sm:text-base font-light leading-relaxed">{collection.description}</p>
            {collection.story && (
              <div className="flex items-start gap-3 mt-4">
                <div className="h-px w-6 bg-primary mt-2.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-primary/80 italic font-light leading-relaxed">"{collection.story}"</p>
              </div>
            )}
            <p className="text-[10px] text-foreground/30 mt-4 flex items-center gap-1.5 tracking-wide uppercase font-medium">
              <Eye size={10} /> Toca una pieza para sentirla de cerca
            </p>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 pt-2">
            {collection.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                collectionName={collection.name}
                index={index}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="sticky bottom-0 bg-cream/90 backdrop-blur-md p-3 sm:p-4 border-t border-cream-dark flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={getWhatsAppLink(whatsappNumber, `Hola! Quiero sentir la colección "${collection.name}" — me gustaría saber más.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-5 sm:px-6 py-3 font-semibold hover:bg-[#20BD5A] transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <MessageCircle size={18} />
              Quiero sentir esta colección
            </a>
            <span className="text-xs sm:text-sm text-accent">Te respondemos en menos de 5 minutos</span>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {quickViewProduct && (
          <ProductQuickView
            product={quickViewProduct}
            collectionName={collection.name}
            whatsappNumber={whatsappNumber}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Featured Collection Card ────────────────────────────────────────────────

function FeaturedCard({ collection, onClick }: { collection: Collection; onClick: () => void }) {
  const cover = getCollectionCover(collection);
  return (
    <motion.button
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      onClick={onClick}
      className="group relative w-full overflow-hidden text-left"
      style={{ aspectRatio: "21/9" }}
    >
      <SafeImage
        src={cover}
        alt={collection.name}
        fill
        fallbackIconSize={48}
        className="object-cover group-hover:scale-103 transition-transform duration-1000"
        sizes="100vw"
      />
      {/* Gradient overlay — más sutil, elegante */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/5" />

      {/* Línea de acento */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-10 sm:pb-14 md:pb-16">
        <div className="px-8 sm:px-12 md:px-16 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-[10px] font-semibold tracking-[0.35em] uppercase">
              La que no querrás quitarte
            </span>
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-[3.25rem] font-thin text-white mb-3 leading-tight tracking-wide">
            {collection.name}
          </h3>
          <p className="text-white/65 text-sm sm:text-base mb-8 line-clamp-2 font-light italic">
            {collection.shortDescription || "Para cuando quieres sentirte completamente tú."}
          </p>
          <span className="inline-flex items-center gap-3 border border-white/30 text-white px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase group-hover:border-primary group-hover:text-primary transition-all duration-300">
            Sentirla ahora
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      onClick={onClick}
      className="group text-left"
    >
      {/* Imagen cuadrada */}
      <div className="relative aspect-square overflow-hidden mb-4 bg-cream-dark">
        <SafeImage
          src={cover}
          alt={collection.name}
          fill
          fallbackIconSize={32}
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
        {/* Badge de productos */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/70">
            {collection.products.length} momentos
          </span>
        </div>
      </div>

      {/* Texto debajo */}
      <div className="px-1">
        <h3 className="text-base font-light text-foreground mb-1.5 tracking-wide group-hover:text-primary transition-colors">
          {collection.name}
        </h3>
        <p className="text-xs text-accent font-light line-clamp-2 leading-relaxed mb-3">
          {collection.shortDescription || "Para cuando quieres sentirte tú, hoy."}
        </p>
        <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/35 group-hover:text-primary transition-colors flex items-center gap-1.5">
          La quiero sentir
          <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
        </span>
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
    <section id="colecciones" className="py-20 sm:py-24 md:py-32 bg-white border-t border-black/5">

      {/* Header de sección */}
      <div className="max-w-7xl mx-auto px-6 mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-10 bg-primary" />
              <span className="text-primary text-[10px] font-semibold tracking-[0.35em] uppercase">
                Aquí y ahora
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-thin text-foreground leading-tight tracking-tight">
              Viste lo que eres.<br />
              <span className="font-semibold text-primary">Siente lo que quieres ser.</span>
            </h2>
          </div>
          <p className="text-sm text-accent font-light max-w-xs leading-relaxed sm:text-right">
            Cada pieza existe para un momento<br />que merece ser vivido.
          </p>
        </motion.div>
      </div>

      {/* Featured collection — full width */}
      <div className="mb-1">
        <FeaturedCard collection={featured} onClick={() => setSelectedCollection(featured)} />
      </div>

      {/* Grid de colecciones — imagen arriba, texto abajo */}
      {rest.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-12 sm:pt-16">
          <div className={`grid gap-x-6 gap-y-12 ${
            rest.length === 1 ? "grid-cols-1 max-w-sm" :
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
        </div>
      )}

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
