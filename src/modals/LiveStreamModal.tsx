// Pencere: LiveStreamModal (eski App.tsx 12375–12462)
import { X } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function LiveStreamModal() {
  const {
    setShowAdminPanelModal, mutlularTvActive, setMutlularTvActive, liveConfig, isUserAdmin,
    isUserEditor, liveEmbedUrl,
  } = useApp();
  return (
    <>
      {mutlularTvActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            onClick={() => setMutlularTvActive(false)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
          />

          <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {liveConfig.aktif ? (
                  <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    CANLI
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-200 font-black text-[11px] px-2.5 py-0.5 rounded-lg">KAPALI</span>
                )}
                <span className="font-black text-sm text-slate-100 tracking-tight">📺 Mutlular TV</span>
              </div>
              <button
                onClick={() => setMutlularTvActive(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {liveConfig.aktif && liveConfig.url ? (
              <>
                {liveEmbedUrl ? (
                  <div className="relative aspect-[16/9] w-full bg-black">
                    <iframe
                      src={liveEmbedUrl}
                      title={liveConfig.baslik || 'Mutlular TV Canlı Yayın'}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-slate-900 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="text-4xl">📡</div>
                    <p className="text-xs text-slate-300">Bu yayın uygulama içinde oynatılamıyor. Yayını yeni sekmede açabilirsiniz.</p>
                    <a
                      href={liveConfig.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black"
                    >
                      Yayını Aç ↗
                    </a>
                  </div>
                )}
                <div className="p-4 space-y-1.5 overflow-y-auto bg-slate-900/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">ŞU AN YAYINDA</span>
                  <h3 className="font-black text-base sm:text-lg text-white leading-snug">{liveConfig.baslik || 'Mutlular Mahallesi Canlı Yayını'}</h3>
                  {liveConfig.aciklama && <p className="text-xs text-slate-400 leading-relaxed">{liveConfig.aciklama}</p>}
                  {liveEmbedUrl && (
                    <a href={liveConfig.url} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] font-bold text-slate-400 hover:text-white underline pt-1">
                      Yayın oynatılmazsa yeni sekmede aç ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-900/60">
                <div className="text-5xl">📺</div>
                <h3 className="font-black text-base text-white">Şu an canlı yayın yok</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cenaze namazı, mahalle toplantısı veya özel bir etkinlik olduğunda yayın burada açılır. Yayın başladığında üstteki düğme kırmızı yanar.
                </p>
                {(isUserAdmin || isUserEditor) && (
                  <button
                    type="button"
                    onClick={() => { setMutlularTvActive(false); setShowAdminPanelModal(true); }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-white cursor-pointer border border-white/10"
                  >
                    Yayını Yönet
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
