// Ekran: LostFoundScreen (eski App.tsx 6452–6568)
import { Search, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function LostFoundScreen() {
  const {
    activeTab, lostFoundFilter, setLostFoundFilter, openWhatsApp, openDialer, filteredLostFound,
  } = useApp();
  return (
    <>
      {activeTab === 'lostfound' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                <h2 className="font-black text-base text-gray-900">Kayıp &amp; Buluntu Eşya / Evcil Hayvan</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Zaman kritik olduğu için moderasyon beklemeden anında mahallede yayına girer.
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
              <Search className="w-3.5 h-3.5" /> {filteredLostFound.length} Aktif İlan
            </div>
          </div>

          {/* Tür Filtresi */}
          <div className="flex gap-2">
            <button
              onClick={() => setLostFoundFilter('tumu')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'tumu' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setLostFoundFilter('kayip')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'kayip' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              🔍 Kaybettim
            </button>
            <button
              onClick={() => setLostFoundFilter('bulundu')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'bulundu' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              ✅ Buldum
            </button>
            <button
              onClick={() => setLostFoundFilter('acil')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'acil' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              🚨 Acil Olanlar
            </button>
          </div>

          {/* Kayıp İlanları Kartları */}
          <div className="space-y-3.5">
            {filteredLostFound.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3.5 transition-all ${
                    item.isCritical ? 'border-red-400 bg-red-50/20 ring-2 ring-red-100' : 'border-gray-200/80'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                        item.tur === 'kayip' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {item.tur === 'kayip' ? '🔍 KAYIP' : '✅ BULUNDU'}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                      {item.kategori}
                    </span>
                    {item.isCritical && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded-md animate-pulse">
                        ACİL BİLDİRİM
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">📍 {item.konum || 'Mutlular Mahallesi'}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {item.fotolar && item.fotolar[0] && (
                    <img src={item.fotolar[0]} alt={item.baslik} className="w-full sm:w-36 h-36 object-cover rounded-2xl border border-gray-200 shrink-0" />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-black text-sm text-gray-900">{item.baslik}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.aciklama}</p>
                    <div className="text-xs text-gray-500 pt-1">
                      İletişim Kişisi: <span className="font-bold text-gray-800">{item.iletisimKisi}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">⏱️ Anında Yayında (Post-moderation)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openWhatsApp(item.iletisimTelefon, `Merhaba, "${item.baslik}" ilanınız hakkında bilgi vermek istiyorum.`)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp ile Ulaş
                    </button>
                    <button
                      onClick={() => openDialer(item.iletisimTelefon)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl transition-all"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
