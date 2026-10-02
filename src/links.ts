// İçerik bağlantıları (FAZ 2A): her içerik için kalıcı, paylaşılabilir adres.
//
// Biçim:  {tür}/{başlık-özeti}--{belgeId}
//   örn:  haber/su-kesintisi-duyurusu--AbC123xyz
// Belge kimliği adresin içinde olduğu için hiçbir veriye alan eklemeden her içerik çözülür;
// başlık sonradan değişse de adres çalışır (yalnızca kimlik esastır).
//
// Adres iki biçimde okunur:
//   path:  {base}haber/slug--id        (kendi alan adı + SPA yönlendirmeli hosting gelince)
//   query: {base}?i=haber/slug--id     (GitHub Pages'te her zaman 200 döner, şimdilik varsayılan)
// Paylaşılan bağlantının hangi biçimde üretileceğini LINK_STYLE belirler.

import { SITE_ORIGIN } from './siteConfig';

export type ContentType = 'haber' | 'duyuru' | 'cenaze' | 'ilan' | 'esnaf' | 'hizmet';
export type ContentKind = 'haber' | 'cenaze' | 'marketplace' | 'kayip' | 'davet' | 'kursu' | 'kampanya' | 'isletme';

export const CONTENT_TYPES: ContentType[] = ['haber', 'duyuru', 'cenaze', 'ilan', 'esnaf', 'hizmet'];

// Alan adı (www.mutlularhaber.com) bağlandığı için 'path': bağlantılar mutlularhaber.com/haber/baslik--id biçiminde üretilir.
// Eski ?i=... ve ?haber=... bağlantıları okunmaya devam eder.
export const LINK_STYLE: 'query' | 'path' = 'path';

// Eşleme katmanı: içerik türü -> mevcut (Türkçe) Firestore koleksiyonları. Koleksiyon adları değişmez.
export const CONTENT_COLLECTIONS: Record<Exclude<ContentType, 'hizmet'>, { col: string; kind: ContentKind }[]> = {
  haber: [{ col: 'haberler', kind: 'haber' }],
  cenaze: [{ col: 'cenaze_ilanlari', kind: 'cenaze' }],
  ilan: [
    { col: 'marketplace_items', kind: 'marketplace' },
    { col: 'lost_found_items', kind: 'kayip' }
  ],
  duyuru: [
    { col: 'mahalle_davetleri', kind: 'davet' },
    { col: 'mahalle_kursusu', kind: 'kursu' }
  ],
  esnaf: [
    { col: 'businesses', kind: 'isletme' },
    { col: 'esnaf_kampanyalar', kind: 'kampanya' }
  ]
};

export const KIND_TO_TYPE: Record<ContentKind, ContentType> = {
  haber: 'haber',
  cenaze: 'cenaze',
  marketplace: 'ilan',
  kayip: 'ilan',
  davet: 'duyuru',
  kursu: 'duyuru',
  kampanya: 'esnaf',
  isletme: 'esnaf'
};

export interface ParsedLink {
  type: ContentType;
  id?: string;
  slug?: string;
}

const isType = (t?: string): t is ContentType => !!t && (CONTENT_TYPES as string[]).includes(t);

export function slugify(text: string): string {
  const s = (text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.slice(0, 60).replace(/-+$/g, '');
}

export function getBase(): string {
  const b = (import.meta as any).env?.BASE_URL;
  return typeof b === 'string' && b ? b : '/';
}

/** {tür}/{slug}--{id}  (hizmet için: hizmet/{kategori-slug}) */
export function contentPath(type: ContentType, id: string, title?: string): string {
  if (type === 'hizmet') return `hizmet/${slugify(title || id)}`;
  const slug = slugify(title || '');
  return `${type}/${slug ? slug + '--' : ''}${id}`;
}

export function buildContentUrl(type: ContentType, id: string, title?: string): string {
  const host = window.location.hostname;
  const origin = host === 'localhost' || host === '127.0.0.1' ? window.location.origin : SITE_ORIGIN;
  const base = getBase();
  const path = contentPath(type, id, title);
  const safe = path.split('/').map(encodeURIComponent).join('/');
  return LINK_STYLE === 'path' ? `${origin}${base}${safe}` : `${origin}${base}?i=${safe}`;
}

function parseRef(type: ContentType, ref: string): ParsedLink {
  let decoded = ref;
  try {
    decoded = decodeURIComponent(ref);
  } catch (_) {
    /* bozuk kodlama: olduğu gibi kullan */
  }
  decoded = decoded.replace(/\/+$/, '');
  if (type === 'hizmet') return { type, slug: decoded };
  const i = decoded.lastIndexOf('--');
  return i >= 0 ? { type, id: decoded.slice(i + 2), slug: decoded.slice(0, i) } : { type, id: decoded };
}

/** Adresi okur: önce ?i=tür/ref, sonra yol tabanlı {base}tür/ref. Eski ?haber= adresleri ayrı işlenir. */
export function parseContentLink(loc: { pathname: string; search: string }, base: string): ParsedLink | null {
  const q = new URLSearchParams(loc.search).get('i');
  if (q) {
    const [t, ...rest] = q.split('/');
    if (isType(t) && rest.length) return parseRef(t, rest.join('/'));
  }
  let path = loc.pathname;
  if (base && base !== '/' && path.startsWith(base)) path = path.slice(base.length);
  const [t, ...rest] = path.split('/').filter(Boolean);
  if (isType(t) && rest.length) return parseRef(t, rest.join('/'));
  return null;
}

/** Bir içerik görünümü kapanırken adres çubuğunu temizler (yeniden açılmasın). */
export function cleanedUrl(loc: { pathname: string; search: string; hash: string }, base: string, sectionSeg = ''): string {
  const params = new URLSearchParams(loc.search);
  params.delete('i');
  params.delete('haber');
  params.delete('news');
  params.delete('id');
  let path = loc.pathname;
  const rel = base && base !== '/' && path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '');
  const first = rel.split('/').filter(Boolean)[0];
  if (isType(first)) path = (base || '/') + sectionSeg;
  const qs = params.toString();
  return path + (qs ? '?' + qs : '') + (loc.hash && !loc.hash.startsWith('#haber-') ? loc.hash : '');
}

// ── BÖLÜM ADRESLERİ ──
// Ana ekranların temiz adresleri: mutlularhaber.com/haber, /alimsatim, /hizmet ...
// Adres çubuğunda Türkçe karakter %-kodlanarak çirkin göründüğü için kanonik adresler ASCII'dir;
// "/alımsatım" gibi Türkçe yazımlar da açılır ve kanonik adrese çevrilir.
export const TAB_PATHS: Record<string, string> = {
  home: 'haber',
  news: 'haber',
  market: 'alimsatim',
  services: 'hizmet',
  davet: 'pano',
  esnaf: 'esnaf',
  meclis: 'meclis',
  lostfound: 'kayip',
  pazar: 'pazar',
  profile: 'profil',
  notifications: 'bildirimler',
  explore: 'kesfet',
  yemek: 'yemek'
};

const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  haber: 'home',
  haberler: 'home',
  alimsatim: 'market',
  'alim-satim': 'market',
  hizmet: 'services',
  hizmetler: 'services',
  pano: 'davet',
  esnaf: 'esnaf',
  meclis: 'meclis',
  kayip: 'lostfound',
  pazar: 'pazar',
  profil: 'profile',
  bildirimler: 'notifications',
  kesfet: 'explore',
  yemek: 'yemek'
};

// İçerik adresinin (örn. /ilan/baslik--id) hangi ekranda açılacağı
const TYPE_TO_TAB: Record<string, string> = {
  haber: 'home',
  cenaze: 'home',
  ilan: 'market',
  duyuru: 'davet',
  esnaf: 'esnaf',
  hizmet: 'services'
};

function firstSegments(pathname: string, base: string): string[] {
  let path = pathname;
  if (base && base !== '/' && path.startsWith(base)) path = path.slice(base.length);
  return path.split('/').filter(Boolean).map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch (_) {
      return seg;
    }
  });
}

/** Adres çubuğundan ekran kimliğini bulur; tanınmıyorsa null. */
export function tabFromPathname(pathname: string, base: string): string | null {
  const segs = firstSegments(pathname, base);
  if (segs.length === 0) return 'home';
  const key = slugify(segs[0]);
  if (segs.length === 1) return PATH_TO_TAB[key] ?? null;
  return TYPE_TO_TAB[key] ?? PATH_TO_TAB[key] ?? null;
}

/** Ekranın kanonik adresi (path). Ana sayfa da /haber olur. */
export function sectionPath(tab: string, base: string): string {
  const seg = TAB_PATHS[tab];
  return (base || '/') + (seg || '');
}

/** Bu adres bir ekranın kanonik adresi mi? ("/" ana sayfa için de geçerli) */
export function isCanonicalSection(pathname: string, tab: string, base: string): boolean {
  const norm = (x: string) => x.replace(/\/+$/, '') || '/';
  const cur = norm(pathname);
  if (tab === 'home' && (cur === norm(base || '/') )) return true;
  return cur === norm(sectionPath(tab, base));
}
