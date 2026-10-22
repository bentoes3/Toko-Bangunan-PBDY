export interface Unit {
  name: string;
  factor: number;
}
export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  unit: string;
  units: Unit[];
  stock: number;
  safety: number;
  weight: number;
  volume: number;
  image: string;
  description: string;
  sold: number;
  active: boolean;
  badge?: string;
}
export interface CartItem {
  productId: string;
  unit: string;
  quantity: number;
}
export interface Order {
  id: string;
  date: string;
  name: string;
  phone: string;
  address: string;
  payment: string;
  paid: boolean;
  status: number;
  items: (CartItem & {
    name: string;
    price: number;
    factor: number;
    cost: number;
  })[];
  subtotal: number;
  shipping: number;
  total: number;
  fleet: string;
  driver: string;
  eta: string;
  note: string;
}
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  term: number;
  categories: string;
  address: string;
}
export interface Purchase {
  id: string;
  supplierId: string;
  date: string;
  due: string;
  total: number;
  paid: boolean;
  received: boolean;
  items: { productId: string; quantity: number; cost: number }[];
}
export interface Movement {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  reason: string;
}
export const money = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
export const statuses = ["Diproses", "Dikemas", "Dikirim", "Selesai"];
export function conversion(p: Product, unit: string) {
  return p.units.find((u) => u.name === unit)?.factor ?? 1;
}
export function totals(cart: CartItem[], products: Product[]) {
  return cart.reduce(
    (a, i) => {
      const p = products.find((p) => p.id === i.productId);
      if (!p) return a;
      const n = i.quantity * conversion(p, i.unit);
      return {
        subtotal: a.subtotal + n * p.price,
        weight: a.weight + n * p.weight,
        volume: a.volume + n * p.volume,
      };
    },
    { subtotal: 0, weight: 0, volume: 0 },
  );
}
export const fleets = [
  { name: "Motor Boks", capacity: 25, space: 0.12, fee: 20000 },
  { name: "Pikap", capacity: 1000, space: 4, fee: 50000 },
  { name: "Truk Engkel", capacity: 4000, space: 12, fee: 250000 },
  { name: "Truk Fuso", capacity: 10000, space: 30, fee: 650000 },
];
export function deliveryArea(address: string) {
  return /\bbogor\b/i.test(address) ? "Bogor" : "Luar Bogor";
}
export function fleetOptions(weight: number, volume: number, address = "Bogor") {
  const outside = deliveryArea(address) === "Luar Bogor";
  return fleets.map((base, index) => {
    const trips = Math.max(1, Math.ceil(weight / base.capacity), Math.ceil(volume / base.space));
    const rate = base.name === "Motor Boks" ? (outside ? 50000 : 20000)
      : base.name === "Pikap" ? (outside ? 70000 : 50000) : base.fee;
    return { ...base, trips, fee: rate * trips,
      available: trips === 1 || index === fleets.length - 1 };
  });
}
export function fleetFor(weight: number, volume: number, address = "Bogor") {
  return fleetOptions(weight, volume, address).find((fleet) => fleet.available)!;
}
export function validateCart(cart: CartItem[], products: Product[]) {
  if (!cart.length) return "Keranjang masih kosong.";
  const used: Record<string, number> = {};
  for (const i of cart) {
    const p = products.find((p) => p.id === i.productId);
    if (!p || !p.active) return "Produk sudah tidak tersedia.";
    if (
      !Number.isInteger(i.quantity) ||
      i.quantity <= 0 ||
      !p.units.some((u) => u.name === i.unit)
    )
      return "Jumlah atau satuan tidak valid.";
    used[p.id] = (used[p.id] || 0) + i.quantity * conversion(p, i.unit);
    if (used[p.id] > p.stock) return `Stok ${p.name} tidak mencukupi.`;
  }
  return "";
}
export function forecast(p: Product) {
  if (p.sold < 10) return null;
  const daily = p.sold / 30;
  const demand = Math.ceil(daily * 30 * 1.12);
  return {
    daily,
    demand,
    reorder: Math.max(0, demand + p.safety - p.stock),
    days: Math.floor(p.stock / daily),
  };
}
export function estimate(
  kind: string,
  length: number,
  width: number,
  height: number,
) {
  if ([length, width, height].some((n) => !Number.isFinite(n) || n <= 0))
    throw new Error("Isi semua ukuran dengan angka lebih dari nol.");
  const area =
    kind === "Cat dinding" ? 2 * (length + width) * height : length * width;
  return {
    area,
    quantity:
      kind === "Cat dinding"
        ? Math.ceil((area * 2 * 1.1) / 50)
        : kind === "Ganti keramik"
          ? Math.ceil((area * 1.1) / 1.44)
          : Math.ceil((area * 0.03 * 1800 * 1.1) / 50),
    coverage:
      kind === "Cat dinding"
        ? "2 lapis, daya sebar 10 m²/liter, kaleng 5 liter"
        : kind === "Ganti keramik"
          ? "1 dus = 1,44 m²"
          : "Tebal tambalan 3 cm, densitas 1.800 kg/m³",
    allowance: 10,
  };
}
