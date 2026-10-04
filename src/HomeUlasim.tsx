// Ana sayfa: Burulaş ulaşım şeridi.
// Canlı otobüs konumu / varış süreleri için herkese açık, belgeli bir Burulaş veri hizmeti (API) bulunmadığından,
// uydurma süre göstermek yerine resmi "Otobüsüm Nerede" (BursaKart) sayfasına yönlendirir.
// Mahalleden geçen hatlar siteConfig.LOCAL_BUS_LINES içinde doğrulanmış olarak tanımlanırsa çip olarak gösterilir.
import { ArrowRight, Bus, ExternalLink } from 'lucide-react';
import { BURULAS_LIVE_URL, BURULAS_SITE_URL, LOCAL_BUS_LINES, NEIGHBORHOOD_NAME } from './siteConfig';

export function HomeUlasimStrip() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-500/50 shadow-md p-3 sm:p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <Bus className="w-4.5 h-4.5 stroke-[2.3]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-black tracking-tight uppercase leading-tight">Burulaş · Otobüs bilgisi</h2>
          <p className="text-[11px] text-slate-300 leading-snug">
            Canlı otobüs konumu ve duraklara varış süreleri resmi BursaKart sayfasında. {NEIGHBORHOOD_NAME} duraklarınızı orada seçebilirsiniz.
          </p>
        </div>
      </div>

      {LOCAL_BUS_LINES.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 [scrollbar-width:none]" aria-label="Mahalleden geçen hatlar">
          {LOCAL_BUS_LINES.map((l) => (
            <span
              key={l.code}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs shrink-0"
              title={l.name}
            >
              <span className="font-black px-1.5 rounded-md bg-blue-600 text-white text-[10px]">{l.code}</span>
              <span className="text-[11px] text-slate-200 truncate max-w-[130px]">{l.name}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={BURULAS_LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <span>Otobüsüm Nerede</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <a
          href={BURULAS_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Hat saatleri</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
