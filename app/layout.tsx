import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";

/* Display: Archivo with its width axis — set wide and heavy for an automotive feel */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/* Text: Geist — clean and legible at small sizes */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lugh Autohaus — Paint Protection Film, Ceramic Coating & Detailing",
  description:
    "Where ancient mastery meets modern protection. Stek PPF, paint correction, Feynlab & Titan ceramic coatings, window tints and detailing — finished by hand.",
};

export const viewport: Viewport = {
  themeColor: "#121213",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IE" className={`${archivo.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
