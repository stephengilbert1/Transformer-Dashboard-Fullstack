import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: transformers, error: tfError } = await supabase
      .from("transformers")
      .select("id");

    if (tfError || !transformers) {
      return NextResponse.json({ error: "Failed to fetch transformers" }, { status: 500 });
    }

    const now = new Date();
    const newReadings = [];

    for (const tf of transformers) {
      const { data: lastReading } = await supabase
        .from("temperature_readings")
        .select("timestamp")
        .eq("transformer_id", tf.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      const lastTime = lastReading
        ? new Date(lastReading.timestamp)
        : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // fallback: 7 days ago

      const hoursGap = Math.floor((now.getTime() - lastTime.getTime()) / (60 * 60 * 1000));

      for (let i = 1; i <= hoursGap; i++) {
        const timestamp = new Date(lastTime.getTime() + i * 60 * 60 * 1000);
        const hour = timestamp.getUTCHours();
        const angle = ((2 * Math.PI) / 24) * (hour - 19);
        const sin = (Math.sin(angle) + 1) / 2;
        const base = 50 + Math.random() * 20;
        const tempC = base + 20 * sin + (Math.random() * 2 - 1) * 1.5;

        newReadings.push({
          transformer_id: tf.id,
          timestamp: timestamp.toISOString(),
          tempC: Number(tempC.toFixed(2)),
        });
      }
    }

    if (newReadings.length === 0) {
      return NextResponse.json({ message: "No backfill needed" }, { status: 200 });
    }

    const { error: insertErr } = await supabase
      .from("temperature_readings")
      .insert(newReadings);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Backfilled ${newReadings.length} readings across ${transformers.length} transformers`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
