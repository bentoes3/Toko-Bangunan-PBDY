import { useState, useRef, type PointerEvent, type FormEvent } from "react";
import {
  Camera,
  ImagePlus,
  ScanLine,
  Sparkles,
  ArrowRight,
  Plus,
  Send,
  Ruler,
  RotateCcw,
  Check,
  LoaderCircle,
} from "lucide-react";
import { Modal, ProductCard, Notice, Tag, Empty } from "./ui";
import { useStore } from "./store";
import { estimate, money, type Product } from "./domain";
export function readImage(
  file: File | undefined,
  onLoad: (s: string) => void,
  onError: (s: string) => void,
) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    onError("Pilih file gambar JPG, PNG, atau WebP.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    onError("Ukuran gambar maksimal 8 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result));
  reader.onerror = () => onError("Gambar tidak dapat dibaca. Coba file lain.");
  reader.readAsDataURL(file);
}
export function VisualSearch({
  onClose,
  onDetail,
}: {
  onClose: () => void;
  onDetail: (p: Product) => void;
}) {
  const { products, notify } = useStore();
  const [image, setImage] = useState("");
  const [cropped, setCropped] = useState("");
  const [imageRatio, setImageRatio] = useState(1);
  const [category, setCategory] = useState("Pipa & Fitting");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(false);
  const [box, setBox] = useState({ x: 20, y: 20, w: 60, h: 60 });
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    box: typeof box;
    mode: string;
  } | null>(null);
  function start(e: PointerEvent<HTMLDivElement>, mode: string) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, box: { ...box }, mode };
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect(),
      d = drag.current,
      b = d.box,
      dx = ((e.clientX - d.x) / r.width) * 100,
      dy = ((e.clientY - d.y) / r.height) * 100;
    if (d.mode === "move")
      setBox({
        ...b,
        x: Math.max(0, Math.min(100 - b.w, b.x + dx)),
        y: Math.max(0, Math.min(100 - b.h, b.y + dy)),
      });
    else {
      const left = d.mode.includes("l"),
        top = d.mode.includes("t");
      const x = left ? Math.max(0, Math.min(b.x + b.w - 10, b.x + dx)) : b.x,
        y = top ? Math.max(0, Math.min(b.y + b.h - 10, b.y + dy)) : b.y;
      setBox({
        x,
        y,
        w: left ? b.x + b.w - x : Math.max(10, Math.min(100 - b.x, b.w + dx)),
        h: top ? b.y + b.h - y : Math.max(10, Math.min(100 - b.y, b.h + dy)),
      });
    }
  }
  function process() {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = Math.max(
      1,
      Math.round(
        (400 * (box.h * img.naturalHeight)) / (box.w * img.naturalWidth),
      ),
    );
    canvas
      .getContext("2d")
      ?.drawImage(
        img,
        (box.x / 100) * img.naturalWidth,
        (box.y / 100) * img.naturalHeight,
        (box.w / 100) * img.naturalWidth,
        (box.h / 100) * img.naturalHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    setCropped(canvas.toDataURL("image/jpeg"));
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setResult(true);
    }, 1000);
  }
  const load = (file: File | undefined) =>
    readImage(
      file,
      (s) => {
        setImage(s);
        setResult(false);
        setBox({ x: 20, y: 20, w: 60, h: 60 });
      },
      notify,
    );
  return (
    <Modal title="Pencarian Visual" onClose={onClose} wide>
      <div className="ai-modal-intro">
        <span className="ai-icon">
          <ScanLine size={26} />
        </span>
        <div>
          <h3>Satu foto, temukan materialnya.</h3>
          <p>
            Unggah foto, lalu geser dan ubah ukuran kotak untuk memilih objek.
          </p>
        </div>
        <Tag tone="yellow">AI Simulasi</Tag>
      </div>
      <Notice>
        Demo pencocokan katalog, tanpa model vision. Hasil mengikuti kategori
        contoh yang Anda pilih, bukan identifikasi gambar sesungguhnya.
      </Notice>
      {!image ? (
        <div className="upload-zone">
          <ImagePlus size={45} />
          <h3>Foto material yang Anda cari</h3>
          <p>JPG, PNG, WebP · maksimal 8 MB</p>
          <div className="button-row">
            <label className="btn primary">
              Pilih dari Galeri
              <input
                type="file"
                accept="image/*"
                aria-label="Pilih foto material"
                onChange={(e) => load(e.target.files?.[0])}
              />
            </label>
            <label className="btn white">
              <Camera size={18} /> Ambil Foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                aria-label="Ambil foto material"
                onChange={(e) => load(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="visual-layout">
            <div>
              <div
                className="crop-stage"
                style={{ maxWidth: Math.min(450, imageRatio * 350) }}
              >
                <img
                  ref={imgRef}
                  onLoad={(e) =>
                    setImageRatio(
                      e.currentTarget.naturalWidth /
                        e.currentTarget.naturalHeight,
                    )
                  }
                  src={image}
                  alt="Foto material untuk diseleksi"
                  draggable={false}
                />
                <div
                  className="crop-box"
                  style={{
                    left: box.x + "%",
                    top: box.y + "%",
                    width: box.w + "%",
                    height: box.h + "%",
                  }}
                  onPointerDown={(e) => start(e, "move")}
                  onPointerMove={move}
                  onPointerUp={() => (drag.current = null)}
                >
                  <span className="crop-grid" />
                  {["tl", "tr", "bl", "br"].map((c) => (
                    <div
                      className={"crop-handle " + c}
                      key={c}
                      onPointerDown={(e) => start(e, c)}
                      onPointerMove={move}
                      onPointerUp={() => (drag.current = null)}
                    />
                  ))}
                </div>
              </div>
              <p className="small muted">
                Geser kotak, tarik sudut untuk mengubah ukuran. Atau atur dengan
                kontrol berikut.
              </p>
              <div className="crop-controls">
                {[
                  ["x", "Posisi X", 100 - box.w],
                  ["y", "Posisi Y", 100 - box.h],
                  ["w", "Lebar", 100 - box.x],
                  ["h", "Tinggi", 100 - box.y],
                ].map(([k, label, max]) => (
                  <label key={String(k)}>
                    {label}
                    <input
                      type="range"
                      min={k === "w" || k === "h" ? 10 : 0}
                      max={Number(max)}
                      value={box[k as keyof typeof box]}
                      onChange={(e) =>
                        setBox((b) => ({ ...b, [k]: Number(e.target.value) }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="scan-options">
              <h3>Pilih objek yang ingin dicari</h3>
              <p className="muted">
                Untuk demonstrasi, pilih kategori material di dalam seleksi.
              </p>
              <label>
                Kategori contoh
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setResult(false);
                  }}
                >
                  {Array.from(
                    new Set(
                      products.filter((p) => p.active).map((p) => p.category),
                    ),
                  ).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option>Objek tidak dikenal</option>
                </select>
              </label>
              <button
                className="btn primary full"
                onClick={process}
                disabled={processing}
              >
                {processing ? (
                  <LoaderCircle size={18} className="spin" />
                ) : (
                  <ScanLine size={18} />
                )}{" "}
                {processing
                  ? "Mencocokkan material..."
                  : "Cari dari Area Terpilih"}
              </button>
              <button
                className="btn white full"
                onClick={() => {
                  setImage("");
                  setResult(false);
                }}
              >
                <RotateCcw size={16} /> Ganti foto
              </button>
              {cropped && result && (
                <div className="crop-preview">
                  <img src={cropped} alt="Hasil potongan area terpilih" />
                  <span>Area pilihan Anda</span>
                </div>
              )}
            </div>
          </div>
          {result && (
            <section className="visual-results">
              <div className="section-heading">
                <div>
                  <h3>Hasil pencocokan: {category}</h3>
                  <p className="small muted">
                    Peringkat contoh simulasi — verifikasi ukuran dan
                    spesifikasi sebelum membeli.
                  </p>
                </div>
                <Check size={22} />
              </div>
              {category === "Objek tidak dikenal" && (
                <Empty
                  title="Produk tidak dapat dikenali"
                  detail="Coba seleksi objek lebih dekat atau gunakan pencarian teks."
                  action={
                    <a
                      href="#/katalog"
                      onClick={onClose}
                      className="btn primary"
                    >
                      Cari manual
                    </a>
                  }
                />
              )}
              <div className="product-grid">
                {products
                  .filter((p) => p.active && p.category === category)
                  .slice(0, 3)
                  .map((p, i) => (
                    <div key={p.id}>
                      <Tag>{98 - i * 7}% kecocokan demo</Tag>
                      <ProductCard
                        p={p}
                        onDetail={(p) => {
                          onClose();
                          onDetail(p);
                        }}
                      />
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </Modal>
  );
}
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  image?: string;
}
export function Advisor({ onClose }: { onClose: () => void }) {
  const { products, add, notify } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Halo! Saya Rena, asisten renovasi PB.DY. 👋 Mau memperbaiki bagian rumah yang mana? Ceritakan rencananya atau unggah foto area renovasi Anda.",
    },
  ]);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [kind, setKind] = useState("Cat dinding");
  const [dims, setDims] = useState({ length: "", width: "", height: "" });
  const [result, setResult] = useState<ReturnType<typeof estimate> | null>(
    null,
  );
  const [chosen, setChosen] = useState("cat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const respond = (content: string) => {
    setBusy(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: content }]);
      setBusy(false);
      setTimeout(
        () =>
          end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        20,
      );
    }, 550);
  };
  function send(e?: FormEvent) {
    e?.preventDefault();
    if ((!text.trim() && !image) || busy) return;
    const q = text.toLowerCase();
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: text || "Ini foto area yang ingin saya renovasi.",
        image: image || undefined,
      },
    ]);
    setImage("");
    setText("");
    setResult(null);
    if (/tanah kosong|bangun baru|dari nol|bangun rumah baru/.test(q)) {
      respond(
        "Saya khusus membantu renovasi dan perbaikan bangunan yang sudah ada. Untuk membangun dari tanah kosong, silakan konsultasi dengan staf toko PB.DY.",
      );
      return;
    }
    const k = /keramik|lantai/.test(q)
      ? "Ganti keramik"
      : /semen|tambal|plester|retak/.test(q)
        ? "Tambal lantai"
        : /cat|dinding/.test(q)
          ? "Cat dinding"
          : kind;
    setKind(k);
    setChosen(
      k === "Ganti keramik"
        ? "keramik"
        : k === "Tambal lantai"
          ? "semen"
          : "cat",
    );
    const nums =
      q.match(/\d+(?:[.,]\d+)?/g)?.map((s) => Number(s.replace(",", "."))) ||
      [];
    if (nums.length >= 3)
      setDims({
        length: String(nums[0]),
        width: String(nums[1]),
        height: String(nums[2]),
      });
    else if (nums.length === 2)
      setDims((d) => ({
        ...d,
        length: String(nums[0]),
        width: String(nums[1]),
      }));
    respond(
      `Baik, kita rencanakan ${k.toLowerCase()} untuk area yang sudah ada. ${nums.length < 3 ? "Berapa panjang, lebar, dan tinggi area dalam meter? Lengkapi ukuran di bawah agar hitungannya lebih akurat." : "Ukuran sudah saya isi dari pesan Anda. Periksa kembali, lalu hitung estimasinya."} Saya akan memasukkan cadangan material 10%. Foto menjadi referensi percakapan dalam demo ini.`,
    );
  }
  function calculate() {
    try {
      const r = estimate(
        kind,
        Number(dims.length),
        Number(dims.width),
        Number(dims.height),
      );
      setResult(r);
      setError("");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Luas ${r.area.toFixed(1)} m². Estimasi ${r.quantity} ${kind === "Cat dinding" ? "kaleng cat 5 liter" : kind === "Ganti keramik" ? "dus keramik" : "sak semen"}. Sudah termasuk cadangan 10%. Pilih merek di bawah untuk melihat harganya.`,
        },
      ]);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const options = products.filter(
    (p) =>
      p.active &&
      p.category ===
        (kind === "Cat dinding"
          ? "Cat"
          : kind === "Ganti keramik"
            ? "Keramik"
            : "Semen"),
  );
  const product = options.find((p) => p.id === chosen) || options[0];
  return (
    <Modal title="Asisten Renovasi" onClose={onClose} wide>
      <div className="advisor-layout">
        <div className="chat-section">
          <div className="chat-heading">
            <span className="ai-icon">
              <Sparkles size={22} />
            </span>
            <div>
              <strong>Rena · Asisten PB.DY</strong>
              <small>
                <span className="dot" />
                Siap bantu rencana renovasi
              </small>
            </div>
            <Tag tone="yellow">Simulasi</Tag>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={"chat-message " + m.role}>
                {m.role === "assistant" && <Sparkles size={17} />}
                <div>
                  {m.image && (
                    <img src={m.image} alt="Area renovasi yang diunggah" />
                  )}
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {busy && (
              <div className="chat-message assistant">
                <LoaderCircle className="spin" size={17} />
                <p>Rena sedang menyusun jawaban...</p>
              </div>
            )}
            <div ref={end} />
          </div>
          <div className="chat-suggestions">
            {[
              "Cat ulang kamar",
              "Ganti keramik dapur",
              "Tambal lantai retak",
            ].map((s) => (
              <button key={s} onClick={() => setText(s)}>
                {s}
              </button>
            ))}
          </div>
          {image && (
            <div className="attached-image">
              <img src={image} alt="Lampiran renovasi" />
              <button onClick={() => setImage("")}>Hapus foto</button>
            </div>
          )}
          <form className="chat-input" onSubmit={send}>
            <label className="icon-button" title="Lampirkan foto renovasi">
              <ImagePlus size={20} />
              <input
                type="file"
                aria-label="Foto area renovasi"
                accept="image/*"
                onChange={(e) =>
                  readImage(e.target.files?.[0], setImage, notify)
                }
              />
            </label>
            <input
              aria-label="Pesan untuk asisten"
              placeholder="Ceritakan rencana renovasi Anda..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className="send-button"
              aria-label="Kirim pesan"
              disabled={busy || (!text.trim() && !image)}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        <aside className="calculator-panel">
          <div className="eyebrow accent">
            <Ruler size={16} /> UKUR DULU, BELANJA TEPAT
          </div>
          <h3>Detail area renovasi</h3>
          <label>
            Jenis pekerjaan
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setResult(null);
              }}
            >
              <option>Cat dinding</option>
              <option>Ganti keramik</option>
              <option>Tambal lantai</option>
            </select>
          </label>
          <div className="dimensions">
            {[
              ["length", "Panjang"],
              ["width", "Lebar"],
              ["height", "Tinggi"],
            ].map(([k, label]) => (
              <label key={k}>
                {label} (m)
                <input
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  placeholder="0.0"
                  value={dims[k as keyof typeof dims]}
                  onChange={(e) => {
                    setDims((d) => ({ ...d, [k]: e.target.value }));
                    setResult(null);
                  }}
                />
              </label>
            ))}
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="btn primary full" onClick={calculate}>
            <Sparkles size={17} /> Hitung Kebutuhan
          </button>
          <p className="small muted">
            Kalkulasi berbasis rumus, bukan analisis foto oleh AI. Ukur area
            secara langsung untuk hasil lebih akurat.
          </p>
          {result && (
            <div className="estimate-result">
              <Tag>Estimasi siap</Tag>
              <h2>
                {result.quantity} <small>{product.unit}</small>
              </h2>
              <p>{result.area.toFixed(1)} m² · Cadangan 10%</p>
              <p className="small muted">{result.coverage}</p>
              <label>
                Pilih merek
                <select
                  value={product.id}
                  onChange={(e) => setChosen(e.target.value)}
                >
                  {options.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} — {money(p.price)}
                    </option>
                  ))}
                </select>
              </label>
              <strong>{money(product.price * result.quantity)}</strong>
              <button
                className="btn dark-btn full"
                onClick={() => add(product, product.unit, result.quantity)}
              >
                <Plus size={17} /> Tambah {result.quantity} {product.unit}
              </button>
              <p className="small muted">
                {kind === "Ganti keramik"
                  ? "Perekat dan nat belum termasuk."
                  : kind === "Tambal lantai"
                    ? "Ini estimasi kebutuhan semen; pasir dan bahan tambahan dihitung terpisah."
                    : "Luas kotor 4 dinding; pintu dan jendela belum dikurangi."}
              </p>
            </div>
          )}
        </aside>
      </div>
    </Modal>
  );
}
