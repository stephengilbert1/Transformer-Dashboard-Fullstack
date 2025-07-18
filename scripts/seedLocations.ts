// scripts/seedLocations.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const timHortonsVancouverLocations = [
  { lat: 49.2827, lng: -123.1207 },
  { lat: 49.2771, lng: -123.1275 },
  { lat: 49.2734, lng: -123.103 },
  { lat: 49.2606, lng: -123.2481 },
  { lat: 49.2904, lng: -123.132 },
  { lat: 49.2348, lng: -123.0359 },
  { lat: 49.2488, lng: -123.0762 },
  { lat: 49.2625, lng: -123.114 },
  { lat: 49.2832, lng: -123.0984 },
  { lat: 49.2463, lng: -123.1856 },
];

async function main() {
  const transformers = await prisma.transformers.findMany({
    orderBy: { id: "asc" },
    take: 10,
  });

  for (let i = 0; i < transformers.length; i++) {
    const t = transformers[i];
    const location = timHortonsVancouverLocations[i];

    if (location) {
      await prisma.transformers.update({
        where: { id: t.id },
        data: { location },
      });
      console.log(`Updated transformer ${t.id} with location ${location.lat}, ${location.lng}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
