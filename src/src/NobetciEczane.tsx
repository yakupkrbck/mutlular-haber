// Ana sayfa: Bugünün nöbetçi eczaneleri (gerçek veri).
// Veri kaynağı: public/data/nobetci-eczane.json. Bu dosyayı GitHub Actions her gün Bursa Eczacı Odası'nın resmi
// nöbetçi eczane sayfasından üretir (scripts/fetch-nobetci-eczane.mjs).
// Dosya yoksa/geçersizse uydurma veri GÖSTERİLMEZ; resmi sayfaya yönlendiren "alınamadı" kartı çıkar.
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, LocateFixed, MapPin, Navigation, Phone, Pill } from 'lucide-react';
import { NEIGHBORHOOD_KEYWORDS, PHARMACY_DISTRICT_LABEL } from './siteConfig';

export interface DutyPharmacy {
  name: string;
  phone: string;
  phone2: string;
  locality: string;
  address: string;
  addressDescription: string;
  lat: number | null;
  lng: number | null;
  mapLink: string;
  workingHours: string;
  note: string;
}

interface DutyData {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  sentryDate: string;
  items: DutyPharmacy[];
}

interface Row { p: DutyPharmacy; near: boolean; km: number | null }

type DutyState = { status: 'loading' } | { status: 'unavailable' } | { status: 'ready'; data: DutyData };

const FALLBACK_SOURCE_URL = 'https://www.beo.org.tr/nobetci-eczaneler';

// ───────── yardımcılar ─────────
const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function parseDutyFile(json: any): DutyData | null {
  if (!json || typeof json !== 'object' || !Array.isArray(json.items)) return null;
  const items: DutyPharmacy[] = json.items
    .filter((p: any) => p && typeof p === 'object' && s(p.name))
    .map((p: any) => ({
      name: s(p.name),
      phone: s(p.phone),
      phone2: s(p.phone2),
      locality: s(p.locality),
      address: s(p.address),
      addressDescription: s(p.addressDescription),
      lat: n(p.lat),
      lng: n(p.lng),
      mapLink: /^https:\/\//i.test(s(p.mapLink)) ? s(p.mapLink) : '',
      workingHours: s(p.workingHours),
      note: s(p.note),
    }));
  if (items.length === 0) return null;
  const sourceUrl = /^https:\/\//i.test(s(json.sourceUrl)) ? s(json.sourceUrl) : FALLBACK_SOURCE_URL;
  return { source: s(json.source) || 'Bursa Eczacı Odası', sourceUrl, fetchedAt: s(json.fetchedAt), sentryDate: s(json.sentryDate), items };
}

export function useNobetciEczane(): DutyState {
  const [state, setState] = useState<DutyState>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    const base = ((import.meta as any).env && (import.meta as any).env.BASE_URL) || '/';
    fetch(`${base}data/nobetci-eczane.json`, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('liste yok');
        return r.json();
      })
      .then((j) => {
        const data = parseDutyFile(j);
        if (!cancelled) setState(data ? { status: 'ready', data } : { status: 'unavailable' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

/** İstanbul saatiyle şu an geçerli nöbet gününün tarihi (YYYY-MM-DD). Nöbet sabah 08:30'da değişir. */
export function currentNobetDate(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() - 8.5 * 3600 * 1000);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(shifted);
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatPhone(raw: string) {
  const d = raw.replace(/[^\d]/g, '');
  if (d.length === 11 && d.startsWith('0')) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
  return raw;
}

function directionsUrl(p: DutyPharmacy) {
  if (p.mapLink) return p.mapLink;
  if (p.lat !== null && p.lng !== null) return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address} ${PHARMACY_DISTRICT_LABEL}`)}`;
}

function isNeighborhood(p: DutyPharmacy) {
  const hay = `${p.locality} ${p.address} ${p.addressDescription}`.toLocaleLowerCase('tr-TR');
  return NEIGHBORHOOD_KEYWORDS.some((k) => hay.includes(k.toLocaleLowerCase('tr-TR')));
}

function formatDate(ymd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '';
  return new Date(`${ymd}T12:00:00+03:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'Europe/Istanbul' });
}

function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

// ───────── bileşen ─────────
export function HomeNobetciEczane() {
  const state = useNobetciEczane();
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [locating, setLocating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const items = state.status === 'ready' ? state.data.items : [];

  const sorted = useMemo<Row[]>(() => {
    const withMeta = items.map((p) => ({
      p,
      near: isNeighborhood(p),
      km: pos && p.lat !== null && p.lng !== null ? haversineKm(pos, { lat: p.lat, lng: p.lng }) : null,
    }));
    if (pos) {
      return withMeta.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9));
    }
    // Konum yoksa: önce mahalledekiler, sonra Osmangazi, sonra diğer ilçeler (aynı grupta kaynak sırası korunur)
    const rank = (r: Row) => (r.near ? 0 : r.p.locality.toLocaleLowerCase('tr-TR').startsWith('osmangazi') ? 1 : 2);
    return withMeta.sort((a, b) => rank(a) - rank(b));
  }, [items, pos]);

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Bu cihaz konum özelliğini desteklemiyor.');
      return;
    }
    setLocating(true);
    setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      (g) => {
        setPos({ lat: g.coords.latitude, lng: g.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoMsg('Konum izni verilmedi; liste olduğu gibi gösteriliyor.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  if (state.status === 'loading') {
    return <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" aria-hidden="true" />;
  }

  if (state.status === 'unavailable') {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Nöbetçi eczane listesi şu an alınamadı</h2>
            <p className="text-xs text-slate-500 mt-0.5">Güncel liste için Bursa Eczacı Odası'nın resmi sayfasına bakabilirsiniz. Acil durumda 112'yi arayın.</p>
          </div>
        </div>
        <a
          href={FALLBACK_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          Güncel listeyi aç
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </section>
    );
  }

  const { data } = state;
  const todayNobet = currentNobetDate();
  const stale = !!data.sentryDate && data.sentryDate !== todayNobet;
  const hasNear = sorted.some((x) => x.near);
  const visible: Row[] = showAll ? sorted : sorted.slice(0, 3);
  const dateLabel = formatDate(data.sentryDate);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl border border-red-500 p-4 sm:p-5 space-y-4">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-md shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
                {hasNear && !pos ? 'Mahallende nöbetçi eczane var' : 'Bugün nöbetçi eczaneler'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                {items.length} eczane
              </span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">
              {PHARMACY_DISTRICT_LABEL}
              {dateLabel ? ` · ${dateLabel} nöbeti` : ''} · Kaynak:{' '}
              <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                {data.source}
              </a>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="px-4 py-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-950/70 border border-white/30 text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60 transition-all"
        >
          <LocateFixed className="w-4 h-4" />
          {pos ? 'Konuma göre sıralandı' : locating ? 'Konum alınıyor…' : 'Bana en yakın olanı bul'}
        </button>
      </div>

      {stale && (
        <div className="relative z-10 rounded-xl bg-amber-400/20 border border-amber-300/50 text-amber-50 text-[11px] font-bold px-3 py-2">
          Bu liste {dateLabel || data.sentryDate} tarihli; güncel olmayabilir. Gitmeden önce mutlaka telefonla teyit edin.
        </div>
      )}
      {geoMsg && <div className="relative z-10 text-[11px] text-red-100">{geoMsg}</div>}

      <ul className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {visible.map(({ p, near, km }, i) => (
          <li key={`${p.name}-${i}`} className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-black text-sm leading-tight">{p.name}</h3>
                {p.locality && <div className="text-[10px] font-bold text-red-100/90 mt-0.5">{p.locality}</div>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {near && <span className="text-[10px] font-black bg-white text-red-700 px-1.5 py-0.5 rounded">Mahallede</span>}
                {km !== null && <span className="text-[10px] font-black bg-amber-300 text-slate-900 px-1.5 py-0.5 rounded">{formatKm(km)}</span>}
              </div>
            </div>
            <p className="text-[11px] text-red-50 flex items-start gap-1.5 leading-snug">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {p.address || p.locality}
                {p.addressDescription ? ` (${p.addressDescription})` : ''}
              </span>
            </p>
            {(p.workingHours || p.note) && (
              <p className="text-[10px] text-red-100/90">
                {p.workingHours ? `Saat: ${p.workingHours}` : ''}
                {p.workingHours && p.note ? ' · ' : ''}
                {p.note}
              </p>
            )}
            <div className="flex items-center gap-2 mt-auto pt-1">
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/[^\d+]/g, '')}`}
                  className="flex-1 px-3 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ara {formatPhone(p.phone)}
                </a>
              )}
              {p.phone2 && (
                <a
                  href={`tel:${p.phone2.replace(/[^\d+]/g, '')}`}
                  className="px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                  title="2. telefon"
                >
                  <Phone className="w-3 h-3" />
                  {formatPhone(p.phone2)}
                </a>
              )}
              <a
                href={directionsUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-red-800/60 hover:bg-red-800/90 border border-white/30 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                Yol tarifi
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-red-100">
        <span>Her eczane nöbette açık olmayabilir; gitmeden önce telefonla teyit edin.</span>
        {sorted.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="font-black text-white flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            {showAll ? (
              <>
                Daha az göster <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Tümünü göster ({sorted.length}) <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}

