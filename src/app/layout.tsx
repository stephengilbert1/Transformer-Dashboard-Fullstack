// app/layout.tsx
import type { Metadata } from "next";
import { Outfit, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Sidebar } from "@/src/components/layouts/SidebarLayout";
import { TopBar } from "@/src/components/layouts/TopBar";
import "leaflet/dist/leaflet.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Transformer Dashboard",
  description: "Real-time monitoring of transformer temperatures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] h-full`}
      >
        <div className="flex flex-col h-screen">
          {/* Sticky top bar */}
          <TopBar />

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar: permanent on lg, toggleable on mobile */}
            <Sidebar />

            {/* Main content scrolls independently */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
