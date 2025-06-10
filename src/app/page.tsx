// page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TextProps } from "recharts";
import { supabase } from "@/lib/supabaseClient";

const OVERHEAT_THRESHOLD = 110;
const TIME_RANGES = { "1d": 1, "1W": 7, "1M": 30 };

const HEADER_LABELS: Record<string, string> = {
  id: "ID",
  type: "Type",
  kVA: "kVA",
  mfgDate: "Mfg. Date",
  tempC: "Current Temp (°C)",
  status: "Status",
};

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  temperatureHistory: { timestamp: string; tempC: number }[];
  latestTemp?: number;
};

type SortableKey = "id" | "kVA" | "tempC" | "type" | "mfgDate" | "status";

async function fetchTransformerWithReadings(
  transformerId: string,
  days: number
): Promise<Transformer | null> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

  const { data: transformer, error: transformerError } = await supabase
    .from("transformers")
    .select("*")
    .eq("id", transformerId)
    .single();

  const { data: readings, error: readingsError } = await supabase
    .from("temperature_readings")
    .select("timestamp, tempC")
    .eq("transformer_id", transformerId)
    .gte("timestamp", startTime.toISOString())
    .lte("timestamp", endTime.toISOString())
    .order("timestamp", { ascending: true });

  if (transformerError || readingsError) {
    console.error("Error fetching transformer or readings:", transformerError || readingsError);
    return null;
  }

  return { ...transformer, temperatureHistory: readings ?? [] };
}

export default function Home() {
  const [transformersData, setTransformersData] = useState<Transformer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [sortKey, setSortKey] = useState<SortableKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>("1W");

  const tickStyle: Partial<TextProps> = { angle: 0, fontSize: 10 };

  const fetchTransformersData = async (range: keyof typeof TIME_RANGES) => {
    const days = TIME_RANGES[range];
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

    // 1. Fetch all transformers
    const { data: transformers, error: transformersError } = await supabase
      .from("transformers")
      .select("*");

    if (transformersError) {
      console.error("Error fetching transformers:", transformersError);
      return;
    }

    // 2. Fetch all readings in selected range
    const { data: timeRangeReadings, error: rangeError } = await supabase
      .from("temperature_readings")
      .select("transformer_id, timestamp, tempC")
      .gte("timestamp", startTime.toISOString())
      .lte("timestamp", endTime.toISOString());

    if (rangeError) {
      console.error("Error fetching range readings:", rangeError);
      return;
    }

    // 3. Fetch latest reading for each transformer (1 per transformer)
    const { data: latestReadings, error: latestError } = await supabase
      .from("temperature_readings")
      .select("transformer_id, tempC, timestamp")
      .in(
        "transformer_id",
        transformers.map((t) => t.id)
      )
      .order("timestamp", { ascending: false });

    if (latestError) {
      console.error("Error fetching latest temps:", latestError);
      return;
    }

    // Build latest temp map
    const latestMap = new Map<string, number>();
    for (const reading of latestReadings) {
      if (!latestMap.has(reading.transformer_id)) {
        latestMap.set(reading.transformer_id, reading.tempC);
      }
    }

    // Group time-range readings
    const groupedRange = timeRangeReadings.reduce(
      (acc, reading) => {
        const id = reading.transformer_id;
        if (!acc[id]) acc[id] = [];
        acc[id].push({ timestamp: reading.timestamp, tempC: reading.tempC });
        return acc;
      },
      {} as Record<string, { timestamp: string; tempC: number }[]>
    );

    // Enrich transformers
    const enriched = transformers.map((xfmr) => ({
      ...xfmr,
      latestTemp: latestMap.get(xfmr.id) ?? null,
      temperatureHistory: (groupedRange[xfmr.id] ?? []).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    }));

    setTransformersData(enriched);
    if (!selectedId && enriched.length > 0) {
      setSelectedId(enriched[0].id);
    }
  };

  // Fetch all transformers with recent data
  useEffect(() => {
    fetchTransformersData(timeRange);

    const interval = setInterval(() => {
      fetchTransformersData(timeRange);
    }, 60_000);

    return () => clearInterval(interval);
  }, [timeRange]);

  // Fetch readings for selected transformer and time range
  useEffect(() => {
    const fetchReadings = async () => {
      if (!selectedId) return;
      const transformer = await fetchTransformerWithReadings(selectedId, TIME_RANGES[timeRange]);
      if (transformer) setSelectedTransformer(transformer);
    };
    fetchReadings();
  }, [selectedId, timeRange]);

  // Auto-refresh readings every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (selectedId) {
        const transformer = await fetchTransformerWithReadings(selectedId, TIME_RANGES[timeRange]);
        if (transformer) setSelectedTransformer(transformer);
      }
    }, 60_000); // refresh every 60 seconds

    return () => clearInterval(interval);
  }, [selectedId, timeRange]);

  const handleSort = (key: SortableKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const isOverheating = (temps?: { tempC: number }[]) =>
    !!temps?.some((p) => p.tempC > OVERHEAT_THRESHOLD);

  const sortedTransformers = useMemo(() => {
    return transformersData
      .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (!sortKey) return 0;
        if (sortKey === "tempC") {
          const aVal = a.latestTemp ?? -Infinity;
          const bVal = b.latestTemp ?? -Infinity;
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (sortKey === "status") {
          const aHot = isOverheating(a.temperatureHistory);
          const bHot = isOverheating(b.temperatureHistory);
          return aHot === bHot
            ? 0
            : aHot
              ? sortOrder === "asc"
                ? 1
                : -1
              : sortOrder === "asc"
                ? -1
                : 1;
        }
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (sortKey === "kVA" && typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortOrder === "asc"
          ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
          : String(bVal ?? "").localeCompare(String(aVal ?? ""));
      });
  }, [transformersData, sortKey, sortOrder, searchQuery]);

  const filteredTemperatureHistory = useMemo(() => {
    if (!selectedTransformer?.temperatureHistory) return [];
    const endTime = new Date();
    const days = TIME_RANGES[timeRange];
    const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);
    return selectedTransformer.temperatureHistory.filter((entry) => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= startTime && timestamp <= endTime;
    });
  }, [selectedTransformer, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const date = new Date(label).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div className="bg-white border border-gray-300 rounded shadow-md p-2 text-sm">
          <div className="font-medium text-gray-800">{date} PST</div>
          <div className="text-blue-600 font-semibold">{payload[0].value}°C</div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Transformer Dashboard</h1>

      {/* Search and Table */}
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
                  onClick={() => handleSort(key as SortableKey)}
                >
                  {HEADER_LABELS[key]} {sortKey === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTransformers.map((t) => {
              const isSelected = selectedId === t.id;
              const latestTemp = t.latestTemp ?? null; // ✅ Use precomputed latestTemp

              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
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

      {/* Time Range */}
      <div className="mb-4 mt-4">
        {Object.keys(TIME_RANGES).map((key) => (
          <button
            key={key}
            onClick={() => setTimeRange(key as keyof typeof TIME_RANGES)}
            className={`px-3 py-1 mr-2 rounded ${timeRange === key ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Chart */}
      {selectedTransformer && filteredTemperatureHistory.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
            {selectedTransformer.id} – Temperature History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredTemperatureHistory}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === "1d"
                    ? date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Los_Angeles",
                      })
                    : date.toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        timeZone: "America/Los_Angeles",
                      });
                }}
                ticks={filteredTemperatureHistory
                  .filter((_, i, arr) => i % Math.floor(arr.length / 6) === 0)
                  .map((e) => e.timestamp)}
                tick={tickStyle}
              />
              <YAxis domain={[0, 140]} />
              <ReferenceLine
                y={OVERHEAT_THRESHOLD}
                stroke="red"
                strokeDasharray="4 2"
                label={{
                  value: `Overheat (${OVERHEAT_THRESHOLD}°C)`,
                  position: "top", // 👈 this moves it *above* the line
                  fill: "red",
                  fontSize: 12,
                }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="tempC" stroke="#3b82f6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-4">No data for the selected time range.</p>
      )}
    </main>
  );
}
