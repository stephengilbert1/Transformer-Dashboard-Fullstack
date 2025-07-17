import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const { transformerId, inspectionDate, inspectorName, condition, notes } = body;

  const { error } = await supabase.from("inspections").insert({
    transformer_id: transformerId,
    inspection_date: inspectionDate,
    inspector_name: inspectorName,
    condition,
    notes,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Inspection recorded" });
}
