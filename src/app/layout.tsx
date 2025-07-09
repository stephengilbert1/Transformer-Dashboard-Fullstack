// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          {/* Sidebar stays fixed width */}
          <aside className="hidden lg:flex flex-col w-64 bg-[#dadada] border-r border-gray-300 p-6">
            <h1 className="text-lg font-bold mb-6">Menu</h1>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link href="/" className="hover:underline font-medium">
                Dashboard
              </Link>
              <Link href="/map" className="hover:underline text-gray-600">
                Map (Coming soon)
              </Link>
              <Link href="/reports" className="hover:underline text-gray-600">
                Reports (Coming soon)
              </Link>
            </nav>
          </aside>

          {/* Main app content area */}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
