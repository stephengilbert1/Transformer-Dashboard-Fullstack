"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Transformer = {
  id: string;
  type: string;
  kVA: number;
  mfgDate: string;
  temperature_readings: { timestamp: string; tempC: number }[];
};

export default function TransformerPage() {
  const { id } = useParams() as { id: string };
  const [transformer, setTransformer] = useState<Transformer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    fetch(`/api/transformers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch transformer");
        return res.json();
      })
      .then(setTransformer)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!transformer) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Transformer {transformer.id}</h1>
      <p>Type: {transformer.type}</p>
      <p>Rating: {transformer.kVA} kVA</p>
      <p>Manufactured: {transformer.mfgDate}</p>

      <h2 className="mt-4 font-semibold">Temperature History</h2>
      <ul className="list-disc ml-6">
        {transformer.temperature_readings?.map((t) => (
          <li key={t.timestamp}>
            {new Date(t.timestamp).toLocaleTimeString()}: {t.tempC} °C
          </li>
        )) ?? <li>No temperature data available</li>}
      </ul>
    </div>
  );
}
