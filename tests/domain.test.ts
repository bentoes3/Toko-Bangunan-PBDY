import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totals,
  fleetFor,
  fleetOptions,
  deliveryArea,
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

test("small loads use a storage motor and respect both capacity limits", () => {
  assert.equal(fleetFor(7, .02).name, "Motor Boks");
  assert.equal(fleetFor(25, .12).name, "Motor Boks");
  assert.equal(fleetFor(26, .1).name, "Pikap");
  assert.equal(fleetFor(7, .13).name, "Pikap");
  assert.equal(fleetOptions(50, .04)[0].available, false);
  assert.equal(fleetOptions(7, .02).length, 4);
});
test("address changes motor and pickup fees while truck rates stay fixed", () => {
  assert.equal(deliveryArea("Jl. Mawar, Kota BOGOR"), "Bogor");
  assert.equal(deliveryArea("Jl. Mawar, Depok"), "Luar Bogor");
  for (const [address, motor, pickup] of [["Kabupaten Bogor", 20000, 50000], ["Jakarta", 50000, 70000]] as const) {
    const options = fleetOptions(7, .02, address);
    assert.equal(options[0].fee, motor);
    assert.equal(options[1].fee, pickup);
    assert.equal(options[2].fee, 250000);
    assert.equal(options[3].fee, 650000);
  }
});
