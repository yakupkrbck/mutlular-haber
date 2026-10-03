// Uygulamanın tüm durumu (state), Firestore dinleyicileri ve işleyicileri (eski App.tsx 959–4744).
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  type User,
  type UserProfile,
  type UserRole,
  type MarketplaceItem,
  type LostFoundItem,
  type ServiceRequest,
  type EsnafCampaign,
  type ServiceOffer,
  type HizmetAlani,
  type Business,
  type MahalleDavetItem,
  type MahalleKursusuItem,
  type NewsNotificationPreferences,
  getDoc,
  doc,
  db,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  onAuthStateChanged,
  auth,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
  getCountFromServer,
  runTransaction,
  getDocs,
  deleteDoc,
  increment,
  type MahalleDavetTebrik,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  googleProvider,
  signOut
} from '../firebase';
import { type SampleNewsItem } from '../mockNeighborhoodData';
import {
  tabFromPathname,
  getBase,
  type ParsedLink,
  parseContentLink,
  isCanonicalSection,
  sectionPath,
  slugify,
  CONTENT_COLLECTIONS,
  type ContentType,
  cleanedUrl,
  TAB_PATHS,
  buildContentUrl,
  type ContentKind,
  KIND_TO_TYPE
} from '../links';
import { type ShareItem } from '../ShareStudio';
import { type BusinessFormData } from '../BusinessEditor';
import { type BusinessEvent } from '../BusinessPage';
import { type NotifPrefs, normalizePrefs, DEFAULT_NOTIF_PREFS, buildContentNotifications } from '../notifications';
import { type SharedContent } from '../SharedContentView';
import { type LiveConfig, EMPTY_LIVE, cleanLiveUrl, toEmbedUrl } from '../liveStream';
import {
  isUstaProfile,
  customAreaToMainCat,
  toMillis,
  timeAgoTr,
  requestMatchesEsnaf,
  resolveKategoriId,
  cleanAreaName,
  DIGER_ALAN,
  ESNAF_TURLERI
} from '../serviceMatching';
import { type DeceasedItem } from '../cityServicesData';
import { type VitrinItem, type NeighborhoodMaster } from '../MutlularPlatformComponents';
import { deleteField } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { MAIN_SERVICE_CATEGORIES } from '../data/serviceCategories';
import type { MainTab, PollItem, NewsComment } from './types';

export function useAppController() {
  // Current user state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [demoRole, setDemoRole] = useState<UserRole>('sakin');
  // Sunucudaki (gerçek) rol. Rol önizleme yalnızca gerçek yöneticiye açıktır ve hiçbir zaman kaydedilmez.
  const [realRole, setRealRole] = useState<UserRole>('sakin');
  // Kayıt / Google girişi sırasında otomatik "sakin" profil oluşturulmasını engeller (yarış durumu)
  const suppressAutoProfileRef = useRef(false);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState<boolean>(false);

  // ── MOCKUP GÖRSELİ DETAY VE MODAL STATE'LERİ ──
  const [selectedMockupListing, setSelectedMockupListing] = useState<MarketplaceItem | null>(null);
  const [selectedMockupMaster, setSelectedMockupMaster] = useState<any | null>(null);
  const [showMockupPostSheet, setShowMockupPostSheet] = useState<boolean>(false);
  const [mockupFavorites, setMockupFavorites] = useState<Record<string, boolean>>({});
  const [mockupNewsCategory, setMockupNewsCategory] = useState<string>('tumu');
  const [mockupMarketCategory, setMockupMarketCategory] = useState<string>('all');
  const [mockupServiceCategory, setMockupServiceCategory] = useState<string>('all');

  // Active navigation tab
  
  // İlk açılışta ekran adres çubuğundan belirlenir (mutlularhaber.com/hizmet doğrudan Hizmet ekranını açar)
  const [activeTab, setActiveTab] = useState<MainTab>(() => (tabFromPathname(window.location.pathname, getBase()) as MainTab | null) ?? 'home');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showVefatModal, setShowVefatModal] = useState<boolean>(false);

  // ── TASARIM & ETKİLEŞİM STATE'LERİ (MOCKUP REFERANSI) ──
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(['haber_park', 'h1']);
  const [notifTab, setNotifTab] = useState<'tumu' | 'unread' | 'duyuru'>('tumu');
  // Gerçek bildirimler içerikten türetilir (aşağıda). Bu liste yalnızca oturum içi ek uyarılar içindir.
  const [notifications, setNotifications] = useState<any[]>([]);

  // ── 📺 MUTLULAR TV & VİTRİN STATE'LERİ ──
  const [mutlularTvActive, setMutlularTvActive] = useState<boolean>(false);
  const [vitrinIndex, setVitrinIndex] = useState<number>(0);
  const [liveConfig, setLiveConfig] = useState<LiveConfig>(EMPTY_LIVE);
  // FAZ 2: içerik bağlantıları ve paylaşım stüdyosu
  const [deepLink, setDeepLink] = useState<ParsedLink | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => {
    try {
      const raw = localStorage.getItem('mutlular_notif_prefs');
      return raw ? normalizePrefs(JSON.parse(raw)) : { ...DEFAULT_NOTIF_PREFS };
    } catch (_) {
      return { ...DEFAULT_NOTIF_PREFS };
    }
  });
  const [notifReadIds, setNotifReadIds] = useState<string[]>([]);
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const resolvedLinkRef = useRef<string>('');
  const [tvMuted, setTvMuted] = useState<boolean>(true);
  const [tvLikes, setTvLikes] = useState<number>(184);
  const [hasLikedTv, setHasLikedTv] = useState<boolean>(false);
  const [homeNewsCategoryFilter, setHomeNewsCategoryFilter] = useState<string>('tumu');

  // ── 🛍️ MUTLULAR ALIM SATIM (BİRLEŞİK / DİREKT YAYIN) STATE'LERİ ──
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>('all');
  const [marketUnifiedSort, setMarketUnifiedSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // ── MAHALLE MECLİSİ: ANKETLER (Firestore) ──
  // polls/{id}: soru, secenekler[], kategori, aktif, toplam, c0..c5 (oy sayaçları), endsAt?
  // polls/{id}/votes/{uid}: kullanıcı başına tek oy (kurallar sayaçla birlikte zorlar)
  

  const [meclisFilter, setMeclisFilter] = useState<'tumu' | 'guncel' | 'cevre' | 'ulasim' | 'sosyal' | 'genel'>('tumu');
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [adminOpenTab, setAdminOpenTab] = useState<string | undefined>(undefined);

  // Haber yorumları ve beğenileri: gerçek kayıtlar (comments / likes koleksiyonları)
  
  const [newsComments, setNewsComments] = useState<NewsComment[]>([]);
  const [newsLikeCount, setNewsLikeCount] = useState(0);
  const [myNewsLike, setMyNewsLike] = useState(false);
  const lastCommentAtRef = useRef(0);
  const [commentInput, setCommentInput] = useState('');
  const [newCommentInput, setNewCommentInput] = useState('');

  // Esnaf Filtresi
  const [esnafCategoryFilter, setEsnafCategoryFilter] = useState('tumu');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [newsSearchTerm, setNewsSearchTerm] = useState('');
  const [newsSortBy, setNewsSortBy] = useState<'newest' | 'popular' | 'trending' | 'breaking' | 'likes'>('newest');
  const [marketFilter, setMarketFilter] = useState('tumu');
  const [lostFoundFilter, setLostFoundFilter] = useState('tumu');
  const [newsFilter, setNewsFilter] = useState('tumu');
  const [campaignFilter, setCampaignFilter] = useState('tumu');

  // Feeds with fallback to initial sample data
  const [newsItems, setNewsItems] = useState<SampleNewsItem[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [campaigns, setCampaigns] = useState<EsnafCampaign[]>([]);
  const [offersMap, setOffersMap] = useState<Record<string, ServiceOffer[]>>({});
  // Kabul edilen tekliflerin usta telefonları (offers/{id}/private/iletisim); yalnızca talep sahibi, kabulden sonra okuyabilir.
  const [ustaPhones, setUstaPhones] = useState<Record<string, string>>({});
  const fetchedPhoneIdsRef = useRef<Set<string>>(new Set());
  const [notifSeenAt, setNotifSeenAt] = useState<number>(0);
  const [customAreas, setCustomAreas] = useState<HizmetAlani[]>([]);
  // Google ile ilk kez giren kullanıcının "hesabını tamamla" ekranı
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [obRole, setObRole] = useState<'sakin' | 'usta' | 'esnaf'>('sakin');
  const [obAd, setObAd] = useState('');
  const [obSoyad, setObSoyad] = useState('');
  const [obPhone, setObPhone] = useState('');
  const [obIsyeri, setObIsyeri] = useState('');
  const [obArea, setObArea] = useState('');
  const [obCustomArea, setObCustomArea] = useState('');
  const [obAdres, setObAdres] = useState('Mutlular Mahallesi, Yıldırım / Bursa');
  const [obSaving, setObSaving] = useState(false);
  const [authCustomArea, setAuthCustomArea] = useState('');
  const [artisanKind, setArtisanKind] = useState<'usta' | 'esnaf'>('usta');
  const [artisanCustomArea, setArtisanCustomArea] = useState('');
  const [editHesapTipi, setEditHesapTipi] = useState<'usta' | 'esnaf'>('usta');
  const [editCustomArea, setEditCustomArea] = useState('');
  const [requestScope, setRequestScope] = useState<'uygun' | 'tumu'>('uygun');
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  // Gerçek (veritabanı kurallarının da tanıdığı) yönetici/editör. Önizleme rolleri burada sayılmaz.
  const isRealStaff = Boolean(
    user && (profile?.role === 'admin' || profile?.role === 'editor' || (user.email === 'yakupkrbck@gmail.com' && user.emailVerified))
  );
  const isRealAdmin = Boolean(
    user && (profile?.role === 'admin' || (user.email === 'yakupkrbck@gmail.com' && user.emailVerified))
  );
  const isEsnafAccount = profile?.role === 'esnaf' && !isUstaProfile(profile);
  // Vefat ilanı onay akışı: editör/yönetici için bekleyenler, kullanıcı için kendi bekleyen/reddedilen ilanları
  const [pendingDeceased, setPendingDeceased] = useState<DeceasedItem[]>([]);
  const [myDeceased, setMyDeceased] = useState<DeceasedItem[]>([]);
  // FAZ 4: işletme sayfaları (esnaf)
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<EsnafCampaign[]>([]);
  const [myCampaignsAll, setMyCampaignsAll] = useState<EsnafCampaign[]>([]);
  const [businessView, setBusinessView] = useState<Business | null>(null);
  const [showBusinessEditor, setShowBusinessEditor] = useState(false);
  const [bizStats, setBizStats] = useState<{ views: number; views7: number; call: number; whatsapp: number; share: number; map: number } | null>(null);
  const trackedRef = useRef<Set<string>>(new Set());

  // Ana kategoriler + topluluğun (ustaların "Diğer" ile) eklediği faaliyet alanları
  const ALL_SERVICE_CATEGORIES = useMemo(() => [
    ...MAIN_SERVICE_CATEGORIES,
    ...customAreas
      .filter((a) => !MAIN_SERVICE_CATEGORIES.some((c) => c.name.toLocaleLowerCase('tr-TR') === a.ad.toLocaleLowerCase('tr-TR')))
      .map((a) => customAreaToMainCat(a, MAIN_SERVICE_CATEGORIES[0]) as any)
  ], [customAreas]);

  // ── 💍 MAHALLE CEMİYET & DAVETLERİ STATE ──
  const [invitationItems, setInvitationItems] = useState<MahalleDavetItem[]>([]);
  const [davetCategoryFilter, setDavetCategoryFilter] = useState<string>('all');
  const [davetSearch, setDavetSearch] = useState<string>('');
  const [showDavetModal, setShowDavetModal] = useState<boolean>(false);
  const [attendedDavetIds, setAttendedDavetIds] = useState<string[]>([]);
  const [activeTebrikDavetId, setActiveTebrikDavetId] = useState<string | null>(null);
  const [newTebrikName, setNewTebrikName] = useState<string>('');
  const [newTebrikMsg, setNewTebrikMsg] = useState<string>('');
  const [newTebrikType, setNewTebrikType] = useState<'katilacagim' | 'tebrik_ederim' | 'mutluluklar'>('katilacagim');

  // ── 🏠 EMLAK (SAHİBİNDEN TARZI) VE 2. EL (LETGO TARZI) STATE ──
  const [marketDualMode, setMarketDualMode] = useState<'dual' | 'emlak' | 'ikinci_el'>('emlak');
  const [emlakTypeFilter, setEmlakTypeFilter] = useState<string>('all');
  const [emlakRoomFilter, setEmlakRoomFilter] = useState<string>('all');
  const [emlakViewStyle, setEmlakViewStyle] = useState<'table' | 'cards'>('table');
  const [emlakSortBy, setEmlakSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [selectedEmlakItem, setSelectedEmlakItem] = useState<MarketplaceItem | null>(null);

  // ── 🛍️ 2. EL (LETGO TARZI) STATE ──
  const [secondHandCatFilter, setSecondHandCatFilter] = useState<string>('all');
  const [selectedLetgoItem, setSelectedLetgoItem] = useState<MarketplaceItem | null>(null);
  const [letgoOfferModalItem, setLetgoOfferModalItem] = useState<MarketplaceItem | null>(null);
  const [letgoCustomOfferText, setLetgoCustomOfferText] = useState<string>('');

  const [marketSearchTerm, setMarketSearchTerm] = useState<string>('');
  const [marketModalType, setMarketModalType] = useState<'emlak' | 'ikinci_el'>('ikinci_el');
  const [homeMarketTab, setHomeMarketTab] = useState<'emlak' | 'ikinci_el'>('emlak');

  // ── 🍏 ARMUT UYGULAMASI TARZI HİZMET VE TALEP STATE ──
  const [showArmutWizard, setShowArmutWizard] = useState(false);
  const [armutStep, setArmutStep] = useState<1 | 2 | 3 | 4>(1);
  const [armutSelectedCat, setArmutSelectedCat] = useState<string>('Tesisat & Su');
  const [armutSelectedSub, setArmutSelectedSub] = useState<string>('Su Kaçağı Tespiti');
  const [armutTiming, setArmutTiming] = useState<string>('Hemen / En Kısa Sürede');
  const [armutPhoto, setArmutPhoto] = useState('');
  const [armutDetail, setArmutDetail] = useState<string>('');
  const [armutAddress, setArmutAddress] = useState<string>('Mutlular Mahallesi, Yıldırım / Bursa');
  const [armutPhone, setArmutPhone] = useState<string>('');

  // ── USTA & HİZMET SEKTÖRLERİ, ANA & ALT KATEGORİ STATE ──
  const [serviceViewMode, setServiceViewMode] = useState<'categories' | 'masters' | 'requests'>('categories');
  const [activeExpandedCatId, setActiveExpandedCatId] = useState<string | null>(null);
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<string>('all');
  const [selectedMainCatFilter, setSelectedMainCatFilter] = useState<string>('all');
  const [modalMainCatId, setModalMainCatId] = useState<string>('dugun_organizasyon');
  const [modalSubCatName, setModalSubCatName] = useState<string>('Masa Sandalye Kiralama');
  const [selectedServiceSector, setSelectedServiceSector] = useState<string>('Düğün, Nişan & Doğum Günü');
  const [serviceSectorSearch, setServiceSectorSearch] = useState<string>('');
  const [newServiceReqTitle, setNewServiceReqTitle] = useState('');
  const [newServiceReqDesc, setNewServiceReqDesc] = useState('');
  const [newServiceReqAddress, setNewServiceReqAddress] = useState('Mutlular Mahallesi');
  const [newServiceReqPhone, setNewServiceReqPhone] = useState('');
  const [newServiceReqUrgent, setNewServiceReqUrgent] = useState(false);
  const [newServiceReqPhoto, setNewServiceReqPhoto] = useState('');

  const handleOpenCategoryRequest = (mainCatId: string, subCatName?: string, defaultTitle?: string) => {
    const mainCat = ALL_SERVICE_CATEGORIES.find(c => c.id === mainCatId) || ALL_SERVICE_CATEGORIES[0];
    setModalMainCatId(mainCat.id);
    setSelectedServiceSector(mainCat.name);
    const targetSub = subCatName || mainCat.subCategories[0]?.name || '';
    setModalSubCatName(targetSub);
    if (defaultTitle) {
      setNewServiceReqTitle(defaultTitle);
    } else {
      setNewServiceReqTitle('');
    }
    setShowServiceModal(true);
  };

  const handleOpenSectorRequest = (sectorName: string, defaultTitle?: string) => {
    const matchedMain = ALL_SERVICE_CATEGORIES.find(c => 
      c.name.toLowerCase() === sectorName.toLowerCase() ||
      c.shortTitle.toLowerCase() === sectorName.toLowerCase() ||
      c.subCategories.some(s => s.name.toLowerCase().includes(sectorName.toLowerCase()))
    ) || ALL_SERVICE_CATEGORIES[0];

    setModalMainCatId(matchedMain.id);
    setSelectedServiceSector(matchedMain.name);
    
    const matchedSub = matchedMain.subCategories.find(s => 
      s.name.toLowerCase().includes(sectorName.toLowerCase()) || 
      (defaultTitle && s.sampleRequests.some(r => r.toLowerCase().includes(defaultTitle.toLowerCase())))
    );
    if (matchedSub) {
      setModalSubCatName(matchedSub.name);
    } else {
      setModalSubCatName(matchedMain.subCategories[0]?.name || '');
    }

    if (defaultTitle) {
      setNewServiceReqTitle(defaultTitle);
    } else {
      setNewServiceReqTitle('');
    }
    setShowServiceModal(true);
  };

  // News Carousel Ref & Controls
  const newsCarouselRef = useRef<HTMLDivElement>(null);
  const scrollNews = (direction: 'left' | 'right') => {
    if (newsCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      newsCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mahalle Kürsüsü (Serbest Görüş & Dert Anlatma) State
  const [kursuItems, setKursuItems] = useState<MahalleKursusuItem[]>([]);
  const [kursuCategoryFilter, setKursuCategoryFilter] = useState<string>('Hepsi');
  const [showKursuModal, setShowKursuModal] = useState<boolean>(false);
  const [activeCommentKursuId, setActiveCommentKursuId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [supportedKursuIds, setSupportedKursuIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('supported_kursu_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Kürsü Yeni Giriş Form State
  const [kursuBaslik, setKursuBaslik] = useState('');
  const [kursuKategori, setKursuKategori] = useState<'Sorun & Şikayet' | 'Öneri & Fikir' | 'Teşekkür & Tebrik' | 'Dilek & Talep'>('Sorun & Şikayet');
  const [kursuIcerik, setKursuIcerik] = useState('');
  const [kursuKonum, setKursuKonum] = useState('');
  const [kursuFoto, setKursuFoto] = useState('');

  // Modals & Panels
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showLostFoundModal, setShowLostFoundModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<SampleNewsItem | null>(null);
  const [showOfferModal, setShowOfferModal] = useState<ServiceRequest | null>(null);
  const [showRequestDetail, setShowRequestDetail] = useState<ServiceRequest | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showQuickActionSheet, setShowQuickActionSheet] = useState(false);

  // Kayan alım satım slider ref ve kontrolleri
  const marketCarouselRef = React.useRef<HTMLDivElement>(null);
  const scrollMarket = (dir: 'left' | 'right') => {
    if (marketCarouselRef.current) {
      marketCarouselRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  // Form states
  const [authRole, setAuthRole] = useState<'sakin' | 'usta' | 'esnaf'>('sakin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authIsyeri, setAuthIsyeri] = useState('');
  const [authEsnafKategori, setAuthEsnafKategori] = useState('Tesisat & Su');
  const [authError, setAuthError] = useState('');

  // Profile Edit modal
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState<'bilgiler' | 'haber_bildirimleri' | 'cuzdan' | 'admin'>('bilgiler');
  const [profileModalTab, setProfileModalTab] = useState<'bilgiler' | 'haber_bildirimleri'>('bilgiler');
  
  // Haber Bildirim Tercihleri State (Varsayılan olarak sadece 'Son Dakika' haberleri seçilidir)
  const [newsNotifPrefs, setNewsNotifPrefs] = useState<NewsNotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('dijitalmutlular_news_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      enabled: true,
      sonDakikaOnly: true, // Kullanıcı varsayılan olarak sadece 'Son Dakika' haberleri için bildirim alabilir
      soundAlert: true,
      browserPush: false,
      vibration: true
    };
  });

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editRole, setEditRole] = useState<'sakin' | 'esnaf'>('sakin');
  const [editIsyeri, setEditIsyeri] = useState('');
  const [editEsnafKategori, setEditEsnafKategori] = useState('Tesisat & Su');
  const [editAdres, setEditAdres] = useState('');
  const [editCalismaSaatleri, setEditCalismaSaatleri] = useState('');
  const [editUzmanlikEtiketleri, setEditUzmanlikEtiketleri] = useState<string[]>([]);
  const [editUzmanlikInput, setEditUzmanlikInput] = useState('');
  const [editEsnafAciklama, setEditEsnafAciklama] = useState('');

  // ── ESNAF & USTA KATILIM / HESAP YÜKSELTME SİHİRBAZI STATE ──
  const [showArtisanRegisterModal, setShowArtisanRegisterModal] = useState(false);
  const [artisanBusinessName, setArtisanBusinessName] = useState('');
  const [artisanCategory, setArtisanCategory] = useState('Tesisat & Su');
  const [artisanAddress, setArtisanAddress] = useState('Mutlular Mahallesi, Yıldırım / Bursa');
  const [artisanWorkingHours, setArtisanWorkingHours] = useState('Pazartesi - Cumartesi: 08:30 - 19:30');
  const [artisanTags, setArtisanTags] = useState<string[]>(['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
  const [artisanTagInput, setArtisanTagInput] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanDescription, setArtisanDescription] = useState('Mutlular Mahallesi sakinlerine profesyonel ve garantili usta hizmeti sunmaktayız.');
  const [artisanRegisterEmail, setArtisanRegisterEmail] = useState('');
  const [artisanRegisterPassword, setArtisanRegisterPassword] = useState('');
  const [artisanRegisterName, setArtisanRegisterName] = useState('');
  const [artisanIsSubmitting, setArtisanIsSubmitting] = useState(false);

  // Mahalle Pazarı / Esnaf Kampanya Form State
  const [campIsyeri, setCampIsyeri] = useState('');
  const [campKategori, setCampKategori] = useState('Fırın & Unlu Mamül');
  const [campBaslik, setCampBaslik] = useState('Akşam 19:00 Sonrası Tüm Sıcak Ekmek ve Pidelerde %30 İndirim!');
  const [campAciklama, setCampAciklama] = useState('Günün taze taş fırın ekmekleri, simit ve ramazan pidelerinde komşularımıza özel akşam indirimi başlamıştır. İsrafı önlüyor, bereketi paylaşıyoruz.');
  const [campIndirim, setCampIndirim] = useState('');
  const [campRozet, setCampRozet] = useState('');
  const [campAdres, setCampAdres] = useState('');
  const [campTelefon, setCampTelefon] = useState('');
  const [campGecerlilik, setCampGecerlilik] = useState('');
  const [campFoto, setCampFoto] = useState('');

  // Service Request Edit modal state
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [editReqTitle, setEditReqTitle] = useState('');
  const [editReqDesc, setEditReqDesc] = useState('');
  const [editReqPhotos, setEditReqPhotos] = useState<string[]>([]);
  const [editReqKategori, setEditReqKategori] = useState('Tesisat & Su');
  const [editReqAdres, setEditReqAdres] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Cenaze İlanları (Vefat & Taziye) State
  const [deceasedList, setDeceasedList] = useState<DeceasedItem[]>([]);
  const [currentDeceasedIdx, setCurrentDeceasedIdx] = useState(0);
  const [showNewDeceasedModal, setShowNewDeceasedModal] = useState(false);
  const [newDeceasedName, setNewDeceasedName] = useState('');
  const [newDeceasedAge, setNewDeceasedAge] = useState('');
  const [newDeceasedFamily, setNewDeceasedFamily] = useState('');
  const [newDeceasedMosque, setNewDeceasedMosque] = useState('Mutlular Fatih Camii');
  const [newDeceasedPrayer, setNewDeceasedPrayer] = useState('Öğle Namazını Müteakip');
  const [newDeceasedCemetery, setNewDeceasedCemetery] = useState('Hamitler Kent Mezarlığı');
  const [newDeceasedDate, setNewDeceasedDate] = useState('Bugün');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // ── PWA & ACİL YARDIM STATE ──
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Dijital Mutlular telefonunuza yükleniyor! 📱');
      }
      setDeferredInstallPrompt(null);
      setIsInstallable(false);
    } else {
      showToast('iPhone Safari: Paylaş butonuna basıp "Ana Ekrana Ekle"yi seçiniz 📲', false);
    }
  };

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cenaze ilanlarını 7 saniyede bir otomatik kaydır
  useEffect(() => {
    if (deceasedList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentDeceasedIdx(prev => (deceasedList.length ? (prev + 1) % deceasedList.length : 0));
    }, 7000);
    return () => clearInterval(interval);
  }, [deceasedList.length]);

  // ── SOSYAL MEDYA LİNKİNDEN TIKLANINCA HABERİN OTOMATİK AÇILMASI (DEEP LINKING) ──
  useEffect(() => {
    const handleUrlNews = () => {
      const params = new URLSearchParams(window.location.search);
      const haberParam = params.get('haber') || params.get('news') || params.get('id');
      const hash = window.location.hash;
      let target = haberParam;
      if (!target && hash.startsWith('#haber-')) {
        target = hash.replace('#haber-', '');
      }

      if (target && newsItems.length > 0) {
        const decoded = decodeURIComponent(target).trim().toLowerCase();
        const found = newsItems.find(n => 
          (n.id && n.id.toLowerCase() === decoded) ||
          n.baslik.toLowerCase() === decoded ||
          n.baslik.toLowerCase().includes(decoded)
        );
        if (found) {
          setSelectedNews(found);
        }
      }
    };

    handleUrlNews();
    window.addEventListener('popstate', handleUrlNews);
    return () => window.removeEventListener('popstate', handleUrlNews);
  }, [newsItems]);

  // ── İÇERİK BAĞLANTILARI (FAZ 2A): /{tür}/{slug}--{id} veya ?i={tür}/{slug}--{id} ──
  // ── EKRAN ADRESLERİ: mutlularhaber.com/haber, /alimsatim, /hizmet, /pano ... ──
  // Ekran değişince adres çubuğu güncellenir; geri/ileri düğmesi ve doğrudan adres de ekranı açar.
  const firstRouteRef = useRef(true);
  useEffect(() => {
    const base = getBase();
    const isFirst = firstRouteRef.current;
    firstRouteRef.current = false;
    // Açık bir içerik bağlantısı (haber/ilan/... veya eski ?haber=) varsa adresine dokunma
    const params = new URLSearchParams(window.location.search);
    const contentOpen = parseContentLink(window.location, base) !== null || params.has('haber') || params.has('news') || params.has('id');
    if (contentOpen) return;
    if (isCanonicalSection(window.location.pathname, activeTab, base)) return;
    const target = sectionPath(activeTab, base);
    // İlk yüklemede (tanınmayan veya Türkçe yazımlı adres) geçmişe yeni kayıt eklemeden kanonik adrese çevir
    if (isFirst) window.history.replaceState({}, '', target + window.location.hash);
    else window.history.pushState({}, '', target + window.location.hash);
  }, [activeTab]);

  useEffect(() => {
    const onPop = () => {
      const t = tabFromPathname(window.location.pathname, getBase()) as MainTab | null;
      if (t) setActiveTab(t);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const read = () => setDeepLink(parseContentLink(window.location, getBase()));
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  useEffect(() => {
    if (!deepLink) return;
    // Hizmet bağlantısı: hizmet sekmesini ve ilgili kategorinin talep formunu açar
    if (deepLink.type === 'hizmet') {
      const key = `hizmet:${deepLink.slug}`;
      if (resolvedLinkRef.current === key) return;
      resolvedLinkRef.current = key;
      const cat = ALL_SERVICE_CATEGORIES.find((c: any) => slugify(c.name) === deepLink.slug || slugify(c.shortTitle || '') === deepLink.slug || c.id === deepLink.slug);
      setActiveTab('services');
      setServiceViewMode('requests');
      if (cat) handleOpenCategoryRequest(cat.id);
      return;
    }
    if (!deepLink.id) return;
    const key = `${deepLink.type}:${deepLink.id}`;

    // Haber: listeden aç; listede yoksa belgeyi doğrudan getir
    if (deepLink.type === 'haber') {
      if (resolvedLinkRef.current === key) return;
      const found = newsItems.find((n) => n.id === deepLink.id);
      if (found) {
        setSelectedNews(found);
        resolvedLinkRef.current = key;
        return;
      }
      if (resolvedLinkRef.current === key + ':fetch') return;
      resolvedLinkRef.current = key + ':fetch';
      getDoc(doc(db, 'haberler', deepLink.id))
        .then((snap) => {
          if (snap.exists()) {
            setSelectedNews({ ...(snap.data() as any), id: snap.id } as SampleNewsItem);
            resolvedLinkRef.current = key;
          } else {
            showToast('Bu bağlantıdaki haber bulunamadı veya yayından kaldırılmış.', true);
          }
        })
        .catch(() => showToast('Bu bağlantıdaki haber açılamadı.', true));
      return;
    }

    // Diğer türler: eşlenen koleksiyonlarda ara, ortak içerik sayfasında göster
    if (resolvedLinkRef.current === key) return;
    resolvedLinkRef.current = key;
    const candidates = CONTENT_COLLECTIONS[deepLink.type as Exclude<ContentType, 'hizmet'>] || [];
    (async () => {
      for (const c of candidates) {
        try {
          const snap = await getDoc(doc(db, c.col, deepLink.id!));
          if (snap.exists()) {
            const data = snap.data() as any;
            if (c.kind === 'isletme') {
              openBusiness({ ...data, id: snap.id } as Business);
              return;
            }
            setSharedContent({
              kind: c.kind,
              type: deepLink.type,
              id: snap.id,
              data,
              url: dataToShareItem(c.kind, data, snap.id).url
            });
            return;
          }
        } catch (_) {
          /* yetki yok veya ağ hatası: sıradaki koleksiyonu dene */
        }
      }
      showToast('Bu bağlantıdaki içerik bulunamadı veya yayından kaldırılmış.', true);
    })();
  }, [deepLink, newsItems]);

  const handleOpenNewsDetail = (news: SampleNewsItem) => {
    setSelectedNews(news);
    const url = new URL(window.location.href);
    url.searchParams.set('haber', news.id || encodeURIComponent(news.baslik));
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseNewsDetail = () => {
    setSelectedNews(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('haber');
    url.searchParams.delete('news');
    url.searchParams.delete('id');
    resolvedLinkRef.current = '';
    setDeepLink(null);
    window.history.pushState({}, '', cleanedUrl(window.location, getBase(), TAB_PATHS[activeTab] || ''));
  };

  // Haber bağlantısı: yeni içerik adresi şeması (eski ?haber= adresleri çalışmaya devam eder)
  const getNewsShareUrl = (news: SampleNewsItem) => buildContentUrl('haber', news.id || slugify(news.baslik), news.baslik);

  // ── PAYLAŞIM STÜDYOSU YARDIMCILARI ──
  const openShareStudio = (item: ShareItem) => setShareItem(item);

  const newsToShareItem = (n: SampleNewsItem): ShareItem => ({
    type: 'haber',
    title: n.baslik,
    summary: n.ozet || (n.icerik ? n.icerik.substring(0, 180) : ''),
    category: n.kategori,
    imageUrl: (n as any).imageURL || undefined,
    meta: n.tarihStr ? [n.tarihStr] : [],
    url: getNewsShareUrl(n),
    contentId: n.id
  });

  // Herhangi bir içerik (kind + veri) -> paylaşım öğesi. Kişisel iletişim bilgisi görsele/metne eklenmez.
  const dataToShareItem = (kind: ContentKind, d: any, id: string): ShareItem => {
    const type = KIND_TO_TYPE[kind];
    const photo: string | undefined = (d.fotolar && d.fotolar[0]) || d.fotoUrl || d.davetiyeFoto || d.imageURL || undefined;
    const base = { type, contentId: id, imageUrl: photo } as const;
    switch (kind) {
      case 'cenaze':
        return {
          ...base,
          imageUrl: undefined,
          title: `${d.fullName}${d.age ? `, ${d.age}` : ''}`,
          summary: d.family ? `${d.family} adına vefat duyurusu` : 'Vefat duyurusu',
          category: 'Vefat İlanı',
          meta: [d.dateStr ? `📅 ${d.dateStr}` : '', d.mosque ? `🕌 ${d.mosque}${d.prayerTime ? ' • ' + d.prayerTime : ''}` : '', d.cemetery ? `⚰️ ${d.cemetery}` : ''].filter(Boolean),
          url: buildContentUrl('cenaze', id, d.fullName)
        };
      case 'marketplace':
        return {
          ...base,
          title: d.baslik,
          summary: d.aciklama ? String(d.aciklama).substring(0, 180) : '',
          category: d.ilanTuru === 'emlak' ? 'Emlak İlanı' : '2. El İlanı',
          meta: typeof d.fiyat === 'number' ? [`💰 ${d.fiyat.toLocaleString('tr-TR')} TL`] : [],
          url: buildContentUrl('ilan', id, d.baslik)
        };
      case 'kayip':
        return {
          ...base,
          title: d.baslik,
          summary: d.aciklama ? String(d.aciklama).substring(0, 180) : '',
          category: d.tur === 'bulundu' ? 'Bulundu' : 'Kayıp İlanı',
          meta: d.konum ? [`📍 ${d.konum}`] : [],
          url: buildContentUrl('ilan', id, d.baslik)
        };
      case 'davet':
        return {
          ...base,
          title: d.baslik,
          summary: d.aciklama ? String(d.aciklama).substring(0, 180) : '',
          category: d.turEtiketi || 'Duyuru',
          meta: [d.tarih ? `📅 ${d.tarih}${d.saat ? ' • ' + d.saat : ''}` : '', d.mekanAdi ? `📍 ${d.mekanAdi}` : ''].filter(Boolean),
          url: buildContentUrl('duyuru', id, d.baslik)
        };
      case 'kursu':
        return {
          ...base,
          title: d.baslik,
          summary: d.icerik ? String(d.icerik).substring(0, 180) : '',
          category: d.kategori || 'Mahalle Kürsüsü',
          meta: d.konum ? [`📍 ${d.konum}`] : [],
          url: buildContentUrl('duyuru', id, d.baslik)
        };
      case 'isletme':
        return {
          ...base,
          imageUrl: (d.fotolar && d.fotolar[0]) || d.logoUrl || undefined,
          title: d.isyeri,
          summary: d.aciklama ? String(d.aciklama).substring(0, 180) : '',
          category: d.kategori || 'İşletme',
          meta: [d.adres ? `📍 ${d.adres}` : '', d.calismaSaatleri ? `🕒 ${d.calismaSaatleri}` : ''].filter(Boolean),
          url: buildContentUrl('esnaf', id, d.isyeri)
        };
      case 'kampanya':
        return {
          ...base,
          title: d.baslik,
          summary: d.aciklama ? String(d.aciklama).substring(0, 180) : '',
          category: d.isyeriAdi || 'Esnaf Kampanyası',
          meta: [d.indirimOrani ? `🏷️ ${d.indirimOrani}` : '', d.adres ? `📍 ${d.adres}` : ''].filter(Boolean),
          url: buildContentUrl('esnaf', id, d.isyeriAdi || d.baslik)
        };
      default:
        return { ...base, title: d.baslik || d.title || '', summary: '', url: buildContentUrl(type, id, d.baslik) };
    }
  };

  const closeSharedContent = () => {
    resolvedLinkRef.current = '';
    setSharedContent(null);
    setDeepLink(null);
    window.history.replaceState({}, '', cleanedUrl(window.location, getBase(), TAB_PATHS[activeTab] || ''));
  };

  const handleCopySharedLink = async (c: SharedContent) => {
    try {
      await navigator.clipboard.writeText(c.url);
      showToast('Bağlantı kopyalandı 🔗');
    } catch (_) {
      showToast('Bağlantı: ' + c.url);
    }
  };

  // Paylaşım durumu takibi: yalnızca editör/yönetici paylaşımları kaydedilir (social_shares)
  const recordShare = (item: ShareItem, channel: string) => {
    if (!isRealStaff || !user) return;
    addDoc(collection(db, 'social_shares'), {
      contentType: item.type,
      contentId: item.contentId || '',
      title: item.title.slice(0, 120),
      channel,
      uid: user.uid,
      createdAt: serverTimestamp()
    }).catch(() => {});
  };

  const handleShareWhatsApp = (news: SampleNewsItem) => {
    const shareUrl = getNewsShareUrl(news);
    const text = `📢 *${news.baslik}*\n\n${news.ozet || (news.icerik ? news.icerik.substring(0, 140) + '...' : '')}\n\n👉 Haberin tamamını okumak için tıklayın:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = (news: SampleNewsItem) => {
    const shareUrl = getNewsShareUrl(news);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = (news: SampleNewsItem) => {
    const shareUrl = getNewsShareUrl(news);
    const text = `${news.baslik} - Mutlular Mahallesi Haberleri`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleCopyNewsLink = async (news: SampleNewsItem) => {
    const shareUrl = getNewsShareUrl(news);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Haber linki kopyalandı! Sosyal medyada paylaşabilirsiniz 🔗');
    } catch (_) {
      showToast('Haber bağlantısı hazır!');
    }
  };

  const handleOpenEditRequest = (req: ServiceRequest) => {
    setEditingRequest(req);
    setEditReqTitle(req.baslik || '');
    setEditReqDesc(req.aciklama || '');
    setEditReqPhotos(req.fotolar ? [...req.fotolar] : []);
    setEditReqKategori(req.kategori || 'Tesisat & Su');
    setEditReqAdres(req.adres || '');
    setNewPhotoUrl('');
  };

  const handleAddPhotoToEdit = (urlToAdd?: string) => {
    const url = (urlToAdd || newPhotoUrl).trim();
    if (!url) return;
    setEditReqPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setNewPhotoUrl('');
  };

  const handleRemovePhotoFromEdit = (indexToRemove: number) => {
    setEditReqPhotos(editReqPhotos.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUploadPhotoToEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await compressImage(file);
        handleAddPhotoToEdit(dataUrl);
        showToast('Fotoğraf başarıyla eklendi! 📸');
      } catch (_) {
        showToast('Fotoğraf yüklenemedi', true);
      }
    }
  };

  const handleSaveEditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    if (!editReqTitle.trim()) {
      showToast('Lütfen talep başlığı girin', true);
      return;
    }

    const updatedReq: ServiceRequest = {
      ...editingRequest,
      baslik: editReqTitle.trim(),
      aciklama: editReqDesc.trim(),
      kategori: editReqKategori,
      adres: editReqAdres.trim(),
      fotolar: editReqPhotos.filter(p => p.trim().length > 0)
    };

    // Anında yerel state'i güncelle
    setServiceRequests(prev => prev.map(item => {
      if (editingRequest.id && item.id === editingRequest.id) {
        return updatedReq;
      }
      if (!editingRequest.id && item.baslik === editingRequest.baslik && item.authorName === editingRequest.authorName) {
        return updatedReq;
      }
      return item;
    }));

    // Firestore'da id varsa güncelle
    if (editingRequest.id) {
      try {
        const reqRef = doc(db, 'service_requests', editingRequest.id);
        await updateDoc(reqRef, {
          baslik: updatedReq.baslik,
          aciklama: updatedReq.aciklama,
          kategori: updatedReq.kategori,
          adres: updatedReq.adres,
          fotolar: updatedReq.fotolar
        });
      } catch (err: any) {
        console.warn('Firestore service request update error:', err);
      }
    }

    setEditingRequest(null);
    showToast('Hizmet talebiniz başarıyla güncellendi! ✏️');
  };

  // Google ile ilk kez girenin bilgi formunu açar (ad / soyad Google adından önceden doldurulur).
  const startOnboarding = (u: { displayName?: string | null; email?: string | null }) => {
    const parts = (u.displayName || '').trim().split(/\s+/).filter(Boolean);
    setObAd(parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] || ''));
    setObSoyad(parts.length > 1 ? parts[parts.length - 1] : '');
    setObPhone('');
    setObRole('sakin');
    setObIsyeri('');
    setObArea('');
    setObCustomArea('');
    setShowAuthModal(false);
    setShowOnboarding(true);
  };

  // 1. Auth Listener & Profile Loader
  // Oturum yalnızca Firebase Authentication üzerinden doğrulanır (tarayıcıda saklanan uid'ye güvenilmez).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const isAdminEmail = currentUser.email === 'yakupkrbck@gmail.com';
          const isUserAdmin = isAdminEmail && currentUser.emailVerified;
          if (isAdminEmail && !currentUser.emailVerified) {
            sendEmailVerification(currentUser).catch(() => {});
            showToast('Yönetici yetkisi için e-postanıza gönderilen doğrulama bağlantısına tıklayın, sonra tekrar giriş yapın. 📧');
          }
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (isUserAdmin && data.role !== 'admin') {
              data.role = 'admin';
              data.credits = 9999;
              await updateDoc(userRef, { role: 'admin', credits: 9999 });
            }
            // Eski sürümlerden kalan düz metin şifre alanını Firestore'dan sil
            if ((data as any).passwordHash !== undefined) {
              delete (data as any).passwordHash;
              updateDoc(userRef, { passwordHash: deleteField() }).catch(() => {});
            }
            if (data.newsNotificationPreferences) {
              setNewsNotifPrefs(data.newsNotificationPreferences);
              localStorage.setItem('dijitalmutlular_news_notif_prefs', JSON.stringify(data.newsNotificationPreferences));
            }
            setNotifPrefs(normalizePrefs((data as any).notifPrefs, data.newsNotificationPreferences));
            setNotifReadIds(Array.isArray((data as any).notifReadIds) ? (data as any).notifReadIds : []);
            setProfile(data);
            setDemoRole(data.role);
            setRealRole(data.role);
          } else if (!suppressAutoProfileRef.current) {
            if (isUserAdmin) {
              const adminProfile: UserProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Yakup Bey (Yönetici)',
                email: currentUser.email || '',
                role: 'admin',
                credits: 9999,
                isApproved: true,
                newsNotificationPreferences: newsNotifPrefs,
                createdAt: new Date(),
              };
              await setDoc(userRef, adminProfile);
              setProfile(adminProfile);
              setDemoRole('admin');
              setRealRole('admin');
            } else {
              // Yeni kullanıcı: kendini tanıtana kadar (mahalleli / usta / esnaf) hesap oluşturulmaz.
              startOnboarding(currentUser);
            }
          }
        } catch (e: any) {
          console.warn('Profile load err:', e.message);
        }
      } else {
        localStorage.removeItem('dijitalmutlular_active_session');
        setProfile(null);
        setDemoRole('sakin');
        setRealRole('sakin');
      }
    });

    return () => unsub();
  }, []);

  // 2. Real-time Firestore Listeners with Fallback to Mock Data
  useEffect(() => {
    // News
    const qNews = query(collection(db, 'haberler'), orderBy('createdAt', 'desc'));
    const unsubNews = onSnapshot(qNews, (snap) => {
      {
        const seen = new Set<string>();
        const items: SampleNewsItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = data.title || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as SampleNewsItem);
          }
        });
        setNewsItems(items);
      }
    }, (err) => console.warn('news firestore:', err.message));

    // Marketplace
    const qMarket = query(collection(db, 'marketplace_items'), orderBy('createdAt', 'desc'));
    const unsubMarket = onSnapshot(qMarket, (snap) => {
      {
        const seen = new Set<string>();
        const items: MarketplaceItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = data.baslik || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as MarketplaceItem);
          }
        });
        setMarketplaceItems(items);
      }
    }, (err) => console.warn('market firestore:', err.message));

    // Lost & Found
    const qLf = query(collection(db, 'lost_found_items'), orderBy('createdAt', 'desc'));
    const unsubLf = onSnapshot(qLf, (snap) => {
      {
        const seen = new Set<string>();
        const items: LostFoundItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = data.baslik || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as LostFoundItem);
          }
        });
        setLostFoundItems(items);
      }
    }, (err) => console.warn('lostfound firestore:', err.message));

    // Canlı yayın ayarı (yönetici / editör yönetir)
    const unsubLive = onSnapshot(doc(db, 'ayarlar', 'canli_yayin'), (snap) => {
      setLiveConfig(snap.exists() ? ({ ...EMPTY_LIVE, ...(snap.data() as any) } as LiveConfig) : EMPTY_LIVE);
    }, (err) => console.warn('canli_yayin firestore:', err.message));

    // Anketler
    const unsubPolls = onSnapshot(collection(db, 'polls'), (snap) => {
      const items: PollItem[] = [];
      snap.forEach((d) => {
        const x: any = d.data();
        const opts: string[] = Array.isArray(x.secenekler) ? x.secenekler : [];
        items.push({
          id: d.id,
          soru: x.soru || '',
          kategori: x.kategori || 'genel',
          secenekler: opts,
          aktif: x.aktif !== false,
          toplam: x.toplam || 0,
          sayilar: opts.map((_: string, i: number) => x['c' + i] || 0),
          endsAtMs: toMillis(x.endsAt),
          createdAtMs: toMillis(x.createdAt) || Date.now(),
          authorName: x.authorName
        });
      });
      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      setPolls(items);
    }, (err) => console.warn('polls firestore:', err.message));

    // Faaliyet alanları (ustaların eklediği)
    const unsubAreas = onSnapshot(collection(db, 'hizmet_alanlari'), (snap) => {
      const items: HizmetAlani[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as HizmetAlani));
      items.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
      setCustomAreas(items);
    }, (err) => console.warn('hizmet_alanlari firestore:', err.message));

    // Service Requests
    const qReq = query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      {
        const items: ServiceRequest[] = [];
        snap.forEach((d) => {
          items.push({ ...d.data(), id: d.id } as ServiceRequest);
        });
        setServiceRequests(items);
      }
    }, (err) => console.warn('service firestore:', err.message));

    // Campaigns / Mahalle Pazarı
    // Onaylı işletme sayfaları (esnaf rehberi)
    const unsubBiz = onSnapshot(query(collection(db, 'businesses'), where('approvalStatus', '==', 'approved')), (snap) => {
      const items: Business[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as Business));
      items.sort((a, b) => a.isyeri.localeCompare(b.isyeri, 'tr'));
      setBusinesses(items);
    }, (err) => console.warn('businesses firestore:', err.message));

    const qCamp = query(collection(db, 'esnaf_kampanyalar'), orderBy('createdAt', 'desc'));
    const unsubCamp = onSnapshot(qCamp, (snap) => {
      {
        const seen = new Set<string>();
        const items: EsnafCampaign[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = (data.isyeriAdi + '-' + data.baslik) || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            // Onay bekleyen / reddedilen kampanyalar herkese gösterilmez (eski kayıtlarda durum alanı yoktur: yayında sayılır)
            if (data.status === 'pending' || data.status === 'rejected') return;
            items.push({ ...data, id: d.id } as EsnafCampaign);
          }
        });
        setCampaigns(items);
      }
    }, (err) => console.warn('campaigns firestore:', err.message));

    // Mahalle Kürsüsü
    const qKursu = query(collection(db, 'mahalle_kursusu'), orderBy('createdAt', 'desc'));
    const unsubKursu = onSnapshot(qKursu, (snap) => {
      {
        const seen = new Set<string>();
        const items: MahalleKursusuItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = (data.yazar + '-' + data.metin?.slice(0, 30)) || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as MahalleKursusuItem);
          }
        });
        setKursuItems(items);
      }
    }, (err) => console.warn('kursu firestore:', err.message));

    // Mahalle Davetleri (Düğün, Nişan, Sünnet vb.)
    const qDavet = query(collection(db, 'mahalle_davetleri'), orderBy('createdAt', 'desc'));
    const unsubDavet = onSnapshot(qDavet, (snap) => {
      {
        const seen = new Set<string>();
        const items: MahalleDavetItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = data.baslik || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as MahalleDavetItem);
          }
        });
        setInvitationItems(items);
      }
    }, (err) => console.warn('davet firestore:', err.message));

    // Cenaze & Vefat İlanları Dinleyicisi
    // Yalnızca onaylanıp yayınlanmış vefat ilanları herkese görünür (sıralama istemcide: bileşik indeks gerekmesin)
    const qDeceased = query(collection(db, 'cenaze_ilanlari'), where('status', '==', 'published'));
    const unsubDeceased = onSnapshot(qDeceased, (snap) => {
      const items: DeceasedItem[] = [];
      snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as DeceasedItem));
      items.sort((x: any, y: any) => (toMillis(y.publishedAt) || toMillis(y.createdAt) || Date.now()) - (toMillis(x.publishedAt) || toMillis(x.createdAt) || Date.now()));
      setDeceasedList(items);
    }, (err) => console.warn('cenaze firestore:', err.message));

    // Kullanıcılar (Rol Yönetimi için)
    const qUsers = query(collection(db, 'users'), limit(50));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const uList: UserProfile[] = [];
      snap.forEach((d) => {
        uList.push({ ...d.data(), uid: d.id } as UserProfile);
      });
      setAllUsersList(uList);
    }, (err) => console.warn('users firestore:', err.message));

    return () => {
      unsubNews();
      unsubMarket();
      unsubLf();
      unsubReq();
      unsubAreas();
      unsubPolls();
      unsubLive();
      unsubCamp();
      unsubBiz();
      unsubKursu();
      unsubDavet();
      unsubDeceased();
      unsubUsers();
    };
  }, []);

  // ── 👑 YÖNETİCİ & EDİTÖR YÖNETİM FONKSİYONLARI ──
  const handlePublishOfficialNews = async (newsData: {
    baslik: string;
    kategori: string;
    ozet: string;
    icerik: string;
    imageURL: string;
    sonDakika: boolean;
    bildirimKategorisi?: 'sondakika' | 'haber' | 'duyuru' | 'etkinlik';
    authorName?: string;
  }) => {
    const newItem: SampleNewsItem = {
      id: 'h_' + Date.now(),
      baslik: newsData.baslik,
      kategori: newsData.kategori,
      ozet: newsData.ozet,
      icerik: newsData.icerik,
      imageURL: newsData.imageURL || '',
      sonDakika: newsData.sonDakika,
      bildirimKategorisi: (newsData as any).bildirimKategorisi || (newsData.sonDakika ? 'sondakika' : 'haber'),
      status: 'approved',
      authorName: newsData.authorName || profile?.name || 'Mutlular Haber',
      authorUid: user?.uid || 'admin_user',
      authorRole: demoRole === 'admin' ? 'admin' : 'editor',
      okunmaSayisi: 1,
      begeniSayisi: 0,
      tarihStr: 'Az önce'
    };

    setNewsItems(prev => [newItem, ...prev]);
    try {
      await addDoc(collection(db, 'haberler'), {
        ...newItem,
        createdAt: serverTimestamp()
      });
    } catch (_) {}
    showToast('Resmi haber başarıyla Mutlular Haber bülteninde yayınlandı! 📰');
  };

  const handleApproveNewsTip = async (tip: SampleNewsItem) => {
    const updated: SampleNewsItem = {
      ...tip,
      status: 'approved',
      tarihStr: 'Az önce'
    };
    setNewsItems(prev => prev.map(n => (n.id === tip.id || n.baslik === tip.baslik) ? updated : n));

    if (tip.id && !tip.id.startsWith('ihbar_')) {
      try {
        await updateDoc(doc(db, 'haberler', tip.id), {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: profile?.name || 'Yönetici'
        });
      } catch (_) {}
    } else {
      try {
        await addDoc(collection(db, 'haberler'), {
          ...updated,
          createdAt: serverTimestamp()
        });
      } catch (_) {}
    }
    showToast('İhbar onaylandı ve Mutlular Haber vitrininde yayına alındı! ✅');
  };

  const handleRejectNewsTip = async (tip: SampleNewsItem, reason?: string) => {
    setNewsItems(prev => prev.map(n => (n.id === tip.id || n.baslik === tip.baslik) ? { ...n, status: 'rejected', tipStatusNote: reason || 'Teyit edilemedi' } : n));
    if (tip.id && !tip.id.startsWith('ihbar_')) {
      try {
        await updateDoc(doc(db, 'haberler', tip.id), {
          status: 'rejected',
          tipStatusNote: reason || 'Teyit edilemedi'
        });
      } catch (_) {}
    }
    showToast('Haber ihbarı reddedildi. ❌');
  };

  // ── TEKLİFLER: herkes yalnızca kendisini ilgilendiren teklifleri dinler ──
  // Usta: verdiği teklifler • Talep sahibi: talebine gelen teklifler • Yönetici: tümü
  useEffect(() => {
    if (!user) {
      setOffersMap({});
      return;
    }
    const isAdm = profile?.role === 'admin' || (user.email === 'yakupkrbck@gmail.com' && user.emailVerified);
    const queries = isAdm
      ? [query(collection(db, 'offers'))]
      : [
          query(collection(db, 'offers'), where('esnafUid', '==', user.uid)),
          query(collection(db, 'offers'), where('requestOwnerUid', '==', user.uid))
        ];
    const buckets: ServiceOffer[][] = queries.map(() => []);
    const publish = () => {
      const byId = new Map<string, ServiceOffer>();
      buckets.flat().forEach((o) => { if (o.id) byId.set(o.id, o); });
      const map: Record<string, ServiceOffer[]> = {};
      Array.from(byId.values())
        .sort((a, b) => (toMillis(b.createdAt) || Date.now()) - (toMillis(a.createdAt) || Date.now()))
        .forEach((o) => {
          if (!map[o.requestId]) map[o.requestId] = [];
          map[o.requestId].push(o);
        });
      setOffersMap(map);
    };
    const unsubs = queries.map((q, idx) =>
      onSnapshot(
        q,
        (snap) => {
          buckets[idx] = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ServiceOffer));
          publish();
        },
        (err) => console.warn('offers firestore:', err.message)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [user?.uid, profile?.role]);

  // ── USTA TELEFONU: yalnızca KABUL EDİLMİŞ tekliflerde, talep sahibi için ayrı belgeden okunur ──
  useEffect(() => {
    if (!user) {
      setUstaPhones({});
      fetchedPhoneIdsRef.current = new Set();
      return;
    }
    (Object.values(offersMap) as ServiceOffer[][]).flat().forEach((o) => {
      const id = o.id;
      if (!id || o.status !== 'accepted' || o.requestOwnerUid !== user.uid) return;
      if (fetchedPhoneIdsRef.current.has(id)) return;
      fetchedPhoneIdsRef.current.add(id);
      getDoc(doc(db, 'offers', id, 'private', 'iletisim'))
        .then((snap: any) => {
          const tel = snap.exists() ? String((snap.data() as any).telefon || '') : '';
          setUstaPhones((prev: Record<string, string>) => ({ ...prev, [id]: tel }));
        })
        .catch((err: any) => {
          fetchedPhoneIdsRef.current.delete(id);
          console.warn('usta telefonu:', err?.message);
        });
    });
  }, [offersMap, user?.uid]);

  // ── BİLDİRİM İZLEME NOKTASI (en son ne zaman bakıldı) ──
  useEffect(() => {
    if (!user || !profile) return;
    if (typeof profile.notifSeenAt === 'number') {
      setNotifSeenAt(profile.notifSeenAt);
      return;
    }
    const now = Date.now();
    setNotifSeenAt(now);
    updateDoc(doc(db, 'users', user.uid), { notifSeenAt: now }).catch(() => {});
  }, [user?.uid, profile?.uid, profile?.notifSeenAt]);

  // ── TÜRETİLMİŞ BİLDİRİMLER ──
  // İçerik (haber, vefat, etkinlik, kampanya, acil kayıp) + kişiye özel (yeni talep, teklif, kabul).
  // Genel anahtar ve kategori tercihleri uygulanır; tercih dışı kategori hiç görünmez.
  const derivedNotifications = useMemo(() => {
    if (!user || !notifSeenAt || !newsNotifPrefs.enabled) return [] as any[];

    const content = buildContentNotifications({
      news: newsItems,
      deceased: deceasedList,
      invitations: invitationItems,
      campaigns,
      lostFound: lostFoundItems,
      prefs: notifPrefs,
      seenAt: notifSeenAt,
      readIds: notifReadIds
    }) as any[];

    const list: any[] = [...content];
    const push = (n: any) => {
      if (!notifPrefs[n.type as keyof NotifPrefs]) return;
      list.push({
        ...n,
        time: timeAgoTr(n.ms),
        read: n.ms <= notifSeenAt || notifReadIds.includes(n.id)
      });
    };

    if (isUstaProfile(profile)) {
      serviceRequests.forEach((r) => {
        if (!r.id || r.uid === user.uid) return;
        if (r.status && r.status !== 'open') return;
        if (!requestMatchesEsnaf(r, profile, ALL_SERVICE_CATEGORIES)) return;
        const ms = toMillis(r.createdAt) || Date.now();
        push({ id: 'dn_req_' + r.id, type: 'hizmet', category: 'YENİ TALEP', icon: '🛠️', badgeColor: 'bg-orange-600', title: `Size uygun yeni talep: ${r.baslik} (${r.kategori})`, ms, target: { kind: 'talep', id: r.id } });
      });
    }
    // İşletme sayfası ve kampanya kararları (esnaf)
    if (isEsnafAccount) {
      if (myBusiness && (myBusiness.approvalStatus === 'approved' || myBusiness.approvalStatus === 'rejected') && toMillis(myBusiness.reviewedAt)) {
        const ok = myBusiness.approvalStatus === 'approved';
        push({
          id: `dn_biz_${myBusiness.approvalStatus}_${toMillis(myBusiness.reviewedAt)}`,
          type: 'isletme',
          category: 'İŞLETME SAYFASI',
          icon: ok ? '✅' : '❌',
          badgeColor: ok ? 'bg-emerald-600' : 'bg-red-600',
          title: ok ? 'İşletme sayfanız onaylandı ve esnaf rehberinde yayınlandı.' : `İşletme sayfanız onaylanmadı${myBusiness.reviewNote ? `: ${myBusiness.reviewNote}` : '.'}`,
          ms: toMillis(myBusiness.reviewedAt),
          target: { kind: 'isletme', id: myBusiness.id }
        });
      }
      myCampaignsAll.forEach((c) => {
        const rms = toMillis(c.reviewedAt);
        if (!c.id || !rms || (c.status !== 'published' && c.status !== 'rejected')) return;
        const ok = c.status === 'published';
        push({
          id: `dn_camp_${c.id}_${c.status}`,
          type: 'isletme',
          category: 'KAMPANYA',
          icon: ok ? '✅' : '❌',
          badgeColor: ok ? 'bg-emerald-600' : 'bg-red-600',
          title: ok ? `Kampanyanız yayınlandı: ${c.baslik}` : `Kampanyanız onaylanmadı: ${c.baslik}${c.reviewNote ? ` (${c.reviewNote})` : ''}`,
          ms: rms,
          target: { kind: 'isletme', id: myBusiness?.id || user.uid }
        });
      });
    }
    (Object.values(offersMap) as ServiceOffer[][]).flat().forEach((o) => {
      const ms = toMillis(o.createdAt) || Date.now();
      if (o.requestOwnerUid === user.uid) {
        push({ id: 'dn_off_' + o.id, type: 'teklif', category: 'YENİ TEKLİF', icon: '💰', badgeColor: 'bg-emerald-600', title: `${o.esnafIsyeri} talebinize ${o.fiyat} TL teklif verdi${o.requestTitle ? `: ${o.requestTitle}` : ''}`, ms, target: { kind: 'talep', id: o.requestId } });
      }
      if (o.esnafUid === user.uid && o.status === 'accepted') {
        push({ id: 'dn_acc_' + o.id, type: 'teklif', category: 'TEKLİF KABUL', icon: '✅', badgeColor: 'bg-blue-600', title: `Teklifiniz kabul edildi${o.requestTitle ? `: ${o.requestTitle}` : ''}. Müşteriyle iletişime geçin.`, ms: toMillis(o.acceptedAt) || ms, target: { kind: 'talep', id: o.requestId } });
      }
    });
    return list.sort((a, b) => b.ms - a.ms).slice(0, 50);
  }, [user?.uid, profile, serviceRequests, offersMap, notifSeenAt, notifReadIds, notifPrefs, newsNotifPrefs.enabled, newsItems, deceasedList, invitationItems, campaigns, lostFoundItems, isEsnafAccount, myBusiness, myCampaignsAll]);

  const allNotifications = useMemo(() => [...derivedNotifications, ...notifications], [derivedNotifications, notifications]);
  const unreadNotifCount = useMemo(() => allNotifications.filter((n: any) => !n.read).length, [allNotifications]);

  // Uygulama açıkken yeni okunmamış bildirim gelince: kısa uyarı, (son dakika ise) ses ve izin verilmişse tarayıcı bildirimi
  const prevUnreadIdsRef = useRef<string[] | null>(null);
  useEffect(() => {
    const unread = derivedNotifications.filter((n: any) => !n.read);
    const ids = unread.map((n: any) => n.id as string);
    if (prevUnreadIdsRef.current !== null) {
      const fresh = unread.filter((n: any) => !prevUnreadIdsRef.current!.includes(n.id));
      if (fresh.length > 0) {
        const first: any = fresh[0];
        showToast(`${first.icon} ${fresh.length > 1 ? `${fresh.length} yeni bildiriminiz var` : first.title}`);
        if (fresh.some((n: any) => n.type === 'sondakika')) playAlertSound(true);
        try {
          if (newsNotifPrefs.browserPush && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(first.category, { body: first.title });
          }
        } catch (_) {
          /* bazı mobil tarayıcılar yapıcıyı desteklemez */
        }
      }
    }
    prevUnreadIdsRef.current = ids;
  }, [derivedNotifications]);

  const persistReadIds = (ids: string[]) => {
    const capped = ids.slice(-100);
    setNotifReadIds(capped);
    if (user) updateDoc(doc(db, 'users', user.uid), { notifReadIds: capped }).catch(() => {});
  };

  const handleMarkAllNotificationsRead = () => {
    const now = Date.now();
    setNotifSeenAt(now);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { notifSeenAt: now }).catch(() => {});
      setProfile((prev) => (prev ? { ...prev, notifSeenAt: now } : prev));
    }
    showToast('Tüm bildirimler okundu olarak işaretlendi!');
  };

  // Bildirime dokununca ilgili içeriği açar
  const handleOpenDerivedNotification = (n: any) => {
    if (!notifReadIds.includes(n.id)) persistReadIds([...notifReadIds, n.id]);
    const t = n.target as { kind: string; id: string } | undefined;
    if (!t) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (t.kind === 'talep') {
      const req = serviceRequests.find((r) => r.id === t.id);
      setActiveTab('services');
      setServiceViewMode('requests');
      if (req) setShowRequestDetail(req);
      return;
    }
    if (t.kind === 'haber') {
      const found = newsItems.find((x) => x.id === t.id);
      if (found) handleOpenNewsDetail(found);
      return;
    }
    const pick = (list: any[], kind: ContentKind) => {
      const d = list.find((x) => x.id === t.id);
      if (!d) return;
      const item = dataToShareItem(kind, d, t.id);
      setSharedContent({ kind, type: KIND_TO_TYPE[kind], id: t.id, data: d, url: item.url });
    };
    if (t.kind === 'isletme') {
      if (myBusiness && myBusiness.approvalStatus === 'approved') openBusiness(myBusiness);
      else setShowBusinessEditor(true);
      return;
    }
    if (t.kind === 'cenaze') pick(deceasedList, 'cenaze');
    else if (t.kind === 'davet') pick(invitationItems, 'davet');
    else if (t.kind === 'kampanya') pick(campaigns, 'kampanya');
    else if (t.kind === 'kayip') pick(lostFoundItems, 'kayip');
  };

  // ── FAZ 4: İŞLETME SAYFALARI VE KAMPANYA ONAYI ──
  // Esnafın kendi işletme belgesi (sahibi okur)
  useEffect(() => {
    if (!user || !isEsnafAccount) {
      setMyBusiness(null);
      return;
    }
    return onSnapshot(
      doc(db, 'businesses', user.uid),
      (snap) => setMyBusiness(snap.exists() ? ({ ...(snap.data() as any), id: snap.id } as Business) : null),
      (err) => console.warn('myBusiness:', err.message)
    );
  }, [user?.uid, isEsnafAccount]);

  // Kullanıcının kendi kampanyaları (her durumda)
  useEffect(() => {
    if (!user) {
      setMyCampaignsAll([]);
      return;
    }
    const q = query(collection(db, 'esnaf_kampanyalar'), where('uid', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const items: EsnafCampaign[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as EsnafCampaign));
        items.sort((a, b) => (toMillis(b.createdAt) || Date.now()) - (toMillis(a.createdAt) || Date.now()));
        setMyCampaignsAll(items);
      },
      (err) => console.warn('myCampaigns:', err.message)
    );
  }, [user?.uid]);

  // Editör/yönetici: onay bekleyen işletmeler ve kampanyalar
  useEffect(() => {
    if (!isRealStaff) {
      setPendingBusinesses([]);
      setPendingCampaigns([]);
      return;
    }
    const u1 = onSnapshot(
      query(collection(db, 'businesses'), where('approvalStatus', '==', 'pending')),
      (snap) => {
        const items: Business[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as Business));
        setPendingBusinesses(items);
      },
      (err) => console.warn('bekleyen işletmeler:', err.message)
    );
    const u2 = onSnapshot(
      query(collection(db, 'esnaf_kampanyalar'), where('status', '==', 'pending')),
      (snap) => {
        const items: EsnafCampaign[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as EsnafCampaign));
        setPendingCampaigns(items);
      },
      (err) => console.warn('bekleyen kampanyalar:', err.message)
    );
    return () => {
      u1();
      u2();
    };
  }, [isRealStaff, user?.uid]);

  const errText = (e: any) => (e?.code === 'permission-denied' ? 'yetkiniz yok (Firestore kuralları yayınlandı mı?)' : e?.message || 'bilinmeyen hata');

  const getBusinessFormInitial = (): BusinessFormData => ({
    isyeri: myBusiness?.isyeri ?? profile?.isyeri ?? '',
    kategori: myBusiness?.kategori ?? profile?.esnafKategori ?? '',
    aciklama: myBusiness?.aciklama ?? profile?.esnafAciklama ?? '',
    logoUrl: myBusiness?.logoUrl ?? '',
    fotolar: myBusiness?.fotolar ?? [],
    adres: myBusiness?.adres ?? profile?.adres ?? '',
    calismaSaatleri: myBusiness?.calismaSaatleri ?? profile?.calismaSaatleri ?? '',
    telefon: myBusiness?.telefon ?? profile?.telefon ?? '',
    whatsapp: myBusiness?.whatsapp ?? '',
    instagram: myBusiness?.instagram ?? '',
    website: myBusiness?.website ?? ''
  });

  const handleSaveBusiness = async (data: BusinessFormData): Promise<boolean> => {
    if (!user || !isEsnafAccount) {
      showToast('İşletme sayfası yalnızca esnaf hesabıyla oluşturulabilir.', true);
      return false;
    }
    const ref = doc(db, 'businesses', user.uid);
    const base = {
      ownerUid: user.uid,
      isyeri: data.isyeri,
      kategori: data.kategori,
      aciklama: data.aciklama,
      logoUrl: data.logoUrl || '',
      fotolar: data.fotolar,
      adres: data.adres,
      calismaSaatleri: data.calismaSaatleri,
      telefon: data.telefon,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      website: data.website,
      updatedAt: serverTimestamp()
    };
    try {
      if (!myBusiness) {
        await setDoc(ref, { ...base, approvalStatus: 'pending', createdAt: serverTimestamp() });
        showToast('İşletme sayfanız onaya gönderildi 🏪');
      } else if (myBusiness.approvalStatus === 'rejected') {
        await updateDoc(ref, { ...base, approvalStatus: 'pending', reviewNote: '' });
        showToast('İşletme sayfanız tekrar onaya gönderildi 🏪');
      } else {
        await updateDoc(ref, base);
        showToast('İşletme bilgileriniz kaydedildi ✅');
      }
      return true;
    } catch (e: any) {
      showToast('İşletme sayfası kaydedilemedi: ' + errText(e), true);
      return false;
    }
  };

  const handleApproveBusiness = async (b: Business) => {
    if (!isRealAdmin || !user) return;
    try {
      await updateDoc(doc(db, 'businesses', b.id), { approvalStatus: 'approved', reviewedAt: serverTimestamp(), reviewedBy: user.uid, reviewNote: '' });
      showToast(`"${b.isyeri}" yayınlandı 🏪`);
    } catch (e: any) {
      showToast('Onaylanamadı: ' + errText(e), true);
    }
  };

  const handleRejectBusiness = async (b: Business) => {
    if (!isRealAdmin || !user) return;
    const note = window.prompt('Reddetme nedeni (esnaf görecek):', '');
    if (note === null) return;
    try {
      await updateDoc(doc(db, 'businesses', b.id), { approvalStatus: 'rejected', reviewedAt: serverTimestamp(), reviewedBy: user.uid, reviewNote: note.trim().slice(0, 200) });
      showToast('İşletme başvurusu reddedildi.');
    } catch (e: any) {
      showToast('Reddedilemedi: ' + errText(e), true);
    }
  };

  const handleApproveCampaign = async (c: EsnafCampaign) => {
    if (!isRealStaff || !user || !c.id) return;
    try {
      await updateDoc(doc(db, 'esnaf_kampanyalar', c.id), { status: 'published', reviewedAt: serverTimestamp(), reviewedBy: user.uid });
      showToast(`"${c.baslik}" kampanyası yayınlandı 🏪`);
    } catch (e: any) {
      showToast('Onaylanamadı: ' + errText(e), true);
    }
  };

  const handleRejectCampaign = async (c: EsnafCampaign) => {
    if (!isRealStaff || !user || !c.id) return;
    const note = window.prompt('Reddetme nedeni (esnaf görecek):', '');
    if (note === null) return;
    try {
      await updateDoc(doc(db, 'esnaf_kampanyalar', c.id), { status: 'rejected', reviewedAt: serverTimestamp(), reviewedBy: user.uid, reviewNote: note.trim().slice(0, 200) });
      showToast('Kampanya reddedildi.');
    } catch (e: any) {
      showToast('Reddedilemedi: ' + errText(e), true);
    }
  };

  // Görüntülenme ve etkileşim kaydı: giriş yapmış kullanıcı başına günde bir kez (kurallar da bunu zorlar)
  const todayStr = () => new Date().toISOString().slice(0, 10);

  const trackBusinessView = (b: Business) => {
    if (!user || user.uid === b.ownerUid) return;
    const day = todayStr();
    const key = `v_${b.id}_${day}`;
    if (trackedRef.current.has(key)) return;
    trackedRef.current.add(key);
    setDoc(doc(db, 'businesses', b.id, 'views', `${user.uid}_${day}`), { uid: user.uid, day }).catch(() => {});
  };

  const trackBusinessEvent = (b: Business, type: BusinessEvent) => {
    if (!user || user.uid === b.ownerUid) return;
    const day = todayStr();
    const key = `e_${b.id}_${type}_${day}`;
    if (trackedRef.current.has(key)) return;
    trackedRef.current.add(key);
    setDoc(doc(db, 'businesses', b.id, 'events', `${user.uid}_${type}_${day}`), { uid: user.uid, type, day }).catch(() => {});
  };

  const openBusiness = (b: Business) => {
    setBusinessView(b);
    trackBusinessView(b);
  };

  const closeBusiness = () => {
    setBusinessView(null);
    window.history.replaceState({}, '', cleanedUrl(window.location, getBase(), TAB_PATHS[activeTab] || ''));
    resolvedLinkRef.current = '';
    setDeepLink(null);
  };

  const loadBizStats = async () => {
    if (!user || !myBusiness || myBusiness.approvalStatus !== 'approved') {
      setBizStats(null);
      return;
    }
    const sub = (name: string) => collection(db, 'businesses', user.uid, name);
    const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    try {
      const [v, v7, c, w, sh, m] = await Promise.all([
        getCountFromServer(sub('views')),
        getCountFromServer(query(sub('views'), where('day', '>=', since))),
        getCountFromServer(query(sub('events'), where('type', '==', 'call'))),
        getCountFromServer(query(sub('events'), where('type', '==', 'whatsapp'))),
        getCountFromServer(query(sub('events'), where('type', '==', 'share'))),
        getCountFromServer(query(sub('events'), where('type', '==', 'map')))
      ]);
      setBizStats({
        views: v.data().count,
        views7: v7.data().count,
        call: c.data().count,
        whatsapp: w.data().count,
        share: sh.data().count,
        map: m.data().count
      });
    } catch (e: any) {
      console.warn('bizStats:', e?.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'profile') loadBizStats();
  }, [activeTab, myBusiness?.approvalStatus, user?.uid]);

  // Kampanya penceresini açmadan önce kontrol: yalnızca onaylı işletmesi olan esnaf (veya editör/yönetici)
  const openCampaignModal = () => {
    if (!user) {
      showToast('Kampanya yayınlamak için önce giriş yapmalısınız.', true);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (isRealStaff) {
      setShowCampaignModal(true);
      return;
    }
    if (!isEsnafAccount) {
      showToast('Kampanya yayınlamak için esnaf hesabı gerekir.', true);
      return;
    }
    if (!myBusiness || myBusiness.approvalStatus !== 'approved') {
      showToast('Kampanya yayınlamak için önce işletme sayfanızı oluşturup onay almanız gerekir.', true);
      setShowBusinessEditor(true);
      return;
    }
    setCampIsyeri(myBusiness.isyeri);
    setCampAdres(myBusiness.adres);
    setCampTelefon(myBusiness.telefon);
    setShowCampaignModal(true);
  };

  // Kullanıcının daha önce verdiği oyları getir (anket başına bir okuma)
  useEffect(() => {
    if (!user) {
      setMyVotes({});
      return;
    }
    let cancelled = false;
    (async () => {
      const found: Record<string, number> = {};
      for (const p of polls) {
        try {
          const v = await getDoc(doc(db, 'polls', p.id, 'votes', user.uid));
          if (v.exists()) found[p.id] = (v.data() as any).option;
        } catch (_) {
          /* okunamayan anket atlanır */
        }
      }
      if (!cancelled) setMyVotes(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, polls.map((p) => p.id).join(',')]);

  const isPollOpen = (p: PollItem) => p.aktif && (!p.endsAtMs || p.endsAtMs > Date.now());

  const handleVotePoll = async (p: PollItem, optionIndex: number) => {
    if (!user) {
      showToast('Oy kullanmak için önce giriş yapmalısınız.', true);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!isPollOpen(p)) return showToast('Bu anket kapanmış.', true);
    if (myVotes[p.id] !== undefined) return showToast('Bu ankette zaten oy kullandınız.', true);
    try {
      await runTransaction(db, async (tx) => {
        const pRef = doc(db, 'polls', p.id);
        const vRef = doc(db, 'polls', p.id, 'votes', user.uid);
        const [pSnap, vSnap] = await Promise.all([tx.get(pRef), tx.get(vRef)]);
        if (!pSnap.exists()) throw new Error('Anket bulunamadı (silinmiş olabilir).');
        const pd: any = pSnap.data();
        if (pd.aktif === false) throw new Error('Bu anket kapanmış.');
        if (vSnap.exists()) throw new Error('Bu ankette zaten oy kullandınız.');
        tx.set(vRef, { uid: user.uid, option: optionIndex, createdAt: serverTimestamp() });
        tx.update(pRef, { toplam: (pd.toplam || 0) + 1, ['c' + optionIndex]: (pd['c' + optionIndex] || 0) + 1 });
      });
      setMyVotes((prev) => ({ ...prev, [p.id]: optionIndex }));
      showToast('Oyunuz kaydedildi 🗳️');
    } catch (e: any) {
      showToast('Oy kaydedilemedi: ' + (e?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : e?.message || 'bilinmeyen hata'), true);
    }
  };

  const handleCreatePoll = async (data: { soru: string; kategori: PollItem['kategori']; secenekler: string[]; endsAt: Date | null }): Promise<boolean> => {
    if (!isRealStaff || !user) {
      showToast('Anketi yalnızca editör veya yönetici oluşturabilir.', true);
      return false;
    }
    const opts = data.secenekler.map((o) => o.trim()).filter(Boolean);
    if (data.soru.trim().length < 5) { showToast('Anket sorusu en az 5 karakter olmalı.', true); return false; }
    if (opts.length < 2 || opts.length > 6) { showToast('Anket 2 ile 6 seçenek içermeli.', true); return false; }
    if (new Set(opts.map((o) => o.toLocaleLowerCase('tr-TR'))).size !== opts.length) { showToast('Seçenekler birbirinden farklı olmalı.', true); return false; }
    const counters: Record<string, number> = {};
    opts.forEach((_, i) => { counters['c' + i] = 0; });
    try {
      await addDoc(collection(db, 'polls'), {
        soru: data.soru.trim(),
        kategori: data.kategori,
        secenekler: opts,
        aktif: true,
        toplam: 0,
        ...counters,
        ...(data.endsAt ? { endsAt: data.endsAt } : {}),
        createdBy: user.uid,
        authorName: profile?.name || user.displayName || 'Yönetim',
        createdAt: serverTimestamp()
      });
      showToast('Anket yayınlandı 🗳️');
      return true;
    } catch (e: any) {
      showToast('Anket oluşturulamadı: ' + (e?.code === 'permission-denied' ? 'yetkiniz yok (Firestore kuralları yayınlandı mı?)' : e?.message || 'bilinmeyen hata'), true);
      return false;
    }
  };

  const handleTogglePoll = async (p: PollItem) => {
    if (!isRealStaff) return;
    try {
      await updateDoc(doc(db, 'polls', p.id), { aktif: !p.aktif });
      showToast(p.aktif ? 'Anket kapatıldı.' : 'Anket yeniden açıldı.');
    } catch (e: any) {
      showToast('Anket güncellenemedi: ' + (e?.message || 'bilinmeyen hata'), true);
    }
  };

  const handleDeletePoll = async (p: PollItem) => {
    if (!isRealStaff) return;
    if (!confirm(`"${p.soru}" anketi ve tüm oyları silinsin mi?`)) return;
    try {
      const votes = await getDocs(collection(db, 'polls', p.id, 'votes'));
      await Promise.all(votes.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, 'polls', p.id));
      showToast('Anket silindi. 🗑️');
    } catch (e: any) {
      showToast('Anket silinemedi: ' + (e?.code === 'permission-denied' ? 'yetkiniz yok' : e?.message || 'bilinmeyen hata'), true);
    }
  };

  // ── HABER YORUMLARI VE BEĞENİLERİ (gerçek) ──
  const openNewsId = selectedNews?.id || '';
  const loadNewsLikes = async (id: string) => {
    try {
      const c = await getCountFromServer(query(collection(db, 'likes'), where('contentId', '==', id), where('contentType', '==', 'haber')));
      setNewsLikeCount(c.data().count);
      if (user) {
        const mine = await getDoc(doc(db, 'likes', `haber_${id}_${user.uid}`));
        setMyNewsLike(mine.exists());
      } else {
        setMyNewsLike(false);
      }
    } catch (_) {
      /* sayaç okunamazsa 0 kalır */
    }
  };

  useEffect(() => {
    if (!openNewsId) {
      setNewsComments([]);
      setNewsLikeCount(0);
      setMyNewsLike(false);
      return;
    }
    loadNewsLikes(openNewsId);
    const q = query(collection(db, 'comments'), where('contentId', '==', openNewsId), where('status', '==', 'visible'));
    return onSnapshot(
      q,
      (snap) => {
        const items: NewsComment[] = [];
        snap.forEach((d) => {
          const x: any = d.data();
          if (x.contentType !== 'haber') return;
          items.push({ id: d.id, uid: x.uid, authorName: x.authorName || 'Mahalleli', authorPhoto: x.authorPhoto, text: x.text || '', createdAtMs: toMillis(x.createdAt) || Date.now() });
        });
        items.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setNewsComments(items);
      },
      (err) => console.warn('comments:', err.message)
    );
  }, [openNewsId, user?.uid]);

  const requireLogin = (msg: string) => {
    showToast(msg, true);
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleToggleNewsLike = async () => {
    if (!openNewsId) return;
    if (!user) return requireLogin('Beğenmek için önce giriş yapmalısınız.');
    const ref = doc(db, 'likes', `haber_${openNewsId}_${user.uid}`);
    try {
      if (myNewsLike) {
        await deleteDoc(ref);
        setMyNewsLike(false);
        setNewsLikeCount((n) => Math.max(0, n - 1));
      } else {
        await setDoc(ref, { contentType: 'haber', contentId: openNewsId, uid: user.uid, createdAt: serverTimestamp() });
        setMyNewsLike(true);
        setNewsLikeCount((n) => n + 1);
      }
    } catch (e: any) {
      showToast('Beğeni kaydedilemedi: ' + (e?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : e?.message || 'bilinmeyen hata'), true);
    }
  };

  const handleAddNewsComment = async () => {
    const text = newCommentInput.trim();
    if (!text || !openNewsId) return;
    if (!user) return requireLogin('Yorum yapmak için önce giriş yapmalısınız.');
    if (text.length > 500) return showToast('Yorum en fazla 500 karakter olabilir.', true);
    if (Date.now() - lastCommentAtRef.current < 8000) return showToast('Lütfen birkaç saniye bekleyip tekrar deneyin.', true);
    if (newsComments.some((c) => c.uid === user.uid && c.text === text)) return showToast('Bu yorumu zaten yaptınız.', true);
    try {
      await addDoc(collection(db, 'comments'), {
        contentType: 'haber',
        contentId: openNewsId,
        uid: user.uid,
        authorName: (profile?.name || user.displayName || 'Mahalleli').slice(0, 60),
        authorPhoto: profile?.photoURL || user.photoURL || '',
        text,
        status: 'visible',
        createdAt: serverTimestamp()
      });
      lastCommentAtRef.current = Date.now();
      setNewCommentInput('');
      showToast('Yorumunuz yayınlandı 💬');
    } catch (e: any) {
      showToast('Yorum kaydedilemedi: ' + (e?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : e?.message || 'bilinmeyen hata'), true);
    }
  };

  const handleDeleteNewsComment = async (c: NewsComment) => {
    if (!user || (c.uid !== user.uid && !isRealStaff)) return;
    if (!confirm('Bu yorum silinsin mi?')) return;
    try {
      await deleteDoc(doc(db, 'comments', c.id));
      showToast('Yorum silindi.');
    } catch (e: any) {
      showToast('Yorum silinemedi: ' + (e?.message || 'bilinmeyen hata'), true);
    }
  };

  // Usta örnek çalışma fotoğrafları (gerçek yükleme; en fazla 12)
  const handleAddSample = async (url: string) => {
    if (!user || !profile) return;
    const current: string[] = ((profile as any).ornekCalismalar as string[]) || [];
    if (current.length >= 12 || current.includes(url)) return;
    const next = [...current, url];
    try {
      await updateDoc(doc(db, 'users', user.uid), { ornekCalismalar: next });
      setProfile({ ...(profile as any), ornekCalismalar: next });
      showToast('Örnek çalışma eklendi 📷');
    } catch (e: any) {
      showToast('Fotoğraf kaydedilemedi: ' + (e?.message || 'bilinmeyen hata'), true);
    }
  };

  const handleRemoveSample = async (url: string) => {
    if (!user || !profile) return;
    const next = (((profile as any).ornekCalismalar as string[]) || []).filter((u) => u !== url);
    try {
      await updateDoc(doc(db, 'users', user.uid), { ornekCalismalar: next });
      setProfile({ ...(profile as any), ornekCalismalar: next });
    } catch (e: any) {
      showToast('Fotoğraf kaldırılamadı: ' + (e?.message || 'bilinmeyen hata'), true);
    }
  };

  // Kategori tercihlerini kaydet (cihazda ve hesapta)
  const handleSaveNotifPrefs = (next: NotifPrefs) => {
    setNotifPrefs(next);
    try {
      localStorage.setItem('mutlular_notif_prefs', JSON.stringify(next));
    } catch (_) {}
    if (user) updateDoc(doc(db, 'users', user.uid), { notifPrefs: next }).catch(() => {});
  };

  // ── TALEP OLUŞTURMA: tüm akışlar bu tek fonksiyonu kullanır (talep sahibi uid'si ile kaydedilir) ──
  const createServiceRequest = async (data: {
    baslik: string;
    aciklama: string;
    kategori: string;
    altKategori?: string;
    adres?: string;
    telefon?: string;
    urgent?: boolean;
    fotolar?: string[];
  }): Promise<string | null> => {
    if (!user) {
      showToast('Talep açmak için önce giriş yapmalısınız.', true);
      setAuthMode('login');
      setShowAuthModal(true);
      return null;
    }
    const kategoriId = resolveKategoriId(data.kategori, data.altKategori, ALL_SERVICE_CATEGORIES) || '';
    const address = (data.adres || '').trim() || 'Mutlular Mahallesi';
    try {
      const ref = await addDoc(collection(db, 'service_requests'), {
        uid: user.uid,
        authorName: profile?.name || user.displayName || 'Mahalle Sakini',
        baslik: data.baslik,
        aciklama: data.aciklama,
        kategori: data.kategori,
        altKategori: data.altKategori || '',
        kategoriId,
        adres: address,
        konum: address,
        urgent: Boolean(data.urgent),
        fotolar: data.fotolar || [],
        status: 'open',
        offerCount: 0,
        createdAt: serverTimestamp()
      });
      const typedPhone = (data.telefon || '').trim();
      if (typedPhone && !profile?.telefon) {
        updateDoc(doc(db, 'users', user.uid), { telefon: typedPhone }).catch(() => {});
        setProfile((prev) => (prev ? { ...prev, telefon: typedPhone } : prev));
      }
      return ref.id;
    } catch (e: any) {
      showToast('Talep oluşturulamadı: ' + (e?.code === 'permission-denied' ? 'yetki hatası, çıkış yapıp tekrar giriş yapın' : (e?.message || 'bilinmeyen hata')), true);
      return null;
    }
  };

  // ── TEKLİFİ KABUL ET (yalnızca talep sahibi) ──
  const handleAcceptOffer = async (req: ServiceRequest, offer: ServiceOffer) => {
    if (!user || !req.id || !offer.id) return;
    if (!req.uid || req.uid !== user.uid) {
      showToast('Teklifi yalnızca talep sahibi kabul edebilir.', true);
      return;
    }
    if (req.status && req.status !== 'open') {
      showToast('Bu talep için zaten bir teklif kabul edilmiş.', true);
      return;
    }
    // Kural gereği yalnızca hâlâ 'pending' olan diğer teklifler reddedilir.
    const siblings = (offersMap[req.id] || []).filter((o) => o.id && o.id !== offer.id && o.status === 'pending');
    let musteriTelefon = (profile?.telefon || '').trim();
    if (musteriTelefon.replace(/\D/g, '').length < 10) {
      const typed = window.prompt('Ustanın sizi arayabilmesi için telefon numaranızı yazın (yalnızca kabul ettiğiniz usta görür):', '') || '';
      if (typed.replace(/\D/g, '').length < 10) {
        showToast('Geçerli bir telefon numarası girmeden teklif kabul edilemez.', true);
        return;
      }
      musteriTelefon = typed.trim();
      updateDoc(doc(db, 'users', user.uid), { telefon: musteriTelefon }).catch(() => {});
      setProfile((prev) => (prev ? { ...prev, telefon: musteriTelefon } : prev));
    }
    setAcceptingOfferId(offer.id);
    try {
      await runTransaction(db, async (tx) => {
        const reqRef = doc(db, 'service_requests', req.id!);
        const reqSnap = await tx.get(reqRef);
        if (!reqSnap.exists()) throw new Error('Talep bulunamadı.');
        const st = reqSnap.data().status;
        if (st && st !== 'open') throw new Error('Bu talep için zaten bir teklif kabul edilmiş.');
        tx.update(doc(db, 'offers', offer.id!), { status: 'accepted', acceptedAt: serverTimestamp(), musteriTelefon, musteriAdi: profile?.name || user.displayName || 'Mahalle Sakini' });
        siblings.forEach((o) => tx.update(doc(db, 'offers', o.id!), { status: 'rejected' }));
        tx.update(reqRef, { status: 'in_progress', acceptedOfferId: offer.id });
      });
      setShowRequestDetail((prev) => (prev && prev.id === req.id ? { ...prev, status: 'in_progress', acceptedOfferId: offer.id } : prev));
      showToast(`${offer.esnafIsyeri} teklifi kabul edildi. Usta bilgilendirildi ✅`);
    } catch (e: any) {
      showToast('Teklif kabul edilemedi: ' + (e?.code === 'permission-denied' ? 'yetki hatası' : (e?.message || 'bilinmeyen hata')), true);
    } finally {
      setAcceptingOfferId(null);
    }
  };

  // Editör/yönetici: onay bekleyen vefat ilanları
  useEffect(() => {
    if (!isRealStaff) {
      setPendingDeceased([]);
      return;
    }
    const q = query(collection(db, 'cenaze_ilanlari'), where('status', '==', 'pending'));
    return onSnapshot(
      q,
      (snap) => {
        const items: DeceasedItem[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as DeceasedItem));
        items.sort((x: any, y: any) => (toMillis(y.createdAt) || Date.now()) - (toMillis(x.createdAt) || Date.now()));
        setPendingDeceased(items);
      },
      (err) => console.warn('cenaze bekleyen:', err.message)
    );
  }, [isRealStaff, user?.uid]);

  // Kullanıcının kendi vefat ilanları (onay bekleyen / reddedilen durumunu görebilsin)
  useEffect(() => {
    if (!user) {
      setMyDeceased([]);
      return;
    }
    const q = query(collection(db, 'cenaze_ilanlari'), where('uid', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const items: DeceasedItem[] = [];
        snap.forEach((d) => items.push({ ...(d.data() as any), id: d.id } as DeceasedItem));
        items.sort((x: any, y: any) => (toMillis(y.createdAt) || Date.now()) - (toMillis(x.createdAt) || Date.now()));
        setMyDeceased(items);
      },
      (err) => console.warn('cenaze benim:', err.message)
    );
  }, [user?.uid]);

  // Usta "Diğer" seçince yazdığı faaliyet alanını sisteme ekler (varsa mevcut olanı kullanır). Ad döndürür.
  const addCustomArea = async (raw: string): Promise<string | null> => {
    const cleaned = cleanAreaName(raw);
    if (!cleaned.ok) {
      showToast(cleaned.error, true);
      return null;
    }
    const existingMain = MAIN_SERVICE_CATEGORIES.find((c) => c.name.toLocaleLowerCase('tr-TR') === cleaned.name.toLocaleLowerCase('tr-TR'));
    if (existingMain) return existingMain.name;
    const existing = customAreas.find((a) => a.id === cleaned.slug);
    if (existing) return existing.ad;
    if (!auth.currentUser) return cleaned.name;
    try {
      const ref = doc(db, 'hizmet_alanlari', cleaned.slug);
      const snap = await getDoc(ref);
      if (snap.exists()) return (snap.data() as any).ad || cleaned.name;
      await setDoc(ref, {
        ad: cleaned.name,
        adNorm: cleaned.name.toLocaleLowerCase('tr-TR'),
        ekleyenUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setCustomAreas((prev) => (prev.some((a) => a.id === cleaned.slug) ? prev : [...prev, { id: cleaned.slug, ad: cleaned.name }]));
      return cleaned.name;
    } catch (e: any) {
      showToast('Faaliyet alanı eklenemedi: ' + (e?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : (e?.message || 'bilinmeyen hata')), true);
      return null;
    }
  };

  const handleDeleteNewsItem = async (id?: string, title?: string) => {
    if (id && !id.startsWith('ihbar_') && !id.startsWith('haber_')) {
      try {
        await deleteDoc(doc(db, 'haberler', id));
      } catch (e: any) {
        showToast('Haber silinemedi: ' + (e?.code === 'permission-denied' ? 'yetkiniz yok (yönetici e-postanızı doğrulayıp yeniden giriş yapın)' : (e?.message || 'bilinmeyen hata')), true);
        return;
      }
    }
    setNewsItems(prev => prev.filter(n => n.id !== id && n.baslik !== title));
    showToast('Kayıt silindi. 🗑️');
  };

  const handleUpdateUserRole = async (targetUid: string, newRole: UserRole, targetEmail?: string) => {
    try {
      if (targetUid.startsWith('email_') && targetEmail) {
        const safeId = 'user_' + targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'users', safeId), {
          uid: safeId,
          email: targetEmail,
          name: targetEmail.split('@')[0],
          role: newRole,
          createdAt: serverTimestamp(),
          isApproved: true
        }, { merge: true });

        setAllUsersList(prev => {
          const exists = prev.find(u => u.email === targetEmail);
          if (exists) return prev.map(u => u.email === targetEmail ? { ...u, role: newRole } : u);
          return [{ uid: safeId, email: targetEmail, name: targetEmail.split('@')[0], role: newRole }, ...prev];
        });
      } else {
        await updateDoc(doc(db, 'users', targetUid), { role: newRole });
        setAllUsersList(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
        if (user?.uid === targetUid) {
          setProfile(prev => prev ? { ...prev, role: newRole } : prev);
          setDemoRole(newRole);
          setRealRole(newRole);
        }
      }
      showToast(`Kullanıcı rolü başarıyla güncellendi: ${newRole} ✅`);
    } catch (err: any) {
      console.warn('Role update fallback:', err?.message);
      setAllUsersList(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      if (user?.uid === targetUid) {
        setProfile(prev => prev ? { ...prev, role: newRole } : prev);
        setDemoRole(newRole);
      }
      showToast(`Rol yerel olarak güncellendi: ${newRole} ✅`);
    }
  };

  // WhatsApp & Phone Helpers
  const openWhatsApp = (rawPhone: string, message: string) => {
    let clean = rawPhone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '90' + clean.substring(1);
    if (!clean.startsWith('90')) clean = '90' + clean;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openDialer = (rawPhone: string) => {
    window.location.href = `tel:${rawPhone}`;
  };

  // ── 💍 MAHALLE DAVETLERİ VE CEMİYET YARDIMCI FONKSİYONLARI ──
  const handleToggleAttendDavet = async (davet: MahalleDavetItem, status: 'katilacagim' | 'tebrik_ederim' | 'mutluluklar' = 'katilacagim') => {
    const key = davet.id || davet.baslik;
    const isAttended = attendedDavetIds.includes(key);
    const newAttended = isAttended ? attendedDavetIds.filter(id => id !== key) : [...attendedDavetIds, key];
    setAttendedDavetIds(newAttended);

    const delta = isAttended ? -1 : 1;
    setInvitationItems(prev => prev.map(item => {
      if ((item.id && item.id === davet.id) || item.baslik === davet.baslik) {
        return { ...item, katilanSayisi: Math.max(0, (item.katilanSayisi || 0) + delta) };
      }
      return item;
    }));

    if (davet.id) {
      try {
        await updateDoc(doc(db, 'mahalle_davetleri', davet.id), {
          katilanSayisi: increment(delta)
        });
      } catch (_) {}
    }

    if (!isAttended) {
      showToast('💐 Katılım bildiriminiz iletildi! Cemiyette görüşmek üzere.');
    } else {
      showToast('Katılım durumunuz güncellendi.');
    }
  };

  const handleAddTebrikMessage = async (davetIdOrKey: string) => {
    if (!newTebrikMsg.trim()) {
      showToast('Lütfen bir tebrik veya iyi dilek mesajı yazınız.');
      return;
    }
    const senderName = newTebrikName.trim() || profile?.name || user?.displayName || 'Komşunuz';
    const newTebrik: MahalleDavetTebrik = {
      id: `tebrik-${Date.now()}`,
      isim: senderName,
      mesaj: newTebrikMsg.trim(),
      tarihStr: 'Az önce',
      katilimDurumu: newTebrikType
    };

    setInvitationItems(prev => prev.map(item => {
      if (item.id === davetIdOrKey || item.baslik === davetIdOrKey) {
        return {
          ...item,
          tebrikler: [newTebrik, ...(item.tebrikler || [])],
          katilanSayisi: (item.katilanSayisi || 0) + 1
        };
      }
      return item;
    }));

    if (davetIdOrKey && !davetIdOrKey.startsWith('davet-')) {
      try {
        const target = invitationItems.find(i => i.id === davetIdOrKey);
        if (target && target.id) {
          await updateDoc(doc(db, 'mahalle_davetleri', target.id), {
            tebrikler: [newTebrik, ...(target.tebrikler || [])],
            katilanSayisi: increment(1)
          });
        }
      } catch (_) {}
    }

    setNewTebrikMsg('');
    setNewTebrikName('');
    setActiveTebrikDavetId(null);
    showToast('Tebrik ve hayır duanız davet panosuna eklendi! 💐❤️');
  };

  const handleShareDavetWhatsApp = (davet: MahalleDavetItem) => {
    const text = `💍 *${davet.turEtiketi}: ${davet.baslik}*\n\n` +
      `👥 *Davet Edenler:* ${davet.davetSahipleri}\n` +
      `📅 *Tarih & Saat:* ${davet.tarih} - ${davet.saat}\n` +
      `📍 *Mekan:* ${davet.mekanAdi} (${davet.salonBilgisi || ''})\n` +
      `🏠 *Adres:* ${davet.adres}\n\n` +
      `💌 "${davet.aciklama || 'Tüm mahalleli komşularımız ve sevenlerimiz davetlidir.'}"\n\n` +
      `✨ Mutlular Mahallesi Dijital Portalı üzerinden paylaşıldı.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddToCalendar = (davet: MahalleDavetItem) => {
    const title = encodeURIComponent(`${davet.turEtiketi}: ${davet.baslik}`);
    const details = encodeURIComponent(`${davet.davetSahipleri}\n${davet.aciklama || ''}\nİletişim: ${davet.iletisimKisi} (${davet.iletisimTelefon})`);
    const location = encodeURIComponent(`${davet.mekanAdi}, ${davet.adres}`);
    // Google Calendar URL generator
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
  };

  // ── MAHALLE KÜRSÜSÜ YARDIMCI VE EYLEM FONKSİYONLARI ──
  const handleToggleSupportKursu = async (item: MahalleKursusuItem, idx: number) => {
    const key = item.id || `kursu-${idx}`;
    const isSupported = supportedKursuIds.includes(key);
    const newSupported = isSupported 
      ? supportedKursuIds.filter(id => id !== key)
      : [...supportedKursuIds, key];
    
    setSupportedKursuIds(newSupported);
    try {
      localStorage.setItem('supported_kursu_ids', JSON.stringify(newSupported));
    } catch (_) {}

    const delta = isSupported ? -1 : 1;
    setKursuItems(prev => prev.map((k, i) => {
      if ((item.id && k.id === item.id) || (!item.id && i === idx)) {
        return { ...k, destekSayisi: Math.max(0, (k.destekSayisi || 0) + delta) };
      }
      return k;
    }));

    if (item.id) {
      try {
        await updateDoc(doc(db, 'mahalle_kursusu', item.id), {
          destekSayisi: increment(delta)
        });
      } catch (_) {}
    }

    if (!isSupported) {
      showToast('Desteğiniz eklendi! Komşu dayanışması büyüyor 🤝');
    } else {
      showToast('Desteğiniz geri alındı.');
    }
  };

  const handleAddKursuComment = async (targetId: string, idx: number) => {
    if (!newCommentText.trim()) return;
    const author = profile?.name || user?.displayName || 'Mahalle Sakini';
    const authorPhoto = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}&backgroundColor=dc2626`;

    const newComment = {
      id: 'c-' + Date.now(),
      authorName: author,
      authorPhotoURL: authorPhoto,
      mesaj: newCommentText.trim(),
      tarihStr: 'Az önce'
    };

    setKursuItems(prev => prev.map((k, i) => {
      if ((targetId && k.id === targetId) || (!targetId && i === idx)) {
        return {
          ...k,
          yorumlar: [...(k.yorumlar || []), newComment]
        };
      }
      return k;
    }));

    if (targetId) {
      try {
        const docRef = doc(db, 'mahalle_kursusu', targetId);
        const targetDoc = kursuItems.find(k => k.id === targetId);
        if (targetDoc) {
          await updateDoc(docRef, {
            yorumlar: [...(targetDoc.yorumlar || []), newComment]
          });
        }
      } catch (_) {}
    }

    setNewCommentText('');
    showToast('Görüşünüz kürsü başlığı altına eklendi! 💬');
  };

  const handleShareKursuWhatsApp = (item: MahalleKursusuItem) => {
    const text = `📢 *Mahalle Kürsüsü:* ${item.baslik}\n\n🏷️ *Kategori:* ${item.kategori}\n👤 *Paylaşan:* ${item.authorName} (${item.role || 'Mahalle Sakini'})\n📍 *Konum:* ${item.konum || 'Mutlular'}\n\n"${item.icerik}"\n\n👍 Şu ana kadar *${item.destekSayisi} komşu* katıldı.\n\nSiz de fikrinizi belirtmek ve destek olmak için Dijital Mutlular'a gelin!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePublishKursu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kursuBaslik.trim() || !kursuIcerik.trim()) {
      showToast('Lütfen başlık ve görüş metnini doldurunuz.', true);
      return;
    }

    const author = profile?.name || user?.displayName || (demoRole === 'esnaf' ? 'Mahalle Esnafı' : 'Mahalle Sakini');
    const authorPhoto = profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}&backgroundColor=dc2626`;
    const roleText = demoRole === 'esnaf' ? 'Mahalle Esnafı' : demoRole === 'admin' ? 'Mahalle Yöneticisi' : 'Mahalle Sakini';

    const newKursuItem: MahalleKursusuItem = {
      id: 'kursu_' + Date.now(),
      uid: user?.uid || 'guest_user',
      authorName: author,
      authorPhotoURL: authorPhoto,
      role: roleText,
      kategori: kursuKategori,
      baslik: kursuBaslik.trim(),
      icerik: kursuIcerik.trim(),
      konum: kursuKonum.trim() || 'Mutlular Mahallesi',
      fotoUrl: kursuFoto.trim() || undefined,
      destekSayisi: 1,
      destekleyenler: [user?.uid || 'guest_user'],
      yorumlar: [],
      tarihStr: 'Az önce',
      durum: 'acik',
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'mahalle_kursusu'), {
        ...newKursuItem,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore kursu save err:', err.message);
    }

    setKursuItems((prev) => [newKursuItem, ...prev]);
    setSupportedKursuIds((prev) => [...prev, newKursuItem.id!]);
    setShowKursuModal(false);
    setKursuBaslik('');
    setKursuIcerik('');
    setKursuKonum('');
    setKursuFoto('');
    showToast('Kürsü paylaşımınız yayınlandı! Sesiniz mahalleye ulaştı 📢');
  };

  // Image compressor using Canvas
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const maxDim = 1000;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
      };
    });
  };

  // Vefat / Cenaze & Taziye İlanı Yayınlama (giriş gerekir; ilanı bırakan kişi kaydedilir)
  const handlePublishDeceased = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Vefat ilanı bırakmak için önce giriş yapmalısınız.', true);
      setShowNewDeceasedModal(false);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (newDeceasedName.trim().length < 2) {
      showToast('Lütfen merhum / merhume adı soyadı giriniz.', true);
      return;
    }
    const ageNum = parseInt(newDeceasedAge, 10);
    try {
      await addDoc(collection(db, 'cenaze_ilanlari'), {
        fullName: newDeceasedName.trim(),
        age: Number.isFinite(ageNum) && ageNum > 0 && ageNum < 130 ? ageNum : null,
        family: newDeceasedFamily.trim() || 'Ailesi ve Sevenleri',
        mosque: newDeceasedMosque.trim() || 'Mutlular Fatih Camii',
        prayerTime: newDeceasedPrayer || 'Öğle Namazını Müteakip',
        cemetery: newDeceasedCemetery.trim() || 'Hamitler Kent Mezarlığı',
        dateStr: newDeceasedDate || 'Bugün',
        uid: user.uid,
        authorName: profile?.name || user.displayName || 'Mahalle Sakini',
        // Editör/yönetici doğrudan yayınlar; diğer herkesin ilanı editör onayına düşer.
        status: isRealStaff ? 'published' : 'pending',
        ...(isRealStaff ? { publishedAt: serverTimestamp(), approvedBy: user.uid } : {}),
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      showToast('İlan yayınlanamadı: ' + (err?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : (err?.message || 'bilinmeyen hata')), true);
      return;
    }

    setShowNewDeceasedModal(false);
    setNewDeceasedName('');
    setNewDeceasedAge('');
    setNewDeceasedFamily('');
    showToast(
      isRealStaff
        ? "Vefat ve cenaze ilanı yayınlandı. Merhuma Allah'tan rahmet, kederli ailesine başsağlığı dileriz. 🕊️"
        : 'İlanınız editör onayına gönderildi. Onaylanınca mahalleye duyurulacak. 🕊️'
    );
  };

  const handleApproveDeceased = async (d: DeceasedItem) => {
    if (!isRealStaff || !user) return;
    try {
      await updateDoc(doc(db, 'cenaze_ilanlari', d.id), {
        status: 'published',
        publishedAt: serverTimestamp(),
        approvedBy: user.uid
      });
      showToast(`"${d.fullName}" ilanı yayınlandı. 🕊️`);
    } catch (err: any) {
      showToast('İlan onaylanamadı: ' + (err?.code === 'permission-denied' ? 'yetkiniz yok (Firestore kuralları yayınlandı mı?)' : (err?.message || 'bilinmeyen hata')), true);
    }
  };

  const handleRejectDeceased = async (d: DeceasedItem) => {
    if (!isRealStaff || !user) return;
    if (!confirm(`"${d.fullName}" ilanı reddedilsin mi?`)) return;
    try {
      await updateDoc(doc(db, 'cenaze_ilanlari', d.id), {
        status: 'rejected',
        rejectedBy: user.uid,
        rejectedAt: serverTimestamp()
      });
      showToast('İlan reddedildi.');
    } catch (err: any) {
      showToast('İlan reddedilemedi: ' + (err?.code === 'permission-denied' ? 'yetkiniz yok' : (err?.message || 'bilinmeyen hata')), true);
    }
  };

  const canDeleteDeceased = (d: DeceasedItem) => Boolean(user && (isUserAdmin || (d as any).uid === user.uid));

  const handleDeleteDeceased = async (d: DeceasedItem) => {
    if (!canDeleteDeceased(d)) return;
    if (!confirm(`"${d.fullName}" ilanı kaldırılsın mı?`)) return;
    try {
      await deleteDoc(doc(db, 'cenaze_ilanlari', d.id));
      setDeceasedList((prev) => prev.filter((x) => x.id !== d.id));
      showToast('İlan kaldırıldı.');
    } catch (err: any) {
      showToast('İlan kaldırılamadı: ' + (err?.code === 'permission-denied' ? 'yetkiniz yok' : (err?.message || 'bilinmeyen hata')), true);
    }
  };

  // Canlı yayın ayarını kaydet (yönetici / editör)
  const handleSaveLive = async (cfg: LiveConfig): Promise<boolean> => {
    if (!isUserAdmin && !isUserEditor) {
      showToast('Canlı yayını yalnızca yönetici veya editör değiştirebilir.', true);
      return false;
    }
    const cleanUrl = cfg.url.trim() ? cleanLiveUrl(cfg.url) : '';
    if (cfg.url.trim() && !cleanUrl) {
      showToast('Yayın bağlantısı geçerli bir https adresi olmalı.', true);
      return false;
    }
    if (cfg.aktif && !cleanUrl) {
      showToast('Yayını açmak için bir yayın bağlantısı girin.', true);
      return false;
    }
    try {
      await setDoc(doc(db, 'ayarlar', 'canli_yayin'), {
        aktif: cfg.aktif,
        baslik: cfg.baslik.trim(),
        aciklama: cfg.aciklama.trim(),
        url: cleanUrl || '',
        guncelleyenUid: user?.uid || '',
        updatedAt: serverTimestamp()
      });
      showToast(cfg.aktif ? '📺 Canlı yayın başlatıldı.' : 'Canlı yayın kapatıldı.');
      return true;
    } catch (err: any) {
      showToast('Kaydedilemedi: ' + (err?.code === 'permission-denied' ? 'yetkiniz yok (Firestore kuralları yayınlandı mı?)' : (err?.message || 'bilinmeyen hata')), true);
      return false;
    }
  };

  // Rol Önizleme: yalnızca gerçek yönetici kullanabilir; sadece ekrandaki görünümü değiştirir, hiçbir şey kaydedilmez.
  const toggleDemoRole = (newRole: UserRole) => {
    if (realRole !== 'admin' || !profile) return;
    setDemoRole(newRole);
    setProfile({
      ...profile,
      role: newRole,
      credits: newRole === 'admin' ? 9999 : newRole === 'esnaf' ? (profile.credits || 8) : profile.credits,
      isyeri: newRole === 'esnaf' ? (profile.isyeri || 'Mutlular Tesisat & Yapı') : profile.isyeri
    });
    const roleNames: Record<UserRole, string> = {
      admin: '👑 Yönetici (Admin)',
      editor: '✍️ Editör (Editor)',
      esnaf: '🏪 Mahalle Esnafı',
      sakin: '👤 Mahalle Sakini'
    };
    showToast(`Önizleme rolü: ${roleNames[newRole]} 🔄 (yalnızca ekranda görünür, kaydedilmez)`);
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        if (!authEmail.trim() || !authPassword) {
          setAuthError('Lütfen e-posta ve şifrenizi giriniz.');
          return;
        }
        const emailClean = authEmail.trim().toLowerCase();
        // Yalnızca Firebase Authentication ile doğrulanır; hata olursa aşağıdaki catch mesajı gösterir.
        await signInWithEmailAndPassword(auth, emailClean, authPassword);
        localStorage.removeItem('dijitalmutlular_active_session');
        setAuthPassword('');
        setShowAuthModal(false);
        showToast('Giriş başarılı! Hoş geldiniz 👋');
        return;
      } else {
        // Register validations
        if (!authName.trim()) {
          setAuthError('Lütfen ad ve soyadınızı belirtiniz.');
          return;
        }
        if (!authEmail.trim() || !authEmail.includes('@')) {
          setAuthError('Lütfen geçerli bir e-posta adresi giriniz.');
          return;
        }
        const cleanPhone = authPhone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          setAuthError('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane, örn: 0532 123 45 67).');
          return;
        }
        if (authPassword.length < 6) {
          setAuthError('Şifreniz en az 6 karakter olmalıdır.');
          return;
        }
        if (authRole !== 'sakin' && !authIsyeri.trim()) {
          setAuthError(authRole === 'usta' ? 'Lütfen usta / firma adınızı yazınız.' : 'Lütfen dükkan veya işletme ünvanınızı yazınız.');
          return;
        }
        if (authRole !== 'sakin' && authEsnafKategori === DIGER_ALAN) {
          if (authRole === 'usta') {
            const chk = cleanAreaName(authCustomArea);
            if (!chk.ok) {
              setAuthError(chk.error);
              return;
            }
          } else if (authCustomArea.trim().length < 3) {
            setAuthError('Lütfen işletme türünüzü yazınız (en az 3 harf).');
            return;
          }
        }

        const emailClean = authEmail.trim().toLowerCase();
        // Yönetici yetkisi yalnızca e-posta doğrulandıktan sonra (girişte) verilir; kayıt her zaman normal rolle başlar.
        const finalRole = (authRole === 'sakin' ? 'sakin' : 'esnaf') as UserRole;

        let userUid = '';
        suppressAutoProfileRef.current = true;
        try {
          const cred = await createUserWithEmailAndPassword(auth, emailClean, authPassword);
          userUid = cred.user.uid;
          try { await updateProfile(cred.user, { displayName: authName.trim() }); } catch (_) {}

          let areaName: string | undefined;
          if (authRole !== 'sakin') {
            const fallbackName = authEsnafKategori === DIGER_ALAN ? authCustomArea.trim() : authEsnafKategori;
            areaName = (await resolveAreaChoice(authRole, authEsnafKategori, authCustomArea)) || fallbackName;
          }

          const newProfile: UserProfile = {
            uid: userUid,
            name: authName.trim(),
            email: emailClean,
            telefon: authPhone.trim(),
            role: finalRole,
            hesapTipi: authRole === 'usta' ? 'usta' : authRole === 'esnaf' ? 'esnaf' : undefined,
            credits: authRole === 'usta' ? 10 : 0,
            welcomeBonusGiven: authRole === 'usta' ? true : undefined,
            isyeri: authRole !== 'sakin' ? authIsyeri.trim() : undefined,
            esnafKategori: authRole !== 'sakin' ? areaName : undefined,
            isApproved: true,
            createdAt: new Date()
          };

          await setDoc(doc(db, 'users', userUid), newProfile);
          setProfile(newProfile);
          setDemoRole(finalRole);
          setRealRole(finalRole);
        } finally {
          suppressAutoProfileRef.current = false;
        }
        setShowAuthModal(false);
        setAuthPassword('');

        if (finalRole === 'admin') {
          showToast(`Süper Yönetici hesabı başarıyla aktifleşti! Hoş geldiniz Yakup Bey 👑`);
        } else if (authRole === 'usta') {
          showToast(`Kayıt tamamlandı! Sayın ustamız, 10 teklif kredisi hesabınıza yüklendi 🛠️🎁`);
        } else if (authRole === 'esnaf') {
          showToast(`Kayıt tamamlandı! Esnaf hesabınız açıldı, kampanyalarınızı yayınlayabilirsiniz 🏪`);
        } else {
          showToast(`Kayıt tamamlandı! Mutlular mahallemize hoş geldiniz komşum 🏡🎉`);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError('Firebase Konsolunda "E-posta / Şifre" (Email/Password) yöntemi henüz etkinleştirilmemiş! Lütfen Firebase Console > Authentication > Sign-in method sekmesinden Email/Password seçeneğini "Enable" (Etkin) yapınız.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Bu e-posta adresi ile zaten kayıtlı bir hesap var. Lütfen giriş yapın.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Geçersiz e-posta adresi formatı.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Şifre çok zayıf. En az 6 karakter giriniz.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol ediniz.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyiniz.');
      } else if (err.code === 'auth/network-request-failed') {
        setAuthError('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyiniz.');
      } else {
        setAuthError(err.message || 'İşlem sırasında bir hata oluştu.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      suppressAutoProfileRef.current = true;
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      const userRef = doc(db, 'users', u.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const isAdminEmail = u.email === 'yakupkrbck@gmail.com' && u.emailVerified;
        if (isAdminEmail) {
          const adminProfile: UserProfile = {
            uid: u.uid,
            name: u.displayName || 'Yakup Bey (Yönetici)',
            email: u.email || '',
            role: 'admin',
            credits: 9999,
            isApproved: true,
            createdAt: new Date(),
          };
          await setDoc(userRef, adminProfile);
          setProfile(adminProfile);
          setDemoRole('admin');
          setRealRole('admin');
        } else {
          // Yeni Google kullanıcısı: rolünü seçip bilgilerini tamamlayacağı ekran açılır.
          startOnboarding(u);
          showToast('Google ile giriş yapıldı. Hesabınızı tamamlayın 👋');
          return;
        }
      }
      setShowAuthModal(false);
      showToast(`Google ile giriş yapıldı! Hoş geldiniz 👋`);
    } catch (e: any) {
      if (e.code === 'auth/operation-not-allowed') {
        setAuthError('Firebase Konsolunda Google ile giriş sağlayıcısı henüz etkinleştirilmemiş (Authentication > Sign-in method).');
      } else if (e.code === 'auth/popup-closed-by-user') {
        setAuthError('Google giriş penceresi kapatıldı.');
      } else {
        setAuthError('Google ile giriş hatası: ' + (e.message || e));
      }
    } finally {
      suppressAutoProfileRef.current = false;
    }
  };

  // Google ile ilk kez giren kullanıcının hesabını rolüne göre oluşturur.
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const cu = auth.currentUser;
    if (!cu) {
      showToast('Oturum bulunamadı, lütfen tekrar giriş yapın.', true);
      setShowOnboarding(false);
      return;
    }
    const ad = obAd.trim();
    const soyad = obSoyad.trim();
    if (ad.length < 2 || soyad.length < 2) {
      showToast('Lütfen ad ve soyadınızı yazın.', true);
      return;
    }
    if (obPhone.replace(/\D/g, '').length < 10) {
      showToast('Lütfen geçerli bir telefon numarası yazın (başında 0 ile 11 hane).', true);
      return;
    }
    const isBiz = obRole !== 'sakin';
    if (isBiz) {
      if (!obIsyeri.trim()) {
        showToast(obRole === 'usta' ? 'Lütfen usta / firma adınızı yazın.' : 'Lütfen işletme / dükkan ünvanınızı yazın.', true);
        return;
      }
      if (!obArea) {
        showToast(obRole === 'usta' ? 'Lütfen faaliyet alanınızı seçin.' : 'Lütfen işletme türünüzü seçin.', true);
        return;
      }
      if (obArea === DIGER_ALAN) {
        if (obRole === 'usta') {
          const chk = cleanAreaName(obCustomArea);
          if (!chk.ok) {
            showToast(chk.error, true);
            return;
          }
        } else if (obCustomArea.trim().length < 3) {
          showToast('Lütfen işletme türünüzü yazın (en az 3 harf).', true);
          return;
        }
      }
      if (!obAdres.trim()) {
        showToast(obRole === 'usta' ? 'Lütfen çalışma bölgenizi yazın.' : 'Lütfen işletme adresinizi yazın.', true);
        return;
      }
    }

    setObSaving(true);
    suppressAutoProfileRef.current = true;
    try {
      let areaName: string | undefined;
      if (isBiz) {
        areaName = (await resolveAreaChoice(obRole as 'usta' | 'esnaf', obArea, obCustomArea))
          || (obArea === DIGER_ALAN ? obCustomArea.trim() : obArea);
      }
      const newProfile: UserProfile = {
        uid: cu.uid,
        name: `${ad} ${soyad}`,
        email: cu.email || '',
        telefon: obPhone.trim(),
        photoURL: cu.photoURL || undefined,
        role: isBiz ? 'esnaf' : 'sakin',
        hesapTipi: isBiz ? (obRole as 'usta' | 'esnaf') : undefined,
        credits: obRole === 'usta' ? 10 : 0,
        welcomeBonusGiven: obRole === 'usta' ? true : undefined,
        isyeri: isBiz ? obIsyeri.trim() : undefined,
        esnafKategori: isBiz ? areaName : undefined,
        adres: isBiz ? obAdres.trim() : undefined,
        calismaSaatleri: isBiz ? 'Pazartesi - Cumartesi: 08:30 - 19:30' : undefined,
        uzmanlikEtiketleri: isBiz ? [] : undefined,
        isApproved: true,
        newsNotificationPreferences: newsNotifPrefs,
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', cu.uid), newProfile);
      setProfile(newProfile);
      setDemoRole(newProfile.role);
      setRealRole(newProfile.role);
      setShowOnboarding(false);
      showToast(
        obRole === 'usta'
          ? 'Hesabınız açıldı! 10 teklif krediniz tanımlandı 🛠️🎁'
          : obRole === 'esnaf'
          ? 'Esnaf hesabınız açıldı 🏪'
          : 'Hesabınız açıldı, hoş geldiniz 🏡'
      );
    } catch (err: any) {
      showToast('Hesap oluşturulamadı: ' + (err?.code === 'permission-denied' ? 'yetki hatası (Firestore kuralları yayınlandı mı?)' : (err?.message || 'bilinmeyen hata')), true);
    } finally {
      suppressAutoProfileRef.current = false;
      setObSaving(false);
    }
  };

  // Hesap tamamlamadan vazgeçen kullanıcı oturumu kapatır (yarım hesap oluşmaz).
  const handleCancelOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await signOut(auth);
    } catch (_) {}
    setUser(null);
    setProfile(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    localStorage.removeItem('dijitalmutlular_active_session');
    setUser(null);
    setProfile(null);
    setDemoRole('sakin');
    setRealRole('sakin');
    showToast('Oturum kapatıldı, başarıyla çıkış yapıldı. 👋');
  };

  const playAlertSound = (isBreaking = true) => {
    if (!newsNotifPrefs.soundAlert) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isBreaking) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (_) {}
  };

  const handleSaveNewsNotifPrefs = async (prefsToSave: NewsNotificationPreferences) => {
    try {
      setNewsNotifPrefs(prefsToSave);
      localStorage.setItem('dijitalmutlular_news_notif_prefs', JSON.stringify(prefsToSave));
      
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          newsNotificationPreferences: prefsToSave
        });
      }
      if (profile) {
        setProfile({ ...profile, newsNotificationPreferences: prefsToSave });
      }
      showToast(
        prefsToSave.enabled
          ? (prefsToSave.sonDakikaOnly 
              ? '🚨 Haber Bildirimleri: Yalnızca "Son Dakika" haberleri için anlık bildirim tercihiniz kaydedildi!'
              : '📢 Haber Bildirimleri: Tüm mahalle haberleri için anlık bildirim tercihiniz kaydedildi!')
          : '🔕 Haber bildirimleri kapatıldı.'
      );
    } catch (e: any) {
      showToast('Tercih kaydedilemedi: ' + e.message, true);
    }
  };

  const handleTestBreakingNewsNotification = () => {
    // Yalnızca uyarıyı dener (ses + görsel uyarı); bildirim listesine sahte kayıt eklemez.
    playAlertSound(true);
    showToast('🚨 [TEST] Bu bir deneme uyarısıdır. Ses ve uyarı kutusu çalışıyor.');
  };

  const handleRequestBrowserPush = async () => {
    if (!('Notification' in window)) {
      showToast('Tarayıcınız masaüstü anlık bildirimlerini desteklemiyor.', true);
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const updated = { ...newsNotifPrefs, browserPush: true };
        handleSaveNewsNotifPrefs(updated);
        showToast('✅ Tarayıcı bildirim izni onaylandı! Son dakika haberleri anında ekranınıza gelecek.');
      } else {
        const updated = { ...newsNotifPrefs, browserPush: false };
        handleSaveNewsNotifPrefs(updated);
        showToast('Tarayıcı bildirim izni reddedildi veya engellendi.', true);
      }
    } catch (e: any) {
      showToast('İzin alınırken hata: ' + e.message, true);
    }
  };

  const openProfileEdit = () => {
    if (!profile) return;
    setEditName(profile.name || user?.displayName || '');
    setEditPhone(profile.telefon || '');
    setEditPhotoURL(profile.photoURL || user?.photoURL || '');
    setEditRole(profile.role === 'admin' || profile.role === 'editor' ? 'sakin' : (profile.role === 'esnaf' ? 'esnaf' : 'sakin'));
    setEditIsyeri(profile.isyeri || '');
    setEditEsnafKategori(profile.esnafKategori || (profile.hesapTipi === 'esnaf' ? ESNAF_TURLERI[0] : ALL_SERVICE_CATEGORIES[0].name));
    setEditAdres(profile.adres || 'Mutlular Mahallesi, Yıldırım / Bursa');
    setEditCalismaSaatleri(profile.calismaSaatleri || 'Pazartesi - Cumartesi: 08:30 - 19:30');
    const kindNow: 'usta' | 'esnaf' = profile.hesapTipi || (isUstaProfile(profile) ? 'usta' : 'esnaf');
    setEditHesapTipi(kindNow);
    setEditCustomArea('');
    setEditUzmanlikEtiketleri(profile.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0 ? profile.uzmanlikEtiketleri : ['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
    setEditEsnafAciklama(profile.esnafAciklama || 'Mutlular Mahallesi sakinlerine profesyonel ve garantili usta hizmeti sunmaktayız.');
    setProfileModalTab('bilgiler');
    setShowProfileEditModal(true);
  };

  const handleOpenArtisanOnboarding = (kind?: 'usta' | 'esnaf') => {
    const nextKind: 'usta' | 'esnaf' = kind || (profile?.hesapTipi === 'esnaf' ? 'esnaf' : 'usta');
    setArtisanKind(nextKind);
    setArtisanCustomArea('');
    const defaultArea = nextKind === 'usta' ? ALL_SERVICE_CATEGORIES[0].name : ESNAF_TURLERI[0];
    if (profile) {
      setArtisanBusinessName(profile.isyeri || (profile.name ? `${profile.name} ${nextKind === 'usta' ? 'Usta' : 'Esnaf'}` : ''));
      setArtisanCategory(profile.esnafKategori && (profile.hesapTipi ? profile.hesapTipi === nextKind : true) ? profile.esnafKategori : defaultArea);
      setArtisanAddress(profile.adres || 'Mutlular Mahallesi, Yıldırım / Bursa');
      setArtisanWorkingHours(profile.calismaSaatleri || 'Pazartesi - Cumartesi: 08:30 - 19:30');
      setArtisanTags(profile.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0
        ? profile.uzmanlikEtiketleri
        : ['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
      setArtisanPhone(profile.telefon || '');
      setArtisanDescription(profile.esnafAciklama || 'Mutlular Mahallesi sakinlerine profesyonel, güvenilir ve garantili hizmet sunmaktayız.');
    } else {
      setArtisanBusinessName('');
      setArtisanCategory(defaultArea);
      setArtisanAddress('Mutlular Mahallesi, Yıldırım / Bursa');
      setArtisanWorkingHours('Pazartesi - Cumartesi: 08:30 - 19:30');
      setArtisanTags(['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
      setArtisanPhone('');
      setArtisanDescription('Mutlular Mahallesi sakinlerine profesyonel, güvenilir ve garantili hizmet sunmaktayız.');
      setArtisanRegisterEmail('');
      setArtisanRegisterPassword('');
      setArtisanRegisterName('');
    }
    setShowArtisanRegisterModal(true);
  };

  const handleAddArtisanTag = (tagToAdd?: string) => {
    const val = (tagToAdd || artisanTagInput).trim();
    if (!val) return;
    if (artisanTags.includes(val)) {
      showToast('Bu uzmanlık etiketi zaten ekli.', true);
      return;
    }
    setArtisanTags([...artisanTags, val]);
    if (!tagToAdd) setArtisanTagInput('');
  };

  const handleRemoveArtisanTag = (tagToRemove: string) => {
    setArtisanTags(artisanTags.filter(t => t !== tagToRemove));
  };

  const handleSubmitArtisanOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUsta = artisanKind === 'usta';
    if (!artisanBusinessName.trim()) {
      showToast(isUsta ? 'Lütfen usta / firma adınızı giriniz.' : 'Lütfen işletme veya dükkan ünvanınızı giriniz.', true);
      return;
    }
    if (!artisanAddress.trim()) {
      showToast(isUsta ? 'Lütfen çalışma bölgenizi / adresinizi giriniz.' : 'Lütfen işletme adresinizi giriniz.', true);
      return;
    }
    if (artisanCategory === DIGER_ALAN) {
      if (isUsta) {
        const chk = cleanAreaName(artisanCustomArea);
        if (!chk.ok) {
          showToast(chk.error, true);
          return;
        }
      } else if (artisanCustomArea.trim().length < 3) {
        showToast('Lütfen işletme türünüzü yazınız (en az 3 harf).', true);
        return;
      }
    }
    const hesapTipi: 'usta' | 'esnaf' = artisanKind;
    setArtisanIsSubmitting(true);
    try {
      if (user && profile) {
        // Mevcut kullanıcıyı usta veya esnaf hesabına yükselt
        const areaName = (await resolveAreaChoice(hesapTipi, artisanCategory, artisanCustomArea))
          || (artisanCategory === DIGER_ALAN ? artisanCustomArea.trim() : artisanCategory);
        const userRef = doc(db, 'users', user.uid);
        // Hoş geldin kredisi (10) yalnızca ustalara ve yalnızca bir kez verilir.
        const alreadyGotBonus = (profile as any).welcomeBonusGiven === true || (profile.role === 'esnaf' && isUstaProfile(profile));
        const updatedCredits = isUsta
          ? (alreadyGotBonus ? (profile.credits || 0) : Math.max(10, profile.credits || 0))
          : (profile.credits || 0);
        const grantBonus = isUsta && !alreadyGotBonus;
        const updatedProfile: UserProfile = {
          ...profile,
          role: 'esnaf',
          hesapTipi,
          isyeri: artisanBusinessName.trim(),
          esnafKategori: areaName,
          adres: artisanAddress.trim(),
          calismaSaatleri: artisanWorkingHours.trim() || 'Pazartesi - Cumartesi: 08:30 - 19:30',
          uzmanlikEtiketleri: isUsta ? artisanTags : [],
          esnafAciklama: artisanDescription.trim(),
          telefon: artisanPhone.trim() || profile.telefon,
          credits: updatedCredits,
          isApproved: true,
        };

        const payload: Record<string, any> = {
          role: 'esnaf',
          hesapTipi,
          isyeri: updatedProfile.isyeri,
          esnafKategori: updatedProfile.esnafKategori,
          adres: updatedProfile.adres,
          calismaSaatleri: updatedProfile.calismaSaatleri,
          uzmanlikEtiketleri: updatedProfile.uzmanlikEtiketleri || [],
          esnafAciklama: updatedProfile.esnafAciklama || '',
          telefon: updatedProfile.telefon || '',
          credits: updatedCredits,
          isApproved: true,
        };
        if (grantBonus) payload.welcomeBonusGiven = true;
        await updateDoc(userRef, payload);

        setProfile(updatedProfile);
        setDemoRole('esnaf');
        setShowArtisanRegisterModal(false);
        showToast(isUsta
          ? (grantBonus ? '🎉 Usta hesabınız açıldı! 10 başlangıç teklif krediniz cüzdanınıza tanımlandı.' : '✅ Usta bilgileriniz güncellendi.')
          : '🎉 Esnaf hesabınız açıldı! Kampanyalarınızı yayınlayabilirsiniz.');
      } else {
        // Misafir kullanıcı için doğrudan hesap aç
        if (!artisanRegisterEmail || !artisanRegisterPassword) {
          showToast('Lütfen e-posta ve şifrenizi giriniz.', true);
          setArtisanIsSubmitting(false);
          return;
        }
        if (artisanRegisterPassword.length < 6) {
          showToast('Şifre en az 6 karakter olmalıdır.', true);
          setArtisanIsSubmitting(false);
          return;
        }

        const emailClean = artisanRegisterEmail.trim().toLowerCase();
        let userUid = '';
        suppressAutoProfileRef.current = true;
        try {
          const cred = await createUserWithEmailAndPassword(auth, emailClean, artisanRegisterPassword);
          userUid = cred.user.uid;

          const areaName = (await resolveAreaChoice(hesapTipi, artisanCategory, artisanCustomArea))
            || (artisanCategory === DIGER_ALAN ? artisanCustomArea.trim() : artisanCategory);

          const newProfile: UserProfile = {
            uid: userUid,
            name: artisanRegisterName.trim() || artisanBusinessName.trim() || (isUsta ? 'Usta Komşumuz' : 'Esnaf Komşumuz'),
            email: emailClean,
            role: 'esnaf',
            hesapTipi,
            telefon: artisanPhone.trim(),
            isyeri: artisanBusinessName.trim(),
            esnafKategori: areaName,
            adres: artisanAddress.trim(),
            calismaSaatleri: artisanWorkingHours.trim() || 'Pazartesi - Cumartesi: 08:30 - 19:30',
            uzmanlikEtiketleri: isUsta ? artisanTags : [],
            esnafAciklama: artisanDescription.trim(),
            credits: isUsta ? 10 : 0,
            welcomeBonusGiven: isUsta ? true : undefined,
            isApproved: true,
            createdAt: new Date(),
          };

          await setDoc(doc(db, 'users', userUid), newProfile);
          setProfile(newProfile);
          setDemoRole('esnaf');
          setRealRole('esnaf');
        } finally {
          suppressAutoProfileRef.current = false;
        }
        setShowArtisanRegisterModal(false);
        showToast(isUsta
          ? '🎉 Usta hesabınız oluşturuldu ve 10 teklif kredisi yüklendi!'
          : '🎉 Esnaf hesabınız oluşturuldu!');
      }
    } catch (e: any) {
      if (e.code === 'auth/operation-not-allowed') {
        showToast('Firebase Konsolunda "E-posta / Şifre" sağlayıcısı henüz aktif edilmemiş! Lütfen Firebase Console > Authentication > Sign-in method sekmesinden Email/Password seçeneğini aktif ediniz.', true);
      } else if (e.code === 'auth/email-already-in-use') {
        showToast('Bu e-posta adresi ile zaten bir hesap kayıtlı. Lütfen giriş yapınız.', true);
      } else {
        showToast('Kayıt oluşturulurken hata: ' + (e.message || e), true);
      }
    } finally {
      setArtisanIsSubmitting(false);
    }
  };

  const handleOpenArmutWizard = (category?: string, sub?: string) => {
    setArmutSelectedCat(category || 'Tesisat, Su & Isıtma');
    setArmutSelectedSub(sub || 'Su Kaçağı & Tesisat Tamiri');
    setArmutTiming('Hemen / En Kısa Sürede');
    setArmutDetail('');
    setArmutAddress(profile?.adres || 'Mutlular Mahallesi, Yıldırım / Bursa');
    setArmutPhone(profile?.telefon || '');
    setArmutStep(1);
    setShowArmutWizard(true);
  };

  const handleSubmitArmutWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!armutDetail.trim()) {
      showToast('Lütfen ihtiyacınızın detaylarını belirtiniz.', true);
      return;
    }
    const newId = await createServiceRequest({
      baslik: `${armutSelectedSub} (${armutTiming})`,
      aciklama: armutDetail.trim(),
      kategori: armutSelectedCat,
      altKategori: armutSelectedSub,
      adres: armutAddress,
      telefon: armutPhone,
      urgent: armutTiming.toLowerCase().includes('hemen') || armutTiming.toLowerCase().includes('acil'),
      fotolar: armutPhoto ? [armutPhoto] : []
    });
    if (!newId) return;
    setShowArmutWizard(false);
    setServiceViewMode('requests');
    showToast('Hizmet talebiniz açıldı! Kategorinize uygun ustalara bildirim gitti, teklifler size gelecek. 👍');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const cleanPhone = editPhone.replace(/\D/g, '');
      if (cleanPhone.length > 0 && cleanPhone.length < 10) {
        showToast('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane)', true);
        return;
      }
      const savedRole: UserRole = (realRole === 'admin' || realRole === 'editor') ? realRole : editRole;
      if (editRole === 'esnaf' && editEsnafKategori === DIGER_ALAN) {
        if (editHesapTipi === 'usta') {
          const chk = cleanAreaName(editCustomArea);
          if (!chk.ok) {
            showToast(chk.error, true);
            return;
          }
        } else if (editCustomArea.trim().length < 3) {
          showToast('Lütfen işletme türünüzü yazınız (en az 3 harf).', true);
          return;
        }
      }
      let resolvedArea: string | undefined;
      if (editRole === 'esnaf') {
        resolvedArea = (await resolveAreaChoice(editHesapTipi, editEsnafKategori, editCustomArea))
          || (editEsnafKategori === DIGER_ALAN ? editCustomArea.trim() : editEsnafKategori);
      }
      const updated: UserProfile = {
        ...profile,
        name: editName.trim() || profile.name,
        telefon: editPhone.trim() || profile.telefon,
        photoURL: editPhotoURL.trim() || profile.photoURL,
        role: savedRole,
        isyeri: editRole === 'esnaf' ? (editIsyeri.trim() || profile.isyeri || editName) : undefined,
        hesapTipi: editRole === 'esnaf' ? editHesapTipi : undefined,
        esnafKategori: editRole === 'esnaf' ? (resolvedArea || profile.esnafKategori) : undefined,
        adres: editRole === 'esnaf' ? (editAdres.trim() || profile.adres) : profile.adres,
        calismaSaatleri: editRole === 'esnaf' ? (editCalismaSaatleri.trim() || profile.calismaSaatleri) : profile.calismaSaatleri,
        uzmanlikEtiketleri: editRole === 'esnaf' ? (editHesapTipi === 'usta' ? editUzmanlikEtiketleri : []) : profile.uzmanlikEtiketleri,
        esnafAciklama: editRole === 'esnaf' ? (editEsnafAciklama.trim() || profile.esnafAciklama) : profile.esnafAciklama,
      };

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          name: updated.name,
          telefon: updated.telefon || '',
          photoURL: updated.photoURL || '',
          role: updated.role,
          isyeri: updated.isyeri || '',
          hesapTipi: updated.hesapTipi || '',
          esnafKategori: updated.esnafKategori || '',
          adres: updated.adres || '',
          calismaSaatleri: updated.calismaSaatleri || '',
          uzmanlikEtiketleri: updated.uzmanlikEtiketleri || [],
          esnafAciklama: updated.esnafAciklama || '',
        });
      }
      setProfile(updated);
      setDemoRole(savedRole);
      setRealRole(savedRole);
      setShowProfileEditModal(false);
      showToast('Profil ve görsel bilgileriniz başarıyla güncellendi! ✅');
    } catch (e: any) {
      showToast('Güncelleme hatası: ' + e.message, true);
    }
  };

  // Submit Offer
  const handleGiveOffer = async (requestId: string, price: number, message: string, duration: string) => {
    const targetReq = serviceRequests.find((r) => r.id === requestId);
    if (targetReq) {
      if (user && targetReq.uid && targetReq.uid === user.uid) {
        showToast('Kendi talebinize teklif veremezsiniz.', true);
        return;
      }
      if (targetReq.status && targetReq.status !== 'open') {
        showToast('Bu talep artık teklif almıyor.', true);
        return;
      }
      if (user && (offersMap[requestId] || []).some((o) => o.esnafUid === user.uid)) {
        showToast('Bu talebe zaten teklif verdiniz.', true);
        return;
      }
      if (profile?.role === 'esnaf' && !requestMatchesEsnaf(targetReq, profile, ALL_SERVICE_CATEGORIES)) {
        showToast('Bu talep hizmet kategoriniz dışında.', true);
        return;
      }
    }
    if (profile && profile.role === 'esnaf' && !isUstaProfile(profile)) {
      showToast('Teklif vermek için usta hesabı gerekir. Profilinizden hesap türünü Usta olarak değiştirebilirsiniz.', true);
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      showToast('Lütfen geçerli bir teklif fiyatı girin.', true);
      return;
    }

    const effectiveCredits = profile?.credits ?? (demoRole === 'esnaf' ? 8 : 0);
    if (effectiveCredits < 1) {
      showToast('Yetersiz kredi bakiyesi! Lütfen WhatsApp ile kredi yükleyin.', true);
      setShowCreditModal(true);
      return;
    }

    try {
      if (user && profile) {
        const esnafRef = doc(db, 'users', user.uid);
        const requestRef = doc(db, 'service_requests', requestId);
        const offerRef = doc(collection(db, 'offers'));

        // Kural gereği: kredi kaydının kimliği 'ofr_{teklifId}', telefon ayrı gizli belgede.
        const creditLogRef = doc(db, 'credit_transactions', 'ofr_' + offerRef.id);
        const privateRef = doc(db, 'offers', offerRef.id, 'private', 'iletisim');

        await runTransaction(db, async (tx) => {
          const esnafDoc = await tx.get(esnafRef);
          const reqDoc = await tx.get(requestRef);

          if (!reqDoc.exists()) throw new Error('Talep bulunamadı (silinmiş olabilir).');
          const reqData = reqDoc.data();
          if (reqData.status && reqData.status !== 'open') throw new Error('Bu talep artık teklif almıyor.');
          if (!esnafDoc.exists()) throw new Error('Esnaf kaydınız bulunamadı.');

          const curCred = esnafDoc.data()?.credits || 0;
          if (curCred < 1) throw new Error('Yetersiz kredi!');
          tx.update(esnafRef, { credits: curCred - 1 });

          tx.set(creditLogRef, {
            uid: user.uid,
            isyeri: profile.isyeri || profile.name || 'Esnaf',
            type: 'offer_submit',
            amount: -1,
            balanceAfter: curCred - 1,
            relatedRequestId: requestId,
            relatedOfferId: offerRef.id,
            createdAt: serverTimestamp()
          });

          tx.set(offerRef, {
            requestId,
            requestOwnerUid: reqData.uid || '',
            requestTitle: reqData.baslik || '',
            esnafUid: user.uid,
            esnafIsyeri: profile.isyeri || profile.name || 'Esnaf',
            fiyat: price,
            mesaj: message,
            tahminiSure: duration,
            creditCost: 1,
            status: 'pending',
            createdAt: serverTimestamp()
          });

          // Usta telefonu teklif belgesinde değil, kabulden önce talep sahibine kapalı olan ayrı belgede.
          tx.set(privateRef, { telefon: profile.telefon || '' });

          tx.update(requestRef, { offerCount: increment(1) });
        });

        setProfile((prev) => prev ? { ...prev, credits: Math.max(0, (prev.credits || 1) - 1) } : null);
      } else {
        // Mock state update if running in demo mode
        const newOffer: ServiceOffer = {
          id: 'offer_' + Date.now(),
          requestId,
          esnafUid: 'demo_esnaf',
          esnafIsyeri: profile?.isyeri || 'Mutlular Usta Servisi',
          esnafTelefon: profile?.telefon || '',
          fiyat: price,
          mesaj: message,
          tahminiSure: duration,
          creditCost: 1,
          status: 'pending',
          createdAt: new Date()
        };
        setOffersMap((prev) => ({
          ...prev,
          [requestId]: [newOffer, ...(prev[requestId] || [])]
        }));
        setServiceRequests((prev) =>
          prev.map((r) => r.id === requestId ? { ...r, offerCount: (r.offerCount || 0) + 1 } : r)
        );
        if (profile) {
          setProfile({ ...profile, credits: Math.max(0, (profile.credits || 8) - 1) });
        }
      }

      setShowOfferModal(null);
      showToast('Teklifiniz talep sahibine iletildi! (1 Kredi düşüldü) 🛠️');
    } catch (err: any) {
      showToast(err?.code === 'permission-denied' ? 'Teklif gönderilemedi: yetki hatası (usta hesabıyla giriş yaptığınızdan emin olun)' : (err?.message || 'Teklif gönderilemedi'), true);
    }
  };

  // Mahalle Pazarı / Esnaf Kampanya Yayınlama
  const handlePublishCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Kampanya yayınlamak için önce giriş yapmalısınız.', true);
      return;
    }
    if (!isRealStaff && !(isEsnafAccount && myBusiness?.approvalStatus === 'approved')) {
      showToast('Kampanya yayınlamak için onaylı işletme sayfası gerekir.', true);
      return;
    }
    if (!campIsyeri || !campBaslik || !campAciklama) {
      showToast('Lütfen dükkan adı, başlık ve açıklamayı doldurun.', true);
      return;
    }
    if (campTelefon.replace(/\D/g, '').length < 10) {
      showToast('Lütfen geçerli bir telefon numarası yazın.', true);
      return;
    }
    if (!campFoto.trim()) {
      showToast('Lütfen kampanya için bir fotoğraf yükleyin.', true);
      return;
    }
    const finalPhoto = campFoto.trim();

    try {
      await addDoc(collection(db, 'esnaf_kampanyalar'), {
        uid: user.uid,
        esnafId: user.uid,
        authorName: profile?.name || user.displayName || 'Esnaf',
        isyeriAdi: campIsyeri,
        kategori: campKategori,
        baslik: campBaslik,
        aciklama: campAciklama,
        indirimOrani: campIndirim,
        rozet: campRozet,
        fotoUrl: finalPhoto,
        fotolar: [finalPhoto],
        adres: campAdres || myBusiness?.adres || '',
        telefon: campTelefon,
        gecerlilikTarihi: campGecerlilik || 'Süresiz',
        // Esnaf kampanyası editör/yönetici onayına düşer; editör/yönetici doğrudan yayınlar.
        status: isRealStaff ? 'published' : 'pending',
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      showToast('Kampanya kaydedilemedi: ' + errText(err), true);
      return;
    }

    setShowCampaignModal(false);
    showToast(isRealStaff ? 'Kampanya Mahalle Pazarı\'nda yayınlandı 🏪' : 'Kampanyanız editör onayına gönderildi. Onaylanınca yayınlanır 🏪');
  };

  // Role & Admin Check
  const isUserAdmin = Boolean((user || profile) && (demoRole === 'admin' || profile?.role === 'admin' || (user?.email === 'yakupkrbck@gmail.com' && user?.emailVerified)));
  const isUserEditor = Boolean((user || profile) && (isUserAdmin || demoRole === 'editor' || profile?.role === 'editor'));
  const pendingTipsCount = useMemo(() => {
    return newsItems.filter(n => n.status === 'pending').length + pendingDeceased.length + pendingCampaigns.length + (isRealAdmin ? pendingBusinesses.length : 0);
  }, [newsItems, pendingDeceased, pendingCampaigns, pendingBusinesses, isRealAdmin]);

  // Filtered lists
  const breakingNews = useMemo(() => {
    return newsItems.find((n) => n.sonDakika && n.status === 'approved') || newsItems.find(n => n.status === 'approved') || null;
  }, [newsItems]);

  const trendingNews = useMemo(() => {
    return [...newsItems]
      .filter((n) => n.status === 'approved')
      .sort((a, b) => {
        const scoreA = ((a.okunmaSayisi || 0) * 1.4) + ((a.begeniSayisi || 0) * 3) + (a.sonDakika ? 500 : 0);
        const scoreB = ((b.okunmaSayisi || 0) * 1.4) + ((b.begeniSayisi || 0) * 3) + (b.sonDakika ? 500 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [newsItems]);

  const filteredNews = useMemo(() => {
    const activeSearch = (newsSearchTerm || searchQuery).trim().toLowerCase();
    const list = newsItems.filter((n) => {
      const matchSearch =
        !activeSearch ||
        ((n.baslik || '') + (n.ozet || '') + (n.authorName || '') + (n.kategori || '')).toLowerCase().includes(activeSearch);
      const matchStatus = n.status === 'approved';
      const matchCategory = newsFilter === 'tumu' || (n as any).kategori === newsFilter;
      const matchSort =
        newsSortBy === 'breaking' ? n.sonDakika === true :
        newsSortBy === 'popular' ? (n.okunmaSayisi || 0) >= 1000 :
        newsSortBy === 'likes' ? (n.begeniSayisi || 0) >= 80 :
        true;
      return matchSearch && matchStatus && matchCategory && matchSort;
    });

    if (newsSortBy === 'popular') {
      return [...list].sort((a, b) => (b.okunmaSayisi || 0) - (a.okunmaSayisi || 0));
    }
    if (newsSortBy === 'likes') {
      return [...list].sort((a, b) => (b.begeniSayisi || 0) - (a.begeniSayisi || 0));
    }
    if (newsSortBy === 'trending') {
      return [...list].sort((a, b) => {
        const sA = (a.okunmaSayisi || 0) * 1.4 + (a.begeniSayisi || 0) * 3 + (a.sonDakika ? 500 : 0);
        const sB = (b.okunmaSayisi || 0) * 1.4 + (b.begeniSayisi || 0) * 3 + (b.sonDakika ? 500 : 0);
        return sB - sA;
      });
    }
    return list;
  }, [newsItems, newsSearchTerm, searchQuery, demoRole, newsFilter, newsSortBy]);

  const filteredMarket = useMemo(() => {
    return marketplaceItems.filter((m) => {
      const matchSearch = (m.baslik + m.aciklama + m.saticiAdi).toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = marketFilter === 'tumu' || m.kategori.toLowerCase().includes(marketFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [marketplaceItems, searchQuery, marketFilter]);

  // 🏠 EMLAK İLANLARI (Kiralık, Satılık, Daire, Dükkan - Sahibinden Tarzı)
  const emlakItems = useMemo(() => {
    const filtered = marketplaceItems.filter((m) => {
      const isEmlak = m.ilanTuru === 'emlak' || m.kategori?.toLowerCase().includes('daire') || m.kategori?.toLowerCase().includes('dükkan') || m.kategori?.toLowerCase().includes('emlak');
      if (!isEmlak) return false;
      const searchTxt = (m.baslik + m.aciklama + (m.odaSayisi || '') + (m.saticiAdi || '') + (m.kategori || '')).toLowerCase();
      const query = (marketSearchTerm || searchQuery).toLowerCase();
      const matchSearch = searchTxt.includes(query);
      const matchType = emlakTypeFilter === 'all' || m.emlakTuru === emlakTypeFilter;
      const matchRoom = emlakRoomFilter === 'all' || (m.odaSayisi && m.odaSayisi.toLowerCase().includes(emlakRoomFilter.toLowerCase()));
      return matchSearch && matchType && matchRoom;
    });

    return [...filtered].sort((a, b) => {
      if (emlakSortBy === 'price_asc') return (a.fiyat || 0) - (b.fiyat || 0);
      if (emlakSortBy === 'price_desc') return (b.fiyat || 0) - (a.fiyat || 0);
      return 0;
    });
  }, [marketplaceItems, marketSearchTerm, searchQuery, emlakTypeFilter, emlakRoomFilter, emlakSortBy]);

  // 📦 2. EL EŞYA VE İKİNCİ EL İLANLARI
  const secondHandItems = useMemo(() => {
    return marketplaceItems.filter((m) => {
      const isEmlak = m.ilanTuru === 'emlak' || m.kategori?.toLowerCase().includes('daire') || m.kategori?.toLowerCase().includes('dükkan') || m.kategori?.toLowerCase().includes('emlak');
      if (isEmlak) return false;
      const searchTxt = (m.baslik + m.aciklama + (m.saticiAdi || '') + (m.kategori || '')).toLowerCase();
      const query = (marketSearchTerm || searchQuery).toLowerCase();
      const matchSearch = searchTxt.includes(query);
      const matchCat = secondHandCatFilter === 'all' || m.kategori?.toLowerCase().includes(secondHandCatFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [marketplaceItems, marketSearchTerm, searchQuery, secondHandCatFilter]);

  // 💍 MAHALLE CEMİYET & DAVETLERİ
  const filteredDavetler = useMemo(() => {
    return invitationItems.filter((d) => {
      const searchTxt = (d.baslik + d.davetSahipleri + (d.gelinDamat || '') + d.mekanAdi + d.adres + (d.aciklama || '')).toLowerCase();
      const query = (davetSearch || searchQuery).toLowerCase();
      const matchSearch = searchTxt.includes(query);
      const matchCat = davetCategoryFilter === 'all' || d.tur === davetCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [invitationItems, davetSearch, searchQuery, davetCategoryFilter]);

  const filteredLostFound = useMemo(() => {
    return lostFoundItems.filter((l) => {
      const matchSearch = (l.baslik + l.aciklama + l.kategori + (l.konum || '')).toLowerCase().includes(searchQuery.toLowerCase());
      const matchTur = lostFoundFilter === 'tumu' ? true : lostFoundFilter === 'acil' ? l.isCritical : l.tur === lostFoundFilter;
      return matchSearch && matchTur;
    });
  }, [lostFoundItems, searchQuery, lostFoundFilter]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = (c.isyeriAdi + c.baslik + c.aciklama + c.kategori + (c.indirimOrani || '')).toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = campaignFilter === 'tumu' || c.kategori.toLowerCase().includes(campaignFilter.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [campaigns, searchQuery, campaignFilter]);

  const filteredKursu = useMemo(() => {
    return kursuItems.filter((k) => {
      const matchSearch = (k.baslik + k.icerik + k.authorName + (k.konum || '')).toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = kursuCategoryFilter === 'Hepsi' || k.kategori === kursuCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [kursuItems, searchQuery, kursuCategoryFilter]);

  // ── 🛍️ BİRLEŞİK MUTLULAR ALIM SATIM (TARLA, 2. EL, KİRALIK EV - HEPSİ AYNI YERDE) ──
  const filteredUnifiedMarket = useMemo(() => {
    const q = (marketSearchTerm || searchQuery).trim().toLowerCase();
    const list = marketplaceItems.filter((item) => {
      const matchesSearch = !q || (
        (item.baslik || '') +
        (item.aciklama || '') +
        (item.kategori || '') +
        (item.saticiAdi || '') +
        (item.odaSayisi || '')
      ).toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (marketCategoryFilter === 'all') return true;
      if (marketCategoryFilter === 'tarla') {
        const titleAndCat = ((item.kategori || '') + ' ' + (item.baslik || '') + ' ' + (item.aciklama || '')).toLowerCase();
        return titleAndCat.includes('tarla') || titleAndCat.includes('arsa') || titleAndCat.includes('bahçe') || titleAndCat.includes('zeytinlik');
      }
      if (marketCategoryFilter === 'kiralik_ev') {
        return (
          (item.ilanTuru === 'emlak' || (item.kategori && item.kategori.toLowerCase().includes('daire'))) &&
          (item.emlakTuru === 'kiralik' || (item.kategori && item.kategori.toLowerCase().includes('kiralık')))
        );
      }
      if (marketCategoryFilter === 'satilik_ev') {
        const isTarla = ((item.kategori || '') + ' ' + (item.baslik || '')).toLowerCase().includes('tarla');
        return !isTarla && (
          (item.ilanTuru === 'emlak' || (item.kategori && item.kategori.toLowerCase().includes('daire'))) &&
          (item.emlakTuru === 'satilik' || (item.kategori && item.kategori.toLowerCase().includes('satılık')))
        );
      }
      if (marketCategoryFilter === 'ikinci_el') {
        return item.ilanTuru === 'ikinci_el' || item.kategori === 'Mobilya' || item.kategori === 'Anne & Bebek' || item.kategori === 'Spor & Bisiklet';
      }
      if (marketCategoryFilter === 'elektronik') {
        const fullTxt = ((item.kategori || '') + ' ' + (item.baslik || '')).toLowerCase();
        return fullTxt.includes('elektronik') || fullTxt.includes('makine') || fullTxt.includes('kahve') || fullTxt.includes('telve');
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (marketUnifiedSort === 'price_asc') return (a.fiyat || 0) - (b.fiyat || 0);
      if (marketUnifiedSort === 'price_desc') return (b.fiyat || 0) - (a.fiyat || 0);
      return 0;
    });
  }, [marketplaceItems, marketSearchTerm, searchQuery, marketCategoryFilter, marketUnifiedSort]);

  // ── 📰 HABER AKIŞI FİLTRESİ (ANA SAYFA İÇİN) ──
  const homeFilteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = newsItems.filter((n) => {
      const matchStatus = n.status === 'approved';
      const matchSearch = !q || ((n.baslik || '') + (n.ozet || '') + (n.kategori || '') + (n.authorName || '')).toLowerCase().includes(q);
      const matchCat = homeNewsCategoryFilter === 'all' || homeNewsCategoryFilter === 'tumu' || (n.kategori && n.kategori.toLowerCase().includes(homeNewsCategoryFilter.toLowerCase()));
      return matchStatus && matchSearch && matchCat;
    });
    // createdAt DESC (en güncel en üstte)
    return list;
  }, [newsItems, searchQuery, homeNewsCategoryFilter]);

  // ── 🌟 MUTLULAR PLATFORM STATE & DATA ──
  const [showMutlularShareModal, setShowMutlularShareModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Vitrin yalnızca gerçek kayıtlardan oluşur; kayıt yoksa o slayt hiç gösterilmez (uydurma başlık/fiyat yok).
  const vitrinSlideItems: VitrinItem[] = useMemo(() => {
    const slides: VitrinItem[] = [];
    const topNews = newsItems.find((n) => n.status === 'approved') || undefined;
    const activeMarket = marketplaceItems.filter((i) => !i.status || i.status === 'active');
    const topEmlak = activeMarket.find((i) => i.ilanTuru === 'emlak' || (i.kategori && i.kategori.toLowerCase().includes('emlak')));
    const topIkinciEl = activeMarket.find((i) => i !== topEmlak && (i.ilanTuru === 'ikinci_el' || (i.kategori && !i.kategori.toLowerCase().includes('emlak'))));

    if (topNews) {
      slides.push({
        id: 'vitrin-haber',
        categoryType: 'haber',
        categoryLabel: 'SON HABER',
        categoryIcon: '📰',
        categoryBadgeClass: 'bg-red-600 text-white',
        title: topNews.baslik,
        subtitle: topNews.ozet || '',
        actionText: 'Haberi Oku →',
        imageUrl: topNews.imageURL || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
        meta: topNews.kategori || 'Mahalle Haberi',
        dataRef: topNews
      } as VitrinItem);
    }
    if (topEmlak) {
      slides.push({
        id: 'vitrin-emlak',
        categoryType: 'emlak',
        categoryLabel: 'EMLAK',
        categoryIcon: '🏠',
        categoryBadgeClass: 'bg-amber-500 text-slate-950 font-black',
        title: topEmlak.baslik,
        subtitle: [typeof topEmlak.fiyat === 'number' ? topEmlak.fiyat.toLocaleString('tr-TR') + ' TL' : '', topEmlak.odaSayisi, topEmlak.aciklama ? String(topEmlak.aciklama).slice(0, 90) : ''].filter(Boolean).join(' • '),
        actionText: 'İlanı Gör →',
        imageUrl: topEmlak.fotolar?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        meta: 'Emlak İlanı',
        dataRef: topEmlak
      } as VitrinItem);
    }
    if (topIkinciEl) {
      slides.push({
        id: 'vitrin-ikinciel',
        categoryType: 'ikinci_el',
        categoryLabel: '2. EL',
        categoryIcon: '🚗',
        categoryBadgeClass: 'bg-blue-600 text-white',
        title: topIkinciEl.baslik,
        subtitle: [typeof topIkinciEl.fiyat === 'number' ? topIkinciEl.fiyat.toLocaleString('tr-TR') + ' TL' : '', topIkinciEl.aciklama ? String(topIkinciEl.aciklama).slice(0, 90) : ''].filter(Boolean).join(' • '),
        actionText: 'İlanı Gör →',
        imageUrl: topIkinciEl.fotolar?.[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
        meta: '2. El İlanı',
        dataRef: topIkinciEl
      } as VitrinItem);
    }
    return slides;
  }, [newsItems, marketplaceItems]);

  // Mahalle usta listesi: örnek (sahte) usta kalmadı. Gerçek ustalar kayıt ve onaydan sonra FAZ 5'te buraya bağlanacak.
  const neighborhoodMastersList: NeighborhoodMaster[] = [];

  const handleSelectVitrinItem = (item: VitrinItem) => {
    if (item.categoryType === 'haber') {
      handleOpenNewsDetail(item.dataRef);
    } else if (item.categoryType === 'emlak' || item.categoryType === 'ikinci_el') {
      setSelectedMockupListing(item.dataRef);
    } else if (item.categoryType === 'hizmet') {
      setSelectedMockupMaster({
        id: item.dataRef.id,
        name: item.dataRef.name,
        phone: item.dataRef.phone,
        rating: item.dataRef.rating,
        reviewCount: item.dataRef.reviewCount,
        address: item.dataRef.neighborhood,
        avatar: item.dataRef.avatar,
        subCategories: [item.dataRef.profession]
      });
    }
  };

  // ── DİNAMİK ÜST LOGO VE BAŞLIK (MUTLULAR HABER / MUTLULAR ALIM SATIM / MUTLULAR HİZMET) ──
  const getHeaderBrand = () => {
    if (activeTab === 'market' || activeTab === 'pazar') {
      return {
        prefix: 'MUTLULAR',
        suffix: 'ALIM SATIM',
        slogan: 'Mahallenin güvenli alım satım ve pazar yeri',
        colorClass: 'text-amber-600',
        badge: '🛍️',
        targetTab: 'market' as const
      };
    }
    if (activeTab === 'services' || activeTab === 'esnaf') {
      return {
        prefix: 'MUTLULAR',
        suffix: 'HİZMET',
        slogan: 'Mahallenin onaylı ustaları ve hizmet rehberi',
        colorClass: 'text-emerald-600',
        badge: '🛠️',
        targetTab: 'services' as const
      };
    }
    // Varsayılan / Haber alanı ('home', 'news', 'explore' vb.)
    return {
      prefix: 'MUTLULAR',
      suffix: 'HABER',
      slogan: 'Mahallenin sesi, hepimizin haberi',
      colorClass: 'text-red-600',
      badge: '🇹🇷',
      targetTab: 'home' as const
    };
  };

  // "Diğer" seçildiğinde kullanıcının yazdığı alanı çözer. Usta: sisteme faaliyet alanı olarak eklenir. Esnaf: yalnızca işletme türü metni.
  const resolveAreaChoice = async (kind: 'usta' | 'esnaf', value: string, custom: string): Promise<string | null> => {
    if (value !== DIGER_ALAN) return value;
    if (kind === 'usta') return await addCustomArea(custom);
    const c = (custom || '').replace(/\s+/g, ' ').trim();
    if (c.length < 3) {
      showToast('Lütfen işletme türünüzü yazın (en az 3 harf).', true);
      return null;
    }
    return c.slice(0, 40);
  };

  // Usta için hizmet alanı, esnaf için işletme türü seçimi (+ "Diğer" ile kendi alanını yazma)
  const renderAreaSelect = (
    kind: 'usta' | 'esnaf',
    value: string,
    onChange: (v: string) => void,
    custom: string,
    onCustom: (v: string) => void
  ) => {
    const options: string[] = kind === 'esnaf' ? ESNAF_TURLERI : ALL_SERVICE_CATEGORIES.map((c: any) => c.name as string);
    const legacy = value && value !== DIGER_ALAN && !options.includes(value) ? value : '';
    const cls = 'w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold';
    return (
      <div className="space-y-2">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          {legacy && <option value={legacy}>{legacy}</option>}
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
          <option value={DIGER_ALAN}>➕ Diğer (kendi alanımı yazacağım)</option>
        </select>
        {value === DIGER_ALAN && (
          <div className="space-y-1">
            <input
              type="text"
              value={custom}
              maxLength={40}
              onChange={(e) => onCustom(e.target.value)}
              placeholder={kind === 'esnaf' ? 'Örn: Bisiklet Tamir Dükkanı' : 'Örn: Klima Servisi'}
              className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
            />
            <p className="text-[10px] text-amber-900/80 leading-snug">
              {kind === 'esnaf'
                ? 'İşletme türünüz profilinizde görünür.'
                : 'Yazdığınız faaliyet alanı sisteme eklenir: komşular bu alanda talep açabilir, siz de teklif verebilirsiniz.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Sosyal medya paneli: paylaşılabilir içerik kaynakları (yayında olanlar)
  const adminShareSources = [
    ...newsItems.filter((n) => n.status === 'approved' && n.id).map((n) => ({ key: 'n_' + n.id, group: 'haber', label: n.baslik, sub: n.kategori || '', item: newsToShareItem(n) })),
    ...deceasedList.filter((d) => d.id).map((d) => ({ key: 'c_' + d.id, group: 'cenaze', label: d.fullName, sub: d.dateStr || '', item: dataToShareItem('cenaze', d, d.id) })),
    ...invitationItems.filter((d) => d.id).map((d) => ({ key: 'd_' + d.id, group: 'duyuru', label: d.baslik, sub: d.tarih || '', item: dataToShareItem('davet', d, d.id!) })),
    ...kursuItems.filter((k) => k.id).map((k) => ({ key: 'k_' + k.id, group: 'duyuru', label: k.baslik, sub: k.kategori || '', item: dataToShareItem('kursu', k, k.id!) })),
    ...marketplaceItems.filter((m) => m.id && m.status === 'active').map((m) => ({ key: 'm_' + m.id, group: 'ilan', label: m.baslik, sub: m.kategori || '', item: dataToShareItem('marketplace', m, m.id!) })),
    ...lostFoundItems.filter((l) => l.id).map((l) => ({ key: 'l_' + l.id, group: 'ilan', label: l.baslik, sub: l.tur === 'bulundu' ? 'Bulundu' : 'Kayıp', item: dataToShareItem('kayip', l, l.id!) })),
    ...businesses.map((b) => ({ key: 'b_' + b.id, group: 'esnaf', label: b.isyeri, sub: b.kategori, item: dataToShareItem('isletme', b, b.id) })),
    ...campaigns.filter((c) => c.id).map((c) => ({ key: 'e_' + c.id, group: 'esnaf', label: c.baslik, sub: c.isyeriAdi || '', item: dataToShareItem('kampanya', c, c.id!) }))
  ];

  // Üst şeritte yalnızca son 7 günün ilanları döner; "Tümü" listesinde hepsi görünür.
  const activeDeceased = deceasedList.filter((d: any) => {
    const ms = toMillis(d.createdAt);
    return !ms || Date.now() - ms < 7 * 24 * 3600 * 1000;
  });
  const dIdx = activeDeceased.length ? currentDeceasedIdx % activeDeceased.length : 0;
  const shownDeceased: any = activeDeceased[dIdx];
  const headerRoleKind: 'admin' | 'editor' | 'usta' | 'esnaf' | 'sakin' | null =
    !user && !profile
      ? null
      : isUserAdmin
      ? 'admin'
      : isUserEditor
      ? 'editor'
      : isUstaProfile(profile)
      ? 'usta'
      : profile?.role === 'esnaf'
      ? 'esnaf'
      : 'sakin';
  const liveEmbedUrl = liveConfig.aktif && liveConfig.url ? toEmbedUrl(liveConfig.url) : null;

  const headerBrand = getHeaderBrand();

  return {
    user, profile, setProfile, demoRole, setDemoRole, realRole, allUsersList, showAdminPanelModal,
    setShowAdminPanelModal, selectedMockupListing, setSelectedMockupListing, selectedMockupMaster,
    setSelectedMockupMaster, showMockupPostSheet, setShowMockupPostSheet, mockupFavorites,
    setMockupFavorites, mockupMarketCategory, setMockupMarketCategory, mockupServiceCategory,
    setMockupServiceCategory, activeTab, setActiveTab, showMenuDrawer, setShowMenuDrawer,
    showVefatModal, setShowVefatModal, savedNewsIds, setSavedNewsIds, notifTab, setNotifTab,
    mutlularTvActive, setMutlularTvActive, liveConfig, notifPrefs, sharedContent, shareItem,
    setShareItem, homeNewsCategoryFilter, setHomeNewsCategoryFilter, setMarketCategoryFilter,
    meclisFilter, setMeclisFilter, polls, myVotes, adminOpenTab, setAdminOpenTab, newsComments,
    newsLikeCount, myNewsLike, newCommentInput, setNewCommentInput, esnafCategoryFilter,
    setEsnafCategoryFilter, searchQuery, setSearchQuery, newsSearchTerm, setNewsSearchTerm,
    newsSortBy, setNewsSortBy, lostFoundFilter, setLostFoundFilter, newsFilter, setNewsFilter,
    campaignFilter, setCampaignFilter, newsItems, setNewsItems, marketplaceItems,
    setMarketplaceItems, lostFoundItems, setLostFoundItems, serviceRequests, campaigns, offersMap, ustaPhones,
    showOnboarding, obRole, setObRole, obAd, setObAd, obSoyad, setObSoyad, obPhone, setObPhone,
    obIsyeri, setObIsyeri, obArea, setObArea, obCustomArea, setObCustomArea, obAdres, setObAdres,
    obSaving, authCustomArea, setAuthCustomArea, artisanKind, setArtisanKind, artisanCustomArea,
    setArtisanCustomArea, editHesapTipi, setEditHesapTipi, editCustomArea, setEditCustomArea,
    requestScope, setRequestScope, acceptingOfferId, isRealStaff, isEsnafAccount, pendingDeceased,
    myDeceased, businesses, myBusiness, pendingBusinesses, pendingCampaigns, myCampaignsAll,
    businessView, showBusinessEditor, setShowBusinessEditor, bizStats, ALL_SERVICE_CATEGORIES,
    invitationItems, setInvitationItems, davetCategoryFilter, setDavetCategoryFilter, davetSearch,
    setDavetSearch, showDavetModal, setShowDavetModal, attendedDavetIds, activeTebrikDavetId,
    setActiveTebrikDavetId, newTebrikName, setNewTebrikName, newTebrikMsg, setNewTebrikMsg,
    marketDualMode, setMarketDualMode, emlakTypeFilter, setEmlakTypeFilter, emlakRoomFilter,
    setEmlakRoomFilter, emlakViewStyle, setEmlakViewStyle, emlakSortBy, setEmlakSortBy,
    selectedEmlakItem, setSelectedEmlakItem, secondHandCatFilter, setSecondHandCatFilter,
    selectedLetgoItem, setSelectedLetgoItem, marketSearchTerm, setMarketSearchTerm, marketModalType,
    setMarketModalType, showArmutWizard, setShowArmutWizard, armutStep, setArmutStep,
    armutSelectedCat, setArmutSelectedCat, armutSelectedSub, setArmutSelectedSub, armutTiming,
    setArmutTiming, armutPhoto, setArmutPhoto, armutDetail, setArmutDetail, armutAddress,
    setArmutAddress, armutPhone, setArmutPhone, serviceViewMode, setServiceViewMode,
    activeExpandedCatId, setActiveExpandedCatId, masterCategoryFilter, setMasterCategoryFilter,
    modalMainCatId, setModalMainCatId, modalSubCatName, setModalSubCatName, selectedServiceSector,
    setSelectedServiceSector, serviceSectorSearch, setServiceSectorSearch, newServiceReqTitle,
    setNewServiceReqTitle, newServiceReqDesc, setNewServiceReqDesc, newServiceReqAddress,
    setNewServiceReqAddress, newServiceReqPhone, setNewServiceReqPhone, newServiceReqUrgent,
    setNewServiceReqUrgent, newServiceReqPhoto, setNewServiceReqPhoto, handleOpenCategoryRequest,
    showKursuModal, setShowKursuModal, kursuBaslik, setKursuBaslik, kursuKategori, setKursuKategori,
    kursuIcerik, setKursuIcerik, kursuKonum, setKursuKonum, kursuFoto, setKursuFoto, showAuthModal,
    setShowAuthModal, authMode, setAuthMode, showServiceModal, setShowServiceModal, showMarketModal,
    setShowMarketModal, showLostFoundModal, setShowLostFoundModal, showCampaignModal,
    setShowCampaignModal, showNewsModal, setShowNewsModal, selectedNews, showOfferModal,
    setShowOfferModal, showRequestDetail, setShowRequestDetail, showCreditModal, setShowCreditModal,
    showQuickActionSheet, setShowQuickActionSheet, authRole, setAuthRole, authEmail, setAuthEmail,
    authPassword, setAuthPassword, authName, setAuthName, authPhone, setAuthPhone, authIsyeri,
    setAuthIsyeri, authEsnafKategori, setAuthEsnafKategori, authError, setAuthError,
    showProfileEditModal, setShowProfileEditModal, profileSubTab, setProfileSubTab, newsNotifPrefs,
    editName, setEditName, editPhone, setEditPhone, editPhotoURL, setEditPhotoURL, editRole,
    setEditRole, editIsyeri, setEditIsyeri, editEsnafKategori, setEditEsnafKategori, editAdres,
    setEditAdres, editCalismaSaatleri, setEditCalismaSaatleri, editUzmanlikEtiketleri,
    setEditUzmanlikEtiketleri, editUzmanlikInput, setEditUzmanlikInput, showArtisanRegisterModal,
    setShowArtisanRegisterModal, artisanBusinessName, setArtisanBusinessName, artisanCategory,
    setArtisanCategory, artisanAddress, setArtisanAddress, artisanWorkingHours,
    setArtisanWorkingHours, artisanTags, artisanTagInput, setArtisanTagInput, artisanPhone,
    setArtisanPhone, artisanDescription, setArtisanDescription, artisanRegisterEmail,
    setArtisanRegisterEmail, artisanRegisterPassword, setArtisanRegisterPassword,
    artisanRegisterName, setArtisanRegisterName, artisanIsSubmitting, campIsyeri, setCampIsyeri,
    campKategori, setCampKategori, campBaslik, setCampBaslik, campAciklama, setCampAciklama,
    campIndirim, setCampIndirim, campRozet, setCampRozet, campAdres, setCampAdres, campTelefon,
    setCampTelefon, campGecerlilik, setCampGecerlilik, campFoto, setCampFoto, editingRequest,
    setEditingRequest, editReqTitle, setEditReqTitle, editReqDesc, setEditReqDesc, editReqPhotos,
    editReqKategori, setEditReqKategori, editReqAdres, setEditReqAdres, deceasedList,
    setCurrentDeceasedIdx, showNewDeceasedModal, setShowNewDeceasedModal, newDeceasedName,
    setNewDeceasedName, newDeceasedAge, setNewDeceasedAge, newDeceasedFamily, setNewDeceasedFamily,
    newDeceasedMosque, setNewDeceasedMosque, newDeceasedPrayer, setNewDeceasedPrayer,
    newDeceasedCemetery, setNewDeceasedCemetery, newDeceasedDate, setNewDeceasedDate, toastMessage,
    showEmergencyModal, setShowEmergencyModal, showToast, handleOpenNewsDetail,
    handleCloseNewsDetail, openShareStudio, newsToShareItem, dataToShareItem, closeSharedContent,
    handleCopySharedLink, recordShare, handleOpenEditRequest, handleAddPhotoToEdit,
    handleRemovePhotoFromEdit, handleSaveEditRequest, handlePublishOfficialNews,
    handleApproveNewsTip, handleRejectNewsTip, allNotifications, unreadNotifCount,
    handleMarkAllNotificationsRead, handleOpenDerivedNotification, getBusinessFormInitial,
    handleSaveBusiness, handleApproveBusiness, handleRejectBusiness, handleApproveCampaign,
    handleRejectCampaign, trackBusinessEvent, openBusiness, closeBusiness, loadBizStats,
    openCampaignModal, isPollOpen, handleVotePoll, handleCreatePoll, handleTogglePoll,
    handleDeletePoll, handleToggleNewsLike, handleAddNewsComment, handleDeleteNewsComment,
    handleAddSample, handleRemoveSample, handleSaveNotifPrefs, createServiceRequest,
    handleAcceptOffer, handleDeleteNewsItem, handleUpdateUserRole, openWhatsApp, openDialer,
    handleToggleAttendDavet, handleAddTebrikMessage, handleShareDavetWhatsApp, handleAddToCalendar,
    handlePublishKursu, handlePublishDeceased, handleApproveDeceased, handleRejectDeceased,
    canDeleteDeceased, handleDeleteDeceased, handleSaveLive, toggleDemoRole, handleAuthSubmit,
    handleGoogleSignIn, handleCompleteOnboarding, handleCancelOnboarding, handleLogout,
    playAlertSound, handleSaveNewsNotifPrefs, handleTestBreakingNewsNotification,
    handleRequestBrowserPush, openProfileEdit, handleOpenArtisanOnboarding, handleAddArtisanTag,
    handleRemoveArtisanTag, handleSubmitArtisanOnboarding, handleSaveProfile, handleGiveOffer,
    handlePublishCampaign, isUserAdmin, isUserEditor, pendingTipsCount, trendingNews, filteredNews,
    emlakItems, secondHandItems, filteredDavetler, filteredLostFound, filteredCampaigns,
    filteredUnifiedMarket, homeFilteredNews, showMutlularShareModal, setShowMutlularShareModal,
    showSearchModal, setShowSearchModal, vitrinSlideItems, neighborhoodMastersList,
    handleSelectVitrinItem, renderAreaSelect, adminShareSources, activeDeceased, dIdx,
    shownDeceased, headerRoleKind, liveEmbedUrl,
  };
}
