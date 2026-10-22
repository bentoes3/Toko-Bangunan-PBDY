import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { initialProducts, initialSuppliers, initialOrders } from "./data";
import { appendMissingCatalogProducts } from "./catalog";
import {
  conversion,
  validateCart,
  type Product,
  type CartItem,
  type Order,
  type Supplier,
  type Purchase,
  type Movement,
} from "./domain";
function useSaved<T>(key: string, initial: T) {
  const [value, set] = useState<T>(() => {
    try {
      const s = localStorage.getItem("pbdy-v1-" + key);
      if (key === "products" && !localStorage.getItem("pbdy-catalog-v2")) {
        const next = s ? appendMissingCatalogProducts(JSON.parse(s)) : initial;
        // Save products before the marker so interrupted writes can be retried safely.
        try {
          localStorage.setItem("pbdy-v1-" + key, JSON.stringify(next));
          localStorage.setItem("pbdy-catalog-v2", "1");
        } catch {
          console.warn("Katalog diperbarui di memori; penyimpanan browser tidak tersedia.");
        }
        return next as T;
      }
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("pbdy-v1-" + key, JSON.stringify(value));
    } catch {
      console.warn("Penyimpanan browser penuh.");
    }
  }, [key, value]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === "pbdy-v1-" + key && event.newValue) {
        try {
          set(JSON.parse(event.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [key]);
  return [value, set] as const;
}
function useAppStore() {
  const [products, setProducts] = useSaved<Product[]>(
    "products",
    initialProducts,
  );
  const [cart, setCart] = useSaved<CartItem[]>("cart", []);
  const [orders, setOrders] = useSaved<Order[]>("orders", initialOrders);
  const [suppliers, setSuppliers] = useSaved<Supplier[]>(
    "suppliers",
    initialSuppliers,
  );
  const [purchases, setPurchases] = useSaved<Purchase[]>("purchases", []);
  const [movements, setMovements] = useSaved<Movement[]>("movements", []);
  const [dark, setDark] = useSaved("dark", false);
  const [toast, setToast] = useState("");
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("pbdy-admin") === "yes",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function notify(s: string) {
    setToast(s);
  }
  function add(p: Product, unit = p.unit, quantity = 1) {
    const next = [...cart];
    const existing = next.find((i) => i.productId === p.id && i.unit === unit);
    if (existing) {
      next[next.indexOf(existing)] = {
        ...existing,
        quantity: existing.quantity + quantity,
      };
    } else next.push({ productId: p.id, unit, quantity });
    const error = validateCart(next, products);
    if (error) {
      notify(error);
      return false;
    }
    setCart(next);
    notify(`${quantity} ${unit} ${p.name} ditambahkan ke keranjang`);
    return true;
  }
  function updateCart(index: number, quantity: number, unit?: string) {
    const next = cart.map((i, n) =>
      n === index ? { ...i, quantity, unit: unit || i.unit } : i,
    );
    const err = validateCart(next, products);
    if (err) {
      notify(err);
      return;
    }
    setCart(next);
  }
  function placeOrder(order: Order) {
    const err = validateCart(cart, products);
    if (err) {
      notify(err);
      return false;
    }
    const amounts: Record<string, number> = {};
    order.items.forEach((i) => {
      amounts[i.productId] =
        (amounts[i.productId] || 0) + i.quantity * i.factor;
    });
    setProducts((ps) =>
      ps.map((p) => ({
        ...p,
        stock: p.stock - (amounts[p.id] || 0),
        sold: p.sold + (amounts[p.id] || 0),
      })),
    );
    setMovements((ms) => [
      ...order.items.map((i) => ({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        productId: i.productId,
        quantity: -i.quantity * i.factor,
        reason: `Pesanan ${order.id}`,
      })),
      ...ms,
    ]);
    setOrders((o) => [order, ...o]);
    setCart([]);
    notify("Pesanan berhasil dibuat. Terima kasih!");
    return true;
  }
  function stockIn(
    items: { productId: string; quantity: number; cost: number }[],
    reason: string,
  ) {
    setProducts((ps) =>
      ps.map((p) => ({
        ...p,
        stock:
          p.stock +
          items
            .filter((i) => i.productId === p.id)
            .reduce((s, i) => s + i.quantity, 0),
      })),
    );
    setMovements((ms) => [
      ...items.map((i) => ({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        productId: i.productId,
        quantity: i.quantity,
        reason,
      })),
      ...ms,
    ]);
  }
  function login(user: string, password: string) {
    if (user === "admin_pbdy" && password === "adminpassword123") {
      setAuthenticated(true);
      sessionStorage.setItem("pbdy-admin", "yes");
      return true;
    }
    return false;
  }
  function logout() {
    setAuthenticated(false);
    sessionStorage.removeItem("pbdy-admin");
  }
  return {
    products,
    setProducts,
    cart,
    setCart,
    orders,
    setOrders,
    suppliers,
    setSuppliers,
    purchases,
    setPurchases,
    movements,
    setMovements,
    dark,
    setDark,
    toast,
    notify,
    authenticated,
    add,
    updateCart,
    placeOrder,
    stockIn,
    login,
    logout,
  };
}
const Context = createContext<ReturnType<typeof useAppStore> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useStore() {
  const s = useContext(Context);
  if (!s) throw new Error("Store tidak tersedia");
  return s;
}
