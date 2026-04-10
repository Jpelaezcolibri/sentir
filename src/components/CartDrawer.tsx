"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Package, Loader2, User, Gift, Sparkles, Heart, Check, Zap } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";
import { formatPrice, getWhatsAppLink, getCartWhatsAppMessage, safeScrollIntoView } from "@/lib/utils";

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";
const NAME_STORAGE_KEY = "sentir-customer-name";

interface UpsellAddon {
  id: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  icon: "gift" | "sparkles";
  image: string;
}

const UPSELL_ADDONS: UpsellAddon[] = [
  {
    id: "empaque-regalo",
    name: "Empaque de Regalo",
    shortName: "Empaque",
    description: "Presentación especial con empaque hermoso para regalar",
    price: 5000,
    icon: "gift",
    image: "/addon-empaque.jpg",
  },
  {
    id: "tarjeta-personalizada",
    name: "Tarjeta Personalizada",
    shortName: "Tarjeta",
    description: "Tarjeta con mensaje personalizado para acompañar tu pedido",
    price: 3000,
    icon: "sparkles",
    image: "/addon-tarjeta.jpg",
  },
];

export default function CartDrawer({ whatsappNumber }: { whatsappNumber: string }) {
  const {
    items,
    isOpen,
    totalItems,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    closeCart,
  } = useCart();
  const [sending, setSending] = useState(false);

  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const [customerName, setCustomerName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [shakeName, setShakeName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_STORAGE_KEY) || "";
      if (saved) {
        setCustomerName(saved);
        setNameTouched(saved.trim().length > 0);
      }
    } catch {
      // localStorage may not be available
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(NAME_STORAGE_KEY, customerName);
    } catch {
      // localStorage may not be available
    }
  }, [customerName, hydrated]);

  const triggerNameShake = useCallback(() => {
    setNameTouched(true);
    setShakeName(true);
    nameInputRef.current?.focus();
    safeScrollIntoView(nameInputRef.current, { behavior: "smooth", block: "center" });
    setTimeout(() => setShakeName(false), 600);
  }, []);

  const nameIsEmpty = customerName.trim() === "";
  const isDisabled = sending || nameIsEmpty;

  const toggleAddon = useCallback((addonId: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  }, []);

  const selectCombo = useCallback(() => {
    setSelectedAddons(new Set(UPSELL_ADDONS.map((a) => a.id)));
  }, []);

  const addonsTotal = UPSELL_ADDONS.filter((a) => selectedAddons.has(a.id)).reduce((sum, a) => sum + a.price, 0);

  const buildAddonItems = () =>
    UPSELL_ADDONS.filter((a) => selectedAddons.has(a.id)).map((a) => ({
      productId: a.id,
      name: a.name,
      price: a.price,
      image: "/promo-regalo.jpg",
      size: "-",
      collectionName: "Complementos",
      quantity: 1,
      isAddon: true,
    }));

  const handlePreConfirm = () => {
    if (items.length === 0) return;
    if (nameIsEmpty) {
      triggerNameShake();
      return;
    }
    setShowUpsell(true);
  };

  const handleConfirmOrder = async (includeAddons: boolean) => {
    setShowUpsell(false);
    setSending(true);

    const trimmedName = customerName.trim() || undefined;
    const addonItems = includeAddons ? buildAddonItems() : [];
    const allItems = [...items, ...addonItems];
    const orderTotal = total + (includeAddons ? addonsTotal : 0);
    const orderTotalItems = totalItems + addonItems.length;

    const fallbackMessage = getCartWhatsAppMessage(allItems, orderTotal, undefined, trimmedName);
    const fallbackUrl = getWhatsAppLink(whatsappNumber, fallbackMessage);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: allItems,
          total: orderTotal,
          totalItems: orderTotalItems,
          customerName: trimmedName,
        }),
      });

      let whatsappUrl = fallbackUrl;
      if (res.ok) {
        const data = await res.json();
        const orderUrl = `${window.location.origin}/pedido/${data.id}`;
        const message = getCartWhatsAppMessage(allItems, orderTotal, orderUrl, trimmedName);
        whatsappUrl = getWhatsAppLink(whatsappNumber, message);
      }

      window.location.href = whatsappUrl;
      clearCart();
      closeCart();
      setSelectedAddons(new Set());
    } catch {
      window.location.href = fallbackUrl;
      clearCart();
      closeCart();
      setSelectedAddons(new Set());
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream z-[71] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-dark bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-brown-dark">Mi Lista</h2>
                {totalItems > 0 && (
                  <span className="bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-cream-dark rounded-full transition-colors">
                <X size={20} className="text-brown-dark" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-20 h-20 bg-cream-dark rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="text-accent" />
                  </div>
                  <p className="text-brown-dark font-semibold mb-1">Tu lista está vacía</p>
                  <p className="text-sm text-accent max-w-[200px]">
                    Agrega productos para armar tu pedido
                  </p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.size}-${item.color || ''}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`bg-white rounded-2xl p-3 border flex gap-3 ${
                        item.isEntregaInmediata
                          ? "border-amber-400 ring-1 ring-amber-400/30"
                          : "border-cream-dark"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0 relative">
                        <SafeImage
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          fill
                          fallbackIconSize={20}
                          className="object-cover"
                          sizes="64px"
                        />
                        {item.isEntregaInmediata && (
                          <span className="absolute top-0.5 left-0.5 bg-amber-400 text-[8px] font-bold text-brown-dark px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap size={8} /> HOY
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-brown-dark truncate">{item.name}</h4>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {item.size !== "-" && (
                            <span className="text-xs bg-cream text-brown-dark font-medium px-1.5 py-0.5 rounded-md">
                              T. {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-md">
                              {item.color}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5">
                          {item.originalPrice && (
                            <span className="text-[10px] text-accent line-through mr-1">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="p-1 text-accent hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1.5 bg-cream rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream-dark transition-colors text-brown-dark"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-bold text-brown-dark w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream-dark transition-colors text-brown-dark"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={clearCart}
                    className="text-xs text-accent hover:text-red-500 transition-colors text-center w-full py-2"
                  >
                    Vaciar lista
                  </button>
                </>
              )}
            </div>

            {/* Summary & CTA */}
            {items.length > 0 && (
              <div className="border-t border-cream-dark bg-white px-5 py-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {/* Customer Name */}
                <div>
                  <div className={`flex items-center gap-2 ${shakeName ? "animate-shake" : ""}`}>
                    <User size={16} className="text-accent flex-shrink-0" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      inputMode="text"
                      enterKeyHint="done"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      onBlur={() => setNameTouched(true)}
                      placeholder="Tu nombre *"
                      className={`flex-1 px-3 py-2 border rounded-xl bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm ${
                        nameTouched && nameIsEmpty ? "border-red-300" : "border-cream-dark"
                      }`}
                    />
                  </div>
                  {nameTouched && nameIsEmpty && (
                    <p className="text-[10px] text-red-400 mt-1 ml-7">Ingresa tu nombre para continuar</p>
                  )}
                </div>

                {/* Summary */}
                {(() => {
                  const totalSavings = items.reduce((sum, item) =>
                    item.originalPrice ? sum + (item.originalPrice - item.price) * item.quantity : sum, 0);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-accent">{totalItems} {totalItems === 1 ? "producto" : "productos"}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-1 border-t border-cream-dark">
                        <span className="text-brown-dark">TOTAL</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* WhatsApp CTA */}
                <div
                  onClick={() => {
                    if (nameIsEmpty && !sending) triggerNameShake();
                  }}
                >
                  <button
                    onClick={handlePreConfirm}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all text-base ${
                      isDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#25D366] hover:bg-[#20BD5A] text-white hover:scale-[1.02] hover:shadow-lg"
                    }`}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Generando pedido...
                      </>
                    ) : nameIsEmpty ? (
                      <>
                        <User size={20} />
                        Ingresa tu nombre arriba
                      </>
                    ) : (
                      <>
                        <MessageCircle size={20} />
                        Confirmar pedido por WhatsApp
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-accent text-center">
                  Se genera un link con tu pedido y fotos de los productos
                </p>
              </div>
            )}
          </motion.div>

          {/* Upsell Popup */}
          <AnimatePresence>
            {showUpsell && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
              >
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowUpsell(false)}
                />

                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 350 }}
                  className="relative w-full max-w-sm mx-4 mb-0 sm:mb-0 bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 px-5 pt-8 pb-6 text-center">
                    <button
                      onClick={() => setShowUpsell(false)}
                      className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
                    >
                      <X size={16} className="text-brown-dark" />
                    </button>
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="text-lg font-bold text-brown-dark">
                      ¿Agregas algo especial?
                    </h3>
                    <p className="text-sm text-accent mt-1">Complementa tu pedido antes de confirmar</p>
                  </div>

                  {/* Addon cards */}
                  <div className="px-5 py-4 space-y-3">
                    {UPSELL_ADDONS.map((addon) => {
                      const isSelected = selectedAddons.has(addon.id);
                      const IconComp = addon.icon === "gift" ? Gift : Sparkles;
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-cream-dark bg-white hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-primary text-white" : "bg-cream-dark text-primary"
                            }`}>
                              {isSelected ? <Check size={20} /> : <IconComp size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-brown-dark">{addon.name}</h4>
                                <span className="text-sm font-bold text-primary whitespace-nowrap">
                                  +{formatPrice(addon.price)}
                                </span>
                              </div>
                              <p className="text-xs text-accent mt-0.5">{addon.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {selectedAddons.size !== UPSELL_ADDONS.length && (
                      <button
                        onClick={selectCombo}
                        className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Heart size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-brown-dark">
                            Llevar los dos por {formatPrice(UPSELL_ADDONS.reduce((s, a) => s + a.price, 0))}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="px-5 pb-6 pt-2 space-y-2.5 border-t border-cream-dark">
                    {selectedAddons.size > 0 && (
                      <div className="flex justify-between items-center text-sm py-2">
                        <span className="text-accent">Nuevo total con complementos</span>
                        <span className="font-bold text-primary text-base">
                          {formatPrice(total + addonsTotal)}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => handleConfirmOrder(selectedAddons.size > 0)}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all text-base ${
                        selectedAddons.size > 0
                          ? "bg-[#25D366] hover:bg-[#20BD5A] text-white hover:scale-[1.02] hover:shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {selectedAddons.size > 0 ? (
                        <>
                          <Gift size={18} />
                          Agregar y confirmar pedido
                        </>
                      ) : (
                        <>
                          <MessageCircle size={18} />
                          Selecciona un complemento
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleConfirmOrder(false)}
                      className="w-full text-center py-2.5 text-sm text-accent hover:text-brown-dark transition-colors"
                    >
                      No gracias, solo confirmar mi pedido
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
