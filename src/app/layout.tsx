// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/src/components/layouts/SidebarLayout";
import { TopBar } from "@/src/components/layouts/TopBar";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transformer Dashboard",
  description: "Real-time monitoring of transformer temperatures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TopBar />
        <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
