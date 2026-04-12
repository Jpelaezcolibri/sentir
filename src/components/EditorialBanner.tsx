"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface EditorialBannerProps {
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  href: string;
  variant?: "dark" | "light" | "accent";
}

export default function EditorialBanner({
  eyebrow,
  headline,
  subline,
  cta,
  href,
  variant = "dark",
}: EditorialBannerProps) {
  const bg =
    variant === "dark"
      ? "bg-[#111111] text-white"
      : variant === "accent"
      ? "bg-cream text-foreground"
      : "bg-white text-foreground border-t border-b border-black/5";

  const lineColor = variant === "dark" ? "bg-primary" : "bg-primary";
  const eyebrowColor = variant === "dark" ? "text-primary" : "text-primary";
  const subColor = variant === "dark" ? "text-white/40" : "text-accent";
  const btnClass =
    variant === "dark"
      ? "border border-white/20 text-white hover:border-primary hover:text-primary"
      : "border border-primary/40 text-primary hover:border-primary hover:bg-primary/5";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${bg} py-20 md:py-28`}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-10">

        {/* Left */}
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className={`h-px w-10 ${lineColor}`} />
            <span className={`${eyebrowColor} text-[10px] font-semibold tracking-[0.35em] uppercase`}>
              {eyebrow}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light leading-tight tracking-tight mb-4">
            {headline}
          </h2>
          <p className={`${subColor} text-sm font-light leading-relaxed tracking-wide`}>
            {subline}
          </p>
        </div>

        {/* CTA */}
        <a
          href={href}
          className={`inline-flex items-center gap-3 px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 group flex-shrink-0 ${btnClass}`}
        >
          {cta}
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.section>
  );
}
