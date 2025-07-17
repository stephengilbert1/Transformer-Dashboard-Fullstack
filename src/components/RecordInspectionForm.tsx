"use client";

import { useState } from "react";

const today = new Date().toISOString().split("T")[0];
const CONDITIONS = ["Good", "Leaking", "Damaged", "Blocked Access"];

export default function RecordInspectionForm({ transformerId }: { transformerId: string }) {
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const res = await fetch("/api/inspections", {
      method: "POST",
      body: JSON.stringify({
        transformerId,
        inspectionDate: today,
        inspectorName: "Auto", // You can replace or remove this
        condition,
        notes,
      }),
    });

    if (res.ok) {
      setStatus("Inspection saved");
      setCondition("Good");
      setNotes("");
    } else {
      const { error } = await res.json();
      setStatus(`Error: ${error}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg shadow-sm p-4 space-y-3 text-sm w-full max-w-full"
    >
      <h3 className="font-semibold text-lg text-gray-800 mb-2">
        Inspecting: <span className="font-mono">{transformerId}</span>
      </h3>

      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => setCondition(label)}
            className={`px-3 py-1 rounded-full text-sm border ${
              condition === label
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="input w-full"
        rows={2}
      />

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>

      {status && <p className="text-xs text-gray-500">{status}</p>}
    </form>
  );
}
