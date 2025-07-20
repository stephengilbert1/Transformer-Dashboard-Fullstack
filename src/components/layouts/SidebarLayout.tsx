"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md transition ${
      pathname === path
        ? "bg-[#e4e4e4] text-black font-semibold"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#dadada] p-2 rounded-md shadow-md"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`lg:static z-40 w-64 bg-[#dadada] border-r border-gray-300 p-6 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <h1 className="text-lg font-bold mb-6">Menu</h1>
        <nav className="flex flex-col space-y-2 text-sm">
          <Link href="/" className={linkClasses("/")} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/map" className={linkClasses("/map")} onClick={() => setOpen(false)}>
            Map
          </Link>
          <Link href="/reports" className={linkClasses("/reports")} onClick={() => setOpen(false)}>
            Reports (Coming soon)
          </Link>
        </nav>
      </aside>

      {/* Optional dimmed backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
