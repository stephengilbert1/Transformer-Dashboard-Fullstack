import { NextResponse } from "next/server";

const types = ["1ph-pole", "3ph-pole", "1ph-pad", "3ph-pad"] as const;

function getKVAOptions(type: string): number[] {
  switch (type) {
    case "1ph-pole":
      return [10, 15, 25, 37.5, 50];
    case "3ph-pole":
      return [15, 25, 37.5, 50, 75, 100, 150];
    case "1ph-pad":
      return [15, 25, 37.5, 50, 75, 100, 167];
    case "3ph-pad":
      return [45, 75, 150, 250, 333, 500, 750, 1000, 1500, 2000, 2500];
    default:
      return [25, 50, 75, 100];
  }
}

function generateTransformer(id: string) {
  const index = parseInt(id.replace("XFMR-", "")) - 1;
  const type = types[index % types.length];
  const kvaOptions = getKVAOptions(type);
  const kVA = kvaOptions[Math.floor(Math.random() * kvaOptions.length)];

  const now = Date.now();
  const baseTemp = Math.random() < 0.17 ? 100 + Math.random() * 20 : 70 + Math.random() * 30;

  const temperatureHistory = Array.from({ length: 10 }).map((_, j) => ({
    timestamp: new Date(now - j * 60000).toISOString(),
    tempC: Math.round(baseTemp + Math.random() * 4 - 2),
  }));

  return {
    id,
    type,
    kVA,
    mfgDate: `20${10 + (index % 15)}-01-01`,
    temperatureHistory,
  };
}

// The type for the context must be manually typed
type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id.startsWith("XFMR-")) {
    return NextResponse.json({ error: "Invalid transformer ID" }, { status: 400 });
  }

  const transformer = generateTransformer(id);
  return NextResponse.json(transformer);
}
