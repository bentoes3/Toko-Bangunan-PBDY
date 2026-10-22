import type { Product } from "./domain";

export type StockState = "safe" | "low" | "empty";

const stockStates = {
  safe: { id: "safe", label: "Aman", tone: "green", textClass: "green-text" },
  low: { id: "low", label: "Perlu restock", tone: "yellow", textClass: "amber-text" },
  empty: { id: "empty", label: "Kosong", tone: "red", textClass: "red-text" },
} as const;

export function stockStatus(product: Pick<Product, "stock" | "safety">) {
  return stockStates[
    product.stock <= 0 ? "empty" : product.stock <= product.safety ? "low" : "safe"
  ];
}

export function groupInventory(products: readonly Product[]) {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const group = groups.get(product.category) ?? [];
    group.push(product);
    groups.set(product.category, group);
  }
  return [...groups].map(([category, items]) => ({
    category,
    products: [...items].sort((a, b) =>
      `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "id"),
    ),
    counts: {
      safe: items.filter((p) => stockStatus(p).id === "safe").length,
      low: items.filter((p) => stockStatus(p).id === "low").length,
      empty: items.filter((p) => stockStatus(p).id === "empty").length,
    },
  }));
}
