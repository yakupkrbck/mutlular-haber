// Ana sayfanın üst modülleri:
//   1) HomeHero: karşılama, gerçek hava durumu, arama kutusu, Canlı Mahalle Meclisi kartı
//   2) HomeKursuSection: Mahalle Kürsüsü & Oylamalar (gerçek oylamalar + kamerayla konu açma)
// Burada sabit/sahte veri yoktur: oylar, oy sayıları ve başlıklar uygulamanın `polls` verisinden gelir.
import { useEffect, useState } from 'react';
import {
  ArrowRight, Camera, Check, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun,
  Megaphone, PenLine, Search, Sun, Vote,
} from 'lucide-react';
import type { PollItem } from './app/types';

// ═════════════════════════════════════════════════════════
// Gerçek hava durumu (Open-Meteo: anahtar gerektirmez). Alınamazsa kutucuk hiç gösterilmez.
// ═════════════════════════════════════════════════════════
const BURSA = { lat: 40.1826, lon: 29.0669 };
const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${BURSA.lat}&longitude=${BURSA.lon}` +
  `&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul`;
const WEATHER_CACHE_KEY = 'mh_weather_v1';
const WEATHER_TTL_MS = 30 * 60 * 1000;

type WeatherKind = 'sun' | 'sunCloud' | 'cloud' | 'rain' | 'snow' | 'fog' | 'storm';
interface Weather { temp: number; label: string; kind: WeatherKind }

function describeWeather(code: number): { label: string; kind: WeatherKind } {
  if (code === 0) return { label: 'Açık', kind: 'sun' };
  if (code === 1) return { label: 'Az bulutlu', kind: 'sunCloud' };
  if (code === 2) return { label: 'Parçalı bulutlu', kind: 'sunCloud' };
  if (code === 3) return { label: 'Kapalı', kind: 'cloud' };
  if (code === 45 || code === 48) return { label: 'Sisli', kind: 'fog' };
  if (code >= 51 && code <= 57) return { label: 'Çiseleme', kind: 'rain' };
  if (code >= 61 && code <= 67) return { label: 'Yağmurlu', kind: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Karlı', kind: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Sağanak', kind: 'rain' };
  if (code === 85 || code === 86) return { label: 'Kar yağışlı', kind: 'snow' };
  if (code >= 95) return { label: 'Gök gürültülü', kind: 'storm' };
  return { label: 'Değişken', kind: 'cloud' };
}

function useWeather(): Weather | null {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && Date.now() - o.t < WEATHER_TTL_MS && o.w) { setW(o.w); return; }
      }
    } catch { /* önbellek okunamadı */ }
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(WEATHER_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('hava'))))
      .then((j) => {
        const t = j?.current?.temperature_2m;
        const c = j?.current?.weather_code;
        if (typeof t !== 'number' || typeof c !== 'number') return;
        const next: Weather = { temp: Math.round(t), ...describeWeather(c) };
        if (!cancelled) setW(next);
        try { sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ t: Date.now(), w: next })); } catch { /* yok say */ }
      })
      .catch(() => { /* hava durumu alınamadı: kutucuk gösterilmez */ });
    return () => { cancelled = true; ctrl.abort(); };
  }, []);
  return w;
}

function WeatherIcon({ kind }: { kind: WeatherKind }) {
  const c = 'w-4 h-4';
  if (kind === 'sun') return <Sun className={c} />;
  if (kind === 'cloud') return <Cloud className={c} />;
  if (kind === 'rain') return <CloudRain className={c} />;
  if (kind === 'snow') return <CloudSnow className={c} />;
  if (kind === 'fog') return <CloudFog className={c} />;
  if (kind === 'storm') return <CloudLightning className={c} />;
  return <CloudSun className={c} />;
}

// ═════════════════════════════════════════════════════════
// Oylama yardımcıları
// ═════════════════════════════════════════════════════════
const BAR_COLORS = ['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-slate-500'];

/** Gündemdeki oylama: açık olanlar içinde en çok oy alan (eşitlikte en yeni). */
function pickFeatured(polls: PollItem[], isOpen: (p: PollItem) => boolean): PollItem | null {
  const open = polls.filter(isOpen);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => (b.toplam - a.toplam) || (b.createdAtMs - a.createdAtMs))[0];
}

function pct(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function leading(poll: PollItem): { index: number; count: number } {
  let index = 0;
  poll.sayilar.forEach((n, i) => { if ((n || 0) > (poll.sayilar[index] || 0)) index = i; });
  return { index, count: poll.sayilar[index] || 0 };
}

// ═════════════════════════════════════════════════════════
// 1) HERO
// ═════════════════════════════════════════════════════════
export function HomeHero({
  userName,
  polls,
  isPollOpen,
  onSearch,
  onOpenMeclis,
  onOpenKursu,
}: {
  userName?: string;
  polls: PollItem[];
  isPollOpen: (p: PollItem) => boolean;
  onSearch: (query: string) => void;
  onOpenMeclis: () => void;
  onOpenKursu: () => void;
}) {
  const [searchVal, setSearchVal] = useState('');
  const weather = useWeather();
  const featured = pickFeatured(polls, isPollOpen);
  const firstName = (userName || '').trim().split(/\s+/)[0] || 'Komşumuz';

  const submit = () => onSearch(searchVal.trim());

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl p-5 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
              DİJİTAL MUTLULAR · MAHALLE PORTALI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Hayırlı Günler, <span className="text-orange-400">{firstName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Osmangazi Mehmet Akif & Mutlular Mahallesi canlı yaşam, meclis ve dayanışma merkezi
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-xs shrink-0 self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <WeatherIcon kind={weather.kind} />
            </div>
            <div>
              <div className="font-bold text-white">Bursa • {weather.temp}°C {weather.label}</div>
              <div className="text-[11px] text-slate-400">Mehmet Akif Mah.</div>
            </div>
          </div>
        )}
      </div>

      {/* 🔍 ARAMA KUTUCUĞU */}
      <form
        className="relative max-w-3xl"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        role="search"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Mahallede ne arıyorsunuz?"
          aria-label="Mahallede ara"
          className="w-full pl-12 pr-24 py-3.5 sm:py-4 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/15 focus:border-orange-500 focus:outline-hidden text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer"
        >
          Ara
        </button>
      </form>

      {/* 🏛️ CANLI MAHALLE MECLİSİ (gerçek oylama) veya Kürsü daveti */}
      {featured ? (
        <button
          type="button"
          onClick={onOpenMeclis}
          className="group w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 hover:border-amber-400/80 p-4 transition-all duration-300 cursor-pointer shadow-lg shadow-amber-950/40"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Vote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CANLI MAHALLE MECLİSİ
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {featured.toplam > 0 ? `${featured.toplam} komşu oy verdi` : 'İlk oyu sen ver'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5 group-hover:text-amber-200 transition-colors">
                  {featured.soru}
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {featured.toplam > 0
                    ? `Önde giden: ${featured.secenekler[leading(featured).index]} (%${pct(leading(featured).count, featured.toplam)})`
                    : 'Henüz oy kullanılmadı'}
                  {featured.endsAtMs > 0 ? ` · Bitiş: ${new Date(featured.endsAtMs).toLocaleDateString('tr-TR')}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 group-hover:from-amber-400 group-hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md">
                <span>Kürsüye Katıl & Oy Ver</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenKursu}
          className="group w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 hover:border-amber-400/80 p-4 transition-all duration-300 cursor-pointer shadow-lg shadow-amber-950/40"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MAHALLE KÜRSÜSÜ
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white mt-1 group-hover:text-amber-200 transition-colors">
                  Mahallenin derdini, önerisini komşularınla paylaş
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">Şu an açık oylama yok. Konuyu sen aç.</p>
              </div>
            </div>
            <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md self-end md:self-center shrink-0">
              <span>Kürsüde Söz Al</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </button>
      )}
    </section>
  );
}

// ═════════════════════════════════════════════════════════
// 2) MAHALLE KÜRSÜSÜ & OYLAMALAR
// ═════════════════════════════════════════════════════════
export function HomeKursuSection({
  polls,
  isPollOpen,
  myVotes,
  onVote,
  onOpenMeclis,
  onOpenKursuCamera,
  onOpenKursu,
}: {
  polls: PollItem[];
  isPollOpen: (p: PollItem) => boolean;
  myVotes: Record<string, number>;
  onVote: (p: PollItem, optionIndex: number) => void;
  onOpenMeclis: () => void;
  onOpenKursuCamera: () => void;
  onOpenKursu: () => void;
}) {
  const featured = pickFeatured(polls, isPollOpen);
  const openCount = polls.filter(isPollOpen).length;
  const mine = featured ? myVotes[featured.id] : undefined;
  const voted = mine !== undefined;
  const lead = featured && featured.toplam > 0 ? leading(featured).index : -1;

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200/80">
            <Vote className="w-3.5 h-3.5 text-amber-700" />
            CANLI MAHALLE MECLİSİ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Mahalle Kürsüsü & Oylamalar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Mahallemizin sorunlarını birlikte tartışıyor, fotoğraflı konularla komşularımızın desteğine sunuyoruz.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenKursuCamera}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Fotoğraf Çek & Konu Aç</span>
          </button>
          <button
            type="button"
            onClick={onOpenKursu}
            className="text-[11px] sm:text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center justify-center gap-1 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            Yazarak konu aç
          </button>
        </div>
      </div>

      {featured ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                Gündemdeki Oylama
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">{featured.soru}</h4>
              {featured.authorName && <p className="text-[11px] text-slate-500 mt-0.5">Açan: {featured.authorName}</p>}
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-300 shrink-0">
              {featured.toplam} Oy
            </span>
          </div>

          <div className="space-y-2">
            {featured.secenekler.map((opt, i) => {
              const count = featured.sayilar[i] || 0;
              const p = pct(count, featured.toplam);
              const isMine = mine === i;
              return (
                <button
                  type="button"
                  key={`${featured.id}-${i}`}
                  disabled={voted}
                  onClick={() => onVote(featured, i)}
                  className={`relative w-full overflow-hidden text-left rounded-xl border transition-all ${
                    voted ? 'cursor-default' : 'cursor-pointer hover:border-slate-400'
                  } ${isMine ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'} bg-white`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 ${BAR_COLORS[i % BAR_COLORS.length]} opacity-20 transition-all duration-500`}
                    style={{ width: `${p}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-3 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 min-w-0">
                      {isMine ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : null}
                      <span className="truncate">{opt}</span>
                      {i === lead && !isMine && <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">Önde</span>}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 shrink-0">
                      {count} oy · %{p}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
            <span>
              {voted ? 'Oyunuz kaydedildi.' : 'Oy vermek için bir seçeneğe dokunun.'}
              {featured.endsAtMs > 0 ? ` Bitiş: ${new Date(featured.endsAtMs).toLocaleDateString('tr-TR')}` : ''}
            </span>
            <button
              type="button"
              onClick={onOpenMeclis}
              className="font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer shrink-0"
            >
              {openCount > 1 ? `${openCount - 1} oylama daha` : 'Tüm Meclis'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenMeclis}
          className="w-full text-left p-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <div className="text-sm font-black text-slate-900">Şu an açık oylama yok</div>
          <div className="text-xs text-slate-600 mt-0.5">
            Yeni oylamalar açıldığında burada görünür. Kürsüdeki konuları görmek için Meclis'i aç →
          </div>
        </button>
      )}
    </section>
  );
}
