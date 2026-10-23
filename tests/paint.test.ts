import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePaint, availablePaintUnits, type PaintInput } from "../src/paint";
import { initialProducts } from "../src/data";

const room: PaintInput = { length: 4, width: 3, height: 3, coats: 2, coverage: 10, openingArea: 0, wastePercent: 10 };

test("wall estimate excludes floor/ceiling, deducts openings, applies coats and reserve before rounding cans", () => {
  const result = calculatePaint({ ...room, openingArea: 6 });
  assert.equal(result.grossArea, 42);
  assert.equal(result.netArea, 36);
  assert.ok(Math.abs(result.litres - 7.92) < 1e-10);
  assert.equal(result.cans, 2);
  assert.equal(result.purchasedLitres, 10);
});

test("exact full-can boundary and a genuine excess select the correct number of cans", () => {
  const exact = { ...room, length: 2.5, width: 2.5, height: 2.5, wastePercent: 0 };
  assert.equal(calculatePaint(exact).litres, 5);
  assert.equal(calculatePaint(exact).cans, 1);
  assert.equal(calculatePaint({ ...exact, height: 2.500001 }).cans, 2);
  assert.equal(calculatePaint({ ...room, length: 0.01, width: 0.01, height: 0.01 }).cans, 1);
});

test("coverage and coat settings change litres while zero reserve is supported", () => {
  const basic = calculatePaint({ ...room, coats: 1, wastePercent: 0 });
  assert.equal(basic.litres, 4.2);
  assert.equal(calculatePaint({ ...room, coats: 2, wastePercent: 0 }).litres, basic.litres * 2);
  assert.equal(calculatePaint({ ...room, coats: 1, coverage: 20, wastePercent: 0 }).litres, basic.litres / 2);
});

test("invalid dimensions, complete deductions, invalid layer counts and non-finite inputs are rejected", () => {
  const invalid: Partial<PaintInput>[] = [
    { length: 0 }, { width: -2 }, { height: Number.NaN }, { length: Infinity },
    { openingArea: -1 }, { openingArea: 42 }, { openingArea: 100 },
    { coverage: 0 }, { coverage: Infinity }, { coats: 0 }, { coats: 1.5 },
    { wastePercent: -1 }, { wastePercent: 101 }, { wastePercent: Number.NaN },
    { length: Number.MAX_VALUE }, { coverage: Number.MIN_VALUE },
  ];
  invalid.forEach((patch) => assert.throws(() => calculatePaint({ ...room, ...patch }), Error));
});

test("paint availability reserves mixed cart units and never reports negative stock", () => {
  const paint = { ...initialProducts.find((p) => p.id === "cat")!, stock: 10 };
  const cart = [
    { productId: paint.id, unit: "dus (4 kaleng)", quantity: 2 },
    { productId: paint.id, unit: "kaleng", quantity: 1 },
    { productId: "semen", unit: "sak", quantity: 30 },
  ];
  assert.equal(availablePaintUnits(paint, cart), 1);
  assert.equal(availablePaintUnits({ ...paint, stock: 8 }, cart), 0);
  assert.equal(availablePaintUnits(paint, []), 10);
});
