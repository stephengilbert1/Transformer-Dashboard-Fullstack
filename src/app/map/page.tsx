"use client";

import { useState } from "react";
import { useTransformers } from "@/src/hooks/useTransformers";
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
    <MapPageLayout transformers={transformers} selectedId={selectedId} onSelect={setSelectedId}>
      {/* Floating panel on top of the map */}
      <div className="absolute top-6 left-6 z-10 w-[350px] max-h-[85vh] bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-xl p-4 overflow-y-auto">
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
    </MapPageLayout>
  );
}
