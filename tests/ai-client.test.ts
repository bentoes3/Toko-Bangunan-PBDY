import { test } from "node:test";
import assert from "node:assert/strict";
import { consumeAIStream, catalogForAI, chatWithAI, identifyWithAI } from "../src/ai-client";
import { initialProducts } from "../src/data";
import type { AIStreamEvent, AIMessage, AIRecommendation } from "../src/ai-types";

function byteStream(text: string, chunkSize = 1) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({ start(controller) {
    for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize));
    controller.close();
  } });
}
test("AI SSE handles split UTF-8, split CRLF boundaries, comments, and final recommendation events", async () => {
  const events: AIStreamEvent[] = [];
  await consumeAIStream(byteStream(': ping\r\n\r\ndata: {"type":"delta","text":"Luas 12 m², warna biru 🟦"}\r\n\r\ndata: {"type":"recommendations","items":[{"label":"Cat","reason":"Lapisan akhir","options":["cat"],"quantity":null,"unit":null,"unavailable":false}]}\r\n\r\ndata: {"type":"done"}\r\n\r\n'), (event) => events.push(event));
  assert.deepEqual(events.map((event) => event.type), ["delta", "recommendations", "done"]);
  assert.equal((events[0] as { text: string }).text, "Luas 12 m², warna biru 🟦");
  assert.equal((events[1] as { items: unknown[] }).items.length, 1);
});
test("truncated or malformed streams fail honestly instead of completing the answer", async () => {
  await assert.rejects(consumeAIStream(byteStream('data: {"type":"delta","text":"Sebagian"}\n\n'), () => {}), /terputus/);
  await assert.rejects(consumeAIStream(byteStream('data: {"type":"error","message":"Batas layanan tercapai"}\n\n'), () => {}), /Batas layanan tercapai/);
  await assert.rejects(consumeAIStream(byteStream('data: {"type":"delta","text":123}\n\n'), () => {}), /belum dapat dibaca/);
});
test("stream parse errors cancel upstream work", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode('data: {"type":"error","message":"Service error"}\n\n')); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(consumeAIStream(stream, () => {}), /Service error/);
  assert.equal(cancelled, true);
});
test("recommendation preparation phase is forwarded before the completed choices", async () => {
  const events: AIStreamEvent[] = [];
  await consumeAIStream(byteStream('data: {"type":"delta","text":"Bahan yang diperlukan:"}\n\ndata: {"type":"phase","phase":"recommendations"}\n\ndata: {"type":"recommendations","items":[]}\n\ndata: {"type":"done"}\n\n'), (event) => events.push(event));
  assert.deepEqual(events.map((event) => event.type), ["delta", "phase", "recommendations", "done"]);
});
test("catalog payload excludes inactive products and private inventory fields", () => {
  const payload = catalogForAI([{ ...initialProducts[0], active: true }, { ...initialProducts[1], active: false }]);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].id, initialProducts[0].id);
  assert.equal("cost" in payload[0], false);
  assert.equal("sold" in payload[0], false);
  assert.equal(payload[0].stock, initialProducts[0].stock);
});
test("chat bounds context to twelve messages and two latest photos", async () => {
  const original = globalThis.fetch;
  let body: { messages: AIMessage[] } | undefined;
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response('data: {"type":"done"}\n\n', { headers: { "content-type": "text/event-stream" } });
  };
  try {
    const messages: AIMessage[] = Array.from({ length: 20 }, (_, i) => ({ role: "user", text: String(i), image: `photo-${i}` }));
    await chatWithAI(messages, initialProducts, new AbortController().signal, () => {});
    assert.equal(body?.messages.length, 12);
    assert.deepEqual(body?.messages.filter((m) => m.image).map((m) => m.image), ["photo-18", "photo-19"]);
    assert.equal(body?.messages[0].text, "8");
  } finally { globalThis.fetch = original; }
});
test("long multi-turn discussions stay within the API character budget and preserve the latest question", async () => {
  const original = globalThis.fetch;
  let body: { messages: AIMessage[] } | undefined;
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response('data: {"type":"done"}\n\n', { headers: { "content-type": "text/event-stream" } });
  };
  try {
    const messages: AIMessage[] = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", text: String(i).repeat(9000) }));
    messages.push({ role: "user", text: "Bagaimana kalau lebar lemarinya 80 cm?" });
    await chatWithAI(messages, initialProducts, new AbortController().signal, () => {});
    assert.ok(body!.messages.every((message) => message.text.length <= 6000));
    assert.ok(body!.messages.reduce((sum, message) => sum + message.text.length, 0) <= 18000);
    assert.equal(body!.messages.at(-1)?.text, "Bagaimana kalau lebar lemarinya 80 cm?");
    assert.equal(body!.messages.length, 3);
  } finally { globalThis.fetch = original; }
});
test("follow-up context remembers actual product choices from recommendation cards", async () => {
  const original = globalThis.fetch;
  let body: { messages: AIMessage[] } | undefined;
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response('data: {"type":"done"}\n\n', { headers: { "content-type": "text/event-stream" } });
  };
  try {
    const messages: (AIMessage & { recommendations?: AIRecommendation[] })[] = [
      { role: "assistant", text: "Berikut bahan yang sesuai.", recommendations: [
        { label: "Semen", reason: "Perekat", options: [initialProducts[0].id, "fake-id"], quantity: null, unit: null, unavailable: false },
        { label: "Papan jati khusus", reason: "Bingkai", options: [], quantity: null, unit: null, unavailable: true },
      ] },
      { role: "user", text: "Merek pilihan tadi cocok untuk dinding?" },
    ];
    await chatWithAI(messages, initialProducts, new AbortController().signal, () => {});
    assert.match(body!.messages[0].text, new RegExp(initialProducts[0].name));
    assert.match(body!.messages[0].text, /Papan jati khusus: tidak tersedia di katalog toko/);
    assert.equal(body!.messages[0].text.includes("fake-id"), false);
    assert.equal("recommendations" in body!.messages[0], false);
  } finally { globalThis.fetch = original; }
});
test("photo search never offers product IDs for a non-building or uncertain result", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ status: "not_building", name: "Kucing", description: "Hewan peliharaan", confidence: "high", observations: ["Berbulu"], questions: [], productIds: ["pipa"] });
  try {
    const result = await identifyWithAI("photo", initialProducts, new AbortController().signal);
    assert.equal(result.status, "not_building");
    assert.deepEqual(result.productIds, []);
  } finally { globalThis.fetch = original; }
});
test("missing backend or provider errors do not become a simulated reply", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("<html>Static host</html>", { headers: { "content-type": "text/html" } });
    await assert.rejects(chatWithAI([{ role: "user", text: "Halo" }], initialProducts, new AbortController().signal, () => {}), /belum tersedia/);
    globalThis.fetch = async () => Response.json({ error: "AI belum dikonfigurasi" }, { status: 503 });
    await assert.rejects(chatWithAI([{ role: "user", text: "Halo" }], initialProducts, new AbortController().signal, () => {}), /belum dikonfigurasi/);
  } finally { globalThis.fetch = original; }
});
