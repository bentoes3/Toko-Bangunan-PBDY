import { test, expect, type Page } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { initialProducts, initialOrders } from "../../src/data";
import { expandedDemoProducts } from "../../src/catalog";
const login = async (page: Page) => {
  await page.goto("/#/admin");
  await page.getByRole("button", { name: "Gunakan akun demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Selamat bekerja, Seta" }),
  ).toBeVisible();
};
test("catalog → cart → mock transfer → order → genuine PDF, with inventory allocation", async ({
  page,
}) => {
  await page.goto("/#/katalog");
  await page
    .getByRole("button", { name: "Tambah Semen Gresik Portland", exact: true })
    .click();
  await page.goto("/#/keranjang");
  await expect(
    page.getByRole("heading", { name: "Semen Gresik Portland" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tambah jumlah" }).click();
  await page.getByRole("link", { name: "Lanjut ke Checkout" }).click();
  await page
    .getByRole("textbox", { name: "Alamat lengkap proyek" })
    .fill("Jl. Raya Cibinong No. 18, Kabupaten Bogor");
  await page.getByRole("button", { name: "Buat Pesanan" }).click();
  await expect(page.getByRole("alert")).toContainText("Simulasikan pembayaran");
  await page.getByRole("button", { name: "Simulasikan Bayar" }).click();
  await page.getByRole("button", { name: "Buat Pesanan" }).click();
  await expect(
    page.getByRole("heading", { name: "Pesanan Saya" }),
  ).toBeVisible();
  await expect(page.locator(".order-detail")).toContainText("2 sak");
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh Faktur" }).click();
  const download = await event;
  const path = await download.path();
  expect((await readFile(path!)).subarray(0, 5).toString()).toBe("%PDF-");
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pbdy-v1-products")!),
  );
  expect(state.find((p: any) => p.id === "semen").stock).toBe(246);
  await page.reload();
  await expect(page.locator(".order-list .order-tab")).toHaveCount(5);
});
test("admin validates login, generates PO, receives stock once, records payment", async ({
  page,
}) => {
  await page.goto("/#/admin");
  await page
    .getByRole("textbox", { name: "Username", exact: true })
    .fill("wrong");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Masuk ke Dashboard" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Gunakan akun demo" }).click();
  await page.goto("/#/admin/stok");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Besi Beton Ulir 10 mm" });
  await row.getByRole("button", { name: "Restock", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Jumlah pembelian" }).fill("10");
  await page.getByRole("button", { name: "Generate Purchase Order" }).click();
  await expect(
    page.getByRole("heading", { name: "PO berhasil dibuat" }),
  ).toBeVisible();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh Purchase Order" }).click();
  expect((await dl).suggestedFilename()).toContain("Purchase-Order");
  await page.getByRole("button", { name: "Selesai", exact: true }).click();
  await page.goto("/#/admin/supplier");
  await page.getByRole("button", { name: "Purchase Order & Hutang" }).click();
  await page.getByRole("button", { name: "Terima barang" }).click();
  await expect(page.getByRole("button", { name: "Terima barang" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Bayar", exact: true }).click();
  await expect(page.getByText("Lunas", { exact: true })).toBeVisible();
  const stock = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("pbdy-v1-products")!).find(
        (p: any) => p.id === "besi",
      ).stock,
  );
  expect(stock).toBe(46);
});
test("customer tracking updates live when admin changes the same order in another tab", async ({
  page,
  context,
}) => {
  await page.goto("/#/pesanan");
  await expect(page.locator(".order-detail")).toContainText("Dalam perjalanan");
  const admin = await context.newPage();
  await login(admin);
  await admin.goto("/#/admin/pesanan");
  await admin
    .getByRole("row")
    .filter({ hasText: "PB-2026-0108" })
    .getByRole("button", { name: "Kelola" })
    .click();
  await admin.getByLabel("Status pesanan").selectOption("3");
  await admin.getByRole("button", { name: "Simpan Perubahan" }).click();
  await expect(page.locator(".delivery-box")).toContainText(
    "Material telah diterima.",
  );
});
test("visual search uses uploaded image, crop selection, mock category, and cart", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Coba Cari via Foto" }).click();
  await page
    .getByLabel("Pilih foto material")
    .setInputFiles("public/images/fitting.svg");
  await expect(page.locator(".crop-box")).toBeVisible();
  await page.locator(".crop-controls input").first().fill("10");
  await page.getByRole("button", { name: "Cari dari Area Terpilih" }).click();
  await expect(
    page.getByRole("heading", { name: "Hasil pencocokan: Pipa & Fitting" }),
  ).toBeVisible();
  await expect(page.getByAltText("Hasil potongan area terpilih")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Tambah Elbow PVC Rucika ½ inci",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("ditambahkan");
});
test("renovation assistant requests dimensions, calculates, and recommends brands", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buka asisten renovasi" }).click();
  await page
    .getByRole("textbox", { name: "Pesan untuk asisten" })
    .fill("Saya ingin cat ulang kamar");
  await page.getByRole("button", { name: "Kirim pesan" }).click();
  await expect(page.locator(".chat-messages")).toContainText(
    "Berapa panjang, lebar, dan tinggi",
  );
  await page.getByRole("spinbutton", { name: "Panjang (m)" }).fill("4");
  await page.getByRole("spinbutton", { name: "Lebar (m)" }).fill("3");
  await page.getByRole("spinbutton", { name: "Tinggi (m)" }).fill("3");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hitung Kebutuhan", exact: true })
    .click();
  await expect(page.locator(".estimate-result h2")).toContainText("2");
  await page.getByLabel("Pilih merek").selectOption("cat-avian");
  await page.getByRole("button", { name: "Tambah 2 kaleng" }).click();
  const cart = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pbdy-v1-cart")!),
  );
  expect(cart[0]).toMatchObject({ productId: "cat-avian", quantity: 2 });
});
test("invoice extraction is reviewable, confirms stock and prevents duplicate confirmation", async ({
  page,
}) => {
  await login(page);
  await page.goto("/#/admin/invoice");
  await page
    .getByLabel("Unggah nota supplier")
    .setInputFiles("public/images/semen.svg");
  await page.getByRole("button", { name: "Simulasikan Ekstraksi" }).click();
  await expect(page.getByRole("textbox", { name: "Nomor nota" })).toBeVisible();
  await page
    .getByRole("spinbutton", { name: "Jumlah", exact: true })
    .first()
    .fill("5");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Konfirmasi Masuk Gudang" }).click();
  await expect(
    page.getByRole("heading", { name: "Barang masuk tercatat" }),
  ).toBeVisible();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pbdy-v1-products")!),
  );
  expect(state.find((p: any) => p.id === "semen").stock).toBe(253);
  await expect(
    page.getByRole("button", { name: "Konfirmasi Masuk Gudang" }),
  ).toHaveCount(0);
});
test("mobile routes fit viewport, all assets load, dark mode persists and navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/katalog",
    "/keranjang",
    "/checkout",
    "/pesanan",
    "/admin",
  ]) {
    await page.goto("/#" + route);
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Aktifkan mode gelap" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Portal Admin" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Portal Admin" })
    .click();
  await page.getByRole("button", { name: "Gunakan akun demo" }).click();
  for (const route of [
    "dashboard",
    "produk",
    "stok",
    "pesanan",
    "supplier",
    "forecast",
    "invoice",
  ]) {
    await page.goto("/#/admin/" + route);
    await page.locator(".admin-title h1").waitFor();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("product management rejects duplicate SKU then publishes a new multi-unit product", async ({
  page,
}) => {
  await login(page);
  await page.goto("/#/admin/produk");
  await page
    .getByRole("button", { name: "Tambah Produk", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama produk", { exact: true }).fill("Baut Baja M8");
  await dialog.getByLabel("SKU unik").fill("SMN-GRS-50");
  await dialog.getByLabel("Merek", { exact: true }).fill("Tekiro");
  await dialog
    .getByRole("combobox", { name: "Kategori", exact: true })
    .selectOption("Peralatan");
  await dialog
    .getByLabel("Deskripsi", { exact: true })
    .fill("Baut baja galvanis M8 untuk renovasi.");
  await dialog.getByRole("button", { name: "Simpan Produk" }).click();
  await expect(dialog.getByRole("alert")).toContainText("SKU sudah digunakan");
  await dialog.getByLabel("SKU unik").fill("BLT-M8-01");
  await dialog.getByLabel("Harga jual", { exact: true }).fill("5000");
  await dialog.getByLabel("Harga beli", { exact: true }).fill("3000");
  await dialog.getByRole("button", { name: "Simpan Produk" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Baut Baja M8" }),
  ).toBeVisible();
  await page.goto("/#/katalog?q=Baut");
  await expect(
    page.getByRole("button", { name: "Baut Baja M8", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Baut Baja M8", exact: true }).click();
  await expect(page.getByLabel("Pilih satuan")).toContainText("pak (10 pcs)");
  await expect(
    page.getByRole("button", { name: "Tambah ke Keranjang" }),
  ).toBeDisabled();
});

test("inventory groups material variants, separates three stock states and shows units once", async ({ page }) => {
  await login(page);
  await page.goto("/#/admin/stok");
  const table = page.locator(".inventory-table");
  await expect(table.getByRole("columnheader")).toHaveText([
    "Produk / SKU", "Satuan", "Harga dasar", "Stok", "Batas aman", "Status", "Tindakan",
  ]);
  const statusCounts = {
    safe: initialProducts.filter((p) => p.stock > p.safety).length,
    low: initialProducts.filter((p) => p.stock > 0 && p.stock <= p.safety).length,
    empty: initialProducts.filter((p) => p.stock <= 0).length,
  };
  await expect(page.locator(".stock-stat.safe strong")).toHaveText(String(statusCounts.safe));
  await expect(page.locator(".stock-stat.low strong")).toHaveText(String(statusCounts.low));
  await expect(page.locator(".stock-stat.is-empty strong")).toHaveText(String(statusCounts.empty));
  expect(statusCounts.empty).toBeGreaterThan(0);
  for (const [status, color, label] of [
    ["safe", "green", "Aman"], ["low", "yellow", "Perlu restock"], ["empty", "red", "Kosong"],
  ] as const) {
    await page.getByLabel("Filter inventaris", { exact: true }).selectOption(status);
    await expect(table.locator("tbody tr:not(.inventory-group-heading)")).toHaveCount(statusCounts[status]);
    await expect(table.locator(`td .tag.${color}`)).toHaveCount(statusCounts[status]);
    await expect(table.locator("td .tag").first()).toHaveText(label);
  }
  await page.getByLabel("Filter inventaris", { exact: true }).selectOption("all");
  await page.getByLabel("Filter jenis material").selectOption("Semen");
  await expect(table.locator(".inventory-group-heading")).toHaveCount(1);
  await expect(table.locator(".inventory-group-heading strong")).toHaveText("Semen");
  await expect(table.getByRole("row").filter({ hasText: "Semen Tiga Roda 50 kg" })).toBeVisible();
  const row = table.getByRole("row").filter({ hasText: "Semen Gresik Portland" });
  await expect(row.locator("td").nth(1)).toHaveText("sak");
  await expect(row.locator("td").nth(2)).toHaveText(/65\.000/);
  await expect(row.locator("td").nth(3)).toHaveText("248");
  await expect(row.locator("td").nth(4)).toHaveText("80");
  await page.getByLabel("Cari inventaris").fill("SMN-GRS-50");
  await expect(table.locator("tbody tr:not(.inventory-group-heading)")).toHaveCount(1);
  await page.getByLabel("Cari inventaris").fill("produk tidak ditemukan");
  await expect(page.getByRole("heading", { name: "Tidak ada produk", exact: true })).toBeVisible();
});

test("empty material cannot be purchased and received restock changes empty to safe once", async ({ page }) => {
  const product = initialProducts.find((p) => p.id === "mortar-acian")!;
  expect(product.stock).toBe(0);
  const quantity = product.safety + 1;
  await page.goto("/#/katalog?q=MU-200");
  await expect(page.getByRole("button", { name: "Tambah " + product.name, exact: true })).toBeDisabled();
  await page.getByRole("button", { name: product.name, exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Stok habis");
  await expect(page.getByRole("button", { name: "Tambah ke Keranjang", exact: true })).toBeDisabled();
  await page.getByRole("dialog").getByRole("button", { name: "Tutup", exact: true }).click();
  await login(page);
  await page.goto("/#/admin/stok");
  await page.getByLabel("Filter inventaris", { exact: true }).selectOption("empty");
  let row = page.locator(".inventory-table").getByRole("row").filter({ hasText: product.name });
  await expect(row.locator(".tag.red")).toHaveText("Kosong");
  await row.getByRole("button", { name: "Restock", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Jumlah pembelian" }).fill(String(quantity));
  await page.getByRole("button", { name: "Generate Purchase Order" }).click();
  await page.getByRole("button", { name: "Selesai", exact: true }).click();
  await expect(row.locator(".tag.red")).toHaveText("Kosong");
  await page.goto("/#/admin/supplier");
  await page.getByRole("button", { name: "Purchase Order & Hutang" }).click();
  await page.getByRole("button", { name: "Terima barang" }).click();
  await expect(page.getByRole("button", { name: "Terima barang" })).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Purchase Order & Hutang" }).click();
  await expect(page.getByRole("button", { name: "Terima barang" })).toHaveCount(0);
  await page.goto("/#/admin/stok");
  await page.getByLabel("Cari inventaris").fill(product.sku);
  row = page.locator(".inventory-table").getByRole("row").filter({ hasText: product.name });
  await expect(row.locator(".tag.green")).toHaveText("Aman");
  await expect(row.locator("td").nth(3)).toHaveText(String(quantity));
  await page.goto("/#/katalog?q=MU-200");
  await expect(page.getByRole("button", { name: "Tambah " + product.name, exact: true })).toBeEnabled();
  const savedStock = await page.evaluate((id) => JSON.parse(localStorage.getItem("pbdy-v1-products")!).find((p: { id: string }) => p.id === id).stock, product.id);
  expect(savedStock).toBe(quantity);
});

test("catalog migration preserves saved edits, zero stock, inactive products and orders", async ({ page }) => {
  const expansionIds = new Set(expandedDemoProducts.map((p) => p.id));
  const original = initialProducts.filter((p) => !expansionIds.has(p.id) && p.id !== "semen-tiga");
  const edited = { ...original[0], name: "Semen Gresik Pilihan Toko", price: 71000, stock: 0, safety: 8, active: false };
  const custom = { ...original[0], id: "custom-retained", sku: "CUSTOM-001", name: "Material Tambahan Pemilik", stock: 7 };
  const savedProducts = [edited, ...original.slice(1), custom];
  const savedOrders = [{ ...initialOrders[0], id: "PB-SAVED-001", name: "Pelanggan Tersimpan", status: 1 }, ...initialOrders];
  await page.addInitScript(({ products, orders }) => {
    if (localStorage.getItem("migration-fixture-seeded")) return;
    localStorage.setItem("pbdy-v1-products", JSON.stringify(products));
    localStorage.setItem("pbdy-v1-orders", JSON.stringify(orders));
    localStorage.removeItem("pbdy-catalog-v2");
    localStorage.setItem("migration-fixture-seeded", "1");
  }, { products: savedProducts, orders: savedOrders });
  await page.goto("/#/katalog");
  const readSaved = () => page.evaluate(() => ({
    products: JSON.parse(localStorage.getItem("pbdy-v1-products")!),
    orders: JSON.parse(localStorage.getItem("pbdy-v1-orders")!),
    migrated: localStorage.getItem("pbdy-catalog-v2"),
  }));
  const first = await readSaved();
  expect(first.migrated).toBe("1");
  expect(first.products).toHaveLength(savedProducts.length + expandedDemoProducts.length);
  expect(first.products.slice(0, savedProducts.length)).toEqual(savedProducts);
  expect(first.products.some((p: { id: string }) => p.id === "semen-tiga")).toBe(false);
  expect(first.orders).toEqual(savedOrders);
  await page.reload();
  expect(await readSaved()).toEqual(first);
  await page.goto("/#/pesanan");
  await expect(page.locator(".order-list")).toContainText("PB-SAVED-001");
});

for (const width of [320, 390]) {
  for (const dark of [false, true]) {
    test(`mobile ${width}px ${dark ? "dark" : "light"} content stays readable with contained tables`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript((enabled) => localStorage.setItem("pbdy-v1-dark", JSON.stringify(enabled)), dark);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const checkLayout = async (route: string) => {
        await page.goto("/#" + route);
        await page.locator("h1").first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const layout = await page.evaluate(() => {
          const smallText = [...document.querySelectorAll<HTMLElement>("p,small,label,button,input,select,td,th,.product-title,.stock")]
            .filter((element) => element.getClientRects().length &&
              [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()))
            .map((element) => ({ text: element.textContent?.trim().slice(0, 70), size: parseFloat(getComputedStyle(element).fontSize) }))
            .filter((element) => element.size < 14);
          const tables = [...document.querySelectorAll<HTMLElement>(".table-scroll")].map((element) => ({
            width: element.getBoundingClientRect().width,
            overflow: getComputedStyle(element).overflowX,
          }));
          return { width: document.documentElement.scrollWidth, viewport: innerWidth, smallText, tables };
        });
        expect(layout.width, route + " body overflow").toBeLessThanOrEqual(layout.viewport);
        expect(layout.smallText, route + " text smaller than 14px").toEqual([]);
        for (const table of layout.tables) {
          expect(table.width, route + " table container width").toBeLessThanOrEqual(width);
          expect(["auto", "scroll"], route + " table scroll containment").toContain(table.overflow);
        }
        await expect(page.locator("html")).toHaveClass(dark ? "dark" : "");
        if (width === 390 && ["/", "/katalog", "/admin/stok"].includes(route)) {
          const output = resolve("../../outputs");
          await mkdir(output, { recursive: true });
          await page.screenshot({ path: resolve(output, `mobile-${route === "/" ? "home" : route.split("/").at(-1)}-${dark ? "dark" : "light"}.png`) });
        }
      };
      await checkLayout("/");
      await checkLayout("/katalog");
      await login(page);
      for (const route of ["/admin/dashboard", "/admin/stok", "/admin/produk", "/admin/forecast"]) await checkLayout(route);
      expect(errors).toEqual([]);
    });
  }
}

test("desktop home and inventory review images show both themes", async ({ page }) => {
  const output = resolve("../../outputs");
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const dark of [false, true]) {
    if (dark) await page.getByRole("button", { name: "Aktifkan mode gelap" }).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".logo img").first()).toBeVisible();
    await page.screenshot({ path: resolve(output, `desktop-home-${dark ? "dark" : "light"}.png`) });
  }
  await login(page);
  await page.goto("/#/admin/stok");
  for (const dark of [true, false]) {
    if (!dark) await page.getByRole("button", { name: "Aktifkan mode terang" }).click();
    await expect(page.locator(".inventory-group-heading").first()).toBeVisible();
    await page.screenshot({ path: resolve(output, `desktop-inventory-${dark ? "dark" : "light"}.png`) });
  }
});
