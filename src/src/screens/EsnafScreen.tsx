// Ekran: EsnafScreen (eski App.tsx 8147–8260)
import { Store, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function EsnafScreen() {
  const {
    user, activeTab, esnafCategoryFilter, setEsnafCategoryFilter, isEsnafAccount, businesses,
    setShowBusinessEditor, trackBusinessEvent, openBusiness, openWhatsApp, openDialer,
    handleOpenArtisanOnboarding,
  } = useApp();
  return (
    <>
      {activeTab === 'esnaf' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  Mahalle Esnafı &amp; Dükkan Rehberi
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mutlular mahallemizin onaylı fırınları, bakkalları ve yerel dükkanları.
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
              <Store className="w-3.5 h-3.5" /> {businesses.length} Onaylı İşletme
            </div>
          </div>

          {/* Kategori filtresi: yalnızca gerçekten var olan işletme türleri */}
          {(() => {
            const cats: string[] = Array.from(new Set<string>(businesses.map((b) => b.kategori))).sort((x: string, y: string) => x.localeCompare(y, 'tr'));
            const filter = esnafCategoryFilter === 'tumu' || cats.includes(esnafCategoryFilter) ? esnafCategoryFilter : 'tumu';
            const shown = businesses.filter((b) => filter === 'tumu' || b.kategori === filter);
            return (
              <>
                {cats.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {['tumu', ...cats].map((c) => (
                      <button
                        key={c}
                        onClick={() => setEsnafCategoryFilter(c)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                            filter === c ? 'bg-slate-900 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                          }`}
                      >
                        {c === 'tumu' ? 'Tüm Esnaflar' : c}
                      </button>
                    ))}
                  </div>
                )}

                {shown.length === 0 && (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3">
                    <div className="text-4xl">🏪</div>
                    <h4 className="font-black text-base text-slate-900">Rehberde henüz onaylı işletme yok</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Mahalle esnafı işletme sayfasını oluşturup onay aldıkça burada listelenecek.
                    </p>
                    {isEsnafAccount && (
                      <button type="button" onClick={() => setShowBusinessEditor(true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer">
                        🏪 İşletme Sayfamı Oluştur
                      </button>
                    )}
                    {!user && (
                      <button type="button" onClick={() => handleOpenArtisanOnboarding('esnaf')} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer">
                        Esnaf Olarak Kayıt Ol
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {shown.map((b) => (
                    <div key={b.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                      <button type="button" onClick={() => openBusiness(b)} className="text-left cursor-pointer">
                        {b.fotolar && b.fotolar[0] ? (
                          <img src={b.fotolar[0]} alt="" className="w-full h-36 object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-24 bg-emerald-50 flex items-center justify-center text-4xl">🏪</div>
                        )}
                        <div className="p-4 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {b.logoUrl && <img src={b.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />}
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{b.kategori}</span>
                              <h4 className="font-black text-sm text-slate-900 mt-1 truncate">{b.isyeri}</h4>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.aciklama}</p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{b.adres}</span>
                          </div>
                        </div>
                      </button>
                      <div className="px-4 pb-4 mt-auto flex gap-2">
                        <button onClick={() => openBusiness(b)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2 rounded-xl cursor-pointer">
                          Sayfayı Aç
                        </button>
                        <button
                          onClick={() => { trackBusinessEvent(b, 'whatsapp'); openWhatsApp(b.whatsapp || b.telefon, `Merhaba ${b.isyeri}, Mutlular Haber üzerinden yazıyorum.`); }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { trackBusinessEvent(b, 'call'); openDialer(b.telefon); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl cursor-pointer"
                          title="Ara"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}
