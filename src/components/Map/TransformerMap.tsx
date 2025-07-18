// TransformerMap.tsx
import dynamic from "next/dynamic";
import type { TransformerSummary } from "@/src/types";

export const TransformerMap = dynamic(
  () => import("./TransformerMapClient").then((mod) => mod.TransformerMapClient),
  {
    ssr: false, // ⛔ prevent SSR execution
    loading: () => <div className="text-center p-4">Loading map...</div>,
  }
);
