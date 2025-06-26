"use client";

// export function TransformerTable() {
//   return <div>Hello from TransformerTable</div>;
// }

// src/components/TransformerTable.tsx
import React from "react";

type TemperatureReading = {
  timestamp: string;
  tempC: number;
};

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  latestTemp?: number;
  temperatureHistory: TemperatureReading[];
};

type SortableKey = "id" | "kVA" | "tempC" | "type" | "mfgDate" | "status";

type Props = {
  transformers: Transformer[];
  selectedId: string;
  onSelect: (id: string) => void;
  sortKey: SortableKey | null;
  sortOrder: "asc" | "desc";
  onSort: (key: SortableKey) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
};

const OVERHEAT_THRESHOLD = 110;

const HEADER_LABELS: Record<string, string> = {
  id: "ID",
  type: "Type",
  kVA: "kVA",
  mfgDate: "Mfg. Date",
  tempC: "Current Temp (°C)",
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
    <>
      <input
        type="text"
        placeholder="Search by ID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded px-2 py-1 mb-4 w-full max-w-sm"
      />
      <div className="max-h-[400px] overflow-y-auto border rounded shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              {["id", "type", "kVA", "mfgDate", "tempC", "status"].map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 cursor-pointer select-none"
                  onClick={() => onSort(key as SortableKey)}
                >
                  {HEADER_LABELS[key]} {sortKey === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const isSelected = selectedId === t.id;
              const latestTemp = t.latestTemp ?? null; // ✅ Use precomputed latestTemp

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`cursor-pointer hover:bg-blue-50 ${
                    isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <td className={`p-2 font-mono ${isSelected ? "font-bold" : ""}`}>{t.id}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">{t.kVA}</td>
                  <td className="p-2">{t.mfgDate}</td>

                  {/* ✅ Current Temp column now uses latestTemp */}
                  <td className="text-center">
                    {latestTemp !== null ? latestTemp.toFixed(1) : "—"}
                  </td>

                  {/* ✅ Status column also uses latestTemp */}
                  <td className="p-2">
                    {latestTemp !== null && latestTemp > OVERHEAT_THRESHOLD ? (
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
    </>
  );
}
