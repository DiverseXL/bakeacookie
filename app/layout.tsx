import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/components/providers/WalletProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "bakeacookie — On-chain deploy history for Cookie Chain",
  description:
    "bakeacookie is the companion web dashboard for the bake CLI. Explore permanent, public deploy history for any Cookie Chain program.",
  keywords: ["bake", "Cookie Chain", "Solana", "deploy history", "on-chain", "bakeacookie"],
  openGraph: {
    title: "bakeacookie",
    description: "Every bake deploy leaves a permanent, public history on Cookie Chain. This is that history.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased min-h-dvh flex flex-col">
        <SolanaWalletProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
