"use client";

import { TemperatureDial } from "@/src/components/TemperatureDial";
import { calculatePeak } from "@/src/utils/calculatePeak";
import { TemperatureReading } from "@/src/types";

type Props = {
  history: TemperatureReading[];
};

export default function TemperatureSummaryDials({ history }: Props) {
  const currentTemp =
    history
      .slice()
      .reverse()
      .find((entry) => new Date(entry.timestamp).getTime() <= Date.now())?.tempC ?? null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 mb-4">
      <div className="w-full max-w-2x bg-[#f5f5f5] rounded-lg shadow-sm p-4 flex items-center justify-center">
        <TemperatureDial label="Current Temp." value={currentTemp} />
      </div>
      <div className="w-full max-w-2x bg-[#f5f5f5] rounded-lg shadow-sm p-4 flex items-center justify-center">
        <TemperatureDial label="24hr Peak" value={calculatePeak(history)} />
      </div>
    </div>
  );
}
