"use client";

import React, { useState, useMemo } from "react";
import { TransformerSummary, SortableKey, OVERHEAT_THRESHOLD } from "@/src/types";

type Props = {
  transformers: TransformerSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const HEADER_LABELS: Record<SortableKey, string> = {
  id: "ID",
  type: "Type",
  kVA: "kVA",
  mfgDate: "Mfg. Date",
  tempC: "24hr Avg (°C)",
  status: "Status",
};

export function TransformerTable({ transformers, selectedId, onSelect }: Props) {
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

  const filtered = useMemo(() => {
    return transformers
      .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aVal = a[sortKey as keyof TransformerSummary];
        const bVal = b[sortKey as keyof TransformerSummary];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [transformers, sortKey, sortOrder, searchQuery]);

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
        <table className="w-full text-xs sm:text-sm">
          <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--background)" }}>
            <tr>
              {(Object.keys(HEADER_LABELS) as SortableKey[]).map((key) => (
                <th
                  key={key}
                  className="px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  {HEADER_LABELS[key]} {sortKey === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
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
                  <td
                    className={`p-2 font-mono truncate whitespace-normal ${
                      isSelected ? "font-bold" : ""
                    }`}
                  >
                    {t.id}
                  </td>
                  <td className="p-2 truncate whitespace-normal">{t.type}</td>
                  <td className="p-2 truncate whitespace-normal">{t.kVA}</td>
                  <td className="p-2 truncate whitespace-normal">{t.mfgDate}</td>
                  <td className="p-2 text-center truncate whitespace-normal">
                    {typeof t.avgTemp === "number" ? t.avgTemp.toFixed(1) : "—"}
                  </td>
                  <td className="p-2">
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
