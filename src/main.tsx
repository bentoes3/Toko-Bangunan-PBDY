import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  type FormEvent,
} from "react";
import { createRoot } from "react-dom/client";
import {
  MapPin,
  ArrowUpRight,
  Search,
  Camera,
  ShoppingBag,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  Instagram,
  Sparkles,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { StoreProvider, useStore } from "./store";
import { Logo, Toast } from "./ui";
import {
  Home,
  Catalog,
  ProductDetail,
  Cart,
  Checkout,
  Orders,
} from "./Customer";
import { VisualSearch, Advisor } from "./AI";
import { PaintCalculator } from "./PaintCalculator";
const AdminShell = lazy(() =>
  import("./Admin").then((m) => ({ default: m.AdminShell })),
);
const AdminLogin = lazy(() =>
  import("./Admin").then((m) => ({ default: m.AdminLogin })),
);
const Dashboard = lazy(() =>
  import("./Admin").then((m) => ({ default: m.Dashboard })),
);
const Inventory = lazy(() =>
  import("./Admin").then((m) => ({ default: m.Inventory })),
);
const AdminOrders = lazy(() =>
  import("./Admin").then((m) => ({ default: m.AdminOrders })),
);
const Suppliers = lazy(() =>
  import("./Admin").then((m) => ({ default: m.Suppliers })),
);
const Forecast = lazy(() =>
  import("./Admin").then((m) => ({ default: m.Forecast })),
);
const InvoiceExtraction = lazy(() =>
  import("./Admin").then((m) => ({ default: m.InvoiceExtraction })),
);
import type { Product } from "./domain";
import "./styles.css";
import "./brand.css";
import "./ai.css";
function App() {
  const { dark, setDark, cart, authenticated } = useStore();
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  const [visual, setVisual] = useState(false);
  const [advisor, setAdvisor] = useState(false);
  const [calculator, setCalculator] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const listener = () => {
      setRoute(location.hash.slice(1) || "/");
      setMobile(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const path = route.split("?")[0];
  const admin = path.startsWith("/admin");
  const page = path.split("/")[2] || "dashboard";
  function search(e: FormEvent) {
    e.preventDefault();
    if (path === "/katalog") {
      location.hash = "/katalog?q=" + encodeURIComponent(query);
      location.reload();
    } else location.hash = "/katalog?q=" + encodeURIComponent(query);
  }
  return (
    <>
      {admin ? (
        authenticated ? (
          <AdminShell page={page}>
            {page === "dashboard" ? (
              <Dashboard />
            ) : page === "produk" ? (
              <Inventory manage />
            ) : page === "stok" ? (
              <Inventory />
            ) : page === "pesanan" ? (
              <AdminOrders />
            ) : page === "supplier" ? (
              <Suppliers />
            ) : page === "forecast" ? (
              <Forecast />
            ) : page === "invoice" ? (
              <InvoiceExtraction />
            ) : (
              <Dashboard />
            )}
          </AdminShell>
        ) : (
          <AdminLogin />
        )
      ) : (
        <>
          <div className="topbar">
            <div className="container">
              <span>
                <MapPin size={13} /> Kabupaten Bogor, Jawa Barat
              </span>
              <span>
                Material terpercaya, sejak 2020 <i />{" "}
                <a href="#/admin">
                  Portal Admin <ArrowUpRight size={12} />
                </a>
              </span>
            </div>
          </div>
          <header className="site-header">
            <div className="container header-main">
              <Logo />
              <form className="header-search" onSubmit={search}>
                <Search size={18} />
                <input
                  aria-label="Pencarian katalog"
                  placeholder="Cari material untuk proyek Anda..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Cari lewat foto"
                  onClick={() => setVisual(true)}
                >
                  <Camera size={21} />
                </button>
              </form>
              <div className="header-tools">
                <button
                  className="icon-button theme-toggle"
                  aria-label={
                    dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
                  }
                  onClick={() => setDark(!dark)}
                >
                  {dark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <span className="header-divider" />
                <a
                  className="cart-link icon-button"
                  href="#/keranjang"
                  aria-label={
                    "Keranjang " +
                    cart.reduce((a, i) => a + i.quantity, 0) +
                    " barang"
                  }
                >
                  <ShoppingBag size={22} />
                  {cart.length > 0 && (
                    <span>{cart.reduce((a, i) => a + i.quantity, 0)}</span>
                  )}
                </a>
                <a className="btn admin-link white" href="#/pesanan">
                  Pesanan Saya <ArrowUpRight size={15} />
                </a>
                <button
                  className="icon-button mobile-only"
                  aria-label="Buka navigasi"
                  onClick={() => setMobile(!mobile)}
                >
                  {mobile ? <X /> : <Menu />}
                </button>
              </div>
            </div>
            <div className={"nav-row container " + (mobile ? "show" : "")}>
              <nav>
                <a href="#/" className={path === "/" ? "active" : ""}>
                  Beranda
                </a>
                <a
                  href="#/katalog"
                  className={path === "/katalog" ? "active" : ""}
                >
                  Katalog Material <ChevronDown size={13} />
                </a>
                <button onClick={() => setVisual(true)}>
                  Cari via Foto <span className="nav-ai">AI</span>
                </button>
                <button onClick={() => setCalculator(true)}>
                  Kalkulator Cat
                </button>
                <button onClick={() => setAdvisor(true)}>
                  Konsultan Bangunan <span className="nav-ai">AI</span>
                </button>
                <a className="mobile-only" href="#/pesanan">
                  Pesanan Saya
                </a>
                <a className="mobile-only" href="#/admin">
                  Portal Admin
                </a>
              </nav>
              <span className="nav-support">
                <Phone size={14} /> Siap bantu proyek Anda
              </span>
            </div>
          </header>
          <main>
            {path === "/" ? (
              <Home
                openVisual={() => setVisual(true)}
                openAdvisor={() => setAdvisor(true)}
                openCalculator={() => setCalculator(true)}
                onDetail={setDetail}
              />
            ) : path === "/katalog" ? (
              <Catalog
                key={route}
                onDetail={setDetail}
                openVisual={() => setVisual(true)}
              />
            ) : path === "/keranjang" ? (
              <Cart />
            ) : path === "/checkout" ? (
              <Checkout />
            ) : path === "/pesanan" ? (
              <Orders />
            ) : (
              <div className="container page">
                <h1>Halaman tidak ditemukan</h1>
                <a className="btn primary" href="#/">
                  Kembali ke beranda
                </a>
              </div>
            )}
          </main>
          <footer className="site-footer">
            <div className="container footer-grid">
              <div>
                <Logo />
                <p>
                  Material terpercaya untuk setiap rencana.
                  <br />
                  Bersama membangun, bersama bertumbuh.
                </p>
                <span className="footer-since">PARTNER ANDA SEJAK 2020</span>
              </div>
              <div>
                <h4>Jelajahi PB.DY</h4>
                <a href="#/katalog">Katalog Material</a>
                <button onClick={() => setVisual(true)}>
                  Pencarian Visual
                </button>
                <button onClick={() => setAdvisor(true)}>
                  Konsultan Bangunan AI
                </button>
                <button onClick={() => setCalculator(true)}>
                  Kalkulator Cat Dinding
                </button>
              </div>
              <div>
                <h4>Belanja & Layanan</h4>
                <a href="#/pesanan">Lacak Pesanan</a>
                <a href="#/keranjang">Keranjang Belanja</a>
                <a href="#/admin">Portal Admin</a>
              </div>
              <div>
                <h4>Temui Kami</h4>
                <span>
                  <MapPin size={16} /> Kabupaten Bogor, Jawa Barat
                </span>
                <span>
                  <Phone size={16} /> Senin–Sabtu, 07.00–17.00 WIB
                </span>
                <span>
                  <ShieldIcon /> Material original & berkualitas
                </span>
              </div>
            </div>
            <div className="container footer-bottom">
              <span>
                © {new Date().getFullYear()} Toko Bangunan PB.DY. Dibangun
                untuk rencana Anda.
              </span>
              <span>Transaksi simulasi · Periksa kembali saran AI</span>
            </div>
          </footer>
          <button
            className="floating-assistant"
            onClick={() => setAdvisor(true)}
            aria-label="Buka konsultan bangunan AI"
          >
            <Sparkles size={22} />
            <span>Tanya Rena</span>
            <span className="assistant-dot" />
          </button>
        </>
      )}
      {visual && (
        <VisualSearch onClose={() => setVisual(false)} onDetail={setDetail} />
      )}
      {advisor && <Advisor onClose={() => setAdvisor(false)} />}
      {calculator && <PaintCalculator onClose={() => setCalculator(false)} />}
      {detail && <ProductDetail p={detail} onClose={() => setDetail(null)} />}
      <Toast />
    </>
  );
}
function ShieldIcon() {
  return <span className="footer-check">✓</span>;
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <Suspense
        fallback={
          <div className="loading-app">
            <Logo />
            <p>Menyiapkan ruang Anda...</p>
          </div>
        }
      >
        <App />
      </Suspense>
    </StoreProvider>
  </React.StrictMode>,
);
