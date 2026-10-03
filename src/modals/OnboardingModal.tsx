// Pencere: OnboardingModal (eski App.tsx 12495–12663)
import { ESNAF_TURLERI } from '../serviceMatching';
import { useApp } from '../app/AppContext';

export function OnboardingModal() {
  const {
    showOnboarding, obRole, setObRole, obAd, setObAd, obSoyad, setObSoyad, obPhone, setObPhone,
    obIsyeri, setObIsyeri, obArea, setObArea, obCustomArea, setObCustomArea, obAdres, setObAdres,
    obSaving, ALL_SERVICE_CATEGORIES, handleCompleteOnboarding, handleCancelOnboarding,
    renderAreaSelect,
  } = useApp();
  return (
    <>
      {showOnboarding && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <form
            onSubmit={handleCompleteOnboarding}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col z-10"
          >
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <h3 className="font-serif font-black text-xl text-slate-900">Hesabını Tamamla</h3>
              <p className="text-xs text-slate-500 mt-0.5">Giriş yaptın. Birkaç bilgi ile hesabını açalım.</p>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Rol */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Hesap türü</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { k: 'sakin', icon: '🏡', title: 'Mahalleli', sub: 'Haber, ilan, talep' },
                    { k: 'usta', icon: '🛠️', title: 'Usta', sub: 'Hizmet verir' },
                    { k: 'esnaf', icon: '🏪', title: 'Esnaf', sub: 'Dükkanı var' }
                  ] as const).map((opt) => (
                    <button
                      key={opt.k}
                      type="button"
                      onClick={() => {
                        setObRole(opt.k);
                        setObArea(opt.k === 'usta' ? ALL_SERVICE_CATEGORIES[0].name : opt.k === 'esnaf' ? ESNAF_TURLERI[0] : '');
                        setObCustomArea('');
                      }}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        obRole === opt.k
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl block">{opt.icon}</span>
                      <span className="font-black text-xs text-slate-900 block">{opt.title}</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Herkes: ad, soyad, telefon */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Ad <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    value={obAd}
                    onChange={(e) => setObAd(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Soyad <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    value={obSoyad}
                    onChange={(e) => setObSoyad(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Telefon <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  value={obPhone}
                  onChange={(e) => setObPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Usta */}
              {obRole === 'usta' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-amber-900">🛠️ Usta bilgileri</div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Usta / Firma Adı <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={obIsyeri}
                      onChange={(e) => setObIsyeri(e.target.value)}
                      placeholder="Örn: Hasan Usta Tesisat"
                      className="w-full text-sm p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Faaliyet / Hizmet Alanı <span className="text-red-500">*</span></label>
                    {renderAreaSelect('usta', obArea || ALL_SERVICE_CATEGORIES[0].name, setObArea, obCustomArea, setObCustomArea)}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Çalışma Bölgesi / Adres <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={obAdres}
                      onChange={(e) => setObAdres(e.target.value)}
                      className="w-full text-sm p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="text-[11px] text-amber-950 bg-amber-100 border border-amber-300 rounded-xl p-2.5">
                    🎁 Hesabınıza <strong>10 ücretsiz teklif kredisi</strong> tanımlanır.
                  </div>
                </div>
              )}

              {/* Esnaf */}
              {obRole === 'esnaf' && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-emerald-900">🏪 İşletme bilgileri</div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">İşletme / Dükkan Ünvanı <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={obIsyeri}
                      onChange={(e) => setObIsyeri(e.target.value)}
                      placeholder="Örn: Mutlular Fırın & Pastane"
                      className="w-full text-sm p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">İşletme Türü <span className="text-red-500">*</span></label>
                    {renderAreaSelect('esnaf', obArea || ESNAF_TURLERI[0], setObArea, obCustomArea, setObCustomArea)}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">İşletme Adresi <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={obAdres}
                      onChange={(e) => setObAdres(e.target.value)}
                      className="w-full text-sm p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 space-y-2">
              <button
                type="submit"
                disabled={obSaving}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-black text-sm py-3 rounded-2xl transition-all cursor-pointer"
              >
                {obSaving ? 'Kaydediliyor…' : 'Hesabımı Oluştur'}
              </button>
              <button
                type="button"
                onClick={handleCancelOnboarding}
                disabled={obSaving}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 cursor-pointer"
              >
                Vazgeç ve çıkış yap
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
