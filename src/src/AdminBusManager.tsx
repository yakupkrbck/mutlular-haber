// Yönetici paneli: Otobüs Hatları.
// Resmî BursaKart/Burulaş bilgisine bakılarak hattın kalkış/varış yeri, güzergâhı ve sefer saatleri girilir.
// Saat alanına metin yapıştırmak yeterlidir (virgül, boşluk, satır sonu fark etmez): saatler otomatik ayrıştırılır.
import { useMemo, useState } from 'react';
import { Check, Plus, Save, Trash2 } from 'lucide-react';
import { db, doc, setDoc, deleteDoc, serverTimestamp } from './firebase';
import {
  DAY_LABELS,
  DAY_TYPES,
  DIRECTION_LABELS,
  DIRECTIONS,
  buildBusPayload,
  emptyForm,
  lineDocId,
  lineHasTimes,
  lineToForm,
  mergeBusLines,
  parseTimes,
  seedLines,
  type BusForm,
  type BusLine,
} from './busData';

const todayYmd = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date());

const field = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-blue-500';
const label = 'block text-[11px] font-bold text-slate-500 mb-1';

export function AdminBusManager({
  remoteLines,
  onToast,
}: {
  remoteLines: Partial<BusLine>[];
  onToast: (msg: string, isError?: boolean) => void;
}) {
  const lines = useMemo(() => mergeBusLines(seedLines(), remoteLines), [remoteLines]);
  const remoteCodes = useMemo(() => new Set(remoteLines.map((r) => r.code)), [remoteLines]);
  const [selected, setSelected] = useState<string | null>(null); // null = seçili yok, '__new' = yeni hat
  const [form, setForm] = useState<BusForm | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = (code: string) => {
    const l = lines.find((x) => x.code === code);
    if (!l) return;
    setSelected(code);
    setForm({ ...lineToForm(l), guncelleme: l.guncelleme || '' });
  };
  const addNew = () => {
    setSelected('__new');
    setForm(emptyForm());
  };
  const set = <K extends keyof BusForm>(k: K, v: BusForm[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const setTimes = (key: string, v: string) => setForm((f) => (f ? { ...f, times: { ...f.times, [key]: v } } : f));

  const save = async () => {
    if (!form || busy) return;
    const payload = buildBusPayload({ ...form, guncelleme: form.guncelleme || todayYmd() });
    if (!payload.ok) { onToast(payload.error, true); return; }
    if (selected === '__new' && lines.some((l) => l.code === payload.data.code)) {
      onToast(`${payload.data.code} kodlu hat zaten var; listeden seçip düzenleyin (mükerrer kayıt engellendi).`, true);
      return;
    }
    setBusy(true);
    try {
      await setDoc(doc(db, 'bus_lines', lineDocId(payload.data.code)), { ...payload.data, updatedAt: serverTimestamp() });
      onToast(`${payload.data.code} hattı kaydedildi (${payload.total} sefer saati). ✅`);
      payload.warnings.forEach((w) => onToast(w, true));
      setSelected(payload.data.code);
    } catch (e: any) {
      onToast('Kaydedilemedi: ' + (e?.message || 'bilinmeyen hata'), true);
    } finally {
      setBusy(false);
    }
  };

  const removeRemote = async () => {
    if (!form || busy) return;
    const id = lineDocId(form.code);
    if (!id || !remoteCodes.has(form.code.toUpperCase()) && !remoteCodes.has(id)) return;
    if (!window.confirm(`${form.code} hattı için yönetici tarafından girilen güzergâh ve saatler silinsin mi? (Hat listede başlangıç bilgisiyle kalır.)`)) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'bus_lines', id));
      onToast('Hattın girilen saatleri silindi.');
      setSelected(null);
      setForm(null);
    } catch (e: any) {
      onToast('Silinemedi: ' + (e?.message || 'bilinmeyen hata'), true);
    } finally {
      setBusy(false);
    }
  };

  const canDelete = !!form && selected !== '__new' && (remoteCodes.has(form.code) || remoteCodes.has(form.code.toUpperCase()));

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-2">
        <h3 className="font-black text-sm text-slate-900">🚌 Otobüs Hatları</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Burulaş'ın herkese açık bir saat servisi (API) olmadığı için güzergâh ve sefer saatlerini resmî BursaKart / Burulaş bilgisine bakarak buradan girin.
          Saat alanına metni olduğu gibi yapıştırabilirsiniz; saatler otomatik ayrıştırılır. Saati girilmemiş hat için ana sayfada uydurma saat gösterilmez.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-slate-700">Hatlar ({lines.length})</span>
          <button type="button" onClick={addNew} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Yeni hat
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lines.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1 ${
                selected === l.code ? 'bg-blue-600 text-white' : lineHasTimes(l) ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={lineHasTimes(l) ? 'Saatleri girilmiş' : 'Saatleri henüz girilmemiş'}
            >
              {l.code}
              {lineHasTimes(l) && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Yeşil: saatleri girilmiş hatlar.</p>
      </div>

      {form && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={label}>Hat kodu</label>
              <input className={field} value={form.code} disabled={selected !== '__new'} onChange={(e) => set('code', e.target.value)} placeholder="örn. 15H" maxLength={12} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Hat adı (örn. Terminal – Beşevler)</label>
              <input className={field} value={form.baslik} onChange={(e) => set('baslik', e.target.value)} maxLength={400} />
            </div>
            <div>
              <label className={label}>Kalkış yeri</label>
              <input className={field} value={form.kalkis} onChange={(e) => set('kalkis', e.target.value)} maxLength={400} />
            </div>
            <div>
              <label className={label}>Varış yeri</label>
              <input className={field} value={form.varis} onChange={(e) => set('varis', e.target.value)} maxLength={400} />
            </div>
            <div>
              <label className={label}>Yakın durak (varsa)</label>
              <input className={field} value={form.durak} onChange={(e) => set('durak', e.target.value)} maxLength={400} />
            </div>
          </div>

          <div>
            <label className={label}>Güzergâh (ana cadde / durak sırası)</label>
            <textarea className={field} rows={3} value={form.guzergah} onChange={(e) => set('guzergah', e.target.value)} maxLength={1500} placeholder="Terminal → … → … → Mehmet Akif Mah." />
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.mahalle} onChange={(e) => set('mahalle', e.target.checked)} />
            Mahalleye doğrudan hizmet veren hat (ana sayfada en üstte görünür)
          </label>

          <div className="space-y-3">
            <div className="text-xs font-black text-slate-800">Hareket saatleri</div>
            {DIRECTIONS.map((d) => (
              <div key={d} className="rounded-2xl border border-slate-200 p-3 space-y-2">
                <div className="text-[11px] font-black text-blue-700">
                  {DIRECTION_LABELS[d]} {d === 'gidis' && form.kalkis && form.varis ? `(${form.kalkis} → ${form.varis})` : d === 'donus' && form.kalkis && form.varis ? `(${form.varis} → ${form.kalkis})` : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DAY_TYPES.map((t) => {
                    const key = `${d}.${t}`;
                    const n = parseTimes(form.times[key] || '').length;
                    return (
                      <div key={key}>
                        <label className={label}>
                          {DAY_LABELS[t]} <span className="text-emerald-600 font-black">{n ? `· ${n} sefer` : ''}</span>
                        </label>
                        <textarea
                          className={`${field} font-mono text-xs`}
                          rows={4}
                          value={form.times[key] || ''}
                          onChange={(e) => setTimes(key, e.target.value)}
                          placeholder="06:05, 06:35, 07:10 …"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={label}>Not (isteğe bağlı: örn. “Okul tatilinde seferler azalır”)</label>
              <input className={field} value={form.not} onChange={(e) => set('not', e.target.value)} maxLength={600} />
            </div>
            <div>
              <label className={label}>Bilgi tarihi</label>
              <input type="date" className={field} value={form.guncelleme} onChange={(e) => set('guncelleme', e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <label className={label}>Kaynak</label>
              <input className={field} value={form.kaynak} onChange={(e) => set('kaynak', e.target.value)} maxLength={200} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" disabled={busy} onClick={save} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
              <Save className="w-4 h-4" /> {busy ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            {canDelete && (
              <button type="button" disabled={busy} onClick={removeRemote} className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                <Trash2 className="w-4 h-4" /> Girilen saatleri sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
