import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { id, newTempC } = await req.json();

    if (!id || typeof newTempC !== "number") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    // Fetch current temperature history
    const { data: xfmr, error: fetchError } = await supabase
      .from("transformers")
      .select("temperatureHistory")
      .eq("id", id)
      .single();

    if (fetchError || !xfmr) {
      return NextResponse.json({ error: "Transformer not found" }, { status: 404 });
    }

    const updatedHistory = [
      ...(xfmr.temperatureHistory || []).slice(-9), // last 9 entries
      { timestamp: new Date().toISOString(), tempC: newTempC },
    ];

    const { error: updateError } = await supabase
      .from("transformers")
      .update({ temperatureHistory: updatedHistory })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update temperature" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
