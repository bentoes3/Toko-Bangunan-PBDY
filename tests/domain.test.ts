import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totals,
  fleetFor,
  validateCart,
  estimate,
  forecast,
} from "../src/domain";
import { initialProducts } from "../src/data";
test("multi-unit totals convert stock, cost, weight and volume consistently", () => {
  const t = totals(
    [{ productId: "semen", unit: "palet (40 sak)", quantity: 2 }],
    initialProducts,
  );
  assert.equal(t.subtotal, 5200000);
  assert.equal(t.weight, 4000);
  assert.ok(Math.abs(t.volume - 2.8) < 0.00001);
  assert.equal(fleetFor(t.weight, t.volume).name, "Truk Engkel");
});
test("stock validation aggregates different units of the same product", () => {
  assert.match(
    validateCart(
      [
        { productId: "semen", unit: "palet (40 sak)", quantity: 6 },
        { productId: "semen", unit: "sak", quantity: 9 },
      ],
      initialProducts,
    ),
    /tidak mencukupi/,
  );
  assert.equal(
    validateCart(
      [{ productId: "semen", unit: "sak", quantity: 248 }],
      initialProducts,
    ),
    "",
  );
  assert.match(
    validateCart(
      [{ productId: "semen", unit: "sak", quantity: 0 }],
      initialProducts,
    ),
    /tidak valid/,
  );
});
test("fleet uses both weight and volume and splits overloaded orders", () => {
  assert.equal(fleetFor(1000, 4).name, "Pikap");
  assert.equal(fleetFor(1001, 4).name, "Truk Engkel");
  assert.equal(fleetFor(500, 13).name, "Truk Fuso");
  assert.equal(fleetFor(25000, 6).trips, 3);
  assert.equal(fleetFor(25000, 6).fee, 1950000);
});
test("renovation estimates use measured area, coverage and waste allowance", () => {
  const p = estimate("Cat dinding", 4, 3, 3);
  assert.equal(p.area, 42);
  assert.equal(p.quantity, 2);
  assert.equal(estimate("Ganti keramik", 4, 3, 3).quantity, 10);
  assert.throws(() => estimate("Cat dinding", 0, 3, 3));
});
test("forecast returns recommendation and refuses insufficient history", () => {
  assert.equal(forecast(initialProducts.find((p) => p.id === "palu")!), null);
  const f = forecast(initialProducts[0])!;
  assert.equal(f.demand, 471);
  assert.equal(f.reorder, 303);
});
