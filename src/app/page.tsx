"use client";

import { useState, useEffect } from "react";
import { transformers as initialData } from "@/data/transformers";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const overheatThreshold = 100;

export default function Home() {
  const [transformersData, setTransformersData] = useState(initialData);
  const [selectedId, setSelectedId] = useState(initialData[0].id);
  const [onlyShowHot, setOnlyShowHot] = useState(false);

  const selectedTransformer = transformersData.find((t) => t.id === selectedId)!;

  const isOverheating = (temps: { tempC: number }[]) =>
    temps.some((p) => p.tempC > overheatThreshold);

  const filteredTransformers = onlyShowHot
    ? transformersData.filter((t) => isOverheating(t.temperatureHistory))
    : transformersData;

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

      <table className="w-full table-auto border mb-10">
        <thead className="bg-gray-100 text-left text-sm text-gray-600">
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
              const overheat = isOverheating(t.temperatureHistory);
              const isSelected = selectedId === t.id;

              return (
                <tr
                  key={t.id}
                  className={`cursor-pointer hover:bg-blue-50 ${isSelected ? "bg-blue-100 border-l-4 border-blue-600" : ""} transition`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <td className="p-2 font-mono">{t.id}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">{t.kVA}</td>
                  <td className="p-2">{t.manufactureDate}</td>
                  <td className={`p-2 font-mono ${isSelected ? "font-bold" : ""}`}>{t.id}</td>
                  <td
                    className={`p-2 font-semibold ${overheat ? "text-red-600" : "text-green-600"}`}
                  >
                    {overheat ? "Overheating" : "Normal"}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

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
          <XAxis dataKey="timestamp" />
          <YAxis domain={[60, 120]} />
          <Tooltip />
          <Line type="monotone" dataKey="tempC" stroke="#1D4ED8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
    </main>
  );
}
