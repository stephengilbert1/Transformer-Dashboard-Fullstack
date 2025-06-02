import { NextResponse } from "next/server";
import { generateTransformers } from "@/lib/generateTransformers";

export async function GET() {
  const transformers = generateTransformers(50);
  return NextResponse.json(transformers);
}
