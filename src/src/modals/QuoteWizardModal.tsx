// Pencere: QuoteWizardModal (eski App.tsx 11922–12226)
import { X, ArrowRight, MapPin, Phone } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function QuoteWizardModal() {
  const {
    profile, setActiveTab, ALL_SERVICE_CATEGORIES, showArmutWizard, setShowArmutWizard, armutStep,
    setArmutStep, armutSelectedCat, setArmutSelectedCat, armutSelectedSub, setArmutSelectedSub,
    armutTiming, setArmutTiming, armutPhoto, setArmutPhoto, armutDetail, setArmutDetail,
    armutAddress, setArmutAddress, armutPhone, setArmutPhone, setServiceViewMode, showToast,
    createServiceRequest,
  } = useApp();
  return (
    <>
      {showArmutWizard && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-300 space-y-4">
            {/* Yeşil Başlık Barı */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-white/20 rounded-2xl text-2xl">🛠️</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">3 Kolay Soruda Ücretsiz Fiyat Teklifi Al</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">Mahallenin Onaylı Ustalarından Hızlı Teklif Al</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowArmutWizard(false);
                  setArmutStep(1);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Adım Göstergesi */}
            <div className="px-5 pt-1">
              <div className="flex items-center justify-between text-xs font-black text-slate-600 mb-2">
                <span className={armutStep >= 1 ? 'text-emerald-700' : ''}>1. Hizmet Seç</span>
                <span>→</span>
                <span className={armutStep >= 2 ? 'text-emerald-700' : ''}>2. İş Detayları</span>
                <span>→</span>
                <span className={armutStep >= 3 ? 'text-emerald-700' : ''}>3. İletişim &amp; Teklif Topla</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(armutStep / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* ADIM 1: HANGİ HİZMETE İHTİYACINIZ VAR? */}
              {armutStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900">1. Soru: Hangi hizmete ihtiyacınız var?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Mahallemizde hizmet veren 18 usta sektöründen birini seçin:</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {ALL_SERVICE_CATEGORIES.map((cat) => {
                      const isSelected = armutSelectedCat === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setArmutSelectedCat(cat.name);
                            if (cat.subCategories.length > 0) {
                              setArmutSelectedSub(cat.subCategories[0].name);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500'
                              : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <span className="font-black text-xs block leading-tight">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{cat.subCategories.length} Alt Hizmet</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Seçilen Kategorinin Alt Hizmetleri */}
                  {ALL_SERVICE_CATEGORIES.find(c => c.name === armutSelectedCat) && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Spesifik Alt Hizmet / İhtiyaç:
                      </label>
                      <select
                        value={armutSelectedSub}
                        onChange={(e) => setArmutSelectedSub(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
                      >
                        {ALL_SERVICE_CATEGORIES.find(c => c.name === armutSelectedCat)?.subCategories.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.icon} {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setArmutStep(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Devam Et: İş Detayları</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ADIM 2: İŞ DETAYLARI & NE ZAMAN YAPILSIN? */}
              {armutStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900">2. Soru: Hizmet ne zaman ve nasıl yapılsın?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Ustaların size en doğru fiyatı verebilmesi için detayları girin:</p>
                  </div>

                  {/* Ne Zaman Yapılsın? */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      İş Ne Zaman Yapılsın? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '🚨 Hemen / Bugün Acil',
                        '📅 Bu Hafta İçi',
                        '🗓️ Önümüzdeki 1-2 Hafta',
                        '🔎 Sadece Fiyat Araştırıyorum'
                      ].map((tm, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setArmutTiming(tm)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            armutTiming === tm
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {tm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* İhtiyacın Açıklaması */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      İhtiyacınızı Kısaca Tarif Edin <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={armutDetail}
                      onChange={(e) => setArmutDetail(e.target.value)}
                      placeholder="Örn: Banyoda lavabo altından su sızıyor, kırmadan cihazla kaçak tespiti ve tamir teklifi istiyorum..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 leading-relaxed font-medium"
                    />
                  </div>

                  {/* Fotoğraf (opsiyonel, gerçek yükleme) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Fotoğraf (Opsiyonel)</label>
                    <PhotoUploadField value={armutPhoto} onChange={setArmutPhoto} folder="mutlular_haber/talepler" buttonLabel="Fotoğraf Yükle" accentClass="bg-emerald-600 hover:bg-emerald-700 text-white" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setArmutStep(1)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!armutDetail.trim()) {
                          showToast('Lütfen ihtiyacınızı kısaca tarif ediniz.', true);
                          return;
                        }
                        setArmutStep(3);
                      }}
                      className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Devam Et: İletişim Bilgileri</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ADIM 3: İLETİŞİM & TEKLİFLERİ TOPLA */}
              {armutStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900">3. Soru: Teklifler nereye ve kime iletilsin?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Ustalar sadece teklif vermek için bu bilgileri kullanır:</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Mahalle / Sokak Adresi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={armutAddress}
                        onChange={(e) => setArmutAddress(e.target.value)}
                        placeholder="Örn: Mutlular Mah. Çınar Sokak No: 12"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Telefon Numarası (WhatsApp Teklif Bildirimi) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={armutPhone || profile?.telefon || ''}
                        onChange={(e) => setArmutPhone(e.target.value)}
                        placeholder="05xx xxx xx xx"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                      />
                    </div>
                  </div>

                  {/* Mahalle Hizmet Güvencesi */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
                    <span className="text-xl shrink-0">🛡️</span>
                    <div>
                      <strong className="block font-black text-emerald-900">Mahalle Hizmet Güvencesi:</strong>
                      Talebiniz mahalledeki onaylı ustalara anında iletilir. En kısa sürede ustalar teklif sunmaya başlar. Teklifleri kıyaslayıp en uygun ustayı seçebilirsiniz.
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setArmutStep(2)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const newId = await createServiceRequest({
                          baslik: `${armutSelectedSub} (${armutTiming})`,
                          aciklama: armutDetail.trim() || `${armutSelectedCat} alanında hizmete ihtiyacım var.`,
                          kategori: armutSelectedCat,
                          altKategori: armutSelectedSub,
                          adres: armutAddress,
                          telefon: armutPhone,
                          urgent: armutTiming.toLowerCase().includes('hemen') || armutTiming.toLowerCase().includes('acil'),
      fotolar: armutPhoto ? [armutPhoto] : []
                        });
                        if (!newId) return;

                        setArmutStep(4);
                        showToast('Hizmet talebiniz oluşturuldu! Uygun ustalara bildirim gitti. 👍');
                      }}
                      className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ücretsiz Teklifleri Topla</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ADIM 4: BAŞARI VE ONAY EKRANI */}
              {armutStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl shadow-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-900">Talebiniz Başarıyla Yayınlandı!</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      <strong>{armutSelectedCat}</strong> ({armutSelectedSub}) talebiniz mahalledeki onaylı ustalara iletildi. Teklifler hazır olduğunda sizi bilgilendireceğiz.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowArmutWizard(false);
                      setArmutStep(1);
                      setActiveTab('services');
                      setServiceViewMode('requests');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    Talepleri ve Teklifleri İncele →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
