"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function TopBar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/map") return "Map View";
    if (pathname === "/reports") return "Reports";
    return "Transformer Dashboard";
  };

  return (
    <header className="sitcky w-full h-14 flex items-center justify-between px-4 sm:px-6 bg-black text-white shadow-sm z-40 relative">
      <div className=" sm:pl-10 text-lg font-semibold tracking-tight truncate">
        {getPageTitle()}
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <Link href="/login" className="hover:underline">
          Login (coming soon)
        </Link>
        {/* In the future: Add user avatar or dropdown */}
      </div>
    </header>
  );
}
