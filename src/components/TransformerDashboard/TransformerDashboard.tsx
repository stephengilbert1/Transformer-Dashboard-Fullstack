"use client";

import { useState, useEffect } from "react";
import { TransformerTable } from "@/src/components/TransformerTable";
import TransformerDetailPanel from "@/src/components/TransformerDashboard/TransformerDetailPanel";
import { useTransformers } from "@/src/hooks/useTransformers";
import { Transformer, TIME_RANGES } from "@/src/types/index";
import RecordInspectionForm from "@/src/components/RecordInspectionForm";

export function TransformerDashboard() {
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>("1w");

  const { transformers, selectedId, setSelectedId, fetchTransformerWithReadings, loading } =
    useTransformers(timeRange);

  // Fetch readings for selected transformer and time range
  useEffect(() => {
    const fetchReadings = async () => {
      if (!selectedId) return;
      const transformer = await fetchTransformerWithReadings(selectedId, TIME_RANGES[timeRange]);
      if (transformer) setSelectedTransformer(transformer);
    };
    fetchReadings();
  }, [selectedId, timeRange]);

  // Auto-refresh readings every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (selectedId) {
        const transformer = await fetchTransformerWithReadings(selectedId, TIME_RANGES[timeRange]);
        if (transformer) setSelectedTransformer(transformer);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [selectedId, timeRange]);

  return (
    <main className="flex flex-col px-6 pt-4 pb-2 w-full overflow-hidden">
      {/* <h1 className="text-2xl font-bold mb-4 text-gray-800">Transformer Dashboard</h1> */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[500px]">
        {/* LEFT: Table */}
        <div className="flex flex-col items-center flex-1 overflow-auto min-h-[300px]">
          <div className="w-full max-w-5xl">
            <div className="bg-[#f5f5f5] rounded-lg p-4 shadow-sm">
              <TransformerTable
                transformers={transformers}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {selectedId && (
              <div className="mt-4">
                <RecordInspectionForm transformerId={selectedId} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="flex flex-col flex-1">
          <TransformerDetailPanel
            selectedTransformer={selectedTransformer}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        </div>
      </div>
    </main>
  );
}
