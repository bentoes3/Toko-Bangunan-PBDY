import { useState, type FormEvent } from "react";
import { PaintRoller, Ruler, ShoppingCart } from "lucide-react";
import { money } from "./domain";
import { Modal, Tag } from "./ui";
import { useStore } from "./store";
import { availablePaintUnits, calculatePaint, PAINT_CAN_LITRES, type PaintInput } from "./paint";

const format = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
const initialFields = {
  length: "", width: "", height: "", coats: "2", coverage: "10", openingArea: "0", wastePercent: "10",
};

export function PaintCalculator({ onClose }: { onClose: () => void }) {
  const { products, cart, add } = useStore();
  const [fields, setFields] = useState(initialFields);
  const [result, setResult] = useState<ReturnType<typeof calculatePaint> | null>(null);
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState("");
  const [added, setAdded] = useState("");
  const options = products.filter((p) => p.active && p.category === "Cat" && p.stock > 0);
  const product = options.find((p) => p.id === chosen) || options[0];
  const remaining = product ? availablePaintUnits(product, cart) : 0;
  const enough = !!result && !!product && remaining >= result.cans;

  function update(key: keyof typeof fields, value: string) {
    setFields((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setError("");
    setAdded("");
  }

  function calculate(event: FormEvent) {
    event.preventDefault();
    setAdded("");
    try {
      const values = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, value.trim() ? Number(value.replace(",", ".")) : key === "openingArea" ? 0 : Number.NaN]),
      ) as unknown as PaintInput;
      setResult(calculatePaint(values));
      setError("");
    } catch (caught) {
      setResult(null);
      setError((caught as Error).message);
    }
  }

  return (
    <Modal title="Kalkulator Cat Dinding" onClose={onClose} wide>
      <div className="paint-intro">
        <span className="ai-icon"><PaintRoller size={26} /></span>
        <div>
          <h3>Ukur ruangannya, siapkan catnya.</h3>
          <p className="muted">Hitung kebutuhan cat untuk empat dinding ruangan, lalu pilih merek yang tersedia.</p>
        </div>
      </div>
      <div className="paint-layout">
        <form className="paint-form" onSubmit={calculate} noValidate>
          <div className="eyebrow accent"><Ruler size={16} /> UKURAN RUANGAN</div>
          <div className="paint-dimensions">
            {([
              ["length", "Panjang ruangan"], ["width", "Lebar ruangan"], ["height", "Tinggi dinding"],
            ] as const).map(([key, label]) => (
              <label key={key}>
                {label} (m)
                <input type="number" inputMode="decimal" min="0.01" step="any" placeholder="Contoh: 3"
                  value={fields[key]} onChange={(event) => update(key, event.target.value)} required />
              </label>
            ))}
          </div>
          <label>
            Luas pintu dan jendela (m²)
            <input type="number" inputMode="decimal" min="0" step="any" value={fields.openingArea}
              onChange={(event) => update("openingArea", event.target.value)} aria-describedby="paint-openings-help" />
          </label>
          <p className="small muted" id="paint-openings-help">Jumlahkan luas bukaan yang tidak dicat. Biarkan 0 bila tidak dikurangi.</p>
          <div className="paint-settings">
            <label>
              Jumlah lapisan
              <input type="number" inputMode="numeric" min="1" step="1" value={fields.coats}
                onChange={(event) => update("coats", event.target.value)} required />
            </label>
            <label>
              Cadangan (%)
              <input type="number" inputMode="decimal" min="0" max="100" step="any" value={fields.wastePercent}
                onChange={(event) => update("wastePercent", event.target.value)} required />
            </label>
          </div>
          <label>
            Daya sebar (m²/liter/lapis)
            <input type="number" inputMode="decimal" min="0.01" step="any" value={fields.coverage}
              onChange={(event) => update("coverage", event.target.value)} aria-describedby="paint-coverage-help" required />
          </label>
          <p className="small muted" id="paint-coverage-help">Sesuaikan dengan kemasan cat. Nilai awal 10 m²/liter untuk satu lapis.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn primary full" type="submit"><PaintRoller size={18} /> Hitung Kebutuhan Cat</button>
        </form>

        <aside className="paint-summary" aria-label="Hasil perhitungan cat">
          {!result ? (
            <div className="paint-placeholder">
              <PaintRoller size={38} />
              <h3>Berapa banyak cat yang diperlukan?</h3>
              <p className="muted">Isi ukuran ruangan dan tekan hitung. Hasilnya akan muncul di sini.</p>
            </div>
          ) : (
            <>
              <div className="paint-result" role="status">
                <Tag>Estimasi kebutuhan</Tag>
                <h2>{result.cans} <small>kaleng × {PAINT_CAN_LITRES} liter</small></h2>
                <p>{format(result.litres)} liter diperlukan, termasuk cadangan {fields.wastePercent}%.</p>
                <dl className="paint-breakdown">
                  <div><dt>Luas empat dinding</dt><dd>{format(result.grossArea)} m²</dd></div>
                  <div><dt>Dikurangi pintu/jendela</dt><dd>{format(Number(fields.openingArea))} m²</dd></div>
                  <div><dt>Luas yang dicat</dt><dd>{format(result.netArea)} m²</dd></div>
                  <div><dt>Total isi kemasan</dt><dd>{format(result.purchasedLitres)} liter</dd></div>
                </dl>
              </div>
              {product ? (
                <div className="paint-purchase">
                  <label>
                    Pilih cat dinding (kemasan 5 liter)
                    <select value={product.id} onChange={(event) => { setChosen(event.target.value); setAdded(""); }}>
                      {options.map((option) => <option key={option.id} value={option.id}>{option.name} — {money(option.price)}</option>)}
                    </select>
                  </label>
                  <p className="small muted">Stok {product.stock} {product.unit} · {remaining} dapat ditambahkan setelah isi keranjang saat ini.</p>
                  <div className="paint-total"><span>Estimasi biaya cat</span><strong>{money(product.price * result.cans)}</strong></div>
                  {!enough && <p className="form-error" role="status">Stok yang tersisa tidak cukup untuk {result.cans} kaleng. Pilih merek lain atau hubungi toko.</p>}
                  <button className="btn dark-btn full" type="button" disabled={!enough} onClick={() => {
                    if (add(product, product.unit, result.cans)) setAdded(`${result.cans} kaleng ${product.name} berhasil ditambahkan ke keranjang.`);
                  }}><ShoppingCart size={18} /> Tambah {result.cans} kaleng ke Keranjang</button>
                  {added && <p className="paint-added" role="status">{added}</p>}
                </div>
              ) : <p className="muted" role="status">Belum ada cat dinding yang tersedia di toko. Simpan estimasi ini dan tanyakan ketersediaannya kepada staf.</p>}
            </>
          )}
          <p className="paint-assumptions small muted">Perhitungan untuk empat dinding persegi panjang, tanpa plafon. Kemasan dibulatkan ke atas per 5 liter. Daya sebar dipengaruhi kondisi dinding; cat dasar, kuas, dan alat lain dihitung terpisah.</p>
        </aside>
      </div>
    </Modal>
  );
}
