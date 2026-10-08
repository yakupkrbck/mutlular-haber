// Ekran: HomeScreen — mutlularhaber.com ana sayfası.
// Sıra: hero (karşılama + arama + Canlı Mahalle Meclisi) → Burulaş şeridi → Mahalle Tanıtım Ekranı →
//       nöbetçi eczaneler → Mahalle Kürsüsü & Oylamalar → haber şeridi (dokununca /haber) → emlak → pano →
//       2. el → esnaf kampanyaları → topluluk çağrısı → alt bilgi.
// Hiçbir bölümde örnek/sahte veri yok; hepsi uygulamanın gerçek verisinden veya gerçek API'den beslenir.
import {
  MutlularEmlakSection,
  MutlularIkinciElSection,
  MutlularPanoSection,
  MutlularFooter
} from '../MutlularPlatformComponents';
import { HomeNewsBand, HomeCampaignsSection } from '../HomeSections';
import { HomeHero, HomeKursuSection } from '../HomeHero';
import { HomeUlasimStrip } from '../HomeUlasim';
import { HomeShowcase } from '../HomeShowcase';
import { HomeNobetciEczane } from '../NobetciEczane';
import { HomeCommunityCTA } from '../HomeCommunityCTA';
import { useApp } from '../app/AppContext';

export function HomeScreen() {
  const {
    setSelectedMockupListing, activeTab, setActiveTab, setShowVefatModal,
    setMarketCategoryFilter, marketplaceItems, lostFoundItems, invitationItems, deceasedList,
    handleOpenNewsDetail, newsItems, campaigns, setShowNewsModal, setShowMarketModal,
    profile, user, polls, isPollOpen, myVotes, handleVotePoll, busLines,
    setSearchQuery, setShowSearchModal,
    setKursuBaslik, setKursuIcerik, setKursuKonum, setKursuFoto, setKursuAutoCamera, setShowKursuModal,
  } = useApp();

  const goTo = (tab: 'news' | 'pazar' | 'market' | 'davet' | 'lostfound' | 'meclis') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Satılmış / kaldırılmış ilanlar ana sayfada gösterilmez (liste Firestore'dan tüm ilanları getirir).
  const activeListings = marketplaceItems.filter((m) => !m.status || m.status === 'active');

  // Kürsü konusu aç (isteğe bağlı: pencere açılır açılmaz kamerayı başlat)
  const openKursu = (withCamera: boolean) => {
    setKursuBaslik('');
    setKursuIcerik('');
    setKursuKonum('');
    setKursuFoto('');
    setKursuAutoCamera(withCamera);
    setShowKursuModal(true);
  };

  return (
    <>
      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. HERO: karşılama, hava durumu, arama, Canlı Mahalle Meclisi */}
          <HomeHero
            userName={profile?.name || user?.displayName || ''}
            polls={polls}
            isPollOpen={isPollOpen}
            onSearch={(q) => {
              setSearchQuery(q);
              setShowSearchModal(true);
            }}
            onOpenMeclis={() => goTo('meclis')}
            onOpenKursu={() => openKursu(false)}
          />

          {/* 2. BURULAŞ: resmi canlı otobüs takibine bağlantı (uydurma varış süresi yok) */}
          <HomeUlasimStrip remoteLines={busLines} />

          {/* 3. MAHALLE TANITIM EKRANI: haber, emlak, 2. el, ilan ve panodan en son gerçek paylaşımlar */}
          <HomeShowcase
            newsItems={newsItems}
            marketplaceItems={activeListings}
            invitationItems={invitationItems}
            deceasedItems={deceasedList}
            lostFoundItems={lostFoundItems}
            onOpenNews={handleOpenNewsDetail}
            onOpenListing={(item) => setSelectedMockupListing(item)}
            onOpenDavet={() => goTo('davet')}
            onOpenDeceased={() => setShowVefatModal(true)}
            onOpenLostFound={() => goTo('lostfound')}
          />

          {/* 4. BUGÜNÜN NÖBETÇİ ECZANELERİ (gerçek veri: GitHub Actions ile her gün indirilir) */}
          <HomeNobetciEczane />

          {/* 5. MAHALLE KÜRSÜSÜ & OYLAMALAR */}
          <HomeKursuSection
            polls={polls}
            isPollOpen={isPollOpen}
            myVotes={myVotes}
            onVote={handleVotePoll}
            onOpenMeclis={() => goTo('meclis')}
            onOpenKursuCamera={() => openKursu(true)}
            onOpenKursu={() => openKursu(false)}
          />

          <div className="space-y-8 pt-2">
            {/* 6. HABER ŞERİDİ: dokununca tüm haberler (/haber) */}
            <HomeNewsBand
              news={newsItems}
              onOpenAll={() => goTo('news')}
              onOpenNews={handleOpenNewsDetail}
            />

            {/* 7. İLANLAR: emlak (satılık & kiralık) */}
            <MutlularEmlakSection
              items={activeListings}
              onOpenListing={(item) => setSelectedMockupListing(item)}
              onViewAll={() => {
                setMarketCategoryFilter('emlak');
                goTo('market');
              }}
            />

            {/* 8. MAHALLE PANOSU */}
            <MutlularPanoSection
              deceased={deceasedList}
              lostFound={lostFoundItems}
              invitations={invitationItems}
              onOpenItem={(t) => {
                if (t === 'davet') goTo('davet');
              }}
              onOpenDeceasedModal={() => setShowVefatModal(true)}
              onOpenLostFoundModal={() => goTo('lostfound')}
            />

            {/* 9. 2. EL ALIM-SATIM */}
            <MutlularIkinciElSection
              items={activeListings}
              onOpenListing={(item) => setSelectedMockupListing(item)}
              onViewAll={() => {
                setMarketCategoryFilter('ikinci_el');
                goTo('market');
              }}
            />

            {/* 10. ESNAF KAMPANYALARI */}
            <HomeCampaignsSection campaigns={campaigns} onOpenAll={() => goTo('pazar')} />

            {/* 11. TOPLULUK ÇAĞRISI: gerçek haber/ihbar ve ilan verme akışlarını açar */}
            <HomeCommunityCTA
              onOpenTipModal={() => setShowNewsModal(true)}
              onOpenNewListing={() => setShowMarketModal(true)}
            />

            {/* 12. ALT BİLGİ */}
            <MutlularFooter
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
