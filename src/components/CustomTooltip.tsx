"use client";

import React from "react";

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
};

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length && label != null) {
    const date = new Date(label).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="bg-white border border-gray-300 rounded shadow-md p-2 text-sm">
        <div className="font-medium text-gray-800">{date} PST</div>
        <div className="text-blue-600 font-semibold">{Number(payload[0].value).toFixed(1)}°C</div>
      </div>
    );
  }
  return null;
};
