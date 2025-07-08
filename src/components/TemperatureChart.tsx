"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CustomTooltip } from "@/src/components/CustomTooltip";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartPoint } from "@/src/types";
import { OVERHEAT_THRESHOLD } from "@/src/types";

type Props = {
  transformerId: string;
  data: ChartPoint[];
  chartStart: number;
  chartEnd: number;
  timeRange: string;
};

function generateTicks(start: number, end: number, count: number): number[] {
  const interval = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * interval);
}

export function TemperatureChart({ transformerId, data, chartStart, chartEnd, timeRange }: Props) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
        {transformerId} – Temperature History
      </h2>
      <p className="text-sm text-gray-500 mb-2">
        {new Date(chartStart).toLocaleString()} – {new Date(chartEnd).toLocaleString()}
      </p>

      <AnimatePresence mode="wait">
        {data.length > 0 && (
          <motion.div
            key={transformerId + timeRange}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={[chartStart, chartEnd]}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return timeRange === "1d"
                      ? date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "America/Los_Angeles",
                        })
                      : date.toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          timeZone: "America/Los_Angeles",
                        });
                  }}
                  tick={{ fontSize: 10 }}
                  ticks={generateTicks(chartStart, chartEnd, 6)}
                />

                <YAxis domain={[0, 140]} />
                <ReferenceLine
                  y={OVERHEAT_THRESHOLD}
                  stroke="red"
                  strokeDasharray="4 2"
                  label={{
                    value: `Overheat (${OVERHEAT_THRESHOLD}°C)`,
                    position: "top",
                    fill: "red",
                    fontSize: 12,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="tempC" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
