// Ekran: PazarScreen (eski App.tsx 6326–6447)
import { Store, Percent, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function PazarScreen() {
  const {
    activeTab, campaignFilter, setCampaignFilter, campaigns, openWhatsApp, openDialer,
    filteredCampaigns,
  } = useApp();
  return (
    <>
      {activeTab === 'pazar' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Store className="w-6 h-6 text-white" />
                </span>
                <h2 className="font-black text-xl text-white">Mahalle Pazarı</h2>
              </div>
              <p className="text-xs text-white/95 max-w-xl leading-relaxed">
                Dükkan sahibi mahalle esnafımızın vitrini! Güncel kampanyalar, haftalık indirimler, hediye fırsatları ve mahalleliye özel avantajlar tek bir yerde.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <Store className="w-3.5 h-3.5" /> {campaigns.length} Aktif Fırsat
              </div>
            </div>
          </div>

          {/* Kategori Filtresi */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['tumu', 'Fırın & Unlu Mamül', 'Kasap & Et Ürünleri', 'Manav & Organik', 'Oto Bakım & Hizmet', 'Çiçek & Bahçe', 'Kişisel Bakım & Kuaför'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCampaignFilter(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                    campaignFilter === cat
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {cat === 'tumu' ? 'Tüm Kampanyalar' : cat}
              </button>
            ))}
          </div>

          {/* Kampanyalar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((camp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={camp.fotoUrl}
                      alt={camp.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" /> {camp.indirimOrani}
                      </span>
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
                        {camp.rozet}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-md">
                        {camp.kategori}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ⏱️ {camp.gecerlilikTarihi}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                      {camp.isyeriAdi}
                    </h3>

                    <h4 className="font-bold text-xs text-slate-800 leading-snug">
                      {camp.baslik}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {camp.aciklama}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{camp.adres}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => openWhatsApp(camp.telefon, `Merhaba ${camp.isyeriAdi}, Dijital Mutlular Mahalle Pazarı'ndaki "${camp.baslik}" kampanyanız hakkında bilgi almak istiyorum.`)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp ile Sipariş
                  </button>
                  <button
                    onClick={() => openDialer(camp.telefon)}
                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2.5 rounded-xl transition-all"
                    title="Dükkanı Ara"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-800 text-base">Bu kategoride henüz kampanya bulunmuyor</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Dükkan sahibiyseniz alttaki orta <strong>MH</strong> tuşuna basarak yeni bir kampanya veya indirim duyurusu ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
