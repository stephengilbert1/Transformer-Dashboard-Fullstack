// src/hooks/useTransformers.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TransformerSummary, Transformer, TIME_RANGES } from "@/src/types/index";



export function useTransformers(timeRange: keyof typeof TIME_RANGES) {
  const [transformers, setTransformers] = useState<TransformerSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

const fetchAllSummaries = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_transformer_summaries");
    console.log("Transformer summaries:", data);

    if (error) {
      console.error("Error fetching summaries:", error);
      setLoading(false);
      return;
    }

    setTransformers(
  data.map((t: any) => ({
    id: t.id,
    type: t.type,
    kVA: t.kva,
    mfgDate: t.mfgdate,
    latestTemp: t.latesttemp,
  }))
);

    if (!selectedId && data.length > 0) {
      setSelectedId(data[0].id);
    }
    setLoading(false);
  };



 const fetchTransformerWithReadings = async (
  transformerId: string,
  days: number
): Promise<Transformer | null> => {
  console.time(`Fetch ${transformerId}`);
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

  const { data: transformer, error: transformerError } = await supabase
    .from("transformers")
    .select("*")
    .eq("id", transformerId)
    .single();

  const { data: readings, error: readingsError } = await supabase
    .from("temperature_readings")
    .select("timestamp, tempC")
    .eq("transformer_id", transformerId)
    .gte("timestamp", startTime.toISOString())
    .lte("timestamp", endTime.toISOString());
    

  console.timeEnd(`Fetch ${transformerId}`);



    if (transformerError || readingsError || !readings) {
      console.error("Error fetching transformer or readings:", transformerError, readingsError);
      return null;
    }

    const now = new Date();
    const bufferMs = 60 * 1000;
    const safeNow = new Date(now.getTime() - bufferMs);

    const filtered = readings
      .filter((r) => new Date(r.timestamp) <= safeNow)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { ...transformer, temperatureHistory: filtered };
  };

  useEffect(() => {
    fetchAllSummaries();

    const interval = setInterval(() => {
      fetchAllSummaries();
    }, 60_000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    transformers,
    selectedId,
    setSelectedId,
    fetchTransformerWithReadings, // expose for single fetches
    loading,
  };
}
