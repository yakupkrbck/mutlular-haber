// Ekran: MeclisScreen (eski App.tsx 8013–8142)
import { PlusCircle } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function MeclisScreen() {
  const {
    user, setShowAdminPanelModal, activeTab, meclisFilter, setMeclisFilter, polls, myVotes,
    setAdminOpenTab, isRealStaff, isPollOpen, handleVotePoll,
  } = useApp();
  return (
    <>
      {activeTab === 'meclis' && (
        <div className="space-y-4">
          {/* Üst Bilgi Kartı */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">🏛️</span>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">Mahalle Meclisi &amp; Ortak Akıl</h2>
                <p className="text-xs text-slate-500">Mutlular sakinlerinin ortak kararları ve canlı anketler.</p>
              </div>
            </div>
            {isRealStaff && (
              <button
                onClick={() => {
                  setAdminOpenTab('polls');
                  setShowAdminPanelModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Anket Oluştur
              </button>
            )}
          </div>

          {/* Kategori Filtresi */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'tumu', label: 'Tüm Anketler' },
              { id: 'guncel', label: '🔥 Açık Oylamalar' },
              { id: 'ulasim', label: '🚲 Ulaşım & Yol' },
              { id: 'cevre', label: '🌳 Park & Çevre' },
              { id: 'sosyal', label: '🤝 Sosyal & Dayanışma' },
              { id: 'genel', label: '📋 Genel' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMeclisFilter(item.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    meclisFilter === item.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {(() => {
            const visible = polls.filter((poll) => {
              if (meclisFilter === 'tumu') return true;
              if (meclisFilter === 'guncel') return isPollOpen(poll);
              return poll.kategori === meclisFilter;
            });
            if (visible.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-2">
                  <div className="text-4xl">🗳️</div>
                  <h4 className="font-black text-base text-slate-900">Şu an gösterilecek anket yok</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">Yeni anketler yayınlandığında burada oy verebilirsiniz.</p>
                </div>
              );
            }
            const catLabel: Record<string, string> = { ulasim: 'Ulaşım & Yol', cevre: 'Park & Çevre', sosyal: 'Sosyal & Dayanışma', genel: 'Genel' };
            return (
              <div className="space-y-3.5">
                {visible.map((poll) => {
                  const open = isPollOpen(poll);
                  const mine = myVotes[poll.id];
                  const hasVoted = mine !== undefined;
                  const showResults = hasVoted || !open || isRealStaff;
                  return (
                    <div key={poll.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{catLabel[poll.kategori] || 'Genel'}</span>
                          <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">{poll.soru}</h3>
                        </div>
                        {open ? (
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Oylama Açık
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Kapandı</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {poll.secenekler.map((opt, i) => {
                          const count = poll.sayilar[i] || 0;
                          const pct = poll.toplam > 0 ? Math.round((count / poll.toplam) * 100) : 0;
                          const chosen = mine === i;
                          return (
                            <div key={i}>
                              {showResults ? (
                                <div>
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                                    <span>{chosen ? '✅ ' : ''}{opt} ({count} oy)</span>
                                    <span className={chosen ? 'text-blue-600' : 'text-slate-400'}>%{pct}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className={`${chosen ? 'bg-blue-600' : 'bg-slate-300'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleVotePoll(poll, i)}
                                  className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                                >
                                  {opt}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                        <span>Toplam <strong>{poll.toplam} komşu</strong> oy kullandı</span>
                        {poll.endsAtMs > 0 && <span>Bitiş: {new Date(poll.endsAtMs).toLocaleDateString('tr-TR')}</span>}
                        {!hasVoted && open && !user && <span className="font-bold text-blue-600">Oy vermek için giriş yapın</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
