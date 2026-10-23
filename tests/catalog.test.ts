import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { initialProducts, initialSuppliers } from "../src/data";
import { appendMissingCatalogProducts, appendDiyCatalogProducts, expandedDemoProducts } from "../src/catalog";
import { diyDemoProducts } from "../src/diy-catalog";
import { validateCart } from "../src/domain";

test("catalog expansion preserves edits and empty stock without restoring deleted original IDs", () => {
  const original = { ...initialProducts[0], name: "Nama ubahan admin", stock: 0, cost: 41000 };
  const expansion = { ...expandedDemoProducts[0], stock: 3, active: false };
  const saved = [original, expansion];
  const merged = appendMissingCatalogProducts(saved);

  assert.equal(saved.length, 2);
  assert.strictEqual(merged[0], original);
  assert.strictEqual(merged[1], expansion);
  assert.equal(merged[0].stock, 0);
  assert.equal(merged[0].name, "Nama ubahan admin");
  assert.equal(merged[1].active, false);
  assert.equal(merged.filter((product) => product.id === expansion.id).length, 1);
  assert.equal(merged.some((product) => product.id === "besi"), false);
  assert.equal(merged.length, expandedDemoProducts.length + 1);
});

test("expansion is idempotent and does not share mutable unit objects with seed data", () => {
  const merged = appendMissingCatalogProducts([]);
  assert.strictEqual(appendMissingCatalogProducts(merged), merged);
  assert.notStrictEqual(merged[0], expandedDemoProducts[0]);
  assert.notStrictEqual(merged[0].units, expandedDemoProducts[0].units);
  assert.notStrictEqual(merged[0].units[0], expandedDemoProducts[0].units[0]);
  merged[0].units[0].factor = 25;
  assert.equal(expandedDemoProducts[0].units[0].factor, 1);
});

test("expanded demo catalog has valid stock, units, delivery measures, assets, and supplier coverage", () => {
  const expectedCount = 12 + expandedDemoProducts.length + diyDemoProducts.length;
  assert.equal(initialProducts.length, expectedCount);
  assert.equal(new Set(initialProducts.map((product) => product.id)).size, expectedCount);
  assert.equal(new Set(initialProducts.map((product) => product.sku)).size, expectedCount);
  const supplierCategories = new Set(initialSuppliers.flatMap((supplier) =>
    supplier.categories.split(",").map((category) => category.trim())));
  for (const product of initialProducts) {
    assert.ok(product.price > product.cost && product.cost > 0, product.id);
    assert.ok(Number.isInteger(product.stock) && product.stock >= 0, product.id);
    assert.ok(product.weight > 0 && product.volume > 0, product.id);
    assert.ok(product.units.some((unit) => unit.name === product.unit && unit.factor === 1), product.id);
    assert.ok(product.units.every((unit) => unit.factor > 0), product.id);
    assert.ok(supplierCategories.has(product.category), product.category);
    assert.ok(existsSync(new URL(`../public${product.image}`, import.meta.url)), product.image);
  }
  assert.ok(initialProducts.some((product) => product.stock === 0));
  assert.ok(initialProducts.some((product) => product.stock > 0 && product.stock <= product.safety));
  assert.ok(initialProducts.some((product) => product.stock > product.safety));
});

test("new empty stock cannot be ordered and bulk units still aggregate correctly", () => {
  const empty = expandedDemoProducts.find((product) => product.stock === 0)!;
  assert.match(validateCart([{ productId: empty.id, unit: empty.unit, quantity: 1 }], initialProducts), /tidak mencukupi/);
  assert.equal(validateCart([
    { productId: "bata-merah", unit: "pak (100 pcs)", quantity: 100 },
  ], initialProducts), "");
  assert.match(validateCart([
    { productId: "bata-merah", unit: "pak (100 pcs)", quantity: 100 },
    { productId: "bata-merah", unit: "pcs", quantity: 1 },
  ], initialProducts), /tidak mencukupi/);
});

test("original demo stocks remain unchanged", () => {
  assert.deepEqual(initialProducts.slice(0, 12).map(({ id, stock }) => ({ id, stock })), [
    { id: "semen", stock: 248 }, { id: "besi", stock: 36 },
    { id: "cat", stock: 84 }, { id: "pipa", stock: 160 },
    { id: "pasir", stock: 12 }, { id: "keramik", stock: 45 },
    { id: "cat-avian", stock: 65 }, { id: "semen-tiga", stock: 92 },
    { id: "fitting", stock: 18 }, { id: "batu", stock: 8 },
    { id: "keramik-roman", stock: 32 }, { id: "palu", stock: 24 },
  ]);
});

test("DIY migration preserves saved edits and does not restore deleted earlier products", () => {
  const editedWood = { ...diyDemoProducts[0], name: "Papan pilihan pemilik", stock: 0, active: false };
  const custom = { ...initialProducts[0], id: "custom-owned", sku: "CUSTOM-OWNED", stock: 9 };
  const saved = [editedWood, custom];
  const merged = appendDiyCatalogProducts(saved);
  assert.strictEqual(merged[0], editedWood);
  assert.strictEqual(merged[1], custom);
  assert.equal(merged[0].stock, 0);
  assert.equal(merged[0].active, false);
  assert.equal(merged.length, diyDemoProducts.length + 1);
  assert.equal(merged.some((p) => p.id === "semen" || p.id === "mortar-bata"), false);
  assert.strictEqual(appendDiyCatalogProducts(merged), merged);
  const added = merged.find((p) => p.id === diyDemoProducts[1].id)!;
  assert.notStrictEqual(added.units[0], diyDemoProducts[1].units[0]);
});

test("pre-v2 catalogs receive both expansions without duplicate IDs or order-dependent changes", () => {
  const oldProducts = initialProducts.slice(0, 12);
  const migrated = appendDiyCatalogProducts(appendMissingCatalogProducts(oldProducts));
  assert.equal(migrated.length, initialProducts.length);
  assert.equal(new Set(migrated.map((p) => p.id)).size, migrated.length);
  assert.deepEqual(migrated.map((p) => p.id), initialProducts.map((p) => p.id));
  assert.strictEqual(appendDiyCatalogProducts(appendMissingCatalogProducts(migrated)), migrated);
});
