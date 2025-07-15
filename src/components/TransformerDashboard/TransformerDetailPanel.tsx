"use client";

import { useMemo } from "react";
import { TemperatureChart } from "@/src/components/TemperatureChart";
import { TimeRangeSelector } from "@/src/components/TimeRangeSelector";
import TemperatureSummaryDials from "@/src/components/TransformerDashboard/TemperatureSummaryDials";
import { TIME_RANGES, Transformer, TemperatureReading } from "@/src/types/index";

/**
 * Shows the two temperature dials (current + 24 h peak) and the chart + selector
 * for the currently‑selected transformer. Designed to live in the right‑hand
 * column of the dashboard grid.
 */
export default function TransformerDetailPanel({
  selectedTransformer,
  timeRange,
  setTimeRange,
}: {
  selectedTransformer: Transformer | null;
  timeRange: keyof typeof TIME_RANGES;
  setTimeRange: (r: keyof typeof TIME_RANGES) => void;
}) {
  const history: TemperatureReading[] = selectedTransformer?.temperatureHistory ?? [];

  /**
   * Prepare data for recharts – limit to the requested window, round to the
   * nearest minute, and always ensure the latest reading is present so the
   * dial & chart stay in sync.
   */
  const { prepped, chartStart, chartEnd } = useMemo(() => {
    const end = Date.now();
    const start = end - TIME_RANGES[timeRange] * 24 * 60 * 60 * 1000;

    if (!history.length) return { prepped: [], chartStart: start, chartEnd: end };

    const rounded = history.map((r) => {
      const ts = new Date(r.timestamp);
      ts.setSeconds(0, 0);
      return { ...r, timestamp: ts.getTime() };
    });

    let filtered = rounded.filter((r) => r.timestamp >= start && r.timestamp <= end);

    const last = rounded.at(-1);
    if (last && filtered.at(-1)?.timestamp !== last.timestamp) {
      filtered = [...filtered, last];
    }

    return {
      prepped: filtered,
      chartStart: start,
      chartEnd: end,
    };
  }, [history, timeRange]);

  if (!history.length) {
    return <p className="text-sm text-gray-500 mt-4">No data for the selected time range.</p>;
  }

  const currentTemp = history.at(-1)?.tempC ?? null;

  return (
    <div className="w-full mx-auto px-4">
      {/* Dials */}
      <TemperatureSummaryDials history={history} />
      {/* Chart */}{" "}
      <div className="bg-[#f5f5f5] rounded-lg p-4 shadow-sm">
        <TemperatureChart
          transformerId={selectedTransformer?.id ?? ""}
          data={prepped}
          chartStart={chartStart}
          chartEnd={chartEnd}
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
  );
}
