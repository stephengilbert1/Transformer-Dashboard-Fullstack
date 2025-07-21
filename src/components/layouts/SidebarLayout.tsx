"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/src/hooks/useSidebarStore";

export function Sidebar() {
  const pathname = usePathname();
  const { open, toggle, close } = useSidebarStore();

  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md transition ${
      pathname === path
        ? "bg-[#e4e4e4] text-black font-semibold"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-[#dadada] border-r border-gray-300 p-6 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <h1 className="text-lg font-bold mb-6">Menu</h1>
        <nav className="flex flex-col space-y-2 text-sm">
          <Link href="/" className={linkClasses("/")} onClick={close}>
            Dashboard
          </Link>
          <Link href="/map" className={linkClasses("/map")} onClick={close}>
            Map
          </Link>
          <Link href="/reports" className={linkClasses("/reports")} onClick={close}>
            Reports (Coming soon)
          </Link>
        </nav>
      </aside>

      {/* Dimmed overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={close}
        />
      )}
    </>
  );
}
