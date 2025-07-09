import { TemperatureReading } from "@/src/types";

export function calculateAverage(history: TemperatureReading[]): number | null {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;

  const recent = history.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff);
  if (recent.length === 0) return null;

  const total = recent.reduce((sum, entry) => sum + entry.tempC, 0);
  return total / recent.length;
}
