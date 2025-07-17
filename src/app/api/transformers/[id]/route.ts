import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const transformer = await prisma.transformers.findUnique({
      where: { id },
      include: { temperature_readings: true }, 
    });

    if (!transformer) {
      return NextResponse.json({ error: "Transformer not found" }, { status: 404 });
    }

    return NextResponse.json(transformer);
  } catch (error) {
    console.error("Error fetching transformer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
