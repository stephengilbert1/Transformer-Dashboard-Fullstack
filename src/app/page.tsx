// page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TransformerTable } from "@/src/components/TransformerTable";
import { TemperatureChart } from "@/src/components/TemperatureChart";
import { TimeRangeSelector } from "@/src/components/TimeRangeSelector";

const OVERHEAT_THRESHOLD = 110;
const TIME_RANGES = { "1d": 1, "1w": 7, "1m": 30 };

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  temperatureHistory: TemperatureReading[];
  latestTemp?: number;
};

type SortableKey = "id" | "kVA" | "tempC" | "type" | "mfgDate" | "status";

type TemperatureReading = {
  timestamp: string;
  tempC: number;
};

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
    .lte("timestamp", endTime.toISOString());

  if (transformerError || readingsError || !readings) {
    console.error("Error fetching transformer or readings:", transformerError, readingsError);
    return null;
  }

  const now = new Date();
  const bufferMs = 60 * 1000;
  const safeNow = new Date(now.getTime() - bufferMs);

  const filtered = readings
    .filter((r: TemperatureReading) => new Date(r.timestamp) <= safeNow)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return { ...transformer, temperatureHistory: filtered };
}

export default function Home() {
  const [transformersData, setTransformersData] = useState<Transformer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [sortKey, setSortKey] = useState<SortableKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>("1w");

  const fetchTransformersData = async (range: keyof typeof TIME_RANGES) => {
    const days = TIME_RANGES[range];
    const now = new Date();
    const bufferMs = 60 * 1000;
    const safeNow = new Date(now.getTime() - bufferMs);

    // 1. Fetch all transformers
    const { data: transformers, error: transformersError } = await supabase
      .from("transformers")
      .select("*");

    if (transformersError) {
      console.error("Error fetching transformers:", transformersError);
      return;
    }

    // 2. Fetch each transformer's temperature data individually
    const enriched: Transformer[] = [];

    for (const xfmr of transformers) {
      const xfmrWithData = await fetchTransformerWithReadings(xfmr.id, days);
      if (xfmrWithData) {
        enriched.push({
          ...xfmrWithData,
          latestTemp: xfmrWithData.temperatureHistory.at(-1)?.tempC ?? undefined,
        });
      }
    }

    // 3. Update state
    setTransformersData(enriched);

    if (!selectedId && enriched.length > 0) {
      const firstId = enriched[0].id;
      setSelectedId(firstId);

      const transformer = await fetchTransformerWithReadings(firstId, days);
      if (transformer) {
        setSelectedTransformer(transformer);
      }
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

  const isOverheating = (temps?: TemperatureReading[]) =>
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

  const preparedData = useMemo(() => {
    const chartEnd = Date.now();
    const chartStart = chartEnd - TIME_RANGES[timeRange] * 24 * 60 * 60 * 1000;

    if (!selectedTransformer?.temperatureHistory) {
      return { data: [], chartStart, chartEnd };
    }
    const raw = selectedTransformer.temperatureHistory.map((entry) => {
      const ts = new Date(entry.timestamp);
      ts.setSeconds(0, 0); // round to nearest minute
      return {
        ...entry,
        timestamp: ts.getTime(),
      };
    });

    let data = raw.filter((entry) => entry.timestamp >= chartStart && entry.timestamp <= chartEnd);

    // Always ensure the most recent reading is included at the end
    const last = raw.at(-1);
    if (last && data.length > 0 && last.timestamp !== data.at(-1)?.timestamp) {
      data = [...data, last];
    }

    return { data, chartStart, chartEnd };
  }, [selectedTransformer, timeRange]);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Transformer Dashboard</h1>

      <TransformerTable
        transformers={sortedTransformers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Time Range */}
      <TimeRangeSelector
        value={timeRange}
        options={Object.keys(TIME_RANGES)}
        onChange={(val) => setTimeRange(val as keyof typeof TIME_RANGES)}
      />

      {/* Chart */}
      {selectedTransformer && preparedData.data.length > 0 ? (
        <TemperatureChart
          transformerId={selectedTransformer.id}
          data={preparedData.data}
          chartStart={preparedData.chartStart}
          chartEnd={preparedData.chartEnd}
          timeRange={timeRange}
        />
      ) : (
        <p className="text-sm text-gray-500 mt-4">No data for the selected time range.</p>
      )}
    </main>
  );
}
