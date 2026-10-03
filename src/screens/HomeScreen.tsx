// Ekran: HomeScreen (eski App.tsx 4965–5052)
import {
  MutlularAutoVitrin,
  MutlularNewsSection,
  MutlularEmlakSection,
  MutlularIkinciElSection,
  MutlularUstalarSection,
  MutlularPanoSection,
  MutlularFooter
} from '../MutlularPlatformComponents';
import { useApp } from '../app/AppContext';

export function HomeScreen() {
  const {
    setShowAdminPanelModal, setSelectedMockupListing, setSelectedMockupMaster, activeTab,
    setActiveTab, setShowVefatModal, homeNewsCategoryFilter, setHomeNewsCategoryFilter,
    setMarketCategoryFilter, marketplaceItems, lostFoundItems, invitationItems, deceasedList,
    handleOpenNewsDetail, isUserAdmin, isUserEditor, pendingTipsCount, homeFilteredNews,
    vitrinSlideItems, neighborhoodMastersList, handleSelectVitrinItem,
  } = useApp();
  return (
    <>
      {activeTab === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1. HAREKETLİ VİTRİN (Haber → Emlak → 2. El → Ustalar / 1 saniyede otomatik kayan) */}
          <MutlularAutoVitrin
            items={vitrinSlideItems}
            onSelectItem={handleSelectVitrinItem}
          />

          {/* 2. & 3. 📰 SON HABERLER (Büyük Öne Çıkan Haber + Diğer Haberler Grid) */}
          <MutlularNewsSection
            news={homeFilteredNews}
            onOpenNews={handleOpenNewsDetail}
            selectedCategory={homeNewsCategoryFilter}
            onSelectCategory={(cat) => setHomeNewsCategoryFilter(cat)}
            isAdmin={isUserAdmin}
            isEditor={isUserEditor}
            pendingTipsCount={pendingTipsCount}
            onOpenAdminPanel={() => setShowAdminPanelModal(true)}
          />

          {/* 4. 🏠 EMLAK İLANLARI (Satılık & Kiralık) */}
          <MutlularEmlakSection
            items={marketplaceItems}
            onOpenListing={(item) => setSelectedMockupListing(item)}
            onViewAll={() => {
              setActiveTab('market');
              setMarketCategoryFilter('emlak');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* 5. 🚗 2. EL ALIM-SATIM İLANLARI */}
          <MutlularIkinciElSection
            items={marketplaceItems}
            onOpenListing={(item) => setSelectedMockupListing(item)}
            onViewAll={() => {
              setActiveTab('market');
              setMarketCategoryFilter('ikinci_el');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* 6. 🔧 MAHALLE USTALARI & HİZMETLER */}
          <MutlularUstalarSection
            masters={neighborhoodMastersList}
            onOpenMaster={(m) => {
              setSelectedMockupMaster({
                id: m.id,
                name: m.name,
                phone: m.phone,
                rating: m.rating,
                reviewCount: m.reviewCount,
                address: m.neighborhood,
                avatar: m.avatar,
                subCategories: [m.profession]
              });
            }}
            onCall={(phone, e) => {
              e.stopPropagation();
              window.location.href = `tel:${phone}`;
            }}
          />

          {/* 7. 📌 MAHALLE PANOSU */}
          <MutlularPanoSection
            deceased={deceasedList}
            lostFound={lostFoundItems}
            invitations={invitationItems}
            onOpenItem={(t) => {
              if (t === 'davet') setActiveTab('davet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDeceasedModal={() => setShowVefatModal(true)}
            onOpenLostFoundModal={() => {
              setActiveTab('lostfound');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* 8. FOOTER */}
          <MutlularFooter
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </>
  );
}
