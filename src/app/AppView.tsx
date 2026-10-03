// Uygulamanın ana çerçevesi: kenar çubuğu, üst başlıklar, ekran sekmeleri, alt gezinme ve pencerelerin yerleşimi.
import { MutlularAdminEditorPanel } from '../MutlularAdminEditorPanel';
import { ShareStudio } from '../ShareStudio';
import { BusinessEditor } from '../BusinessEditor';
import { BusinessPage } from '../BusinessPage';
import { SharedContentView } from '../SharedContentView';
import { VefatModal } from '../VefatModal';
import { HamburgerMenuDrawer } from '../HamburgerMenuDrawer';
import {
  MockupMarketHeader,
  MockupServicesHeader,
  MockupPostBottomSheet,
  MockupListingDetailModal,
  MockupMasterDetailModal
} from '../MockupViewComponents';
import { MutlularHeader, MutlularMobileNav, MutlularShareModal, MutlularSearchModal } from '../MutlularPlatformComponents';
import { ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from './AppContext';
import { DesktopSidebar } from './DesktopSidebar';
import { HomeScreen } from '../screens/HomeScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { DavetScreen } from '../screens/DavetScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { PazarScreen } from '../screens/PazarScreen';
import { LostFoundScreen } from '../screens/LostFoundScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MeclisScreen } from '../screens/MeclisScreen';
import { EsnafScreen } from '../screens/EsnafScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { QuickActionSheet } from '../modals/QuickActionSheet';
import { NewsDetailView } from '../modals/NewsDetailView';
import { NewsTipModal } from '../modals/NewsTipModal';
import { DavetModal } from '../modals/DavetModal';
import { MarketListingModal } from '../modals/MarketListingModal';
import { LostFoundModal } from '../modals/LostFoundModal';
import { OfferModal } from '../modals/OfferModal';
import { RequestDetailModal } from '../modals/RequestDetailModal';
import { ServiceRequestModal } from '../modals/ServiceRequestModal';
import { EditRequestModal } from '../modals/EditRequestModal';
import { CreditModal } from '../modals/CreditModal';
import { AuthModal } from '../modals/AuthModal';
import { ProfileEditModal } from '../modals/ProfileEditModal';
import { ArtisanRegisterModal } from '../modals/ArtisanRegisterModal';
import { CampaignModal } from '../modals/CampaignModal';
import { DeceasedModal } from '../modals/DeceasedModal';
import { KursuModal } from '../modals/KursuModal';
import { EmlakDetailModal } from '../modals/EmlakDetailModal';
import { SecondHandDetailModal } from '../modals/SecondHandDetailModal';
import { QuoteWizardModal } from '../modals/QuoteWizardModal';
import { EmergencyModal } from '../modals/EmergencyModal';
import { LiveStreamModal } from '../modals/LiveStreamModal';
import { OnboardingModal } from '../modals/OnboardingModal';

export function AppView() {
  const {
    user, profile, setProfile, demoRole, setDemoRole, realRole, allUsersList, showAdminPanelModal,
    setShowAdminPanelModal, selectedMockupListing, setSelectedMockupListing, selectedMockupMaster,
    setSelectedMockupMaster, showMockupPostSheet, setShowMockupPostSheet, mockupMarketCategory,
    setMockupMarketCategory, mockupServiceCategory, setMockupServiceCategory, activeTab,
    setActiveTab, showMenuDrawer, setShowMenuDrawer, showVefatModal, setShowVefatModal,
    setMutlularTvActive, liveConfig, sharedContent, shareItem, setShareItem,
    setMarketCategoryFilter, polls, adminOpenTab, searchQuery, setSearchQuery, newsItems,
    marketplaceItems, campaigns, pendingDeceased, myDeceased, myBusiness, pendingBusinesses,
    pendingCampaigns, businessView, showBusinessEditor, setShowBusinessEditor, setShowDavetModal,
    setSelectedEmlakItem, marketSearchTerm, setMarketSearchTerm, setMarketModalType,
    setShowArmutWizard, setArmutStep, setMasterCategoryFilter, serviceSectorSearch,
    setServiceSectorSearch, setShowAuthModal, setAuthMode, setShowMarketModal, setShowNewsModal,
    setShowCreditModal, deceasedList, setShowNewDeceasedModal, toastMessage, setShowEmergencyModal,
    showToast, handleOpenNewsDetail, openShareStudio, dataToShareItem, closeSharedContent,
    handleCopySharedLink, recordShare, handlePublishOfficialNews, handleApproveNewsTip,
    handleRejectNewsTip, unreadNotifCount, getBusinessFormInitial, handleSaveBusiness,
    handleApproveBusiness, handleRejectBusiness, handleApproveCampaign, handleRejectCampaign,
    trackBusinessEvent, closeBusiness, handleCreatePoll, handleTogglePoll, handleDeletePoll,
    handleDeleteNewsItem, handleUpdateUserRole, handleApproveDeceased, handleRejectDeceased,
    canDeleteDeceased, handleDeleteDeceased, handleSaveLive, toggleDemoRole, handleLogout,
    isUserAdmin, isUserEditor, pendingTipsCount, showMutlularShareModal, setShowMutlularShareModal,
    showSearchModal, setShowSearchModal, neighborhoodMastersList, adminShareSources, headerRoleKind,
  } = useApp();
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans pb-24">
      {/* ════════════════════════════════════════
           EN ÜSTTE TEK ŞERİT: CENAZE İLANLARI (VEFAT & TAZİYE)
      ════════════════════════════════════════ */}
      <DesktopSidebar />

      {/* ── MUTLULAR HABER & HİZMET MODERN SABİT HEADER (SOL: ARAMA | ORTA: MUTLULAR HABER / HİZMET | SAĞ: PROFİL) ── */}
      <MutlularHeader
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setShowSearchModal(true)}
        roleKind={headerRoleKind}
        onLogout={handleLogout}
        onOpenShare={() => setShowMutlularShareModal(true)}
        onOpenLiveTv={() => setMutlularTvActive(true)}
        liveActive={liveConfig.aktif}
        onOpenProfile={() => {
          setActiveTab('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMenu={() => setShowMenuDrawer(true)}
        user={user}
        profile={profile}
        searchQuery={searchQuery}
        isAdmin={isUserAdmin}
        isEditor={isUserEditor}
        pendingTipsCount={pendingTipsCount}
        onOpenAdminPanel={() => setShowAdminPanelModal(true)}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => {
          setActiveTab('notifications');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {activeTab === 'market' && (
        <MockupMarketHeader
          searchTerm={marketSearchTerm}
          onSearchChange={setMarketSearchTerm}
          activeCategory={mockupMarketCategory}
          onSelectCategory={(cat) => {
            setMockupMarketCategory(cat);
            setMarketCategoryFilter(cat as any);
          }}
          onOpenFilter={() => showToast('İlan filtreleri aktif')}
        />
      )}

      {activeTab === 'services' && (
        <MockupServicesHeader
          searchTerm={serviceSectorSearch}
          onSearchChange={setServiceSectorSearch}
          activeCategory={mockupServiceCategory}
          onSelectCategory={(cat) => {
            setMockupServiceCategory(cat);
            if (cat === 'all') setMasterCategoryFilter('all');
            else if (cat === 'elektrik') setMasterCategoryFilter('elektrik_aydinlatma_elektronik');
            else if (cat === 'tesisat') setMasterCategoryFilter('tesisat_su_isitma');
            else if (cat === 'boya') setMasterCategoryFilter('ev_tadilat_boya_marangoz');
            else if (cat === 'temizlik') setMasterCategoryFilter('temizlik_yikama_ilaclama');
          }}
          onOpenFilter={() => showToast('Usta filtreleri aktif')}
        />
      )}

      {/* DİĞER SAYFALAR İÇİN TEMİZ GERİ BUTONLU HEADER */}
      {activeTab !== 'home' && activeTab !== 'market' && activeTab !== 'services' && activeTab !== 'profile' && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200/70"
              title="Geri"
            >
              <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
            <div className="font-black text-sm text-slate-900 uppercase">
              {activeTab === 'davet' ? 'Mahalle Davetleri' : activeTab === 'lostfound' ? 'Kayıp & Buluntu' : activeTab === 'notifications' ? 'Bildirimler' : 'Mutlular Haber'}
            </div>
            <div className="w-9" />
          </div>
        </header>
      )}

      {/* ── TOAST MESAJI ── */}
      {toastMessage && (
        <div 
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-black text-white flex items-center gap-2 animate-bounce transition-all ${
            toastMessage.isError ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toastMessage.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      {/* ── ANA İÇERİK ALANI ── */}
      <main className="max-w-5xl mx-auto w-full px-2 sm:px-4 pt-2.5 sm:pt-4 flex-1 space-y-4">

        {/* ════════════════════════════════════════
             TAB 1: HABER (MUTLULAR HABER ANA SAYFASI)
             Sıralama Hiyerarşisi (Kesin Kural):
             HEADER
             ↓
             1. HAREKETLİ VİTRİN (Haber → Emlak → 2. El → Ustalar)
             ↓
             2. 📰 SON HABERLER (Büyük Öne Çıkan Haber)
             ↓
             3. DİĞER HABERLER (Grid)
             ↓
             4. 🏠 EMLAK (Satılık, Kiralık)
             ↓
             5. 🚗 2. EL (Araç, Elektronik, Ev Eşyası, Diğer)
             ↓
             6. 🔧 MAHALLE USTALARI (Onaylı ustalar)
             ↓
             7. 📌 MAHALLE PANOSU (Duyuru, Kayıp, Vefat, Etkinlik)
             ↓
             8. FOOTER
        ════════════════════════════════════════ */}
        <HomeScreen />

        {/* ════════════════════════════════════════
             TAB 2: MAHALLE BÜLTENİ & HABERLER
        ════════════════════════════════════════ */}
        <NewsScreen />

        {/* ════════════════════════════════════════
             TAB: MAHALLE CEMİYETLERİ & DAVETLER (DÜĞÜN, NİŞAN, SÜNNET)
        ════════════════════════════════════════ */}
        <DavetScreen />

        {/* ════════════════════════════════════════
             AYRI PANEL: EMLAK VİTRİNİ & 2. EL PAZARI
        ════════════════════════════════════════ */}
        <MarketScreen />

        {/* ════════════════════════════════════════
             TAB: MAHALLE PAZARI (DÜKKAN SAHİBİ ESNAF KAMPANYALARI & REKLAMLARI)
        ════════════════════════════════════════ */}
        <PazarScreen />

        {/* ════════════════════════════════════════
             TAB 4: KAYIP & BULUNTU EŞYA
        ════════════════════════════════════════ */}
        <LostFoundScreen />

        {/* ════════════════════════════════════════
             TAB 5: USTA & HİZMET SEKTÖRLERİ & TALEPLER
        ════════════════════════════════════════ */}
        <ServicesScreen />


        {/* ════════════════════════════════════════
             TAB 6: PROFİL & ESNAF CÜZDANI (EKRAN 7)
        ════════════════════════════════════════ */}
        <ProfileScreen />

        {/* ════════════════════════════════════════
             TAB 7: MAHALLE MECLİSİ (SCREEN 3)
        ════════════════════════════════════════ */}
        <MeclisScreen />

        {/* ════════════════════════════════════════
             TAB 8: MAHALLE ESNAFI & DÜKKANLAR (SCREEN 4)
        ════════════════════════════════════════ */}
        <EsnafScreen />

        {/* ════════════════════════════════════════
             TAB 9: BİLDİRİMLER (SCREEN 5)
        ════════════════════════════════════════ */}
        <NotificationsScreen />

        {/* ════════════════════════════════════════
             TAB 10: KEŞFET / MAHALLE MERKEZİ (SCREEN EXPLORE)
        ════════════════════════════════════════ */}
        <ExploreScreen />
      </main>

      {/* ── MOBİL SABİT NAVİGASYON (HABER | ALIM SATIM | + PAYLAŞ | HİZMET | PANO) ── */}
      <MutlularMobileNav
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenShare={() => setShowMutlularShareModal(true)}
      />

      {/* ── + PAYLAŞ BUTONU MODALI (HABER, ALIM SATIM, HİZMET, PANO HER ALANA ÖZEL PAYLAŞIM) ── */}
      <MutlularShareModal
        isOpen={showMutlularShareModal}
        onClose={() => setShowMutlularShareModal(false)}
        activeTab={activeTab}
        onSelectAction={(type) => {
          setShowMutlularShareModal(false);
          if (type === 'news') {
            setShowNewsModal(true);
          } else if (type === 'emlak') {
            setMarketModalType('emlak');
            setShowMarketModal(true);
          } else if (type === 'ikinci_el') {
            setMarketModalType('ikinci_el');
            setShowMarketModal(true);
          } else if (type === 'service') {
            setArmutStep(1);
            setShowArmutWizard(true);
          } else if (type === 'duyuru') {
            setShowDavetModal(true);
          }
        }}
      />

      {/* ── 🔍 MUTLULAR ARAMA MODALI (MERCEK İŞARETİYLE AÇILIR) ── */}
      <MutlularSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        newsItems={newsItems}
        marketplaceItems={marketplaceItems}
        masters={neighborhoodMastersList}
        onSelectNews={(item) => {
          handleOpenNewsDetail(item);
          setShowSearchModal(false);
        }}
        onSelectMarketplace={(item) => {
          setSelectedEmlakItem(item);
          setShowSearchModal(false);
        }}
        onSelectMaster={(master) => {
          setSelectedMockupMaster({
            id: master.id,
            name: master.name,
            phone: master.phone,
            rating: master.rating,
            reviewCount: master.reviewCount,
            address: master.neighborhood,
            avatar: master.avatar,
            subCategories: [master.profession]
          });
          setShowSearchModal(false);
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab as any);
          setShowSearchModal(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ── SCREEN 4: POST BOTTOM SHEET (HIZLI EYLEM YEDEK) ── */}
      <MockupPostBottomSheet
        isOpen={showMockupPostSheet}
        onClose={() => setShowMockupPostSheet(false)}
        onSelectAction={(action) => {
          setShowMockupPostSheet(false);
          if (action === 'market') {
            setMarketModalType('emlak');
            setShowMarketModal(true);
          } else if (action === 'service') {
            setArmutStep(1);
            setShowArmutWizard(true);
          } else if (action === 'news') {
            setShowNewsModal(true);
          } else if (action === 'event') {
            setShowDavetModal(true);
          }
        }}
      />

      {/* ── SCREEN 5: LISTING DETAIL MODAL ("Satılık Daire") ── */}
      <MockupListingDetailModal
        item={selectedMockupListing}
        onClose={() => setSelectedMockupListing(null)}
        onCall={(phone) => {
          window.location.href = `tel:${phone}`;
        }}
      />

      {/* ── SCREEN 6: CRAFTSMAN DETAIL MODAL ("Mehmet Usta") ── */}
      <MockupMasterDetailModal
        master={selectedMockupMaster}
        onClose={() => setSelectedMockupMaster(null)}
        onCall={(phone) => {
          window.location.href = `tel:${phone}`;
        }}
      />

      {/* ── MODAL: HIZLI PAYLAŞIM & İLAN MERKEZİ (MH TUŞU MENÜSÜ) ── */}
      <QuickActionSheet />

      {/* ── SCREEN 2: EDİTORYAL HABER DETAYI & YORUMLAR (TAM MOCKUP UYUMU) ── */}
      <NewsDetailView />

      {/* ── MODAL: YENİ HABER ÖNER / İHBAR BİLDİR ── */}
      <NewsTipModal />

      {/* ── MODAL: YENİ MAHALLE DAVETİYESİ PAYLAŞ ── */}
      <DavetModal />

      {/* ── MODAL: ALIM SATIM İLANI VER (EMLAK VE 2. EL EŞYA SEÇİMLİ) ── */}
      <MarketListingModal />

      {/* ── MODAL: KAYIP / BULUNTU BİLDİR ── */}
      <LostFoundModal />

      {/* ── MODAL: ESNAF TEKLİFİ VER (1 Kredi Düşümü) ── */}
      <OfferModal />

      {/* ── MODAL: HİZMET TALEBİ DETAYI & GELEN TEKLİFLER ── */}
      <RequestDetailModal />

      {/* ── MODAL: YENİ HİZMET TALEBİ AÇ (TEKLİF AL) ── */}
      <ServiceRequestModal />

      {/* ── MODAL: HİZMET TALEBİNİ DÜZENLE (EDIT SERVICE REQUEST) ── */}
      <EditRequestModal />

      {/* ── MODAL: ESNAF KREDİ SATIN ALMA (WhatsApp Yönlendirmeli) ── */}
      <CreditModal />

      {/* ── MODAL: GİRİŞ & KAYIT ── */}
      <AuthModal />

      {/* ── MODAL: PROFİL & İLETİŞİM BİLGİLERİNİ GÜNCELLE ── */}
      <ProfileEditModal />

      {/* ── MODAL: ESNAF & USTA KATILIM / HESAP YÜKSELTME SİHİRBAZI ── */}
      <ArtisanRegisterModal />

      {/* ── MODAL: MAHALLE PAZARI KAMPANYA & REKLAM YAYINLA ── */}
      <CampaignModal />

      {/* ── MODAL: YENİ CENAZE & VEFAT İLANI BIRAK ── */}
      <DeceasedModal />

      {/* ── MODAL: MAHALLE KÜRSÜSÜ YENİ GÖRÜŞ / DERT BİLDİRİMİ ── */}
      <KursuModal />

      {/* ── 🟡 MODAL: EMLAK İLAN DETAYI ── */}
      <EmlakDetailModal />

      {/* ── 🔴 MODAL: 2. EL EŞYA DETAY & CANLI SOHBET / TEKLİF ── */}
      <SecondHandDetailModal />

      {/* ── 🛠️ MODAL: 3 KOLAY SORUDA FİYAT TEKLİFİ AL SİHİRBAZI ── */}
      <QuoteWizardModal />

      {/* ── ŞEHİR HİZMETLERİ MODALLARI (ECZANE, NOTER, TAKSİ, OTOBÜS, VEFAT, GEZİLECEK, YEMEK, İŞ, ETKİNLİK) ── */}
      <VefatModal
        open={showVefatModal}
        onClose={() => setShowVefatModal(false)}
        onShowToast={showToast}
        deceasedList={deceasedList}
        onOpenAddDeceased={() => setShowNewDeceasedModal(true)}
        canDeleteDeceased={canDeleteDeceased}
        onDeleteDeceased={handleDeleteDeceased}
        myDeceasedPending={myDeceased.filter((d: any) => d.status === 'pending' || d.status === 'rejected')}
      />

      {/* ── 🚨 ACİL DURUM VE HIZLI ÇAĞRI MODALI ── */}
      <EmergencyModal />

      {/* ── 📺 MUTLULAR TV CANLI YAYIN MODALI (yönetici / editör tarafından yönetilir) ── */}
      <LiveStreamModal />

      {/* ── PAYLAŞILAN BAĞLANTIDAN AÇILAN İÇERİK (haber dışı türler) ── */}
      <SharedContentView
        content={sharedContent}
        onClose={closeSharedContent}
        onCopyLink={handleCopySharedLink}
        onShare={(c) => openShareStudio(dataToShareItem(c.kind, c.data, c.id))}
      />

      {/* ── İŞLETME SAYFASI (herkese açık) ve düzenleyici (esnaf) ── */}
      <BusinessPage
        business={businessView}
        campaigns={campaigns}
        onClose={closeBusiness}
        onShare={(b) => {
          trackBusinessEvent(b, 'share');
          openShareStudio(dataToShareItem('isletme', b, b.id));
        }}
        onEvent={trackBusinessEvent}
      />
      <BusinessEditor
        open={showBusinessEditor}
        initial={getBusinessFormInitial()}
        existing={myBusiness}
        onClose={() => setShowBusinessEditor(false)}
        onSave={handleSaveBusiness}
      />

      {/* ── PAYLAŞIM STÜDYOSU: hikâye görseli, bağlantı, metin ── */}
      <ShareStudio item={shareItem} onClose={() => setShareItem(null)} onToast={showToast} onShared={recordShare} />

      {/* ── GOOGLE İLE İLK GİRİŞ: HESABINI TAMAMLA ── */}
      <OnboardingModal />

      {/* ── SAĞDAN AÇILAN HAMBURGER MENÜ ÇEKMECESİ ── */}
      <HamburgerMenuDrawer
        isOpen={showMenuDrawer}
        onClose={() => setShowMenuDrawer(false)}
        user={user}
        profile={profile}
        demoRole={demoRole}
        onToggleRole={toggleDemoRole}
        canSwitchRole={realRole === 'admin'}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenVefat={() => setShowVefatModal(true)}
        onOpenAuth={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
        onShowCredit={() => setShowCreditModal(true)}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        onOpenAdminPanel={() => setShowAdminPanelModal(true)}
      />

      {/* ── 👑 MUTLULAR YÖNETİCİ & EDİTÖR MASASI MODALI ── */}
      <MutlularAdminEditorPanel
        isOpen={showAdminPanelModal}
        onClose={() => setShowAdminPanelModal(false)}
        isAdmin={isUserAdmin}
        isEditor={isUserEditor}
        currentUser={profile}
        newsItems={newsItems}
        allUsers={allUsersList}
        onPublishNews={handlePublishOfficialNews}
        onApproveTip={handleApproveNewsTip}
        onRejectTip={handleRejectNewsTip}
        onDeleteNews={handleDeleteNewsItem}
        liveConfig={liveConfig}
        onSaveLive={handleSaveLive}
        shareSources={adminShareSources}
        onPrepareShare={openShareStudio}
        polls={polls}
        onCreatePoll={handleCreatePoll}
        onTogglePoll={handleTogglePoll}
        onDeletePoll={handleDeletePoll}
        openTab={adminOpenTab}
        pendingBusinesses={pendingBusinesses}
        pendingCampaigns={pendingCampaigns}
        onApproveBusiness={handleApproveBusiness}
        onRejectBusiness={handleRejectBusiness}
        onApproveCampaign={handleApproveCampaign}
        onRejectCampaign={handleRejectCampaign}
        pendingDeceased={pendingDeceased}
        onApproveDeceased={handleApproveDeceased}
        onRejectDeceased={handleRejectDeceased}
        onUpdateUserRole={handleUpdateUserRole}
        onSwitchDemoRole={(r) => {
          setDemoRole(r);
          if (profile) setProfile({ ...profile, role: r });
          showToast(`Aktif test rolü değiştirildi: ${r}`);
        }}
        activeDemoRole={demoRole}
        showToast={showToast}
      />

    </div>
  );
}
