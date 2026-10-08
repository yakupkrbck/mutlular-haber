// Ana sayfa: Burulaş otobüs hatları (uygulama içi).
// Hat kartları mahalleye hizmet veren hatları ve yakın duraktan geçen hatları listeler; karta dokununca hattın
// kalkış yeri, varış yeri, güzergâhı ve sefer saatleri uygulama içinde açılır.
// Canlı takip ve bilet yükleme gibi ileri işlemler için resmî BursaKart sayfalarına ayrı düğmeler vardır.
// Saat ve güzergâh bilgisi yönetici panelinden (Otobüs Hatları) girilir; girilmemiş saat için uydurma değer gösterilmez.
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Bus, ChevronDown, ChevronUp, Clock, ExternalLink, MapPin, X } from 'lucide-react';
import { BURSAKART_URL, BURULAS_LIVE_URL, BURULAS_SITE_URL } from './siteConfig';
import { useOverlayBack } from './backNav';
import {
  DAY_LABELS,
  DAY_TYPES,
  DIRECTION_LABELS,
  DIRECTIONS,
  formatInMin,
  istanbulClock,
  lineHasTimes,
  mergeBusLines,
  nextDepartures,
  nextForLine,
  seedLines,
  timesOf,
  type BusLine,
  type DayType,
  type Direction,
} from './busData';

// ───────── ortak yardımcılar ─────────

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

const routeText = (l: BusLine) =>
  l.kalkis && l.varis ? `${l.kalkis} → ${l.varis}` : l.baslik || 'Güzergâh bilgisi henüz eklenmedi';

const dateText = (ymd: string) =>
  ymd ? new Date(`${ymd}T12:00:00+03:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' }) : '';

// ───────── hat detay penceresi ─────────

function BusLineSheet({ line, now, onClose }: { line: BusLine; now: Date; onClose: () => void }) {
  useOverlayBack(true, onClose, 'hat');
  const today = istanbulClock(now).day;
  const [day, setDay] = useState<DayType>(today);
  const [dir, setDir] = useState<Direction>(() => {
    const nf = nextForLine(line, now);
    return nf ? nf.dir : 'gidis';
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const times = timesOf(line, dir, day);
  const upcoming = day === today ? nextDepartures(times, now, 1)[0] : undefined;
  const hasAny = lineHasTimes(line);
  const dirLabel = (d: Direction) =>
    line.kalkis && line.varis ? (d === 'gidis' ? `${line.kalkis} → ${line.varis}` : `${line.varis} → ${line.kalkis}`) : DIRECTION_LABELS[d];
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] bg-black/70 flex items-end sm:items-center justify-center"
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
      onMouseDown={stop}
      onTouchStart={stop}
      onPointerDown={stop}
      role="dialog"
      aria-modal="true"
      aria-label={`${line.code} hattı`}
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-lg shrink-0">{line.code}</span>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-slate-900 leading-tight">{routeText(line)}</h3>
              {line.durak && <p className="text-[11px] text-slate-500 mt-0.5">Yakın durak: {line.durak}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kalkış yeri</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{line.kalkis || '—'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Varış yeri</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{line.varis || '—'}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <MapPin className="w-3 h-3" /> Güzergâh
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
              {line.guzergah || 'Bu hattın ara durak/güzergâh bilgisi henüz eklenmedi.'}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Clock className="w-4 h-4 text-blue-600" /> Hareket saatleri
            </div>

            {hasAny ? (
              <>
                <div className="flex gap-1.5 flex-wrap">
                  {DIRECTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDir(d)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer transition-all ${dir === d ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {dirLabel(d)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {DAY_TYPES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${day === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {DAY_LABELS[d]}
                      {d === today ? ' · bugün' : ''}
                    </button>
                  ))}
                </div>

                {upcoming && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                    Sıradaki sefer: <strong className="font-black">{upcoming.time}</strong> · {formatInMin(upcoming.inMin)}
                  </div>
                )}

                {times.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {times.map((t) => {
                      const isNext = upcoming && upcoming.time === t;
                      const past = day === today && !nextDepartures([t], now, 1).length;
                      return (
                        <span
                          key={t}
                          className={`text-center py-1.5 rounded-lg text-xs font-bold ${
                            isNext ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-500' : past ? 'bg-slate-50 text-slate-300 line-through' : 'bg-blue-50 text-blue-900'
                          }`}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    Bu yön ve gün için sefer saati eklenmemiş. Güncel saat için aşağıdaki canlı takip düğmesini kullanın.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                Bu hattın sefer saatleri henüz eklenmedi. Güncel saatler ve otobüsün şu anki konumu için resmî “Otobüsüm Nerede” sayfasını kullanabilirsiniz.
              </p>
            )}
          </div>

          {line.not && <p className="text-[11px] text-slate-600 bg-amber-50/60 rounded-xl p-2.5 leading-relaxed">{line.not}</p>}

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Saatler planlı tarifedir; trafik, resmî tatil ve özel günlerde değişebilir.
            {line.guncelleme ? ` Son güncelleme: ${dateText(line.guncelleme)}.` : ''}
            {line.kaynak ? ` Kaynak: ${line.kaynak}.` : ''}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a href={BURULAS_LIVE_URL} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5">
              Otobüsüm Nerede (canlı takip) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={BURSAKART_URL} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5">
              BursaKart (bilet / kart yükle) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ───────── hat kartı ─────────

function LineCard({ line, now, compact, onOpen }: { line: BusLine; now: Date; compact?: boolean; onOpen: () => void }) {
  const nf = useMemo(() => nextForLine(line, now), [line, now]);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-3 ${compact ? 'px-2.5 py-2' : 'px-3 py-3'}`}
    >
      <span className={`font-black rounded-lg bg-blue-600 text-white shrink-0 ${compact ? 'px-2 py-1 text-xs min-w-[3rem] text-center' : 'px-2.5 py-1.5 text-sm min-w-[3.25rem] text-center'}`}>{line.code}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-100 leading-snug line-clamp-2">{routeText(line)}</span>
        <span className="block text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
          {nf
            ? `Sıradaki: ${nf.next.time} (${formatInMin(nf.next.inMin)})`
            : lineHasTimes(line)
              ? 'Bugün için sefer kalmadı'
              : 'Saat bilgisi eklenmedi · detay için dokunun'}
        </span>
      </span>
      <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
    </button>
  );
}

// ───────── bölüm ─────────

export function HomeUlasimStrip({ remoteLines = [] }: { remoteLines?: Partial<BusLine>[] }) {
  const now = useNow();
  const lines = useMemo(() => mergeBusLines(seedLines(), remoteLines), [remoteLines]);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [stopOpen, setStopOpen] = useState<Record<string, boolean>>({});

  const mahalle = lines.filter((l) => l.mahalle);
  const stopGroups = useMemo(() => {
    const map = new Map<string, BusLine[]>();
    lines.filter((l) => !l.mahalle).forEach((l) => {
      const key = l.durak || 'Diğer hatlar';
      map.set(key, [...(map.get(key) || []), l]);
    });
    return [...map.entries()];
  }, [lines]);
  const selected = lines.find((l) => l.code === openCode) || null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-500/50 shadow-md p-3.5 sm:p-4 space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bus className="w-4.5 h-4.5 stroke-[2.3]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black tracking-tight uppercase leading-tight">Burulaş · Mahalle otobüs seferleri</h2>
            <p className="text-[11px] text-slate-300 leading-snug">Hatta dokunun: kalkış yeri, güzergâh ve hareket saatleri.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={BURULAS_LIVE_URL} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
            <span>Canlı takip</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href={BURULAS_SITE_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
            <span>Burulaş</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {mahalle.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mahalleye hizmet veren hatlar</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mahalle.map((l) => (
              <LineCard key={l.code} line={l} now={now} onOpen={() => setOpenCode(l.code)} />
            ))}
          </div>
        </div>
      )}

      {stopGroups.map(([title, list]) => {
        const open = !!stopOpen[title];
        return (
          <div key={title} className="rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setStopOpen((s) => ({ ...s, [title]: !s[title] }))}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
            >
              <span className="min-w-0">
                <span className="block text-[11px] sm:text-xs font-bold text-slate-100 leading-snug">Mahalle yakınındaki durak: {title}</span>
                <span className="block text-[10px] text-slate-400">{list.length} hat</span>
              </span>
              {open ? <ChevronUp className="w-4 h-4 text-slate-300 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />}
            </button>
            {open && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 px-2.5 pb-2.5">
                {list.map((l) => (
                  <LineCard key={l.code} line={l} now={now} compact onOpen={() => setOpenCode(l.code)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {selected && <BusLineSheet line={selected} now={now} onClose={() => setOpenCode(null)} />}
    </section>
  );
}
