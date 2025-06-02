"use client";

import { useState, useEffect } from "react";
import { generateMockTransformers } from "@/data/transformers";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TextProps } from "recharts";

const OVERHEAT_THRESHOLD = 100;

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  temperatureHistory: { timestamp: string; tempC: number }[];
};

type SortableKey = "id" | "kVA" | "tempC" | "type" | "mfgDate" | "status";

export default function Home() {
  const [sortKey, setSortKey] = useState<SortableKey | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [transformersData, setTransformersData] = useState<Transformer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const tickStyle: Partial<TextProps> = { angle: -45, fontSize: 10 };
  // Initialize mock data once on mount
  useEffect(() => {
    const initialData = generateMockTransformers(1000);
    setTransformersData(initialData);
    if (initialData.length) {
      setSelectedId(initialData[0].id);
    }
  }, []);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      console.log("Sort toggled:", { key, order: newOrder });
    } else {
      setSortKey(key);
      setSortOrder("asc");
      console.log("Sort changed:", { key, order: "asc" });
    }
  };

  const isOverheating = (temps: { tempC: number }[]) =>
    temps.some((p) => p.tempC > OVERHEAT_THRESHOLD);

  const selectedTransformer = transformersData.find((t) => t.id === selectedId);

  const filteredTransformers = transformersData
    .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;

      if (sortKey === "tempC") {
        const aVal = a.temperatureHistory.at(-1)?.tempC ?? -Infinity;
        const bVal = b.temperatureHistory.at(-1)?.tempC ?? -Infinity;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (sortKey === "status") {
        const aHot = isOverheating(a.temperatureHistory);
        const bHot = isOverheating(b.temperatureHistory);
        if (aHot === bHot) return 0;
        return sortOrder === "asc" ? (aHot ? 1 : -1) : aHot ? -1 : 1;
      }

      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Live temperature updates every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setTransformersData((prev) =>
        prev.map((t) => {
          const last = t.temperatureHistory.at(-1);
          const nextTemp = Math.round((last?.tempC ?? 75) + (Math.random() * 6 - 3));
          const nextReading = {
            timestamp: new Date().toISOString(),
            tempC: nextTemp,
          };

          return {
            ...t,
            temperatureHistory: [...t.temperatureHistory.slice(-9), nextReading],
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Transformer Dashboard</h1>

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
              {[
                ["id", "ID"],
                ["type", "Type"],
                ["kVA", "kVA"],
                ["mfgDate", "Mfg Date"],
                ["tempC", "Current Temp"],
                ["status", "Status"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="px-4 py-2 cursor-pointer select-none"
                  onClick={() => handleSort(key as SortableKey)}
                >
                  {label} {sortKey === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransformers.map((t) => {
              const isSelected = selectedId === t.id;
              const latestTemp = t.temperatureHistory.at(-1)?.tempC;
              const maxTemp = Math.max(...t.temperatureHistory.map((x) => x.tempC));

              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`relative cursor-pointer hover:bg-blue-50 ${
                    isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""
                  }`}
                >
                  <td className={`p-2 font-mono ${isSelected ? "font-bold" : ""}`}>{t.id}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">{t.kVA}</td>
                  <td className="p-2">{t.mfgDate}</td>
                  <td className="px-4 py-2 text-center">
                    {typeof latestTemp === "number" ? latestTemp.toFixed(1) : "—"}
                  </td>
                  <td className="p-2">
                    {maxTemp > OVERHEAT_THRESHOLD ? (
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

      {selectedTransformer ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
            {selectedTransformer.id} – Temperature History
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Status:{" "}
            <span
              className={
                isOverheating(selectedTransformer.temperatureHistory)
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {isOverheating(selectedTransformer.temperatureHistory) ? "Overheating" : "Normal"}
            </span>
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedTransformer.temperatureHistory}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                interval={3}
                minTickGap={61}
                tick={tickStyle}
              />
              <YAxis domain={[60, 120]} />
              <Tooltip />
              <Line type="monotone" dataKey="tempC" stroke="#1D4ED8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </>
      ) : (
        <p className="text-gray-500 mt-6">Loading transformer data...</p>
      )}
    </main>
  );
}
