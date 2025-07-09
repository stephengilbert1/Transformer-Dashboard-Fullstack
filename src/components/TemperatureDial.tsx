import React from "react";

type Props = {
  value: number | null;
  label: string;
};

export function TemperatureDial({ value, label }: Props) {
  const max = 140;
  const percent = value !== null ? Math.min((value / max) * 100, 100) : 0;

  // ✅ Color based on thresholds
  let color = "text-gray-400";
  if (value !== null) {
    if (value < 60) color = "text-green-500";
    else if (value <= 110) color = "text-orange-500";
    else color = "text-red-500";
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-sm font-medium text-left">{label}</div>
      <div className="flex flex-col items-center">
        <div
          className={`radial-progress ${color} rotate-180`}
          style={
            {
              "--value": percent,
              "--size": "8rem",
              "--thickness": "0.7rem",
            } as React.CSSProperties
          }
          role="progressbar"
        >
          <span className="rotate-180">{value !== null ? `${value.toFixed(1)}°C` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
