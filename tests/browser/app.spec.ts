import { test, expect, type Page } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { initialProducts, initialOrders } from "../../src/data";
import { expandedDemoProducts } from "../../src/catalog";
import { diyDemoProducts } from "../../src/diy-catalog";
import type { AIStreamEvent, Identification } from "../../src/ai-types";

// These raster fixtures and mocked responses test UI contracts, not recognition accuracy.
const pngFixture = () => ({
  name: "fixture.png", mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGP4f0Lj/wkNBggFADmOB73MmqQgAAAAAElFTkSuQmCC", "base64"),
});
const streamFixture = (events: AIStreamEvent[]) => events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
const readyAI = async (page: Page) => page.route("**/api/ai/status", (route) => route.fulfill({ json: { ready: true } }));
const savedCart = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("pbdy-v1-cart") || "[]"));
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
test("visual search submits a cropped raster to the API and renders identified catalog options", async ({ page }) => {
  await readyAI(page);
  let requestBody: { image: string; catalog: { id: string }[] } | undefined;
  await page.route("**/api/ai/identify", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ json: {
      status: "identified", name: "Elbow PVC 90 derajat", confidence: "medium",
      description: "Sambungan bersudut untuk jalur pipa. Ukuran perlu diperiksa langsung.",
      observations: ["Bentuk siku dengan dua ujung terbuka."], questions: ["Berapa diameter sambungannya?"], productIds: ["fitting"],
    } satisfies Identification });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Coba Cari via Foto" }).click();
  const dialog = page.getByRole("dialog", { name: "Cari material lewat foto" });
  await page.getByLabel("Pilih foto material").setInputFiles(pngFixture());
  await expect(page.locator(".crop-box")).toBeVisible();
  expect(requestBody).toBeUndefined();
  await page.locator(".crop-controls").getByLabel("Lebar", { exact: true }).fill("60");
  await page.locator(".crop-controls").getByLabel("Posisi X", { exact: true }).fill("10");
  await dialog.getByRole("button", { name: "Kenali objek", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Elbow PVC 90 derajat", exact: true })).toBeVisible();
  expect(requestBody?.image).toMatch(/^data:image\/jpeg;base64,/);
  expect(requestBody?.catalog.some((product) => product.id === "fitting")).toBe(true);
  await expect(dialog.getByAltText("Area foto yang dianalisis")).toBeVisible();
  await expect(dialog.getByText("Berapa diameter sambungannya?")).toBeVisible();
  await expect(dialog.locator(".product-card")).toHaveCount(1);
  await expect(dialog.getByRole("combobox")).toHaveCount(0);
  expect(await savedCart(page)).toEqual([]);
  await dialog.getByRole("button", { name: "Tambah Elbow PVC Rucika ½ inci", exact: true }).click();
  expect(await savedCart(page)).toEqual([{ productId: "fitting", unit: "pcs", quantity: 1 }]);
  await page.locator(".crop-controls").getByLabel("Posisi X", { exact: true }).fill("15");
  await expect(dialog.locator(".visual-results")).toHaveCount(0);
});

for (const status of ["not_building", "uncertain"] as const) {
  test("visual search " + status + " shows honest feedback without guessed products or cart actions", async ({ page }) => {
    await readyAI(page);
    await page.route("**/api/ai/identify", (route) => route.fulfill({ json: {
      status, name: status === "not_building" ? "Buah" : "Sambungan pipa",
      confidence: "low", description: status === "not_building" ? "Objek ini tampak sebagai buah, bukan material atau alat bangunan." : "Detail pada foto belum cukup jelas untuk menentukan nama barang.",
      observations: [], questions: status === "uncertain" ? ["Bisa unggah foto yang lebih dekat dan terang?"] : [],
      productIds: ["fitting"],
    } satisfies Identification }));
    await page.goto("/");
    await page.getByRole("button", { name: "Coba Cari via Foto" }).click();
    const dialog = page.getByRole("dialog");
    await page.getByLabel("Pilih foto material").setInputFiles(pngFixture());
    await expect(dialog.getByAltText("Foto objek yang akan dianalisis")).toBeVisible();
    await dialog.getByRole("button", { name: "Kenali objek", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: status === "not_building" ? "Foto ini bukan barang bangunan" : "Saya belum yakin dengan objek ini", exact: true })).toBeVisible();
    await expect(dialog.locator(".visual-results .product-card")).toHaveCount(0);
    await expect(dialog.locator(".visual-results").getByRole("button", { name: /Tambah/ })).toHaveCount(0);
    await expect(dialog.locator(".visual-results")).not.toContainText("Sambungan pipa");
    expect(await savedCart(page)).toEqual([]);
  });
}

test("paint calculator is independent of AI and adds the selected exact 5-liter can quantity", async ({ page }) => {
  const apiCalls: string[] = [];
  await page.route("**/api/ai/**", (route) => { apiCalls.push(route.request().url()); return route.abort(); });
  await page.goto("/");
  await page.getByRole("button", { name: "Buka Kalkulator Cat", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Kalkulator Cat Dinding" });
  await expect(dialog.getByRole("textbox", { name: /Pesan/ })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Hitung Kebutuhan Cat", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("lebih dari nol");
  await dialog.getByLabel("Panjang ruangan (m)", { exact: true }).fill("4");
  await dialog.getByLabel("Lebar ruangan (m)", { exact: true }).fill("3");
  await dialog.getByLabel("Tinggi dinding (m)", { exact: true }).fill("3");
  await dialog.getByLabel("Luas pintu dan jendela (m²)", { exact: true }).fill("6");
  await dialog.getByRole("button", { name: "Hitung Kebutuhan Cat", exact: true }).click();
  await expect(dialog.locator(".paint-result h2")).toContainText("2 kaleng × 5 liter");
  await expect(dialog.locator(".paint-result")).toContainText("7,92 liter");
  await dialog.getByLabel("Pilih cat dinding (kemasan 5 liter)", { exact: true }).selectOption("cat-avian");
  expect(await savedCart(page)).toEqual([]);
  await dialog.getByRole("button", { name: "Tambah 2 kaleng ke Keranjang", exact: true }).click();
  expect(await savedCart(page)).toEqual([{ productId: "cat-avian", unit: "kaleng", quantity: 2 }]);
  expect(apiCalls).toEqual([]);
});

test("consultant consumes SSE, sends photo and history, and adds only selected recommendations", async ({ page }) => {
  await readyAI(page);
  const requests: { messages: { role: string; text: string; image?: string }[]; catalog: { id: string }[] }[] = [];
  await page.route("**/api/ai/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ contentType: "text/event-stream", body: streamFixture(requests.length === 1 ? [
      { type: "delta", text: "Kita mulai dari ukuran lemari. " },
      { type: "delta", text: "Apakah lemari akan dipasang di ruang lembap?" },
      { type: "recommendations", items: [
        { label: "Bahan papan dan rangka", reason: "Pilih bahan sesuai bagian lemari; ukuran dan ketebalan perlu dipastikan.", options: ["multipleks", "kayu-kaso"], quantity: 1, unit: null, unavailable: false },
        { label: "Lem kayu PVA", reason: "Untuk sambungan kayu; pilih lem khusus kayu.", options: [], quantity: null, unit: null, unavailable: true },
      ] },
      { type: "done" },
    ] : [
      { type: "delta", text: "Untuk ukuran tinggi 180 cm di ruang kering, kita lanjutkan dengan gambar potongan dan jumlah rak." },
      { type: "recommendations", items: [] }, { type: "done" },
    ]) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Buka konsultan bangunan AI", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Konsultan AI bangunan" });
  await expect(dialog.getByRole("button", { name: /Hitung Kebutuhan/ })).toHaveCount(0);
  await dialog.getByLabel("Lampirkan foto proyek", { exact: true }).setInputFiles(pngFixture());
  await expect(dialog.getByAltText("Foto yang akan dikirim bersama pesan")).toBeVisible();
  await dialog.getByRole("textbox", { name: "Pesan untuk konsultan AI", exact: true }).fill("Bantu saya membuat lemari seperti foto ini.");
  await dialog.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("Kita mulai dari ukuran lemari. Apakah lemari akan dipasang di ruang lembap?");
  expect(requests[0].messages.at(-1)).toMatchObject({ role: "user", text: "Bantu saya membuat lemari seperti foto ini." });
  expect(requests[0].messages.at(-1)?.image).toMatch(/^data:image\/jpeg;base64,/);
  expect(requests[0].catalog.some((product) => product.id === "multipleks")).toBe(true);
  const material = dialog.locator(".ai-recommendation").filter({ hasText: "Bahan papan dan rangka" });
  const unavailable = dialog.locator(".ai-recommendation").filter({ hasText: "Lem kayu PVA" });
  await expect(unavailable).toContainText("Tidak tersedia di toko");
  await expect(unavailable).toContainText("toko lain");
  await expect(unavailable.getByRole("button")).toHaveCount(0);
  expect(await savedCart(page)).toEqual([]);
  await material.getByLabel("Pilih produk", { exact: true }).selectOption("kayu-kaso");
  await material.getByLabel("Jumlah", { exact: true }).fill("2");
  await expect(material.getByLabel("Satuan", { exact: true })).toHaveValue("batang");
  await material.getByRole("button", { name: /^Tambah ke keranjang/ }).click();
  expect(await savedCart(page)).toEqual([{ productId: "kayu-kaso", unit: "batang", quantity: 2 }]);
  await dialog.getByRole("textbox", { name: "Pesan untuk konsultan AI", exact: true }).fill("Tingginya 180 cm dan ruangan kering.");
  await dialog.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("gambar potongan dan jumlah rak");
  expect(requests[1].messages.map((message) => message.text)).toEqual(expect.arrayContaining([
    "Bantu saya membuat lemari seperti foto ini.",
    "Kita mulai dari ukuran lemari. Apakah lemari akan dipasang di ruang lembap?",
    "Tingginya 180 cm dan ruangan kering.",
  ]));
  const savedHistory = await page.evaluate(() => sessionStorage.getItem("pbdy-ai-conversation-v1"));
  expect(savedHistory).toContain("Tingginya 180 cm");
  expect(savedHistory).not.toContain("data:image/");
  await dialog.getByRole("button", { name: "Tutup", exact: true }).click();
  await page.getByRole("button", { name: "Buka konsultan bangunan AI", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Konsultan AI bangunan" });
  await expect(dialog.getByRole("log")).toContainText("gambar potongan dan jumlah rak");
  await dialog.getByRole("button", { name: "Mulai percakapan baru", exact: true }).click();
  await expect(dialog.getByRole("log")).not.toContainText("Tingginya 180 cm");
  expect(await savedCart(page)).toEqual([{ productId: "kayu-kaso", unit: "batang", quantity: 2 }]);
});

test("consultant can stop a pending response and send a new message", async ({ page }) => {
  await readyAI(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  await page.route("**/api/ai/chat", async (route) => {
    const currentRequest = ++requests;
    if (currentRequest === 1) await pending;
    try {
      await route.fulfill({ contentType: "text/event-stream", body: streamFixture([
        { type: "delta", text: "Mari lanjutkan membahas kebutuhan proyek Anda." }, { type: "done" },
      ]) });
    } catch (error) {
      // The first fetch is explicitly canceled by the user in this test.
      if (currentRequest !== 1) throw error;
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Buka konsultan bangunan AI", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Pesan untuk konsultan AI" }).fill("Bahan apa untuk membuat rak?");
  await dialog.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Hentikan jawaban", exact: true })).toBeVisible();
  await expect.poll(() => requests).toBe(1);
  await dialog.getByRole("button", { name: "Hentikan jawaban", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("Jawaban dihentikan.");
  release();
  await dialog.getByRole("textbox", { name: "Pesan untuk konsultan AI" }).fill("Saya ingin rak kecil dari kayu.");
  await dialog.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("Mari lanjutkan membahas kebutuhan proyek Anda.");
  expect(requests).toBe(2);
});

test("consultant shows API failures, preserves the draft and retries without duplicate user turns", async ({ page }) => {
  await readyAI(page);
  let requests = 0;
  await page.route("**/api/ai/chat", (route) => ++requests === 1
    ? route.fulfill({ status: 503, json: { error: "Layanan AI sedang tidak tersedia. Silakan coba lagi." } })
    : route.fulfill({ contentType: "text/event-stream", body: streamFixture([
      { type: "delta", text: "Kita bisa membandingkan bahan untuk rak tersebut." }, { type: "done" },
    ]) }));
  await page.goto("/");
  await page.getByRole("button", { name: "Buka konsultan bangunan AI", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const composer = dialog.getByRole("textbox", { name: "Pesan untuk konsultan AI" });
  await composer.fill("Saya ingin membandingkan bahan rak.");
  await dialog.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Layanan AI sedang tidak tersedia");
  await expect(composer).toHaveValue("Saya ingin membandingkan bahan rak.");
  expect(await savedCart(page)).toEqual([]);
  await dialog.getByRole("button", { name: "Coba kirim lagi", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("Kita bisa membandingkan bahan untuk rak tersebut.");
  await expect(dialog.locator(".chat-message.user")).toHaveCount(1);
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  expect(requests).toBe(2);
});
test("invoice extraction is reviewable, confirms stock and prevents duplicate confirmation", async ({
  page,
}) => {
  await login(page);
  await page.goto("/#/admin/invoice");
  await page
    .getByLabel("Unggah nota supplier")
    .setInputFiles(pngFixture());
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
  const expansionIds = new Set([...expandedDemoProducts, ...diyDemoProducts].map((p) => p.id));
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
    localStorage.removeItem("pbdy-catalog-v3");
    localStorage.setItem("migration-fixture-seeded", "1");
  }, { products: savedProducts, orders: savedOrders });
  await page.goto("/#/katalog");
  const readSaved = () => page.evaluate(() => ({
    products: JSON.parse(localStorage.getItem("pbdy-v1-products")!),
    orders: JSON.parse(localStorage.getItem("pbdy-v1-orders")!),
    migrated: localStorage.getItem("pbdy-catalog-v2"),
    migratedDiy: localStorage.getItem("pbdy-catalog-v3"),
  }));
  const first = await readSaved();
  expect(first.migrated).toBe("1");
  expect(first.migratedDiy).toBe("1");
  expect(first.products).toHaveLength(savedProducts.length + expandedDemoProducts.length + diyDemoProducts.length);
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
