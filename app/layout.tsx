import type { Metadata, Viewport } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["500", "600"],
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
    <html lang="en-IE" className={chakra.variable}>
      <body>{children}</body>
    </html>
  );
}
