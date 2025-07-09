"use client";

// src/components/TransformerTable.tsx
import React from "react";
import { TransformerSummary, SortableKey, OVERHEAT_THRESHOLD } from "@/src/types";

type Props = {
  transformers: TransformerSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  sortKey: SortableKey | null;
  sortOrder: "asc" | "desc";
  onSort: (key: SortableKey) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
};

const HEADER_LABELS: Record<string, string> = {
  id: "ID",
  type: "Type",
  kVA: "kVA",
  mfgDate: "Mfg. Date",
  tempC: "24hr Avg (°C)",
  status: "Status",
};

export function TransformerTable({
  transformers,
  selectedId,
  onSelect,
  sortKey,
  sortOrder,
  onSort,
  searchQuery,
  setSearchQuery,
}: Props) {
  const filtered = transformers.filter((t) =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Scrollable table wrapper */}
      <div className="flex-1 overflow-y-auto border rounded shadow-sm">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead className="sticky top-0 bg-transparent z-10">
            <tr>
              <th
                className="w-1/6 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("id")}
              >
                {HEADER_LABELS.id} {sortKey === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="w-1/6 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("type")}
              >
                {HEADER_LABELS.type} {sortKey === "type" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="w-1/12 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("kVA")}
              >
                {HEADER_LABELS.kVA} {sortKey === "kVA" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="w-1/6 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("mfgDate")}
              >
                {HEADER_LABELS.mfgDate}{" "}
                {sortKey === "mfgDate" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="w-1/6 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("tempC")}
              >
                {HEADER_LABELS.tempC} {sortKey === "tempC" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="w-1/6 px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                onClick={() => onSort("status")}
              >
                {HEADER_LABELS.status}{" "}
                {sortKey === "status" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
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
                    className={`p-2 font-mono truncate whitespace-normal ${isSelected ? "font-bold" : ""}`}
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
