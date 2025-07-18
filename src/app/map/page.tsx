"use client";

import { useState } from "react";
import { useTransformers } from "@/src/hooks/useTransformers";
import { TransformerMap } from "@/src/components/Map/TransformerMap";
import { CompactTransformerTable } from "@/src/components/TransformerTable/CompactTransformerTable";
import { MapPageLayout } from "@/src/components/Map/MapPageLayout";
import { SortableKey } from "@/src/types";

export default function MapPage() {
  const { transformers, selectedId, setSelectedId } = useTransformers("1w");

  const [sortKey, setSortKey] = useState<SortableKey>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key: SortableKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* MAP fills entire area including behind sidebar */}
      <div className="absolute inset-0 z-0">
        <TransformerMap
          transformers={transformers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* FLOATING TABLE PANEL (not full-height) */}
      <div className="absolute top-20 left-6 z-10 w-[350px] max-h-[85vh] bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-xl p-4 overflow-y-auto">
        <CompactTransformerTable
          transformers={transformers}
          selectedId={selectedId}
          onSelect={setSelectedId}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </div>
  );
}
