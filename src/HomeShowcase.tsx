// Ana sayfa: Mahalle Tanıtım Ekranı.
// İlan, haber, 2. el, emlak ve panodan EN SON gerçek paylaşımları otomatik dönen bir vitrinde gösterir.
// Sahte okunma sayısı, internetten alınan yer tutucu fotoğraf veya uydurma açıklama yoktur:
// fotoğrafı olmayan paylaşım düz renkli bir kapakla gösterilir, olmayan bilgi yazılmaz.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, Pause, Play, Radio } from 'lucide-react';
import { tarihEtiketi, toMillis } from './serviceMatching';
import type { DeceasedItem } from './cityServicesData';
import type { LostFoundItem, MahalleDavetItem, MarketplaceItem } from './firebase';
import type { SampleNewsItem } from './mockNeighborhoodData';

export type ShowcaseFilter = 'all' | 'haber' | 'emlak' | 'ikinci_el' | 'ilan' | 'pano';

interface ShowcaseItem {
  id: string;
  type: Exclude<ShowcaseFilter, 'all'>;
  typeLabel: string;
  typeBadgeClass: string;
  typeIcon: string;
  coverClass: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  meta: string;
  timeAgo: string;
  location: string;
  dataRef: any;
  sortMs: number;
}

const FILTERS: { id: ShowcaseFilter; label: string }[] = [
  { id: 'all', label: '🌟 Tümü' },
  { id: 'haber', label: '📰 Haberler' },
  { id: 'emlak', label: '🏠 Emlak' },
  { id: 'ikinci_el', label: '🚗 2. El' },
  { id: 'ilan', label: '🛍️ İlanlar' },
  { id: 'pano', label: '📌 Pano & Davet' },
];

const clip = (t: string, max = 140) => (t.length > max ? `${t.slice(0, max).trimEnd()}…` : t);
const tl = (n: number) => `${n.toLocaleString('tr-TR')} ₺`;
const newest = (a: { sortMs: number }, b: { sortMs: number }) => b.sortMs - a.sortMs;

function listingFacts(m: MarketplaceItem): string {
  const parts = [m.odaSayisi, m.metrekare ? `${m.metrekare} m²` : '', m.kat].filter(Boolean);
  return parts.join(' · ');
}

export function HomeShowcase({
  newsItems,
  marketplaceItems,
  invitationItems = [],
  deceasedItems = [],
  lostFoundItems = [],
  onOpenNews,
  onOpenListing,
  onOpenDavet,
  onOpenDeceased,
  onOpenLostFound,
}: {
  newsItems: SampleNewsItem[];
  marketplaceItems: MarketplaceItem[];
  invitationItems?: MahalleDavetItem[];
  deceasedItems?: DeceasedItem[];
  lostFoundItems?: LostFoundItem[];
  onOpenNews: (n: SampleNewsItem) => void;
  onOpenListing: (m: MarketplaceItem) => void;
  onOpenDavet: (d: MahalleDavetItem) => void;
  onOpenDeceased: (d: DeceasedItem) => void;
  onOpenLostFound: (l: LostFoundItem) => void;
}) {
  const [filter, setFilter] = useState<ShowcaseFilter>('all');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const reducedMotion = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const all: ShowcaseItem[] = useMemo(() => {
    const out: ShowcaseItem[] = [];

    // Haberler (yalnızca yayınlanmış)
    newsItems
      .filter((x) => !x.status || x.status === 'approved')
      .map((x) => ({ x, ms: toMillis(x.createdAt) }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 4)
      .forEach(({ x, ms }, i) =>
        out.push({
          id: `haber_${x.id || i}`,
          type: 'haber',
          typeLabel: x.sonDakika ? 'SON DAKİKA' : (x.kategori || 'HABER').toLocaleUpperCase('tr-TR'),
          typeBadgeClass: 'bg-red-600 text-white',
          typeIcon: '📰',
          coverClass: 'from-red-900 via-slate-900 to-slate-950',
          title: x.baslik,
          description: clip(x.ozet || x.icerik || ''),
          imageUrl: x.imageURL || '',
          meta: [x.authorName, x.okunmaSayisi && x.okunmaSayisi > 0 ? `${x.okunmaSayisi} okunma` : ''].filter(Boolean).join(' · '),
          timeAgo: tarihEtiketi(x),
          location: '',
          dataRef: x,
          sortMs: ms,
        })
      );

    // İlanlar (yalnızca aktif)
    const active = marketplaceItems.filter((m) => !m.status || m.status === 'active').map((m) => ({ m, ms: toMillis(m.createdAt) }));
    active
      .filter(({ m }) => m.ilanTuru === 'emlak')
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 3)
      .forEach(({ m, ms }, i) => {
        const tur = m.emlakTuru === 'satilik' ? 'SATILIK' : m.emlakTuru === 'kiralik' ? 'KİRALIK' : m.emlakTuru === 'devren' ? 'DEVREN' : 'EMLAK';
        out.push({
          id: `emlak_${m.id || i}`,
          type: 'emlak',
          typeLabel: tur,
          typeBadgeClass: 'bg-emerald-600 text-white',
          typeIcon: '🏠',
          coverClass: 'from-emerald-900 via-slate-900 to-slate-950',
          title: m.baslik,
          description: clip(m.aciklama || listingFacts(m)),
          imageUrl: (m.fotolar && m.fotolar[0]) || '',
          price: m.fiyat ? tl(m.fiyat) : undefined,
          meta: m.saticiAdi || '',
          timeAgo: tarihEtiketi(m),
          location: listingFacts(m),
          dataRef: m,
          sortMs: ms,
        });
      });
    active
      .filter(({ m }) => m.ilanTuru === 'ikinci_el')
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 3)
      .forEach(({ m, ms }, i) =>
        out.push({
          id: `ikinciel_${m.id || i}`,
          type: 'ikinci_el',
          typeLabel: '2. EL',
          typeBadgeClass: 'bg-blue-600 text-white',
          typeIcon: '🚗',
          coverClass: 'from-blue-900 via-slate-900 to-slate-950',
          title: m.baslik,
          description: clip(m.aciklama || ''),
          imageUrl: (m.fotolar && m.fotolar[0]) || '',
          price: m.fiyat ? tl(m.fiyat) : undefined,
          meta: m.saticiAdi || '',
          timeAgo: tarihEtiketi(m),
          location: m.kategori || '',
          dataRef: m,
          sortMs: ms,
        })
      );
    active
      .filter(({ m }) => m.ilanTuru !== 'emlak' && m.ilanTuru !== 'ikinci_el')
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 2)
      .forEach(({ m, ms }, i) =>
        out.push({
          id: `ilan_${m.id || i}`,
          type: 'ilan',
          typeLabel: 'MAHALLE İLANI',
          typeBadgeClass: 'bg-amber-600 text-white',
          typeIcon: '🛍️',
          coverClass: 'from-amber-900 via-slate-900 to-slate-950',
          title: m.baslik,
          description: clip(m.aciklama || ''),
          imageUrl: (m.fotolar && m.fotolar[0]) || '',
          price: m.fiyat ? tl(m.fiyat) : undefined,
          meta: m.saticiAdi || '',
          timeAgo: tarihEtiketi(m),
          location: m.kategori || '',
          dataRef: m,
          sortMs: ms,
        })
      );

    // Pano: davet, vefat, kayıp & buluntu
    [...invitationItems]
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, 2)
      .forEach((d, i) =>
        out.push({
          id: `davet_${d.id || i}`,
          type: 'pano',
          typeLabel: (d.turEtiketi || 'DAVET').toLocaleUpperCase('tr-TR'),
          typeBadgeClass: 'bg-purple-600 text-white',
          typeIcon: '💌',
          coverClass: 'from-purple-900 via-slate-900 to-slate-950',
          title: d.baslik,
          description: clip(d.aciklama || [d.tarih, d.saat, d.mekanAdi].filter(Boolean).join(' · ')),
          imageUrl: d.davetiyeFoto || '',
          meta: [d.tarih, d.saat].filter(Boolean).join(' · '),
          timeAgo: tarihEtiketi(d),
          location: d.mekanAdi || '',
          dataRef: d,
          sortMs: toMillis(d.createdAt),
        })
      );
    deceasedItems
      .filter((d) => !d.status || d.status === 'published')
      .sort((a, b) => toMillis(b.publishedAt || b.createdAt) - toMillis(a.publishedAt || a.createdAt))
      .slice(0, 1)
      .forEach((d, i) =>
        out.push({
          id: `vefat_${d.id || i}`,
          type: 'pano',
          typeLabel: 'TAZİYE & VEFAT',
          typeBadgeClass: 'bg-slate-600 text-white',
          typeIcon: '🕊️',
          coverClass: 'from-slate-700 via-slate-900 to-slate-950',
          title: `Vefat: ${d.fullName}`,
          description: clip([d.family, [d.prayerTime, d.mosque].filter(Boolean).join(' · ')].filter(Boolean).join('. ')),
          imageUrl: '',
          meta: d.mosque || '',
          timeAgo: d.dateStr || '',
          location: d.cemetery || '',
          dataRef: d,
          sortMs: toMillis(d.publishedAt || d.createdAt),
        })
      );
    [...lostFoundItems]
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, 1)
      .forEach((l, i) =>
        out.push({
          id: `kayip_${l.id || i}`,
          type: 'pano',
          typeLabel: l.tur === 'bulundu' ? 'BULUNDU' : 'KAYIP',
          typeBadgeClass: 'bg-orange-600 text-white',
          typeIcon: l.tur === 'bulundu' ? '✅' : '🔎',
          coverClass: 'from-orange-900 via-slate-900 to-slate-950',
          title: l.baslik,
          description: clip(l.aciklama || ''),
          imageUrl: (l.fotolar && l.fotolar[0]) || '',
          meta: l.kategori || '',
          timeAgo: tarihEtiketi(l),
          location: l.konum || '',
          dataRef: l,
          sortMs: toMillis(l.createdAt),
        })
      );

    // "Tümü" görünümünde en yeniler önce; kategori görünümünde de aynı sıra korunur
    return out.sort(newest);
  }, [newsItems, marketplaceItems, invitationItems, deceasedItems, lostFoundItems]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    all.forEach((i) => { c[i.type] = (c[i.type] || 0) + 1; });
    return c;
  }, [all]);

  const items = useMemo(() => (filter === 'all' ? all : all.filter((i) => i.type === filter)), [all, filter]);

  // Seçili filtre boşalırsa (veri değişti) "Tümü"ne dön
  useEffect(() => {
    if (filter !== 'all' && !counts[filter]) setFilter('all');
  }, [counts, filter]);
  useEffect(() => { setIndex(0); }, [filter]);
  useEffect(() => { if (index >= items.length) setIndex(0); }, [items.length, index]);

  // Otomatik geçiş (hareket azaltma tercihi açıksa kapalı)
  useEffect(() => {
    if (items.length <= 1 || paused || reducedMotion) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length, paused, reducedMotion]);

  if (all.length === 0) return null;
  const cur = items[index] || items[0];
  if (!cur) return null;

  const open = (it: ShowcaseItem) => {
    if (it.type === 'haber') onOpenNews(it.dataRef);
    else if (it.type === 'emlak' || it.type === 'ikinci_el' || it.type === 'ilan') onOpenListing(it.dataRef);
    else if (it.id.startsWith('davet_')) onOpenDavet(it.dataRef);
    else if (it.id.startsWith('vefat_')) onOpenDeceased(it.dataRef);
    else onOpenLostFound(it.dataRef);
  };

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((p) => (p > 0 ? p - 1 : items.length - 1)); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((p) => (p + 1) % items.length); };

  const Thumb = ({ it, className }: { it: ShowcaseItem; className: string }) =>
    it.imageUrl ? (
      <img src={it.imageUrl} alt="" loading="lazy" className={`${className} object-cover`} />
    ) : (
      <div className={`${className} bg-gradient-to-br ${it.coverClass} flex items-center justify-center`} aria-hidden="true">
        <span className="text-lg">{it.typeIcon}</span>
      </div>
    );

  return (
    <section
      className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border-2 border-slate-800 shadow-2xl"
      aria-label="Mahalle Tanıtım Ekranı"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const diff = e.changedTouches[0].clientX - touchX.current;
          if (diff > 45) setIndex((p) => (p > 0 ? p - 1 : items.length - 1));
          else if (diff < -45) setIndex((p) => (p + 1) % items.length);
          touchX.current = null;
        }
        setPaused(false);
      }}
    >
      {/* Üst şerit: başlık + kategori filtreleri */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight uppercase">Mahalle Tanıtım Ekranı</h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Haber, ilan, 2. el, emlak ve panodan en son paylaşımlar</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
          {FILTERS.filter((f) => f.id === 'all' || counts[f.id]).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === f.id ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              {f.label} <span className="opacity-70">{counts[f.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Büyük vitrin */}
        <div
          onClick={() => open(cur)}
          className="lg:col-span-8 relative min-h-[260px] sm:min-h-[340px] overflow-hidden group cursor-pointer flex flex-col justify-between p-4 sm:p-6"
        >
          {cur.imageUrl ? (
            <img key={cur.id} src={cur.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div key={cur.id} className={`absolute inset-0 bg-gradient-to-br ${cur.coverClass}`} aria-hidden="true">
              <div className="absolute right-6 bottom-6 text-8xl opacity-20">{cur.typeIcon}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${cur.typeBadgeClass}`}>
                <span>{cur.typeIcon}</span>
                <span>{cur.typeLabel}</span>
              </span>
              {cur.price && <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-md">{cur.price}</span>}
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/10 text-xs font-mono">
              <span className="text-orange-400 font-bold">{index + 1}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-300">{items.length}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 flex-wrap">
              {cur.location && (
                <span className="flex items-center gap-1 text-orange-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {cur.location}
                </span>
              )}
              {cur.timeAgo && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {cur.timeAgo}
                </span>
              )}
              {cur.meta && <span className="text-slate-400 font-medium">{cur.meta}</span>}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-black leading-tight group-hover:text-orange-300 transition-colors line-clamp-2">{cur.title}</h3>
            {cur.description && <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">{cur.description}</p>}
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); open(cur); }}
                className="px-5 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-orange-500 hover:text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Paylaşımı Görüntüle</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {items.length > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Önceki paylaşım" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={next} aria-label="Sonraki paylaşım" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* En son eklenenler */}
        <div className="lg:col-span-4 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-white/10 p-3 sm:p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-white/10">
            <span>En son eklenenler</span>
            <span className="text-orange-400 font-medium normal-case">{items.length} paylaşım</span>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[300px] lg:max-h-[320px] [scrollbar-width:none]">
            {items.map((it, idx) => (
              <button
                type="button"
                key={it.id}
                onClick={() => setIndex(idx)}
                className={`w-full text-left p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  idx === index ? 'bg-white/15 border-orange-500/80 ring-1 ring-orange-500/50' : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                }`}
              >
                <Thumb it={it} className="w-14 h-14 rounded-xl shrink-0 border border-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-black px-1.5 rounded-md uppercase tracking-wider ${it.typeBadgeClass}`}>
                      {it.typeIcon} {it.typeLabel.split(' ')[0]}
                    </span>
                    {it.price ? <span className="text-[11px] font-black text-emerald-400">{it.price}</span> : <span className="text-[10px] text-slate-400">{it.timeAgo}</span>}
                  </div>
                  <h4 className={`text-xs font-bold truncate mt-1 ${idx === index ? 'text-white' : 'text-slate-200'}`}>{it.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{it.location || it.meta}</p>
                </div>
              </button>
            ))}
          </div>
          {!reducedMotion && items.length > 1 && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <button type="button" onClick={() => setPaused((p) => !p)} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                {paused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{paused ? 'Oynat' : 'Durdur'}</span>
              </button>
              <span className="text-[11px]">5 sn'de bir otomatik geçer</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
