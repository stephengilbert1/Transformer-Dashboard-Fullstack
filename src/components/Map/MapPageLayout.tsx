// src/components/Map/MapPageLayout.tsx
export function MapPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full h-screen overflow-hidden">{children}</div>;
}
