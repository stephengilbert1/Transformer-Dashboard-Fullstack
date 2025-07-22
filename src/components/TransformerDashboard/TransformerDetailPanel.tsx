"use client";

import { useMemo } from "react";
import { TemperatureChart } from "@/src/components/TemperatureChart";
import { TimeRangeSelector } from "@/src/components/TimeRangeSelector";
import DialCurrentTemp from "@/src/components/TransformerDashboard/DialCurrentTemp";
import DialPeakTemp from "@/src/components/TransformerDashboard/DialPeakTemp";

import { TIME_RANGES, Transformer, TemperatureReading } from "@/src/types/index";

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

    return { prepped: filtered, chartStart: start, chartEnd: end };
  }, [history, timeRange]);

  if (!history.length) {
    return <p className="text-sm text-gray-500 mt-4">No data for the selected time range.</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Dials row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-[#f5f5f5] rounded-lg p-4 shadow-sm flex items-center justify-center">
          <DialCurrentTemp history={history} />
        </div>
        <div className="flex-1 bg-[#f5f5f5] rounded-lg p-4 shadow-sm flex items-center justify-center">
          <DialPeakTemp history={history} />
        </div>
      </div>

      {/* Chart below */}
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
