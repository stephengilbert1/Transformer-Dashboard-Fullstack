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

  const { data: downsampled, error: rpcError } = await supabase.rpc(
    "downsample_temperature_readings",
    {
      transformer_id: transformerId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      buckets: 50,
    }
  );

  if (transformerError || rpcError || !downsampled) {
    console.error("Transformer error:", transformerError);
    console.error("RPC error:", rpcError);
    console.error("Downsampled:", downsampled);
    console.error("Params:", {
      transformerId,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      buckets: 50,
    });

    return null;
  }

  return { ...transformer, temperatureHistory: downsampled };
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
    const enriched = transformers.map((xfmr) => {
      const raw = (groupedRange[xfmr.id] ?? []).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const maxPoints = 1000;
      const downsampled =
        raw.length <= maxPoints
          ? raw
          : raw.filter((_, index) => index % Math.ceil(raw.length / maxPoints) === 0);

      return {
        ...xfmr,
        latestTemp: latestMap.get(xfmr.id) ?? null,
        temperatureHistory: downsampled, // ✅ this was missing
      };
    });

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

    const data = raw.filter(
      (entry) => entry.timestamp >= chartStart && entry.timestamp <= chartEnd
    );

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
