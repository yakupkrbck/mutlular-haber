// Pencere: AuthModal (eski App.tsx 10231–10574)
import { ESNAF_TURLERI } from '../serviceMatching';
import {
  X,
  AlertTriangle,
  Check,
  User as UserIcon,
  Mail,
  Phone,
  Wrench,
  Briefcase,
  Building2,
  Store,
  Home
} from 'lucide-react';
import { useApp } from '../app/AppContext';

export function AuthModal() {
  const {
    authCustomArea, setAuthCustomArea, ALL_SERVICE_CATEGORIES, showAuthModal, setShowAuthModal,
    authMode, setAuthMode, authRole, setAuthRole, authEmail, setAuthEmail, authPassword,
    setAuthPassword, authName, setAuthName, authPhone, setAuthPhone, authIsyeri, setAuthIsyeri,
    authEsnafKategori, setAuthEsnafKategori, authError, setAuthError, handleAuthSubmit,
    handleGoogleSignIn, renderAreaSelect,
  } = useApp();
  return (
    <>
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  {authMode === 'login' ? 'Mahalle Hesabına Giriş Yap' : 'Dijital Mutlular\'a Kayıt Ol'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {authMode === 'login' ? 'Komşularınıza ve mahalle hizmetlerine erişin' : 'Esnaf veya mahalle sakini olarak kaydınızı tamamlayın'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                }} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Giriş / Kayıt Geçiş Sekmesi */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 text-xs font-black py-2 rounded-xl transition-all ${
                  authMode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 text-xs font-black py-2 rounded-xl transition-all ${
                  authMode === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Yeni Kayıt
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {/* KAYIT MODUNDA: ESNAF MI SAKİN Mİ SEÇİMİ */}
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-700 block">
                    1. Mahalledeki Rolünüzü Seçin:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Sakin Seçeneği */}
                    <button
                      type="button"
                      onClick={() => setAuthRole('sakin')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative ${
                        authRole === 'sakin'
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-sm ring-1 ring-orange-500'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">🏡</span>
                        {authRole === 'sakin' && (
                          <span className="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Seçildi
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-gray-900">Mahalle Sakini</span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Hizmet iste, 2. el pazarında al-sat, haberleri takip et
                        </span>
                      </div>
                    </button>

                    {/* Usta Seçeneği */}
                    <button
                      type="button"
                      onClick={() => { setAuthRole('usta'); setAuthEsnafKategori(ALL_SERVICE_CATEGORIES[0].name); setAuthCustomArea(''); }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative ${
                        authRole === 'usta'
                          ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-sm ring-1 ring-amber-500'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">🛠️</span>
                        {authRole === 'usta' && (
                          <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Seçildi
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-gray-900">Usta</span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Tesisat, elektrik, tadilat gibi hizmet ver; taleplere teklif sun
                        </span>
                      </div>
                    </button>

                    {/* Esnaf Seçeneği */}
                    <button
                      type="button"
                      onClick={() => { setAuthRole('esnaf'); setAuthEsnafKategori(ESNAF_TURLERI[0]); setAuthCustomArea(''); }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative ${
                        authRole === 'esnaf'
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">🏪</span>
                        {authRole === 'esnaf' && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Seçildi
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-gray-900">Esnaf</span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Dükkanın veya işletmen var; kampanya yayınla, mağaza sayfan olsun
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Ad Soyad (Sadece Kayıtta) */}
              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Ad Soyad <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* E-posta (İmail) Bilgisi */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  E-posta Adresi (İmail) <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="ornek@posta.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Telefon Numarası Bilgisi (Kayıtta Zorunlu) */}
              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">
                    Telefon Numarası <span className="text-orange-600">*</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1">(WhatsApp & İletişim İçin)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="05xx xxx xx xx"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* USTA SEÇİLDİYSE: HİZMET ALANI */}
              {authMode === 'register' && authRole === 'usta' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Usta Bilgileri</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Usta / Firma Adı <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authIsyeri}
                        onChange={(e) => setAuthIsyeri(e.target.value)}
                        placeholder="Örn: Hasan Usta Tesisat"
                        className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Faaliyet / Hizmet Alanı <span className="text-red-500">*</span></label>
                    {renderAreaSelect('usta', authEsnafKategori, setAuthEsnafKategori, authCustomArea, setAuthCustomArea)}
                  </div>

                  <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start gap-2">
                    <span className="text-base shrink-0">🎁</span>
                    <span>
                      <strong>Hoşgeldin Hediyesi:</strong> Alanınızdaki taleplere teklif verebilmeniz için <strong>10 Ücretsiz Teklif Kredisi</strong> hesabınıza tanımlanır.
                    </span>
                  </div>
                </div>
              )}

              {/* ESNAF SEÇİLDİYSE: DÜKKAN / İŞLETME */}
              {authMode === 'register' && authRole === 'esnaf' && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Esnaf / İşletme Bilgileri</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                      İşletme / Dükkan Ünvanı <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authIsyeri}
                        onChange={(e) => setAuthIsyeri(e.target.value)}
                        placeholder="Örn: Mutlular Fırın & Pastane"
                        className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">İşletme Türü <span className="text-red-500">*</span></label>
                    {renderAreaSelect('esnaf', authEsnafKategori, setAuthEsnafKategori, authCustomArea, setAuthCustomArea)}
                  </div>
                </div>
              )}

              {/* Şifre */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Şifre {authMode === 'register' && <span className="text-[10px] text-gray-400 font-normal">(En az 6 karakter)</span>}
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  authRole !== 'sakin' && authMode === 'register'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                }`}
              >
                {authMode === 'login' ? (
                  'Giriş Yap'
                ) : authRole === 'usta' ? (
                  <>
                    <Wrench className="w-4 h-4" /> Usta Olarak Kayıt Ol (10 Kredi Hediyeli)
                  </>
                ) : authRole === 'esnaf' ? (
                  <>
                    <Building2 className="w-4 h-4" /> Esnaf Olarak Kayıt Ol
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" /> Mahalle Sakini Olarak Kayıt Ol
                  </>
                )}
              </button>
            </form>

            {/* Google ile Giriş */}
            <div className="space-y-2 pt-1">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-gray-400 font-bold uppercase">veya</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google ile Hızlı Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
