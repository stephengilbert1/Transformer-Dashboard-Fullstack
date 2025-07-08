// page.tsx
"use client";

import { TransformerDashboard } from "@/src/components/TransformerDashboard";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <TransformerDashboard />
    </main>
  );
}

// Next to do on this app is to address the loading of data takin ~10s
