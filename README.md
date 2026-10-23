# Toko Bangunan PB.DY

Aplikasi simulasi e-commerce material dan backoffice berdasarkan FSD PB.DY. Dibangun dengan React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Recharts, dan jsPDF.

## Menjalankan

Node.js 24 dan npm diperlukan (versi yang diuji: Node 24.19.0).

```sh
npm ci
npm run dev
```

Untuk cloud environment ini, gunakan `npm ci --cache /workspace/.npm-cache` jika direktori cache bawaan tidak dapat ditulis. Development server mendengarkan port 5173 di seluruh interface. Jalankan dari checkout yang sudah ada; tidak perlu worktree baru.

```sh
npm run build      # TypeScript + build produksi ke dist/
npm run preview   # Menjalankan build produksi
npm test          # Pengujian aturan bisnis
npm run test:e2e  # Pengujian browser end-to-end
```

Tes browser memilih Microsoft Edge di Windows, Chromium sistem di Linux bila tersedia, atau browser Playwright bawaan (instal dengan `npx playwright install chromium`). Override executable melalui `PLAYWRIGHT_CHROMIUM_EXECUTABLE` bila diperlukan.

Deployment produksi menggunakan Cloudflare Pages **https://tokopbdy.pages.dev** (proyek `tokopbdy`, Direct Upload). `npm run build` menghasilkan frontend, backend `_worker.js`, dan `_routes.json` yang membatasi Functions ke `/api/*`. Unggah seluruh isi `dist/` sebagai ZIP pada **Create deployment → Production**. Di **Settings → Bindings**, tambahkan **Workers AI** dengan nama **AI** untuk Production maupun Preview; binding berlaku setelah deployment berikutnya. Tidak ada API key dalam frontend. Proyek ini tidak terhubung otomatis ke GitHub; push sumber tidak menerbitkan situs dengan sendirinya.

Server Vite biasa hanya menjalankan frontend; AI akan menampilkan status belum tersedia tanpa backend. Untuk integrasi lokal gunakan `npx wrangler pages dev dist --ai AI` setelah autentikasi Cloudflare, atau uji pada deployment Preview dengan binding AI. UI tidak memakai jawaban simulasi ketika backend tidak tersedia.

## Akses & alur demo

- Customer: halaman utama, katalog (`#/katalog`), keranjang (`#/keranjang`), checkout (`#/checkout`), dan pesanan (`#/pesanan`).
- Portal admin: `#/admin`. Username **admin_pbdy**, password **adminpassword123**, atau tombol **Gunakan akun demo**.
- Data awal: 52 produk dalam 15 kategori, 3 supplier, 4 pesanan contoh, serta riwayat penjualan ilustratif. Material mencakup pondasi, dinding, struktur, atap, plafon, sanitasi, listrik, finishing, peralatan dan alat pelindung.
- Semua nominal dalam Rupiah. Semua gambar produk merupakan ilustrasi placeholder material, bukan foto kemasan resmi. Warna dan identitas visual terinspirasi logo PB.DY.

Alur uji yang disarankan:

1. Pilih material dan satuan, tambahkan ke keranjang, lalu ubah jumlah. Validasi stok menjumlahkan seluruh konversi satuan produk yang sama.
2. Checkout dengan alamat Bogor. Armada dan ongkir direkomendasikan dari berat **dan** volume. Pesanan melebihi kapasitas Fuso dibagi menjadi beberapa perjalanan.
3. Pilih Transfer Bank lalu **Simulasikan Bayar**, atau gunakan COD/Termin Proyek. Pesanan baru mengalokasikan stok satu kali dan mencatat pergerakan keluar.
4. Di admin, kelola pesanan, pembayaran, sopir, dan estimasi tiba. Status berubah pada customer, termasuk tab lain pada origin/browser yang sama. Unduh faktur PDF; surat jalan tersedia mulai status Dikirim.
5. Buka inventaris, pilih Restock, tentukan supplier dan jumlah, lalu generate/unduh PO PDF. PO tidak langsung menambah stok. Konfirmasi **Terima barang** di Supplier & Pembelian untuk memperbarui stok satu kali. Pembayaran supplier dicatat terpisah.
6. Unggah foto nota pada Ekstraksi Nota AI. Periksa data contoh yang muncul, edit setiap baris, lalu centang verifikasi dan konfirmasi masuk gudang. Stok, pembelian, dan hutang supplier diperbarui bersama.
7. Kelola produk, harga, konversi satuan, status aktif/nonaktif, supplier, safety stock, dan penyesuaian stok dengan alasan.

## Batas simulasi dan penyimpanan

Katalog, keranjang, pesanan dan operasional tetap merupakan simulasi browser. State disimpan di `localStorage` dengan prefix `pbdy-v1-`; sesi admin di `sessionStorage`. Pembaruan lintas tab menggunakan event `storage`. Data operasional tidak dibagikan ke browser/perangkat lain, dan akses admin merupakan guard UI demo, bukan otentikasi server untuk produksi. Konsultan dan pengenalan foto menggunakan backend Cloudflare Pages serta inferensi Workers AI yang nyata. Snapshot katalog aktif, konteks percakapan terbatas, dan foto yang dipilih dikirim ke layanan AI saat pengguna mengirim pesan/menjalankan analisis; harga dan stok tetap mengikuti simulasi pada browser tersebut.

Untuk mengembalikan data contoh: hapus penyimpanan situs melalui DevTools → Application → Local Storage, kemudian muat ulang. Tidak ada transaksi atau notifikasi eksternal yang dikirim. Draft PO diunduh, tidak dikirim otomatis ke supplier.

Pembaruan katalog v2 menambahkan 40 produk sekali saja pada browser lama. Edit produk, stok, keranjang, pesanan dan riwayat yang tersimpan dipertahankan. Produk awal yang dihapus tidak dikembalikan. Status inventaris: **Aman** (hijau, stok > batas aman), **Perlu restock** (kuning, 0 < stok ≤ batas aman), **Kosong** (merah, stok ≤ 0). Inventaris dikelompokkan per jenis material dengan kolom Satuan tersendiri. Harga dan stok baru merupakan data contoh, bukan daftar harga atau stok toko yang diverifikasi.

### Konsultan, pencarian foto, dan kalkulator

- **Konsultan Rena:** model multimodal `@cf/google/gemma-4-26b-a4b-it` melalui binding server Workers AI. Jawaban SSE muncul bertahap, dengan stop/retry dan konteks maksimal 12 pesan/18.000 karakter serta dua foto terbaru. Teks percakapan tersimpan dalam sesi browser; foto hanya berada di memori dan tidak disimpan dalam riwayat. Rekomendasi produk divalidasi ke ID katalog aktif; pengguna memilih produk, satuan, dan jumlah sebelum menekan tambah ke keranjang. Bahan tak dijual tetap dijelaskan untuk dicari di toko lain; stok habis dibedakan dari produk tak dijual. Kesesuaian fungsi bahan dan ukuran harus diperiksa kembali.
- **Cari via Foto:** JPG/PNG/WebP maksimal 8 MB, diperkecil di browser hingga sisi terpanjang 1.280 px dan payload di bawah 1 MB. Seluruh foto dipilih secara default, dengan crop yang dapat diatur memakai pointer atau keyboard. Model memeriksa piksel, lalu mengembalikan nama/ciri visual dan status `identified`, `not_building`, atau `uncertain`. Tidak ada kategori contoh atau persentase kecocokan buatan. Hanya hasil teridentifikasi yang boleh menawarkan produk; foto ambigu atau bukan barang bangunan tidak mendapat kecocokan paksa. Nama merek/ukuran tidak boleh ditebak dari foto.
- **Kalkulator Cat Dinding:** terpisah dari chat dan tidak memerlukan layanan AI. Luas bersih = 2 × (panjang + lebar) × tinggi − luas pintu/jendela. Liter = luas bersih × lapisan ÷ daya sebar × (1 + cadangan/100). Dibulatkan ke atas per kaleng 5 liter, lalu pilih cat aktif yang stoknya cukup setelah isi keranjang. Default dua lapis, 10 m²/liter/lapis, dan cadangan 10%; semua dapat diubah.

Workers AI memakai kuota akun Cloudflare; [alokasi gratis dan tarif](https://developers.cloudflare.com/workers-ai/platform/pricing/) ditentukan Cloudflare. Kode tidak mengaktifkan paket berbayar. Saat model, kuota, atau jaringan gagal, UI menampilkan error dan pilihan mencoba lagi, bukan jawaban template. Endpoint memvalidasi ukuran request, signature foto, origin, dan batas konteks; rate limit memori 12 permintaan/IP/menit bersifat per-isolate, bukan jaminan batas global. Binding opsional `AI_RATE_LIMITER` dapat menambahkan batas bersama. Foto/input tidak dicatat pada log aplikasi. Tes backend/client menggunakan mock untuk protokol dan kasus gagal; pengujian inferensi nyata dilakukan pada Preview.

### Fitur operasional yang tetap simulasi

- **Invoice extraction:** hasil contoh tetap dengan field yang dapat dikoreksi; tidak menjalankan OCR atau LLM. Gambar tidak dikirim ke server. Konfirmasi manual wajib sebelum stok berubah.
- **Forecast:** rata-rata penjualan contoh 30 hari × tren 1,12; rekomendasi pembelian = maksimum(0, estimasi permintaan + safety stock − stok). Data kurang dari 10 penjualan ditandai belum cukup. Seri grafik harian adalah ilustrasi berbasis rerata, bukan model ML terlatih.

Analitik menjumlahkan riwayat omzet contoh dan transaksi demo saat ini. Margin kotor memakai harga jual dikurangi harga beli; ongkir tidak dihitung sebagai omzet material. Angka ini tidak mewakili laporan keuangan toko yang sesungguhnya.

## Struktur

- `src/domain.ts`: konversi, validasi stok, armada, kalkulator, forecasting.
- `src/store.tsx`: state bersama dan persistensi.
- `src/Customer.tsx`: storefront, katalog, checkout, pelacakan.
- `src/AI.tsx`, `src/ai-client.ts`: konsultan streaming, rekomendasi belanja dan crop/pengenalan foto.
- `src/PaintCalculator.tsx`, `src/paint.ts`: kalkulator cat dinding dan rumus teruji.
- `server/ai.ts`, `server/worker.ts`: endpoint inferensi server, validasi, streaming dan pembatasan input.
- `src/Admin.tsx`: backoffice; dimuat hanya saat dibuka.
- `src/documents.ts`: PDF asli dengan jsPDF yang dimuat sesuai kebutuhan.
- `public/`: aset lokal sehingga demo tidak bergantung pada layanan gambar/font eksternal.
- `tests/`: aturan bisnis dan alur browser.

UI mendukung dark/light mode yang persisten, layar mobile 320px ke atas, reduced motion, label input, focus trap modal, dan tabel yang dapat digeser tanpa menghilangkan aksi.

## Atribusi aset

Font antarmuka Source Sans 3 dari Google Fonts, dengan lisensi OFL di `public/fonts/OFL-SourceSans3.txt`. Font lokal menggunakan ukuran teks antarmuka minimal 14px, dengan teks utama 17–19px. Logo PBDY disediakan pemilik toko. Foto rumah demonstrasi dari [Realvine / codewithsadee](https://github.com/codewithsadee/realvine) (`property-1.jpg`, `hero-bg.jpg`); README sumber menyatakan proyek bebas digunakan. Ilustrasi produk SVG dibuat khusus sebagai placeholder untuk aplikasi ini; nama merek digunakan untuk simulasi katalog.
