// Nöbetçi eczane verisini Bursa Eczacı Odası'nın resmi sayfasından (https://www.beo.org.tr/nobetci-eczaneler)
// okuyup public/data/nobetci-eczane.json olarak yazar. API anahtarı / ücret gerekmez.
//
// GitHub Actions içinde siteyi derlemeden hemen önce çalışır (günde en fazla 2 istek, kimliği belirtilmiş).
// Sayfa herkese açık HTML'dir; resmi bir API olmadığı için sayfa yapısı değişirse betik HATA verir ve
// dosya YAZILMAZ: site "liste alınamadı" gösterir (eski/uydurma veri gösterilmez).
//
// İsteğe bağlı değişkenler:
//   ECZANE_DISTRICTS  : virgülle ayrılmış ilçe başlangıçları (varsayılan "OSMANGAZİ,NİLÜFER,YILDIRIM")
//   ECZANE_SOURCE_URL : kaynak adresi (yalnızca test için; varsayılan resmi sayfa)
//   ECZANE_OUT        : çıktı dosyası (varsayılan public/data/nobetci-eczane.json)
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL = (process.env.ECZANE_SOURCE_URL || 'https://www.beo.org.tr/nobetci-eczaneler').trim();
const OUT = process.env.ECZANE_OUT || path.join('public', 'data', 'nobetci-eczane.json');
const DISTRICTS = (process.env.ECZANE_DISTRICTS || 'OSMANGAZİ,NİLÜFER,YILDIRIM')
  .split(',')
  .map((d) => d.trim().toLocaleUpperCase('tr-TR'))
  .filter(Boolean);
const MIN_TOTAL_RECORDS = 5; // tüm Bursa'da bundan azı çıkarsa sayfa yapısı değişmiştir

// ───────── yardımcılar ─────────
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (ENTITIES[n.toLowerCase()] !== undefined ? ENTITIES[n.toLowerCase()] : m));
}
const stripTags = (s) => s.replace(/<[^>]*>/g, '');

/** "ÇİMER ECZANESİ" → "Çimer Eczanesi"; rakam içeren sözcükler (NO:24, A-101, 5B/B) olduğu gibi kalır. */
export function titleTr(str) {
  return str
    .split(/(\s+)/)
    .map((tok) => {
      if (!tok.trim()) return tok;
      if (/^NO:/i.test(tok)) return 'No:' + tok.slice(3).toLocaleUpperCase('tr-TR');
      if (/\d/.test(tok)) return tok;
      const lower = tok.toLocaleLowerCase('tr-TR');
      const i = lower.search(/[a-zçğıöşü]/i);
      if (i < 0) return tok;
      return lower.slice(0, i) + lower[i].toLocaleUpperCase('tr-TR') + lower.slice(i + 1);
    })
    .join('');
}

const iso = (d, t) => {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}T${t}:00+03:00` : '';
};
const ymd = (d) => {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
};

/** Sayfa HTML'ini kayıtlara ayırır. Her eczane bir <h4> başlığıyla başlar; haritada gösterme bağlantısı koordinatı taşır. */
export function parsePharmacies(html) {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (_m, inner) => `\n@@H@@${stripTags(inner)}\n`);
  s = s.replace(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, inner) => {
    const mm = decodeEntities(href).match(/google\.[a-z.]+\/maps\?q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (mm) return `\n@@MAP:${mm[1]},${mm[2]}\n`;
    return stripTags(inner);
  });
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|tr|h[1-6]|table|ul|ol|section)>/gi, '\n');
  s = decodeEntities(stripTags(s));
  const lines = s.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);

  const records = [];
  let cur = null;
  const flush = () => {
    if (cur && cur.lat !== null && cur.heading.includes(' - ')) records.push(cur);
    cur = null;
  };
  const dateRe = /(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})\s*\/\s*(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})/;
  for (const line of lines) {
    if (line.startsWith('@@H@@')) {
      flush();
      cur = { heading: line.slice(5).trim(), lat: null, lng: null, phones: [], addr: [], desc: [], from: '', to: '' };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('@@MAP:')) {
      const [la, ln] = line.slice(6).split(',').map(parseFloat);
      if (Number.isFinite(la) && Number.isFinite(ln)) { cur.lat = la; cur.lng = ln; }
      continue;
    }
    const dm = line.match(dateRe);
    if (dm) { cur.from = `${dm[1]} ${dm[2]}`; cur.to = `${dm[3]} ${dm[4]}`; continue; }
    if (/^[\d\s\-/()+.]+$/.test(line) && /\d{6,}/.test(line.replace(/\D/g, ''))) {
      line.split('/').map((p) => p.trim()).filter((p) => p.replace(/\D/g, '').length >= 7).forEach((p) => cur.phones.push(p));
      continue;
    }
    if (/haritada görüntülemek/i.test(line)) continue;
    if (/nöbetçidir\.?$/i.test(line)) continue;
    if (/^\(.*\)$/.test(line)) cur.desc.push(line.slice(1, -1).trim());
    else if (cur.phones.length === 0 && cur.lat === null && cur.addr.length < 4) cur.addr.push(line);
  }
  flush();
  return records;
}

export function toOutput(records, districts, sourceUrl) {
  const total = records.length;
  const picked = records.filter((r) => {
    const dist = r.heading.slice(r.heading.indexOf(' - ') + 3).trim().toLocaleUpperCase('tr-TR');
    return districts.some((d) => dist.startsWith(d));
  });
  const items = picked.map((r) => {
    const cut = r.heading.indexOf(' - ');
    const [fd, ft] = r.from ? r.from.split(' ') : ['', ''];
    const [td, tt] = r.to ? r.to.split(' ') : ['', ''];
    return {
      name: titleTr(r.heading.slice(0, cut).trim()),
      phone: r.phones[0] || '',
      phone2: r.phones[1] || '',
      locality: titleTr(r.heading.slice(cut + 3).trim()),
      address: titleTr(r.addr.join(' ')),
      addressDescription: titleTr(r.desc.join(' - ')),
      lat: r.lat,
      lng: r.lng,
      mapLink: `https://www.google.com/maps?q=${r.lat},${r.lng}`,
      workingHours: ft && tt ? (fd === td ? `${ft} - ${tt}` : `${ft} - ertesi gün ${tt}`) : '',
      note: '',
      _sentry: ymd(fd),
      _from: iso(fd, ft || '00:00'),
    };
  }).filter((p) => p.address || p.phone);
  const dates = items.map((i) => i._sentry).filter(Boolean).sort();
  return {
    total,
    out: {
      source: 'Bursa Eczacı Odası',
      sourceUrl: sourceUrl.startsWith('https://') ? sourceUrl : 'https://www.beo.org.tr/nobetci-eczaneler',
      districts,
      fetchedAt: new Date().toISOString(),
      sentryDate: dates.length ? dates[dates.length - 1] : '',
      items: items.map(({ _sentry, _from, ...rest }) => rest),
    },
  };
}

// ───────── çalıştır (yalnızca doğrudan çağrılınca; testler için içe aktarılabilir) ─────────
async function main() {
  if (!/^https:\/\//i.test(SOURCE_URL) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(SOURCE_URL)) {
    throw new Error('ECZANE_SOURCE_URL https:// ile başlamalıdır.');
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  let html;
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'MutlularHaberBot/1.0 (+https://mutlularhaber.com; mahalle portali, nobetci eczane listesi, gunde en fazla 2 istek)',
        Accept: 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Kaynak ${res.status} ${res.statusText} döndürdü.`);
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }
  if (html.length > 6_000_000) throw new Error('Kaynak beklenenden çok büyük; işlem durduruldu.');

  const records = parsePharmacies(html);
  if (records.length < MIN_TOTAL_RECORDS) {
    throw new Error(`Sayfada yalnızca ${records.length} eczane kaydı çözülebildi (en az ${MIN_TOTAL_RECORDS} bekleniyordu); sayfa yapısı değişmiş olabilir. Dosya yazılmadı.`);
  }
  const { total, out } = toOutput(records, DISTRICTS, SOURCE_URL);
  if (out.items.length === 0) {
    throw new Error(`Seçili ilçelerde (${DISTRICTS.join(', ')}) nöbetçi eczane bulunamadı; dosya yazılmadı.`);
  }
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Nöbetçi eczane verisi yazıldı: ${out.items.length}/${total} kayıt (${DISTRICTS.join(', ')}), nöbet tarihi ${out.sentryDate || 'bilinmiyor'} → ${OUT}`);
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('HATA:', e.message);
    process.exit(1);
  });
}
