import type { Product } from "./domain";
import type { AIMessage, AIRecommendation, AIStatus, AIStreamEvent, Identification } from "./ai-types";

export function catalogForAI(products: Product[]) {
  return products.filter((p) => p.active).map((p) => ({
    id: p.id, name: p.name, brand: p.brand, category: p.category,
    description: p.description, unit: p.unit, units: p.units,
    price: p.price, stock: p.stock, active: p.active,
  }));
}

async function responseError(response: Response) {
  try {
    const body = await response.json();
    if (typeof body.error === "string") return body.error;
    if (typeof body.message === "string") return body.message;
  } catch {}
  return response.status === 429
    ? "Layanan sedang ramai. Tunggu sebentar, lalu coba lagi."
    : "Layanan AI belum dapat dihubungi. Coba lagi sebentar.";
}

export async function getAIStatus(signal?: AbortSignal): Promise<AIStatus> {
  const response = await fetch("/api/ai/status", { signal });
  if (!response.ok) throw new Error(await responseError(response));
  const body = await response.json();
  return { ready: body.ready === true, provider: typeof body.provider === "string" ? body.provider : undefined };
}

// A stream may split a JSON event or a UTF-8 character at any byte boundary.
export async function consumeAIStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AIStreamEvent) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;
  function dispatch(raw: string) {
    const data = raw.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
    if (!data || done) return;
    let event: AIStreamEvent;
    try { event = JSON.parse(data); }
    catch { throw new Error("Jawaban AI terputus. Silakan coba lagi."); }
    if (!event || typeof event !== "object") throw new Error("Jawaban AI belum dapat dibaca. Silakan coba lagi.");
    if (event.type === "error") throw new Error(event.message || "AI belum dapat menjawab. Coba lagi.");
    if (event.type === "delta" && typeof event.text !== "string") throw new Error("Jawaban AI belum dapat dibaca. Silakan coba lagi.");
    if (event.type === "recommendations") {
      if (!Array.isArray(event.items)) throw new Error("Pilihan produk belum dapat dibaca. Silakan coba lagi.");
      event.items = event.items.filter((item) => item && typeof item.label === "string" && typeof item.reason === "string" && Array.isArray(item.options)).slice(0, 20).map((item) => ({
        label: item.label, reason: item.reason, options: item.options.filter((id) => typeof id === "string"),
        quantity: typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : null,
        unit: typeof item.unit === "string" ? item.unit : null, unavailable: item.unavailable === true,
      }));
    }
    if (event.type === "done") done = true;
    if (["delta", "phase", "recommendations", "done"].includes(event.type)) onEvent(event);
  }
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      let separator: RegExpExecArray | null;
      while ((separator = /\r?\n\r?\n/.exec(buffer))) {
        dispatch(buffer.slice(0, separator.index));
        buffer = buffer.slice(separator.index + separator[0].length);
      }
      if (chunk.done) break;
      if (done) { await reader.cancel(); break; }
    }
    if (buffer.trim()) dispatch(buffer);
    if (!done) throw new Error("Sambungan terputus sebelum jawaban selesai. Silakan coba lagi.");
  } finally {
    // Release the upstream request even when parsing failed before the end marker.
    try { await reader.cancel(); } catch {}
    reader.releaseLock();
  }
}

export async function chatWithAI(
  messages: (AIMessage & { recommendations?: AIRecommendation[] })[],
  products: Product[],
  signal: AbortSignal,
  onEvent: (event: AIStreamEvent) => void,
) {
  // Keep the request bounded; photos live only in this browser's memory.
  let remainingPhotos = 2;
  let remainingCharacters = 18_000;
  const context: AIMessage[] = [];
  for (const message of messages.slice(-12).reverse()) {
    // Carry the offered choices into the next turn so follow-up questions can
    // refer to the products shown in cards, even when their names weren't spoken.
    const choices = message.role === "assistant" ? message.recommendations?.slice(0, 10).map((item) => {
      const matches = item.options.map((id) => products.find((p) => p.id === id && p.active)).filter((p): p is Product => !!p);
      return `${item.label}: ${matches.length ? matches.slice(0, 4).map((p) => `${p.name} [${p.id}]`).join("; ") : "tidak tersedia di katalog toko"}`;
    }).join("\n") : "";
    const summary = choices ? `\n\nPilihan bahan yang ditampilkan kepada pengguna:\n${choices}`.slice(0, 1800) : "";
    const text = message.text.slice(0, 6000 - summary.length) + summary;
    // Keep complete recent turns inside the server's total text budget.
    if (text.length > remainingCharacters) break;
    remainingCharacters -= text.length;
    const image = message.image && remainingPhotos-- > 0 ? message.image : undefined;
    context.unshift({ role: message.role, text, ...(image ? { image } : {}) });
  }
  const response = await fetch("/api/ai/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: context, catalog: catalogForAI(products) }), signal,
  });
  if (!response.ok) throw new Error(await responseError(response));
  if (!response.headers.get("content-type")?.includes("text/event-stream") || !response.body)
    throw new Error("Layanan AI belum tersedia di situs ini. Silakan coba lagi nanti.");
  await consumeAIStream(response.body, onEvent);
}

export async function identifyWithAI(image: string, products: Product[], signal: AbortSignal): Promise<Identification> {
  const response = await fetch("/api/ai/identify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, catalog: catalogForAI(products) }), signal,
  });
  if (!response.ok) throw new Error(await responseError(response));
  const body = await response.json();
  if (!["identified", "not_building", "uncertain"].includes(body.status) || typeof body.name !== "string" || typeof body.description !== "string")
    throw new Error("Hasil identifikasi belum dapat dibaca. Silakan coba lagi.");
  const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 12) : [];
  return { status: body.status, name: body.name, description: body.description,
    confidence: ["high", "medium", "low"].includes(body.confidence) ? body.confidence : "low",
    observations: strings(body.observations), questions: strings(body.questions),
    productIds: body.status === "identified" ? strings(body.productIds) : [],
  };
}
