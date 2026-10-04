// Nöbetçi eczane verisini (Eczaneler.ORG v2 API) indirip public/data/nobetci-eczane.json olarak yazar.
// GitHub Actions içinde, siteyi derlemeden hemen önce çalışır; API anahtarı hiçbir zaman tarayıcıya gitmez.
//
// Gerekli gizli değişkenler (GitHub → Settings → Secrets and variables → Actions):
//   ECZANE_API_BASE  : API taban adresi (anahtarla birlikte sağlayıcıdan verilir, https://… ile başlar)
//   ECZANE_API_KEY   : API anahtarı (X-Api-Key başlığıyla gönderilir)
// İsteğe bağlı: ECZANE_CITY (varsayılan "bursa"), ECZANE_DISTRICT (varsayılan "osmangazi")
//
// Güvenlik: Veri doğrulanamazsa dosya YAZILMAZ; site "liste alınamadı" gösterir, eski/uydurma veri göstermez.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = (process.env.ECZANE_API_BASE || '').trim().replace(/\/+$/, '');
const KEY = (process.env.ECZANE_API_KEY || '').trim();
const CITY = (process.env.ECZANE_CITY || 'bursa').trim();
const DISTRICT = (process.env.ECZANE_DISTRICT || 'osmangazi').trim();
const OUT = process.env.ECZANE_OUT || path.join('public', 'data', 'nobetci-eczane.json');
const MAX_PAGES = 10;

if (!BASE || !KEY) {
  console.log('ECZANE_API_BASE / ECZANE_API_KEY tanımlı değil: nöbetçi eczane verisi indirilmedi (atlandı).');
  process.exit(0);
}
// Anahtar açık metin gitmesin diye yalnızca https kabul edilir (yerel test için localhost hariç).
if (!/^https:\/\//i.test(BASE) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(BASE)) {
  console.error('ECZANE_API_BASE https:// ile başlamalıdır.');
  process.exit(1);
}

const num = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};
const str = (v) => (typeof v === 'string' ? v.trim() : '');

async function getPage(page) {
  const url = `${BASE}/pharmacies/sentry-district-list/${encodeURIComponent(CITY)}/${encodeURIComponent(DISTRICT)}/${page}?limit=50`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'X-Api-Key': KEY, Accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`API ${res.status} ${res.statusText} döndürdü (sayfa ${page})`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const raw = [];
let page = 1;
let hasMore = true;
while (hasMore && page <= MAX_PAGES) {
  const json = await getPage(page);
  if (!json || !Array.isArray(json.data)) throw new Error('Beklenmeyen yanıt biçimi: "data" dizisi yok.');
  raw.push(...json.data);
  hasMore = !!(json.pagination && json.pagination.has_more);
  page += 1;
}

const items = raw
  .filter((p) => p && p.is_sentry !== false && str(p.name))
  .map((p) => ({
    name: str(p.name),
    phone: str(p.phone),
    locality: str(p.locality),
    address: str(p.address),
    addressDescription: str(p.address_description),
    lat: num(p.coordinates && p.coordinates.lat),
    lng: num(p.coordinates && (p.coordinates.lng ?? p.coordinates.lon)),
    mapLink: /^https:\/\//i.test(str(p.map_link)) ? str(p.map_link) : '',
    workingHours: str(p.workingHours),
    note: str(p.note),
    sentryDate: str(p.sentry_date),
  }))
  .filter((p) => p.address || p.phone);

if (items.length === 0) {
  throw new Error('API yanıtında geçerli nöbetçi eczane yok; dosya yazılmadı.');
}

const dates = items.map((i) => i.sentryDate).filter(Boolean).sort();
const out = {
  source: 'eczaneler.org',
  city: CITY,
  district: DISTRICT,
  fetchedAt: new Date().toISOString(),
  sentryDate: dates.length ? dates[dates.length - 1] : '',
  items: items.map(({ sentryDate, ...rest }) => rest),
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Nöbetçi eczane verisi yazıldı: ${items.length} kayıt, nöbet tarihi ${out.sentryDate || 'bilinmiyor'} → ${OUT}`);
