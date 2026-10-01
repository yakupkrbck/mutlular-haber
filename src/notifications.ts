// Bildirim kategorileri, kullanıcı tercihleri ve içerikten türetilen bildirimler (FAZ 3).
//
// Mimari (ücretsiz plan, sunucu yok): bildirimler kullanıcının tarayıcısında, herkese açık yayınlanmış içeriklerden
// ve kullanıcıya özel teklif/talep verilerinden türetilir. Her içerik tek bir kimliğe sahip olduğu için
// aynı içerik için ikinci bildirim oluşmaz. Kapalı uygulamaya push için sunucu gerekir (FAZ 3 raporuna bakın).
import { toMillis, timeAgoTr } from './serviceMatching';

export type NotifCategory =
  | 'sondakika'
  | 'haber'
  | 'cenaze'
  | 'duyuru'
  | 'etkinlik'
  | 'esnaf'
  | 'hizmet'
  | 'teklif'
  | 'isletme'
  | 'yorum';

export interface NotifCategoryMeta {
  key: NotifCategory;
  label: string;
  emoji: string;
  desc: string;
  badge: string; // rozet rengi (Tailwind)
  audience: 'all' | 'usta' | 'esnaf' | 'soon';
}

export const NOTIF_CATEGORIES: NotifCategoryMeta[] = [
  { key: 'sondakika', label: 'Son dakika haberleri', emoji: '🚨', desc: 'Acil gelişmeler', badge: 'bg-red-600', audience: 'all' },
  { key: 'haber', label: 'Mahalle haberleri', emoji: '📰', desc: 'Diğer tüm haberler', badge: 'bg-orange-600', audience: 'all' },
  { key: 'cenaze', label: 'Cenaze ilanları', emoji: '🕊️', desc: 'Onaylanan vefat ve taziye ilanları', badge: 'bg-slate-700', audience: 'all' },
  { key: 'duyuru', label: 'Önemli mahalle duyuruları', emoji: '📢', desc: 'Duyurular ve acil kayıp ilanları', badge: 'bg-blue-600', audience: 'all' },
  { key: 'etkinlik', label: 'Etkinlikler', emoji: '🎉', desc: 'Düğün, kına, mevlit gibi mahalle etkinlikleri', badge: 'bg-purple-600', audience: 'all' },
  { key: 'esnaf', label: 'Esnaf ilanları ve kampanyaları', emoji: '🏪', desc: 'İndirim ve kampanyalar', badge: 'bg-emerald-600', audience: 'all' },
  { key: 'hizmet', label: 'Hizmet talepleri', emoji: '🛠️', desc: 'Kategorinize uygun yeni talepler', badge: 'bg-orange-700', audience: 'usta' },
  { key: 'teklif', label: 'Usta teklifleri', emoji: '💰', desc: 'Talebinize gelen ve kabul edilen teklifler', badge: 'bg-emerald-700', audience: 'all' },
  { key: 'isletme', label: 'İşletme ve kampanya onayları', emoji: '🏪', desc: 'İşletme sayfanız ve kampanyalarınız hakkında karar bildirimleri', badge: 'bg-teal-700', audience: 'esnaf' },
  { key: 'yorum', label: 'Yorumlara verilen yanıtlar', emoji: '💬', desc: 'Yorum sistemi FAZ 6’da gelecek', badge: 'bg-indigo-600', audience: 'soon' }
];

export type NotifPrefs = Record<NotifCategory, boolean>;

// Varsayılan: yalnızca acil ve kişiye özel kategoriler açık (eski davranış: yalnızca son dakika).
export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  sondakika: true,
  haber: false,
  cenaze: true,
  duyuru: true,
  etkinlik: false,
  esnaf: false,
  hizmet: true,
  teklif: true,
  isletme: true,
  yorum: true
};

export function normalizePrefs(raw: any, legacy?: { enabled?: boolean; sonDakikaOnly?: boolean }): NotifPrefs {
  const base: NotifPrefs = { ...DEFAULT_NOTIF_PREFS };
  if (!raw && legacy && legacy.enabled !== false && legacy.sonDakikaOnly === false) {
    // Eski "tüm haberler" tercihi olan kullanıcılar haber kategorisini açık tutar.
    base.haber = true;
  }
  if (raw && typeof raw === 'object') {
    (Object.keys(base) as NotifCategory[]).forEach((k) => {
      if (typeof raw[k] === 'boolean') base[k] = raw[k];
    });
  }
  return base;
}

export const NOTIF_WINDOW_MS = 14 * 24 * 3600 * 1000;

export interface NotifTarget {
  kind: 'haber' | 'cenaze' | 'davet' | 'kampanya' | 'kayip' | 'talep' | 'isletme';
  id: string;
}

export interface DerivedNotif {
  id: string;
  type: NotifCategory;
  category: string;
  icon: string;
  badgeColor: string;
  title: string;
  ms: number;
  time: string;
  read: boolean;
  target: NotifTarget;
}

const metaOf = (k: NotifCategory) => NOTIF_CATEGORIES.find((c) => c.key === k)!;

/** Haberin bildirim kategorisi: editör seçtiyse o, yoksa son dakika işaretine ve kategori adına göre. */
export function newsNotifCategory(n: any): NotifCategory {
  const picked = n?.bildirimKategorisi;
  if (picked === 'sondakika' || picked === 'haber' || picked === 'duyuru' || picked === 'etkinlik') return picked;
  if (n?.sonDakika) return 'sondakika';
  return 'haber';
}

export function buildContentNotifications(input: {
  news: any[];
  deceased: any[];
  invitations: any[];
  campaigns: any[];
  lostFound: any[];
  prefs: NotifPrefs;
  seenAt: number;
  readIds: string[];
  now?: number;
}): DerivedNotif[] {
  const now = input.now ?? Date.now();
  const out: DerivedNotif[] = [];

  const add = (cat: NotifCategory, kind: NotifTarget['kind'], docId: string | undefined, ms: number, title: string) => {
    if (!docId || !ms || !input.prefs[cat]) return;
    if (now - ms > NOTIF_WINDOW_MS) return;
    const m = metaOf(cat);
    const id = `dn_${kind}_${docId}`;
    out.push({
      id,
      type: cat,
      category: m.label.toLocaleUpperCase('tr-TR'),
      icon: m.emoji,
      badgeColor: m.badge,
      title,
      ms,
      time: timeAgoTr(ms),
      read: ms <= input.seenAt || input.readIds.includes(id),
      target: { kind, id: docId }
    });
  };

  input.news.forEach((n) => {
    if (n.status !== 'approved' || n.isTip) return;
    add(newsNotifCategory(n), 'haber', n.id, toMillis(n.createdAt), n.baslik);
  });
  input.deceased.forEach((d) => add('cenaze', 'cenaze', d.id, toMillis(d.publishedAt) || toMillis(d.createdAt), `Vefat ilanı: ${d.fullName}`));
  input.invitations.forEach((d) => add('etkinlik', 'davet', d.id, toMillis(d.createdAt), `${d.turEtiketi || 'Etkinlik'}: ${d.baslik}`));
  input.campaigns.forEach((c) => add('esnaf', 'kampanya', c.id, toMillis(c.createdAt), `${c.isyeriAdi || 'Esnaf'}: ${c.baslik}`));
  input.lostFound.forEach((l) => {
    if (l.isCritical) add('duyuru', 'kayip', l.id, toMillis(l.createdAt), `Acil ${l.tur === 'bulundu' ? 'buluntu' : 'kayıp'} ilanı: ${l.baslik}`);
  });

  return out;
}
