// Usta / hizmet talebi eşleştirme ve bildirim yardımcıları.
// Bu dosya App.tsx'e bağımlı değildir (döngüsel import olmasın diye kategori listesi parametre olarak verilir).
import type { ServiceRequest, UserProfile } from './firebase';

export interface MainCatRef {
  id: string;
  name: string;
  shortTitle?: string;
}

/** Esnaf (dükkan / işletme) türleri. Usta hizmet alanlarından ayrıdır. */
export const ESNAF_TURLERI = [
  'Bakkal, Market & Şarküteri',
  'Fırın & Pastane',
  'Kasap & Et Ürünleri',
  'Manav & Organik',
  'Kafe & Restoran',
  'Kuaför & Güzellik Salonu',
  'Giyim & Tekstil',
  'Eczane & Sağlık Ürünleri',
  'Kırtasiye & Hediyelik',
  'Oto Bakım & Yedek Parça',
  'Çiçek & Bahçe'
];

export const DIGER_ALAN = '__diger__';

const slugTr = (t: string) =>
  t
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/** Faaliyet alanı yazısını temizler; geçersizse hata metni döndürür. */
export function cleanAreaName(raw: string): { ok: true; name: string; slug: string } | { ok: false; error: string } {
  const name = (raw || '').replace(/\s+/g, ' ').trim();
  if (name.length < 3) return { ok: false, error: 'Faaliyet alanı en az 3 harf olmalı.' };
  if (name.length > 40) return { ok: false, error: 'Faaliyet alanı en fazla 40 karakter olabilir.' };
  if (!/^[\p{L}\p{N} &,\-/().]+$/u.test(name)) return { ok: false, error: 'Faaliyet alanında yalnızca harf, rakam ve & , - / ( ) . kullanılabilir.' };
  const slug = slugTr(name);
  if (!slug) return { ok: false, error: 'Geçerli bir faaliyet alanı yazın.' };
  return { ok: true, name: name.charAt(0).toLocaleUpperCase('tr-TR') + name.slice(1), slug };
}

/** Topluluğun eklediği faaliyet alanını, talep formlarının kullandığı ana kategori biçimine çevirir. */
export function customAreaToMainCat(area: { id: string; ad: string }, template?: any) {
  return {
    id: 'ozel_' + area.id,
    name: area.ad,
    shortTitle: area.ad,
    icon: '🛠️',
    badge: 'Yeni Alan',
    color: template?.color || 'from-slate-700 via-slate-800 to-slate-900',
    bgLight: template?.bgLight || 'bg-slate-50/70',
    borderLight: template?.borderLight || 'border-slate-200',
    textCol: template?.textCol || 'text-slate-700',
    desc: `${area.ad} alanında mahalle ustalarından teklif alın.`,
    subCategories: [
      {
        id: 'ozel_alt_' + area.id,
        name: area.ad,
        icon: '🛠️',
        badge: 'Yeni Alan',
        desc: `${area.ad} hizmeti`,
        popular: false,
        sampleRequests: []
      }
    ]
  };
}

/** Usta mı? Yeni kayıtlarda hesapTipi vardır; eski kayıtlar kategoriye bakılarak ayrılır. */
export function isUstaProfile(profile: UserProfile | null | undefined): boolean {
  if (!profile || profile.role !== 'esnaf') return false;
  if (profile.hesapTipi === 'usta') return true;
  if (profile.hesapTipi === 'esnaf') return false;
  const cat = norm(profile.esnafKategori);
  return !(cat.includes('bakkal') || cat.includes('market') || cat.includes('şarküteri'));
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
export function esnafCategoryIds(profile: UserProfile | null | undefined, mainCats: MainCatRef[] = []): Set<string> | 'all' {
  const ids = new Set<string>();
  if (!profile) return ids;
  const cat = norm(profile.esnafKategori);
  if (cat.includes('diğer mahalle')) return 'all';
  // Kategori adı, listedeki (topluluğun eklediği alanlar dahil) bir kategoriyle birebir aynıysa doğrudan eşleşir.
  const tags = (profile.uzmanlikEtiketleri || []).map(norm);
  mainCats.forEach(c => {
    if (norm(c.name) === cat || norm(c.shortTitle) === cat || tags.includes(norm(c.name))) ids.add(c.id);
  });
  const text = `${cat} ${tags.join(' ')}`;
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
  if (!isUstaProfile(profile)) return false;
  const cats = esnafCategoryIds(profile, mainCats);
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
