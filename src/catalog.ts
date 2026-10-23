import type { Product } from "./domain";
import { diyDemoProducts } from "./diy-catalog";

// Katalog simulasi untuk demonstrasi. Harga, stok, berat, dan volume adalah
// contoh operasional, bukan ketersediaan atau penawaran resmi toko.
function demoProduct(product: Omit<Product, "active" | "sold" | "units"> & {
  units?: Product["units"];
}): Product {
  return {
    ...product,
    active: true,
    sold: 0,
    units: product.units ?? [{ name: product.unit, factor: 1 }],
  };
}

export const expandedDemoProducts: Product[] = [
  demoProduct({
    id: "mortar-bata", sku: "MTR-MU-380", name: "Mortar MU-380 Perekat Bata Ringan", brand: "Mortar Utama", category: "Semen",
    price: 120000, cost: 98000, unit: "sak", stock: 42, safety: 15, weight: 40, volume: 0.03,
    image: "/images/mortar.svg", description: "Mortar instan perekat bata ringan, kemasan 40 kg. Tambahkan air sesuai petunjuk pada kemasan.",
  }),
  demoProduct({
    id: "mortar-plester", sku: "MTR-MU-100", name: "Mortar MU-100 Plester Premium", brand: "Mortar Utama", category: "Semen",
    price: 68000, cost: 54000, unit: "sak", stock: 18, safety: 25, weight: 40, volume: 0.03,
    image: "/images/mortar.svg", description: "Plester instan untuk meratakan dinding bata merah dan bata ringan. Kemasan 40 kg.",
  }),
  demoProduct({
    id: "mortar-acian", sku: "MTR-MU-200", name: "Mortar MU-200 Acian Dinding", brand: "Mortar Utama", category: "Semen",
    price: 72000, cost: 58000, unit: "sak", stock: 0, safety: 20, weight: 40, volume: 0.03,
    image: "/images/mortar.svg", description: "Acian instan untuk hasil dinding yang halus sebelum pengecatan. Kemasan 40 kg.",
  }),
  demoProduct({
    id: "batu-kali", sku: "BTU-KLI-1", name: "Batu Kali Belah Pondasi", brand: "Material Alam", category: "Pasir & Batu",
    price: 350000, cost: 280000, unit: "m³", stock: 18, safety: 6, weight: 1600, volume: 1,
    image: "/images/batu.svg", description: "Batu kali belah untuk pasangan pondasi rumah. Perhitungan contoh per meter kubik material curah.",
  }),
  demoProduct({
    id: "pasir-urug", sku: "PSR-URG-1", name: "Pasir Urug Bangunan", brand: "Material Alam", category: "Pasir & Batu",
    price: 240000, cost: 185000, unit: "m³", stock: 4, safety: 6, weight: 1500, volume: 1,
    image: "/images/pasir.svg", description: "Pasir urug untuk mengisi dan meratakan dasar lantai. Dijual per meter kubik material curah.",
  }),
  demoProduct({
    id: "bata-merah", sku: "BTA-MRH-01", name: "Bata Merah Press", brand: "Material Lokal", category: "Bata & Blok",
    price: 900, cost: 650, unit: "pcs", stock: 10000, safety: 2000, weight: 1.7, volume: 0.0013,
    units: [{ name: "pcs", factor: 1 }, { name: "pak (100 pcs)", factor: 100 }],
    image: "/images/bata-merah.svg", description: "Bata merah press untuk dinding rumah. Ukuran contoh sekitar 20 × 10 × 5 cm.",
  }),
  demoProduct({
    id: "bata-ringan", sku: "BTA-RGN-10", name: "Bata Ringan AAC 10 cm", brand: "Material Lokal", category: "Bata & Blok",
    price: 650000, cost: 535000, unit: "m³", stock: 24, safety: 8, weight: 600, volume: 1,
    image: "/images/bata-ringan.svg", description: "Blok AAC ukuran 60 × 20 × 10 cm. Penjualan per meter kubik, sekitar 83 keping per m³.",
  }),
  demoProduct({
    id: "batako", sku: "BTA-BTK-40", name: "Batako Beton 40 × 20 cm", brand: "Material Lokal", category: "Bata & Blok",
    price: 3500, cost: 2600, unit: "pcs", stock: 0, safety: 300, weight: 8, volume: 0.0096,
    image: "/images/batako.svg", description: "Batako beton berlubang, ukuran contoh 40 × 20 × 12 cm untuk pasangan dinding.",
  }),
  demoProduct({
    id: "besi-polos", sku: "BSI-PLS-08", name: "Besi Beton Polos 8 mm", brand: "Krakatau Steel", category: "Besi & Baja",
    price: 45000, cost: 35000, unit: "batang", stock: 200, safety: 60, weight: 4.74, volume: 0.013,
    image: "/images/besi-polos.svg", description: "Besi beton polos diameter 8 mm, panjang 12 meter. Sesuaikan kebutuhan struktur dengan gambar perencana.",
  }),
  demoProduct({
    id: "kawat-bendrat", sku: "KWT-BND-1", name: "Kawat Bendrat Pengikat Besi", brand: "Material Lokal", category: "Besi & Baja",
    price: 22000, cost: 16000, unit: "kg", stock: 14, safety: 20, weight: 1, volume: 0.0003,
    image: "/images/kawat.svg", description: "Kawat bendrat untuk mengikat rangka tulangan beton. Dijual per kilogram.",
  }),
  demoProduct({
    id: "wiremesh-m8", sku: "BSI-WRM-M8", name: "Wiremesh M8 Lembar", brand: "Material Lokal", category: "Besi & Baja",
    price: 650000, cost: 535000, unit: "lembar", stock: 0, safety: 10, weight: 61, volume: 0.045,
    image: "/images/wiremesh.svg", description: "Tulangan anyam M8, ukuran lembar 2,1 × 5,4 meter untuk pekerjaan pelat beton sesuai perencanaan.",
  }),
  demoProduct({
    id: "baja-ringan", sku: "BSI-C75-075", name: "Baja Ringan Kanal C75", brand: "Material Lokal", category: "Besi & Baja",
    price: 95000, cost: 76000, unit: "batang", stock: 110, safety: 30, weight: 6.8, volume: 0.03,
    image: "/images/hollow.svg", description: "Profil kanal C75 tebal nominal 0,75 mm, panjang 6 meter untuk rangka atap sesuai desain struktur.",
  }),
  demoProduct({
    id: "kayu-kaso", sku: "KYU-KSO-57", name: "Kayu Kaso 5 × 7 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 65000, cost: 49000, unit: "batang", stock: 45, safety: 20, weight: 7.5, volume: 0.014,
    image: "/images/kayu.svg", description: "Kayu kaso ukuran nominal 5 × 7 cm, panjang 4 meter untuk kebutuhan rangka dan pekerjaan bangunan.",
  }),
  demoProduct({
    id: "multipleks", sku: "KYU-MLT-09", name: "Multipleks 9 mm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 135000, cost: 108000, unit: "lembar", stock: 18, safety: 20, weight: 15, volume: 0.0265,
    image: "/images/papan.svg", description: "Multipleks tebal 9 mm, ukuran 122 × 244 cm untuk pekerjaan furnitur dan interior dalam ruang.",
  }),
  demoProduct({
    id: "papan-bekisting", sku: "KYU-BKS-20", name: "Papan Bekisting 2 × 20 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 42000, cost: 31000, unit: "lembar", stock: 130, safety: 30, weight: 8, volume: 0.02,
    image: "/images/kayu.svg", description: "Papan kayu ukuran nominal 2 × 20 cm, panjang 4 meter untuk bekisting dan pekerjaan sementara.",
  }),
  demoProduct({
    id: "genteng-beton", sku: "ATP-GTG-BTN", name: "Genteng Beton Flat", brand: "Material Lokal", category: "Atap & Talang",
    price: 8500, cost: 6400, unit: "pcs", stock: 1250, safety: 300, weight: 4.5, volume: 0.004,
    image: "/images/genteng.svg", description: "Genteng beton model flat warna abu arang. Kebutuhan jumlah dan kemiringan mengikuti spesifikasi pemasangan.",
  }),
  demoProduct({
    id: "atap-spandek", sku: "ATP-SPD-3M", name: "Atap Spandek 3 Meter", brand: "Material Lokal", category: "Atap & Talang",
    price: 210000, cost: 168000, unit: "lembar", stock: 26, safety: 10, weight: 10, volume: 0.05,
    image: "/images/spandek.svg", description: "Atap spandek panjang 3 meter, lebar efektif sekitar 75 cm. Cocok untuk kanopi dan atap bangunan.",
  }),
  demoProduct({
    id: "talang-pvc", sku: "ATP-TLG-4M", name: "Talang Air PVC 4 Meter", brand: "Material Lokal", category: "Atap & Talang",
    price: 95000, cost: 72000, unit: "batang", stock: 0, safety: 8, weight: 3, volume: 0.04,
    image: "/images/talang.svg", description: "Talang air PVC panjang 4 meter untuk menyalurkan air hujan dari tepi atap. Braket dan sambungan terpisah.",
  }),
  demoProduct({
    id: "nok-genteng", sku: "ATP-NOK-BTN", name: "Nok Genteng Beton", brand: "Material Lokal", category: "Atap & Talang",
    price: 32000, cost: 24000, unit: "pcs", stock: 70, safety: 20, weight: 4, volume: 0.008,
    image: "/images/nok.svg", description: "Nok beton untuk menutup pertemuan puncak atap genteng. Warna abu arang.",
  }),
  demoProduct({
    id: "gypsum", sku: "PLF-GYP-09", name: "Papan Gypsum 9 mm", brand: "Jayaboard", category: "Plafon",
    price: 65000, cost: 50000, unit: "lembar", stock: 80, safety: 20, weight: 18, volume: 0.0276,
    image: "/images/gypsum.svg", description: "Papan gypsum standar 9 mm, ukuran 120 × 240 cm untuk plafon dan partisi pada area dalam ruang yang kering.",
  }),
  demoProduct({
    id: "hollow-galvanis", sku: "PLF-HLW-44", name: "Hollow Galvanis 4 × 4 cm", brand: "Material Lokal", category: "Plafon",
    price: 30000, cost: 22000, unit: "batang", stock: 180, safety: 40, weight: 1.6, volume: 0.0064,
    image: "/images/hollow.svg", description: "Profil hollow galvanis 4 × 4 cm panjang 4 meter, untuk rangka plafon dan pekerjaan interior ringan.",
  }),
  demoProduct({
    id: "pipa-pvc-3", sku: "PIP-RCK-03", name: "Pipa PVC Rucika D 3 Inci", brand: "Rucika", category: "Pipa & Fitting",
    price: 115000, cost: 90000, unit: "batang", stock: 14, safety: 20, weight: 4.7, volume: 0.032,
    image: "/images/pipa.svg", description: "Pipa PVC kelas D diameter 3 inci, panjang 4 meter untuk saluran pembuangan tanpa tekanan.",
  }),
  demoProduct({
    id: "tee-pvc", sku: "FIT-TEE-05", name: "Tee PVC Rucika ½ Inci", brand: "Rucika", category: "Pipa & Fitting",
    price: 5500, cost: 3500, unit: "pcs", stock: 85, safety: 30, weight: 0.05, volume: 0.0003,
    image: "/images/tee.svg", description: "Sambungan T PVC ukuran ½ inci untuk percabangan instalasi air bersih.",
  }),
  demoProduct({
    id: "lem-pvc", sku: "LEM-PVC-100", name: "Lem Pipa PVC 100 Gram", brand: "Isarplas", category: "Pipa & Fitting",
    price: 22000, cost: 15000, unit: "kaleng", stock: 40, safety: 10, weight: 0.12, volume: 0.0003,
    image: "/images/lem-pvc.svg", description: "Perekat untuk sambungan pipa dan fitting PVC. Kemasan 100 gram, gunakan sesuai petunjuk kemasan.",
  }),
  demoProduct({
    id: "kloset-jongkok", sku: "SAN-KLS-JGK", name: "Kloset Jongkok Keramik", brand: "American Standard", category: "Sanitasi",
    price: 235000, cost: 185000, unit: "pcs", stock: 6, safety: 5, weight: 12, volume: 0.06,
    image: "/images/kloset.svg", description: "Kloset jongkok keramik putih untuk kamar mandi. Perlengkapan pembuangan dan instalasi dijual terpisah.",
  }),
  demoProduct({
    id: "kran-air", sku: "SAN-KRN-05", name: "Kran Air Dinding ½ Inci", brand: "Wasser", category: "Sanitasi",
    price: 48000, cost: 34000, unit: "pcs", stock: 32, safety: 10, weight: 0.3, volume: 0.0008,
    image: "/images/kran.svg", description: "Kran dinding berbahan logam dengan ulir ½ inci untuk area cuci dan kamar mandi.",
  }),
  demoProduct({
    id: "wastafel", sku: "SAN-WST-01", name: "Wastafel Gantung Keramik", brand: "American Standard", category: "Sanitasi",
    price: 315000, cost: 250000, unit: "pcs", stock: 0, safety: 3, weight: 10, volume: 0.08,
    image: "/images/wastafel.svg", description: "Wastafel keramik putih model gantung untuk kamar mandi. Kran dan sifon dijual terpisah.",
  }),
  demoProduct({
    id: "kabel-nym", sku: "LST-NYM-215", name: "Kabel NYM 2 × 1,5 mm²", brand: "Supreme", category: "Listrik",
    price: 850000, cost: 695000, unit: "rol", stock: 12, safety: 5, weight: 5.5, volume: 0.018,
    image: "/images/kabel.svg", description: "Kabel NYM dua inti, penampang 1,5 mm², panjang 100 meter per rol. Pemasangan mengikuti rancangan instalasi listrik.",
  }),
  demoProduct({
    id: "stopkontak", sku: "LST-STK-01", name: "Stopkontak Tanam dengan Arde", brand: "Panasonic", category: "Listrik",
    price: 28000, cost: 19000, unit: "pcs", stock: 45, safety: 20, weight: 0.12, volume: 0.00025,
    image: "/images/stopkontak.svg", description: "Stopkontak dinding model tanam satu lubang dengan terminal arde. Warna putih, dus tanam dijual terpisah.",
  }),
  demoProduct({
    id: "saklar", sku: "LST-SKL-01", name: "Saklar Tunggal Tanam", brand: "Panasonic", category: "Listrik",
    price: 22000, cost: 14500, unit: "pcs", stock: 16, safety: 20, weight: 0.08, volume: 0.0002,
    image: "/images/saklar.svg", description: "Saklar tunggal model tanam berwarna putih untuk pengendalian satu kelompok lampu.",
  }),
  demoProduct({
    id: "mcb-6a", sku: "LST-MCB-06", name: "MCB 1 Pole 6 Ampere", brand: "Schneider Electric", category: "Listrik",
    price: 65000, cost: 48000, unit: "pcs", stock: 0, safety: 10, weight: 0.1, volume: 0.0001,
    image: "/images/mcb.svg", description: "MCB satu kutub 6 ampere untuk proteksi rangkaian listrik. Pemilihan kapasitas mengikuti rancangan teknisi listrik.",
  }),
  demoProduct({
    id: "lampu-led", sku: "LST-LED-12", name: "Lampu LED 12 Watt", brand: "Philips", category: "Listrik",
    price: 38000, cost: 27000, unit: "pcs", stock: 90, safety: 20, weight: 0.1, volume: 0.0006,
    image: "/images/lampu.svg", description: "Lampu LED 12 watt dengan fitting E27, cahaya putih untuk penerangan ruangan rumah.",
  }),
  demoProduct({
    id: "bor-listrik", sku: "ALT-BOR-10", name: "Bor Listrik 10 mm", brand: "Bosch", category: "Peralatan",
    price: 450000, cost: 360000, unit: "pcs", stock: 8, safety: 4, weight: 1.8, volume: 0.009,
    image: "/images/bor.svg", description: "Bor listrik kabel dengan chuck 10 mm untuk pekerjaan perakitan dan renovasi. Mata bor dijual terpisah.",
  }),
  demoProduct({
    id: "meteran", sku: "ALT-MTR-5", name: "Meteran Gulung 5 Meter", brand: "Tekiro", category: "Peralatan",
    price: 45000, cost: 31000, unit: "pcs", stock: 30, safety: 10, weight: 0.22, volume: 0.0005,
    image: "/images/meteran.svg", description: "Meteran gulung 5 meter dengan pengunci pita untuk mengukur ruang, bahan, dan pekerjaan tukang.",
  }),
  demoProduct({
    id: "sekop", sku: "ALT-SKP-01", name: "Sekop Pasir Gagang Kayu", brand: "Material Lokal", category: "Peralatan",
    price: 80000, cost: 59000, unit: "pcs", stock: 6, safety: 8, weight: 1.6, volume: 0.02,
    image: "/images/sekop.svg", description: "Sekop kepala baja dengan gagang kayu untuk memindahkan pasir, tanah, dan adukan bangunan.",
  }),
  demoProduct({
    id: "kuas-cat", sku: "ALT-KUS-3", name: "Kuas Cat 3 Inci", brand: "Eterna", category: "Peralatan",
    price: 18000, cost: 11000, unit: "pcs", stock: 50, safety: 15, weight: 0.12, volume: 0.0006,
    image: "/images/kuas.svg", description: "Kuas lebar 3 inci untuk pengecatan sudut, kusen, dan pekerjaan perbaikan rumah.",
  }),
  demoProduct({
    id: "helm-safety", sku: "APD-HLM-01", name: "Helm Proyek Safety", brand: "Material Lokal", category: "Alat Pelindung",
    price: 45000, cost: 31000, unit: "pcs", stock: 24, safety: 10, weight: 0.35, volume: 0.009,
    image: "/images/helm.svg", description: "Helm proyek warna kuning dengan pengaturan lingkar kepala untuk perlengkapan kerja bangunan.",
  }),
  demoProduct({
    id: "sarung-tangan", sku: "APD-STG-01", name: "Sarung Tangan Kerja Berlapis", brand: "Material Lokal", category: "Alat Pelindung",
    price: 12000, cost: 7500, unit: "pasang", stock: 0, safety: 20, weight: 0.1, volume: 0.0008,
    image: "/images/sarung-tangan.svg", description: "Sarung tangan kerja rajut dengan lapisan telapak untuk penanganan material dan pekerjaan umum.",
  }),
  demoProduct({
    id: "waterproofing", sku: "PLP-WTP-4", name: "Pelapis Antibocor 4 kg", brand: "Aquaproof", category: "Pelapis & Perekat",
    price: 185000, cost: 145000, unit: "kaleng", stock: 7, safety: 10, weight: 4.5, volume: 0.006,
    image: "/images/antibocor.svg", description: "Pelapis kedap air elastis kemasan 4 kg untuk dak dan area luar sesuai petunjuk persiapan permukaan.",
  }),
  demoProduct({
    id: "nat-keramik", sku: "PLP-NAT-1", name: "Pengisi Nat Keramik 1 kg", brand: "AM", category: "Pelapis & Perekat",
    price: 18000, cost: 12000, unit: "bungkus", stock: 60, safety: 20, weight: 1, volume: 0.001,
    image: "/images/nat.svg", description: "Pengisi celah nat keramik warna abu-abu, kemasan 1 kg untuk finishing lantai dan dinding.",
  }),
];

/**
 * Run once per catalog migration version. Only the expansion is eligible for
 * addition: deleted original products are never restored. Existing IDs retain
 * every saved value, including edits, inactive state and zero stock.
 */
export function appendMissingCatalogProducts(saved: Product[]): Product[] {
  return appendUniqueProducts(saved, expandedDemoProducts);
}

/** Version 3 only adds DIY products, preserving deletions from earlier versions. */
export function appendDiyCatalogProducts(saved: Product[]): Product[] {
  return appendUniqueProducts(saved, diyDemoProducts);
}

function appendUniqueProducts(saved: Product[], expansion: Product[]): Product[] {
  const existingIds = new Set(saved.map((product) => product.id));
  const additions = expansion.filter((product) => !existingIds.has(product.id));
  if (!additions.length) return saved;
  return [
    ...saved,
    ...additions.map((product) => ({
      ...product,
      units: product.units.map((unit) => ({ ...unit })),
    })),
  ];
}
