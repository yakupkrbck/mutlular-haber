// Ana sayfa: Topluluk çağrısı. Düğmeler mevcut gerçek akışları açar (haber/ihbar gönderme, ücretsiz ilan verme).
import { Megaphone, Plus, Sparkles } from 'lucide-react';

export function HomeCommunityCTA({
  onOpenTipModal,
  onOpenNewListing,
}: {
  onOpenTipModal: () => void;
  onOpenNewListing: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 sm:p-8 shadow-xl border border-orange-500">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mahallemiz birlikte daha güçlü</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Mahallenizde bir olay mı var? Haber yapalım!</h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
            Su kesintisinden çevre düzenlemesine, kayıp eşyadan yeni açılan dükkânlara kadar her gelişmeyi komşularınızla paylaşabilirsiniz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenTipModal}
            className="px-5 py-3 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Haber / İhbar Gönder</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewListing}
            className="px-5 py-3 rounded-2xl bg-slate-950/40 hover:bg-slate-950/70 border border-white/30 font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ücretsiz İlan Ver</span>
          </button>
        </div>
      </div>
    </section>
  );
}
