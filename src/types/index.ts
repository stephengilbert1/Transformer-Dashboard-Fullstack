// src/types/index.ts

export const OVERHEAT_THRESHOLD = 110;

export type TemperatureReading = {
  timestamp: string;
  tempC: number;
};


export type TransformerSummary = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string; // or Date if you're converting
  latestTemp?: number;
};

export type Transformer = TransformerSummary & {
  temperatureHistory: TemperatureReading[];
};

export type SortableKey = "id" | "kVA" | "tempC" | "type" | "mfgDate" | "status";

export const TIME_RANGES = {
  "1d": 1,
  "1w": 7,
  "1m": 30,
} as const;

export type TimeRangeKey = keyof typeof TIME_RANGES;

export type ChartPoint = {
  timestamp: number;
  tempC: number;
};
