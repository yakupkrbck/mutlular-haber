// Vefat & taziye ilanları listesi (onaylı ilanlar). "Şehir hizmetleri" penceresi kaldırıldı; yalnızca bu liste kaldı.
import React from 'react';
import { X, Share2 } from 'lucide-react';
import type { DeceasedItem } from './cityServicesData';

interface VefatModalProps {
  open: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  deceasedList?: DeceasedItem[];
  onOpenAddDeceased?: () => void;
  canDeleteDeceased?: (d: DeceasedItem) => boolean;
  onDeleteDeceased?: (d: DeceasedItem) => void;
  myDeceasedPending?: DeceasedItem[];
}

export function VefatModal({ open, onClose, onShowToast, deceasedList, onOpenAddDeceased, canDeleteDeceased, onDeleteDeceased, myDeceasedPending }: VefatModalProps) {
  if (!open) return null;
  const currentDeceasedList = deceasedList || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white font-black flex items-center justify-center text-lg">🕊️</div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">Kaybettiklerimiz (Vefat &amp; Taziye)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Onaylanmış vefat ve cenaze ilanları</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer" aria-label="Kapat">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2.5">
                <div className="text-xs text-emerald-900 font-semibold leading-relaxed">
                  🕊️ Mutlular Mahallesi ve Bursa genelinde vefat eden hemşerilerimizin taziye ve cenaze namazı bilgileri. Merhum ve merhumelere Allah'tan rahmet dileriz.
                </div>
                {onOpenAddDeceased && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddDeceased();
                    }}
                    className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+</span> İlan Bırak
                  </button>
                )}
              </div>

              {myDeceasedPending && myDeceasedPending.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="text-xs font-black text-amber-900">Bıraktığınız ilanlar</div>
                  {myDeceasedPending.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-800 truncate">{d.fullName}</span>
                      <span className={`shrink-0 font-black px-2 py-0.5 rounded-md ${d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-200 text-amber-900'}`}>
                        {d.status === 'rejected' ? 'Reddedildi' : '⏳ Onay bekliyor'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {currentDeceasedList.length === 0 && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <div className="text-2xl">🕊️</div>
                  <div className="font-bold text-slate-700">Şu an yayında vefat ilanı yok.</div>
                  <div>Bir vefat olduğunda yukarıdaki "İlan Bırak" düğmesiyle cenaze ve taziye bilgisini duyurabilirsiniz.</div>
                </div>
              )}

              {currentDeceasedList.map((d) => (
                <div key={d.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      {d.fullName} {d.age ? `(${d.age} yaşında)` : ''}
                    </h4>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      {d.dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium italic">{d.family}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Cenaze Vakti:</span>
                      <span className="text-emerald-800">{d.mosque} - {d.prayerTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Defin:</span>
                      <span>{d.cemetery}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`${d.fullName} vefat duyurusu - Cami: ${d.mosque} (${d.prayerTime}) - Defin: ${d.cemetery}`);
                      onShowToast('Taziye bilgisi kopyalandı');
                    }}
                    className="w-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Taziye Bilgisini Paylaş
                  </button>

                  {onDeleteDeceased && canDeleteDeceased && canDeleteDeceased(d) && (
                    <button
                      type="button"
                      onClick={() => onDeleteDeceased(d)}
                      className="w-full text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      🗑️ İlanı Kaldır
                    </button>
                  )}
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export default VefatModal;
