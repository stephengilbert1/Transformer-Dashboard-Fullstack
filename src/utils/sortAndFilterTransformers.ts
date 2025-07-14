import { OVERHEAT_THRESHOLD, SortableKey } from "@/src/types";

export function sortAndFilterTransformers(
  transformers: any[],
  sortKey: SortableKey,
  sortOrder: "asc" | "desc",
  searchQuery: string
) {
  return transformers
    .filter((t) => t.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;

      if (sortKey === "tempC") {
        const aVal = a.avgTemp ?? -Infinity;
        const bVal = b.avgTemp ?? -Infinity;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (sortKey === "status") {
        const aHot = a.avgTemp !== undefined && a.avgTemp > OVERHEAT_THRESHOLD;
        const bHot = b.avgTemp !== undefined && b.avgTemp > OVERHEAT_THRESHOLD;
        return aHot === bHot
          ? 0
          : aHot
          ? sortOrder === "asc"
            ? 1
            : -1
          : sortOrder === "asc"
          ? -1
          : 1;
      }

      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "kVA" && typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === "asc"
        ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
        : String(bVal ?? "").localeCompare(String(aVal ?? ""));
    });
}
