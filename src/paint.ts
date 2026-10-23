import { conversion, type CartItem, type Product } from "./domain";

export const PAINT_CAN_LITRES = 5;

export interface PaintInput {
  length: number;
  width: number;
  height: number;
  coats: number;
  coverage: number;
  openingArea: number;
  wastePercent: number;
}

/** Estimate paint for the four walls of one rectangular room; excludes ceiling. */
export function calculatePaint(input: PaintInput) {
  const { length, width, height, coats, coverage, openingArea, wastePercent } = input;
  if ([length, width, height].some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Isi panjang, lebar, dan tinggi ruangan dengan angka lebih dari nol.");
  }
  if (!Number.isFinite(coats) || !Number.isInteger(coats) || coats < 1) {
    throw new Error("Jumlah lapisan harus berupa bilangan bulat, minimal 1 lapis.");
  }
  if (!Number.isFinite(coverage) || coverage <= 0) {
    throw new Error("Daya sebar cat harus lebih dari nol. Periksa informasi pada kemasan.");
  }
  if (!Number.isFinite(openingArea) || openingArea < 0) {
    throw new Error("Luas pintu dan jendela harus nol atau lebih.");
  }
  if (!Number.isFinite(wastePercent) || wastePercent < 0 || wastePercent > 100) {
    throw new Error("Cadangan cat harus berada antara 0 dan 100%.");
  }
  const grossArea = 2 * (length + width) * height;
  if (openingArea >= grossArea) {
    throw new Error("Luas pintu dan jendela harus lebih kecil dari luas seluruh dinding.");
  }
  const netArea = grossArea - openingArea;
  const litres = (netArea * coats / coverage) * (1 + wastePercent / 100);
  const ratio = litres / PAINT_CAN_LITRES;
  // Avoid an extra can caused only by binary floating-point rounding at a boundary.
  const cans = Math.max(1, Math.ceil(ratio - Number.EPSILON * Math.max(1, ratio) * 8));
  if (![grossArea, netArea, litres, cans].every(Number.isFinite) || !Number.isSafeInteger(cans)) {
    throw new Error("Ukuran terlalu besar untuk dihitung. Periksa kembali angka yang Anda masukkan.");
  }
  return { grossArea, netArea, litres, cans, purchasedLitres: cans * PAINT_CAN_LITRES };
}

/** Stock is held in base units; reserve all units already present in this cart. */
export function availablePaintUnits(product: Product, cart: readonly CartItem[]) {
  const reserved = cart
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity * conversion(product, item.unit), 0);
  return Math.max(0, Math.floor(product.stock - reserved));
}
