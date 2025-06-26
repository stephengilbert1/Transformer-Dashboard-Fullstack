import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Get all transformer IDs
    const { data: transformers, error: tfError } = await supabase
      .from("transformers")
      .select("id");

    if (tfError || !transformers) {
      return NextResponse.json({ error: "Failed to fetch transformers" }, { status: 500 });
    }

    const newReadings = [];

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));



    for (const tf of transformers) {
  


  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(startOfDayUTC.getTime() + i * 60 * 60 * 1000);
    const hour = timestamp.getUTCHours();
    const angle = ((2 * Math.PI) / 24) * (hour - 17);
    const sin = (Math.sin(angle) + 1) / 2;
    const base = 50 + Math.random() * 20;
    const tempC = base + 40 * sin + (Math.random() * 2 - 1) * 1.5;

    newReadings.push({
      transformer_id: tf.id,
      timestamp: timestamp.toISOString(),
      tempC: Number(tempC.toFixed(2)),
    });
  }
}


    if (newReadings.length === 0) {
      return NextResponse.json({ message: "No readings generated" }, { status: 200 });
    }

    const { error: insertErr } = await supabase
      .from("temperature_readings")
      .insert(newReadings);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Inserted simulated readings", count: newReadings.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
