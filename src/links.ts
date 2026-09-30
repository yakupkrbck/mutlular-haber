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

export type ContentType = 'haber' | 'duyuru' | 'cenaze' | 'ilan' | 'esnaf' | 'hizmet';
export type ContentKind = 'haber' | 'cenaze' | 'marketplace' | 'kayip' | 'davet' | 'kursu' | 'kampanya';

export const CONTENT_TYPES: ContentType[] = ['haber', 'duyuru', 'cenaze', 'ilan', 'esnaf', 'hizmet'];

// Şimdilik 'query'. Alan adı ve yönlendirmeli hosting hazır olunca 'path' yapılır (tek satır).
export const LINK_STYLE: 'query' | 'path' = 'query';

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
  esnaf: [{ col: 'esnaf_kampanyalar', kind: 'kampanya' }]
};

export const KIND_TO_TYPE: Record<ContentKind, ContentType> = {
  haber: 'haber',
  cenaze: 'cenaze',
  marketplace: 'ilan',
  kayip: 'ilan',
  davet: 'duyuru',
  kursu: 'duyuru',
  kampanya: 'esnaf'
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
  const origin = window.location.origin;
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
export function cleanedUrl(loc: { pathname: string; search: string; hash: string }, base: string): string {
  const params = new URLSearchParams(loc.search);
  params.delete('i');
  params.delete('haber');
  params.delete('news');
  params.delete('id');
  let path = loc.pathname;
  const rel = base && base !== '/' && path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '');
  const first = rel.split('/').filter(Boolean)[0];
  if (isType(first)) path = base || '/';
  const qs = params.toString();
  return path + (qs ? '?' + qs : '') + (loc.hash && !loc.hash.startsWith('#haber-') ? loc.hash : '');
}
