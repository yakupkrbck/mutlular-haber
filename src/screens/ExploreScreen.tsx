// Ekran: ExploreScreen (eski App.tsx 8359–8403)
import { Compass, Wrench, Megaphone, Store, ShoppingBag, Search, Newspaper } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function ExploreScreen() {
  const {
    activeTab, setActiveTab, polls, businesses, isPollOpen,
  } = useApp();
  return (
    <>
      {activeTab === 'explore' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-6 h-6 text-red-600" />
              <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Mahalle Pusulası &amp; Keşfet
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Mutlular mahallesindeki her noktaya tek dokunuşla ulaşın.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { title: 'MUTLULAR HİZMET', icon: Wrench, count: '18 Sektör', tab: 'services', color: 'bg-orange-50 text-orange-600' },
              { title: 'Mahalle Meclisi', icon: Megaphone, count: `${polls.filter((p) => isPollOpen(p)).length} Anket`, tab: 'meclis', color: 'bg-blue-50 text-blue-600' },
              { title: 'Esnaf & Dükkanlar', icon: Store, count: `${businesses.length} Kayıt`, tab: 'esnaf', color: 'bg-emerald-50 text-emerald-600' },
              { title: 'MUTLULAR ALIM SATIM', icon: ShoppingBag, count: '12 İlan', tab: 'market', color: 'bg-amber-50 text-amber-600' },
              { title: 'Kayıp & Buluntu', icon: Search, count: '2 Kayıp', tab: 'lostfound', color: 'bg-purple-50 text-purple-600' },
              { title: 'MUTLULAR HABER', icon: Newspaper, count: '16 Haber', tab: 'news', color: 'bg-red-50 text-red-600' }
            ].map((item, idx) => {
              const IconC = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(item.tab as any)}
                  className="p-4 bg-white rounded-3xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <IconC className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
