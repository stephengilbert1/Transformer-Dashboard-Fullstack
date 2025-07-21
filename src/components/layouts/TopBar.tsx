"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useSidebarStore } from "@/src/hooks/useSidebarStore"; // You’ll define this next

export function TopBar() {
  const pathname = usePathname();
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  const getPageTitle = () => {
    if (pathname === "/map") return "Map View";
    if (pathname === "/reports") return "Reports";
    return "Transformer Dashboard";
  };

  return (
    <header className="sticky top-0 w-full h-14 flex items-center justify-between px-4 sm:px-6 bg-black text-white shadow-sm z-40 lg:pl-64">
      {/* Mobile hamburger (left) */}
      <button className="lg:hidden mr-2" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu size={20} />
      </button>

      <div className="text-lg font-semibold tracking-tight truncate sm:pl-10">
        Transformer Dashboard
      </div>

      {/* Right side (future user/login area) */}
      <div className="flex items-center space-x-4 text-sm">
        <Link href="/login" className="hover:underline">
          Login (coming soon)
        </Link>
      </div>
    </header>
  );
}
