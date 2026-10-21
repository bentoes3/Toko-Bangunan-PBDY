import {
  money,
  type Order,
  type Purchase,
  type Supplier,
  type Product,
} from "./domain";
async function document(title: string, id: string, lines: string[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFillColor(250, 189, 40);
  doc.rect(0, 0, 210, 7, "F");
  doc.setTextColor(32, 38, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.text("PB.DY", 18, 27);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TOKO BANGUNAN | Kabupaten Bogor", 18, 35);
  doc.setFontSize(19);
  doc.text(title, 18, 54);
  doc.setFontSize(10);
  doc.text(id, 18, 63);
  doc.setDrawColor(220);
  doc.line(18, 69, 192, 69);
  let y = 80;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, 170);
    if (y + wrapped.length * 6 > 270) {
      doc.addPage();
      y = 25;
    }
    doc.text(wrapped, 18, y);
    y += wrapped.length * 6 + 4;
  }
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    "DOKUMEN SIMULASI - Tidak berlaku sebagai bukti transaksi nyata.",
    18,
    285,
  );
  doc.save(`${title.replaceAll(" ", "-")}-${id}.pdf`);
}
export function orderPDF(order: Order, kind: "Faktur" | "Surat Jalan") {
  document(kind, order.id, [
    `Tanggal: ${new Date(order.date).toLocaleDateString("id-ID")}`,
    `Pelanggan: ${order.name} | ${order.phone}`,
    `Alamat: ${order.address}`,
    `Armada: ${order.fleet} | Sopir: ${order.driver}`,
    `Pembayaran: ${order.payment} | ${order.paid ? "Lunas (simulasi)" : "Belum lunas / termin"}`,
    "RINCIAN MATERIAL",
    ...order.items.map(
      (i) =>
        `${i.name} | ${i.quantity} ${i.unit}${kind === "Faktur" ? ` | ${money(i.price * i.factor)} | ${money(i.quantity * i.factor * i.price)}` : ""}`,
    ),
    ...(kind === "Faktur"
      ? [
          `Subtotal: ${money(order.subtotal)}`,
          `Pengiriman: ${money(order.shipping)}`,
          `TOTAL: ${money(order.total)}`,
        ]
      : [
          "Penerima: ____________________",
          "Tanda tangan: ____________________",
        ]),
    `Catatan: ${order.note || "-"}`,
  ]);
}
export function purchasePDF(
  po: Purchase,
  supplier: Supplier,
  products: Product[],
) {
  document("Purchase Order", po.id, [
    `Tanggal: ${new Date(po.date).toLocaleDateString("id-ID")}`,
    `Kepada: ${supplier.name}`,
    `Kontak: ${supplier.contact} | ${supplier.phone}`,
    `Termin: ${supplier.term} hari | Jatuh tempo: ${new Date(po.due).toLocaleDateString("id-ID")}`,
    ...po.items.map(
      (i) =>
        `${products.find((p) => p.id === i.productId)?.name} | ${i.quantity} ${products.find((p) => p.id === i.productId)?.unit} | ${money(i.cost)} | ${money(i.quantity * i.cost)}`,
    ),
    `TOTAL PEMBELIAN: ${money(po.total)}`,
    "Disiapkan oleh Seta (Admin), disetujui Bima (Owner).",
  ]);
}
