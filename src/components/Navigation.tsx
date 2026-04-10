"use client";

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";
import type { Collection } from "@/types";

const navLinks = [
  { href: "#colecciones", label: "Colecciones" },
  { href: "#quiz", label: "Encuentra tu estilo" },
  { href: "#por-que-nosotros", label: "Nosotros" },
  { href: "#bundles", label: "Combos" },
];

export default function Navigation({ collections = [] }: { collections?: Collection[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-md py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-2xl font-bold tracking-widest ${scrolled ? "gradient-text" : "text-white"} transition-colors`}>
            SENTIR
          </span>
        </a>

        {/* SearchBar desktop */}
        {collections.length > 0 && (
          <div className="hidden md:flex flex-1 justify-center px-4">
            <SearchBar collections={collections} inNav />
          </div>
        )}

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 flex-shrink-0 ml-auto">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-brown-dark" : "text-white"}`}>
              {link.label}
            </a>
          ))}
          <button
            onClick={toggleCart}
            className={`relative p-2 rounded-full transition-colors ${scrolled ? "text-brown-dark hover:bg-cream-dark" : "text-white hover:bg-white/10"}`}
            title="Mi lista"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
          <a href="#quiz" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
            Encuentra tu producto
          </a>
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-2 md:hidden ml-auto">
          <button onClick={toggleCart} className={`relative p-2 rounded-lg ${scrolled ? "text-brown-dark" : "text-white"}`} title="Mi lista">
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg ${scrolled ? "text-brown-dark" : "text-white"}`} aria-label="Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="font-medium py-2 border-b border-cream-dark text-brown-dark">
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setIsOpen(false); toggleCart(); }}
              className="text-brown-dark font-medium py-2 border-b border-cream-dark flex items-center gap-2 text-left"
            >
              <ShoppingBag size={16} /> Mi Lista
              {totalItems > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>}
            </button>
            <a href="#quiz" onClick={() => setIsOpen(false)} className="bg-primary text-white px-5 py-3 rounded-full text-center font-semibold mt-2">
              Encuentra tu producto ideal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
