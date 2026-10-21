import { useEffect, useRef, type ReactNode } from "react";
import {
  X,
  ArrowUpRight,
  Package,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useStore } from "./store";
import { money, type Product } from "./domain";
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <a
      href="#/"
      className={"logo " + (small ? "small" : "")}
      aria-label="PB.DY Beranda"
    >
      <span className="logo-mark">
        <svg viewBox="0 0 42 38" fill="none">
          <path
            d="M3 19 21 4l18 15M9 17v17h24V17"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
          />
          <path d="M16 21h10v13H16z" fill="currentColor" />
        </svg>
      </span>
      <span>
        PB<span className="logo-dot">.</span>DY<small>TOKO BANGUNAN</small>
      </span>
    </a>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement as HTMLElement;
    const backdrop = ref.current?.parentElement;
    const siblings = Array.from(backdrop?.parentElement?.children || []).filter(
      (el) => el !== backdrop && el instanceof HTMLElement,
    ) as HTMLElement[];
    const inertBefore = siblings.map((el) => el.inert);
    siblings.forEach((el) => (el.inert = true));
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      siblings.forEach((el, i) => (el.inert = inertBefore[i]));
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "wide" : "")}
        initial={{ y: 25, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup">
            <X size={22} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
export function Tag({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={"tag " + tone}>{children}</span>;
}
export function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Package size={42} />
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}
export function Quantity({
  value,
  max = 999,
  onChange,
}: {
  value: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Kurangi jumlah"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Tambah jumlah"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function ProductCard({
  p,
  onDetail,
}: {
  p: Product;
  onDetail: (p: Product) => void;
}) {
  const { add } = useStore();
  return (
    <motion.article layout className="product-card">
      <button
        className={"product-photo photo-" + p.id}
        onClick={() => onDetail(p)}
        aria-label={"Detail " + p.name}
      >
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/material-default.svg";
          }}
        />
        {p.badge && <span className="product-badge">{p.badge}</span>}
        <span className="photo-open">
          <ArrowUpRight size={18} />
        </span>
      </button>
      <div className="product-info">
        <span className="eyebrow">{p.category}</span>
        <button className="product-title" onClick={() => onDetail(p)}>
          {p.name}
        </button>
        <div className="stock">
          <span className={p.stock <= p.safety ? "dot amber" : "dot"} />
          {p.stock > 0 ? `Tersedia ${p.stock} ${p.unit}` : "Stok habis"}
        </div>
        <div className="product-bottom">
          <div>
            <strong>{money(p.price)}</strong>
            <span> / {p.unit}</span>
          </div>
          <button
            className="add-button"
            aria-label={"Tambah " + p.name}
            disabled={!p.stock}
            onClick={() => add(p)}
          >
            <Plus size={19} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
export function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          className="toast"
          initial={{ y: 70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Check size={19} />
          <span>{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <TriangleAlert size={18} />
      <span>{children}</span>
    </div>
  );
}
