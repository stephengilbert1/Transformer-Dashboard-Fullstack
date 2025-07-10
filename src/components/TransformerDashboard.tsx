"use client";

import { useState, useEffect, useMemo } from "react";
import { TransformerTable } from "@/src/components/TransformerTable";
import { TemperatureChart } from "@/src/components/TemperatureChart";
import { TimeRangeSelector } from "@/src/components/TimeRangeSelector";
import { useTransformers } from "@/src/hooks/useTransformers";
import { TemperatureDial } from "@/src/components/TemperatureDial";
import { calculateAverage } from "@/src/utils/calculateAverage";
import { calculatePeak } from "@/src/utils/calculatePeak";

import {
  OVERHEAT_THRESHOLD,
  Transformer,
  TemperatureReading,
  SortableKey,
  TIME_RANGES,
} from "@/src/types/index";

export function TransformerDashboard() {
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [sortKey, setSortKey] = useState<SortableKey>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>("1w");

  const { transformers, selectedId, setSelectedId, fetchTransformerWithReadings, loading } =
    useTransformers(timeRange);

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

  const sortedTransformers = useMemo(() => {
    return transformers
      .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (!sortKey) return 0;
        if (sortKey === "tempC") {
          const aVal = a.avgTemp ?? -Infinity;
          const bVal = b.avgTemp ?? -Infinity;
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (sortKey === "status") {
          const aHot = a.avgTemp !== undefined && a.avgTemp > OVERHEAT_THRESHOLD;
          const bHot = b.avgTemp !== undefined && b.avgTemp > OVERHEAT_THRESHOLD;
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
  }, [transformers, sortKey, sortOrder, searchQuery]);

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

  const history = selectedTransformer?.temperatureHistory ?? [];

  return (
    <main className="flex flex-col px-6 pt-4 pb-2 w-full overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Transformer Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[500px]">
        {/* LEFT: Table */}
        <div className="flex flex-col flex-1 overflow-auto min-h-[300px] bg-[#f5f5f5] rounded-lg p-4 shadow-sm">
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
        </div>

        {/* RIGHT: Dial + Chart */}
        <div className="flex flex-col justify-between flex-1">
          <div className="flex flex-col flex-1">
            {/* Top half: dials centered */}

            {history.length > 0 ? (
              <div className="w-full max-w-2xl mx-auto px-4">
                <div className="flex gap-6 mb-4">
                  <div className="flex-1 bg-[#f5f5f5] rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <TemperatureDial
                      label="Current Temp."
                      value={
                        history
                          .slice()
                          .reverse()
                          .find((entry) => new Date(entry.timestamp).getTime() <= Date.now())
                          ?.tempC ?? null
                      }
                    />
                  </div>
                  <div className="flex-1 bg-[#f5f5f5] rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <TemperatureDial label="24hr Peak" value={calculatePeak(history)} />
                  </div>
                </div>

                <div className="bg-[#f5f5f5] rounded-lg p-4 shadow-sm">
                  <TemperatureChart
                    transformerId={selectedTransformer?.id ?? ""}
                    data={preparedData.data}
                    chartStart={preparedData.chartStart}
                    chartEnd={preparedData.chartEnd}
                    timeRange={timeRange}
                  />
                  <div className="mt-4 flex justify-center">
                    <TimeRangeSelector
                      value={timeRange}
                      options={Object.keys(TIME_RANGES)}
                      onChange={(val) => setTimeRange(val as keyof typeof TIME_RANGES)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No data for the selected time range.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
