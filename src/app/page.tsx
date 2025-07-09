// page.tsx
"use client";

import { TransformerDashboard } from "@/src/components/TransformerDashboard";

export default function HomePage() {
  return (
    <main className="flex-1 p-6 w-full overflow-hidden">
      <TransformerDashboard />
    </main>
  );
}

// Next to do on this app is to address the loading of data takin ~10s
