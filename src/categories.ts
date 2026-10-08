// Faaliyet alanı ve haber kategorisi yardımcıları (mükerrer / yazım hatası önleme, varsayılan listeler).

/** Karşılaştırma için ad normalizasyonu: Türkçe küçük harf, boşluk/noktalama yok ("Su Tesisatı" = "su-tesisatı"). */
export const normName = (s: string) =>
  (s || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9çğıöşü]+/g, '');

/** Ad listede (aynı/çok benzer yazımla) zaten var mı? Varsa var olan adı döndürür. */
export function findDuplicate(name: string, existing: string[]): string | null {
  const n = normName(name);
  if (!n) return null;
  return existing.find((e) => normName(e) === n) || null;
}

/** Yönetici girişini temizler: baştaki/sondaki boşluk, çoklu boşluk; her kelimenin ilk harfi büyük (Türkçe). */
export function cleanLabel(raw: string, max = 40): { ok: true; name: string } | { ok: false; error: string } {
  const name = (raw || '').replace(/\s+/g, ' ').trim();
  if (name.length < 3) return { ok: false, error: 'Ad en az 3 karakter olmalı.' };
  if (name.length > max) return { ok: false, error: `Ad en fazla ${max} karakter olabilir.` };
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(name)) return { ok: false, error: 'Ad en az bir harf içermeli.' };
  return { ok: true, name };
}

export interface NewsCategory {
  id: string;
  ad: string;
  ikon: string;
  sira: number;
}

/** Yönetici hiç kategori eklemediyse kullanılan varsayılan haber kategorileri. */
export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'Muhtarlık & Resmi', ad: 'Muhtarlık & Resmi', ikon: '📜', sira: 1 },
  { id: 'Belediye & Altyapı', ad: 'Belediye & Altyapı', ikon: '🏛️', sira: 2 },
  { id: 'Çevre & Parklar', ad: 'Çevre & Parklar', ikon: '🌳', sira: 3 },
  { id: 'Asayiş & Güvenlik', ad: 'Asayiş & Güvenlik', ikon: '👮', sira: 4 },
  { id: 'Dayanışma & Doğa', ad: 'Dayanışma & Doğa', ikon: '🤝', sira: 5 },
  { id: 'Eğitim & Kültür', ad: 'Eğitim & Kültür', ikon: '🎓', sira: 6 },
  { id: 'Spor & Sağlık', ad: 'Spor & Sağlık', ikon: '⚽', sira: 7 },
  { id: 'Esnaf & Çarşı', ad: 'Esnaf & Çarşı', ikon: '🏪', sira: 8 },
  { id: 'Duyuru & Taziye', ad: 'Duyuru & Taziye', ikon: '📢', sira: 9 },
];

/** Firestore'dan gelen kategorileri güvenle listeye çevirir; boşsa varsayılanı döndürür. */
export function resolveNewsCategories(remote: { id: string; [k: string]: any }[]): NewsCategory[] {
  const list: NewsCategory[] = [];
  const seen = new Set<string>();
  remote.forEach((d) => {
    const ad = typeof d.ad === 'string' ? d.ad.trim().slice(0, 40) : '';
    if (!ad) return;
    const key = normName(ad);
    if (seen.has(key)) return;
    seen.add(key);
    list.push({
      id: ad,
      ad,
      ikon: typeof d.ikon === 'string' && d.ikon.trim() ? d.ikon.trim().slice(0, 4) : '📰',
      sira: typeof d.sira === 'number' && Number.isFinite(d.sira) ? d.sira : 999,
    });
  });
  if (list.length === 0) return DEFAULT_NEWS_CATEGORIES;
  return list.sort((a, b) => a.sira - b.sira || a.ad.localeCompare(b.ad, 'tr'));
}

/** Bir usta kaydındaki tüm faaliyet alanları (ana alan başta, tekrarsız). */
export function ustaAreas(p: { esnafKategori?: string; faaliyetAlanlari?: string[] } | null | undefined): string[] {
  if (!p) return [];
  const out: string[] = [];
  const add = (x?: string) => {
    const v = (x || '').trim();
    if (v && !out.some((o) => normName(o) === normName(v))) out.push(v);
  };
  add(p.esnafKategori);
  (p.faaliyetAlanlari || []).forEach(add);
  return out;
}
