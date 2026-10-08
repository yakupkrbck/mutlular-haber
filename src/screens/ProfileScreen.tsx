// Ekran: ProfileScreen (eski App.tsx 7449–8008)
import { type ServiceOffer } from '../firebase';
import { NotificationPrefsCard } from '../NotificationPrefsCard';
import { ProfileRoleCard } from '../ProfileRoleCard';
import { isUstaProfile } from '../serviceMatching';
import { MockupProfileScreen } from '../MockupViewComponents';
import {
  User as UserIcon,
  BellRing,
  Coins,
  ShieldCheck,
  Mail,
  Phone,
  MessageCircle,
  Home,
  Store,
  Edit3,
  Clock,
  MapPin,
  Sparkles,
  Zap,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../app/AppContext';

export function ProfileScreen() {
  const {
    user, profile, demoRole, setShowAdminPanelModal, activeTab, setActiveTab, notifPrefs,
    serviceRequests, marketplaceItems, offersMap, isEsnafAccount, myBusiness, myCampaignsAll, setShowBusinessEditor,
    bizStats, setServiceViewMode, setShowAuthModal, setAuthMode, setShowRequestDetail,
    setShowCreditModal, profileSubTab, setProfileSubTab, newsNotifPrefs, openBusiness, loadBizStats,
    openCampaignModal, handleAddSample, handleRemoveSample, handleSaveNotifPrefs, openWhatsApp,
    handleLogout, playAlertSound, handleSaveNewsNotifPrefs, handleTestBreakingNewsNotification,
    handleRequestBrowserPush, openProfileEdit, handleOpenArtisanOnboarding, pendingTipsCount,
    headerRoleKind,
  } = useApp();
  return (
    <>
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* ── SCREEN 7: PIXEL-PERFECT MOCKUP PROFILE SCREEN ── */}
          <MockupProfileScreen
            user={user}
            profile={profile}
            onOpenEdit={openProfileEdit}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={handleLogout}
            onOpenAuth={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            stats={
              user
                ? [
                    { label: 'İlanım', value: marketplaceItems.filter((m) => m.uid === user.uid).length },
                    { label: 'Hizmet Talebim', value: serviceRequests.filter((r) => r.uid === user.uid).length },
                  ]
                : undefined
            }
          />

          {/* Role göre "Benim Alanım" kartı */}
          {user && profile && headerRoleKind && (
            <ProfileRoleCard
              roleKind={headerRoleKind}
              profile={profile}
              myRequests={serviceRequests.filter((r) => r.uid === user.uid)}
              offersByRequest={offersMap}
              myOffers={(Object.values(offersMap) as ServiceOffer[][]).flat().filter((o) => o.esnafUid === user.uid)}
              myCampaigns={myCampaignsAll}
              business={myBusiness}
              bizStats={bizStats}
              onEditBusiness={() => setShowBusinessEditor(true)}
              onViewBusiness={() => myBusiness && openBusiness(myBusiness)}
              onNewCampaign={openCampaignModal}
              onRefreshStats={loadBizStats}
              pendingCount={pendingTipsCount}
              onOpenRequest={(r) => {
                setActiveTab('services');
                setServiceViewMode('requests');
                setShowRequestDetail(r);
              }}
              onOpenPanel={() => setShowAdminPanelModal(true)}
              onGoTab={(tab) => {
                setActiveTab(tab as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenEdit={openProfileEdit}
              onAddSample={handleAddSample}
              onRemoveSample={handleRemoveSample}
            />
          )}

          {/* Profil Alt Sekmeleri (Ayarlar & Bildirim Menüsü) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setProfileSubTab('bilgiler')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  profileSubTab === 'bilgiler'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span>Hesap &amp; Kimlik</span>
            </button>

            <button
              type="button"
              onClick={() => setProfileSubTab('haber_bildirimleri')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer relative ${
                  profileSubTab === 'haber_bildirimleri'
                    ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                    : 'bg-white text-slate-700 hover:bg-red-50 border border-red-200'
                }`}
            >
              <BellRing className={`w-4 h-4 ${profileSubTab === 'haber_bildirimleri' ? 'text-white' : 'text-red-600'}`} />
              <span>Bildirimler</span>
              {newsNotifPrefs.enabled && (
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    profileSubTab === 'haber_bildirimleri'
                      ? 'bg-white text-red-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {Object.values(notifPrefs).filter(Boolean).length} açık
                </span>
              )}
            </button>

            {demoRole === 'esnaf' && (
              <button
                type="button"
                onClick={() => setProfileSubTab('cuzdan')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    profileSubTab === 'cuzdan'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                  }`}
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Esnaf Cüzdanı</span>
              </button>
            )}

            {(demoRole === 'admin' || (user?.email === 'yakupkrbck@gmail.com' && user?.emailVerified)) && (
              <button
                type="button"
                onClick={() => setProfileSubTab('admin')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    profileSubTab === 'admin'
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200/80'
                  }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Yönetim</span>
              </button>
            )}
          </div>

          {/* SEKME 1: İLETİŞİM & MAHALLE KAYIT BİLGİLERİ */}
          {profileSubTab === 'bilgiler' && (
            !user && !profile ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl mx-auto">
                  👤
                </div>
                <h4 className="font-serif font-black text-slate-900 text-base">Oturum Açık Değil</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Kayıtlı bilgilerinizi görmek, ilanlarınızı yönetmek ve mahalle hizmetlerinden tam yararlanmak için lütfen giriş yapın.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Ücretsiz Kayıt Ol
                  </button>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Kayıt &amp; İletişim Bilgileri
                </h4>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Onaylı Profil
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* E-posta (İmail) */}
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">E-posta (İmail)</span>
                    <span className="font-bold text-gray-800 break-all text-xs">
                      {profile?.email || user?.email || 'Belirtilmedi'}
                    </span>
                  </div>
                </div>

                {/* Telefon Numarası */}
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Telefon Numarası</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-bold text-gray-800 text-xs">
                        {profile?.telefon || 'Belirtilmedi'}
                      </span>
                      {profile?.telefon && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(profile.telefon || '', 'Merhaba, Dijital Mutlular mahalle profilinizden iletişime geçiyorum.')}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Üyelik Statüsü */}
                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Mahalle Üyelik Statüsü</span>
                    <span className="font-bold text-gray-800 text-xs block">
                      {demoRole === 'esnaf' ? 'Kayıtlı Mahalle Esnafı & Usta' : 'Mutlular Mahallesi Sakini'}
                    </span>
                  </div>
                </div>

                {/* Esnaf ise Dükkan, Adres, Çalışma Saatleri, Vergi Levhası ve Uzmanlık Alanları */}
                {demoRole === 'esnaf' && (
                  <div className="sm:col-span-2 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 block uppercase">Kayıtlı İşletme &amp; Faaliyet</span>
                          <span className="font-black text-gray-900 text-sm block">
                            {profile?.isyeri || 'Mutlular Tesisat & Yapı'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenArtisanOnboarding()}
                        className="text-[11px] font-bold text-amber-900 hover:text-black bg-white border border-amber-300 px-3 py-1 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Bilgileri Güncelle
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Kategori & Sektör */}
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">Hizmet Sektörü</span>
                        <span className="font-bold text-gray-800 text-xs">
                          {profile?.esnafKategori || '—'}
                        </span>
                      </div>

                      {/* Çalışma Saatleri */}
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 block uppercase">Çalışma Saatleri</span>
                          <span className="font-bold text-gray-800 text-xs">
                            {profile?.calismaSaatleri || 'Pzt - Cmt: 08:30 - 19:30'}
                          </span>
                        </div>
                      </div>

                      {/* İşletme Adresi */}
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 block uppercase">İşletme Adresi</span>
                          <span className="font-bold text-gray-800 text-xs">
                            {profile?.adres || 'Mutlular Mahallesi, Yıldırım / Bursa'}
                          </span>
                        </div>
                      </div>

                      {/* Hesap türü */}
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center gap-2">
                        <span className="text-lg shrink-0">{isUstaProfile(profile) ? '🛠️' : '🏪'}</span>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 block uppercase">Hesap Türü</span>
                          <span className="font-bold text-emerald-700 text-xs">{isUstaProfile(profile) ? 'Usta' : 'Esnaf'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Uzmanlık Etiketleri */}
                    {profile?.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-amber-900 block uppercase mb-1.5">
                          Uzmanlık Etiketleri &amp; Hizmet Vurguları:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.uzmanlikEtiketleri.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[11px] bg-white text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* İşletme Tanıtım Açıklaması */}
                    {profile?.esnafAciklama && (
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 text-xs text-slate-700">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase mb-0.5">İşletme Tanıtımı</span>
                        <p className="text-[11px] leading-relaxed text-slate-600">{profile.esnafAciklama}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sakin ise Esnaf Hesabına Geçiş Çağrısı */}
                {demoRole !== 'esnaf' && (
                  <div className="sm:col-span-2 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 rounded-2xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-black text-xs sm:text-sm text-amber-950">
                          Mahallemizde Usta veya Esnaf mısınız?
                        </h5>
                        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                          Hesabınızı esnaf hesabına dönüştürün, mahalle sakinlerinden anlık teklif talepleri alın ve 10 hediye teklif kredisi kazanın!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenArtisanOnboarding()}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Esnaf Hesabına Geç</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Haber Bildirim Tercihleri Hızlı Özeti */}
              <div className="mt-3 p-3.5 bg-red-50/60 rounded-2xl border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🚨</span>
                  <div>
                    <span className="text-xs font-black text-red-950 block">
                      Bildirimler: {newsNotifPrefs.enabled ? `${Object.values(notifPrefs).filter(Boolean).length} kategori açık` : 'Kapalı'}
                    </span>
                    <span className="text-[11px] text-red-700 block">
                      {newsNotifPrefs.enabled ? 'Seçtiğiniz kategoriler için uygulama içi bildirim alırsınız.' : 'Bildirimler şu an kapalı.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('haber_bildirimleri')}
                  className="text-xs font-bold text-red-700 hover:text-red-900 bg-white border border-red-300 px-3 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  Tercihleri Değiştir →
                </button>
              </div>
            </div>
            )
          )}

          {/* SEKME 2: 🚨 HABER BİLDİRİMLERİ (ÖZEL AYAR PANELİ) */}
          {profileSubTab === 'haber_bildirimleri' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Durum Başlığı & Canlı Test Butonu */}
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                      <BellRing className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base sm:text-lg">Bildirim Ayarları</h4>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            !newsNotifPrefs.enabled
                              ? 'bg-black/30 text-white'
                              : 'bg-emerald-400 text-emerald-950 font-black'
                          }`}>
                          {!newsNotifPrefs.enabled ? '🔕 BİLDİRİMLER KAPALI' : `🔔 ${Object.values(notifPrefs).filter(Boolean).length} KATEGORİ AÇIK`}
                        </span>
                      </div>
                      <p className="text-xs text-red-100 mt-1 leading-relaxed max-w-xl">
                        Hangi kategorilerde bildirim almak istediğinizi seçin: son dakika, vefat, duyuru, etkinlik, esnaf ve hizmet teklifleri.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBreakingNewsNotification}
                    className="text-xs font-black bg-white text-red-700 hover:bg-red-50 px-3.5 py-2.5 rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Örnek Son Dakika Uyarısını Dene</span>
                  </button>
                </div>
              </div>

              {/* Kategori bazlı bildirim tercihleri */}
              <NotificationPrefsCard
                prefs={notifPrefs}
                onChange={handleSaveNotifPrefs}
                isUsta={isUstaProfile(profile)}
                isEsnaf={isEsnafAccount}
                masterEnabled={newsNotifPrefs.enabled}
              />

              {/* Bildirim Kanalları & Uyarı Biçimleri */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>Bildirim Kanalları &amp; Uyarı Tercihleri</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bildirimlerin ekranınıza ve cihazınıza nasıl yansıyacağını özelleştirin
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Anlık Bildirimler Master Switch */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${newsNotifPrefs.enabled ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Anlık Bildirimler (Genel Anahtar)</span>
                        <span className="text-[11px] text-slate-500 block">Tüm haber bildirim sistemini geçici olarak kapatır ya da açar.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveNewsNotifPrefs({ ...newsNotifPrefs, enabled: !newsNotifPrefs.enabled })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${newsNotifPrefs.enabled ? 'bg-red-600' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newsNotifPrefs.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Sesli Uyarı & Siren */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${newsNotifPrefs.soundAlert ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                        {newsNotifPrefs.soundAlert ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Sesli Uyarı (Flaş / Son Dakika Zili)</span>
                        <span className="text-[11px] text-slate-500 block">Son dakika haberlerinde dikkat çekici özel uyarı tonu çalar.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playAlertSound(true)}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-2xs cursor-pointer"
                      >
                        Sesi Dene 🔊
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNewsNotifPrefs({ ...newsNotifPrefs, soundAlert: !newsNotifPrefs.soundAlert })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${newsNotifPrefs.soundAlert ? 'bg-amber-500' : 'bg-slate-300'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newsNotifPrefs.soundAlert ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Tarayıcı / Cihaz Push Bildirimi */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${newsNotifPrefs.browserPush ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Tarayıcı &amp; Masaüstü Bildirimi</span>
                        <span className="text-[11px] text-slate-500 block">Uygulama arka plandayken dahi ekranınızın sağ alt köşesinde gösterilir.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRequestBrowserPush}
                        className="text-[11px] font-bold text-blue-700 hover:bg-blue-50 bg-white border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        İzni Kontrol Et / Aç
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SEKME 3: ESNAF CÜZDANI */}
          {profileSubTab === 'cuzdan' && demoRole === 'esnaf' && (
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Coins className="w-7 h-7 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-100 font-black uppercase tracking-wider">
                      Esnaf Teklif Cüzdanı
                    </span>
                    <h4 className="text-3xl font-black">{profile?.credits ?? 10} Kredi</h4>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreditModal(true)}
                  className="bg-white text-orange-900 hover:bg-amber-50 font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-orange-600" /> Kredi Satın Al
                </button>
              </div>

              <div className="bg-black/15 backdrop-blur-sm rounded-2xl p-3.5 text-xs text-orange-100 font-medium leading-relaxed border border-white/10">
                🛡️ <strong>Güvenlik Garantisi:</strong> Teklif verirken kredi düşme işlemi asla tarayıcıda yapılmaz. Firestore <code>runTransaction</code> ile atomik olarak doğrulanır ve harcama kayıtları <code>credit_transactions</code> koleksiyonuna loglanır.
              </div>
            </div>
          )}

          {/* SEKME 4: YÖNETİM PANELİ */}
          {profileSubTab === 'admin' && (demoRole === 'admin' || (user?.email === 'yakupkrbck@gmail.com' && user?.emailVerified)) && (
            <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-purple-500/30 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-300 font-black uppercase tracking-wider">
                        Mahalle Yöneticisi &amp; Muhtarlık Paneli
                      </span>
                      <span className="bg-purple-500/30 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Süper Yetki
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-white">Canlı Veritabanı &amp; Sistem Yönetimi</h4>
                  </div>
                </div>

              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-purple-100/90 leading-relaxed flex items-start gap-2.5">
                <span className="text-base shrink-0">☁️</span>
                <span>
                  Firebase Firestore bağlantınız ve güvenlik kurallarınız devrededir. Canlı veritabanınızı tek tıkla en güncel haberler, emlak ve 2. el ilanları, cemiyet davetleri ve esnaf kampanyalarıyla doldurabilir; tüm mahalleli için kullanıma hazır hale getirebilirsiniz.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
