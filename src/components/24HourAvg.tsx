// src/components/24HourAvg.ts
import { TemperatureReading } from "@/src/types/index";

export function get24HrAverage(readings: TemperatureReading[]): number | null {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentReadings = readings.filter((r) => new Date(r.timestamp) >= cutoff);

  if (recentReadings.length === 0) return null;

  const sum = recentReadings.reduce((acc, r) => acc + r.tempC, 0);
  return sum / recentReadings.length;
}
