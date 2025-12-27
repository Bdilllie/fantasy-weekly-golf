import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Gentleman's Gamble",
  description: "The world's most exclusive fantasy golf competition. Pick winners, earn prestige, and claim your share of the $20,000 purse.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="bg-[#00573F] min-h-screen text-white">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
