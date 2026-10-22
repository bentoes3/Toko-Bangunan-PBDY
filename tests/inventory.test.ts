import { test } from "node:test";
import assert from "node:assert/strict";
import type { Product } from "../src/domain";
import { initialProducts } from "../src/data";
import { groupInventory, stockStatus, type StockState } from "../src/inventory";

function product(id: string, overrides: Partial<Product> = {}): Product {
  return { ...initialProducts[0], id, ...overrides };
}

test("stock statuses separate empty from restock at zero and the safety boundary", () => {
  const cases: [number, number, StockState, string, string][] = [
    [-1, 10, "empty", "Kosong", "red"],
    [0, 10, "empty", "Kosong", "red"],
    [1, 10, "low", "Perlu restock", "yellow"],
    [10, 10, "low", "Perlu restock", "yellow"],
    [11, 10, "safe", "Aman", "green"],
    [0, 0, "empty", "Kosong", "red"],
    [1, 0, "safe", "Aman", "green"],
  ];
  for (const [stock, safety, id, label, tone] of cases) {
    const status = stockStatus({ stock, safety });
    assert.equal(status.id, id, `stock ${stock}, safety ${safety}`);
    assert.equal(status.label, label);
    assert.equal(status.tone, tone);
  }
});

test("inventory groups material variants and partitions counts without changing input", () => {
  const source = Object.freeze([
    Object.freeze(product("semen-b", { category: "Semen", brand: "B", stock: 0, safety: 10 })),
    Object.freeze(product("cat", { category: "Cat", brand: "C", stock: 20, safety: 10 })),
    Object.freeze(product("semen-a", { category: "Semen", brand: "A", stock: 10, safety: 10 })),
    Object.freeze(product("semen-c", { category: "Semen", brand: "C", stock: 11, safety: 10 })),
  ]);
  const groups = groupInventory(source);
  assert.deepEqual(groups.map((g) => g.category), ["Semen", "Cat"]);
  assert.deepEqual(groups[0].products.map((p) => p.id), ["semen-a", "semen-b", "semen-c"]);
  assert.deepEqual(groups[0].counts, { safe: 1, low: 1, empty: 1 });
  assert.deepEqual(groups[1].counts, { safe: 1, low: 0, empty: 0 });
  assert.deepEqual(source.map((p) => p.id), ["semen-b", "cat", "semen-a", "semen-c"]);
  assert.deepEqual(groupInventory([]), []);
});

test("status-filtered groups keep restock and empty totals separate", () => {
  const source = [
    product("empty", { stock: 0, safety: 5 }),
    product("low", { stock: 5, safety: 5 }),
    product("safe", { stock: 6, safety: 5 }),
    product("inactive-empty", { stock: 0, safety: 5, active: false }),
  ];
  for (const state of ["safe", "low", "empty"] as const) {
    const filtered = source.filter((p) => stockStatus(p).id === state);
    const groups = groupInventory(filtered);
    assert.equal(groups.reduce((sum, group) => sum + group.counts[state], 0), filtered.length);
    assert.equal(groups.flatMap((group) => group.products).length, filtered.length);
  }
  assert.deepEqual(source.filter((p) => stockStatus(p).id === "low").map((p) => p.id), ["low"]);
  assert.deepEqual(source.filter((p) => stockStatus(p).id === "empty").map((p) => p.id), ["empty", "inactive-empty"]);
});
