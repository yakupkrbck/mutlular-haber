// Yönetici paneli: Kategori Yönetimi.
//  • Faaliyet alanları (usta) ve işletme türleri (esnaf): yönetici ekler, düzenler, siler. Ustalar bu listeden seçer,
//    serbest yazı yoktur; böylece yazım hatası ve mükerrer kayıt oluşmaz.
//  • Haber kategorileri: sabit listeden çıkarıldı; buradan yönetilir (hiç kategori yoksa varsayılan liste kullanılır).
//  • Usta listesi: mevcut ustaları ortak listeye aktarma ve "onaylı usta" rozeti verme.
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  addDoc, collection, db, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where,
} from './firebase';
import { ESNAF_TURLERI } from './serviceMatching';
import { MAIN_SERVICE_CATEGORIES } from './data/serviceCategories';
import { DEFAULT_NEWS_CATEGORIES, cleanLabel, findDuplicate, ustaAreas } from './categories';

interface AreaDoc { id: string; ad: string; tur: 'usta' | 'esnaf' }
interface NewsCatDoc { id: string; ad: string; ikon: string; sira: number }
interface UstaDoc { uid: string; ad: string; alanlar: string[]; onayli: boolean }

const input = 'flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-blue-500';
const box = 'bg-white rounded-3xl p-5 border border-slate-200 space-y-4';


interface Shared {
  busy: boolean;
  guard: (fn: () => Promise<void>, okMsg?: string) => Promise<void>;
  onToast: (msg: string, isError?: boolean) => void;
}

function AreaList({ tur, title, statics, areas, busy, guard, onToast, adminUid }: { tur: 'usta' | 'esnaf'; title: string; statics: string[] } & Shared & { areas: AreaDoc[]; adminUid: string }) {
    const mine = areas.filter((a) => a.tur === tur);
    const [val, setVal] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editVal, setEditVal] = useState('');

    const add = () =>
      guard(async () => {
        const c = cleanLabel(val);
        if (!c.ok) throw new Error(c.error);
        const dup = findDuplicate(c.name, [...statics, ...mine.map((m) => m.ad)]);
        if (dup) throw new Error(`"${dup}" zaten listede (mükerrer kayıt engellendi).`);
        await addDoc(collection(db, 'hizmet_alanlari'), { ad: c.name, adNorm: c.name.toLocaleLowerCase('tr-TR'), tur, ekleyenUid: adminUid, createdAt: serverTimestamp() });
        setVal('');
      }, 'Eklendi ✅');

    const rename = (a: AreaDoc) =>
      guard(async () => {
        const c = cleanLabel(editVal);
        if (!c.ok) throw new Error(c.error);
        if (c.name === a.ad) { setEditId(null); return; }
        const dup = findDuplicate(c.name, [...statics, ...mine.filter((m) => m.id !== a.id).map((m) => m.ad)]);
        if (dup) throw new Error(`"${dup}" zaten listede.`);
        await updateDoc(doc(db, 'hizmet_alanlari', a.id), { ad: c.name, adNorm: c.name.toLocaleLowerCase('tr-TR') });
        // Bu alanı seçmiş ustaların kayıtlarını da güncelle (yazım düzeltmesi herkese yansısın)
        let n = 0;
        const fix = async (ref: any, patch: any) => { await updateDoc(ref, patch); n += 1; };
        const byMain = await getDocs(query(collection(db, 'users'), where('esnafKategori', '==', a.ad)));
        for (const d of byMain.docs) {
          const cur = (d.data() as any).faaliyetAlanlari as string[] | undefined;
          await fix(d.ref, { esnafKategori: c.name, ...(Array.isArray(cur) ? { faaliyetAlanlari: cur.map((x) => (x === a.ad ? c.name : x)) } : {}) });
        }
        const byArr = await getDocs(query(collection(db, 'users'), where('faaliyetAlanlari', 'array-contains', a.ad)));
        for (const d of byArr.docs) {
          const x = d.data() as any;
          if (x.esnafKategori === a.ad) continue; // yukarıda güncellendi
          await fix(d.ref, { faaliyetAlanlari: (x.faaliyetAlanlari as string[]).map((y) => (y === a.ad ? c.name : y)) });
        }
        const pubs = await getDocs(query(collection(db, 'usta_profilleri'), where('alanlar', 'array-contains', a.ad)));
        for (const d of pubs.docs) await updateDoc(d.ref, { alanlar: ((d.data() as any).alanlar as string[]).map((y) => (y === a.ad ? c.name : y)) });
        setEditId(null);
        onToast(`"${a.ad}" → "${c.name}" olarak düzeltildi (${n} kullanıcı kaydı güncellendi). ✅`);
      });

    const remove = (a: AreaDoc) => {
      if (!window.confirm(`"${a.ad}" silinsin mi? Bu alanı seçmiş kullanıcılar kendi kayıtlarında eski adı görmeye devam eder; yeni seçimlerde listede çıkmaz.`)) return;
      guard(async () => { await deleteDoc(doc(db, 'hizmet_alanlari', a.id)); }, 'Silindi.');
    };

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-800">{title}</h4>
        <div className="flex gap-2">
          <input className={input} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Yeni ad ekle…" maxLength={40} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <button type="button" onClick={add} disabled={busy} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer disabled:opacity-60">
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statics.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold" title="Varsayılan liste (kod içinde; silinemez)">{s}</span>
          ))}
        </div>
        {mine.length > 0 && (
          <ul className="space-y-1.5">
            {mine.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                {editId === a.id ? (
                  <>
                    <input className={input} value={editVal} onChange={(e) => setEditVal(e.target.value)} maxLength={40} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') rename(a); }} />
                    <button type="button" onClick={() => rename(a)} disabled={busy} aria-label="Kaydet" className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center cursor-pointer"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditId(null)} aria-label="Vazgeç" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-bold text-slate-900 truncate">{a.ad}</span>
                    <button type="button" onClick={() => { setEditId(a.id); setEditVal(a.ad); }} aria-label="Düzenle" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => remove(a)} aria-label="Sil" className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-slate-400">Gri etiketler varsayılan listedir. Yönetici olarak eklediklerinizi düzenleyebilir veya silebilirsiniz; yazım düzeltmesi, o alanı seçmiş kullanıcılara da yansır.</p>
      </div>
    );
  }

  // ───────── haber kategorileri ─────────
function NewsCats({ newsCats, busy, guard, onToast }: Shared & { newsCats: NewsCatDoc[] }) {
    const [ad, setAd] = useState('');
    const [ikon, setIkon] = useState('📰');
    const [editId, setEditId] = useState<string | null>(null);
    const [editVal, setEditVal] = useState('');

    const seedDefaults = () =>
      guard(async () => {
        for (const c of DEFAULT_NEWS_CATEGORIES) await addDoc(collection(db, 'news_categories'), { ad: c.ad, ikon: c.ikon, sira: c.sira, createdAt: serverTimestamp() });
      }, 'Varsayılan kategoriler düzenlenebilir hâle getirildi ✅');
    const add = () =>
      guard(async () => {
        const c = cleanLabel(ad);
        if (!c.ok) throw new Error(c.error);
        const dup = findDuplicate(c.name, newsCats.map((n) => n.ad));
        if (dup) throw new Error(`"${dup}" zaten var (mükerrer kayıt engellendi).`);
        const sira = (newsCats.reduce((m, n) => Math.max(m, n.sira === 999 ? 0 : n.sira), 0) || 0) + 1;
        await addDoc(collection(db, 'news_categories'), { ad: c.name, ikon: ikon.trim().slice(0, 4) || '📰', sira, createdAt: serverTimestamp() });
        setAd('');
      }, 'Kategori eklendi ✅');
    const rename = (n: NewsCatDoc) =>
      guard(async () => {
        const c = cleanLabel(editVal);
        if (!c.ok) throw new Error(c.error);
        const dup = findDuplicate(c.name, newsCats.filter((x) => x.id !== n.id).map((x) => x.ad));
        if (dup) throw new Error(`"${dup}" zaten var.`);
        await updateDoc(doc(db, 'news_categories', n.id), { ad: c.name });
        // Bu kategorideki mevcut haberleri de yeni ada taşı
        const snap = await getDocs(query(collection(db, 'haberler'), where('kategori', '==', n.ad)));
        for (const d of snap.docs) await updateDoc(d.ref, { kategori: c.name });
        setEditId(null);
        onToast(`Kategori adı güncellendi (${snap.size} haber taşındı). ✅`);
      });
    const move = (n: NewsCatDoc, dir: -1 | 1) =>
      guard(async () => {
        const i = newsCats.findIndex((x) => x.id === n.id);
        const o = newsCats[i + dir];
        if (!o) return;
        await updateDoc(doc(db, 'news_categories', n.id), { sira: o.sira === n.sira ? o.sira + dir : o.sira });
        await updateDoc(doc(db, 'news_categories', o.id), { sira: n.sira === o.sira ? n.sira - dir : n.sira });
      });
    const remove = (n: NewsCatDoc) => {
      if (!window.confirm(`"${n.ad}" kategorisi silinsin mi? Bu kategorideki haberler silinmez, yalnızca kategori listesinden çıkar.`)) return;
      guard(async () => { await deleteDoc(doc(db, 'news_categories', n.id)); }, 'Silindi.');
    };

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-800">Haber kategorileri</h4>
        {newsCats.length === 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-2">
            <p>Şu an varsayılan liste kullanılıyor ({DEFAULT_NEWS_CATEGORIES.map((c) => c.ad).join(', ')}). Düzenleyebilmek için önce listeyi etkinleştirin.</p>
            <button type="button" onClick={seedDefaults} disabled={busy} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black cursor-pointer disabled:opacity-60">Varsayılan listeyi düzenlenebilir yap</button>
          </div>
        )}
        <div className="flex gap-2">
          <input className="w-14 px-2 py-2 rounded-xl border border-slate-200 text-center text-lg" value={ikon} onChange={(e) => setIkon(e.target.value)} maxLength={4} aria-label="Simge" />
          <input className={input} value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Yeni kategori adı…" maxLength={40} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <button type="button" onClick={add} disabled={busy} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer disabled:opacity-60">
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>
        <ul className="space-y-1.5">
          {newsCats.map((n, i) => (
            <li key={n.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <span className="text-lg">{n.ikon}</span>
              {editId === n.id ? (
                <>
                  <input className={input} value={editVal} onChange={(e) => setEditVal(e.target.value)} maxLength={40} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') rename(n); }} />
                  <button type="button" onClick={() => rename(n)} disabled={busy} aria-label="Kaydet" className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center cursor-pointer"><Check className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setEditId(null)} aria-label="Vazgeç" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-bold text-slate-900 truncate">{n.ad}</span>
                  <button type="button" disabled={i === 0 || busy} onClick={() => move(n, -1)} aria-label="Yukarı" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button type="button" disabled={i === newsCats.length - 1 || busy} onClick={() => move(n, 1)} aria-label="Aşağı" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => { setEditId(n.id); setEditVal(n.ad); }} aria-label="Düzenle" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => remove(n)} aria-label="Sil" className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
}

export function AdminCategoryManager({
  allUsers,
  adminUid,
  onToast,
}: {
  allUsers: any[];
  adminUid: string;
  onToast: (msg: string, isError?: boolean) => void;
}) {
  const [areas, setAreas] = useState<AreaDoc[]>([]);
  const [newsCats, setNewsCats] = useState<NewsCatDoc[]>([]);
  const [ustalar, setUstalar] = useState<UstaDoc[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'hizmet_alanlari'), (snap) => {
      const l: AreaDoc[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        if (typeof x.ad === 'string' && x.ad) l.push({ id: d.id, ad: x.ad, tur: x.tur === 'esnaf' ? 'esnaf' : 'usta' });
      });
      setAreas(l.sort((a, b) => a.ad.localeCompare(b.ad, 'tr')));
    });
    const u2 = onSnapshot(collection(db, 'news_categories'), (snap) => {
      const l: NewsCatDoc[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        if (typeof x.ad === 'string' && x.ad) l.push({ id: d.id, ad: x.ad, ikon: typeof x.ikon === 'string' && x.ikon ? x.ikon : '📰', sira: typeof x.sira === 'number' ? x.sira : 999 });
      });
      setNewsCats(l.sort((a, b) => a.sira - b.sira || a.ad.localeCompare(b.ad, 'tr')));
    });
    const u3 = onSnapshot(collection(db, 'usta_profilleri'), (snap) => {
      const l: UstaDoc[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        l.push({ uid: d.id, ad: typeof x.ad === 'string' ? x.ad : 'Usta', alanlar: Array.isArray(x.alanlar) ? x.alanlar : [], onayli: x.onayli === true });
      });
      setUstalar(l.sort((a, b) => a.ad.localeCompare(b.ad, 'tr')));
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const staticUsta = useMemo(() => MAIN_SERVICE_CATEGORIES.map((c) => c.name), []);
  const guard = async (fn: () => Promise<void>, okMsg?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (okMsg) onToast(okMsg);
    } catch (e: any) {
      onToast('İşlem başarısız: ' + (e?.message || 'bilinmeyen hata'), true);
    } finally {
      setBusy(false);
    }
  };

  // ───────── usta listesi ─────────
  const registeredUstas = useMemo(
    () => (allUsers || []).filter((u: any) => u && u.role === 'esnaf' && u.hesapTipi === 'usta' && u.uid),
    [allUsers]
  );
  const missing = registeredUstas.filter((u: any) => !ustalar.some((x) => x.uid === u.uid));

  const importAll = () =>
    guard(async () => {
      let n = 0;
      for (const u of missing) {
        const ref = doc(db, 'usta_profilleri', u.uid);
        if ((await getDoc(ref)).exists()) continue;
        await setDoc(ref, { uid: u.uid, ad: (u.isyeri || u.name || 'Usta').slice(0, 80), alanlar: ustaAreas(u), onayli: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        n += 1;
      }
      onToast(`${n} usta ortak listeye aktarıldı. ✅`);
    });

  const toggleApproved = (u: UstaDoc) =>
    guard(async () => { await updateDoc(doc(db, 'usta_profilleri', u.uid), { onayli: !u.onayli }); }, u.onayli ? 'Onay kaldırıldı.' : '"Onaylı usta" rozeti verildi ✅');

  return (
    <div className="space-y-5">
      <div className={box}>
        <h3 className="font-black text-sm text-slate-900">🗂️ Faaliyet Alanları</h3>
        <p className="text-xs text-slate-500 leading-relaxed">Ustalar ve esnaf kayıtta/profilde yalnızca bu listelerden seçer; serbest yazı yoktur. Böylece yazım hatası ve mükerrer kayıt oluşmaz.</p>
        <AreaList tur="usta" title="Usta faaliyet alanları" statics={staticUsta} areas={areas} busy={busy} guard={guard} onToast={onToast} adminUid={adminUid} />
        <hr className="border-slate-100" />
        <AreaList tur="esnaf" title="İşletme (esnaf) türleri" statics={[...ESNAF_TURLERI]} areas={areas} busy={busy} guard={guard} onToast={onToast} adminUid={adminUid} />
      </div>

      <div className={box}>
        <h3 className="font-black text-sm text-slate-900">📰 Haber Kategorileri</h3>
        <NewsCats newsCats={newsCats} busy={busy} guard={guard} onToast={onToast} />
      </div>

      <div className={box}>
        <h3 className="font-black text-sm text-slate-900">🛠️ Usta Listesi ve Onay Rozeti</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Aramalarda "bu alanda usta var mı" bilgisi bu listeden gelir. Usta kayıt/profil kaydederken listeye kendiliğinden eklenir; daha önce kayıt olmuş ustalar için aşağıdaki düğmeyi bir kez kullanın.
        </p>
        {missing.length > 0 && (
          <button type="button" onClick={importAll} disabled={busy} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-60">
            Mevcut {missing.length} ustayı ortak listeye aktar
          </button>
        )}
        {ustalar.length === 0 ? (
          <p className="text-xs text-slate-400">Ortak listede henüz usta yok.</p>
        ) : (
          <ul className="space-y-1.5">
            {ustalar.map((u) => (
              <li key={u.uid} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{u.ad}</div>
                  <div className="text-[11px] text-slate-500 truncate">{u.alanlar.join(' · ') || 'Alan seçilmemiş'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleApproved(u)}
                  disabled={busy}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer ${u.onayli ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {u.onayli ? '✔ Onaylı usta' : 'Onayla'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
