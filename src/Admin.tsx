import { useState, type FormEvent, type ReactNode } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ScanLine,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  TriangleAlert,
  Download,
  Truck,
  Check,
  Edit3,
  ImagePlus,
  LoaderCircle,
  FileText,
  Calendar,
  Wallet,
  Box,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Menu,
  X,
  Sun,
  Moon,
  Settings2,
  ClipboardList,
} from "lucide-react";
import { useStore } from "./store";
import { Logo, Modal, Tag, Empty, Notice } from "./ui";
import {
  money,
  forecast,
  statuses,
  type Product,
  type Supplier,
  type Purchase,
} from "./domain";
import { purchasePDF, orderPDF } from "./documents";
import { readImage } from "./AI";
import { groupInventory, stockStatus } from "./inventory";
import { initialProducts } from "./data";
export const adminLinks = [
  { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { id: "produk", label: "Produk", icon: Box },
  { id: "stok", label: "Inventaris Stok", icon: Package },
  { id: "pesanan", label: "Pesanan", icon: ShoppingBag },
  { id: "supplier", label: "Supplier & Pembelian", icon: Users },
  { id: "forecast", label: "Demand Forecasting", icon: TrendingUp },
  { id: "invoice", label: "Ekstraksi Nota AI", icon: ScanLine },
];
export function AdminLogin() {
  const { login, dark, setDark } = useStore();
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (login(String(f.get("username")), String(f.get("password"))))
      location.hash = "/admin/dashboard";
    else setError("Username atau password tidak sesuai. Silakan coba lagi.");
  }
  return (
    <div className="login-page">
      <div className="login-art">
        <Logo />
        <div>
          <span className="eyebrow">BACKOFFICE PB.DY</span>
          <h1>
            Rencana besar.
            <br />
            Operasional rapi.
          </h1>
          <p>
            Satu ruang kerja untuk mengelola material, pesanan, dan pertumbuhan
            bisnis Anda.
          </p>
        </div>
        <small>Partner bangun & renovasi sejak 2020.</small>
      </div>
      <div className="login-form">
        <button
          className="icon-button login-theme"
          aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <a className="text-link" href="#/">
          ← Kembali ke toko
        </a>
        <div className="login-card">
          <span className="ai-icon">
            <ShieldCheck size={29} />
          </span>
          <h1>Selamat datang kembali.</h1>
          <p className="muted">Masuk ke ruang kerja operasional PB.DY.</p>
          <form onSubmit={submit}>
            <label>
              Username
              <input
                name="username"
                autoComplete="username"
                required
                placeholder="Masukkan username"
              />
            </label>
            <label>
              Password
              <div className="password-input">
                <input
                  name="password"
                  aria-label="Password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Masukkan password"
                />
                <button
                  className="icon-button"
                  type="button"
                  aria-label={
                    show ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary full">
              Masuk ke Dashboard <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Akses demo admin</strong>
            <p>
              Username: <code>admin_pbdy</code>
              <br />
              Password: <code>adminpassword123</code>
            </p>
            <button
              className="text-link"
              onClick={() => {
                login("admin_pbdy", "adminpassword123");
                location.hash = "/admin/dashboard";
              }}
            >
              Gunakan akun demo <ArrowUpRight size={15} />
            </button>
          </div>
          <p className="small muted">
            Autentikasi simulasi di browser. Bukan sistem keamanan produksi.
          </p>
        </div>
      </div>
    </div>
  );
}
export function AdminShell({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const { logout, dark, setDark, products } = useStore();
  const [menu, setMenu] = useState(false);
  const low = products.filter((p) => p.active && stockStatus(p).id !== "safe").length;
  return (
    <div className="admin-shell">
      <aside className={"admin-sidebar " + (menu ? "open" : "")}>
        <div className="sidebar-logo">
          <Logo small />
          <button
            className="icon-button mobile-only"
            aria-label="Tutup menu"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>
        <span className="workspace-label">RUANG KERJA</span>
        <nav>
          {adminLinks.map((l) => (
            <a
              href={"#/admin/" + l.id}
              key={l.id}
              onClick={() => setMenu(false)}
              className={page === l.id ? "active" : ""}
            >
              <l.icon size={19} />
              <span>{l.label}</span>
              {l.id === "stok" && low > 0 && <b>{low}</b>}
              {(l.id === "forecast" || l.id === "invoice") && <small>AI</small>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="owner-note">
            <span>B</span>
            <div>
              <strong>Bima</strong>
              <small>Owner · PB.DY</small>
              <p>Ruang kerja simulasi</p>
            </div>
          </div>
          <a className="text-link" href="#/">
            Lihat toko <ArrowUpRight size={15} />
          </a>
          <button
            className="sidebar-logout"
            onClick={() => {
              logout();
              location.hash = "/admin";
            }}
          >
            <LogOut size={17} /> Keluar akun
          </button>
        </div>
      </aside>
      {menu && <div className="sidebar-scrim" onClick={() => setMenu(false)} />}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <button
              className="icon-button mobile-only"
              aria-label="Buka menu admin"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span className="muted">Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {adminLinks.find((l) => l.id === page)?.label || "Ringkasan"}
            </strong>
          </div>
          <div>
            <button
              className="icon-button"
              aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <a
              href="#/admin/stok"
              className="admin-alert"
              aria-label={low + " produk perlu perhatian stok"}
            >
              <TriangleAlert size={19} />
              <span>{low}</span>
            </a>
            <span className="admin-avatar">S</span>
            <span className="admin-user">
              <strong>Seta</strong>
              <small>Administrator</small>
            </span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          © {new Date().getFullYear()} PB.DY · Operasional lebih terencana.
          <span>Mode simulasi · Data tersimpan di browser</span>
        </footer>
      </div>
    </div>
  );
}
function AdminTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title admin-title">
      <div>
        {eyebrow && <span className="eyebrow accent">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
const baseHistory = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  revenue: 2200000 + ((i * 1723) % 3700) * 1000,
  orders: 7 + ((i * 3) % 11),
}));
export function Dashboard() {
  const { orders, products } = useStore();
  const [period, setPeriod] = useState("month");
  const low = products
    .filter((p) => p.active && stockStatus(p).id !== "safe")
    .sort((a, b) => a.stock - b.stock);
  const emptyCount = low.filter((p) => stockStatus(p).id === "empty").length;
  const restockCount = low.length - emptyCount;
  const hist = period === "month" ? baseHistory : baseHistory.slice(-7);
  const demoRevenue = hist.reduce((s, i) => s + i.revenue, 0);
  const actualRevenue = orders.reduce((s, o) => s + o.subtotal, 0);
  const revenue = demoRevenue + actualRevenue;
  const profit =
    demoRevenue * 0.22 +
    orders.reduce(
      (s, o) =>
        s +
        o.items.reduce(
          (a, i) => a + (i.price - i.cost) * i.quantity * i.factor,
          0,
        ),
      0,
    );
  const cards = [
    {
      label: period === "month" ? "Omzet 30 hari" : "Omzet 7 hari",
      value: money(revenue),
      change: "Termasuk pesanan terbaru",
      icon: Wallet,
    },
    {
      label: "Pesanan diterima",
      value: String(hist.reduce((s, i) => s + i.orders, 0) + orders.length),
      change: `${orders.filter((o) => o.status < 3).length} pesanan aktif`,
      icon: ShoppingBag,
    },
    {
      label: "Estimasi laba kotor",
      value: money(profit),
      change: `Margin ${((profit / revenue) * 100).toFixed(1)}%`,
      icon: TrendingUp,
    },
    {
      label: "Produk aktif",
      value: String(products.filter((p) => p.active).length),
      change: `${restockCount} perlu restock · ${emptyCount} kosong`,
      icon: Package,
    },
  ];
  return (
    <>
      <AdminTitle
        eyebrow="OVERVIEW BISNIS"
        title="Selamat bekerja, Seta 👋"
        description="Berikut perkembangan toko Anda. Semua dalam satu pandangan."
        action={
          <select
            aria-label="Periode analitik"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">30 hari terakhir</option>
            <option value="week">7 hari terakhir</option>
          </select>
        }
      />
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="panel stat-card" key={c.label}>
            <div>
              <span>{c.label}</span>
              <c.icon size={19} />
            </div>
            <strong>{c.value}</strong>
            <small
              className={i === 3 && low.length ? (emptyCount ? "red-text" : "amber-text") : "green-text"}
            >
              {i === 3 && low.length ? (
                <TriangleAlert size={13} />
              ) : (
                <ArrowUpRight size={13} />
              )}{" "}
              {c.change}
            </small>
          </div>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="section-heading">
            <div>
              <h3>Performa penjualan</h3>
              <p className="muted small">Omzet material dalam jutaan Rupiah</p>
            </div>
            <Tag tone="yellow">
              {period === "month" ? "Bulanan" : "Mingguan"}
            </Tag>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hist}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5b924" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f5b924" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 5"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={14}
                  tickFormatter={(v) => String(v)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={14}
                  tickFormatter={(v) => `${v / 1000000}jt`}
                  width={44}
                />
                <Tooltip
                  formatter={(v: number) => [money(v), "Omzet"]}
                  labelFormatter={(l) => `Hari ke-${l}`}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dfaa19"
                  strokeWidth={2.5}
                  fill="url(#revenue-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="small muted">
            Grafik: riwayat contoh terstruktur. Kartu ringkasan menjumlahkan
            riwayat contoh dan transaksi simulasi baru.
          </p>
        </section>
        <section className="panel low-panel">
          <div className="section-heading">
            <h3>Perlu perhatian</h3>
            <span className="alert-count">{low.length}</span>
          </div>
          <p className="small muted">
            {restockCount} perlu restock · {emptyCount} kosong
          </p>
          {low.slice(0, 5).map((p) => (
            <div className="low-item" key={p.id}>
              <span className={"low-icon stock-" + stockStatus(p).id}>
                <Package size={20} />
              </span>
              <div>
                <strong>{p.name}</strong>
                <small>
                  <span className={stockStatus(p).textClass}>
                    {p.stock} {p.unit}
                  </span>{" "}
                  · Minimum {p.safety}
                </small>
                <Tag tone={stockStatus(p).tone}>{stockStatus(p).label}</Tag>
              </div>
              <a href="#/admin/stok" aria-label={"Restock " + p.name}>
                <ArrowUpRight size={18} />
              </a>
            </div>
          ))}
          {!low.length && (
            <p className="green-text">Seluruh stok dalam batas aman.</p>
          )}
          <a href="#/admin/stok" className="btn white full">
            Kelola inventaris <ArrowRightIcon />
          </a>
          <div className="insight">
            <Sparkles size={20} />
            <strong>Rencanakan stok lebih awal</strong>
            <p>
              Lihat proyeksi kebutuhan 30 hari dan rekomendasi pembelian Anda.
            </p>
            <a href="#/admin/forecast">
              Buka forecasting <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </div>
      <div className="analytics-bottom">
        <section className="panel table-panel">
          <div className="section-heading">
            <h3>Pergerakan produk</h3>
            <Tag tone="yellow">Data demo 30 hari</Tag>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Terjual</th>
                  <th>Pergerakan</th>
                  <th>Omzet material</th>
                </tr>
              </thead>
              <tbody>
                {[...products]
                  .sort((a, b) => b.sold - a.sold)
                  .slice(0, 5)
                  .concat(
                    [...products].sort((a, b) => a.sold - b.sold).slice(0, 1),
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small>{p.category}</small>
                      </td>
                      <td>
                        {p.sold} {p.unit}
                      </td>
                      <td>
                        <Tag tone={p.sold > 100 ? "green" : "yellow"}>
                          {p.sold > 100 ? "Fast moving" : "Slow moving"}
                        </Tag>
                      </td>
                      <td>{money(p.sold * p.price)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel table-panel">
          <div className="section-heading">
            <h3>Pesanan terbaru</h3>
            <a className="text-link" href="#/admin/pesanan">
              Lihat <ArrowUpRight size={14} />
            </a>
          </div>
          {orders.slice(0, 4).map((o) => (
            <a href="#/admin/pesanan" className="recent-order" key={o.id}>
              <div>
                <strong>{o.name}</strong>
                <small>{o.id}</small>
              </div>
              <div>
                <strong>{money(o.total)}</strong>
                <Tag tone={o.status === 3 ? "green" : "yellow"}>
                  {statuses[o.status]}
                </Tag>
              </div>
            </a>
          ))}
        </section>
      </div>
    </>
  );
}
function ArrowRightIcon() {
  return <ChevronRight size={17} />;
}
export function Inventory({ manage = false }: { manage?: boolean }) {
  const { products, setProducts, movements, setMovements, notify } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [po, setPo] = useState<Product | null>(null);
  const [edit, setEdit] = useState<Product | null | undefined>(undefined);
  const [adjust, setAdjust] = useState<Product | null>(null);
  const list = products.filter(
    (p) =>
      `${p.name} ${p.sku} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase()) &&
      (category === "all" || p.category === category) &&
      (filter === "all" || (filter === "active" ? p.active : stockStatus(p).id === filter)),
  );
  const groups = groupInventory(list);
  const categories = [...new Set(products.map((p) => p.category))];
  const counts = {
    safe: products.filter((p) => stockStatus(p).id === "safe").length,
    low: products.filter((p) => stockStatus(p).id === "low").length,
    empty: products.filter((p) => stockStatus(p).id === "empty").length,
  };
  return (
    <>
      <AdminTitle
        eyebrow="MATERIAL & GUDANG"
        title={manage ? "Manajemen Produk" : "Inventaris Stok"}
        description={
          manage
            ? "Kelola detail, harga, dan ketersediaan katalog Anda."
            : "Periksa stok per jenis material, lalu rencanakan pembelian dengan mudah."
        }
        action={
          manage ? (
            <button className="btn primary" onClick={() => setEdit(null)}>
              <Plus size={18} /> Tambah Produk
            </button>
          ) : (
            <a className="btn primary" href="#/admin/invoice">
              <ScanLine size={18} /> Barang Masuk via Nota
            </a>
          )
        }
      />
      <div className="mini-stats inventory-stats">
        <div className="panel">
          <Package size={20} />
          <span>
            <strong>{products.length}</strong>Total produk
          </span>
        </div>
        <div className="panel stock-stat safe">
          <ShieldCheck size={20} />
          <span>
            <strong>{counts.safe}</strong>
            Stok aman
          </span>
        </div>
        <div className="panel stock-stat low">
          <TriangleAlert size={20} />
          <span>
            <strong>
              {counts.low}
            </strong>
            Perlu restock
          </span>
        </div>
        <div className="panel stock-stat is-empty">
          <Box size={20} />
          <span>
            <strong>{counts.empty}</strong>
            Stok kosong
          </span>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Cari inventaris"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, merek, atau SKU..."
            />
          </div>
          <select
            aria-label="Filter jenis material"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Semua material</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select
            aria-label="Filter inventaris"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Semua produk</option>
            <option value="safe">Aman</option>
            <option value="low">Perlu restock</option>
            <option value="empty">Kosong</option>
            <option value="active">Produk aktif</option>
          </select>
        </div>
        <div className="inventory-summary">
          <span className="small muted">{list.length} produk · {groups.length} jenis material</span>
          <div className="stock-status-legend" aria-label="Keterangan status stok">
            <Tag tone="green">Aman: di atas batas</Tag>
            <Tag tone="yellow">Perlu restock: sampai batas aman</Tag>
            <Tag tone="red">Kosong: 0</Tag>
          </div>
        </div>
        <div className="table-scroll">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Produk / SKU</th>
                <th>Satuan</th>
                <th>Harga dasar</th>
                <th>Stok</th>
                <th>Batas aman</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            {groups.map((group) => (
            <tbody key={group.category}>
              <tr className="inventory-group-heading">
                <th colSpan={7} scope="rowgroup">
                  <div className="inventory-group-title">
                    <span><Package size={18} /> <strong>{group.category}</strong> <small>{group.products.length} produk</small></span>
                    <span className="inventory-group-counts">
                      <span className="green-text">{group.counts.safe} aman</span>
                      <span className="amber-text">{group.counts.low} restock</span>
                      <span className="red-text">{group.counts.empty} kosong</span>
                    </span>
                  </div>
                </th>
              </tr>
              {group.products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="table-product">
                      <img src={p.image} alt="" />
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {p.sku} · {p.brand}{!p.active && " · Nonaktif"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td><span className="inventory-unit">{p.unit}</span></td>
                  <td>
                    {money(p.price)}
                  </td>
                  <td>
                    <strong className={stockStatus(p).textClass}>
                      {p.stock}
                    </strong>
                  </td>
                  <td>
                    {p.safety}
                  </td>
                  <td>
                    <Tag tone={stockStatus(p).tone}>
                      {stockStatus(p).label}
                    </Tag>
                  </td>
                  <td>
                    <div className="table-actions">
                      {manage ? (
                        <>
                          <button
                            className="icon-button"
                            aria-label={"Edit " + p.name}
                            onClick={() => setEdit(p)}
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="btn small-btn white"
                            onClick={() => {
                              setProducts((ps) =>
                                ps.map((x) =>
                                  x.id === p.id
                                    ? { ...x, active: !x.active }
                                    : x,
                                ),
                              );
                              notify(
                                p.active
                                  ? "Produk dinonaktifkan dari katalog."
                                  : "Produk diaktifkan.",
                              );
                            }}
                          >
                            {p.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn small-btn white"
                            onClick={() => setPo(p)}
                          >
                            <Plus size={14} /> Restock
                          </button>
                          <button
                            className="icon-button"
                            aria-label={"Sesuaikan stok " + p.name}
                            onClick={() => setAdjust(p)}
                          >
                            <Settings2 size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            ))}
          </table>
        </div>
        {!list.length && (
          <Empty
            title="Tidak ada produk"
            detail="Ubah pencarian atau filter Anda."
          />
        )}
      </section>
      {!manage && (
        <section className="panel table-panel movement-panel">
          <h3>Riwayat pergerakan stok</h3>
          {movements.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Produk</th>
                    <th>Perubahan</th>
                    <th>Referensi / alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.slice(0, 20).map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.date).toLocaleString("id-ID")}</td>
                      <td>
                        {products.find((p) => p.id === m.productId)?.name}
                      </td>
                      <td
                        className={m.quantity > 0 ? "green-text" : "amber-text"}
                      >
                        {m.quantity > 0 ? "+" : ""}
                        {m.quantity}
                      </td>
                      <td>{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">
              Checkout, penerimaan barang, dan penyesuaian stok akan dicatat
              otomatis di sini.
            </p>
          )}
        </section>
      )}
      {po && <RestockModal product={po} onClose={() => setPo(null)} />}
      {edit !== undefined && (
        <ProductEditor product={edit} onClose={() => setEdit(undefined)} />
      )}
      {adjust && (
        <Modal title="Penyesuaian Stok" onClose={() => setAdjust(null)}>
          <p>
            {adjust.name} · Stok saat ini:{" "}
            <strong>
              {adjust.stock} {adjust.unit}
            </strong>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget),
                stock = Number(fd.get("stock")),
                safety = Number(fd.get("safety"));
              setProducts((ps) =>
                ps.map((p) =>
                  p.id === adjust.id ? { ...p, stock, safety } : p,
                ),
              );
              if (stock !== adjust.stock)
                setMovements((ms) => [
                  {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    productId: adjust.id,
                    quantity: stock - adjust.stock,
                    reason: "Stok opname: " + String(fd.get("reason")),
                  },
                  ...ms,
                ]);
              notify("Stok dan batas aman diperbarui.");
              setAdjust(null);
            }}
          >
            <div className="form-grid">
              <label>
                Stok fisik ({adjust.unit})
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  defaultValue={adjust.stock}
                  required
                />
              </label>
              <label>
                Batas aman ({adjust.unit})
                <input
                  type="number"
                  name="safety"
                  min="0"
                  step="1"
                  defaultValue={adjust.safety}
                  required
                />
              </label>
              <label className="span-2">
                Alasan penyesuaian
                <textarea
                  name="reason"
                  required
                  minLength={5}
                  placeholder="Hasil stok opname, barang rusak, atau retur..."
                />
              </label>
            </div>
            <button className="btn primary full">Simpan Penyesuaian</button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function RestockModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { suppliers, setPurchases, notify } = useStore();
  const f = forecast(product);
  const [supplierId, setSupplierId] = useState(
    suppliers.find((s) => s.categories.includes(product.category))?.id ||
      suppliers[0].id,
  );
  const [qty, setQty] = useState(
    Math.max(1, f?.reorder || product.safety * 2 - product.stock),
  );
  const [created, setCreated] = useState<Purchase | null>(null);
  const supplier = suppliers.find((s) => s.id === supplierId)!;
  function submit(e: FormEvent) {
    e.preventDefault();
    const p: Purchase = {
      id: "PO-" + Date.now().toString().slice(-8),
      supplierId,
      date: new Date().toISOString(),
      due: new Date(Date.now() + supplier.term * 86400000).toISOString(),
      total: qty * product.cost,
      paid: false,
      received: false,
      items: [{ productId: product.id, quantity: qty, cost: product.cost }],
    };
    setPurchases((ps) => [p, ...ps]);
    setCreated(p);
    notify("Purchase Order dibuat. Stok bertambah saat barang diterima.");
  }
  return (
    <Modal title="Smart Restock · Purchase Order" onClose={onClose}>
      {created ? (
        <div className="po-success">
          <span className="ai-icon">
            <Check size={30} />
          </span>
          <h2>PO berhasil dibuat</h2>
          <p>
            {created.id} · {supplier.name}
          </p>
          <button
            className="btn primary"
            onClick={() => purchasePDF(created, supplier, [product])}
          >
            <Download size={18} /> Unduh Purchase Order
          </button>
          <p className="small muted">
            Lanjutkan penerimaan dan pembayaran di menu Supplier & Pembelian.
          </p>
          <button className="btn white" onClick={onClose}>
            Selesai
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="restock-product">
            <Package size={30} />
            <div>
              <h3>{product.name}</h3>
              <p>
                Stok {product.stock} {product.unit} · Batas aman{" "}
                {product.safety}
              </p>
              <Tag tone={stockStatus(product).tone}>{stockStatus(product).label}</Tag>
            </div>
          </div>
          <div className="insight">
            <Sparkles size={19} />
            <div>
              <strong>
                Rekomendasi pembelian:{" "}
                {Math.max(1, f?.reorder || product.safety * 2 - product.stock)}{" "}
                {product.unit}
              </strong>
              <p>
                {f
                  ? `Estimasi permintaan 30 hari: ${f.demand} ${product.unit}. Target stok = permintaan + safety stock.`
                  : "Data historis belum cukup. Rekomendasi memakai target 2× safety stock."}
              </p>
            </div>
          </div>
          <label>
            Supplier
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="supplier-term">
            <Calendar size={17} /> Termin {supplier.term} hari ·{" "}
            {supplier.contact}
          </div>
          <label>
            Jumlah pembelian ({product.unit})
            <input
              type="number"
              min="1"
              step="1"
              max="100000"
              required
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </label>
          <div className="order-item total">
            <span>Estimasi pembelian</span>
            <strong>{money(qty * product.cost)}</strong>
          </div>
          <button className="btn primary full">
            <FileText size={18} /> Generate Purchase Order
          </button>
        </form>
      )}
    </Modal>
  );
}
function ProductEditor({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { products, setProducts, notify } = useStore();
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sku = String(fd.get("sku")).trim();
    if (
      products.some(
        (p) =>
          p.sku.toLowerCase() === sku.toLowerCase() && p.id !== product?.id,
      )
    ) {
      setError("SKU sudah digunakan. Gunakan SKU unik.");
      return;
    }
    let units;
    try {
      units = String(fd.get("units"))
        .split("\n")
        .filter(Boolean)
        .map((s) => {
          const [name, factor] = s.split("=");
          if (
            !name?.trim() ||
            !Number.isFinite(Number(factor)) ||
            Number(factor) <= 0
          )
            throw Error();
          return { name: name.trim(), factor: Number(factor) };
        });
      if (new Set(units.map((u) => u.name)).size !== units.length)
        throw Error();
    } catch {
      setError(
        "Format konversi: nama satuan=rasio, satu per baris. Rasio harus lebih dari 0 dan nama unik.",
      );
      return;
    }
    const unit = String(fd.get("unit"));
    if (!units.some((u) => u.name === unit && u.factor === 1)) {
      setError("Sertakan satuan dasar dengan rasio 1 dalam konversi.");
      return;
    }
    const p: Product = {
      id: product?.id || crypto.randomUUID(),
      sku,
      name: String(fd.get("name")).trim(),
      brand: String(fd.get("brand")),
      category: String(fd.get("category")),
      price: Number(fd.get("price")),
      cost: Number(fd.get("cost")),
      unit,
      units,
      stock: product?.stock || 0,
      safety: Number(fd.get("safety")),
      weight: Number(fd.get("weight")),
      volume: Number(fd.get("volume")),
      image: String(fd.get("image")),
      description: String(fd.get("description")),
      sold: product?.sold || 0,
      active: product?.active ?? true,
    };
    setProducts((ps) =>
      product ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p],
    );
    notify("Data produk disimpan. Katalog diperbarui.");
    onClose();
  }
  return (
    <Modal
      title={product ? "Edit Produk" : "Tambah Produk"}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          {[
            ["name", "Nama produk", product?.name || ""],
            ["sku", "SKU unik", product?.sku || ""],
            ["brand", "Merek", product?.brand || ""],
            ["unit", "Satuan dasar", product?.unit || "pcs"],
          ].map(([name, label, value]) => (
            <label key={name}>
              {label}
              <input name={name} required defaultValue={value} />
            </label>
          ))}
          <label>
            Kategori
            <select name="category" defaultValue={product?.category || "Semen"}>
              {Array.from(new Set([...initialProducts, ...products].map((p) => p.category))).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Batas aman stok
            <input
              name="safety"
              required
              type="number"
              min="0"
              step="1"
              defaultValue={product?.safety ?? 10}
            />
          </label>
          {[
            ["price", "Harga jual", product?.price || 0],
            ["cost", "Harga beli", product?.cost || 0],
            ["weight", "Berat per satuan (kg)", product?.weight || 1],
            ["volume", "Volume per satuan (m³)", product?.volume || 0.01],
          ].map(([name, label, value]) => (
            <label key={String(name)}>
              {label}
              <input
                name={String(name)}
                required
                type="number"
                min={name === "volume" ? ".0001" : "0"}
                step="any"
                defaultValue={value}
              />
            </label>
          ))}
          <label className="span-2">
            Konversi satuan (nama=rasio terhadap satuan dasar)
            <textarea
              name="units"
              required
              defaultValue={
                product?.units.map((u) => `${u.name}=${u.factor}`).join("\n") ||
                "pcs=1\npak (10 pcs)=10"
              }
            />
          </label>
          <label className="span-2">
            Gambar produk (aset lokal atau URL HTTPS)
            <input
              name="image"
              type="text"
              pattern="(/images/.+|https://.+)"
              required
              defaultValue={
                product?.image ||
                "/images/material-default.svg"
              }
            />
          </label>
          <label className="span-2">
            Deskripsi
            <textarea
              name="description"
              required
              defaultValue={product?.description}
            />
          </label>
        </div>
        {!product && (
          <p className="small muted">
            Produk baru dimulai dengan stok 0. Catat barang masuk melalui
            inventaris atau nota supplier.
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary full">
          Simpan Produk <Check size={18} />
        </button>
      </form>
    </Modal>
  );
}
export function AdminOrders() {
  const { orders, setOrders, notify } = useStore();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const current = orders.find((o) => o.id === editing);
  return (
    <>
      <AdminTitle
        eyebrow="TRANSAKSI & PENGIRIMAN"
        title="Manajemen Pesanan"
        description="Konfirmasi pembayaran, jadwalkan armada, dan perbarui perjalanan pesanan."
      />
      <div className="category-tabs">
        {["all", ...statuses].map((s, i) => (
          <button
            className={filter === s ? "active" : ""}
            onClick={() => setFilter(s)}
            key={s}
          >
            {i === 0 ? "Semua pesanan" : s}{" "}
            <span>
              {orders.filter((o) => i === 0 || o.status === i - 1).length}
            </span>
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pesanan</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Pembayaran</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(
                  (o) => filter === "all" || statuses[o.status] === filter,
                )
                .map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.id}</strong>
                      <small>
                        {new Date(o.date).toLocaleDateString("id-ID")}
                      </small>
                    </td>
                    <td>
                      <strong>{o.name}</strong>
                      <small>{o.phone}</small>
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <Tag tone={o.paid ? "green" : "yellow"}>
                        {o.paid ? "Lunas" : o.payment}
                      </Tag>
                    </td>
                    <td>
                      <Tag tone={o.status === 3 ? "green" : "yellow"}>
                        {statuses[o.status]}
                      </Tag>
                    </td>
                    <td>
                      <button
                        className="btn small-btn white"
                        onClick={() => setEditing(o.id)}
                      >
                        Kelola <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!orders.filter(
          (o) => filter === "all" || statuses[o.status] === filter,
        ).length && (
          <Empty
            title="Tidak ada pesanan"
            detail="Pesanan dengan status ini akan ditampilkan di sini."
          />
        )}
      </section>
      {current && (
        <Modal
          title={"Kelola " + current.id}
          onClose={() => setEditing(null)}
          wide
        >
          <div className="order-admin-grid">
            <div>
              <h3>{current.name}</h3>
              <p>{current.address}</p>
              <p className="muted">
                {current.phone} · {current.note || "Tanpa catatan"}
              </p>
              {current.items.map((i, n) => (
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
              <div className="order-item total">
                <strong>Total + ongkir</strong>
                <strong>{money(current.total)}</strong>
              </div>
              <button
                className="btn white"
                onClick={() => orderPDF(current, "Faktur")}
              >
                <Download size={17} /> Unduh Faktur
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const status = Number(fd.get("status"));
                setOrders((os) =>
                  os.map((o) =>
                    o.id === current.id
                      ? {
                          ...o,
                          status,
                          driver: String(fd.get("driver")),
                          eta: String(fd.get("eta")),
                          paid: fd.get("paid") === "on",
                        }
                      : o,
                  ),
                );
                notify("Pesanan diperbarui. Status customer tersinkron.");
                setEditing(null);
              }}
            >
              <label>
                Status pesanan
                <select name="status" defaultValue={current.status}>
                  {statuses.map((s, i) => (
                    <option key={s} value={i} disabled={i < current.status}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Armada rekomendasi
                <input readOnly value={current.fleet} />
              </label>
              <label>
                Nama sopir & nomor kendaraan
                <input
                  name="driver"
                  defaultValue={
                    current.driver === "Belum ditugaskan"
                      ? "Pak Dedi · F 1842 DY"
                      : current.driver
                  }
                  required
                />
              </label>
              <label>
                Estimasi tiba
                <input
                  name="eta"
                  required
                  defaultValue={
                    current.eta === "Menunggu penjadwalan admin"
                      ? "Besok, 09.00–12.00"
                      : current.eta
                  }
                />
              </label>
              <label className="checkbox-label">
                <input
                  name="paid"
                  type="checkbox"
                  defaultChecked={current.paid}
                />{" "}
                Pembayaran telah diterima (simulasi)
              </label>
              <button className="btn primary full">
                Simpan Perubahan <Check size={16} />
              </button>
              <p className="small muted">
                Stok sudah dialokasikan saat checkout dan tidak dipotong ulang.
              </p>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Suppliers() {
  const {
    suppliers,
    setSuppliers,
    purchases,
    setPurchases,
    products,
    stockIn,
    notify,
  } = useStore();
  const [edit, setEdit] = useState<Supplier | null | undefined>(undefined);
  const [tab, setTab] = useState("supplier");
  const [error, setError] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s: Supplier = {
      id: edit?.id || crypto.randomUUID(),
      name: String(f.get("name")),
      contact: String(f.get("contact")),
      phone: String(f.get("phone")),
      term: Number(f.get("term")),
      categories: String(f.get("categories")),
      address: String(f.get("address")),
    };
    if (
      suppliers.some(
        (x) => x.name.toLowerCase() === s.name.toLowerCase() && x.id !== s.id,
      )
    ) {
      setError("Nama supplier sudah terdaftar.");
      return;
    }
    setSuppliers((ss) =>
      edit ? ss.map((x) => (x.id === s.id ? s : x)) : [...ss, s],
    );
    setEdit(undefined);
    notify("Data supplier disimpan.");
  }
  return (
    <>
      <AdminTitle
        eyebrow="PARTNER & PEMBELIAN"
        title="Supplier & Pembelian"
        description="Kontak terpusat, riwayat PO, dan jatuh tempo yang terpantau."
        action={
          <button
            className="btn primary"
            onClick={() => {
              setEdit(null);
              setError("");
            }}
          >
            <Plus size={18} /> Tambah Supplier
          </button>
        }
      />
      <div className="category-tabs">
        <button
          className={tab === "supplier" ? "active" : ""}
          onClick={() => setTab("supplier")}
        >
          Direktori Supplier
        </button>
        <button
          className={tab === "po" ? "active" : ""}
          onClick={() => setTab("po")}
        >
          Purchase Order & Hutang <span>{purchases.length}</span>
        </button>
      </div>
      {tab === "supplier" ? (
        <div className="supplier-grid">
          {suppliers.map((s) => (
            <article className="panel supplier-card" key={s.id}>
              <div className="supplier-card-head">
                <span className="supplier-icon">
                  <Users size={24} />
                </span>
                <button
                  className="icon-button"
                  aria-label={"Edit " + s.name}
                  onClick={() => {
                    setEdit(s);
                    setError("");
                  }}
                >
                  <Edit3 size={17} />
                </button>
              </div>
              <h3>{s.name}</h3>
              <Tag tone="yellow">Termin {s.term} hari</Tag>
              <p>{s.categories}</p>
              <div className="supplier-details">
                <span>{s.contact}</span>
                <a href={"tel:" + s.phone}>{s.phone}</a>
                <small>{s.address}</small>
              </div>
              <div className="supplier-summary">
                <span>
                  {purchases.filter((p) => p.supplierId === s.id).length}{" "}
                  transaksi pembelian
                </span>
                <strong>
                  {money(
                    purchases
                      .filter((p) => p.supplierId === s.id && !p.paid)
                      .reduce((a, p) => a + p.total, 0),
                  )}
                  <small>Hutang berjalan</small>
                </strong>
              </div>
              <button className="text-link" onClick={() => setTab("po")}>
                Lihat riwayat pembelian <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <section className="panel table-panel">
          <div className="section-heading">
            <h3>Pembelian & account payable</h3>
            <span className="small muted">
              Total belum lunas:{" "}
              {money(
                purchases
                  .filter((p) => !p.paid)
                  .reduce((a, p) => a + p.total, 0),
              )}
            </span>
          </div>
          {purchases.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Referensi</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Jatuh tempo</th>
                    <th>Penerimaan</th>
                    <th>Pembayaran</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const s = suppliers.find((s) => s.id === p.supplierId)!;
                    const days = Math.ceil(
                      (new Date(p.due).getTime() - Date.now()) / 86400000,
                    );
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.id}</strong>
                          <small>
                            {new Date(p.date).toLocaleDateString("id-ID")}
                          </small>
                        </td>
                        <td>{s.name}</td>
                        <td>{money(p.total)}</td>
                        <td>
                          <span
                            className={days < 3 && !p.paid ? "amber-text" : ""}
                          >
                            {new Date(p.due).toLocaleDateString("id-ID")}
                          </span>
                          {!p.paid && (
                            <small>
                              {days < 0 ? "Terlambat" : `${days} hari lagi`}
                            </small>
                          )}
                        </td>
                        <td>
                          <Tag tone={p.received ? "green" : "yellow"}>
                            {p.received ? "Diterima" : "Dipesan"}
                          </Tag>
                        </td>
                        <td>
                          <Tag
                            tone={
                              p.paid ? "green" : days < 0 ? "red" : "yellow"
                            }
                          >
                            {p.paid
                              ? "Lunas"
                              : days < 0
                                ? "Terlambat"
                                : "Belum dibayar"}
                          </Tag>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="icon-button"
                              aria-label={"Unduh " + p.id}
                              onClick={() => purchasePDF(p, s, products)}
                            >
                              <Download size={17} />
                            </button>
                            {!p.received && (
                              <button
                                className="btn small-btn white"
                                onClick={() => {
                                  stockIn(p.items, `Penerimaan ${p.id}`);
                                  setPurchases((ps) =>
                                    ps.map((x) =>
                                      x.id === p.id
                                        ? { ...x, received: true }
                                        : x,
                                    ),
                                  );
                                  notify("Barang diterima. Stok diperbarui.");
                                }}
                              >
                                Terima barang
                              </button>
                            )}
                            {!p.paid && (
                              <button
                                className="btn small-btn white"
                                onClick={() => {
                                  setPurchases((ps) =>
                                    ps.map((x) =>
                                      x.id === p.id ? { ...x, paid: true } : x,
                                    ),
                                  );
                                  notify(
                                    "Pembayaran supplier dicatat (simulasi).",
                                  );
                                }}
                              >
                                Bayar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Belum ada pembelian"
              detail="Buat PO dari inventaris atau konfirmasi nota supplier untuk memulai."
              action={
                <a className="btn primary" href="#/admin/stok">
                  Buka Inventaris
                </a>
              }
            />
          )}
        </section>
      )}
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit Supplier" : "Tambah Supplier"}
          onClose={() => setEdit(undefined)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              {[
                ["name", "Nama supplier", edit?.name || ""],
                ["contact", "Kontak person", edit?.contact || ""],
                ["phone", "Nomor telepon", edit?.phone || ""],
                ["categories", "Kategori material", edit?.categories || ""],
              ].map(([name, label, value]) => (
                <label key={name}>
                  {label}
                  <input name={name} required defaultValue={value} />
                </label>
              ))}
              <label>
                Termin pembayaran (hari)
                <input
                  name="term"
                  type="number"
                  min="0"
                  max="365"
                  step="1"
                  required
                  defaultValue={edit?.term || 30}
                />
              </label>
              <label>
                Alamat
                <input name="address" required defaultValue={edit?.address} />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn primary full">Simpan Supplier</button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Forecast() {
  const { products } = useStore();
  const [id, setId] = useState(products[0].id);
  const [po, setPo] = useState<Product | null>(null);
  const p = products.find((p) => p.id === id)!;
  const f = forecast(p);
  const points = Array.from({ length: 60 }, (_, i) => ({
    day: i - 29,
    historical:
      i < 30
        ? Math.max(0, Math.round((p.sold / 30) * (0.65 + ((i * 7) % 10) / 12)))
        : undefined,
    prediction:
      i >= 29
        ? Math.round((p.sold / 30) * 1.12 * (0.8 + ((i * 3) % 7) / 15))
        : undefined,
  }));
  return (
    <>
      <AdminTitle
        eyebrow="RENCANAKAN LEBIH CERDAS"
        title="Demand Forecasting"
        description="Proyeksi permintaan 30 hari dan rekomendasi pembelian berdasarkan riwayat simulasi."
        action={
          <Tag tone="yellow">
            <Sparkles size={13} /> Forecast simulasi
          </Tag>
        }
      />
      <Notice>
        Proyeksi memakai rata-rata penjualan contoh 30 hari × faktor tren 1,12.
        Grafik harian diilustrasikan dari rerata; ini bukan model ML terlatih
        atau jaminan permintaan.
      </Notice>
      <section className="panel chart-panel forecast-chart">
        <div className="section-heading">
          <div>
            <h3>Tren & proyeksi material</h3>
            <p className="small muted">
              30 hari historis + 30 hari ke depan · satuan dasar
            </p>
          </div>
          <select
            aria-label="Produk forecasting"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {products.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {f ? (
          <>
            <div className="forecast-stats">
              <div>
                <span>Estimasi permintaan 30 hari</span>
                <strong>
                  {f.demand} <small>{p.unit}</small>
                </strong>
              </div>
              <div>
                <span>Stok saat ini</span>
                <strong className={stockStatus(p).textClass}>
                  {p.stock} <small>{p.unit}</small>
                </strong>
                <Tag tone={stockStatus(p).tone}>{stockStatus(p).label}</Tag>
              </div>
              <div>
                <span>Perkiraan cakupan stok</span>
                <strong>
                  {f.days} <small>hari</small>
                </strong>
              </div>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid
                    strokeDasharray="4 5"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={14}
                    tickFormatter={(v) => (v <= 0 ? `${v}h` : `+${v}h`)}
                  />
                  <YAxis fontSize={14} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                    labelFormatter={(v) =>
                      Number(v) > 0
                        ? `${v} hari mendatang`
                        : `${Math.abs(Number(v))} hari lalu`
                    }
                  />
                  <Legend />
                  <Line
                    dataKey="historical"
                    name="Historis ilustratif"
                    stroke="#789789"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    dataKey="prediction"
                    name="Proyeksi simulasi"
                    stroke="#e4ad1d"
                    strokeDasharray="5 4"
                    dot={false}
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <Empty
            title="Data belum cukup untuk prediksi"
            detail="Produk ini memiliki kurang dari 10 penjualan dalam data historis. Tambahkan riwayat sebelum membuat proyeksi."
          />
        )}
      </section>
      <section className="panel table-panel">
        <div className="section-heading">
          <h3>Rekomendasi pembelian 30 hari</h3>
          <span className="small muted">
            Target = permintaan + safety stock
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Stok</th>
                <th>Proyeksi permintaan</th>
                <th>Rekomendasi</th>
                <th>Tindak lanjut</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) => p.active)
                .map((p) => {
                  const f = forecast(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small>{p.brand}</small>
                      </td>
                      <td>
                        <span className={stockStatus(p).textClass}>{p.stock} {p.unit}</span>
                        <small><Tag tone={stockStatus(p).tone}>{stockStatus(p).label}</Tag></small>
                      </td>
                      <td>
                        {f ? `${f.demand} ${p.unit}` : "Data belum cukup"}
                      </td>
                      <td>
                        {f ? (
                          <Tag tone={f.reorder ? "yellow" : "green"}>
                            {f.reorder
                              ? `Pesan ${f.reorder} ${p.unit}`
                              : "Stok mencukupi"}
                          </Tag>
                        ) : (
                          <Tag tone="gray">Belum tersedia</Tag>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn small-btn white"
                          disabled={!f?.reorder}
                          onClick={() => setPo(p)}
                        >
                          Buat PO <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
      {po && <RestockModal product={po} onClose={() => setPo(null)} />}
    </>
  );
}
export function InvoiceExtraction() {
  const { products, suppliers, stockIn, setPurchases, notify } = useStore();
  const [image, setImage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0].id);
  const [invoice, setInvoice] = useState("INV-DEMO-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([
    { productId: "semen", quantity: 50, cost: 53000 },
    { productId: "cat", quantity: 12, cost: 130000 },
  ]);
  const [error, setError] = useState("");
  function extract() {
    setProcessing(true);
    setConfirmed(false);
    setTimeout(() => {
      setExtracted(true);
      setProcessing(false);
    }, 1200);
  }
  function confirm(e: FormEvent) {
    e.preventDefault();
    if (
      items.some(
        (i) =>
          !i.productId ||
          !Number.isInteger(i.quantity) ||
          i.quantity <= 0 ||
          i.cost < 0,
      )
    ) {
      setError("Periksa produk, kuantitas, dan harga setiap baris.");
      return;
    }
    const supplier = suppliers.find((s) => s.id === supplierId)!;
    const purchase: Purchase = {
      id: invoice.trim() + "-" + Date.now().toString().slice(-5),
      supplierId,
      date: new Date(date).toISOString(),
      due: new Date(
        new Date(date).getTime() + supplier.term * 86400000,
      ).toISOString(),
      total: items.reduce((s, i) => s + i.cost * i.quantity, 0),
      paid: false,
      received: true,
      items,
    };
    stockIn(items, "Nota " + purchase.id);
    setPurchases((ps) => [purchase, ...ps]);
    setConfirmed(true);
    notify(
      "Barang masuk berhasil dikonfirmasi. Stok dan hutang supplier diperbarui.",
    );
  }
  return (
    <>
      <AdminTitle
        eyebrow="DARI NOTA KE DATA"
        title="Ekstraksi Nota AI"
        description="Unggah nota, periksa data hasil simulasi, lalu konfirmasi barang masuk gudang."
      />
      <Notice>
        Demo OCR/LLM memakai data nota contoh tetap, tidak membaca teks gambar.
        Koreksi supplier, tanggal, dan setiap item agar sesuai nota Anda sebelum
        konfirmasi.
      </Notice>
      <div className="invoice-layout">
        <section className="panel form-panel">
          <h3>
            <span className="step-number">1</span> Foto nota supplier
          </h3>
          {image ? (
            <div className="invoice-preview">
              <img src={image} alt="Nota supplier yang diunggah" />
            </div>
          ) : (
            <div className="upload-zone compact">
              <ScanLine size={43} />
              <h3>Unggah foto nota</h3>
              <p>JPG, PNG, WebP · maks. 8 MB</p>
            </div>
          )}
          <label className="btn white full">
            <ImagePlus size={18} />
            {image ? "Ganti Foto" : "Pilih Foto Nota"}
            <input
              type="file"
              accept="image/*"
              aria-label="Unggah nota supplier"
              onChange={(e) =>
                readImage(
                  e.target.files?.[0],
                  (s) => {
                    setImage(s);
                    setExtracted(false);
                    setConfirmed(false);
                  },
                  notify,
                )
              }
            />
          </label>
          <button
            className="btn primary full"
            disabled={!image || processing || confirmed}
            onClick={extract}
          >
            {processing ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            {processing ? "Menyusun data contoh..." : "Simulasikan Ekstraksi"}
          </button>
          <p className="small muted">
            Tidak ada gambar yang dikirim ke layanan eksternal.
          </p>
        </section>
        <section className="panel form-panel">
          <h3>
            <span className="step-number">2</span> Verifikasi data barang masuk
          </h3>
          {!extracted ? (
            <Empty
              title="Data nota akan tampil di sini"
              detail="Unggah foto, kemudian jalankan simulasi ekstraksi."
            />
          ) : confirmed ? (
            <div className="po-success">
              <span className="ai-icon">
                <Check size={28} />
              </span>
              <h2>Barang masuk tercatat</h2>
              <p>Stok bertambah satu kali dan riwayat pembelian tersimpan.</p>
              <a className="btn primary" href="#/admin/stok">
                Periksa Inventaris <ArrowUpRight size={17} />
              </a>
              <button
                className="btn white"
                onClick={() => {
                  setImage("");
                  setExtracted(false);
                  setConfirmed(false);
                }}
              >
                Proses nota berikutnya
              </button>
            </div>
          ) : (
            <form onSubmit={confirm}>
              <div className="form-grid">
                <label className="span-2">
                  Supplier
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nomor nota
                  <input
                    required
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                  />
                </label>
                <label>
                  Tanggal nota
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="notice">
                <TriangleAlert size={17} />
                <span>
                  Semua field adalah hasil contoh. Wajib diverifikasi manual.
                </span>
              </div>
              <div className="invoice-items">
                {items.map((i, n) => (
                  <div className="invoice-line" key={n}>
                    <label>
                      Material
                      <select
                        value={i.productId}
                        onChange={(e) => {
                          const p = products.find(
                            (p) => p.id === e.target.value,
                          )!;
                          setItems((xs) =>
                            xs.map((x, k) =>
                              k === n
                                ? { ...x, productId: p.id, cost: p.cost }
                                : x,
                            ),
                          );
                        }}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="form-grid">
                      <label>
                        Jumlah
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={i.quantity}
                          onChange={(e) =>
                            setItems((xs) =>
                              xs.map((x, k) =>
                                k === n
                                  ? { ...x, quantity: Number(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Harga satuan (Rp)
                        <input
                          type="number"
                          min="0"
                          required
                          value={i.cost}
                          onChange={(e) =>
                            setItems((xs) =>
                              xs.map((x, k) =>
                                k === n
                                  ? { ...x, cost: Number(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-link amber-text"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((xs) => xs.filter((_, k) => k !== n))
                      }
                    >
                      Hapus baris
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn white small-btn"
                onClick={() =>
                  setItems((xs) => [
                    ...xs,
                    {
                      productId: products[0].id,
                      quantity: 1,
                      cost: products[0].cost,
                    },
                  ])
                }
              >
                <Plus size={15} /> Tambah Item
              </button>
              <div className="order-item total">
                <span>Total pembelian</span>
                <strong>
                  {money(items.reduce((s, i) => s + i.quantity * i.cost, 0))}
                </strong>
              </div>
              <label className="checkbox-label">
                <input required type="checkbox" /> Saya sudah memverifikasi
                seluruh data nota.
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="btn primary full">
                <Check size={18} /> Konfirmasi Masuk Gudang
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
