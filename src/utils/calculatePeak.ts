import { TemperatureReading } from "@/src/types";

export function calculatePeak(history: TemperatureReading[]): number | null {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;

  const recent = history.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff);
  if (recent.length === 0) return null;

  return Math.max(...recent.map((entry) => entry.tempC));
}
