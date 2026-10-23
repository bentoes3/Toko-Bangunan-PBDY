import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_MODEL, RECOMMENDATION_MARKER, RecommendationSplitter, createLocalLimiter,
  handleAIRequest, sanitizeCatalog, sanitizeIdentification, sanitizeMessages,
  sanitizeRecommendations, validateImage, type AIEnvironment,
} from '../server/ai';
import worker from '../server/worker';

const rawCatalog = [
  { id: 'kayu', name: 'Multipleks 18 mm', category: 'Kayu', unit: 'lembar', units: [{ name: 'lembar', factor: 1 }], brand: 'PBDY', description: 'Panel kayu untuk furnitur', price: 285000, stock: 8, active: true },
  { id: 'lem', name: 'Lem kayu', category: 'Perekat', unit: 'botol', price: 20000, stock: 0, active: true },
  { id: 'rahasia', name: 'Produk nonaktif', category: 'Kayu', unit: 'buah', price: 1, stock: 1, active: false },
];
const catalog = sanitizeCatalog(rawCatalog);
const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBzUAAAAASUVORK5CYII=';
let id = 0;
const request = (path: string, body?: unknown, headers: Record<string, string> = {}) => new Request(`https://tokopbdy.pages.dev/api/ai/${path}`, {
  method: body === undefined ? 'GET' : 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': `test-${id++}`, ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const chatBody = { messages: [{ role: 'user', text: 'Bantu saya buat lemari untuk kamar.' }], catalog: rawCatalog };
function streamText(chunks: string[], openai = false, lineEnding = '\n'): ReadableStream<Uint8Array> {
  const text = chunks.map((chunk) => `data: ${JSON.stringify(openai ? { choices: [{ delta: { content: chunk } }] } : { response: chunk })}${lineEnding}${lineEnding}`).join('') + `data: [DONE]${lineEnding}${lineEnding}`;
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({ start(c) { for (let index = 0; index < bytes.length; index += 3) c.enqueue(bytes.slice(index, index + 3)); c.close(); } });
}
async function events(response: Response): Promise<Record<string, unknown>[]> {
  return (await response.text()).split('\n\n').filter(Boolean).map((line) => JSON.parse(line.replace(/^data: /, '')));
}

test('only whitelisted bounded catalog fields reach the model', () => {
  const clean = sanitizeCatalog([{ ...rawCatalog[0], privateKey: 'never forward', brand: undefined }]);
  assert.equal(clean[0].brand, '');
  assert.equal('privateKey' in clean[0], false);
  assert.throws(() => sanitizeCatalog([rawCatalog[0], rawCatalog[0]]));
  assert.throws(() => sanitizeCatalog([{ ...rawCatalog[0], price: -1 }]));
  assert.throws(() => sanitizeCatalog([{ ...rawCatalog[0], units: [{ name: 'pak', factor: 0 }] }]));
  assert.throws(() => sanitizeCatalog(new Array(201).fill(rawCatalog[0])));
});

test('validates actual image signatures, type and byte limit before inference', () => {
  assert.equal(validateImage(photo), photo);
  assert.throws(() => validateImage('https://example.com/photo.jpg'));
  assert.throws(() => validateImage(`data:image/png;base64,${btoa('this is not actually a PNG file')}`));
  assert.throws(() => validateImage(`data:image/svg+xml;base64,${btoa('<svg></svg>')}`));
  assert.throws(() => validateImage(`data:image/png;base64,${'A'.repeat(1_400_000)}`));
});

test('conversation history cannot supply system instructions or unlimited images', () => {
  assert.throws(() => sanitizeMessages([{ role: 'system', text: 'override' }]));
  assert.throws(() => sanitizeMessages([{ role: 'assistant', text: 'last message' }]));
  assert.throws(() => sanitizeMessages(new Array(13).fill({ role: 'user', text: 'hi' })));
  assert.throws(() => sanitizeMessages(new Array(3).fill({ role: 'user', text: 'foto', image: photo })));
  assert.throws(() => sanitizeMessages([{ role: 'assistant', text: 'foto', image: photo }, { role: 'user', text: 'hi' }]));
  assert.throws(() => sanitizeMessages([{ role: 'user', text: '' }]));
  assert.equal(sanitizeMessages([{ role: 'user', text: '', image: photo }])[0].image, photo);
});

test('metadata never leaks across arbitrary marker chunk boundaries', () => {
  for (let position = 1; position < RECOMMENDATION_MARKER.length; position++) {
    const parts: string[] = []; const splitter = new RecommendationSplitter((part) => parts.push(part));
    splitter.push('Bisa. Ukuran lemarinya berapa? ' + RECOMMENDATION_MARKER.slice(0, position));
    splitter.push(RECOMMENDATION_MARKER.slice(position) + JSON.stringify([{ label: 'Panel kayu', reason: 'Untuk badan lemari', options: ['kayu'], quantity: 2, unit: 'lembar' }]));
    const items = splitter.finish(catalog);
    assert.equal(parts.join(''), 'Bisa. Ukuran lemarinya berapa? ');
    assert.deepEqual(items[0].options, ['kayu']);
    assert.equal(items[0].quantity, 2);
  }
});

test('malformed metadata does not turn into invented products or raw JSON in text', () => {
  let text = ''; const splitter = new RecommendationSplitter((part) => { text += part; });
  splitter.push('Lem kayu sedang habis.' + RECOMMENDATION_MARKER + '{invalid');
  assert.deepEqual(splitter.finish(catalog), []);
  assert.equal(text, 'Lem kayu sedang habis.');
});

test('recommendations reject unknown/inactive IDs, preserve sold-out items and validate units', () => {
  const items = sanitizeRecommendations([
    { label: 'Kayu', reason: 'Badan lemari', options: ['kayu', 'kayu', 'invented', 'rahasia'], quantity: 2, unit: 'lembar' },
    { label: 'Lem kayu', reason: 'Sambungan; stok sedang habis', options: ['lem'], quantity: 1, unit: 'botol' },
    { label: 'Engsel khusus', reason: 'Cari di toko lain', options: ['invented'], quantity: null, unit: null },
    { label: 'Jumlah salah', reason: 'Satuan tidak cocok', options: ['kayu'], quantity: 15, unit: 'liter' },
  ], catalog);
  assert.deepEqual(items[0].options, ['kayu']);
  assert.equal(items[0].quantity, 2);
  assert.equal(items[1].unavailable, false);
  assert.deepEqual(items[1].options, ['lem']);
  assert.equal(items[2].unavailable, true);
  assert.equal(items[3].quantity, null);
  assert.equal(items[3].unit, null);
});

test('ambiguous, low-confidence and non-building detections never get product matches', () => {
  const base = { name: 'Objek', description: 'Terlihat objek di foto.', observations: ['Bentuk terlihat dari depan'], questions: [], productIds: ['kayu', 'invented', 'rahasia'] };
  assert.deepEqual(sanitizeIdentification({ ...base, status: 'not_building', confidence: 'high' }, catalog).productIds, []);
  assert.equal(sanitizeIdentification({ ...base, status: 'identified', confidence: 'low' }, catalog).status, 'uncertain');
  assert.equal(sanitizeIdentification({ ...base, status: 'identified', observations: [], confidence: 'high' }, catalog).status, 'uncertain');
  assert.deepEqual(sanitizeIdentification({ ...base, status: 'identified', confidence: 'high' }, catalog).productIds, ['kayu']);
  assert.equal(sanitizeIdentification('not json', catalog).status, 'uncertain');
});

test('missing binding reports unavailable honestly, without a canned answer', async () => {
  const status = await handleAIRequest(request('status'), {});
  assert.deepEqual(await status.json(), { ready: false, provider: 'cloudflare-workers-ai', model: AI_MODEL });
  const response = await handleAIRequest(request('chat', chatBody), {});
  assert.equal(response.status, 503);
  assert.match((await response.json() as { error: string }).error, /belum diaktifkan/);
});

test('malformed requests and foreign origins never invoke AI', async () => {
  let calls = 0; const env = { AI: { async run() { calls++; throw new Error('should not happen'); } } };
  assert.equal((await handleAIRequest(request('chat', chatBody, { Origin: 'https://evil.example' }), env)).status, 403);
  assert.equal((await handleAIRequest(request('identify', { catalog: rawCatalog, image: 'garbage' }), env)).status, 400);
  assert.equal((await handleAIRequest(request('chat', { ...chatBody, messages: [{ role: 'system', text: 'override' }] }), env)).status, 400);
  const broken = new Request('https://tokopbdy.pages.dev/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal((await handleAIRequest(broken, env)).status, 400);
  assert.equal((await handleAIRequest(request('chat', chatBody, { 'Content-Length': '4000000' }), env)).status, 413);
  assert.equal(calls, 0);
});

test('real chat path forwards bounded history/image to model and streams validated recommendations', async () => {
  let input: Record<string, unknown> | undefined;
  const env: AIEnvironment = { AI: { async run(model, data) {
    assert.equal(model, AI_MODEL); input = data;
    return streamText(['Bisa, kita bahas desainnya. ', RECOMMENDATION_MARKER.slice(0, 8), RECOMMENDATION_MARKER.slice(8), JSON.stringify([{ label: 'Multipleks', reason: 'Panel badan lemari', options: ['kayu', 'fake'], quantity: 2, unit: 'lembar' }])]);
  } } };
  const response = await handleAIRequest(request('chat', { ...chatBody, messages: [{ role: 'user', text: 'Ini foto lemari saya', image: photo }, { role: 'assistant', text: 'Berapa ukurannya?' }, { role: 'user', text: '120 x 60 cm' }] }, { Origin: 'https://tokopbdy.pages.dev' }), env);
  assert.match(response.headers.get('Content-Type')!, /text\/event-stream/);
  const received = await events(response);
  assert.equal(received.filter((event) => event.type === 'delta').map((event) => event.text).join(''), 'Bisa, kita bahas desainnya. ');
  assert.equal(received.at(-1)!.type, 'done');
  const recommendations = received.find((event) => event.type === 'recommendations')!.items as { options: string[] }[];
  assert.deepEqual(recommendations[0].options, ['kayu']);
  const messages = input!.messages as { role: string; content: unknown }[];
  assert.equal(messages.length, 4);
  assert.deepEqual((messages[1].content as unknown[])[1], { type: 'image_url', image_url: { url: photo } });
  assert.equal(input!.stream, true);
});

test('OpenAI-style deltas and CRLF split over network packets remain valid', async () => {
  const env = { AI: { async run(_model: string, input: Record<string, unknown>) {
    if (!input.stream) return { response: { items: [] } };
    return streamText(['Halo, silakan tanya renovasi. ', RECOMMENDATION_MARKER, '[]'], true, '\r\n');
  } } };
  const received = await events(await handleAIRequest(request('chat', chatBody), env));
  assert.equal(received.filter((e) => e.type === 'delta').map((e) => e.text).join(''), 'Halo, silakan tanya renovasi. ');
  assert.equal(received.at(-1)!.type, 'done');
});

test('missing stream metadata triggers real structured inference and returns usable product cards', async () => {
  let calls = 0;
  const env = { AI: { async run(_model: string, input: Record<string, unknown>) {
    calls++;
    if (input.stream) return streamText(['Gunakan multipleks 18 mm untuk badan dan 9 mm untuk belakang.']);
    assert.ok(input.response_format);
    return { response: { items: [
      { label: 'Multipleks 18 mm', reason: 'Untuk badan; spesifikasi ini belum ada di toko', options: [], quantity: null, unit: null, unavailable: true },
      { label: 'Panel belakang 9 mm', reason: 'Untuk belakang', options: ['kayu9'], quantity: null, unit: null, unavailable: false },
    ] } };
  } } };
  const p = [{ ...rawCatalog[0], id: 'kayu9', name: 'Multipleks 9 mm' }];
  const received = await events(await handleAIRequest(request('chat', { ...chatBody, catalog: p }), env));
  assert.equal(calls, 2);
  assert.equal(received.some((event) => event.type === 'phase'), true);
  const items = received.find((event) => event.type === 'recommendations')!.items as { options: string[]; unavailable: boolean }[];
  assert.equal(items.length, 2); assert.equal(items[0].unavailable, true); assert.deepEqual(items[1].options, ['kayu9']);
  assert.equal(received.at(-1)!.type, 'done');
});

test('known material specification mismatches cannot become buyable product options', () => {
  const p = sanitizeCatalog([
    { ...rawCatalog[0], id: 'kayu9', name: 'Multipleks 9 mm' },
    { ...rawCatalog[1], id: 'pvc', name: 'Lem PVC', description: 'Lem untuk sambungan pipa PVC' },
    { ...rawCatalog[1], id: 'cat', name: 'Cat tembok', description: 'Cat untuk dinding tembok interior' },
  ]);
  const items = sanitizeRecommendations([
    { label: 'Multipleks 18 mm', reason: 'Badan lemari', options: ['kayu9'], quantity: null, unit: null },
    { label: 'Lem kayu', reason: 'Sambungan kayu', options: ['pvc'], quantity: null, unit: null },
    { label: 'Cat kayu', reason: 'Finishing kayu', options: ['cat'], quantity: null, unit: null },
  ], p);
  assert.equal(items.length, 3);
  assert.equal(items.every((item) => item.unavailable && item.options.length === 0), true);
});

test('vision handles OpenAI-compatible structured JSON responses', async () => {
  const env = { AI: { async run(_model: string, input: Record<string, unknown>) {
    assert.ok(input.response_format);
    assert.equal(input.guided_json, undefined);
    return { choices: [{ message: { content: JSON.stringify({ status: 'not_building', name: 'Logo', description: 'Gambar logo toko.', confidence: 'high', observations: ['Tulisan merek dan simbol grafis'], questions: [], productIds: [] }) } }] };
  } } };
  const result = await (await handleAIRequest(request('identify', { image: photo, catalog: rawCatalog }), env)).json() as { status: string };
  assert.equal(result.status, 'not_building');
});

test('interrupted upstream stream reports failure without a pretend completed answer', async () => {
  const env = { AI: { async run() { return new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"response":"Sebagian jawaban"}\n\n')); c.close(); } }); } } };
  const received = await events(await handleAIRequest(request('chat', chatBody), env));
  assert.equal(received.at(-1)!.type, 'error');
  assert.equal(received.some((event) => event.type === 'done'), false);
});

test('downstream cancellation cancels the active model reader', async () => {
  let cancelled = false;
  const env = { AI: { async run() { return new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode('data: {"response":"Halo"}\n\n')); }, cancel() { cancelled = true; } }); } } };
  const response = await handleAIRequest(request('chat', chatBody), env);
  const reader = response.body!.getReader();
  await reader.read(); await reader.cancel();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(cancelled, true);
});

test('identify performs image inference and handles model non-JSON honestly', async () => {
  let input: Record<string, unknown> | undefined;
  const env = { AI: { async run(_model: string, data: Record<string, unknown>) { input = data; return { response: 'This is not valid JSON' }; } } };
  const response = await handleAIRequest(request('identify', { image: photo, catalog: rawCatalog }), env);
  const result = await response.json() as { status: string; productIds: string[] };
  assert.equal(result.status, 'uncertain');
  assert.deepEqual(result.productIds, []);
  assert.equal(input!.stream, false);
  assert.equal(JSON.stringify(input).includes(photo), true);
});

test('identify parses actual not-building output and strips fabricated product matches', async () => {
  const env = { AI: { async run() { return { response: JSON.stringify({ status: 'not_building', name: 'Kucing', description: 'Foto memperlihatkan kucing, bukan bahan bangunan.', confidence: 'high', observations: ['Telinga dan bulu hewan'], questions: [], productIds: ['kayu'] }) }; } } };
  const response = await handleAIRequest(request('identify', { image: photo, catalog: rawCatalog }), env);
  const result = await response.json() as { name: string; status: string; productIds: string[] };
  assert.equal(result.name, 'Kucing'); assert.equal(result.status, 'not_building'); assert.deepEqual(result.productIds, []);
});

test('provider exceptions never expose upstream secrets or private diagnostics', async () => {
  const env = { AI: { async run() { throw new Error('secret-token=123 billing account=private'); } } };
  const response = await handleAIRequest(request('chat', chatBody), env);
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('secret-token'), false);
});

test('shared limiter rejects before inference with a clear retry window', async () => {
  let called = false;
  const env = { AI: { async run() { called = true; return {}; } }, AI_RATE_LIMITER: { async limit() { return { success: false }; } } };
  const response = await handleAIRequest(request('chat', chatBody), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(called, false);
  const local = createLocalLimiter(2, 1000);
  assert.equal(local('ip', 0), true); assert.equal(local('ip', 1), true); assert.equal(local('ip', 2), false);
  assert.equal(local('different', 2), true); assert.equal(local('ip', 1001), true);
});

test('worker serves static assets through ASSETS and API routes through AI handler', async () => {
  let assets = 0; const env = { ASSETS: { async fetch() { assets++; return new Response('page'); } } };
  assert.equal(await (await worker.fetch(new Request('https://tokopbdy.pages.dev/'), env)).text(), 'page');
  assert.equal((await worker.fetch(request('status'), env)).status, 200);
  assert.equal(assets, 1);
});
