import type { Product } from "./domain";

// Produk simulasi untuk proyek furnitur dan perbaikan rumah sederhana.
// Harga, stok, berat, dan volume merupakan contoh operasional toko.
function diyProduct(product: Omit<Product, "active" | "sold" | "units">): Product {
  return {
    ...product,
    active: true,
    sold: 0,
    units: [{ name: product.unit, factor: 1 }],
  };
}

export const diyDemoProducts: Product[] = [
  diyProduct({
    id: "papan-pinus-18", sku: "DIY-KYU-PNS18", name: "Papan Pinus Laminasi 18 mm · 30 × 200 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 145000, cost: 110000, unit: "lembar", stock: 32, safety: 10, weight: 5.4, volume: 0.0108,
    image: "/images/papan-furnitur.svg", description: "Papan kayu pinus solid laminasi tebal 18 mm, lebar 30 cm, panjang 200 cm. Untuk rak kecil, ambalan, dan furnitur dalam ruang kering. Bukan multipleks. Ukuran potong mengikuti gambar kerja; jasa potong tidak termasuk.",
  }),
  diyProduct({
    id: "papan-karet-18", sku: "DIY-KYU-KRT18", name: "Papan Kayu Karet Laminasi 18 mm · 60 × 200 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 365000, cost: 288000, unit: "lembar", stock: 15, safety: 6, weight: 14.5, volume: 0.0216,
    image: "/images/papan-furnitur.svg", description: "Papan kayu karet solid laminasi tebal 18 mm, ukuran 60 × 200 cm. Pilihan panel meja atau furnitur interior kering; perlu pengamplasan dan pelapis sesuai hasil yang diinginkan. Bukan kayu struktural.",
  }),
  diyProduct({
    id: "multipleks-12", sku: "DIY-KYU-MLT12", name: "Multipleks 12 mm · 122 × 244 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 185000, cost: 145000, unit: "lembar", stock: 28, safety: 10, weight: 22, volume: 0.0357,
    image: "/images/papan-furnitur.svg", description: "Multipleks interior tebal 12 mm, ukuran satu lembar 122 × 244 cm. Untuk panel dan komponen furnitur sesuai desain. Ketebalan 12 mm tidak boleh dianggap sama dengan 18 mm; kebutuhan penyangga mengikuti bentang dan beban.",
  }),
  diyProduct({
    id: "multipleks-18", sku: "DIY-KYU-MLT18", name: "Multipleks 18 mm · 122 × 244 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 285000, cost: 225000, unit: "lembar", stock: 36, safety: 12, weight: 32, volume: 0.0536,
    image: "/images/papan-furnitur.svg", description: "Multipleks interior tebal 18 mm, ukuran satu lembar 122 × 244 cm. Pilihan untuk badan lemari, sisi, alas, dan rak sesuai gambar kerja. Jumlah lembar dihitung dari daftar potong termasuk sisa potong; bukan ukuran panel yang sudah dipotong.",
  }),
  diyProduct({
    id: "mdf-18", sku: "DIY-KYU-MDF18", name: "Papan MDF 18 mm · 122 × 244 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 245000, cost: 190000, unit: "lembar", stock: 20, safety: 8, weight: 40, volume: 0.0536,
    image: "/images/papan-furnitur.svg", description: "Papan MDF standar tebal 18 mm, ukuran 122 × 244 cm, permukaan rata untuk furnitur berlapis cat di ruang kering. Bukan multipleks dan bukan MDF tahan air; tidak untuk area lembap. Tepi memerlukan primer yang sesuai.",
  }),
  diyProduct({
    id: "multipleks-3", sku: "DIY-KYU-MLT03", name: "Multipleks 3 mm · 122 × 244 cm", brand: "Material Lokal", category: "Kayu & Papan",
    price: 72000, cost: 54000, unit: "lembar", stock: 30, safety: 10, weight: 5.5, volume: 0.0089,
    image: "/images/papan-furnitur.svg", description: "Multipleks tipis tebal 3 mm, ukuran 122 × 244 cm. Untuk penutup belakang lemari atau dasar laci ringan yang mendapat dukungan sesuai desain. Bukan pengganti panel badan atau rak lemari 18 mm.",
  }),
  diyProduct({
    id: "reng-pinus-2-3", sku: "DIY-KYU-RNG23", name: "Batang Pinus Serut 2 × 3 cm · 2 Meter", brand: "Material Lokal", category: "Kayu & Papan",
    price: 22000, cost: 15500, unit: "batang", stock: 60, safety: 20, weight: 0.6, volume: 0.0012,
    image: "/images/papan-furnitur.svg", description: "Kayu pinus serut ukuran nominal 2 × 3 cm, panjang 2 meter. Untuk bingkai kecil, dudukan panel, atau penguat furnitur ringan sesuai desain. Bukan komponen struktur bangunan.",
  }),
  diyProduct({
    id: "lis-tepi-kayu", sku: "DIY-KYU-LIS20", name: "Lis Tepi Kayu 20 × 5 mm · 2 Meter", brand: "Material Lokal", category: "Kayu & Papan",
    price: 18000, cost: 12000, unit: "batang", stock: 48, safety: 16, weight: 0.12, volume: 0.0002,
    image: "/images/papan-furnitur.svg", description: "Lis kayu pinus lebar 20 mm, tebal 5 mm, panjang 2 meter untuk menutup tepi panel furnitur. Dapat dipasangkan dengan lem kayu PVAc pada permukaan kayu yang sesuai, lalu diklem dan dirapikan. Lem terpisah.",
  }),
  diyProduct({
    id: "lem-kayu-pvac", sku: "DIY-LEM-PVA500", name: "Lem Kayu Putih PVAc 500 Gram", brand: "Perkakas Lokal", category: "Pelapis & Perekat",
    price: 32000, cost: 22500, unit: "botol", stock: 45, safety: 15, weight: 0.56, volume: 0.0007,
    image: "/images/perakitan-kayu.svg", description: "Lem putih PVAc kemasan 500 gram untuk sambungan kayu berpori dan perakitan furnitur interior kering. Bersihkan permukaan, jepit sambungan, dan ikuti waktu kering kemasan. Bukan lem PVC, bukan perekat struktural, dan bukan untuk pemakaian terendam air.",
  }),
  diyProduct({
    id: "sekrup-kayu-16", sku: "DIY-SKR-3516", name: "Sekrup Kayu 3,5 × 16 mm · 100 pcs", brand: "Perkakas Lokal", category: "Paku & Sekrup",
    price: 18000, cost: 11000, unit: "pak", stock: 45, safety: 15, weight: 0.12, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 100 sekrup kayu kepala tanam plus, diameter 3,5 mm panjang 16 mm. Untuk pemasangan hardware pada panel kayu jika lubang dan kedalaman sesuai. Periksa panjang agar ujung tidak menembus panel; bukan sekrup sambungan badan 18 mm ke 18 mm.",
  }),
  diyProduct({
    id: "sekrup-kayu-35", sku: "DIY-SKR-3535", name: "Sekrup Kayu 3,5 × 35 mm · 100 pcs", brand: "Perkakas Lokal", category: "Paku & Sekrup",
    price: 25000, cost: 17000, unit: "pak", stock: 50, safety: 15, weight: 0.25, volume: 0.0003,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 100 sekrup kayu kepala tanam plus, diameter 3,5 mm panjang 35 mm. Untuk sambungan antar panel sesuai desain, bukan memasang engsel pada muka panel 18 mm. Buat lubang pandu dan periksa kedalaman agar tidak menembus sisi seberang. Harga per pak.",
  }),
  diyProduct({
    id: "sekrup-kayu-50", sku: "DIY-SKR-4050", name: "Sekrup Kayu 4 × 50 mm · 100 pcs", brand: "Perkakas Lokal", category: "Paku & Sekrup",
    price: 34000, cost: 24000, unit: "pak", stock: 28, safety: 10, weight: 0.4, volume: 0.0004,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 100 sekrup kayu kepala tanam plus, diameter 4 mm panjang 50 mm. Untuk sambungan kayu yang menyediakan kedalaman cukup; panjang ini tidak cocok untuk semua sambungan panel tipis. Buat lubang pandu sesuai kebutuhan.",
  }),
  diyProduct({
    id: "dowel-kayu-8", sku: "DIY-HDW-DWL8", name: "Dowel Kayu 8 × 30 mm · 50 pcs", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 18000, cost: 11000, unit: "pak", stock: 35, safety: 12, weight: 0.08, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 50 dowel kayu beralur diameter 8 mm, panjang 30 mm. Pasak untuk penyelarasan sambungan furnitur dengan lubang bor yang tepat dan lem kayu. Mata bor dan lem dijual terpisah.",
  }),
  diyProduct({
    id: "engsel-sendok-35", sku: "DIY-HDW-ENG35", name: "Engsel Sendok Lurus 35 mm · 2 pcs", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 38000, cost: 26000, unit: "pasang", stock: 40, safety: 12, weight: 0.2, volume: 0.0004,
    image: "/images/perakitan-kayu.svg", description: "Satu pasang berisi 2 engsel sendok lurus full overlay dan 2 pelat dudukan untuk pintu kabinet. Diameter lubang mangkuk 35 mm; ikuti pola dan kedalaman bor engsel. Sekrup terpisah. Jumlah engsel per pintu disesuaikan tinggi, berat, dan petunjuk hardware.",
  }),
  diyProduct({
    id: "handle-lemari-128", sku: "DIY-HDW-HDL128", name: "Handle Lemari Hitam · Jarak Lubang 128 mm", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 19000, cost: 12000, unit: "pcs", stock: 60, safety: 20, weight: 0.07, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Satu handle tarik furnitur warna hitam dengan jarak pusat lubang baut 128 mm. Termasuk 2 baut M4 panjang 22 mm; periksa ketebalan pintu dan kedalaman ulir sebelum pemasangan. Bukan panjang keseluruhan handle 128 mm.",
  }),
  diyProduct({
    id: "rel-laci-35", sku: "DIY-HDW-REL35", name: "Rel Laci Teleskopik 35 cm · Kiri dan Kanan", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 48000, cost: 34000, unit: "pasang", stock: 26, safety: 10, weight: 0.7, volume: 0.001,
    image: "/images/perakitan-kayu.svg", description: "Satu pasang rel laci teleskopik panjang 35 cm, terdiri dari rel kiri dan kanan untuk satu laci. Periksa kedalaman kabinet serta kebutuhan celah samping menurut petunjuk rel sebelum menentukan ukuran laci. Sekrup terpisah; tidak mencantumkan kapasitas beban.",
  }),
  diyProduct({
    id: "siku-furnitur-40", sku: "DIY-HDW-SKU40", name: "Siku Sambung Furnitur 40 × 40 mm · 4 pcs", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 20000, cost: 12500, unit: "pak", stock: 40, safety: 15, weight: 0.12, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 4 braket siku logam 40 × 40 mm untuk sambungan sudut furnitur ringan. Sekrup dijual terpisah dan dipilih sesuai panel. Bukan braket penahan beban manusia atau pengikat struktur bangunan.",
  }),
  diyProduct({
    id: "magnet-pintu-lemari", sku: "DIY-HDW-MAG2", name: "Pengunci Magnet Pintu Lemari · 2 Set", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 16000, cost: 9500, unit: "pak", stock: 32, safety: 12, weight: 0.08, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Satu pak berisi 2 set penahan pintu magnet; setiap set terdiri dari rumah magnet dan pelat logam. Membantu menahan pintu lemari tetap tertutup, bukan kunci keamanan. Sekrup pemasangan dijual terpisah.",
  }),
  diyProduct({
    id: "kaki-furnitur-10", sku: "DIY-HDW-KKI10", name: "Kaki Furnitur Logam 10 cm · 4 pcs", brand: "Perkakas Lokal", category: "Hardware Furnitur",
    price: 85000, cost: 62000, unit: "set", stock: 18, safety: 6, weight: 0.9, volume: 0.003,
    image: "/images/perakitan-kayu.svg", description: "Satu set berisi 4 kaki furnitur logam tinggi 10 cm dengan pelat pemasangan. Untuk kabinet sesuai rancangan dan spesifikasi pemasangan; sekrup terpisah. Jumlah dan penempatan kaki perlu menyesuaikan ukuran serta berat kabinet, tanpa klaim kapasitas beban.",
  }),
  diyProduct({
    id: "klem-f-150", sku: "DIY-ALT-KLM150", name: "Klem Kayu F Clamp 150 mm", brand: "Perkakas Lokal", category: "Peralatan",
    price: 55000, cost: 39000, unit: "pcs", stock: 24, safety: 8, weight: 0.5, volume: 0.0012,
    image: "/images/perakitan-kayu.svg", description: "Klem model F dengan bukaan maksimum 150 mm untuk menahan sambungan kayu saat dilem atau dipasang. Dijual satu klem; gunakan bantalan agar tidak membekas pada permukaan dan jumlah klem yang sesuai panjang sambungan.",
  }),
  diyProduct({
    id: "gergaji-kayu-18", sku: "DIY-ALT-GRG18", name: "Gergaji Tangan Kayu 18 Inci", brand: "Perkakas Lokal", category: "Peralatan",
    price: 65000, cost: 47000, unit: "pcs", stock: 22, safety: 8, weight: 0.4, volume: 0.003,
    image: "/images/perakitan-kayu.svg", description: "Gergaji tangan bilah 18 inci untuk pemotongan kayu dan panel dengan penyangga kerja yang sesuai. Untuk potongan panel besar dan presisi, pertimbangkan jasa pemotongan di luar toko; jasa potong tidak termasuk.",
  }),
  diyProduct({
    id: "obeng-set-2", sku: "DIY-ALT-OBG2", name: "Set Obeng Plus dan Minus · 2 pcs", brand: "Perkakas Lokal", category: "Peralatan",
    price: 35000, cost: 23000, unit: "set", stock: 30, safety: 10, weight: 0.22, volume: 0.0005,
    image: "/images/perakitan-kayu.svg", description: "Satu set berisi 1 obeng plus PH2 dan 1 obeng minus lebar 6 mm untuk perakitan dan perbaikan rumah. Pilih ujung sesuai kepala sekrup. Bukan obeng isolasi untuk pekerjaan listrik bertegangan.",
  }),
  diyProduct({
    id: "mata-obeng-ph2", sku: "DIY-ALT-BITPH2", name: "Mata Obeng PH2 50 mm · 5 pcs", brand: "Perkakas Lokal", category: "Peralatan",
    price: 25000, cost: 16000, unit: "set", stock: 35, safety: 12, weight: 0.07, volume: 0.0001,
    image: "/images/perakitan-kayu.svg", description: "Satu set berisi 5 mata obeng plus PH2 panjang 50 mm, tangkai hex ¼ inci. Untuk kepala sekrup PH2 pada bor/driver yang mendukung pemasangan bit. Bukan mata bor pembuat lubang; periksa pengaturan torsi alat.",
  }),
  diyProduct({
    id: "mata-bor-kayu-set", sku: "DIY-ALT-BORK8", name: "Set Mata Bor Kayu 3–10 mm · 8 pcs", brand: "Perkakas Lokal", category: "Peralatan",
    price: 55000, cost: 39000, unit: "set", stock: 25, safety: 8, weight: 0.18, volume: 0.0003,
    image: "/images/perakitan-kayu.svg", description: "Satu set mata bor kayu ujung penentu pusat, ukuran 3, 4, 5, 6, 7, 8, 9, dan 10 mm. Untuk lubang pandu dan dowel sesuai ukuran. Gunakan mode putar tanpa hammer, penyangga benda kerja, dan pembatas kedalaman jika diperlukan.",
  }),
  diyProduct({
    id: "mata-bor-engsel-35", sku: "DIY-ALT-FOR35", name: "Mata Bor Forstner 35 mm untuk Engsel", brand: "Perkakas Lokal", category: "Peralatan",
    price: 48000, cost: 33000, unit: "pcs", stock: 18, safety: 6, weight: 0.09, volume: 0.0002,
    image: "/images/perakitan-kayu.svg", description: "Mata bor Forstner diameter 35 mm untuk lubang mangkuk engsel sendok pada kayu atau panel. Atur kedalaman menurut engsel agar tidak menembus pintu; perlu bor yang kompatibel, penahan panel, dan panduan posisi. Bukan mata bor tembok.",
  }),
  diyProduct({
    id: "siku-ukur-30", sku: "DIY-ALT-UKR30", name: "Penggaris Siku Tukang 30 cm", brand: "Perkakas Lokal", category: "Peralatan",
    price: 32000, cost: 21000, unit: "pcs", stock: 28, safety: 10, weight: 0.2, volume: 0.0005,
    image: "/images/perakitan-kayu.svg", description: "Penggaris siku 90 derajat panjang 30 cm untuk menandai garis potong dan memeriksa kesikuan sambungan furnitur. Periksa ketepatan siku sebelum menandai bahan.",
  }),
  diyProduct({
    id: "cutter-18", sku: "DIY-ALT-CUT18", name: "Cutter Pengunci Bilah 18 mm", brand: "Perkakas Lokal", category: "Peralatan",
    price: 22000, cost: 14000, unit: "pcs", stock: 38, safety: 12, weight: 0.08, volume: 0.0002,
    image: "/images/perbaikan-rumah.svg", description: "Pisau cutter bilah 18 mm dengan pengunci dan 1 bilah terpasang untuk memotong pita, kemasan, atau bahan lembaran tipis yang sesuai. Bukan alat pemotong papan kayu tebal.",
  }),
  diyProduct({
    id: "amplas-p80", sku: "DIY-FIN-AMP80", name: "Amplas Kayu P80 · 5 Lembar", brand: "Perkakas Lokal", category: "Pelapis & Perekat",
    price: 18000, cost: 11000, unit: "pak", stock: 40, safety: 15, weight: 0.12, volume: 0.0002,
    image: "/images/finishing-kayu.svg", description: "Satu pak berisi 5 lembar amplas grit P80, ukuran 23 × 28 cm, untuk pengamplasan awal kayu atau menghilangkan bekas kasar. Lanjutkan ke grit lebih halus; hindari mengamplas berlebihan pada lapisan venir tipis.",
  }),
  diyProduct({
    id: "amplas-p120", sku: "DIY-FIN-AMP120", name: "Amplas Kayu P120 · 5 Lembar", brand: "Perkakas Lokal", category: "Pelapis & Perekat",
    price: 18000, cost: 11000, unit: "pak", stock: 45, safety: 15, weight: 0.12, volume: 0.0002,
    image: "/images/finishing-kayu.svg", description: "Satu pak berisi 5 lembar amplas grit P120, ukuran 23 × 28 cm. Untuk merapikan kayu setelah amplas kasar dan sebelum tahap penghalusan berikutnya. Bersihkan debu sebelum pemberian primer atau pelapis.",
  }),
  diyProduct({
    id: "amplas-p240", sku: "DIY-FIN-AMP240", name: "Amplas Kayu P240 · 5 Lembar", brand: "Perkakas Lokal", category: "Pelapis & Perekat",
    price: 20000, cost: 12500, unit: "pak", stock: 38, safety: 12, weight: 0.1, volume: 0.0002,
    image: "/images/finishing-kayu.svg", description: "Satu pak berisi 5 lembar amplas grit P240, ukuran 23 × 28 cm. Untuk penghalusan akhir kayu atau antar lapisan pelapis jika petunjuk produknya mengizinkan. Bukan pengganti amplas kasar untuk meratakan cacat besar.",
  }),
  diyProduct({
    id: "dempul-kayu", sku: "DIY-FIN-DMP250", name: "Dempul Kayu Berbasis Air 250 Gram", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 28000, cost: 19000, unit: "pot", stock: 32, safety: 10, weight: 0.3, volume: 0.0004,
    image: "/images/finishing-kayu.svg", description: "Dempul kayu berbasis air kemasan 250 gram, warna natural, untuk lubang sekrup kecil dan cacat permukaan furnitur. Keringkan lalu amplas sebelum finishing. Bukan lem sambungan atau pengisi celah struktur; uji kecocokan warna untuk lapisan bening.",
  }),
  diyProduct({
    id: "primer-kayu-air", sku: "DIY-FIN-PRM500", name: "Primer Kayu Berbasis Air 500 ml", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 55000, cost: 39000, unit: "kaleng", stock: 25, safety: 8, weight: 0.65, volume: 0.0009,
    image: "/images/finishing-kayu.svg", description: "Cat dasar kayu berbasis air kemasan 500 ml, warna putih, untuk persiapan permukaan kayu/MDF interior sebelum cat warna berbasis air yang kompatibel. Ikuti pengenceran dan waktu kering kemasan. Bukan cat dasar tembok atau lapisan bening.",
  }),
  diyProduct({
    id: "cat-kayu-air-putih", sku: "DIY-FIN-CKY1L", name: "Cat Kayu Berbasis Air Putih Satin 1 Liter", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 98000, cost: 74000, unit: "kaleng", stock: 30, safety: 10, weight: 1.3, volume: 0.0018,
    image: "/images/finishing-kayu.svg", description: "Cat warna untuk furnitur kayu interior, berbasis air, putih dengan hasil satin, isi 1 liter. Gunakan primer kayu yang kompatibel dan jumlah lapis sesuai kemasan. Menutup serat kayu; berbeda dari pernis bening dan cat tembok. Daya sebar mengikuti label produk.",
  }),
  diyProduct({
    id: "pernis-kayu-air", sku: "DIY-FIN-VRN1L", name: "Pernis Kayu Bening Berbasis Air 1 Liter", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 115000, cost: 86000, unit: "kaleng", stock: 26, safety: 8, weight: 1.2, volume: 0.0018,
    image: "/images/finishing-kayu.svg", description: "Pelapis bening berbasis air untuk furnitur kayu interior, isi 1 liter, hasil satin yang tetap menampilkan serat kayu. Alternatif hasil natural terhadap cat warna, bukan otomatis lapisan wajib di atas cat putih. Uji kecocokan pada sampel dan ikuti label.",
  }),
  diyProduct({
    id: "roller-mini-10", sku: "DIY-FIN-ROL10", name: "Set Roller Mini Busa 10 cm dan Bak", brand: "Perkakas Lokal", category: "Peralatan",
    price: 35000, cost: 23000, unit: "set", stock: 30, safety: 10, weight: 0.2, volume: 0.003,
    image: "/images/finishing-kayu.svg", description: "Satu set berisi gagang roller, 1 roller busa lebar 10 cm, dan bak kecil untuk pelapisan panel atau pintu furnitur dengan cat berbasis air yang sesuai. Periksa anjuran alat aplikasi pada kemasan pelapis.",
  }),
  diyProduct({
    id: "masking-tape-24", sku: "DIY-FIN-TAP24", name: "Masking Tape Kertas 24 mm × 20 Meter", brand: "Perkakas Lokal", category: "Pelapis & Perekat",
    price: 12000, cost: 7500, unit: "rol", stock: 55, safety: 20, weight: 0.07, volume: 0.0002,
    image: "/images/finishing-kayu.svg", description: "Pita kertas masking lebar 24 mm, panjang 20 meter untuk membatasi area pengecatan. Tempel pada permukaan bersih dan kering, uji terlebih dahulu pada lapisan rapuh, lalu lepas sesuai petunjuk.",
  }),
  diyProduct({
    id: "sealant-silikon-netral", sku: "DIY-RPR-SIL300", name: "Sealant Silikon Netral Bening 300 ml", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 45000, cost: 32000, unit: "cartridge", stock: 36, safety: 12, weight: 0.38, volume: 0.0006,
    image: "/images/perbaikan-rumah.svg", description: "Sealant silikon netral bening kemasan cartridge 300 ml untuk celah sambungan nonstruktural pada kaca, keramik, dan permukaan yang kompatibel. Memerlukan pistol sealant terpisah. Umumnya tidak dapat dicat; bukan lem kayu atau pengganti perbaikan sumber kebocoran.",
  }),
  diyProduct({
    id: "pistol-sealant", sku: "DIY-RPR-GUN300", name: "Pistol Sealant Manual untuk Cartridge 300 ml", brand: "Perkakas Lokal", category: "Peralatan",
    price: 38000, cost: 26000, unit: "pcs", stock: 22, safety: 8, weight: 0.4, volume: 0.002,
    image: "/images/perbaikan-rumah.svg", description: "Pistol pendorong manual untuk cartridge sealant standar 300 ml. Membantu mengatur aliran bahan saat mengisi celah. Sealant tidak termasuk; lepaskan tekanan setelah aplikasi agar bahan tidak terus keluar.",
  }),
  diyProduct({
    id: "dempul-dinding", sku: "DIY-RPR-DMP1", name: "Dempul Dinding Interior Siap Pakai 1 kg", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 32000, cost: 22000, unit: "pot", stock: 32, safety: 10, weight: 1.1, volume: 0.0012,
    image: "/images/perbaikan-rumah.svg", description: "Dempul siap pakai 1 kg untuk lubang paku kecil dan cacat dangkal pada dinding interior kering sebelum dicat. Bersihkan area, aplikasikan tipis, keringkan, dan amplas. Bukan untuk retak struktural, area bocor, atau retak yang terus bergerak.",
  }),
  diyProduct({
    id: "kape-4", sku: "DIY-RPR-KAP4", name: "Kape Dempul 4 Inci", brand: "Perkakas Lokal", category: "Peralatan",
    price: 18000, cost: 11000, unit: "pcs", stock: 40, safety: 12, weight: 0.1, volume: 0.0003,
    image: "/images/perbaikan-rumah.svg", description: "Kape bilah lebar 4 inci untuk mengoles dan meratakan dempul pada perbaikan permukaan dinding atau panel. Bersihkan alat setelah dipakai; bukan alat pembongkar atau pahat.",
  }),
  diyProduct({
    id: "compound-gypsum", sku: "DIY-RPR-CMP1", name: "Compound Sambungan Gypsum 1 kg", brand: "Pelapis Lokal", category: "Plafon",
    price: 24000, cost: 16000, unit: "bungkus", stock: 30, safety: 10, weight: 1, volume: 0.001,
    image: "/images/perbaikan-rumah.svg", description: "Bubuk compound gypsum kemasan 1 kg untuk sambungan papan gypsum dan kepala sekrup pada interior kering. Campur sesuai petunjuk kemasan dan gunakan bersama pita sambungan yang sesuai. Bukan mortar dinding luar atau pengisi kerusakan akibat bocor yang belum diperbaiki.",
  }),
  diyProduct({
    id: "pita-sambungan-gypsum", sku: "DIY-RPR-TAPG50", name: "Pita Kertas Sambungan Gypsum 50 mm × 30 Meter", brand: "Material Lokal", category: "Plafon",
    price: 28000, cost: 19000, unit: "rol", stock: 24, safety: 8, weight: 0.18, volume: 0.0004,
    image: "/images/perbaikan-rumah.svg", description: "Pita kertas lebar 50 mm, panjang 30 meter untuk sambungan papan gypsum dengan compound yang kompatibel. Tanam pita dalam lapisan compound dan ratakan mengikuti sistem pemasangan papan. Bukan lakban biasa atau perbaikan retak struktur.",
  }),
  diyProduct({
    id: "pita-butyl", sku: "DIY-RPR-BTL105", name: "Pita Tambal Butyl Aluminium 10 cm × 5 Meter", brand: "Pelapis Lokal", category: "Pelapis & Perekat",
    price: 75000, cost: 54000, unit: "rol", stock: 18, safety: 6, weight: 0.85, volume: 0.001,
    image: "/images/perbaikan-rumah.svg", description: "Pita butyl berlapis aluminium lebar 10 cm, panjang 5 meter untuk penutupan sambungan atau tambalan kecil pada permukaan yang kompatibel. Bersihkan dan keringkan permukaan; identifikasi sumber bocor terlebih dahulu. Bukan pengganti atap rusak atau perbaikan struktur.",
  }),
  diyProduct({
    id: "fischer-6", sku: "DIY-RPR-PLG6", name: "Wall Plug Nilon 6 mm · 100 pcs", brand: "Perkakas Lokal", category: "Paku & Sekrup",
    price: 22000, cost: 14000, unit: "pak", stock: 42, safety: 15, weight: 0.1, volume: 0.0003,
    image: "/images/perbaikan-rumah.svg", description: "Satu pak berisi 100 wall plug nilon nominal 6 mm untuk pasangan dinding padat yang sesuai. Mata bor dan sekrup dipilih menurut petunjuk plug serta bahan dinding; keduanya dijual terpisah. Bukan angkur gypsum, bata ringan khusus, atau pengikat beban berat.",
  }),
  diyProduct({
    id: "mata-bor-beton-6", sku: "DIY-RPR-BORB6", name: "Mata Bor Beton 6 mm · Tangkai Silinder", brand: "Perkakas Lokal", category: "Peralatan",
    price: 20000, cost: 12500, unit: "pcs", stock: 28, safety: 10, weight: 0.03, volume: 0.0001,
    image: "/images/perbaikan-rumah.svg", description: "Mata bor pasangan dinding/beton diameter 6 mm dengan tangkai silinder untuk chuck bor yang sesuai; bukan SDS dan bukan mata bor kayu. Sesuaikan mode bor dengan bahan dinding dan alat. Periksa jalur kabel atau pipa sebelum melubangi dinding.",
  }),
];
