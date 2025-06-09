// route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";


export async function POST(req: Request) {
  try {
    const { id, newTempC } = await req.json();

    if (!id || typeof newTempC !== "number") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    
    // Insert new temperature record into the separate table
    const { error: insertError } = await supabase
      .from("temperature_readings")
      .insert([
        {
          transformer_id: id,
          tempC: newTempC,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (insertError) {
  console.error("Insert error:", insertError);
  return NextResponse.json({ error: insertError.message || "Failed to insert temperature" }, { status: 500 });
}


   return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
