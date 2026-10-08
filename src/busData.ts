// Burulaş hat bilgileri: veri modeli, saat ayrıştırma ve "sıradaki sefer" hesabı.
//
// Veri kaynağı: Burulaş'ın herkese açık, belgeli bir hat/saat API'si yoktur. Bu yüzden:
//  • Hat kodları, kalkış/varış adları ve mahalleyi ilgilendiren hat listesi siteConfig.LOCAL_BUS_GROUPS içinde
//    (mahalle sakinlerinin bildirdiği gerçek bilgi),
//  • Güzergâh ve sefer SAATLERİ yönetici panelinden ("Otobüs Hatları") resmî BursaKart/Burulaş bilgisine bakılarak
//    girilir ve Firestore'daki bus_lines koleksiyonunda tutulur. Saati girilmemiş hat için uydurma saat gösterilmez.
import { LOCAL_BUS_GROUPS } from './siteConfig';

export type DayType = 'haftaIci' | 'cumartesi' | 'pazar';
export type Direction = 'gidis' | 'donus';

export const DAY_LABELS: Record<DayType, string> = { haftaIci: 'Hafta içi', cumartesi: 'Cumartesi', pazar: 'Pazar' };
export const DIRECTION_LABELS: Record<Direction, string> = { gidis: 'Gidiş', donus: 'Dönüş' };
export const DAY_TYPES: DayType[] = ['haftaIci', 'cumartesi', 'pazar'];
export const DIRECTIONS: Direction[] = ['gidis', 'donus'];

export type BusTimes = Partial<Record<Direction, Partial<Record<DayType, string[]>>>>;

export interface BusLine {
  code: string;
  baslik: string;
  kalkis: string;
  varis: string;
  /** Güzergâh: serbest metin (ana cadde / durak sıralaması) */
  guzergah: string;
  /** Mahalleye doğrudan hizmet veren hat mı? */
  mahalle: boolean;
  /** Mahalle yakınındaki hangi duraktan geçiyor */
  durak: string;
  saatler: BusTimes;
  not: string;
  kaynak: string;
  /** YYYY-MM-DD */
  guncelleme: string;
  sira: number;
}

export const emptyLine = (code: string): BusLine => ({
  code,
  baslik: '',
  kalkis: '',
  varis: '',
  guzergah: '',
  mahalle: false,
  durak: '',
  saatler: {},
  not: '',
  kaynak: '',
  guncelleme: '',
  sira: 0,
});

// ───────── saat ayrıştırma ─────────

const TIME_RE = /(?<!\d)([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)(?!\d)/g;

/** Gece seferleri (00:00–03:59) listenin sonunda sıralanır. */
const sortKey = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h < 4 ? h + 24 : h) * 60 + m;
};

/** Serbest metinden (yapıştırılmış tablo, virgülle ayrılmış liste vb.) saatleri çıkarır: "06:05" biçiminde, tekrarsız, sıralı. */
export function parseTimes(text: string): string[] {
  const set = new Set<string>();
  for (const m of (text || '').matchAll(TIME_RE)) {
    set.add(`${m[1].padStart(2, '0')}:${m[2]}`);
  }
  return [...set].sort((a, b) => sortKey(a) - sortKey(b));
}

// ───────── gün/saat hesabı (İstanbul saati) ─────────

export function istanbulClock(now: Date = new Date()): { minutes: number; day: DayType } {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(d);
  const get = (parts: Intl.DateTimeFormatPart[], t: string) => parts.find((p) => p.type === t)?.value || '';
  const cur = fmt(now);
  const h = parseInt(get(cur, 'hour'), 10) || 0;
  const m = parseInt(get(cur, 'minute'), 10) || 0;
  // Gece yarısından sonraki 04:00'a kadar olan seferler önceki günün tarifesine aittir: günü 4 saat geriden hesapla
  const wd = get(fmt(new Date(now.getTime() - 4 * 3600 * 1000)), 'weekday'); // Mon, Tue, ..., Sat, Sun
  const day: DayType = wd === 'Sat' ? 'cumartesi' : wd === 'Sun' ? 'pazar' : 'haftaIci';
  return { minutes: h * 60 + m, day };
}

export interface Upcoming {
  time: string;
  /** şu andan kaç dakika sonra */
  inMin: number;
}

/** Verilen saat listesinden, şu andan sonraki ilk `count` seferi döndürür. */
export function nextDepartures(times: string[], now: Date = new Date(), count = 3): Upcoming[] {
  const { minutes } = istanbulClock(now);
  const nowKey = minutes < 4 * 60 ? minutes + 24 * 60 : minutes;
  return times
    .map((t) => ({ time: t, inMin: sortKey(t) - nowKey }))
    .filter((x) => x.inMin >= 0)
    .slice(0, count);
}

export const timesOf = (line: BusLine, dir: Direction, day: DayType): string[] => line.saatler?.[dir]?.[day] || [];

export const lineHasTimes = (line: BusLine) =>
  DIRECTIONS.some((d) => DAY_TYPES.some((t) => timesOf(line, d, t).length > 0));

/** Bugünün tarifesinde, iki yönün sıradaki ilk seferi (varsa). */
export function nextForLine(line: BusLine, now: Date = new Date()): { dir: Direction; next: Upcoming } | null {
  const { day } = istanbulClock(now);
  let best: { dir: Direction; next: Upcoming } | null = null;
  for (const dir of DIRECTIONS) {
    const n = nextDepartures(timesOf(line, dir, day), now, 1)[0];
    if (n && (!best || n.inMin < best.next.inMin)) best = { dir, next: n };
  }
  return best;
}

export const formatInMin = (n: number) => (n < 1 ? 'şimdi' : n < 60 ? `${n} dk sonra` : `${Math.floor(n / 60)} sa ${n % 60 ? `${n % 60} dk ` : ''}sonra`.replace('  ', ' '));

// ───────── başlangıç listesi (siteConfig) + Firestore birleştirme ─────────

// Ayırıcı: kısa tire, uzun tire ve '-' (karakter kodlarıyla yazıldı: dosya kodlaması bozulsa da çalışsın)
const SEP = /\s*[\u2013\u2014-]\s*/;

/** siteConfig.LOCAL_BUS_GROUPS içindeki gerçek hat bilgilerinden başlangıç kayıtları üretir. */
export function seedLines(): BusLine[] {
  const out: BusLine[] = [];
  let order = 0;
  LOCAL_BUS_GROUPS.forEach((g, gi) => {
    g.lines.forEach((l) => {
      const parts = (l.name || '').split(SEP).map((x) => x.trim()).filter(Boolean);
      out.push({
        ...emptyLine(l.code),
        baslik: l.name || '',
        kalkis: parts[0] || '',
        varis: parts.length > 1 ? parts[parts.length - 1] : '',
        mahalle: gi === 0,
        durak: gi === 0 ? '' : g.title.replace(/^.*?:\s*/, ''),
        sira: order++,
      });
    });
  });
  return out;
}

const natural = (a: string, b: string) => a.localeCompare(b, 'tr', { numeric: true });

/** Başlangıç kayıtları ile yönetici panelinden girilen kayıtları kod bazında birleştirir (yönetici kaydı üstün gelir). */
export function mergeBusLines(seeds: BusLine[], remote: Partial<BusLine>[]): BusLine[] {
  const map = new Map<string, BusLine>();
  seeds.forEach((s) => map.set(s.code, { ...s }));
  remote.forEach((r) => {
    if (!r || !r.code) return;
    const base = map.get(r.code) || emptyLine(r.code);
    const merged: BusLine = { ...base };
    (Object.keys(r) as (keyof BusLine)[]).forEach((k) => {
      const v = r[k];
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v === '' && typeof base[k] === 'string' && base[k] !== '') return; // boş alan başlangıç bilgisini silmez
      (merged as any)[k] = v;
    });
    // kalkış/varış boşsa başlıktan türet
    if (!merged.kalkis && merged.baslik) {
      const parts = merged.baslik.split(SEP).map((x) => x.trim()).filter(Boolean);
      merged.kalkis = parts[0] || '';
      merged.varis = parts.length > 1 ? parts[parts.length - 1] : '';
    }
    map.set(r.code, merged);
  });
  return [...map.values()].sort((a, b) => {
    if (a.mahalle !== b.mahalle) return a.mahalle ? -1 : 1;
    if (a.sira !== b.sira && a.sira && b.sira) return a.sira - b.sira;
    return natural(a.code, b.code);
  });
}

/** YYYY-MM-DD ve gerçek bir takvim günü mü? (2026-13-99 geçersiz) */
export function isValidYmd(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Firestore belge kimliği (kod) için güvenli biçim. */
export const lineDocId = (code: string) => code.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();

/** Firestore'dan gelen ham belgeyi güvenli BusLine alanlarına çevirir (bozuk/eksik alanlar elenir). */
export function sanitizeRemote(id: string, d: any): Partial<BusLine> | null {
  if (!d || typeof d !== 'object') return null;
  const str = (v: unknown, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const code = str(d.code, 12) || id;
  if (!code) return null;
  const saatler: BusTimes = {};
  DIRECTIONS.forEach((dir) => {
    DAY_TYPES.forEach((day) => {
      const raw = d.saatler?.[dir]?.[day];
      if (Array.isArray(raw)) {
        const list = parseTimes(raw.filter((x: unknown) => typeof x === 'string').join(' '));
        if (list.length) {
          saatler[dir] = saatler[dir] || {};
          saatler[dir]![day] = list;
        }
      }
    });
  });
  return {
    code,
    baslik: str(d.baslik),
    kalkis: str(d.kalkis),
    varis: str(d.varis),
    guzergah: str(d.guzergah, 1500),
    mahalle: d.mahalle === true,
    durak: str(d.durak),
    saatler,
    not: str(d.not, 600),
    kaynak: str(d.kaynak, 200),
    guncelleme: isValidYmd(str(d.guncelleme, 10)) ? str(d.guncelleme, 10) : '',
    sira: typeof d.sira === 'number' && Number.isFinite(d.sira) ? d.sira : 0,
  };
}

// ───────── yönetici formu → Firestore belgesi ─────────

export interface BusForm {
  code: string;
  baslik: string;
  kalkis: string;
  varis: string;
  guzergah: string;
  durak: string;
  mahalle: boolean;
  not: string;
  kaynak: string;
  guncelleme: string;
  /** anahtar: "gidis.haftaIci" gibi; değer: yapıştırılan serbest metin */
  times: Record<string, string>;
}

export const emptyForm = (code = ''): BusForm => ({
  code,
  baslik: '',
  kalkis: '',
  varis: '',
  guzergah: '',
  durak: '',
  mahalle: false,
  not: '',
  kaynak: 'BursaKart / Burulaş',
  guncelleme: '',
  times: {},
});

/** Mevcut hattı forma çevirir (saatler "06:05, 06:35, …" metni olarak). */
export function lineToForm(l: BusLine): BusForm {
  const times: Record<string, string> = {};
  DIRECTIONS.forEach((d) => DAY_TYPES.forEach((t) => {
    const list = timesOf(l, d, t);
    if (list.length) times[`${d}.${t}`] = list.join(', ');
  }));
  return {
    code: l.code, baslik: l.baslik, kalkis: l.kalkis, varis: l.varis, guzergah: l.guzergah, durak: l.durak,
    mahalle: l.mahalle, not: l.not, kaynak: l.kaynak || 'BursaKart / Burulaş', guncelleme: l.guncelleme, times,
  };
}

export type PayloadResult = { ok: true; data: Record<string, any>; total: number; warnings: string[] } | { ok: false; error: string };

export function buildBusPayload(f: BusForm): PayloadResult {
  const code = (f.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9 /-]{0,11}$/.test(code)) return { ok: false, error: 'Hat kodu 1–12 karakter olmalı (harf, rakam, boşluk, / veya -). Örnek: 15H, B15C' };
  if (lineDocId(code).length === 0) return { ok: false, error: 'Hat kodu geçersiz.' };
  const guncelleme = (f.guncelleme || '').trim();
  if (guncelleme && !isValidYmd(guncelleme)) return { ok: false, error: 'Güncelleme tarihi geçersiz.' };
  const clip = (v: string, n: number) => (v || '').trim().slice(0, n);
  const saatler: BusTimes = {};
  const warnings: string[] = [];
  let total = 0;
  DIRECTIONS.forEach((d) => DAY_TYPES.forEach((t) => {
    const raw = f.times[`${d}.${t}`] || '';
    const list = parseTimes(raw);
    if (raw.trim() && list.length === 0) warnings.push(`${DIRECTION_LABELS[d]} / ${DAY_LABELS[t]}: yapıştırılan metinde saat bulunamadı.`);
    if (list.length) {
      saatler[d] = saatler[d] || {};
      saatler[d]![t] = list;
      total += list.length;
    }
  }));
  return {
    ok: true,
    total,
    warnings,
    data: {
      code: lineDocId(code),
      baslik: clip(f.baslik, 400),
      kalkis: clip(f.kalkis, 400),
      varis: clip(f.varis, 400),
      guzergah: clip(f.guzergah, 1500),
      durak: clip(f.durak, 400),
      mahalle: f.mahalle === true,
      not: clip(f.not, 600),
      kaynak: clip(f.kaynak, 200),
      guncelleme,
      saatler,
      sira: 0,
    },
  };
}
