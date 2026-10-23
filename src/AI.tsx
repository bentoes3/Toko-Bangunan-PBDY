import { useState, useRef, useEffect, type PointerEvent, type FormEvent, type ReactNode } from "react";
import { Camera, ImagePlus, ScanLine, Sparkles, Plus, Send, RotateCcw, LoaderCircle, Square, X, ArrowDown, Trash2, ShoppingCart } from "lucide-react";
import { Modal, ProductCard, Notice, Tag } from "./ui";
import { useStore } from "./store";
import { conversion, money, type Product } from "./domain";
import { chatWithAI, getAIStatus, identifyWithAI } from "./ai-client";
import type { AIMessage, AIRecommendation, AIStatus, Identification } from "./ai-types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
function canvasImage(canvas: HTMLCanvasElement) {
  let data = canvas.toDataURL("image/jpeg", 0.82);
  for (const quality of [0.68, 0.52, 0.36]) {
    if (data.length <= 1_300_000) break;
    data = canvas.toDataURL("image/jpeg", quality);
  }
  if (data.length > 1_300_000) throw new Error("Gambar terlalu rumit. Coba foto dengan ukuran lebih kecil.");
  return data;
}

// Shared with the admin product form. Only real raster images reach the AI.
export function readImage(file: File | undefined, onLoad: (s: string) => void, onError: (s: string) => void) {
  if (!file) return;
  if (!IMAGE_TYPES.includes(file.type)) { onError("Pilih file gambar JPG, PNG, atau WebP."); return; }
  if (file.size > 8 * 1024 * 1024) { onError("Ukuran gambar maksimal 8 MB."); return; }
  void (async () => {
    let url = "";
    try {
      const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte);
      const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
      if (!(file.type === "image/jpeg" && jpeg || file.type === "image/png" && png || file.type === "image/webp" && webp)) throw new Error("Isi file bukan gambar JPG, PNG, atau WebP yang valid.");
      url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error("Gambar tidak dapat dibaca. Coba file lain.")); img.src = url; });
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40_000_000) throw new Error("Resolusi foto terlalu besar. Gunakan foto di bawah 40 megapiksel.");
      const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Browser belum dapat mengolah gambar.");
      context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      onLoad(canvasImage(canvas));
    } catch (error) { onError(error instanceof Error ? error.message : "Gambar tidak dapat dibaca. Coba file lain."); }
    finally { if (url) URL.revokeObjectURL(url); }
  })();
}

function useAIService() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  async function check() {
    controller.current?.abort();
    const next = new AbortController(); controller.current = next;
    setChecking(true); setError("");
    try {
      const result = await getAIStatus(next.signal);
      if (!next.signal.aborted) setStatus(result);
    } catch (e) {
      if (!next.signal.aborted) { setStatus({ ready: false }); setError(e instanceof Error ? e.message : "Koneksi ke layanan AI belum tersedia."); }
    } finally { if (!next.signal.aborted) setChecking(false); }
  }
  useEffect(() => { void check(); return () => controller.current?.abort(); }, []);
  return { status, checking, error, check };
}
function ServiceStatus({ service }: { service: ReturnType<typeof useAIService> }) {
  if (service.status?.ready && !service.checking) return null;
  return <div className="ai-service-status" role="status">
    {service.checking ? <><LoaderCircle size={18} className="spin" /> Memeriksa koneksi AI…</> : <>
      <div><strong>Layanan AI belum tersedia</strong><p>{service.error || "Koneksi ke penyedia AI belum diaktifkan. Anda tetap bisa melihat katalog dan menggunakan kalkulator cat."}</p></div>
      <button type="button" className="btn white" onClick={() => void service.check()}><RotateCcw size={16} /> Periksa lagi</button>
    </>}
  </div>;
}

export function VisualSearch({ onClose, onDetail }: { onClose: () => void; onDetail: (p: Product) => void }) {
  const { products, notify } = useStore();
  const service = useAIService();
  const [image, setImage] = useState("");
  const [cropped, setCropped] = useState("");
  const [imageRatio, setImageRatio] = useState(1);
  const [loadingImage, setLoadingImage] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [error, setError] = useState("");
  const [box, setBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const imgRef = useRef<HTMLImageElement>(null);
  const request = useRef<AbortController | null>(null);
  const loadVersion = useRef(0);
  const drag = useRef<{ x: number; y: number; box: typeof box; mode: string } | null>(null);
  useEffect(() => () => { request.current?.abort(); loadVersion.current++; }, []);
  function invalidate() { request.current?.abort(); request.current = null; setProcessing(false); setResult(null); setError(""); setCropped(""); }
  function updateBox(next: typeof box) { invalidate(); setBox(next); }
  function start(e: PointerEvent<HTMLDivElement>, mode: string) {
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, box: { ...box }, mode };
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect(), d = drag.current, b = d.box;
    const dx = (e.clientX - d.x) / r.width * 100, dy = (e.clientY - d.y) / r.height * 100;
    if (d.mode === "move") updateBox({ ...b, x: Math.max(0, Math.min(100 - b.w, b.x + dx)), y: Math.max(0, Math.min(100 - b.h, b.y + dy)) });
    else {
      const left = d.mode.includes("l"), top = d.mode.includes("t");
      const x = left ? Math.max(0, Math.min(b.x + b.w - 10, b.x + dx)) : b.x;
      const y = top ? Math.max(0, Math.min(b.y + b.h - 10, b.y + dy)) : b.y;
      updateBox({ x, y, w: left ? b.x + b.w - x : Math.max(10, Math.min(100 - b.x, b.w + dx)), h: top ? b.y + b.h - y : Math.max(10, Math.min(100 - b.y, b.h + dy)) });
    }
  }
  function load(file: File | undefined) {
    if (!file) return;
    invalidate(); const version = ++loadVersion.current; setLoadingImage(true);
    readImage(file, (value) => { if (version !== loadVersion.current) return; setImage(value); setBox({ x: 0, y: 0, w: 100, h: 100 }); setLoadingImage(false); }, (message) => { if (version !== loadVersion.current) return; notify(message); setLoadingImage(false); });
  }
  async function process() {
    if (!imgRef.current || processing || !service.status?.ready) return;
    request.current?.abort(); const next = new AbortController(); request.current = next;
    setResult(null); setError(""); setProcessing(true);
    try {
      const img = imgRef.current;
      const w = box.w / 100 * img.naturalWidth, h = box.h / 100 * img.naturalHeight;
      const scale = Math.min(1, 1280 / Math.max(w, h));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(w * scale)); canvas.height = Math.max(1, Math.round(h * scale));
      const context = canvas.getContext("2d"); if (!context) throw new Error("Browser belum dapat mengolah foto.");
      context.drawImage(img, box.x / 100 * img.naturalWidth, box.y / 100 * img.naturalHeight, w, h, 0, 0, canvas.width, canvas.height);
      const photo = canvasImage(canvas); setCropped(photo);
      const identified = await identifyWithAI(photo, products, next.signal);
      if (request.current === next && !next.signal.aborted) setResult(identified);
    } catch (e) {
      if (request.current === next && !next.signal.aborted) setError(e instanceof Error ? e.message : "Foto belum dapat dianalisis. Coba lagi.");
    } finally { if (request.current === next) setProcessing(false); }
  }
  const matches = result?.status === "identified" ? products.filter((p) => p.active && result.productIds.includes(p.id)) : [];
  const close = () => { request.current?.abort(); onClose(); };
  return <Modal title="Cari material lewat foto" onClose={close} wide>
    <div className="ai-modal-intro"><span className="ai-icon"><ScanLine size={26} /></span><div><h3>Kenali barang sebelum berbelanja.</h3><p>AI membaca foto dan mencocokkannya dengan katalog PBDY.</p></div></div>
    <ServiceStatus service={service} />
    <p className="ai-photo-note small muted">Foto hanya dikirim ke layanan AI saat Anda menekan “Kenali objek”. Gunakan foto barang tanpa wajah atau informasi pribadi.</p>
    {!image ? <div className="upload-zone"><ImagePlus size={45} /><h3>Foto material yang Anda cari</h3><p>JPG, PNG, WebP · maksimal 8 MB</p><div className="button-row">
      <label className="btn primary">Pilih dari Galeri<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Pilih foto material" onChange={(e) => { load(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <label className="btn white"><Camera size={18} /> Ambil Foto<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" aria-label="Ambil foto material" onChange={(e) => { load(e.target.files?.[0]); e.target.value = ""; }} /></label>
    </div>{loadingImage && <p role="status">Menyiapkan foto…</p>}</div> : <>
      <div className="visual-layout"><div><div className="crop-stage" style={{ maxWidth: Math.min(450, imageRatio * 350) }}>
        <img ref={imgRef} src={image} alt="Foto objek yang akan dianalisis" draggable={false} onLoad={(e) => setImageRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />
        <div className="crop-box" style={{ left: box.x + "%", top: box.y + "%", width: box.w + "%", height: box.h + "%" }} onPointerDown={(e) => start(e, "move")} onPointerMove={move} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null}>
          <span className="crop-grid" />{["tl", "tr", "bl", "br"].map((corner) => <div className={"crop-handle " + corner} key={corner} onPointerDown={(e) => start(e, corner)} onPointerMove={move} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null} />)}
        </div>
      </div><p className="small muted">Seluruh foto dipilih. Untuk fokus pada satu barang, geser kotak atau atur area di bawah.</p>
        <div className="crop-controls">{[["x", "Posisi X", 100 - box.w], ["y", "Posisi Y", 100 - box.h], ["w", "Lebar", 100 - box.x], ["h", "Tinggi", 100 - box.y]].map(([key, label, max]) => <label key={String(key)}>{label}<input type="range" min={key === "w" || key === "h" ? 10 : 0} max={Number(max)} value={box[key as keyof typeof box]} onChange={(e) => updateBox({ ...box, [key]: Number(e.target.value) })} /></label>)}</div>
      </div><div className="scan-options"><h3>Pilih barangnya, lalu kenali</h3><p className="muted">Nama barang, ciri yang terlihat, dan pilihan produk akan muncul setelah foto dianalisis. Jika foto kurang jelas, AI akan meminta detail tambahan.</p>
        <button className="btn primary full" onClick={() => void process()} disabled={processing || loadingImage || !service.status?.ready}>{processing ? <LoaderCircle size={18} className="spin" /> : <ScanLine size={18} />}{processing ? "Sedang membaca foto…" : "Kenali objek"}</button>
        {processing && <button className="btn white full" onClick={() => { request.current?.abort(); setProcessing(false); }}>Batalkan analisis</button>}
        <button className="btn white full" onClick={() => { invalidate(); loadVersion.current++; setImage(""); }}><RotateCcw size={16} /> Ganti foto</button>
        <a href="#/katalog" onClick={close} className="btn white full">Cari di katalog</a>
        {cropped && result && <div className="crop-preview"><img src={cropped} alt="Area foto yang dianalisis" /><span>Area yang dianalisis</span></div>}
      </div></div>
      {error && <div className="ai-chat-error" role="alert"><p>{error}</p><button className="btn white" onClick={() => void process()} disabled={!service.status?.ready}>Coba analisis lagi</button></div>}
      {result && <section className="visual-results" aria-live="polite"><div className="ai-vision-summary">
        <Tag tone={result.status === "identified" ? "green" : "yellow"}>{result.status === "identified" ? "Objek dikenali" : result.status === "not_building" ? "Bukan barang bangunan" : "Belum dapat dikenali"}</Tag>
        <h3>{result.status === "identified" ? result.name : result.status === "not_building" ? "Foto ini bukan barang bangunan" : "Saya belum yakin dengan objek ini"}</h3><p>{result.description}</p>
        {!!result.observations.length && <ul className="ai-observations">{result.observations.map((line, i) => <li key={i}>{line}</li>)}</ul>}
        {!!result.questions.length && <div><strong>Detail yang akan membantu</strong><ul>{result.questions.map((line, i) => <li key={i}>{line}</li>)}</ul></div>}
        {result.status === "identified" && <p className="small muted">{result.confidence === "low" ? "Identifikasi masih tentatif; periksa kembali nama, ukuran, dan spesifikasi barang." : "Periksa kembali ukuran dan spesifikasi sebelum membeli. Kemiripan foto belum memastikan barang identik."}</p>}
      </div>{result.status === "identified" && <><h3>{matches.length ? "Pilihan dari katalog PBDY" : "Belum ada produk yang cocok di katalog PBDY"}</h3>{!matches.length && <p>Nama dan ciri barang di atas bisa Anda gunakan untuk bertanya kepada staf atau mencarinya di toko lain.</p>}<div className="product-grid">{matches.map((p) => <ProductCard key={p.id} p={p} onDetail={(product) => { close(); onDetail(product); }} />)}</div></>}
      </section>}
    </>}
  </Modal>;
}

interface ChatMessage extends AIMessage {
  id: string;
  recommendations?: AIRecommendation[];
  phase?: "recommendations";
  state?: "streaming" | "error" | "stopped";
}
const greeting = (): ChatMessage => ({ id: "welcome", role: "assistant", text: "Halo! Saya Rena, konsultan bangunan PBDY. Ceritakan apa yang ingin Anda buat atau perbaiki. Kita bisa membahas rencana, ukuran, bahan, alat, dan pilihan produk. Anda juga bisa melampirkan foto sebagai referensi." });
const HISTORY_KEY = "pbdy-ai-conversation-v1";
let rememberedHistory: ChatMessage[] | null = null;
function initialHistory() {
  if (rememberedHistory) return rememberedHistory;
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "null");
    if (Array.isArray(saved)) {
      const valid = saved.filter((m): m is ChatMessage => !!m && ["assistant", "user"].includes(m.role) && typeof m.text === "string" && typeof m.id === "string").slice(-40).map((m) => ({ ...m, image: undefined, state: undefined, recommendations: undefined }));
      if (valid.length) return valid;
    }
  } catch {}
  return [greeting()];
}
function remember(messages: ChatMessage[]) {
  rememberedHistory = messages.slice(-40);
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.filter((m) => m.state !== "error").slice(-40).map(({ id, role, text }) => ({ id, role, text })))); } catch {}
}
function inlineText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
}
function MessageText({ text }: { text: string }) {
  return <div className="ai-message-content">{text.split(/\n\n+/).map((paragraph, i) => {
    const lines = paragraph.split("\n");
    if (lines.every((line) => /^\s*[-*•]\s+/.test(line))) return <ul key={i}>{lines.map((line, n) => <li key={n}>{inlineText(line.replace(/^\s*[-*•]\s+/, ""))}</li>)}</ul>;
    if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) return <ol key={i}>{lines.map((line, n) => <li key={n}>{inlineText(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>)}</ol>;
    return <p key={i}>{lines.map((line, n) => <span key={n}>{n > 0 && <br />}{inlineText(line.replace(/^#{1,4}\s+/, ""))}</span>)}</p>;
  })}</div>;
}
function Recommendation({ item }: { item: AIRecommendation }) {
  const { products, cart, add } = useStore();
  const options = products.filter((p) => p.active && item.options.includes(p.id));
  const [chosen, setChosen] = useState(options.find((p) => p.stock > 0)?.id || options[0]?.id || "");
  const product = options.find((p) => p.id === chosen) || options[0];
  const [selectedUnit, setSelectedUnit] = useState(item.unit || product?.unit || "");
  const unit = product?.units.some((u) => u.name === selectedUnit) ? selectedUnit : product?.unit || "";
  const [quantity, setQuantity] = useState(item.quantity && Number.isInteger(item.quantity) && item.quantity > 0 ? String(item.quantity) : "1");
  const amount = Number(quantity);
  const factor = product ? conversion(product, unit) : 1;
  const reserved = product ? cart.filter((i) => i.productId === product.id).reduce((total, i) => total + i.quantity * conversion(product, i.unit), 0) : 0;
  const maximum = product ? Math.max(0, Math.floor((product.stock - reserved) / factor)) : 0;
  const validAmount = Number.isInteger(amount) && amount >= 1 && amount <= maximum;
  return <article className="ai-recommendation"><div className="ai-recommendation-heading"><strong>{item.label}</strong>{!options.length && <Tag tone="yellow">Tidak tersedia di toko</Tag>}</div><p>{item.reason}</p>
    {!options.length ? <p className="small muted">Bahan ini belum ada di katalog PBDY. Gunakan nama dan spesifikasi di atas untuk mencarinya di toko lain.</p> : <>
      <label>Pilih produk<select value={product.id} onChange={(e) => { setChosen(e.target.value); const next = options.find((p) => p.id === e.target.value); setSelectedUnit(next?.units.some((u) => u.name === item.unit) ? item.unit! : next?.unit || ""); }}>{options.map((p) => <option key={p.id} value={p.id}>{p.name}{p.stock <= 0 ? " — Stok habis" : ""}</option>)}</select></label>
      <div className="ai-recommendation-controls"><label>Jumlah<input type="number" inputMode="numeric" min="1" max={maximum || 1} step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label>Satuan<select value={unit} onChange={(e) => setSelectedUnit(e.target.value)}>{product.units.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}</select></label></div>
      <div className="ai-recommendation-price"><strong>{money(product.price * factor)} / {unit}</strong><span className="small muted">{product.stock > 0 ? `Stok ${product.stock} ${product.unit}` : "Stok habis"}</span></div>
      {!item.quantity && <p className="small muted">Jumlah awal 1. Sesuaikan dengan ukuran dan kebutuhan proyek Anda.</p>}
      {item.quantity && <p className="small muted">Jumlah dari AI adalah perkiraan. Pastikan ukuran dan satuannya sesuai sebelum membeli.</p>}
      {product.stock > 0 && !validAmount && <p className="form-error">{maximum ? `Jumlah yang dapat ditambahkan maksimal ${maximum} ${unit}.` : "Stok sudah terpakai di keranjang atau tidak cukup untuk satuan ini."}</p>}
      <button type="button" className="btn primary full" disabled={!validAmount || product.stock <= 0} onClick={() => add(product, unit, amount)}><Plus size={17} />{product.stock <= 0 ? "Stok habis" : `Tambah ke keranjang${validAmount ? " · " + money(product.price * factor * amount) : ""}`}</button>
    </>}
  </article>;
}

export function Advisor({ onClose }: { onClose: () => void }) {
  const { products, notify } = useStore();
  const service = useAIService();
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const imageVersion = useRef(0);
  const currentMessages = useRef(messages);
  const lastRequest = useRef<{ user: ChatMessage; before: ChatMessage[] } | null>(null);
  currentMessages.current = messages;
  useEffect(() => { remember(messages); }, [messages]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; controller.current?.abort(); imageVersion.current++;
    remember(currentMessages.current.map((m) => m.state === "streaming" ? { ...m, state: "stopped", phase: undefined } : m));
    };
  }, []);
  useEffect(() => {
    const node = composer.current; if (node) { node.style.height = "auto"; node.style.height = Math.min(node.scrollHeight, 150) + "px"; }
  }, [text]);
  useEffect(() => { if (!awayFromBottom && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages, busy, awayFromBottom]);
  function load(file: File | undefined) {
    if (!file) return; const version = ++imageVersion.current; setLoadingImage(true);
    readImage(file, (photo) => { if (!mounted.current || version !== imageVersion.current) return; setImage(photo); setLoadingImage(false); }, (message) => { if (!mounted.current || version !== imageVersion.current) return; notify(message); setLoadingImage(false); });
  }
  async function run(user: ChatMessage, before: ChatMessage[]) {
    if (busy || controller.current || !service.status?.ready) return;
    const next = new AbortController(); controller.current = next;
    const responseId = crypto.randomUUID();
    const answer: ChatMessage = { id: responseId, role: "assistant", text: "", state: "streaming" };
    lastRequest.current = { user, before }; setMessages([...before, user, answer]); setText(""); setImage(""); setError(""); setBusy(true); setAwayFromBottom(false);
    try {
      await chatWithAI([...before.filter((m) => m.state !== "error"), user], products, next.signal, (event) => {
        if (!mounted.current || next.signal.aborted || controller.current !== next) return;
        setMessages((previous) => previous.map((message) => message.id !== responseId ? message : event.type === "delta" ? { ...message, text: message.text + event.text } : event.type === "phase" ? { ...message, phase: event.phase } : event.type === "recommendations" ? { ...message, recommendations: event.items, phase: undefined } : { ...message, state: undefined, phase: undefined }));
      });
      if (mounted.current && !next.signal.aborted) { setMessages((previous) => previous.map((message) => message.id === responseId ? { ...message, state: undefined, phase: undefined } : message)); lastRequest.current = null; }
    } catch (e) {
      if (!mounted.current || controller.current !== next) return;
      if (next.signal.aborted) setMessages((previous) => previous.map((message) => message.id === responseId ? { ...message, state: "stopped", phase: undefined, recommendations: undefined } : message));
      else {
        setError(e instanceof Error ? e.message : "Pesan belum dapat dikirim. Coba lagi.");
        setMessages((previous) => previous.map((message) => message.id === responseId || message.id === user.id ? { ...message, state: "error", phase: undefined, recommendations: undefined } : message));
        setText((draft) => draft || user.text); setImage((photo) => photo || user.image || "");
      }
    } finally { if (mounted.current && controller.current === next) { setBusy(false); controller.current = null; } }
  }
  function send(e?: FormEvent) {
    e?.preventDefault(); if ((!text.trim() && !image) || busy || loadingImage || !service.status?.ready) return;
    if (lastRequest.current && error && text.trim() === lastRequest.current.user.text && (image || undefined) === lastRequest.current.user.image) { void run(lastRequest.current.user, lastRequest.current.before); return; }
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", text: text.trim() || "Tolong bantu jelaskan objek atau rencana proyek pada foto ini.", ...(image ? { image } : {}) };
    void run(user, messages.filter((m) => m.state !== "error"));
  }
  function close() { controller.current?.abort(); onClose(); }
  return <Modal title="Konsultan AI bangunan" onClose={close} wide>
    <div className="chat-section ai-chat-shell"><div className="chat-heading"><span className="ai-icon"><Sparkles size={23} /></span><div><strong>Rena · Konsultan PBDY</strong><small><span className="dot" />{busy ? "Sedang menyusun jawaban" : service.status?.ready ? "Diskusi bahan, alat, dan rencana proyek" : "Koneksi AI belum siap"}</small></div><div className="ai-chat-toolbar"><a href="#/keranjang" onClick={close} className="icon-button" aria-label="Buka keranjang" title="Buka keranjang"><ShoppingCart size={19} /></a><button type="button" className="icon-button" disabled={busy} title="Mulai percakapan baru" aria-label="Mulai percakapan baru" onClick={() => { setMessages([greeting()]); setError(""); lastRequest.current = null; }}><Trash2 size={18} /></button></div></div>
      <ServiceStatus service={service} />
      <div className="chat-messages" ref={scroll} role="log" aria-label="Percakapan dengan Rena" aria-live="off" onScroll={() => { const node = scroll.current; if (node) setAwayFromBottom(node.scrollHeight - node.scrollTop - node.clientHeight > 100); }}>
        {messages.map((message) => <div key={message.id} className={"chat-message " + message.role}>{message.role === "assistant" && <Sparkles size={17} />}<div>
          {message.image && <img src={message.image} alt="Foto referensi proyek yang Anda lampirkan" />}
          {!!message.text && <MessageText text={message.text} />}
          {message.state === "streaming" && !message.text && <p className="ai-message-note"><LoaderCircle size={16} className="spin" /> Rena sedang berpikir…</p>}
          {message.state === "streaming" && message.text && !message.phase && <span className="ai-stream-cursor" aria-hidden="true" />}
          {message.state === "streaming" && message.phase === "recommendations" && <p className="ai-message-note"><LoaderCircle size={16} className="spin" /> Menyiapkan pilihan bahan…</p>}
          {message.state === "error" && <p className="ai-message-note">{message.role === "user" ? "Belum berhasil dikirim" : "Jawaban belum selesai"}</p>}
          {message.state === "stopped" && <p className="ai-message-note">Jawaban dihentikan.</p>}
          {!!message.recommendations?.length && message.state !== "error" && <div className="ai-recommendations"><h4>Bahan & alat untuk rencana Anda</h4><p className="small muted">Pilih produk, jumlah, dan satuannya. Harga dan stok mengikuti katalog saat ini.</p>{message.recommendations.map((item, i) => <Recommendation key={message.id + "-" + i} item={item} />)}</div>}
        </div></div>)}
      </div>
      <span className="sr-only" role="status">{busy ? "AI sedang menjawab" : error ? "Pesan gagal dikirim" : "Siap menerima pesan"}</span>
      {awayFromBottom && <button type="button" className="btn white ai-scroll-latest" onClick={() => { setAwayFromBottom(false); if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }}><ArrowDown size={16} /> Jawaban terbaru</button>}
      {messages.length <= 1 && <div className="chat-suggestions">{["Bantu saya membuat lemari. Saya akan lampirkan foto referensinya.", "Saya ingin merenovasi kamar. Kita mulai dari mana?", "Bahan dan alat apa saja untuk memperbaiki keran bocor?"].map((prompt) => <button type="button" key={prompt} onClick={() => { setText(prompt); composer.current?.focus(); }}>{prompt}</button>)}</div>}
      {error && <div className="ai-chat-error" role="alert"><p>{error}</p>{lastRequest.current && <button type="button" className="btn white" disabled={busy || !service.status?.ready} onClick={() => { const previous = lastRequest.current; if (previous) void run(previous.user, previous.before); }}><RotateCcw size={16} /> Coba kirim lagi</button>}</div>}
      {image && <div className="attached-image"><img src={image} alt="Foto yang akan dikirim bersama pesan" /><div><span className="small">Foto siap dikirim ke AI bersama pesan.</span><button type="button" onClick={() => { imageVersion.current++; setImage(""); setLoadingImage(false); }}><X size={14} /> Hapus foto</button></div></div>}
      {loadingImage && <p className="small muted" role="status">Menyiapkan foto…</p>}
      <form className="chat-input" onSubmit={send}><label className="icon-button" title="Lampirkan foto proyek"><ImagePlus size={21} /><input type="file" aria-label="Lampirkan foto proyek" accept="image/jpeg,image/png,image/webp" disabled={busy || loadingImage} onChange={(e) => { load(e.target.files?.[0]); e.target.value = ""; }} /></label>
        <textarea ref={composer} aria-label="Pesan untuk konsultan AI" placeholder="Ceritakan proyek Anda, lalu kita bahas bersama…" rows={1} maxLength={6000} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
        {busy ? <button type="button" className="send-button" aria-label="Hentikan jawaban" title="Hentikan jawaban" onClick={() => controller.current?.abort()}><Square size={17} /></button> : <button type="submit" className="send-button" aria-label="Kirim pesan" disabled={(!text.trim() && !image) || loadingImage || !service.status?.ready}><Send size={18} /></button>}
      </form><p className="ai-photo-note small muted">Enter untuk kirim · Shift + Enter untuk baris baru. Foto dikirim ke layanan AI bersama pesan dan tidak disimpan di riwayat browser. AI bisa keliru; periksa ukuran dan spesifikasi sebelum membeli.</p>
    </div>
  </Modal>;
}
