// Yönetici veri yöneticisi (içerik, kullanıcı ve yorum temizliği).
// Listeleri uygulama durumundan DEĞİL, doğrudan Firestore'dan okur: durum alanı olmayan eski kayıtlar,
// onay bekleyen/reddedilmiş kayıtlar ve herkese görünmeyen kayıtlar dahil hepsi burada görünür ve silinebilir.
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import {
  db,
  collection,
  doc,
  getDocs,
  deleteDoc,
  runTransaction,
  updateDoc,
  query,
  where,
  limit
} from './firebase';

interface Row {
  id: string;
  title: string;
  sub: string;
  badge?: string;
  raw: any;
}

interface SectionDef {
  col: string;
  label: string;
  emoji: string;
  map: (d: any, id: string) => { title: string; sub: string; badge?: string };
}

const dateText = (v: any) => {
  const ms = v?.toMillis ? v.toMillis() : v?.seconds ? v.seconds * 1000 : 0;
  return ms ? new Date(ms).toLocaleDateString('tr-TR') : '';
};
const join = (...p: (string | undefined | null | false)[]) => p.filter(Boolean).join(' • ');

const STATUS_BADGE: Record<string, string> = {
  pending: 'Onay bekliyor',
  rejected: 'Reddedildi',
  published: 'Yayında',
  approved: 'Onaylı',
  sold: 'Satıldı'
};

const SECTIONS: SectionDef[] = [
  { col: 'haberler', label: 'Haberler', emoji: '📰', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.kategori, d.authorName, d.isTip ? 'İhbar' : '', dateText(d.createdAt)), badge: STATUS_BADGE[d.status] }) },
  { col: 'cenaze_ilanlari', label: 'Vefat İlanları', emoji: '🕊️', map: (d) => ({ title: d.fullName || '(isimsiz)', sub: join(d.dateStr, d.mosque, d.authorName ? `Bırakan: ${d.authorName}` : 'Bırakan bilinmiyor'), badge: STATUS_BADGE[d.status] || 'Durumsuz (eski kayıt)' }) },
  { col: 'marketplace_items', label: 'Emlak ve 2. El İlanları', emoji: '🏷️', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.kategori, d.saticiAdi, dateText(d.createdAt)), badge: STATUS_BADGE[d.status] }) },
  { col: 'lost_found_items', label: 'Kayıp Eşya', emoji: '🔎', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.tur, d.kategori, dateText(d.createdAt)) }) },
  { col: 'mahalle_davetleri', label: 'Davetiyeler', emoji: '💍', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.turEtiketi, d.tarih, dateText(d.createdAt)) }) },
  { col: 'mahalle_kursusu', label: 'Mahalle Kürsüsü', emoji: '🎤', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.kategori, d.authorName, dateText(d.createdAt)) }) },
  { col: 'esnaf_kampanyalar', label: 'Esnaf Kampanyaları', emoji: '🏪', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.isyeriAdi, d.kategori, dateText(d.createdAt)), badge: STATUS_BADGE[d.status] }) },
  { col: 'businesses', label: 'İşletme Sayfaları', emoji: '🏬', map: (d) => ({ title: d.isyeri || '(adsız)', sub: join(d.kategori, d.adres), badge: STATUS_BADGE[d.approvalStatus] }) },
  { col: 'service_requests', label: 'Hizmet Talepleri', emoji: '🛠️', map: (d) => ({ title: d.baslik || '(başlıksız)', sub: join(d.kategori, d.authorName, dateText(d.createdAt)), badge: d.status }) },
  { col: 'offers', label: 'Teklifler', emoji: '💰', map: (d) => ({ title: d.esnafIsyeri || '(usta)', sub: join(d.fiyat != null ? `${d.fiyat} TL` : '', d.requestTitle, dateText(d.createdAt)), badge: d.status }) },
  { col: 'polls', label: 'Anketler', emoji: '🗳️', map: (d) => ({ title: d.soru || '(sorusuz)', sub: join(`${d.toplam || 0} oy`, dateText(d.createdAt)), badge: d.aktif === false ? 'Kapalı' : 'Açık' }) },
  { col: 'comments', label: 'Yorumlar (yeni)', emoji: '💬', map: (d) => ({ title: String(d.text || '').slice(0, 90) || '(boş yorum)', sub: join(d.authorName, d.contentType, dateText(d.createdAt)), badge: d.status }) },
  { col: 'hizmet_alanlari', label: 'Faaliyet Alanları', emoji: '🧰', map: (d) => ({ title: d.ad || '(adsız)', sub: 'Usta tarafından eklendi' }) },
  { col: 'users', label: 'Kullanıcılar', emoji: '👤', map: (d) => ({ title: d.name || d.email || '(isimsiz)', sub: join(d.email, d.isyeri), badge: d.role === 'esnaf' ? (d.hesapTipi === 'usta' ? 'usta' : d.hesapTipi === 'esnaf' ? 'esnaf' : 'esnaf/usta (eski)') : d.role || 'sakin' }) }
];

const COMMENT_COLS = ['haberler', 'marketplace_items', 'lost_found_items', 'mahalle_davetleri', 'mahalle_kursusu', 'esnaf_kampanyalar'];

interface CommentRow {
  key: string;
  col: string;
  docId: string;
  docTitle: string;
  comment: any;
}

export function AdminDataManager({
  currentUid,
  onToast
}: {
  currentUid?: string;
  onToast: (msg: string, isError?: boolean) => void;
}) {
  const [view, setView] = useState<string>('haberler');
  const [rows, setRows] = useState<Row[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'tumu' | 'usta' | 'esnaf' | 'sakin' | 'editor' | 'admin'>('tumu');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const errText = (e: any) => (e?.code === 'permission-denied' ? 'yetkiniz yok (Firestore kuralları yayınlandı mı? Yönetici e-postanız doğrulanmış mı?)' : e?.message || 'bilinmeyen hata');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (view === 'yorumlar') {
        const all: CommentRow[] = [];
        for (const col of COMMENT_COLS) {
          const snap = await getDocs(query(collection(db, col), limit(300)));
          snap.forEach((d) => {
            const data: any = d.data();
            const arr: any[] = Array.isArray(data.yorumlar) ? data.yorumlar : [];
            arr.forEach((c, i) => all.push({ key: `${col}/${d.id}/${c?.id || i}`, col, docId: d.id, docTitle: data.baslik || data.isyeriAdi || data.fullName || d.id, comment: c }));
          });
        }
        setComments(all);
      } else {
        const def = SECTIONS.find((s) => s.col === view)!;
        const snap = await getDocs(query(collection(db, def.col), limit(500)));
        const items: Row[] = [];
        snap.forEach((d) => {
          const m = def.map(d.data(), d.id);
          items.push({ id: d.id, raw: d.data(), ...m });
        });
        items.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        setRows(items);
      }
    } catch (e: any) {
      setError('Liste yüklenemedi: ' + errText(e));
      setRows([]);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    setSearch('');
    setUserFilter('tumu');
    load();
  }, [load]);

  const deleteOne = async (row: Row) => {
    if (view === 'users') {
      if (row.id === currentUid) return onToast('Kendi hesabınızı buradan silemezsiniz.', true);
      if (row.raw?.role === 'admin') return onToast('Yönetici hesapları buradan silinemez.', true);
      if (!confirm(`"${row.title}" kullanıcısının profil kaydı silinsin mi?\n\nYalnızca Firestore'daki profil silinir. Giriş hesabı (Authentication) Firebase konsolundan ayrıca silinir.`)) return;
    } else if (!confirm(`"${row.title}" kalıcı olarak silinsin mi?`)) {
      return;
    }
    setBusy(row.id);
    try {
      if (view === 'service_requests') {
        const offerSnap = await getDocs(query(collection(db, 'offers'), where('requestId', '==', row.id)));
        await Promise.all(offerSnap.docs.map((d) => deleteDoc(d.ref)));
      }
      if (view === 'polls') {
        const votes = await getDocs(collection(db, 'polls', row.id, 'votes'));
        await Promise.all(votes.docs.map((v) => deleteDoc(v.ref)));
      }
      await deleteDoc(doc(db, view, row.id));
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      onToast('Kayıt silindi. 🗑️');
    } catch (e: any) {
      onToast('Silinemedi: ' + errText(e), true);
    } finally {
      setBusy(null);
    }
  };

  const deleteAllVisible = async (list: Row[]) => {
    if (view === 'users') return;
    if (list.length === 0) return;
    if (!confirm(`Listelenen ${list.length} kayıt kalıcı olarak silinecek. Devam edilsin mi?`)) return;
    const typed = window.prompt('Onaylamak için SİL yazın:');
    if ((typed || '').trim().toLocaleUpperCase('tr-TR') !== 'SİL') return;
    setBusy('ALL');
    try {
      if (view === 'service_requests') {
        const offerSnap = await getDocs(collection(db, 'offers'));
        const ids = new Set(list.map((r) => r.id));
        await Promise.all(offerSnap.docs.filter((d) => ids.has((d.data() as any).requestId)).map((d) => deleteDoc(d.ref)));
      }
      const results = await Promise.allSettled(list.map((r) => deleteDoc(doc(db, view, r.id))));
      const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      const okIds = new Set(list.filter((_, i) => results[i].status === 'fulfilled').map((r) => r.id));
      setRows((prev) => prev.filter((r) => !okIds.has(r.id)));
      if (failed.length === 0) onToast(`${list.length} kayıt silindi. 🗑️`);
      else onToast(`${list.length - failed.length} kayıt silindi, ${failed.length} silinemedi: ${errText(failed[0].reason)}`, true);
    } catch (e: any) {
      onToast('Silinemedi: ' + errText(e), true);
    } finally {
      setBusy(null);
    }
  };

  const sameComment = (a: any, b: any) => (a?.id && b?.id ? a.id === b.id : JSON.stringify(a) === JSON.stringify(b));

  const deleteComment = async (row: CommentRow) => {
    if (!confirm('Bu yorum kalıcı olarak silinsin mi?')) return;
    setBusy(row.key);
    try {
      await runTransaction(db, async (tx: any) => {
        const ref = doc(db, row.col, row.docId);
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const arr: any[] = Array.isArray(snap.data().yorumlar) ? snap.data().yorumlar : [];
        const idx = arr.findIndex((c) => sameComment(c, row.comment));
        if (idx < 0) return;
        const next = arr.filter((_, i) => i !== idx);
        tx.update(ref, { yorumlar: next });
      });
      setComments((prev) => prev.filter((c) => c.key !== row.key));
      onToast('Yorum silindi. 🗑️');
    } catch (e: any) {
      onToast('Yorum silinemedi: ' + errText(e), true);
    } finally {
      setBusy(null);
    }
  };

  const clearAllComments = async (col: string, docId: string, title: string) => {
    if (!confirm(`"${title}" içeriğindeki TÜM yorumlar silinsin mi?`)) return;
    setBusy(`${col}/${docId}`);
    try {
      await updateDoc(doc(db, col, docId), { yorumlar: [] });
      setComments((prev) => prev.filter((c) => !(c.col === col && c.docId === docId)));
      onToast('İçeriğin yorumları silindi. 🗑️');
    } catch (e: any) {
      onToast('Silinemedi: ' + errText(e), true);
    } finally {
      setBusy(null);
    }
  };

  const q = search.trim().toLocaleLowerCase('tr-TR');
  const roleOf = (r: Row) => (r.raw?.role === 'esnaf' ? (r.raw?.hesapTipi === 'esnaf' ? 'esnaf' : r.raw?.hesapTipi === 'usta' ? 'usta' : 'usta') : r.raw?.role || 'sakin');
  const visibleRows = rows.filter((r) => {
    if (view === 'users' && userFilter !== 'tumu' && roleOf(r) !== userFilter) return false;
    return !q || `${r.title} ${r.sub} ${r.badge || ''}`.toLocaleLowerCase('tr-TR').includes(q);
  });
  const visibleComments = comments.filter((c) => !q || `${c.comment?.authorName || ''} ${c.comment?.mesaj || ''} ${c.docTitle}`.toLocaleLowerCase('tr-TR').includes(q));

  const tab = (key: string, label: string) => (
    <button
      key={key}
      onClick={() => setView(key)}
      className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${view === key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-800 leading-relaxed">
        Bu ekran kayıtları doğrudan veritabanından listeler; onay bekleyen, reddedilen ve eski (durum alanı olmayan) kayıtlar dahil hepsi görünür. Silinen kayıt geri getirilemez.
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => tab(s.col, `${s.emoji} ${s.label}`))}
        {tab('yorumlar', '💬 Yorumlar')}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Bu listede ara…" className="w-full sm:max-w-xs text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-[11px] font-black flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Yenile
          </button>
          {view !== 'yorumlar' && view !== 'users' && (
            <button onClick={() => deleteAllVisible(visibleRows)} disabled={busy === 'ALL' || visibleRows.length === 0} className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[11px] font-black flex items-center gap-1.5 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Listelenenleri sil ({visibleRows.length})
            </button>
          )}
        </div>
      </div>

      {view === 'users' && (
        <div className="flex flex-wrap gap-1.5">
          {(['tumu', 'usta', 'esnaf', 'sakin', 'editor', 'admin'] as const).map((f) => (
            <button key={f} onClick={() => setUserFilter(f)} className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${userFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {f === 'tumu' ? 'Hepsi' : f === 'sakin' ? 'Mahalleli' : f === 'editor' ? 'Editör' : f === 'admin' ? 'Admin' : f === 'usta' ? 'Usta' : 'Esnaf'}
            </button>
          ))}
        </div>
      )}

      {error && <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
      {loading && <div className="text-xs text-slate-500 p-3">Yükleniyor…</div>}

      {view !== 'yorumlar' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {visibleRows.length === 0 && !error && <div className="p-6 text-center text-xs text-slate-500">Bu listede kayıt yok.</div>}
          {visibleRows.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">{r.title}</div>
                {r.sub && <div className="text-[11px] text-slate-500 truncate">{r.sub}</div>}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {r.badge && <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{r.badge}</span>}
                  <span className="text-[10px] text-slate-400 font-mono truncate">{r.id}</span>
                </div>
              </div>
              <button onClick={() => deleteOne(r)} disabled={busy === r.id || busy === 'ALL'} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-[11px] font-black flex items-center gap-1 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Sil
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'yorumlar' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {visibleComments.length === 0 && !error && <div className="p-6 text-center text-xs text-slate-500">Hiç yorum yok.</div>}
          {visibleComments.map((c) => (
            <div key={c.key} className="p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900">{c.comment?.authorName || 'Bilinmeyen'}</div>
                  <div className="text-xs text-slate-700 leading-relaxed">{c.comment?.mesaj}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">İçerik: {c.docTitle} • {c.col}</div>
                </div>
                <button onClick={() => deleteComment(c)} disabled={busy === c.key} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-[11px] font-black flex items-center gap-1 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Sil
                </button>
              </div>
              <button onClick={() => clearAllComments(c.col, c.docId, c.docTitle)} className="text-[10px] font-bold text-slate-500 hover:text-red-700 underline cursor-pointer">
                Bu içeriğin tüm yorumlarını sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDataManager;
