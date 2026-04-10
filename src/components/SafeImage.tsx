"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ShoppingBag } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackIconSize?: number;
}

export default function SafeImage({ fallbackIconSize = 32, className, alt, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cream-dark">
        <ShoppingBag size={fallbackIconSize} className="text-accent/30" />
      </div>
    );
  }
  return <Image {...props} alt={alt} className={className} onError={() => setHasError(true)} />;
}
