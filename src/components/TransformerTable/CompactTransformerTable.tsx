"use client";

import React, { useMemo } from "react";
import { TransformerSummary, SortableKey, OVERHEAT_THRESHOLD } from "@/src/types";

type Props = {
  transformers: TransformerSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  sortKey: SortableKey;
  sortOrder: "asc" | "desc";
  onSort: (key: SortableKey) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
};

function getSortValue(t: TransformerSummary, key: SortableKey) {
  switch (key) {
    case "id":
      return t.id;
    case "kVA":
      return t.kVA;
    case "type":
      return t.type;
    case "mfgDate":
      return t.mfgDate;
    case "tempC": // this maps to avgTemp
      return t.avgTemp ?? -Infinity;
    case "status": // derived field
      return typeof t.avgTemp === "number" && t.avgTemp > OVERHEAT_THRESHOLD
        ? "Overheating"
        : "Normal";
    default:
      return "";
  }
}

export function CompactTransformerTable({
  transformers,
  selectedId,
  onSelect,
  sortKey,
  sortOrder,
  onSort,
  searchQuery,
  setSearchQuery,
}: Props) {
  const filtered = useMemo(
    () =>
      transformers
        .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          const aVal = getSortValue(a, sortKey);
          const bVal = getSortValue(b, sortKey);
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }),
    [transformers, sortKey, sortOrder, searchQuery]
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <input
        type="text"
        placeholder="Search by ID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded px-2 py-1 mb-4 w-full max-w-sm"
      />

      <div className="flex-1 overflow-y-auto border rounded shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--background)" }}>
            <tr>
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => onSort("id")}>
                ID {sortKey === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="px-4 py-2 cursor-pointer select-none" onClick={() => onSort("tempC")}>
                24hr Avg (°C) {sortKey === "tempC" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const isSelected = selectedId === t.id;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`cursor-pointer hover:bg-blue-50 ${
                    isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <td className={`p-2 font-mono ${isSelected ? "font-bold" : ""}`}>{t.id}</td>
                  <td className="p-2 text-center">
                    {typeof t.avgTemp === "number" ? t.avgTemp.toFixed(1) : "—"}
                  </td>
                  <td className="p-2 text-center">
                    {typeof t.avgTemp === "number" && t.avgTemp > OVERHEAT_THRESHOLD ? (
                      <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
                        Overheating
                      </span>
                    ) : (
                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
