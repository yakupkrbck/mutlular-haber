// Pencere: ArtisanRegisterModal (eski App.tsx 10776–11111)
import { ESNAF_TURLERI } from '../serviceMatching';
import { Store, X, User as UserIcon, Phone, MapPin, Clock, Tag, Coins } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function ArtisanRegisterModal() {
  const {
    user, profile, artisanKind, setArtisanKind, artisanCustomArea, setArtisanCustomArea,
    ALL_SERVICE_CATEGORIES, showArtisanRegisterModal, setShowArtisanRegisterModal,
    artisanBusinessName, setArtisanBusinessName, artisanCategory, setArtisanCategory,
    artisanAddress, setArtisanAddress, artisanWorkingHours, setArtisanWorkingHours, artisanTags,
    artisanTagInput, setArtisanTagInput, artisanPhone, setArtisanPhone, artisanDescription,
    setArtisanDescription, artisanRegisterEmail, setArtisanRegisterEmail, artisanRegisterPassword,
    setArtisanRegisterPassword, artisanRegisterName, setArtisanRegisterName, artisanIsSubmitting,
    handleAddArtisanTag, handleRemoveArtisanTag, handleSubmitArtisanOnboarding, renderAreaSelect,
  } = useApp();
  return (
    <>
      {showArtisanRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl shadow-xs">
                  <Store className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{artisanKind === 'usta' ? 'Usta Olarak Katıl' : 'Esnaf Olarak Katıl'}</h3>
                  <p className="text-xs text-slate-500">{artisanKind === 'usta' ? 'Faaliyet alanınızı seçin, komşuların taleplerine teklif verin.' : 'İşletmenizi mahalle esnaf rehberine ekleyin, kampanyalarınızı yayınlayın.'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowArtisanRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitArtisanOnboarding} className="space-y-4">
              {/* Usta / Esnaf ayrımı */}
              <div className="grid grid-cols-2 gap-2">
                {([
                  { k: 'usta', icon: '🛠️', title: 'Usta', sub: 'Hizmet veriyorum, teklif sunacağım' },
                  { k: 'esnaf', icon: '🏪', title: 'Esnaf', sub: 'Dükkanım / işletmem var' }
                ] as const).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => {
                      setArtisanKind(opt.k);
                      setArtisanCategory(opt.k === 'usta' ? ALL_SERVICE_CATEGORIES[0].name : ESNAF_TURLERI[0]);
                      setArtisanCustomArea('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      artisanKind === opt.k
                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block">{opt.icon}</span>
                    <span className="font-black text-xs text-slate-900 block">{opt.title}</span>
                    <span className="text-[10px] text-slate-500 leading-tight block">{opt.sub}</span>
                  </button>
                ))}
              </div>

              {/* Giriş Durumu Bilgisi */}
              {user && profile ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-blue-500 block uppercase">Mevcut Hesap Yükseltiliyor</span>
                    <span className="text-xs font-bold text-blue-900 truncate block">
                      {profile.name} ({profile.email})
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full">
                    Aktif Oturum
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-amber-950 block">Yetkili / Hesap Bilgileri (Kayıt Ol)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        required
                        value={artisanRegisterName}
                        onChange={(e) => setArtisanRegisterName(e.target.value)}
                        placeholder="Örn: Ahmet Usta"
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">E-posta</label>
                      <input
                        type="email"
                        required
                        value={artisanRegisterEmail}
                        onChange={(e) => setArtisanRegisterEmail(e.target.value)}
                        placeholder="usta@dijitalmutlular.com"
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">Hesap Şifresi (En az 6 hane)</label>
                      <input
                        type="password"
                        required
                        value={artisanRegisterPassword}
                        onChange={(e) => setArtisanRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* İşletme / Dükkan Bilgileri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dükkan / İşletme Adı */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {artisanKind === 'usta' ? 'Usta / Firma Adı' : 'İşletme / Dükkan Ünvanı'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={artisanBusinessName}
                    onChange={(e) => setArtisanBusinessName(e.target.value)}
                    placeholder="Örn: Mutlular Su Tesisatı &amp; Kombi Servisi"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                {/* Faaliyet alanı (usta) / İşletme türü (esnaf) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {artisanKind === 'usta' ? 'Faaliyet / Hizmet Alanı' : 'İşletme Türü'} <span className="text-red-500">*</span>
                  </label>
                  {renderAreaSelect(artisanKind, artisanCategory, setArtisanCategory, artisanCustomArea, setArtisanCustomArea)}
                </div>

                {/* Telefon & WhatsApp */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Telefon / WhatsApp Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={artisanPhone}
                      onChange={(e) => setArtisanPhone(e.target.value)}
                      placeholder="05xx xxx xx xx"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                {/* İşletme Adresi */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {artisanKind === 'usta' ? 'Çalışma Bölgesi / Adres' : 'İşletme Adresi'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={artisanAddress}
                      onChange={(e) => setArtisanAddress(e.target.value)}
                      placeholder="Örn: Mutlular Mah. Fatih Cad. No: 14/A, Yıldırım / Bursa"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Çalışma Saatleri */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Çalışma Saatleri</span>
                    <span className="text-[10px] text-slate-400 font-normal">Hızlı şablon seçebilir veya yazabilirsiniz</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={artisanWorkingHours}
                      onChange={(e) => setArtisanWorkingHours(e.target.value)}
                      placeholder="Örn: Pazartesi - Cumartesi: 08:30 - 19:30"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      'Pazartesi - Cumartesi: 08:30 - 19:30',
                      '7/24 Acil & Nöbetçi Hizmet',
                      'Hafta İçi: 09:00 - 18:00 (Pazar Kapalı)',
                      'Her Gün: 08:00 - 22:00'
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setArtisanWorkingHours(preset)}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 px-2 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uzmanlık Etiketleri (yalnızca usta) */}
                {artisanKind === 'usta' && (
                <div className="sm:col-span-2 space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>Uzmanlık Etiketleri &amp; Hizmet Vurguları</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Komşuların aramalarda sizi bulmasını sağlar</span>
                  </label>

                  {/* Ekli Etiketler */}
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {artisanTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-200"
                      >
                        <span>✓ {tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArtisanTag(tag)}
                          className="text-amber-700 hover:text-red-700 ml-0.5 cursor-pointer font-black"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Etiket Ekleme Inputu */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={artisanTagInput}
                      onChange={(e) => setArtisanTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddArtisanTag();
                        }
                      }}
                      placeholder="Yeni uzmanlık etiketi yazıp ekleyin..."
                      className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddArtisanTag()}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Ekle
                    </button>
                  </div>

                  {/* Hazır Örnek Etiketler */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      'Garantili İşçilik',
                      '7/24 Acil Usta',
                      'Kırmadan Kaçak Tespiti',
                      'Ücretsiz Keşif',
                      'Kredi Kartı Geçerli',
                      'Fatura / Fiş Kesilir',
                      'Orijinal Yedek Parça',
                      'Aynı Gün Teslimat'
                    ].map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddArtisanTag(sug)}
                        className="text-[10px] font-semibold bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                {/* İşletme Tanıtım Açıklaması */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    İşletme Tanıtımı &amp; Mahalleliye Not
                  </label>
                  <textarea
                    rows={2}
                    value={artisanDescription}
                    onChange={(e) => setArtisanDescription(e.target.value)}
                    placeholder="Sunduğunuz hizmetler, deneyiminiz ve mahalleliye vaatleriniz..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Hediye Kredi Kutusu */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                    🎁
                  </div>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm">{artisanKind === 'usta' ? '10 Ücretsiz Teklif Kredisi Hediye!' : 'Esnaf Hesabı Ücretsiz'}</h5>
                    <p className="text-[11px] text-amber-100 mt-0.5">
                      {artisanKind === 'usta'
                        ? 'Usta hesabınız açıldığında alanınızdaki taleplere teklif verebilmeniz için 10 kredi cüzdanınıza tanımlanır.'
                        : 'Esnaf hesabınızla kampanyalarınızı yayınlayabilir ve mağaza sayfanızı yönetebilirsiniz.'}
                    </p>
                  </div>
                </div>
                <Coins className="w-8 h-8 text-amber-200 shrink-0 opacity-80" />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowArtisanRegisterModal(false)}
                  className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={artisanIsSubmitting}
                  className="flex-[2] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <Store className="w-4 h-4 text-white" />
                  <span>{artisanIsSubmitting ? 'Kaydediliyor...' : 'Esnaf Hesabına Dönüştür & Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
