import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
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
