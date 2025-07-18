"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md transition ${
      pathname === path
        ? "bg-[#e4e4e4] text-black font-semibold"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#dadada] border-r border-gray-300 p-6">
      <h1 className="text-lg font-bold mb-6">Menu</h1>
      <nav className="flex flex-col space-y-2 text-sm">
        <Link href="/" className={linkClasses("/")}>
          Dashboard
        </Link>
        <Link href="/map" className={linkClasses("/map")}>
          Map
        </Link>
        <Link href="/reports" className={linkClasses("/reports")}>
          Reports (Coming soon)
        </Link>
      </nav>
    </aside>
  );
}
