// src/utils/getLatestValidTemperature.ts
import type { TemperatureReading } from "@/src/types";

export function getLatestValidTemperature(
  readings: TemperatureReading[] | undefined
): number | null {
  if (!readings || readings.length === 0) return null;

  const now = Date.now();
  const validReadings = readings.filter((entry) => new Date(entry.timestamp).getTime() <= now);

  const latest = validReadings.at(-1);
  return latest?.tempC ?? null;
}
