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

function CollectionCard({
  collection,
  onClick,
  index,
}: {
  collection: Collection;
  onClick: () => void;
  index: number;
}) {
  const coverImages: { url: string; name: string; key: string }[] = [];
  for (const product of collection.products) {
    if (product.coverImage) {
      coverImages.push({ url: product.coverImage, name: product.name, key: `cover-${product.id}` });
    }
    if (coverImages.length >= 4) break;
  }
  if (coverImages.length < 4) {
    for (const product of collection.products) {
      if (coverImages.length >= 4) break;
      if (product.image && product.image !== PLACEHOLDER && !coverImages.some((c) => c.url === product.image)) {
        coverImages.push({ url: product.image, name: product.name, key: `img-${product.id}` });
      }
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-left"
    >
      <div className="grid grid-cols-2 gap-0.5 aspect-[4/3] overflow-hidden">
        {coverImages.slice(0, 4).map((img) => (
          <div key={img.key} className="relative bg-cream-dark overflow-hidden">
            <SafeImage
              src={img.url}
              alt={img.name}
              fill
              fallbackIconSize={24}
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - coverImages.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="relative bg-cream-dark overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={24} className="text-accent/30" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{collection.icon}</span>
          <h3 className="text-lg sm:text-xl font-bold text-brown-dark">
            {collection.name}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-accent mb-3 line-clamp-2">
          {collection.shortDescription}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-primary font-semibold">
            {collection.priceRange}
          </span>
          <span className="flex items-center gap-1 text-xs sm:text-sm text-accent group-hover:text-primary transition-colors">
            {collection.products.length} productos
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function AddToCartButton({
  product,
  collectionName,
}: {
  product: Product;
  collectionName: string;
}) {
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
      const norm = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim();
      return !norm.includes('segun disponibilidad');
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
    if (needsColor) {
      setPickedSize(size);
    } else {
      handleAdd(size);
    }
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
          if (product.sizes.length === 1 && !needsColor) {
            handleAdd(product.sizes[0]);
          } else if (product.sizes.length === 1 && needsColor) {
            setPickedSize(product.sizes[0]);
            setShowPopover(true);
          } else {
            setShowPopover(!showPopover);
            setPickedSize(null);
          }
        }}
        className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-full transition-all text-[10px] sm:text-xs font-bold hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        title="Agregar a mi lista"
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

function ProductCard({
  product,
  collectionName,
  index,
}: {
  product: Product;
  collectionName: string;
  index: number;
}) {
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
        <h4 className="font-semibold text-brown-dark text-xs sm:text-sm truncate">
          {product.name}
        </h4>
        {product.story && (
          <p className="text-[10px] sm:text-xs text-accent mt-0.5 line-clamp-1 italic">
            {product.story}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-xs sm:text-sm">
            {formatPrice(product.price)}
          </span>
          <AddToCartButton product={product} collectionName={collectionName} />
        </div>
      </div>
    </motion.div>
  );
}

function CollectionModal({
  collection,
  whatsappNumber,
  onClose,
}: {
  collection: Collection;
  whatsappNumber: string;
  onClose: () => void;
}) {
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
              <h3 className="text-lg sm:text-2xl font-bold text-brown-dark">
                {collection.name}
              </h3>
              <p className="text-xs sm:text-sm text-accent">
                {collection.products.length} productos &middot;{" "}
                {collection.priceRange}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-cream-dark transition-colors"
          >
            <X size={20} className="text-brown-dark" />
          </button>
        </div>

        {/* Flow hint */}
        <div className="mx-4 sm:mx-6 mt-3 flex items-center justify-center gap-2 sm:gap-3 bg-primary/5 border border-primary/15 rounded-full px-4 py-2">
          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-primary">
            <ShoppingBag size={13} /> Agrega al carrito
          </span>
          <ChevronRight size={11} className="text-primary/40" />
          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#25D366]">
            <MessageCircle size={13} /> Confirma por WhatsApp
          </span>
        </div>

        {/* Description */}
        <div className="px-4 sm:px-6 py-4">
          <p className="text-accent text-sm sm:text-base">{collection.description}</p>
          {collection.story && (
            <p className="text-xs sm:text-sm text-primary/80 mt-2 italic">
              {collection.story}
            </p>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 pt-2">
          {collection.products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              collectionName={collection.name}
              index={index}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-cream/90 backdrop-blur-md p-3 sm:p-4 border-t border-cream-dark flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href={getWhatsAppLink(
              whatsappNumber,
              `Hola! Me interesa la colección "${collection.name}". Quiero más información.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-5 sm:px-6 py-3 rounded-full font-semibold hover:bg-[#20BD5A] transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <MessageCircle size={18} />
            Consultar por esta colección
          </a>
          <span className="text-xs sm:text-sm text-accent">
            Respuesta en menos de 5 minutos
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Collections({
  collections,
  whatsappNumber,
}: {
  collections: Collection[];
  whatsappNumber: string;
}) {
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

  const totalProducts = collections.reduce((sum, c) => sum + c.products.length, 0);

  return (
    <section id="colecciones" className="py-16 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brown-dark mb-4">
            Nuestras <span className="gradient-text">Colecciones</span>
          </h2>
          <p className="text-base sm:text-lg text-accent max-w-xl mx-auto">
            {collections.length} colecciones, {totalProducts} productos únicos. Explora
            la que va contigo.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 sm:gap-3 bg-primary/5 border border-primary/15 rounded-full px-4 sm:px-6 py-2 sm:py-2.5">
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-primary">
              <ShoppingBag size={14} /> Agrega al carrito
            </span>
            <ChevronRight size={12} className="text-primary/40" />
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#25D366]">
              <MessageCircle size={14} /> Confirma por WhatsApp
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              onClick={() => setSelectedCollection(collection)}
            />
          ))}
        </div>
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
