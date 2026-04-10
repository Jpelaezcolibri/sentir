"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import type { Collection, QuizOption, Product } from "@/types";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";

function QuizProductCard({
  product,
  collectionName,
  whatsappNumber,
  index,
}: {
  product: Product;
  collectionName: string;
  whatsappNumber: string;
  index: number;
}) {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="product-card bg-white rounded-2xl overflow-hidden group"
    >
      <div className="relative aspect-square bg-cream-dark overflow-hidden">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          fallbackIconSize={32}
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
            NUEVO
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-3">
        <h4 className="font-semibold text-brown-dark text-xs sm:text-sm truncate">
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-xs sm:text-sm">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              added
                ? "bg-[#25D366] text-white"
                : "bg-primary hover:bg-primary-dark text-white hover:scale-105"
            }`}
          >
            {added ? <Check size={12} /> : <ShoppingBag size={12} />}
            {added ? "Listo!" : "Agregar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Quiz({
  quizOptions,
  collections,
  whatsappNumber,
}: {
  quizOptions: QuizOption[];
  collections: Collection[];
  whatsappNumber: string;
}) {
  const [step, setStep] = useState<"start" | "choosing" | "results">("start");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectedCollection = selectedOption
    ? collections.find(
        (c) =>
          c.id === quizOptions.find((q) => q.id === selectedOption)?.collectionId
      )
    : null;

  const hasOptions = quizOptions.length > 0;

  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    setStep("results");
  };

  const handleBack = () => {
    if (step === "results") {
      setStep("choosing");
      setSelectedOption(null);
    } else if (step === "choosing") {
      setStep("start");
    }
  };

  const handleStart = () => {
    if (hasOptions) {
      setStep("choosing");
    } else {
      window.open(getWhatsAppLink(whatsappNumber, "Hola! Quiero que me ayuden a encontrar el producto ideal para mí. ¿Me pueden asesorar?"), "_blank");
    }
  };

  return (
    <section
      id="quiz"
      className="py-20 md:py-28 bg-gradient-to-b from-cream to-cream-dark"
    >
      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {step === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-brown-dark mb-4">
                Encuentra tu{" "}
                <span className="gradient-text">producto ideal</span>
              </h2>
              <p className="text-lg text-accent max-w-xl mx-auto mb-10">
                Contéstanos una sola pregunta y te mostramos exactamente lo que
                va contigo.
              </p>
              <button
                onClick={handleStart}
                className="group bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 inline-flex items-center gap-3"
              >
                Empezar
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </motion.div>
          )}

          {step === "choosing" && (
            <motion.div
              key="choosing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-3">
                  ¿Qué te define más hoy?
                </h2>
                <p className="text-accent">
                  Escoge la que más resuene contigo
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                {quizOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleOptionClick(option.id)}
                    className="group bg-white rounded-2xl p-6 text-left hover:shadow-lg hover:shadow-primary/10 border-2 border-transparent hover:border-primary/30 transition-all hover:scale-[1.02]"
                  >
                    <span className="text-4xl mb-3 block">{option.emoji}</span>
                    <span className="text-brown-dark font-semibold text-lg group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={handleBack}
                  className="text-accent hover:text-brown-dark inline-flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
              </div>
            </motion.div>
          )}

          {step === "results" && selectedCollection && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                  <span className="text-xl">
                    {quizOptions.find((q) => q.id === selectedOption)?.emoji}
                  </span>
                  <span className="text-primary font-medium">
                    Tu colección ideal
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-3">
                  {selectedCollection.name}
                </h2>
                <p className="text-accent max-w-xl mx-auto">
                  {selectedCollection.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
                {selectedCollection.products.slice(0, 8).map((product, index) => (
                  <QuizProductCard
                    key={product.id}
                    product={product}
                    collectionName={selectedCollection.name}
                    whatsappNumber={whatsappNumber}
                    index={index}
                  />
                ))}
              </div>

              <div className="text-center space-y-4">
                <a
                  href={getWhatsAppLink(
                    whatsappNumber,
                    `Hola! Me interesa la colección "${selectedCollection.name}". Quiero ver más opciones.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
                >
                  <MessageCircle size={20} />
                  Hablar con un asesor
                </a>
                <br />
                <button
                  onClick={handleBack}
                  className="text-accent hover:text-brown-dark inline-flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Explorar otro estilo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
