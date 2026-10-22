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

Deployment produksi menggunakan Cloudflare Pages **https://tokopbdy.pages.dev** (proyek `tokopbdy`, Direct Upload). Build `dist/`, lalu unggah isinya sebagai ZIP pada **Create deployment → Production**. Proyek ini tidak terhubung otomatis ke GitHub; push sumber tidak menerbitkan situs dengan sendirinya.

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

Aplikasi ini berjalan sepenuhnya di browser. **Tidak memerlukan backend, database, token API, payment gateway, atau kredensial tambahan.** State disimpan di `localStorage` dengan prefix `pbdy-v1-`; sesi admin di `sessionStorage`. Pembaruan lintas tab menggunakan event `storage`. Data tidak dibagikan ke browser/perangkat lain, dan akses admin merupakan guard UI demo, bukan otentikasi server untuk produksi. Pesanan contoh terlihat bersama untuk demonstrasi.

Untuk mengembalikan data contoh: hapus penyimpanan situs melalui DevTools → Application → Local Storage, kemudian muat ulang. Tidak ada transaksi atau notifikasi eksternal yang dikirim. Draft PO diunduh, tidak dikirim otomatis ke supplier.

Pembaruan katalog v2 menambahkan 40 produk sekali saja pada browser lama. Edit produk, stok, keranjang, pesanan dan riwayat yang tersimpan dipertahankan. Produk awal yang dihapus tidak dikembalikan. Status inventaris: **Aman** (hijau, stok > batas aman), **Perlu restock** (kuning, 0 < stok ≤ batas aman), **Kosong** (merah, stok ≤ 0). Inventaris dikelompokkan per jenis material dengan kolom Satuan tersendiri. Harga dan stok baru merupakan data contoh, bukan daftar harga atau stok toko yang diverifikasi.

### Fitur AI simulasi

- **Visual Search:** menerima foto dari galeri/kamera, menyediakan drag/resize crop serta kontrol slider yang dapat dioperasikan dengan keyboard, dan benar-benar menghasilkan potongan gambar. Hasil katalog dan skor kecocokan adalah contoh berdasarkan kategori yang dipilih, bukan inferensi gambar. Opsi objek tak dikenal menyediakan pencarian manual.
- **Rena / kalkulator renovasi:** percakapan berbasis aturan, menerima foto sebagai konteks demo, meminta ukuran, mengenali cat/keramik/tambal lantai dan menolak permintaan bangun dari tanah kosong. Foto tidak dianalisis oleh vision model. Rumus cat: luas empat dinding × 2 lapis × 1,1 / 50 m² per kaleng 5 liter; keramik: luas lantai × 1,1 / 1,44 m² per dus; tambal lantai: luas × tebal 0,03 m × densitas 1.800 kg/m³ × 1,1 / 50 kg. Pembulatan ke atas. Pasir, perekat, nat, dan kebutuhan tambahan belum termasuk.
- **Invoice extraction:** hasil contoh tetap dengan field yang dapat dikoreksi; tidak menjalankan OCR atau LLM. Gambar tidak dikirim ke server. Konfirmasi manual wajib sebelum stok berubah.
- **Forecast:** rata-rata penjualan contoh 30 hari × tren 1,12; rekomendasi pembelian = maksimum(0, estimasi permintaan + safety stock − stok). Data kurang dari 10 penjualan ditandai belum cukup. Seri grafik harian adalah ilustrasi berbasis rerata, bukan model ML terlatih.

Analitik menjumlahkan riwayat omzet contoh dan transaksi demo saat ini. Margin kotor memakai harga jual dikurangi harga beli; ongkir tidak dihitung sebagai omzet material. Angka ini tidak mewakili laporan keuangan toko yang sesungguhnya.

## Struktur

- `src/domain.ts`: konversi, validasi stok, armada, kalkulator, forecasting.
- `src/store.tsx`: state bersama dan persistensi.
- `src/Customer.tsx`: storefront, katalog, checkout, pelacakan.
- `src/AI.tsx`: crop gambar dan asisten renovasi.
- `src/Admin.tsx`: backoffice; dimuat hanya saat dibuka.
- `src/documents.ts`: PDF asli dengan jsPDF yang dimuat sesuai kebutuhan.
- `public/`: aset lokal sehingga demo tidak bergantung pada layanan gambar/font eksternal.
- `tests/`: aturan bisnis dan alur browser.

UI mendukung dark/light mode yang persisten, layar mobile 320px ke atas, reduced motion, label input, focus trap modal, dan tabel yang dapat digeser tanpa menghilangkan aksi.

## Atribusi aset

Font antarmuka Source Sans 3 dari Google Fonts, dengan lisensi OFL di `public/fonts/OFL-SourceSans3.txt`. Font lokal menggunakan ukuran teks antarmuka minimal 14px, dengan teks utama 17–19px. Logo PBDY disediakan pemilik toko. Foto rumah demonstrasi dari [Realvine / codewithsadee](https://github.com/codewithsadee/realvine) (`property-1.jpg`, `hero-bg.jpg`); README sumber menyatakan proyek bebas digunakan. Ilustrasi produk SVG dibuat khusus sebagai placeholder untuk aplikasi ini; nama merek digunakan untuk simulasi katalog.
