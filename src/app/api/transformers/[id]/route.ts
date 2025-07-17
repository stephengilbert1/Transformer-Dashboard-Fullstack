// src/app/api/transformers/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Extract transformer ID from the pathname
  const id = request.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing transformer ID" }, { status: 400 });
  }

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
