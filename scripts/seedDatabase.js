// seed.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or anon key in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTemperatureData() {
  try {
    const transformerIds = [
      "XFMR-0001",
      "XFMR-0002",
      "XFMR-0003",
      "XFMR-0004",
      "XFMR-0005",
      "XFMR-0006",
      "XFMR-0007",
      "XFMR-0008",
      "XFMR-0009",
      "XFMR-0010",
    ];

    // OPTIONAL: Clear existing data
    const { count, error: deleteError } = await supabase
      .from("temperature_readings")
      .delete()
      .not("id", "is", null)
      .select("*", { count: "exact" });

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return;
    }
    console.log(`Cleared ${count} existing temperature readings.`);

    // Random base between 20–100

    const amplitude = 20;
    const noiseLevel = 1.5;

    const totalHours = 24 * 30; // 30 days of hourly data
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    for (const transformerId of transformerIds) {
      const readings = [];
      const baseTemp = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
      for (let hour = 0; hour < totalHours; hour++) {
        const hourOfDay = hour % 24;
        const timestamp = new Date(startDate);
        timestamp.setUTCHours(timestamp.getUTCHours() + hour);

        const angle = ((2 * Math.PI) / 24) * (hourOfDay - 19); // peak at 7pm
        const normalizedSin = (Math.sin(angle) + 1) / 2;

        const tempC = baseTemp + amplitude * normalizedSin + (Math.random() * 2 - 1) * noiseLevel;

        readings.push({
          transformer_id: transformerId,
          timestamp: timestamp.toISOString(),
          tempC: Number(tempC.toFixed(2)),
        });
      }

      const { data, error } = await supabase.from("temperature_readings").insert(readings).select();

      if (error) {
        console.error(`Insert error for ${transformerId}:`, error);
        continue;
      }

      console.log(`Inserted ${data.length} readings for ${transformerId}`);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

await seedTemperatureData();
