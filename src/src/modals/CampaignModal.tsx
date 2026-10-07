// Pencere: CampaignModal (eski App.tsx 11114–11300)
import { Store, X, MapPin, Phone } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function CampaignModal() {
  const {
    showCampaignModal, setShowCampaignModal, campIsyeri, setCampIsyeri, campKategori,
    setCampKategori, campBaslik, setCampBaslik, campAciklama, setCampAciklama, campIndirim,
    setCampIndirim, campRozet, setCampRozet, campAdres, setCampAdres, campTelefon, setCampTelefon,
    campGecerlilik, setCampGecerlilik, campFoto, setCampFoto, handlePublishCampaign,
  } = useApp();
  return (
    <>
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Store className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Mahalle Pazarı Kampanya / Reklam Yayınla</h3>
                  <p className="text-xs text-slate-500">Mahalle sakinlerine özel indirim ve fırsatlarınızı anında vitrine çıkarın.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCampaignModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishCampaign} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dükkan / İşletme Adı <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={campIsyeri}
                    onChange={(e) => setCampIsyeri(e.target.value)}
                    placeholder="Örn: Bereket Kasap & Izgara"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sektör / Kategori <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={campKategori}
                    onChange={(e) => setCampKategori(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Fırın & Unlu Mamül">🥖 Fırın &amp; Unlu Mamül</option>
                    <option value="Kasap & Et Ürünleri">🥩 Kasap &amp; Et Ürünleri</option>
                    <option value="Manav & Organik">🍎 Manav &amp; Organik</option>
                    <option value="Oto Bakım & Hizmet">🚗 Oto Bakım &amp; Hizmet</option>
                    <option value="Çiçek & Bahçe">💐 Çiçek &amp; Bahçe</option>
                    <option value="Kişisel Bakım & Kuaför">✂️ Kişisel Bakım &amp; Kuaför</option>
                    <option value="Bakkal & Şarküteri">🧀 Bakkal &amp; Şarküteri</option>
                    <option value="Kırtasiye & Tuhafiye">📚 Kırtasiye &amp; Tuhafiye</option>
                    <option value="Diğer Mahalle Dükkanı">🏪 Diğer Mahalle Dükkanı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kampanya Başlığı <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={campBaslik}
                  onChange={(e) => setCampBaslik(e.target.value)}
                  placeholder="Örn: 2 Kg Kuşbaşı Alana 1 Paket Kasap Köfte Hediye!"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    İndirim / Fırsat Oranı
                  </label>
                  <input
                    type="text"
                    value={campIndirim}
                    onChange={(e) => setCampIndirim(e.target.value)}
                    placeholder="Örn: %30 İNDİRİM veya 1 ALANA 1 BEDAVA"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rozet Türü
                  </label>
                  <select
                    value={campRozet}
                    onChange={(e) => setCampRozet(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="Günün Fırsatı">🔥 Günün Fırsatı</option>
                    <option value="Haftanın Yıldızı">⭐ Haftanın Yıldızı</option>
                    <option value="Akşam Fırsatı">🌙 Akşam Fırsatı</option>
                    <option value="Komşu İndirimi">🤝 Komşu İndirimi</option>
                    <option value="Açılışa Özel">🎉 Açılışa Özel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kampanya Açıklaması &amp; Şartlar <span className="text-amber-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={campAciklama}
                  onChange={(e) => setCampAciklama(e.target.value)}
                  placeholder="Kampanya şartları, ürün detayları ve mahalleliye özel avantajlar..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dükkan Adresi / Konumu
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={campAdres}
                      onChange={(e) => setCampAdres(e.target.value)}
                      placeholder="Örn: Mutlular Caddesi No: 18"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sipariş / WhatsApp Telefonu <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={campTelefon}
                      onChange={(e) => setCampTelefon(e.target.value)}
                      placeholder="05xx xxx xx xx"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Geçerlilik Süresi
                  </label>
                  <input
                    type="text"
                    value={campGecerlilik}
                    onChange={(e) => setCampGecerlilik(e.target.value)}
                    placeholder="Örn: Pazar Akşamına Kadar veya 30 Eylül"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Fotoğraf (İsteğe Bağlı)
                  </label>
                  <PhotoUploadField value={campFoto} onChange={setCampFoto} folder="mutlular_haber/kampanyalar" accentClass="bg-amber-600 hover:bg-amber-700 text-white" />
                  <p className="text-[10px] text-slate-400 mt-1">Fotoğraf yüklemezseniz dükkan görseli atanır.</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Store className="w-4 h-4" /> Kampanyayı Mahalle Pazarı'nda Yayınla
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
