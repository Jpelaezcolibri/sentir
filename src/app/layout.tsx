import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4AADA3",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sentir.vercel.app"),
  title: "SENTIR | Catálogo",
  description: "Descubre nuestra colección. Encuentra el producto ideal para ti.",
  openGraph: {
    title: "SENTIR",
    description: "Descubre nuestra colección.",
    type: "website",
    siteName: "SENTIR",
    url: "https://sentir.vercel.app",
    locale: "es_CO",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
