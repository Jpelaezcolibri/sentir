"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Search, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";
import type { Collection } from "@/types";
import { getWhatsAppLink } from "@/lib/utils";

const navLinks = [
  { href: "#colecciones", label: "Colecciones" },
  { href: "#por-que-nosotros", label: "Nosotros" },
];

export default function Navigation({ collections = [], whatsappNumber = "" }: { collections?: Collection[]; whatsappNumber?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar search al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const waLink = whatsappNumber
    ? getWhatsAppLink(whatsappNumber, "Hola! Quiero hacer un pedido en SENTIR.")
    : "#";

  return (
    <nav className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-md py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">

        {/* Logo */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xl font-bold tracking-[0.18em] ${scrolled ? "gradient-text" : "text-white"} transition-colors`}>
            SENTIR
          </span>
          <span className={`text-xs font-light tracking-[0.3em] hidden sm:block ${scrolled ? "text-primary/60" : "text-white/50"} transition-colors`}>
            STUDIO
          </span>
        </a>

        {/* Desktop nav links — centrados */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors relative group ${scrolled ? "text-brown-dark hover:text-primary" : "text-white/90 hover:text-white"}`}
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#bundles"
            className={`text-sm font-medium transition-colors relative group ${scrolled ? "text-brown-dark hover:text-primary" : "text-white/90 hover:text-white"}`}
          >
            Combos
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
          </a>
        </div>

        {/* Acciones desktop */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* Search icon + dropdown */}
          {collections.length > 0 && (
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className={`p-2 rounded-full transition-colors ${scrolled ? "text-brown-dark hover:bg-cream-dark" : "text-white hover:bg-white/10"}`}
                title="Buscar"
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                  <SearchBar collections={collections} inNav />
                </div>
              )}
            </div>
          )}

          {/* Cart */}
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

          {/* CTA WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:shadow-md"
          >
            <MessageCircle size={15} />
            Pedir ahora
          </a>
        </div>

        {/* Mobile — cart + hamburger */}
        <div className="flex items-center gap-2 md:hidden ml-auto">
          {collections.length > 0 && (
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={`p-2 rounded-lg ${scrolled ? "text-brown-dark" : "text-white"}`}
              title="Buscar"
            >
              <Search size={20} />
            </button>
          )}
          <button
            onClick={toggleCart}
            className={`relative p-2 rounded-lg ${scrolled ? "text-brown-dark" : "text-white"}`}
            title="Mi lista"
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg ${scrolled ? "text-brown-dark" : "text-white"}`}
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && collections.length > 0 && (
        <div className="md:hidden px-4 pt-2 pb-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <SearchBar collections={collections} inNav />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-medium py-3 px-2 border-b border-cream-dark text-brown-dark hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#bundles"
              onClick={() => setIsOpen(false)}
              className="font-medium py-3 px-2 border-b border-cream-dark text-brown-dark hover:text-primary transition-colors"
            >
              Combos
            </a>
            <button
              onClick={() => { setIsOpen(false); toggleCart(); }}
              className="text-brown-dark font-medium py-3 px-2 border-b border-cream-dark flex items-center gap-2 text-left hover:text-primary transition-colors"
            >
              <ShoppingBag size={16} /> Mi Lista
              {totalItems > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
              )}
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 justify-center bg-[#25D366] text-white px-5 py-3 rounded-full font-semibold mt-3 hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle size={16} />
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
