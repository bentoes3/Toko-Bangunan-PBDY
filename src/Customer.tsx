import { useState, useRef, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Search,
  Truck,
  Bike,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Check,
  Download,
  CreditCard,
  Building2,
  Wallet,
  SlidersHorizontal,
  Box,
  ImagePlus,
  Send,
  ScanLine,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Ruler,
  X,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "./store";
import { Modal, ProductCard, Tag, Empty, Quantity, Notice } from "./ui";
import {
  money,
  totals,
  fleetFor,
  fleetOptions,
  deliveryArea,
  conversion,
  estimate,
  statuses,
  type Product,
  type Order,
} from "./domain";
import { orderPDF } from "./documents";
import { initialProducts } from "./data";
import { stockStatus } from "./inventory";
export const categories = [
  "Semua Material",
  ...Array.from(new Set(initialProducts.map((p) => p.category))),
];
const categoryIcons = [
  Box,
  Building2,
  Ruler,
  Wallet,
  ScanLine,
  Truck,
  Bike,
  PackageCheck,
  SlidersHorizontal,
];
export function Home({
  openVisual,
  openAdvisor,
  onDetail,
}: {
  openVisual: () => void;
  openAdvisor: () => void;
  onDetail: (p: Product) => void;
}) {
  const { products } = useStore();
  const [cat, setCat] = useState("Semua Material");
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span /> PARTNER BANGUN & RENOVASI ANDA
          </div>
          <h1>
            Bangun impian.
            <br />
            Mulai dari{" "}
            <span>
              sini.
              <svg viewBox="0 0 210 16">
                <path
                  d="M3 11Q99-4 205 7"
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
          <p>
            Dari pondasi hingga sentuhan akhir, temukan material berkualitas
            untuk setiap sudut rencana Anda.
          </p>
          <div className="hero-actions">
            <a className="btn primary" href="#/katalog">
              Jelajahi Material <ArrowUpRight size={19} />
            </a>
            <button className="btn white" onClick={openAdvisor}>
              <Sparkles size={18} /> Hitung Kebutuhan
            </button>
          </div>
          <div className="hero-assurance">
            <span><PackageCheck size={20} /><strong>{products.filter(p => p.active).length} pilihan produk</strong></span>
            <span className="muted">Untuk bangun baru & renovasi</span>
          </div>
        </div>
        <div className="hero-art">
          <img
            className="hero-house"
            src="/images/hero.jpg"
            alt="Rumah modern dengan material natural dan ruang terbuka"
          />
          <div className="hero-image-shade" />
          <div className="hero-label">
            <span className="dot" /> MATERIAL PILIHAN, HASIL MAKSIMAL
          </div>
          <div className="hero-floating">
            <span className="float-icon">
              <ShieldCheck size={25} />
            </span>
            <div>
              <strong>Kualitas yang bisa diandalkan</strong>
              <p>Material original. Harga transparan.</p>
            </div>
            <CheckCircle2 size={19} />
          </div>
          <div className="hero-index">
            <span>01</span>
            <i /> <span>BUILT TO LAST.</span>
          </div>
        </div>
      </section>
      <div className="container benefits">
        <div>
          <Truck />
          <span>
            <strong>Siap Antar ke Proyek</strong>
            <small>Armada sesuai kebutuhan Anda</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Terjamin Kualitasnya</strong>
            <small>Produk original, merek terpercaya</small>
          </span>
        </div>
        <div>
          <Sparkles />
          <span>
            <strong>Belanja Lebih Cerdas</strong>
            <small>Dibantu asisten renovasi AI</small>
          </span>
        </div>
        <div>
          <PackageCheck />
          <span>
            <strong>Stok & Harga Transparan</strong>
            <small>Rencanakan tanpa khawatir</small>
          </span>
        </div>
      </div>
      <section className="container section categories-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow accent">SEMUA KEBUTUHAN, SATU TEMPAT</span>
            <h2>Mulai dari yang Anda butuhkan</h2>
          </div>
          <a href="#/katalog" className="text-link">
            Semua kategori <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="category-grid">
          {categories.slice(1).map((c, i) => {
            const Icon = categoryIcons[(i + 1) % categoryIcons.length];
            return (
              <a
                key={c}
                href={"#/katalog?category=" + encodeURIComponent(c)}
                className="category-tile"
              >
                <span>
                  <Icon size={28} strokeWidth={1.4} />
                </span>
                <strong>{c}</strong>
                <small>
                  {products.filter((p) => p.category === c && p.active).length}{" "}
                  produk <ArrowUpRight size={12} />
                </small>
              </a>
            );
          })}
        </div>
      </section>
      <section className="container section featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow accent">
              PILIHAN TEPAT UNTUK PROYEK ANDA
            </span>
            <h2>
              Material andalan, kualitas pilihan
              <span className="yellow-dot">.</span>
            </h2>
          </div>
          <a href="#/katalog" className="text-link">
            Lihat semua produk <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="category-tabs">
          {categories.slice(0, 6).map((c) => (
            <button
              key={c}
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {products
            .filter(
              (p) =>
                p.active && (cat === "Semua Material" || p.category === cat),
            )
            .slice(0, 4)
            .map((p) => (
              <ProductCard p={p} key={p.id} onDetail={onDetail} />
            ))}
        </div>
      </section>
      <section className="container ai-banner">
        <div className="ai-illustration">
          <ScanLine size={64} strokeWidth={1} />
          <span className="ai-scan">AI</span>
          <span className="scan-bracket tl" />
          <span className="scan-bracket br" />
        </div>
        <div>
          <span className="eyebrow">KENALI MATERIAL DENGAN SATU FOTO</span>
          <h2>Tahu bentuknya, belum tahu namanya?</h2>
          <p>
            Foto material Anda. Temukan produk yang sesuai dengan pencarian
            visual AI.
          </p>
        </div>
        <button className="btn dark-btn" onClick={openVisual}>
          <Camera size={18} /> Coba Cari via Foto <ArrowUpRight size={18} />
        </button>
      </section>
      <section className="container renovation">
        <div>
          <span className="eyebrow accent">RENCANA KECIL, PERUBAHAN BESAR</span>
          <h2>
            Renovasi lebih terencana.
            <br />
            Belanja secukupnya.
          </h2>
          <p>
            Tak perlu menebak berapa banyak cat atau keramik yang dibutuhkan.
            Ceritakan rencana Anda, asisten kami bantu menghitungnya.
          </p>
          <button className="btn primary" onClick={openAdvisor}>
            Konsultasi Renovasi <Sparkles size={18} />
          </button>
        </div>
        <div className="renovation-note">
          <span className="note-label">
            <Sparkles size={18} /> ASISTEN RENOVASI PB.DY
          </span>
          <div className="mock-bubble">
            Mau cat ulang ruang keluarga 4 × 3 meter 🎨
          </div>
          <div className="mock-answer">
            <span className="mini-ai">
              <Sparkles size={17} />
            </span>
            <div>
              <strong>Siap, mari kita hitung!</strong>
              <p>
                Dengan tinggi 3 meter dan 2 lapis cat, Anda membutuhkan sekitar{" "}
                <b>2 kaleng cat 5 liter.</b>
              </p>
              <small>Sudah termasuk cadangan 10% ✓</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function Catalog({
  onDetail,
  openVisual,
}: {
  onDetail: (p: Product) => void;
  openVisual: () => void;
}) {
  const { products } = useStore();
  const params = new URLSearchParams(location.hash.split("?")[1]);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(
    params.get("category") || "Semua Material",
  );
  const [sort, setSort] = useState("popular");
  const [limit, setLimit] = useState("all");
  const [unit, setUnit] = useState("all");
  const list = products
    .filter(
      (p) =>
        p.active &&
        (category === "Semua Material" || p.category === category) &&
        `${p.name} ${p.brand} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (limit === "all" || p.price <= Number(limit)) &&
        (unit === "all" || p.units.some((u) => u.name === unit)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : b.sold - a.sold,
    );
  return (
    <div className="container page">
      <div className="breadcrumb">
        <a href="#/">Beranda</a>
        <ChevronRight size={14} />
        Katalog Material
      </div>
      <div className="page-title">
        <div>
          <span className="eyebrow accent">
            MATERIAL TERBAIK, PROYEK TERBAIK
          </span>
          <h1>
            Katalog Material<span className="yellow-dot">.</span>
          </h1>
          <p>Temukan bahan yang tepat untuk setiap rencana Anda.</p>
        </div>
        <button className="btn white" onClick={openVisual}>
          <Camera size={19} /> Cari via Foto
        </button>
      </div>
      <div className="catalog-layout">
        <aside className="filters panel">
          <h3>
            <SlidersHorizontal size={17} /> Filter produk
          </h3>
          <label>Kategori</label>
          <div className="filter-categories">
            {categories.map((c) => (
              <button
                key={c}
                className={c === category ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
                <span>
                  {c === "Semua Material"
                    ? products.filter((p) => p.active).length
                    : products.filter((p) => p.active && p.category === c)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <label htmlFor="price-filter">Harga per satuan dasar</label>
          <select
            id="price-filter"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          >
            <option value="all">Semua harga</option>
            <option value="50000">Di bawah Rp50.000</option>
            <option value="100000">Di bawah Rp100.000</option>
            <option value="250000">Di bawah Rp250.000</option>
          </select>
          <label htmlFor="unit-filter">Satuan</label>
          <select
            id="unit-filter"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="all">Semua satuan</option>
            {Array.from(
              new Set(products.flatMap((p) => p.units.map((u) => u.name))),
            ).map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <button
            className="text-link filter-reset"
            onClick={() => {
              setCategory(categories[0]);
              setLimit("all");
              setUnit("all");
              setQuery("");
            }}
          >
            <RotateCcw size={14} /> Reset filter
          </button>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Cari material"
                placeholder="Cari semen, cat, pipa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  aria-label="Hapus pencarian"
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              aria-label="Urutkan produk"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Paling populer</option>
              <option value="low">Harga terendah</option>
              <option value="high">Harga tertinggi</option>
            </select>
          </div>
          <p className="result-count">
            Menampilkan <strong>{list.length} produk</strong>{" "}
            {category !== "Semua Material" && `dalam ${category}`}
          </p>
          <div className="product-grid catalog-grid">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} onDetail={onDetail} />
            ))}
          </div>
          {!list.length && (
            <Empty
              title="Produk tidak ditemukan"
              detail="Coba kata kunci lain atau hapus filter untuk melihat lebih banyak material."
              action={
                <button
                  className="btn primary"
                  onClick={() => {
                    setQuery("");
                    setCategory(categories[0]);
                    setLimit("all");
                    setUnit("all");
                  }}
                >
                  Lihat semua material
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
export function ProductDetail({
  p,
  onClose,
}: {
  p: Product;
  onClose: () => void;
}) {
  const { add, products } = useStore();
  const current = products.find((x) => x.id === p.id) || p;
  const [unit, setUnit] = useState(p.unit);
  const [qty, setQty] = useState(1);
  const factor = conversion(p, unit);
  return (
    <Modal title="Detail Material" onClose={onClose} wide>
      <div className="detail-grid">
        <img className="detail-photo" src={p.image} alt={p.name} />
        <div>
          <Tag tone="yellow">{p.category}</Tag>
          <h2>{p.name}</h2>
          <p className="muted">
            {p.brand} · SKU {p.sku}
          </p>
          <h2 className="detail-price">
            {money(p.price * factor)} <small>/ {unit}</small>
          </h2>
          <p>{p.description}</p>
          <div className="stock">
            <span className={"dot stock-" + stockStatus(current).id} />
            {current.stock <= 0 ? "Stok habis" : `Stok: ${current.stock} ${p.unit}`}
          </div>
          <label htmlFor="detail-unit">Pilih satuan</label>
          <select
            id="detail-unit"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setQty(1);
            }}
          >
            {p.units.map((u) => (
              <option key={u.name}>{u.name}</option>
            ))}
          </select>
          <p className="muted small">
            1 {unit} = {factor} {p.unit} ·{" "}
            {(p.weight * factor).toLocaleString("id-ID")} kg
          </p>
          <div className="detail-cart">
            <Quantity
              value={qty}
              max={Math.floor(current.stock / factor)}
              onChange={setQty}
            />
            <button
              className="btn primary"
              disabled={current.stock < factor}
              onClick={() => {
                if (add(current, unit, qty)) onClose();
              }}
            >
              <Plus size={18} /> Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
export function Cart() {
  const { cart, products, setCart, updateCart } = useStore();
  const t = totals(cart, products),
    fleet = fleetFor(t.weight, t.volume);
  return (
    <div className="container page">
      <div className="breadcrumb">
        <a href="#/">Beranda</a>
        <ChevronRight size={14} />
        Keranjang
      </div>
      <div className="page-title">
        <div>
          <h1>
            Keranjang Belanja<span className="yellow-dot">.</span>
          </h1>
          <p>{cart.length} pilihan material untuk rencana Anda.</p>
        </div>
        <a href="#/katalog" className="text-link">
          Lanjut belanja <ArrowRight size={17} />
        </a>
      </div>
      {cart.length ? (
        <div className="checkout-layout">
          <div className="panel cart-list">
            {cart.map((item, index) => {
              const p = products.find((p) => p.id === item.productId)!;
              return (
                <div className="cart-row" key={p.id + item.unit}>
                  <img src={p.image} alt={p.name} />
                  <div className="cart-description">
                    <h3>{p.name}</h3>
                    <span>
                      {money(p.price * conversion(p, item.unit))} / {item.unit}
                    </span>
                    <select
                      aria-label={"Satuan " + p.name}
                      value={item.unit}
                      onChange={(e) =>
                        updateCart(index, item.quantity, e.target.value)
                      }
                    >
                      {p.units.map((u) => (
                        <option key={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cart-quantity">
                    <Quantity
                      value={item.quantity}
                      onChange={(n) => updateCart(index, n)}
                    />
                    <strong>
                      {money(
                        item.quantity * p.price * conversion(p, item.unit),
                      )}
                    </strong>
                  </div>
                  <button
                    className="icon-button muted"
                    aria-label={"Hapus " + p.name}
                    onClick={() =>
                      setCart((c) => c.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
          <aside className="panel summary">
            <h3>Ringkasan belanja</h3>
            <div>
              <span>Subtotal material</span>
              <strong>{money(t.subtotal)}</strong>
            </div>
            <div>
              <span>Estimasi pengiriman</span>
              <strong>{money(fleet.fee)}</strong>
            </div>
            <div className="fleet-note">
              <Truck size={24} />
              <span>
                <strong>
                  {fleet.name}
                  {fleet.trips > 1 ? ` · ${fleet.trips} perjalanan` : ""}
                </strong>
                <small>
                  {t.weight.toLocaleString("id-ID")} kg · {t.volume.toFixed(2)}{" "}
                  m³
                </small>
              </span>
              <Tag>Otomatis</Tag>
            </div>
            <div className="summary-total">
              <span>Total estimasi</span>
              <strong>{money(t.subtotal + fleet.fee)}</strong>
            </div>
            <a href="#/checkout" className="btn primary full">
              Lanjut ke Checkout <ArrowRight size={18} />
            </a>
            <p className="small muted center">
              <ShieldCheck size={14} /> Pembayaran simulasi, tanpa transaksi
              nyata
            </p>
          </aside>
        </div>
      ) : (
        <Empty
          title="Keranjang Anda masih kosong"
          detail="Material berkualitas untuk proyek berikutnya menanti Anda."
          action={
            <a href="#/katalog" className="btn primary">
              Jelajahi Material <ArrowRight size={17} />
            </a>
          }
        />
      )}
    </div>
  );
}
export function Checkout() {
  const { cart, products, placeOrder } = useStore();
  const [method, setMethod] = useState("Transfer Bank");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFleet, setSelectedFleet] = useState<string | null>(null);
  const t = totals(cart, products);
  const options = fleetOptions(t.weight, t.volume, address || "Bogor");
  const recommended = fleetFor(t.weight, t.volume, address || "Bogor");
  const fleet = options.find((option) => option.name === selectedFleet && option.available) || recommended;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (method === "Transfer Bank" && !paid) {
      setError("Simulasikan pembayaran transfer terlebih dahulu.");
      return;
    }
    const o: Order = {
      id: "PB-" + Date.now().toString().slice(-9),
      date: new Date().toISOString(),
      name: String(fd.get("name")),
      phone: String(fd.get("phone")),
      address: String(fd.get("address")),
      payment: method,
      paid: method === "Transfer Bank",
      status: 0,
      items: cart.map((i) => {
        const p = products.find((p) => p.id === i.productId)!;
        return {
          ...i,
          name: p.name,
          price: p.price,
          cost: p.cost,
          factor: conversion(p, i.unit),
        };
      }),
      subtotal: t.subtotal,
      shipping: fleet.fee,
      total: t.subtotal + fleet.fee,
      fleet:
        fleet.name + (fleet.trips > 1 ? ` (${fleet.trips} perjalanan)` : ""),
      driver: "Belum ditugaskan",
      eta: "Menunggu penjadwalan admin",
      note: String(fd.get("note") || ""),
    };
    if (placeOrder(o)) location.hash = "/pesanan?id=" + o.id;
  }
  if (!cart.length)
    return (
      <div className="container page">
        <Empty
          title="Belum ada material di keranjang"
          detail="Pilih material sebelum melanjutkan checkout."
          action={
            <a className="btn primary" href="#/katalog">
              Buka katalog
            </a>
          }
        />
      </div>
    );
  return (
    <div className="container page">
      <div className="breadcrumb">
        <a href="#/keranjang">Keranjang</a>
        <ChevronRight size={14} />
        Checkout
      </div>
      <div className="page-title">
        <div>
          <h1>
            Satu langkah lebih dekat<span className="yellow-dot">.</span>
          </h1>
          <p>Lengkapi pengiriman dan pilih cara pembayaran Anda.</p>
        </div>
        <Tag tone="yellow">Checkout simulasi</Tag>
      </div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="stack">
          <section className="panel form-panel">
            <h3>
              <span className="step-number">1</span> Alamat pengiriman
            </h3>
            <div className="form-grid">
              <label>
                Nama penerima
                <input
                  name="name"
                  required
                  placeholder="Nama lengkap"
                  defaultValue="Pak Joko"
                />
              </label>
              <label>
                Nomor telepon
                <input
                  name="phone"
                  required
                  type="tel"
                  pattern="[+0-9 ]{9,18}"
                  placeholder="08xxxxxxxxxx"
                  defaultValue="081234567890"
                />
              </label>
              <label className="span-2">
                Alamat lengkap proyek
                <textarea
                  name="address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setPaid(false);
                    setError("");
                  }}
                  minLength={12}
                  required
                  placeholder="Jalan, nomor, kelurahan, kecamatan, Kabupaten Bogor"
                />
              </label>
              <label className="span-2">
                Catatan pengiriman <span className="muted">(opsional)</span>
                <input
                  name="note"
                  placeholder="Patokan lokasi atau akses armada"
                />
              </label>
            </div>
          </section>
          <section className="panel form-panel">
            <h3>
              <span className="step-number">2</span> Armada rekomendasi
            </h3>
            <div className="fleet-options" role="radiogroup" aria-label="Pilihan armada pengiriman">
              {options.map((option) => (
                <label key={option.name} className={"fleet-selected fleet-option " + (fleet.name === option.name ? "is-selected" : "") + (!option.available ? " unavailable" : "")}>
                  <input type="radio" name="fleet" value={option.name}
                    aria-label={option.name} checked={fleet.name === option.name}
                    disabled={!option.available}
                    onChange={() => { setSelectedFleet(option.name); setPaid(false); setError(""); }} />
                  {option.name === "Motor Boks" ? <Bike size={28} /> : <Truck size={28} />}
                  <div>
                    <strong>{option.name}</strong>
                    {option.name === recommended.name && <span className="fleet-badge">Direkomendasikan</span>}
                    <p>Kapasitas {option.capacity.toLocaleString("id-ID")} kg / {option.space} m³ per perjalanan</p>
                    {option.name === "Motor Boks" && <small>Motor dengan boks penyimpanan untuk barang kecil.</small>}
                    {!option.available ? <small>Muatan melebihi kapasitas armada ini.</small> : <small>{money(option.fee)}{option.trips > 1 ? ` · ${option.trips} perjalanan` : " / pengiriman"}</small>}
                  </div>
                  {fleet.name === option.name && <CheckCircle2 className="green-text" size={20} />}
                </label>
              ))}
            </div>
            <p className="small muted">
              Muatan Anda: {t.weight.toLocaleString("id-ID")} kg · {t.volume.toFixed(2)} m³.
              {address.trim() ? ` Tujuan: ${deliveryArea(address)}.` : " Isi alamat untuk menghitung ongkir. Tarif sementara: Bogor."}
              {" "}Alamat yang mencantumkan “Bogor” memakai tarif Bogor; alamat lainnya memakai tarif luar Bogor.
              Motor: Rp20.000 / Rp50.000. Pikap: Rp50.000 / Rp70.000 (Bogor / luar Bogor).
              Tarif truk tetap per perjalanan. Rekomendasi mengikuti berat dan volume; Anda dapat memilih armada lain yang sesuai.
            </p>
          </section>
          <section className="panel form-panel">
            <h3>
              <span className="step-number">3</span> Metode pembayaran
            </h3>
            <div className="payment-methods">
              {[
                {
                  name: "Transfer Bank",
                  icon: CreditCard,
                  desc: "BCA · Pembayaran virtual",
                },
                { name: "COD", icon: Wallet, desc: "Bayar saat material tiba" },
                {
                  name: "Termin Proyek",
                  icon: Building2,
                  desc: "Jatuh tempo 30 hari",
                },
              ].map((m) => (
                <button
                  type="button"
                  className={method === m.name ? "selected" : ""}
                  key={m.name}
                  onClick={() => {
                    setMethod(m.name);
                    setError("");
                  }}
                >
                  <m.icon size={22} />
                  <span>
                    <strong>{m.name}</strong>
                    <small>{m.desc}</small>
                  </span>
                  {method === m.name && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
            {method === "Transfer Bank" && (
              <div className="mock-payment">
                <p>
                  Virtual Account simulasi <strong>8800 1234 5678</strong>
                </p>
                <button
                  type="button"
                  className={"btn " + (paid ? "white" : "primary")}
                  disabled={paid}
                  onClick={() => {
                    setPaid(true);
                    setError("");
                  }}
                >
                  {paid ? (
                    <>
                      <Check size={17} /> Pembayaran berhasil disimulasikan
                    </>
                  ) : (
                    <>Simulasikan Bayar {money(t.subtotal + fleet.fee)}</>
                  )}
                </button>
              </div>
            )}
            {method === "Termin Proyek" && (
              <Notice>
                Termin simulasi 30 hari tersedia untuk pelanggan proyek. Tidak
                ada kredit atau tagihan nyata.
              </Notice>
            )}
          </section>
        </div>
        <aside className="panel summary">
          <h3>Pesanan Anda</h3>
          {cart.map((i, n) => {
            const p = products.find((p) => p.id === i.productId)!;
            return (
              <div className="checkout-line" key={n}>
                <span>
                  {p.name}
                  <small>
                    {i.quantity} {i.unit}
                  </small>
                </span>
                <strong>
                  {money(i.quantity * p.price * conversion(p, i.unit))}
                </strong>
              </div>
            );
          })}
          <div>
            <span>Pengiriman</span>
            <strong>{money(fleet.fee)}</strong>
          </div>
          <div className="summary-total">
            <span>Total pembayaran</span>
            <strong>{money(t.subtotal + fleet.fee)}</strong>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary full" type="submit">
            Buat Pesanan <ArrowRight size={18} />
          </button>
          <p className="small muted center">
            Semua pembayaran adalah simulasi.
          </p>
        </aside>
      </form>
    </div>
  );
}
export function Orders() {
  const { orders } = useStore();
  const [selected, setSelected] = useState(
    new URLSearchParams(location.hash.split("?")[1]).get("id") ||
      orders[0]?.id ||
      "",
  );
  const o = orders.find((o) => o.id === selected);
  return (
    <div className="container page">
      <div className="page-title">
        <div>
          <span className="eyebrow accent">
            SETIAP LANGKAH, TETAP TERHUBUNG
          </span>
          <h1>
            Pesanan Saya<span className="yellow-dot">.</span>
          </h1>
          <p>Pantau perjalanan material sampai ke proyek Anda.</p>
        </div>
        <Tag tone="yellow">Data demo bersama</Tag>
      </div>
      {!orders.length ? (
        <Empty
          title="Belum ada pesanan"
          detail="Pesanan yang Anda buat akan tampil di sini."
        />
      ) : (
        <div className="orders-layout">
          <aside className="order-list">
            {orders.map((order) => (
              <button
                className={
                  "panel order-tab " + (order.id === selected ? "active" : "")
                }
                key={order.id}
                onClick={() => setSelected(order.id)}
              >
                <div>
                  <strong>{order.id}</strong>
                  <Tag tone={order.status === 3 ? "green" : "yellow"}>
                    {statuses[order.status]}
                  </Tag>
                </div>
                <p>
                  {new Date(order.date).toLocaleDateString("id-ID")} ·{" "}
                  {order.name}
                </p>
                <strong>{money(order.total)}</strong>
              </button>
            ))}
          </aside>
          {o && (
            <section className="panel order-detail">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">DETAIL PESANAN</span>
                  <h2>{o.id}</h2>
                </div>
                <Tag tone={o.paid ? "green" : "yellow"}>
                  {o.paid
                    ? "Lunas (simulasi)"
                    : o.payment === "COD"
                      ? "Bayar di tempat"
                      : "Termin 30 hari"}
                </Tag>
              </div>
              <div className="tracking">
                {statuses.map((s, i) => (
                  <div key={s} className={i <= o.status ? "done" : ""}>
                    <span>{i <= o.status ? <Check size={18} /> : i + 1}</span>
                    <strong>{s}</strong>
                  </div>
                ))}
              </div>
              <div className="delivery-box">
                <Truck size={30} />
                <div>
                  <strong>
                    {o.fleet} · {o.driver}
                  </strong>
                  <p>
                    {o.status === 2 ? "Dalam perjalanan · " : ""}
                    {o.status === 3 ? "Material telah diterima." : o.eta}
                  </p>
                </div>
              </div>
              <div className="address-box">
                <MapPin size={18} />
                <div>
                  <strong>
                    {o.name} · {o.phone}
                  </strong>
                  <p>{o.address}</p>
                  {o.note && <small>Catatan: {o.note}</small>}
                </div>
              </div>
              {o.items.map((i, n) => (
                <div className="order-item" key={n}>
                  <span>
                    {i.name}
                    <small>
                      {i.quantity} {i.unit}
                    </small>
                  </span>
                  <strong>{money(i.quantity * i.factor * i.price)}</strong>
                </div>
              ))}
              <div className="order-item">
                <span>Ongkir</span>
                <strong>{money(o.shipping)}</strong>
              </div>
              <div className="order-item total">
                <strong>Total</strong>
                <strong>{money(o.total)}</strong>
              </div>
              <div className="document-buttons">
                <button
                  className="btn white"
                  onClick={() => orderPDF(o, "Faktur")}
                >
                  <Download size={17} /> Unduh Faktur
                </button>
                <button
                  className="btn white"
                  disabled={o.status < 2}
                  onClick={() => orderPDF(o, "Surat Jalan")}
                >
                  <Download size={17} /> Surat Jalan
                </button>
              </div>
              {o.status < 2 && (
                <p className="small muted">
                  Surat jalan tersedia saat pesanan dikirim.
                </p>
              )}
              <p className="small muted">
                Status diperbarui oleh admin dan tersinkron di browser ini.
                Pesanan contoh milik Pak Joko tersedia untuk demonstrasi.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
