// Ana sayfa: Burulaş ulaşım şeridi.
// Canlı otobüs konumu / varış süreleri için herkese açık, belgeli bir Burulaş veri hizmeti (API) bulunmadığından,
// uydurma süre göstermek yerine resmi "Otobüsüm Nerede" (BursaKart) sayfasına yönlendirir.
// Mahalleden ve yakınındaki duraktan geçen hatlar siteConfig.LOCAL_BUS_GROUPS içindeki gerçek bilgilerdir.
import { useState } from 'react';
import { ArrowRight, Bus, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { BURULAS_LIVE_URL, BURULAS_SITE_URL, LOCAL_BUS_GROUPS, type BusLineGroup } from './siteConfig';

function GroupBlock({ group }: { group: BusLineGroup }) {
  const [open, setOpen] = useState(false);

  if (group.collapsible) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
        >
          <span className="min-w-0">
            <span className="block text-[11px] sm:text-xs font-bold text-slate-100 leading-snug">{group.title}</span>
            <span className="block text-[10px] text-slate-400">{group.lines.length} hat</span>
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-300 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />}
        </button>
        {open && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 px-3 pb-3">
            {group.lines.map((l) => (
              <li key={l.code} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 min-w-0">
                <span className="font-black px-1.5 rounded-md bg-blue-600 text-white text-[10px] shrink-0">{l.code}</span>
                {l.name && <span className="text-[11px] text-slate-200 truncate">{l.name}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{group.title}</div>
      <div className="flex flex-wrap gap-2">
        {group.lines.map((l) => (
          <span
            key={l.code}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-400/40 bg-blue-500/15 text-sm"
            title={l.name}
          >
            <span className="font-black text-white">{l.code}</span>
            {l.name && <span className="text-[11px] text-slate-200">{l.name}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomeUlasimStrip() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-500/50 shadow-md p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bus className="w-4.5 h-4.5 stroke-[2.3]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black tracking-tight uppercase leading-tight">Burulaş · Mahalle otobüsleri</h2>
            <p className="text-[11px] text-slate-300 leading-snug">
              Canlı otobüs konumu ve duraklara varış süreleri için resmi BursaKart sayfasını kullanın.
            </p>
          </div>
        </div>
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
      </div>

      {LOCAL_BUS_GROUPS.length > 0 && (
        <div className="space-y-2.5 pt-1 border-t border-white/10">
          {LOCAL_BUS_GROUPS.map((g) => (
            <GroupBlock key={g.title} group={g} />
          ))}
        </div>
      )}
    </section>
  );
}
