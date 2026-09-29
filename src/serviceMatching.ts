// Usta / hizmet talebi eşleştirme ve bildirim yardımcıları.
// Bu dosya App.tsx'e bağımlı değildir (döngüsel import olmasın diye kategori listesi parametre olarak verilir).
import type { ServiceRequest, UserProfile } from './firebase';

export interface MainCatRef {
  id: string;
  name: string;
  shortTitle?: string;
}

const norm = (s?: string) => (s || '').toLocaleLowerCase('tr-TR');

// Ana kategori kimliği -> metinde geçmesi halinde o kategoriye işaret eden anahtar kelimeler
const KEYWORDS: Record<string, string[]> = {
  tesisat_su_isitma: ['tesisat', 'ısıtma', 'kombi', 'kalorifer', 'petek', 'doğalgaz', 'su kaçağı'],
  elektrik_aydinlatma_elektronik: ['elektrik', 'aydınlatma', 'elektronik', 'uydu', 'kamera', 'cihaz'],
  ev_tadilat_boya_marangoz: ['tadilat', 'boya', 'badana', 'marangoz', 'mobilya', 'tamirat', 'montaj', 'fayans', 'alçı'],
  temizlik_yikama_ilaclama: ['temizlik', 'yıkama', 'ilaçlama'],
  nakliyat_cilingir_yardim: ['nakliyat', 'nakliye', 'çilingir', 'anahtar', 'acil servis', 'kurtarma'],
  dugun_organizasyon: ['düğün', 'nişan', 'doğum günü', 'organizasyon', 'pasta'],
  bahce_peyzaj_demir: ['bahçe', 'peyzaj', 'demir', 'doğrama', 'kaynak'],
  terzi_kurutemizleme_doseme: ['terzi', 'kuru temizleme', 'döşeme'],
  ozel_ders_egitim: ['özel ders', 'eğitim', 'kuaför', 'kişisel']
};

/** Talebin (veya esnaf kategorisinin) ana kategori kimliğini bulur; bulunamazsa null. */
export function resolveKategoriId(
  kategori: string | undefined,
  altKategori: string | undefined,
  mainCats: MainCatRef[]
): string | null {
  const k = norm(kategori);
  const exact = mainCats.find(c => norm(c.name) === k || norm(c.shortTitle) === k);
  if (exact) return exact.id;
  const text = `${k} ${norm(altKategori)}`;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => text.includes(w))) return id;
  }
  return null;
}

/** Ustanın hizmet verdiği ana kategoriler. 'all' = "Diğer Mahalle Hizmeti" seçen usta tüm talepleri görür. */
export function esnafCategoryIds(profile: UserProfile | null | undefined): Set<string> | 'all' {
  const ids = new Set<string>();
  if (!profile) return ids;
  const cat = norm(profile.esnafKategori);
  if (cat.includes('diğer')) return 'all';
  const text = `${cat} ${(profile.uzmanlikEtiketleri || []).map(norm).join(' ')}`;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => text.includes(w))) ids.add(id);
  }
  return ids;
}

/** Talep bu ustaya uygun mu? Kategorisi belirlenemeyen talepler tüm ustalara açıktır. */
export function requestMatchesEsnaf(
  req: Pick<ServiceRequest, 'kategori' | 'altKategori'> & { kategoriId?: string },
  profile: UserProfile | null | undefined,
  mainCats: MainCatRef[]
): boolean {
  const cats = esnafCategoryIds(profile);
  if (cats === 'all') return true;
  const id = req.kategoriId || resolveKategoriId(req.kategori, req.altKategori, mainCats);
  if (!id) return true;
  return cats.has(id);
}

/** Firestore Timestamp / Date / sayı -> milisaniye (bekleyen serverTimestamp için 0). */
export function toMillis(v: any): number {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return 0;
}

export function timeAgoTr(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  return `${day} gün önce`;
}
