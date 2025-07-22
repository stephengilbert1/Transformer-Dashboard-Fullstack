"use client";

import { TransformerMap } from "@/src/components/Map/TransformerMap";
import { TransformerSummary } from "@/src/types";

type Props = {
  transformers: TransformerSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  children: React.ReactNode;
};

export function MapPageLayout({ transformers, selectedId, onSelect, children }: Props) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Fullscreen background map */}
      <div className="absolute inset-0 z-0">
        <TransformerMap transformers={transformers} selectedId={selectedId} onSelect={onSelect} />
      </div>

      {/* Floating panel(s) */}
      {children}
    </div>
  );
}
