"use client";

import { useState, useEffect } from "react";
import { generateMockTransformers } from "@/data/transformers";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TextProps } from "recharts";

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  temperatureHistory: { timestamp: string; tempC: number }[];
};

export default function Home() {
  const overheatThreshold = 100;

  const [transformersData, setTransformersData] = useState<Transformer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [onlyShowHot, setOnlyShowHot] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Generate mock transformers on first load
  useEffect(() => {
    const initialData = generateMockTransformers(1000);
    setTransformersData(initialData);
    if (initialData.length > 0) {
      setSelectedId(initialData[0].id);
    } // set first ID once data is ready
  }, []);

  const selectedTransformer = transformersData.find((t) => t.id === selectedId);

  const isOverheating = (temps: { tempC: number }[]) =>
    temps.some((p) => p.tempC > overheatThreshold);

  const filteredTransformers = onlyShowHot
    ? transformersData.filter((t) => isOverheating(t.temperatureHistory))
    : transformersData;

  //Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTransformersData((prev) =>
        prev.map((t) => {
          const last = t.temperatureHistory[t.temperatureHistory.length - 1];
          const nextTemp = Math.round(
            last.tempC + (Math.random() * 6 - 3) // add -3 to +3°C
          );
          const next = {
            timestamp: new Date().toISOString(),
            tempC: nextTemp,
          };

          return {
            ...t,
            temperatureHistory: [...t.temperatureHistory.slice(-9), next], // keep last 10 readings
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-grey-200">Transformer Dashboard</h1>

      <div className="mb-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyShowHot}
            onChange={(e) => setOnlyShowHot(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Show only overheating transformers</span>
        </label>
      </div>

      <div className="max-h-[400px] overflow-y-auto border rounded shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Type</th>
              <th className="p-2">kVA</th>
              <th className="p-2">Mfg Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredTransformers]
              .sort(
                (a, b) =>
                  Math.max(...b.temperatureHistory.map((x) => x.tempC)) -
                  Math.max(...a.temperatureHistory.map((x) => x.tempC))
              )
              .map((t) => {
                //const overheat = isOverheating(t.temperatureHistory);
                const isSelected = selectedId === t.id;

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    onMouseEnter={() => setHoveredId(t.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`relative cursor-pointer hover:bg-blue-50 ${
                      isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <td className={`p-2 font-mono ${isSelected ? "font-bold" : ""}`}>{t.id}</td>
                    <td className="p-2">{t.type}</td>
                    <td className="p-2">{t.kVA}</td>
                    <td className="p-2">{t.mfgDate}</td>
                    <td className="p-2">
                      {Math.max(...t.temperatureHistory.map((x) => x.tempC)) > 100 ? (
                        <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
                          Overheating
                        </span>
                      ) : (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                          Normal
                        </span>
                      )}
                    </td>
                    {/* spacer for tooltip */}
                    <td className="relative w-[180px] p-2">
                      {hoveredId === t.id && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-10 w-[180px]">
                          <div>Latest: {t.temperatureHistory.at(-1)?.tempC}°C</div>
                          <div>
                            {new Date(
                              t.temperatureHistory.at(-1)?.timestamp || ""
                            ).toLocaleTimeString()}
                          </div>
                        </div>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
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
                tick={{ angle: -45, fontSize: 10 } as Partial<TextProps>}
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
