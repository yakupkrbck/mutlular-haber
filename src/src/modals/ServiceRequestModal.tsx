// Pencere: ServiceRequestModal (eski App.tsx 9823–10035)
import { X, Wrench } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function ServiceRequestModal() {
  const {
    profile, ALL_SERVICE_CATEGORIES, modalMainCatId, setModalMainCatId, modalSubCatName,
    setModalSubCatName, selectedServiceSector, setSelectedServiceSector, newServiceReqTitle,
    setNewServiceReqTitle, newServiceReqDesc, setNewServiceReqDesc, newServiceReqAddress,
    setNewServiceReqAddress, newServiceReqPhone, setNewServiceReqPhone, newServiceReqUrgent,
    setNewServiceReqUrgent, newServiceReqPhoto, setNewServiceReqPhoto, showServiceModal,
    setShowServiceModal, showToast, createServiceRequest,
  } = useApp();
  return (
    <>
      {showServiceModal && (() => {
        const activeMainCat = ALL_SERVICE_CATEGORIES.find(c => c.id === modalMainCatId) || 
          ALL_SERVICE_CATEGORIES.find(c => c.name === selectedServiceSector) || 
          ALL_SERVICE_CATEGORIES[0];
        
        const activeSubCat = activeMainCat.subCategories.find(s => s.name === modalSubCatName) || 
          activeMainCat.subCategories[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-2xl shrink-0">
                    {activeSubCat?.icon || activeMainCat?.icon || '🛠️'}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Usta &amp; Hizmet Talebi Aç</h3>
                    <p className="text-xs text-slate-500">Ana ve alt kategori seçin, mahalle esnafından teklif alın.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowServiceModal(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const newId = await createServiceRequest({
                    baslik: newServiceReqTitle.trim() || `${modalSubCatName || activeMainCat?.name} Talebi`,
                    aciklama: newServiceReqDesc.trim(),
                    kategori: activeMainCat?.name || selectedServiceSector,
                    altKategori: modalSubCatName || activeSubCat?.name,
                    adres: newServiceReqAddress,
                    telefon: newServiceReqPhone,
                    urgent: newServiceReqUrgent,
                    fotolar: newServiceReqPhoto ? [newServiceReqPhoto] : []
                  });
                  if (!newId) return;

                  setShowServiceModal(false);
                  setNewServiceReqTitle('');
                  setNewServiceReqDesc('');
                  setNewServiceReqPhoto('');
                  setNewServiceReqUrgent(false);
                  showToast(`${activeMainCat?.name} (${modalSubCatName}) talebiniz yayınlandı! Uygun ustalara bildirim gitti 🛠️`);
                }}
                className="space-y-4"
              >
                {/* 1. ANA KATEGORİ SEÇİMİ */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    1. Ana Kategori <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={modalMainCatId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setModalMainCatId(newCatId);
                      const cat = ALL_SERVICE_CATEGORIES.find(c => c.id === newCatId);
                      if (cat) {
                        setSelectedServiceSector(cat.name);
                        if (cat.subCategories.length > 0) {
                          setModalSubCatName(cat.subCategories[0].name);
                        }
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                  >
                    {ALL_SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({cat.subCategories.length} Alt Kategori)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. ALT KATEGORİ SEÇİMİ */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    2. Alt Kategori (Hizmet / İhtiyaç Türü) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={modalSubCatName}
                    onChange={(e) => setModalSubCatName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                  >
                    {activeMainCat?.subCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.icon} {sub.name} {sub.badge ? `(${sub.badge})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alt Kategoriye Özel Hazır Öneriler */}
                {activeSubCat && activeSubCat.sampleRequests.length > 0 && (
                  <div className="space-y-1.5 p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-rose-950 flex items-center gap-1">
                      <span>💡</span> <strong>{activeSubCat.name}</strong> İçin Hızlı Seçim (Tıklayınca Başlığa Yazar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSubCat.sampleRequests.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewServiceReqTitle(t)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            newServiceReqTitle === t
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Talep Başlığı */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Talep / Arıza Başlığı <span className="text-orange-600">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newServiceReqTitle}
                    onChange={(e) => setNewServiceReqTitle(e.target.value)}
                    placeholder="Örn: Banyo bataryası su kaçırıyor"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                {/* Açık Adres ve Telefon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Açık Adres / Sokak <span className="text-orange-600">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={newServiceReqAddress}
                      onChange={(e) => setNewServiceReqAddress(e.target.value)}
                      placeholder="Örn: Menekşe Sokak No: 12"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      İletişim Telefonu (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={newServiceReqPhone}
                      onChange={(e) => setNewServiceReqPhone(e.target.value)}
                      placeholder={profile?.telefon || '05xx xxx xx xx'}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                {/* İhtiyacın Detayı */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    İhtiyacın Detayı &amp; Açıklama <span className="text-orange-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newServiceReqDesc}
                    onChange={(e) => setNewServiceReqDesc(e.target.value)}
                    placeholder="Arızanın boyutu, ne zaman müsait olduğunuz, malzemenin sizde olup olmadığı..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Acil Durum Anahtarı */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚨</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Acil Müdahale Gerekiyor</span>
                      <span className="text-[10px] text-slate-500 block">Ustalara acil çağrı olarak iletilir (ör: su basması, kilitli kalma)</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newServiceReqUrgent}
                    onChange={(e) => setNewServiceReqUrgent(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded-md focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Hizmet Talebini Yayınla &amp; Teklif Al</span>
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </>
  );
}
