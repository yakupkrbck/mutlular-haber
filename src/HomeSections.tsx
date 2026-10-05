// Ana sayfaya özel bölümler (mutlularhaber.com).
// Haber şeridi: tüm haberler /haber sayfasındadır; burada yalnızca giriş kapısı ve son başlıklar durur.
// Esnaf kampanyaları: mahalle esnafının güncel indirim ve fırsatları.
import { ArrowRight, MapPin, Newspaper, Percent, Store } from 'lucide-react';
import { tarihEtiketi } from './serviceMatching';
import type { SampleNewsItem } from './mockNeighborhoodData';
import type { EsnafCampaign } from './firebase';

// ═════════════════════════════════════════════════════════
// HABER ŞERİDİ → dokununca tüm haberler
// ═════════════════════════════════════════════════════════
export function HomeNewsBand({
  news,
  onOpenAll,
  onOpenNews,
}: {
  news: SampleNewsItem[];
  onOpenAll: () => void;
  onOpenNews: (item: SampleNewsItem) => void;
}) {
  const published = news.filter((n) => n.status === 'approved' || !n.status);
  const latest = published.slice(0, 3);
  const breaking = published.filter((n) => n.sonDakika).length;

  return (
    <section className="rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800/80 shadow-md">
      <button
        type="button"
        onClick={onOpenAll}
        className="w-full flex items-center justify-between gap-3 px-4 pt-4 pb-3 text-left cursor-pointer group"
        aria-label="Tüm haberleri aç"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shrink-0 shadow-sm">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg sm:text-xl font-black leading-tight">Mahalle haberleri</h2>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {published.length > 0
                ? `${published.length} haber${breaking > 0 ? ` · ${breaking} son dakika` : ''}`
                : 'Mahallenden gelişmeler burada yayınlanır'}
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-red-300 group-hover:text-white flex items-center gap-1 shrink-0 transition-colors">
          Tüm haberler
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>

      {latest.length > 0 && (
        <ul className="divide-y divide-white/10 border-t border-white/10">
          {latest.map((n, idx) => (
            <li key={n.id || `${n.baslik}-${idx}`}>
              <button
                type="button"
                onClick={() => onOpenNews(n)}
                className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                {n.sonDakika && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    Son dakika
                  </span>
                )}
                <span className="text-[13px] font-bold leading-snug line-clamp-2 flex-1 min-w-0">{n.baslik}</span>
                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{tarihEtiketi(n)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ═════════════════════════════════════════════════════════
// ESNAF KAMPANYALARI (yatay kaydırmalı)
// ═════════════════════════════════════════════════════════
export function HomeCampaignsSection({
  campaigns,
  onOpenAll,
}: {
  campaigns: EsnafCampaign[];
  onOpenAll: () => void;
}) {
  const list = campaigns.filter((c) => !c.status || c.status === 'published').slice(0, 8);

  return (
    <section className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xs shrink-0">
            <Store className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Esnaf kampanyaları</h2>
            <p className="text-xs text-slate-500 font-medium">Mahalle esnafından indirim ve fırsatlar</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAll}
          className="text-xs sm:text-sm font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer group shrink-0"
        >
          <span>Tümü</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {list.length === 0 ? (
        <button
          type="button"
          onClick={onOpenAll}
          className="w-full text-left rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-5 cursor-pointer hover:bg-amber-50 transition-colors"
        >
          <div className="text-sm font-black text-slate-900">Henüz kampanya yok</div>
          <div className="text-xs text-slate-600 mt-0.5">
            Esnaf kampanyaları onaylanınca burada görünür. Mahalle Pazarı'nı aç →
          </div>
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none]">
          {list.map((c, idx) => {
            const foto = c.fotoUrl || c.fotolar?.[0];
            return (
              <button
                type="button"
                key={c.id || `${c.isyeriAdi}-${idx}`}
                onClick={onOpenAll}
                className="snap-start shrink-0 w-[15.5rem] sm:w-64 text-left bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  {foto ? (
                    <img
                      src={foto}
                      alt={c.baslik}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-amber-500/70">
                      <Store className="w-10 h-10" />
                    </div>
                  )}
                  {c.indirimOrani && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      {c.indirimOrani}
                    </span>
                  )}
                </div>
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col">
                  <span className="self-start text-[11px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                    {c.kategori}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 leading-tight truncate group-hover:text-amber-600 transition-colors">
                    {c.isyeriAdi}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-2">{c.baslik}</p>
                  <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-100">
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{c.adres}</span>
                    </span>
                    {c.gecerlilikTarihi && <span className="shrink-0">{c.gecerlilikTarihi}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
