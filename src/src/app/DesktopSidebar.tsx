// Bileşen: DesktopSidebar (eski App.tsx 4753–4843)
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function DesktopSidebar() {
  const {
    setShowVefatModal, setMutlularTvActive, liveConfig, deceasedList, setCurrentDeceasedIdx,
    setShowNewDeceasedModal, activeDeceased, dIdx, shownDeceased,
  } = useApp();
  return (
    <aside className="bg-slate-950 text-slate-100 border-b border-slate-800 text-xs py-2 px-3 sm:px-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
        <div 
          onClick={() => setShowVefatModal(true)}
          className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer group"
          title="Cenaze ilanlarının detaylarını ve taziye mesajlarını gör"
        >
          <span className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 transition-colors shadow-xs">
            <span>🕊️</span>
            <span>Vefat &amp; Taziye</span>
          </span>

          {shownDeceased ? (
          <div className="truncate text-slate-200 group-hover:text-amber-300 transition-colors text-[11px] sm:text-xs">
            <span className="font-black text-amber-400">
              {shownDeceased?.fullName || 'Merhum'} {shownDeceased?.age ? `(${shownDeceased?.age})` : ''}
            </span>
            <span className="text-slate-500 mx-1.5">•</span>
            <span className="text-slate-300">
              Cenazesi {shownDeceased?.dateStr?.toLowerCase() || 'bugün'} {shownDeceased?.mosque}'nden {shownDeceased?.prayerTime?.toLowerCase() || 'namazı müteakip'} kaldırılacaktır.
            </span>
            {shownDeceased?.family && (
              <span className="text-slate-400 hidden lg:inline ml-1.5">
                ({shownDeceased?.family})
              </span>
            )}
          </div>
          ) : (
            <div className="truncate text-slate-400 text-[11px] sm:text-xs">Şu an yayında vefat ilanı yok</div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeDeceased.length > 1 && (
            <div className="flex items-center text-slate-400">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDeceasedIdx(prev => (prev > 0 ? prev - 1 : activeDeceased.length - 1));
                }}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Önceki Cenaze İlanı"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 select-none text-slate-400">
                {dIdx + 1}/{activeDeceased.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDeceasedIdx(prev => (prev < activeDeceased.length - 1 ? prev + 1 : 0));
                }}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Sonraki Cenaze İlanı"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowVefatModal(true)}
            className="text-[10px] sm:text-[11px] font-black text-amber-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Tümü ({deceasedList.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* EN ÜST SAĞ: CANLI YAYIN DÜĞMESİ */}
          <button
            onClick={() => setMutlularTvActive(true)}
            className={`px-2.5 py-1 rounded-lg text-white font-black text-[10px] sm:text-[11px] tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${liveConfig.aktif ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
            title="Mutlular TV Canlı Yayını İzle"
          >
            {liveConfig.aktif && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            <span>{liveConfig.aktif ? '📺 Canlı Yayın' : '📺 Yayın'}</span>
          </button>

          <button
            onClick={() => setShowNewDeceasedModal(true)}
            className="text-[10px] sm:text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2 py-1 rounded-lg transition-all inline-flex items-center gap-1"
            title="Cenaze / Taziye İlanı Bırak"
          >
            <PlusCircle className="w-3 h-3" /> İlan Bırak
          </button>
        </div>
      </div>
    </aside>
  );
}
