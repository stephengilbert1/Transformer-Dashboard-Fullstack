// MiniMap.tsx
import { TransformerMap } from "./TransformerMap";

export function MiniMap({ transformers }: { transformers: TransformerSummary[] }) {
  return (
    <div className="rounded-md overflow-hidden shadow-sm">
      <TransformerMap transformers={transformers} zoom={4} height="200px" showPopups={false} />
    </div>
  );
}
