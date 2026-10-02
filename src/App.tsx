import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  increment,
  getCountFromServer,
  type User,
  type UserProfile,
  type UserRole,
  type NewsNotificationPreferences,
  type ServiceRequest,
  type ServiceOffer,
  type Business,
  type HizmetAlani,
  type MarketplaceItem,
  type LostFoundItem,
  type NewsItem,
  type EsnafCampaign,
  type MahalleKursusuItem,
  type MahalleDavetItem,
  type MahalleDavetTebrik
} from './firebase';
import {
  type SampleNewsItem
} from './mockNeighborhoodData';
import { MutlularAdminEditorPanel } from './MutlularAdminEditorPanel';
import {
  type ContentType,
  type ContentKind,
  type ParsedLink,
  CONTENT_COLLECTIONS,
  KIND_TO_TYPE,
  buildContentUrl,
  parseContentLink,
  cleanedUrl,
  getBase,
  slugify,
  TAB_PATHS,
  tabFromPathname,
  sectionPath,
  isCanonicalSection
} from './links';
import { ShareStudio, type ShareItem } from './ShareStudio';
import { NotificationPrefsCard } from './NotificationPrefsCard';
import { COORDINATOR_PHONE_INTL } from './siteConfig';
import { ProfileRoleCard } from './ProfileRoleCard';
import { BusinessEditor, type BusinessFormData } from './BusinessEditor';
import { BusinessPage, type BusinessEvent } from './BusinessPage';
import {
  type NotifPrefs,
  DEFAULT_NOTIF_PREFS,
  normalizePrefs,
  buildContentNotifications
} from './notifications';
import { SharedContentView, type SharedContent } from './SharedContentView';
import { toEmbedUrl, cleanLiveUrl, EMPTY_LIVE, type LiveConfig } from './liveStream';
import { resolveKategoriId, requestMatchesEsnaf, toMillis, timeAgoTr, ESNAF_TURLERI, DIGER_ALAN, cleanAreaName, customAreaToMainCat, isUstaProfile } from './serviceMatching';
import {
  NOTARIES,
  TAXI_STANDS,
  BUS_ROUTES,
  DECEASED_ITEMS,
  FOOD_PLACES,
  JOB_LISTINGS,
  COMMUNITY_EVENTS,
  type DeceasedItem
} from './cityServicesData';
import { CityServicesModal, HamburgerMenuDrawer } from './CityServicesModal';
import {
  MockupNewsHeader,
  MockupMarketHeader,
  MockupServicesHeader,
  MockupMarketCard,
  MockupMasterCard,
  MockupPostBottomSheet,
  MockupListingDetailModal,
  MockupMasterDetailModal,
  MockupProfileScreen,
  MockupBottomNav
} from './MockupViewComponents';
import {
  MutlularHeader,
  MutlularAutoVitrin,
  MutlularNewsSection,
  MutlularEmlakSection,
  MutlularIkinciElSection,
  MutlularUstalarSection,
  MutlularPanoSection,
  MutlularShareModal,
  MutlularSearchModal,
  MutlularMobileNav,
  MutlularFooter,
  type VitrinItem,
  type NeighborhoodMaster
} from './MutlularPlatformComponents';
import { 
  Home, 
  Wrench, 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  PlusCircle, 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  LogOut,
  X,
  Send,
  Camera,
  ArrowRight,
  Clock,
  MapPin,
  Tag,
  Filter,
  Eye,
  Heart,
  Share2,
  ThumbsUp,
  Database,
  Mail,
  Briefcase,
  Edit3,
  Check,
  Zap,
  Store,
  ChevronLeft,
  ChevronRight,
  Percent,
  Megaphone,
  Flame,
  Menu,
  Utensils,
  Car,
  Bus,
  Calendar,
  TrendingUp,
  FileText,
  Newspaper,
  Navigation,
  ExternalLink,
  Layers,
  MessageSquare,
  Star,
  Bookmark,
  Bell,
  Award,
  Compass,
  Users,
  Settings,
  Info,
  Plus,
  BellRing,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import PhotoUploadField from './PhotoUploadField';
import { deleteField } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

const ADMIN_PHONE = COORDINATOR_PHONE_INTL; // Koordinatör WhatsApp hattı (siteConfig.ts)

const PHOTO_PRESETS = [
  { label: 'Düğün & Organizasyon', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pasta & Tatlı', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80' },
  { label: 'Masa & Sandalye', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tesisat & Lavabo', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Elektrik & Tavan', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Boya & Rulo', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mobilya & Montaj', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80' },
  { label: 'Temizlik', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80' },
];

export interface ServiceSubCategory {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  desc: string;
  popular?: boolean;
  sampleRequests: string[];
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  shortTitle: string;
  icon: string;
  badge: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textCol: string;
  desc: string;
  subCategories: ServiceSubCategory[];
}

export const MAIN_SERVICE_CATEGORIES: ServiceMainCategory[] = [
  {
    id: 'dugun_organizasyon',
    name: 'Düğün, Nişan & Doğum Günü',
    shortTitle: 'Düğün & Organizasyon',
    icon: '💍',
    badge: 'Kutlama & Özel Gün',
    color: 'from-pink-600 via-rose-600 to-amber-600',
    bgLight: 'bg-rose-50/70',
    borderLight: 'border-rose-200',
    textCol: 'text-rose-700',
    desc: 'Düğün, nişan, kına, doğum günü, söz ve kutlamalarınız için pasta, masa sandalye kiralama, abiye, süsleme ve ses sistemleri.',
    subCategories: [
      {
        id: 'pasta_tatli',
        name: 'Pasta & Tatlı Siparişi',
        icon: '🎂',
        badge: 'Butik Tasarım',
        desc: 'Katlı nişan pastası, 1 yaş ve doğum günü butik yaş pastası, cupcake, kurabiye ve tatlı büfesi.',
        popular: true,
        sampleRequests: [
          '50 Kişilik Katlı Nişan Pastası',
          '1 Yaş Doğum Günü Butik Yaş Pasta & Cupcake',
          'Şeker Hamurlu Özel Konsept Pasta',
          'Kına Gecesi İçin Kuru Pasta & İkram Tabağı'
        ]
      },
      {
        id: 'masa_sandalye',
        name: 'Masa Sandalye Kiralama',
        icon: '🪑',
        badge: 'Adrese Teslim',
        desc: 'Tiffany sandalye, napolyon sandalye, yuvarlak & dikdörtgen banket masalar, kokteyl bistro masası kiralama.',
        popular: true,
        sampleRequests: [
          '100 Adet Tiffany Sandalye Kiralama',
          '10 Adet Yuvarlak Masa & Saten Örtü',
          'Bistro Ayakta Kokteyl Masası (6 Adet)',
          'Bahçe Nişanı İçin Sandalye & Masa Kiralama'
        ]
      },
      {
        id: 'abiye_gelinlik',
        name: 'Abiye & Kıyafet Kiralama',
        icon: '👗',
        badge: 'Göz Alıcı Modeller',
        desc: 'Söz, nişan, kına gecesi bindallı / kaftan, kiralık abiye elbise ve damatlık & smokin modelleri.',
        popular: true,
        sampleRequests: [
          'Kına Gecesi İçin Kaftan & Bindallı Kiralama',
          'Söz & Nişan İçin Şık Abiye Elbise',
          'Damatlık & Smokin Kiralama',
          'Balo / Mezuniyet Şık Abiyesi'
        ]
      },
      {
        id: 'masa_mekan_susleme',
        name: 'Masa & Mekan Süsleme',
        icon: '🎈',
        badge: 'Trend Konseptler',
        desc: 'Nişan masası arka fon tagı, ışıklı harf / rakam, balon zinciri, şamdan & çiçek aranjmanı, karşılama panosu.',
        popular: true,
        sampleRequests: [
          'Nişan Masası Arka Fon Tagı & Pleksi İsimlik',
          'Doğum Günü Balon Kemeri & Işıklı Rakam',
          'Kına Tahtı Kiralama & Çiçekli Yürüyüş Yolu',
          'Giriş Karşılama Aynası & Şövale Panosu'
        ]
      },
      {
        id: 'fotograf_video',
        name: 'Fotoğraf & Video Çekimi',
        icon: '📸',
        badge: 'Ölümsüz Anlar',
        desc: 'Düğün hikayesi, nişan / söz çekimi, doğum günü fotoğrafçısı, dış çekim albüm ve drone video.',
        popular: false,
        sampleRequests: [
          'Söz & Nişan Töreni Fotoğraf / Video Çekimi',
          'Doğum Günü Partisi Fotoğrafçısı',
          'Dış Çekim & Panoramik Albüm Paketi',
          'Drone ile Havadan Video Çekimi'
        ]
      },
      {
        id: 'ses_dj_muzik',
        name: 'Ses Sistemi & DJ / Müzik',
        icon: '🎵',
        badge: 'Canlı Performans',
        desc: 'Düğün ve kına DJ\'i, portatif ses sistemi ve mikrofon kiralama, canlı müzik orkestrası.',
        popular: false,
        sampleRequests: [
          'Evde Nişan İçin Hoparlör & Telsiz Mikrofon',
          'Doğum Günü & Bahçe Partisi DJ Hizmeti',
          'Kına Gecesi Müzik & Davul Şov Ekibi',
          'Akustik Canlı Müzik İkilisi'
        ]
      },
      {
        id: 'catering_kokteyl',
        name: 'Catering & İkramlıklar',
        icon: '🍱',
        badge: 'Lezzetli Sunumlar',
        desc: 'Soğuk meze, mini sandviç, börek, tatlı-tuzlu atıştırmalıklar ve profesyonel garson & servis temini.',
        popular: false,
        sampleRequests: [
          '60 Kişilik Kokteyl İkram Tabağı & Meze',
          'Evde Söz İçin Çay, Kahve & İkram Servisi',
          'Özel Gün Garson & Servis Elemanı',
          'Açık Büfe Sıcak / Soğuk Finger Food'
        ]
      }
    ]
  },
  {
    id: 'tesisat_su_isitma',
    name: 'Tesisat, Su & Isıtma',
    shortTitle: 'Tesisat & Isıtma',
    icon: '🔧',
    badge: 'Acil & Garantili',
    color: 'from-blue-600 via-cyan-600 to-teal-600',
    bgLight: 'bg-blue-50/70',
    borderLight: 'border-blue-200',
    textCol: 'text-blue-700',
    desc: 'Su kaçağı tespiti, musluk ve batarya tamiri, tıkalı gider açma, kombi bakımı ve petek temizliği.',
    subCategories: [
      {
        id: 'su_kacagi_gider',
        name: 'Su Kaçağı & Tıkalı Gider Açma',
        icon: '🚰',
        badge: 'Kırmadan Robotla',
        desc: 'Termal kamera ve akustik dinleme ile noktasal su kaçağı bulma, kameralı pimaş ve lavabo açma.',
        popular: true,
        sampleRequests: [
          'Termal Kamera ile Kırmadan Su Kaçağı Tespiti',
          'Mutfak Lavabo Gideri Tıkandı (Robotla Açma)',
          'Klozet & Banyo Tıkanıklığı Açma',
          'Alt Kata Su Damlıyor Arıza Tespiti'
        ]
      },
      {
        id: 'musluk_batarya_sifon',
        name: 'Musluk, Batarya & Sifon Tamiri',
        icon: '🚿',
        badge: 'Hızlı Müdahale',
        desc: 'Aç-kapa batarya montajı, su damlatan musluk tamiri, gömme rezervuar ve klozet şamandıra değişimi.',
        popular: true,
        sampleRequests: [
          'Mutfak Aç-Kapa Bataryası Değişimi',
          'Gömme Rezervuar Şamandıra & Buton Tamiri',
          'Banyo Duş Başlığı & Spirali Yenileme',
          'Klozet Altından Su Geliyor'
        ]
      },
      {
        id: 'kombi_petek',
        name: 'Kombi Bakımı & Petek Temizliği',
        icon: '🔥',
        badge: 'Tasarruf Sağlar',
        desc: 'Kombi yıllık periyodik bakım, ilaçlı ve makineli petek yıkama, oda termostatı montajı.',
        popular: true,
        sampleRequests: [
          'Kombi Yıllık Periyodik Bakımı & Basınç Ayarı',
          'Makineli & İlaçlı Kalorifer Petek Temizliği',
          'Kablosuz Akıllı Oda Termostatı Montajı',
          'Peteklerin Yarısı Isınmıyor / Hava Alma'
        ]
      },
      {
        id: 'su_tesisati_vana',
        name: 'Boru Tesisatı & Vana Değişimi',
        icon: '🛠️',
        badge: 'Uzman Usta',
        desc: 'Daire içi PPRC sıcak/soğuk su borusu yenileme, ana su saati vanası ve basınç düşürücü montajı.',
        popular: false,
        sampleRequests: [
          'Daire Girişi Ana Vana Değişimi',
          'Banyo & Mutfak Su Borularının Yenilenmesi',
          'Su Basınç Düşürücü Montajı',
          'Güneş Enerjisi / Termosifon Bağlantısı'
        ]
      }
    ]
  },
  {
    id: 'elektrik_aydinlatma_elektronik',
    name: 'Elektrik, Aydınlatma & Cihaz',
    shortTitle: 'Elektrik & Cihaz',
    icon: '⚡',
    badge: '7/24 Teknik',
    color: 'from-amber-500 via-orange-500 to-yellow-500',
    bgLight: 'bg-amber-50/70',
    borderLight: 'border-amber-200',
    textCol: 'text-amber-800',
    desc: 'Sigorta atması, hat çekimi, avize ve LED montajı, TV çanak anten, güvenlik kamerası ve beyaz eşya servisi.',
    subCategories: [
      {
        id: 'sigorta_pano_hat',
        name: 'Sigorta Arızası & Hat Çekimi',
        icon: '💡',
        badge: 'Acil Elektrik',
        desc: 'Sürekli atan sigorta arıza tespiti, kaçak akım rölesi, fırın/klima için müstakil elektrik hattı çekimi.',
        popular: true,
        sampleRequests: [
          'Sigorta Sürekli Atıyor Arıza Tespiti',
          'Kaçak Akım Rölesi Montajı & Testi',
          'Klima ve Fırın İçin Topraklı Hat Çekimi',
          'Daire İçi Elektrik Tesisatı Kontrolü'
        ]
      },
      {
        id: 'avize_led_aydinlatma',
        name: 'Avize, Aplik & LED Aydınlatma',
        icon: '🛋️',
        badge: 'Dekoratif Işık',
        desc: 'Tavan avizesi montajı, salon asma tavan gizli LED şerit çekimi, sensörlü lamba ve bahçe aydınlatması.',
        popular: true,
        sampleRequests: [
          '3 Adet Tavan Avizesi & Aplik Montajı',
          'Asma Tavan Gizli LED Şerit Döşeme',
          'Merdiven Otomatiği & Sensörlü Lamba Değişimi',
          'Mutfak Tezgah Altı LED Aydınlatma'
        ]
      },
      {
        id: 'tv_uydu_canak',
        name: 'TV Askı, Uydu & Çanak Anten',
        icon: '📺',
        badge: 'Net Görüntü',
        desc: 'TV duvara montaj ve askı aparatı, çanak anten sinyal ayarı, LNB değişimi, merkezi uydu sistemi arızası.',
        popular: false,
        sampleRequests: [
          'Televizyonu Duvara Askı Aparatı ile Sabitleme',
          'Çanak Anten Sinyal Yok Arızası & İnce Ayar',
          'Merkezi Uydu Sistemi Kablo Çekimi',
          'LNB ve Çoklayıcı Switch Değişimi'
        ]
      },
      {
        id: 'beyaz_esya_tamiri',
        name: 'Beyaz Eşya Teknik Servisi',
        icon: '🧺',
        badge: 'Garantili Onarım',
        desc: 'Çamaşır makinesi, bulaşık makinesi, buzdolabı, fırın ve ocak tamiri & parça değişimi.',
        popular: true,
        sampleRequests: [
          'Çamaşır Makinesi Su Boşaltmıyor / Sıkmıyor',
          'Bulaşık Makinesi Tableti Eritmiyor / Temiz Yıkamıyor',
          'Buzdolabı Alt Taraf Soğutmuyor / Su Akıtıyor',
          'Ankastre Fırın & Ocak Gaz / Ateşleme Tamiri'
        ]
      },
      {
        id: 'kamera_alarm_bilgisayar',
        name: 'Güvenlik Kamerası & Bilgisayar',
        icon: '📱',
        badge: 'Teknoloji & Güvenlik',
        desc: 'Görüntülü diyafon tamiri, IP güvenlik kamerası kurulumu, bilgisayar format, SSD takma ve telefon ekranı.',
        popular: false,
        sampleRequests: [
          'Apartman Görüntülü Diyafon / Zil Tamiri',
          'Ev / İşyeri İçin 4 Kameralı Güvenlik Sistemi',
          'Laptop SSD / RAM Yükseltme ve Format',
          'Telefon Ekran & Batarya Değişimi'
        ]
      }
    ]
  },
  {
    id: 'ev_tadilat_boya_marangoz',
    name: 'Ev Tadilat, Boya & Marangoz',
    shortTitle: 'Ev Tadilat & Boya',
    icon: '🏠',
    badge: 'A\'dan Z\'ye Yapı',
    color: 'from-emerald-600 via-teal-600 to-cyan-700',
    bgLight: 'bg-emerald-50/70',
    borderLight: 'border-emerald-200',
    textCol: 'text-emerald-800',
    desc: 'Daire boya badana, alçı sıva, mobilya montajı, mutfak dolabı tamiri, fayans seramik, cam balkon ve pimapen.',
    subCategories: [
      {
        id: 'boya_badana_alci',
        name: 'Boya, Badana & Alçı Sıva',
        icon: '🎨',
        badge: 'Pürüzsüz Duvarlar',
        desc: 'Daire içi komple boyama, tavan boyası, çatlak ve delik alçı tamiratı, ithal duvar kağıdı uygulaması.',
        popular: true,
        sampleRequests: [
          '3+1 Boş Daire Komple Boya Badana',
          'Duvar Çatlakları Alçı Sıva & Zımpara',
          'Rutubet Önleyici Tavan Boyası',
          'Salon Duvar Kağıdı Kaplama'
        ]
      },
      {
        id: 'marangoz_mobilya_montaj',
        name: 'Mobilya Montaj & Marangoz',
        icon: '🪚',
        badge: 'Usta İşi',
        desc: 'IKEA/Koçtaş gardırop montajı, mutfak dolap kapak ayarı, menteşe değişimi, ahşap kapı sürtme tamiri.',
        popular: true,
        sampleRequests: [
          'Sürgülü Gardırop & Şifonyer Montajı',
          'Mutfak Dolabı Menteşe & Ray Değişimi',
          'Ahşap Oda Kapısı Sürtme & Kilit Ayarı',
          'Özel Ölçü Ayakkabılık / Dolap İmalatı'
        ]
      },
      {
        id: 'fayans_seramik_banyo',
        name: 'Fayans, Seramik & Banyo Tadilatı',
        icon: '🧱',
        badge: 'Şık Mekanlar',
        desc: 'Kırık fayans tamiri, banyo zemin seramik döşeme, derz dolgu kazıma & yenileme, duşakabin montajı.',
        popular: false,
        sampleRequests: [
          'Banyo Derz Dolgu Kazıma & Yenileme',
          'Mutfak Tezgah Arası Seramik Döşeme',
          'Duşakabin Montajı & Su Sızdırmazlık Silikonu',
          'Kırık / Çatlak Zemin Seramik Tamiri'
        ]
      },
      {
        id: 'cam_balkon_pimapen',
        name: 'Cam Balkon, Pimapen & Sineklik',
        icon: '🪟',
        badge: 'Yalıtım & Konfor',
        desc: 'Pimapen kilit & kol ayarı, conta fitil değişimi (rüzgar kesme), katlanır cam balkon tamiri, pileli sineklik.',
        popular: true,
        sampleRequests: [
          'Pencere Fitil / Conta Değişimi (Rüzgar & Soğuk Kesme)',
          'Pimapen Kol & İspanyolet Kilit Tamiri',
          'Pileli Akordeon Kedi & Sinek Teli (4 Pencere)',
          'Katlanır Cam Balkon Tekerlek & Ayar Tamiri'
        ]
      },
      {
        id: 'cati_oluk_yalitim',
        name: 'Çatı, Yağmur Oluğu & Yalıtım',
        icon: '🏠',
        badge: 'Su Geçirmez',
        desc: 'Kiremit çatı aktarma, çinko/PVC oluk tamiri ve temizliği, teras su yalıtımı ve membran kaplama.',
        popular: false,
        sampleRequests: [
          'Teras / Balkon Su Sızdırma İzolasyonu',
          'Yağmur Oluğu Temizliği & Kırık Oluk Onarımı',
          'Kiremit Çatı Aktarma & Şeffaf Sundurma',
          'Membran Su Yalıtım Kaplaması'
        ]
      }
    ]
  },
  {
    id: 'temizlik_yikama_ilaclama',
    name: 'Temizlik, Yıkama & İlaçlama',
    shortTitle: 'Temizlik & Hijyen',
    icon: '🧹',
    badge: 'Tertemiz Mahalle',
    color: 'from-sky-500 via-indigo-600 to-purple-600',
    bgLight: 'bg-sky-50/70',
    borderLight: 'border-sky-200',
    textCol: 'text-sky-800',
    desc: 'Detaylı ev temizliği, taşınma öncesi/sonrası temizlik, koltuk & halı yıkama, apartman temizliği ve böcek ilaçlama.',
    subCategories: [
      {
        id: 'ev_ofis_temizlik',
        name: 'Ev & Boş Daire Temizliği',
        icon: '🧼',
        badge: 'Dip Köşe Hijyen',
        desc: 'Taşınma öncesi boş daire temizliği, inşaat/tadilat sonrası detaylı temizlik, gündelikçi ve cam silme.',
        popular: true,
        sampleRequests: [
          'Taşınma Öncesi Boş 3+1 Daire Detaylı Temizlik',
          'Haftalık Düzenli Ev Temizliği (Gündelik)',
          'Tadilat & Boya Sonrası Kaba/İnce Temizlik',
          'Buharlı Mutfak Yağ & Banyo Kireç Temizliği'
        ]
      },
      {
        id: 'koltuk_yatak_yikama',
        name: 'Yerinde Koltuk & Yatak Yıkama',
        icon: '🛋️',
        badge: 'Buharlı & Vakumlu',
        desc: 'Yerinde profesyonel sıcak sulu ve buharlı koltuk takımı, yatak, baza başlığı ve sandalye yıkama.',
        popular: true,
        sampleRequests: [
          'L Koltuk & Berjer Yerinde Buharlı Yıkama',
          'Çift Kişilik Yatak Leke Çıkarma & Dezenfeksiyon',
          '6 Adet Yemek Sandalyesi Kumaş Yıkama',
          'Araç Koltuk & Taban Detaylı Yıkama'
        ]
      },
      {
        id: 'hali_yikama_overlok',
        name: 'Halı Yıkama & Overlok',
        icon: '🧺',
        badge: 'Adresten Alıp Teslim',
        desc: 'Fabrikada otomatik makinelerle antibakteriyel halı yıkama, overlok kenar tamiri ve yorgan/battaniye.',
        popular: true,
        sampleRequests: [
          '4 Adet Yün & Shaggy Halı Yıkama',
          'Bambu & İpek Halı Özel Hassas Yıkama',
          'Halı Kenarı Overlok & Püskül Yenileme',
          'Yün Yorgan & Çift Kişilik Battaniye Yıkama'
        ]
      },
      {
        id: 'bocek_ilaclama_dezenfeksiyon',
        name: 'Böcek İlaçlama & Dezenfeksiyon',
        icon: '🪳',
        badge: 'Sağlık Bakanlığı Onaylı',
        desc: 'Hamam böceği, kalorifer böceği, pire, tahtakurusu, fare ve apartman ortak alan ilaçlama hizmeti.',
        popular: false,
        sampleRequests: [
          'Ev İçi Kokusuz & Jel Hamam Böceği İlaçlama',
          'Apartman Bodrum & Merdiven Boşluğu İlaçlama',
          'Pire & Tahtakurusu İlaçlama Hizmeti',
          'Gümüşçün & Karınca İlaçlama'
        ]
      }
    ]
  },
  {
    id: 'nakliyat_cilingir_yardim',
    name: 'Nakliyat, Çilingir & Acil Servis',
    shortTitle: 'Nakliyat & Acil',
    icon: '🚚',
    badge: '15 Dk Müdahale',
    color: 'from-red-600 via-orange-600 to-amber-600',
    bgLight: 'bg-red-50/70',
    borderLight: 'border-red-200',
    textCol: 'text-red-700',
    desc: '7/24 nöbetçi çilingir, parça eşya ve kamyonet kiralama, evden eve nakliyat, yerinde oto lastik ve akü takviyesi.',
    subCategories: [
      {
        id: 'cilingir_kilit_degisim',
        name: 'Çilingir & Kilit Değişimi',
        icon: '🔑',
        badge: '7/24 Nöbetçi',
        desc: 'Kapıda kalma anında hızlı açma, çelik kapı göbek/barel değişimi, oda kapısı kilit tamiri ve anahtar kopyalama.',
        popular: true,
        sampleRequests: [
          'Kapıda Kaldım Acil Çilingir (15 Dk Gelir)',
          'Kale Çelik Kapı Barel / Göbek Değişimi',
          'Oda Kapısı Kilit & Kol Değişimi',
          'Posta Kutusu & Asma Kilit Açma'
        ]
      },
      {
        id: 'parca_esya_kamyonet',
        name: 'Parça Eşya Taşıma & Kamyonet',
        icon: '📦',
        badge: 'Ekonomik Taşıma',
        desc: 'Tek parça beyaz eşya, koltuk, öğrenci evi eşyası, saatlik şoförlü pikap ve kamyonet ile hızlı nakliye.',
        popular: true,
        sampleRequests: [
          'Tek Parça Buzdolabı & Çamaşır Makinesi Taşıma',
          'Öğrenci / Bekar Evi Parça Eşya Nakliyesi',
          'Kamyonetli & Şoförlü Saatlik Taşıma',
          'Mağazadan Alınan Eşyayı Eve Getirme'
        ]
      },
      {
        id: 'evden_eve_nakliyat',
        name: 'Evden Eve Asansörlü Nakliyat',
        icon: '🚛',
        badge: 'Sigortalı Taşımacılık',
        desc: 'Şehir içi ve şehirler arası komple ev taşıma, dış cephe modüler asansör, ambalajlı ve marangozlu hizmet.',
        popular: false,
        sampleRequests: [
          '2+1 Daire Komple Şehir İçi Evden Eve',
          'Dış Cephe Asansörlü Ev Taşıma',
          'Mobilya Sökme, Sarma & Montaj Dahil Nakliyat',
          'Ofis & İş Yeri Taşıma'
        ]
      },
      {
        id: 'oto_aku_lastik_cekici',
        name: 'Oto Lastik, Akü & Çekici',
        icon: '🚗',
        badge: 'Yerinde Yol Yardım',
        desc: 'Yerinde akü takviyesi, seyyar lastik tamiri, oto kurtarıcı / çekici ve araç kapısı açma.',
        popular: false,
        sampleRequests: [
          'Yerinde Akü Takviyesi (Arabam Çalışmıyor)',
          'Seyyar Oto Lastik Patlak Tamiri',
          'Oto Çekici / Kurtarıcı Çağır',
          'Araç Anahtarı İçeride Kaldı (Oto Çilingir)'
        ]
      }
    ]
  },
  {
    id: 'bahce_peyzaj_demir',
    name: 'Bahçe, Peyzaj & Demir Doğrama',
    shortTitle: 'Bahçe & Demir',
    icon: '🌿',
    badge: 'Açık Alan & Güvenlik',
    color: 'from-green-600 via-emerald-600 to-teal-700',
    bgLight: 'bg-green-50/70',
    borderLight: 'border-green-200',
    textCol: 'text-green-800',
    desc: 'Ağaç budama, çim biçme, bahçe bakımı, otomatik sulama, demir korkuluk ve yerinde kaynak tamiratı.',
    subCategories: [
      {
        id: 'bahce_bakim_budama',
        name: 'Bahçe Bakımı & Budama',
        icon: '🌳',
        badge: 'Yeşil Alan',
        desc: 'Meyve ve süs ağacı budama, motorlu çim biçme, havalandırma, bahçe temizliği ve peyzaj düzenlemesi.',
        popular: true,
        sampleRequests: [
          'Meyve & Süs Ağacı Budama Hizmeti',
          'Motorlu Çim Biçme & Havalandırma',
          'Bahçe İlaçlama & Gübreleme',
          'Rulo Çim Serme & Toprak Dolgusu'
        ]
      },
      {
        id: 'otomatik_sulama',
        name: 'Otomatik Sulama Sistemleri',
        icon: '💧',
        badge: 'Akıllı Sulama',
        desc: 'Bahçe damlama sulama tesisatı, zaman ayarlı akıllı sulama saati, fıskiye montajı ve patlak boru tamiri.',
        popular: false,
        sampleRequests: [
          'Bahçe Otomatik Damlama Sulama Tesisatı',
          'Akıllı Sulama Kontrol Saati Montajı',
          'Patlak Fıskiye & Sulama Borusu Tamiri',
          'Balkon Saksı Damla Sulama Kiti'
        ]
      },
      {
        id: 'demir_korkuluk_kaynak',
        name: 'Demir Doğrama & Kaynak',
        icon: '⛓️',
        badge: 'Sağlam & Güvenli',
        desc: 'Pencere ve balkon korkuluğu, bahçe/apartman giriş kapısı, sundurma ve yerinde kaynak tamiratı.',
        popular: false,
        sampleRequests: [
          'Pencere & Fransız Balkon Demir Korkuluk',
          'Bahçe / Apartman Giriş Kapısı İmalatı',
          'Kırılan Menteşe / Korkuluk Kaynak Tamiri',
          'Balkon Sundurma / Gölgelik Yapımı'
        ]
      }
    ]
  },
  {
    id: 'terzi_kurutemizleme_doseme',
    name: 'Terzi, Kuru Temizleme & Döşeme',
    shortTitle: 'Terzi & Döşeme',
    icon: '🧵',
    badge: 'Tadilat & Yenileme',
    color: 'from-violet-600 via-purple-600 to-pink-600',
    bgLight: 'bg-purple-50/70',
    borderLight: 'border-purple-200',
    textCol: 'text-purple-800',
    desc: 'Paça kısaltma, mont fermuarı değişimi, kuru temizleme, koltuk kumaş yüz yenileme, perde dikimi ve korniş montajı.',
    subCategories: [
      {
        id: 'terzi_tadilat',
        name: 'Terzi & Kıyafet Tadilatı',
        icon: '🪡',
        badge: 'Özenli Dikiş',
        desc: 'Pantolon paçası, mont ve kaban fermuarı değişimi, ceket daraltma, beden küçültme ve elbise tadilatı.',
        popular: true,
        sampleRequests: [
          'Pantolon Paçası Kısaltma & Orijinal Dikiş',
          'Mont / Kaban Fermuar Değişimi',
          'Ceket & Pantolon Daraltma / Beden Ayarı',
          'Gömlek Yaka & Kol Boyu Kısaltma'
        ]
      },
      {
        id: 'kuru_temizleme_utu',
        name: 'Kuru Temizleme & Ütü',
        icon: '👔',
        badge: 'Kırışık & Lekesiz',
        desc: 'Takım elbise, kaban, gelinlik, abiye kuru temizleme, buharlı pres ütü ve adresten teslimat.',
        popular: false,
        sampleRequests: [
          'Takım Elbise & Kaban Kuru Temizleme',
          'Gelinlik / Abiye Hassas Kuru Temizleme',
          'Gömlek & Pantolon Buharlı Pres Ütü',
          'Stor & Tül Perde Kuru Temizleme'
        ]
      },
      {
        id: 'koltuk_doseme_yuz',
        name: 'Koltuk Döşeme & Yüz Değişimi',
        icon: '🛋️',
        badge: 'Yepyeni Mobilyalar',
        desc: 'Koltuk takımı kumaş kaplama, çöken süngerleri yenileme, yemek sandalyesi döşeme ve berjer kumaş değişimi.',
        popular: true,
        sampleRequests: [
          'Salon Koltuk Takımı Komple Kumaş Değişimi',
          'Çöken Koltuk Süngeri Yenileme',
          '6 Adet Yemek Sandalyesi Kumaş Kaplama',
          'Puf & Berjer Döşeme Yenileme'
        ]
      },
      {
        id: 'perde_dikim_kornis',
        name: 'Perde Dikimi & Korniş Montajı',
        icon: '🪟',
        badge: 'Şık Pencereler',
        desc: 'Tül ve fon perde dikimi, tavana plastik korniş montajı, zebra/stor perde mekanizma tamiri ve rustik askı.',
        popular: false,
        sampleRequests: [
          'Tavana 3 Raylı Plastik Korniş Montajı',
          'Özel Ölçü Tül & Fon Perde Dikimi',
          'Zebra & Stor Perde Montaj / Mekanizma Tamiri',
          'Rustik Ahşap Perde Askısı Takma'
        ]
      }
    ]
  },
  {
    id: 'ozel_ders_egitim',
    name: 'Özel Ders & Kişisel Hizmetler',
    shortTitle: 'Eğitim & Kişisel',
    icon: '📚',
    badge: 'Birebir Gelişim',
    color: 'from-amber-600 via-orange-600 to-red-600',
    bgLight: 'bg-orange-50/70',
    borderLight: 'border-orange-200',
    textCol: 'text-orange-800',
    desc: 'İlkokul, LGS/YKS matematik özel ders, İngilizce konuşma, gitar ve piyano eğitimi, evcil hayvan gezdirme.',
    subCategories: [
      {
        id: 'okul_ders_koc',
        name: 'Okul Dersleri & Sınav Koçluğu',
        icon: '📖',
        badge: 'Birebir Takviye',
        desc: 'Matematik, fen, Türkçe birebir özel ders, ilkokul ödev takviyesi, LGS/YKS sınav koçluğu.',
        popular: true,
        sampleRequests: [
          'LGS / YKS Matematik Birebir Özel Ders',
          'İlkokul Okuma Yazma & Ödev Desteği',
          'Fizik / Kimya / Biyoloji Takviye Dersi',
          'Sınav Koçluğu & Haftalık Çalışma Programı'
        ]
      },
      {
        id: 'yabanci_dil_ingilizce',
        name: 'Yabancı Dil (İngilizce vb.)',
        icon: '🇬🇧',
        badge: 'Konuşma Pratiği',
        desc: 'Genel İngilizce, konuşma pratiği (speaking), okul takviyesi ve başlangıç seviyesi Almanca eğitimi.',
        popular: false,
        sampleRequests: [
          'Birebir İngilizce Konuşma Pratiği (Speaking)',
          'İlkokul / Ortaokul İngilizce Takviye Dersi',
          'Almanca A1-A2 Başlangıç Eğitimi',
          'YDS / TOEFL Hazırlık Desteği'
        ]
      },
      {
        id: 'muzik_enstruman_sanat',
        name: 'Müzik & Sanat Eğitimi',
        icon: '🎹',
        badge: 'Yetenek & Hobi',
        desc: 'Evde veya atölyede gitar, piyano, bağlama, keman dersi, temel resim ve güzel sanatlara hazırlık.',
        popular: false,
        sampleRequests: [
          'Başlangıç Seviyesi Gitar Dersi',
          'Evde Piyano Dersi (Çocuklar İçin)',
          'Bağlama & Şan Eğitimi',
          'Güzel Sanatlara Hazırlık Resim Dersi'
        ]
      },
      {
        id: 'evcil_hayvan_bakim',
        name: 'Evcil Hayvan Bakımı & Gezdirme',
        icon: '🐾',
        badge: 'Sevgi Dolu Bakım',
        desc: 'Günlük köpek gezdirme, tatil döneminde evde kedi besleme ve kum temizliği, veteriner refakatı.',
        popular: true,
        sampleRequests: [
          'Günlük Köpek Gezdirme Hizmeti',
          'Seyahat Süresince Evde Kedi Maması & Kum Temizliği',
          'Evcil Hayvan Pansiyonu / Misafir Etme',
          'Veterinere Götürme & Taşıma Hizmeti'
        ]
      }
    ]
  }
];

export interface ServiceSector {
  id: string;
  name: string;
  group: 'acil' | 'ev' | 'teknik' | 'yasam';
  icon: string;
  tag: string;
  popular?: boolean;
  desc: string;
  tags: string[];
}

// Flat list for backward compatibility
export const SERVICE_SECTORS: ServiceSector[] = MAIN_SERVICE_CATEGORIES.flatMap(cat => 
  cat.subCategories.map(sub => ({
    id: sub.id,
    name: sub.name,
    group: (cat.id === 'tesisat_su_isitma' || cat.id === 'nakliyat_cilingir_yardim' ? 'acil' : 
            cat.id === 'ev_tadilat_boya_marangoz' ? 'ev' :
            cat.id === 'elektrik_aydinlatma_elektronik' ? 'teknik' : 'yasam') as any,
    icon: sub.icon,
    tag: sub.badge || cat.badge,
    popular: sub.popular,
    desc: sub.desc,
    tags: sub.sampleRequests
  }))
);

// ── MAHALLE ONAYLI USTA VE ESNAF REHBERİ ──
export interface VerifiedMaster {
  id: string;
  name: string;
  businessName: string;
  mainCategoryId: string;
  mainCategoryName: string;
  subCategories: string[];
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  experience: string;
  address: string;
  badge: string;
  avatar: string;
  desc: string;
  servicesHighlight: string[];
}

// Rehberdeki usta listesi. Test ustaları kaldırıldı; gerçek ustalar kayıt olup onaylandıkça
// yayın koleksiyonundan (FAZ 5: `artisans`) beslenecek. Şimdilik boş.
export const VERIFIED_MASTERS: VerifiedMaster[] = [];

export default function App() {
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
  type MainTab = 'home' | 'explore' | 'news' | 'davet' | 'market' | 'pazar' | 'lostfound' | 'services' | 'esnaf' | 'meclis' | 'notifications' | 'profile' | 'yemek';
  // İlk açılışta ekran adres çubuğundan belirlenir (mutlularhaber.com/hizmet doğrudan Hizmet ekranını açar)
  const [activeTab, setActiveTab] = useState<MainTab>(() => (tabFromPathname(window.location.pathname, getBase()) as MainTab | null) ?? 'home');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [activeCityModal, setActiveCityModal] = useState<null | 'noter' | 'taksi' | 'otobus' | 'vefat' | 'yemek' | 'is' | 'etkinlik' | 'odalar' | 'neleroluyor'>(null);

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
  interface PollItem {
    id: string;
    soru: string;
    kategori: 'ulasim' | 'cevre' | 'sosyal' | 'genel';
    secenekler: string[];
    aktif: boolean;
    toplam: number;
    sayilar: number[];
    endsAtMs: number;
    createdAtMs: number;
    authorName?: string;
  }

  const [meclisFilter, setMeclisFilter] = useState<'tumu' | 'guncel' | 'cevre' | 'ulasim' | 'sosyal' | 'genel'>('tumu');
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [adminOpenTab, setAdminOpenTab] = useState<string | undefined>(undefined);

  // Haber yorumları ve beğenileri: gerçek kayıtlar (comments / likes koleksiyonları)
  interface NewsComment { id: string; uid: string; authorName: string; authorPhoto?: string; text: string; createdAtMs: number }
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
    const siblings = (offersMap[req.id] || []).filter((o) => o.id && o.id !== offer.id);
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

        const creditLogRef = doc(collection(db, 'credit_transactions'));

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
            esnafTelefon: profile.telefon || '',
            fiyat: price,
            mesaj: message,
            tahminiSure: duration,
            creditCost: 1,
            status: 'pending',
            createdAt: serverTimestamp()
          });

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



  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans pb-24">
      {/* ════════════════════════════════════════
           EN ÜSTTE TEK ŞERİT: CENAZE İLANLARI (VEFAT & TAZİYE)
      ════════════════════════════════════════ */}
      <aside className="bg-slate-950 text-slate-100 border-b border-slate-800 text-xs py-2 px-3 sm:px-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
          <div 
            onClick={() => setActiveCityModal('vefat')}
            className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer group"
            title="Cenaze ilanlarının detaylarını ve taziye mesajlarını gör"
          >
            <span className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 transition-colors shadow-xs">
              <span>🕊️</span>
              <span>Vefat &amp; Taziye</span>
            </span>

            {shownDeceased ? (
            <div className="truncate text-slate-200 group-hover:text-amber-300 transition-colors text-[11px] sm:text-xs">
              <span className="font-black text-amber-400">
                {shownDeceased?.fullName || 'Merhum'} {shownDeceased?.age ? `(${shownDeceased?.age})` : ''}
              </span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-slate-300">
                Cenazesi {shownDeceased?.dateStr?.toLowerCase() || 'bugün'} {shownDeceased?.mosque}'nden {shownDeceased?.prayerTime?.toLowerCase() || 'namazı müteakip'} kaldırılacaktır.
              </span>
              {shownDeceased?.family && (
                <span className="text-slate-400 hidden lg:inline ml-1.5">
                  ({shownDeceased?.family})
                </span>
              )}
            </div>
            ) : (
              <div className="truncate text-slate-400 text-[11px] sm:text-xs">Şu an yayında vefat ilanı yok</div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeDeceased.length > 1 && (
              <div className="flex items-center text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDeceasedIdx(prev => (prev > 0 ? prev - 1 : activeDeceased.length - 1));
                  }}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Önceki Cenaze İlanı"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 select-none text-slate-400">
                  {dIdx + 1}/{activeDeceased.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDeceasedIdx(prev => (prev < activeDeceased.length - 1 ? prev + 1 : 0));
                  }}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Sonraki Cenaze İlanı"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveCityModal('vefat')}
              className="text-[10px] sm:text-[11px] font-black text-amber-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Tümü ({deceasedList.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* EN ÜST SAĞ: CANLI YAYIN DÜĞMESİ */}
            <button
              onClick={() => setMutlularTvActive(true)}
              className={`px-2.5 py-1 rounded-lg text-white font-black text-[10px] sm:text-[11px] tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${liveConfig.aktif ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
              title="Mutlular TV Canlı Yayını İzle"
            >
              {liveConfig.aktif && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              <span>{liveConfig.aktif ? '📺 Canlı Yayın' : '📺 Yayın'}</span>
            </button>

            <button
              onClick={() => setShowNewDeceasedModal(true)}
              className="text-[10px] sm:text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2 py-1 rounded-lg transition-all inline-flex items-center gap-1"
              title="Cenaze / Taziye İlanı Bırak"
            >
              <PlusCircle className="w-3 h-3" /> İlan Bırak
            </button>
          </div>
        </div>
      </aside>

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
              onOpenDeceasedModal={() => setActiveCityModal('vefat')}
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

        {/* ════════════════════════════════════════
             TAB 2: MAHALLE BÜLTENİ & HABERLER
        ════════════════════════════════════════ */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* 1. ÜST BAŞLIK BİLGİ KARTI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    MUTLULAR HABER — Mahalle Bülteni &amp; Gelişmeler
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Mahallemizden anlık gelişmeler, resmi duyurular, belediye bülteni ve komşu haberleri.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                  Toplam <strong className="text-slate-900">{newsItems.length}</strong> Haber
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 font-black">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  {newsItems.filter(n => n.sonDakika).length} Son Dakika
                </span>
              </div>
            </div>

            {/* 2. 🔥 TREND HABERLER & MAHALLE GÜNDEMİ BÖLÜMÜ */}
            <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4 border border-red-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center text-lg shadow-inner">
                    🔥
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                        Trend Haberler &amp; Mahalle Gündemi
                      </h3>
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse hidden sm:inline-block">
                        CANLI AKIŞ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Mahalle sakinlerinin en çok okuduğu ve etkileşimde bulunduğu gelişmeler
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>En Çok Konuşulan 4 Gelişme</span>
                </div>
              </div>

              {/* Trend Kartları Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {trendingNews.map((trendItem, tIdx) => {
                  const rankBadge = 
                    tIdx === 0 ? { bg: 'bg-amber-400 text-slate-950 ring-2 ring-amber-300', label: '👑 #1 GÜNDEM' } :
                    tIdx === 1 ? { bg: 'bg-slate-200 text-slate-900 ring-2 ring-slate-100', label: '🔥 #2 TREND' } :
                    tIdx === 2 ? { bg: 'bg-amber-600 text-white ring-2 ring-amber-400', label: '🔥 #3 TREND' } :
                    { bg: 'bg-slate-800 text-white', label: `#${tIdx + 1} TREND` };

                  return (
                    <div
                      key={trendItem.id || `trend-${tIdx}`}
                      onClick={() => handleOpenNewsDetail(trendItem)}
                      className="group relative rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-red-500/60 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {/* Görsel ve Rozetler */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                        <img
                          src={trendItem.imageURL || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80'}
                          alt={trendItem.baslik}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Sıra Numarası ve Trend Rozeti */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md ${rankBadge.bg}`}>
                            {rankBadge.label}
                          </span>
                          {trendItem.sonDakika && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase animate-pulse">
                              Acil
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className="bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {trendItem.kategori}
                          </span>
                        </div>

                        {/* İstatistikler */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-slate-300 font-semibold">
                          {(trendItem.okunmaSayisi || 0) > 1 && (
                            <span className="flex items-center gap-1 text-amber-300">
                              <Eye className="w-3 h-3" /> {(trendItem.okunmaSayisi || 0).toLocaleString('tr-TR')}
                            </span>
                          )}
                          {(trendItem.begeniSayisi || 0) > 0 && (
                            <span className="flex items-center gap-1 text-rose-400">
                              <Heart className="w-3 h-3 fill-rose-500" /> {trendItem.begeniSayisi}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Başlık ve Özet */}
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                          {trendItem.baslik}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                          <span className="truncate max-w-[110px] font-medium text-slate-300">✍️ {trendItem.authorName}</span>
                          <span className="text-slate-400 font-medium">{trendItem.tarihStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. DETAYLI KATEGORİ FİLTRELEME & ARAMA PANELİ */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              {/* Üst Sıra: Arama Kutusu ve Sıralama Butonları */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Arama Kutusu */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newsSearchTerm}
                    onChange={(e) => setNewsSearchTerm(e.target.value)}
                    placeholder="Haber başlığı, konu veya yazarda ara..."
                    className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                  {newsSearchTerm && (
                    <button
                      onClick={() => setNewsSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Hızlı Filtre ve Sıralama Çipleri */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Sırala:
                  </span>
                  {[
                    { id: 'newest', label: 'Tüm Akış', icon: '🕒' },
                    { id: 'trending', label: 'En Trend', icon: '🔥' },
                    { id: 'popular', label: 'Çok Okunanlar', icon: '📈' },
                    { id: 'likes', label: 'Çok Beğenilenler', icon: '❤️' },
                    { id: 'breaking', label: 'Son Dakika', icon: '⚡' },
                  ].map((srt) => (
                    <button
                      key={srt.id}
                      onClick={() => setNewsSortBy(srt.id as any)}
                      className={`text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                        newsSortBy === srt.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{srt.icon}</span>
                      <span>{srt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detaylı Kategori Seçici Çipleri */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <span>📑</span> <span>Haber Kategorileri:</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    <strong className="text-blue-600">{filteredNews.length}</strong> haber listeleniyor
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {[
                    { id: 'tumu', label: 'Tüm Haberler', icon: '🌐' },
                    { id: 'Muhtarlık & Resmi', label: 'Muhtarlık & Resmi', icon: '📜' },
                    { id: 'Belediye & Altyapı', label: 'Belediye & Altyapı', icon: '🏛️' },
                    { id: 'Çevre & Parklar', label: 'Çevre & Parklar', icon: '🌳' },
                    { id: 'Asayiş & Güvenlik', label: 'Asayiş & Güvenlik', icon: '👮' },
                    { id: 'Dayanışma & Doğa', label: 'Dayanışma & Doğa', icon: '🤝' },
                    { id: 'Eğitim & Kültür', label: 'Eğitim & Kültür', icon: '🎓' },
                    { id: 'Spor & Sağlık', label: 'Spor & Sağlık', icon: '⚽' },
                    { id: 'Esnaf & Çarşı', label: 'Esnaf & Çarşı', icon: '🏪' },
                    { id: 'Duyuru & Taziye', label: 'Duyuru & Taziye', icon: '📢' },
                  ].map((cat) => {
                    const isSelected = newsFilter === cat.id;
                    const count = cat.id === 'tumu'
                      ? newsItems.length
                      : newsItems.filter(n => (n as any).kategori === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewsFilter(cat.id)}
                        className={`text-xs font-black px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. DİNAMİK ROZETLİ HABER KARTLARI LİSTESİ */}
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNews.map((item, idx) => {
                  const isTopTrend = trendingNews[0]?.id === item.id;
                  const isRankedTrend = trendingNews.slice(1, 3).some(t => t.id === item.id);
                  const isVeryPopular = (item.okunmaSayisi || 0) >= 1200;
                  const isVeryLiked = (item.begeniSayisi || 0) >= 90;

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleOpenNewsDetail(item)}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      {item.imageURL && (
                        <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                          <img
                            src={item.imageURL}
                            alt={item.baslik}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* ── DİNAMİK POPÜLERLİK & STATÜ ROZETLERİ ── */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                            {item.sonDakika && (
                              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" /> Son Dakika
                              </span>
                            )}
                            {isTopTrend ? (
                              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 ring-1 ring-amber-300">
                                🔥 #1 Gündem
                              </span>
                            ) : isRankedTrend ? (
                              <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                🔥 Trend
                              </span>
                            ) : null}
                            {isVeryPopular && !isTopTrend && (
                              <span className="bg-amber-100/90 backdrop-blur-xs text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                📈 Çok Okunan
                              </span>
                            )}
                            {isVeryLiked && (
                              <span className="bg-rose-100/90 backdrop-blur-xs text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                ❤️ Çok Beğenilen
                              </span>
                            )}
                          </div>

                          {/* Kategori Rozeti */}
                          <div className="absolute bottom-2.5 left-3">
                            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-xs">
                              {item.kategori || 'Mahalle'}
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 right-3 text-[11px] text-white/90 font-medium">
                            {item.tarihStr || 'Yeni'}
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {item.baslik}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                            {item.ozet}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span className="font-bold text-slate-600 truncate max-w-[140px]">
                            ✍️ {item.authorName}
                          </span>
                          <div className="flex items-center gap-3">
                            {(item.okunmaSayisi || 0) > 1 && (
                              <span className="flex items-center gap-1 font-semibold text-slate-500">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {(item.okunmaSayisi || 0).toLocaleString('tr-TR')}
                              </span>
                            )}
                            {(item.begeniSayisi || 0) > 0 && (
                              <span className="flex items-center gap-1 text-rose-600 font-bold">
                                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                {item.begeniSayisi}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
                  🔍
                </div>
                <h4 className="font-black text-slate-900 text-sm">Aramanıza Uygun Haber Bulunamadı</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  "{newsSearchTerm || newsFilter}" kriterinde haber bulunmuyor. Farklı bir kategori seçebilir veya filtreleri temizleyebilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setNewsFilter('tumu');
                    setNewsSearchTerm('');
                    setNewsSortBy('newest');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB: MAHALLE CEMİYETLERİ & DAVETLER (DÜĞÜN, NİŞAN, SÜNNET)
        ════════════════════════════════════════ */}
        {activeTab === 'davet' && (
          <div className="space-y-5">
            {/* Üst Başlık Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Mutlular Cemiyet &amp; Davet Panosu
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Mahallemizin Düğün, Nişan &amp; Kutlama Davetleri
                </h2>
                <p className="text-xs sm:text-sm text-pink-50 leading-relaxed font-medium">
                  Komşularımızın mutlu günlerine ortak olun, davetiyeleri inceleyin, katılım durumunuzu bildirin ve tebrik mesajınızı iletin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2">
                  <Users className="w-4 h-4" /> {invitationItems.length} Aktif Davet
                </div>
              </div>
            </div>

            {/* Arama & Kategori Filtresi */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={davetSearch}
                  onChange={(e) => setDavetSearch(e.target.value)}
                  placeholder="Damat/Gelin adı, davet sahibi aile veya düğün salonu ara..."
                  className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                />
                {davetSearch && (
                  <button
                    onClick={() => setDavetSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tüm Cemiyetler' },
                  { id: 'dugun', label: '💍 Düğün & Nikah' },
                  { id: 'nisan', label: '💐 Nişan & Söz' },
                  { id: 'sunnet', label: '👑 Sünnet Şöleni' },
                  { id: 'kina', label: '✨ Kına Gecesi' },
                  { id: 'dogum_gunu', label: '🎂 Doğum Günü / Mevlid' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDavetCategoryFilter(cat.id)}
                    className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                      davetCategoryFilter === cat.id
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Davetler Kart Listesi */}
            {filteredDavetler.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDavetler.map((davet, idx) => {
                  const isAttended = attendedDavetIds.includes(davet.id || davet.baslik);
                  const isTebrikBoxOpen = activeTebrikDavetId === (davet.id || davet.baslik);

                  return (
                    <div
                      key={`davet-grid-${davet.id || idx}-${idx}`}
                      className="bg-white rounded-3xl border border-pink-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Görsel Başlık */}
                        <div className="relative h-48 sm:h-52 overflow-hidden bg-pink-100">
                          <img
                            src={davet.davetiyeFoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                            alt={davet.baslik}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                            <span className="bg-white/95 backdrop-blur-md text-pink-700 text-xs font-black px-3 py-1 rounded-full shadow-xs border border-pink-100">
                              {davet.turEtiketi}
                            </span>
                            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Users className="w-3 h-3 text-pink-300" />
                              {davet.katilanSayisi || 0} Katılım
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <p className="text-xs font-medium text-pink-200">{davet.davetSahipleri}</p>
                            <h3 className="font-black text-base sm:text-lg text-white leading-tight drop-shadow-xs">
                              {davet.baslik}
                            </h3>
                            {davet.gelinDamat && (
                              <p className="text-xs font-bold text-amber-200 mt-0.5">
                                💍 {davet.gelinDamat}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Detaylar */}
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-slate-800 font-bold bg-pink-50/70 p-2 rounded-xl border border-pink-100/80">
                              <Calendar className="w-4 h-4 text-pink-600 shrink-0" />
                              <div>
                                <div className="text-[10px] text-pink-600 font-black uppercase">Tarih</div>
                                <div>{davet.tarih}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-800 font-bold bg-pink-50/70 p-2 rounded-xl border border-pink-100/80">
                              <Clock className="w-4 h-4 text-pink-600 shrink-0" />
                              <div>
                                <div className="text-[10px] text-pink-600 font-black uppercase">Saat</div>
                                <div>{davet.saat}</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                            <div className="flex items-start gap-2 text-xs">
                              <MapPin className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-900">{davet.mekanAdi}</strong>
                                {davet.salonBilgisi && <span className="text-slate-500 font-medium"> ({davet.salonBilgisi})</span>}
                                <p className="text-[11px] text-slate-500 mt-0.5">{davet.adres}</p>
                              </div>
                            </div>
                          </div>

                          {davet.aciklama && (
                            <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                              "{davet.aciklama}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>İletişim: <strong className="text-slate-800">{davet.iletisimKisi}</strong></span>
                            <span className="text-slate-400 font-medium">{davet.iletisimTelefon}</span>
                          </div>

                          {/* Tebrik Mesajları Önizlemesi */}
                          {davet.tebrikler && davet.tebrikler.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <span className="text-[10px] font-black uppercase text-pink-700 tracking-wider">
                                Komşu Tebrikleri ({davet.tebrikler.length})
                              </span>
                              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                {davet.tebrikler.map((tb, tbIdx) => (
                                  <div key={`tb-${tb.id || tbIdx}-${tbIdx}`} className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700 flex items-start justify-between gap-2">
                                    <div>
                                      <span className="font-bold text-slate-900">{tb.isim}: </span>
                                      <span>{tb.mesaj}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 shrink-0">{tb.tarihStr}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Açılır Tebrik Kutusu */}
                          {isTebrikBoxOpen && (
                            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 space-y-2">
                              <div className="flex items-center justify-between text-xs font-black text-pink-900">
                                <span>💌 Tebrik Mesajınızı Bırakın</span>
                                <button onClick={() => setActiveTebrikDavetId(null)} className="text-pink-400 hover:text-pink-700">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={newTebrikName}
                                onChange={(e) => setNewTebrikName(e.target.value)}
                                placeholder="Adınız Soyadınız (Örn: Mehmet Komşu)"
                                className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none"
                              />
                              <textarea
                                value={newTebrikMsg}
                                onChange={(e) => setNewTebrikMsg(e.target.value)}
                                rows={2}
                                placeholder="Bir ömür boyu mutluluklar dileriz..."
                                className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:outline-none resize-none"
                              />
                              <button
                                onClick={() => handleAddTebrikMessage(davet.id || davet.baslik)}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-2 rounded-xl transition-all cursor-pointer"
                              >
                                Tebrik Mesajını İlet
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aksiyon Butonları Çubuğu */}
                      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <button
                          onClick={() => handleToggleAttendDavet(davet, 'katilacagim')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isAttended
                              ? 'bg-pink-600 text-white shadow-xs'
                              : 'bg-white hover:bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isAttended ? 'fill-white' : ''}`} />
                          <span>{isAttended ? 'Katılıyorum ✓' : '💐 Katılacağım'}</span>
                        </button>

                        <button
                          onClick={() => setActiveTebrikDavetId(isTebrikBoxOpen ? null : (davet.id || davet.baslik))}
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Tebrik Yaz"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
                          <span>Tebrik Et</span>
                        </button>

                        <button
                          onClick={() => handleShareDavetWhatsApp(davet)}
                          className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all cursor-pointer"
                          title="WhatsApp'ta Paylaş"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleAddToCalendar(davet)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                          title="Google Takvime Ekle"
                        >
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => openDialer(davet.iletisimTelefon)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                          title="Ara"
                        >
                          <Phone className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Sparkles className="w-12 h-12 text-pink-300 mx-auto" />
                <h4 className="font-black text-slate-800 text-base">Aradığınız kriterde davetiye bulunamadı</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Arama terimini temizleyebilir veya ekranın altındaki orta <strong>MH</strong> tuşuna basarak yeni bir davetiye paylaşabilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
             AYRI PANEL: EMLAK VİTRİNİ & 2. EL PAZARI
        ════════════════════════════════════════ */}
        {activeTab === 'market' && (
          <div className="space-y-5">
            {/* Üst Başlık */}
            <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-black tracking-wide uppercase mb-1">
                    🛍️ MUTLULAR ALIM SATIM
                  </div>
                  <h2 className="font-black text-lg text-slate-900 tracking-tight">
                    MUTLULAR ALIM SATIM
                  </h2>
                  <p className="text-xs text-slate-500">
                    2. El eşya, araç, tarım ve emlak paylaşımları komisyonsuz mahalle sakinleriyle buluşuyor.
                  </p>
                </div>
              </div>

              {/* Mutlular Alım Satım'a Özel İlan Verme Butonları */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setMarketModalType('ikinci_el');
                    setShowMarketModal(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="2. El İlanı Ekle"
                >
                  <Plus className="w-4 h-4" />
                  <span>2. El İlanı Ver</span>
                </button>
                <button
                  onClick={() => {
                    setMarketModalType('emlak');
                    setShowMarketModal(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Emlak İlanı Bırak"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emlak İlanı Ver</span>
                </button>
              </div>
            </div>

            {/* Panel Seçici ve Canlı Arama Çubuğu */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Format Seçici */}
                <div className="flex p-1.5 bg-slate-100 rounded-2xl shrink-0 gap-1 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setMarketDualMode('emlak')}
                    className={`text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      marketDualMode === 'emlak'
                        ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-900" />
                    <span>🏠 Emlak İlanları</span>
                    <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full font-bold">{emlakItems.length}</span>
                  </button>

                  <button
                    onClick={() => setMarketDualMode('ikinci_el')}
                    className={`text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      marketDualMode === 'ikinci_el'
                        ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>🛍️ 2. El Eşya</span>
                    <span className="text-[10px] bg-black/20 text-white px-1.5 py-0.5 rounded-full font-bold">{secondHandItems.length}</span>
                  </button>

                  <button
                    onClick={() => setMarketDualMode('dual')}
                    className={`text-xs font-black px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      marketDualMode === 'dual'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>⚖️ Yan Yana Gör</span>
                  </button>
                </div>

                {/* Arama Çubuğu */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={marketSearchTerm}
                    onChange={(e) => setMarketSearchTerm(e.target.value)}
                    placeholder="Emlak veya 2. el eşyalarda hızlı ara..."
                    className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-medium"
                  />
                  {marketSearchTerm && (
                    <button
                      onClick={() => setMarketSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── SCREEN 2: BİREBİR ALIM SATIM LİSTESİ (SATILIK DAİRE, 2019 CLIO, KOLTUK TAKIMI, IPHONE 14) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>🛍️ Güncel Mahalle İlanları</span>
                  <span className="text-orange-600 text-[11px]">({filteredUnifiedMarket.length} İlan)</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Mehmet Akif Mah. / Osmangazi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredUnifiedMarket.map((item, idx) => {
                  const itemId = item.id || `market-item-${idx}`;
                  const isFav = Boolean(item.id && mockupFavorites[item.id]);
                  return (
                    <MockupMarketCard
                      key={itemId}
                      item={item}
                      isFavorite={isFav}
                      onToggleFavorite={() => {
                        if (item.id) {
                          setMockupFavorites(prev => ({ ...prev, [item.id!]: !prev[item.id!] }));
                          showToast(mockupFavorites[item.id] ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
                        }
                      }}
                      onClick={() => setSelectedMockupListing(item)}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── İLAN ALANI (EMLAK & 2. EL DÜZENİ) ── */}
            <div className={`grid gap-6 ${marketDualMode === 'dual' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* ════════════════════════════════════════
                  🟡 1. BÖLÜM: EMLAK VİTRİNİ
              ════════════════════════════════════════ */}
              {(marketDualMode === 'dual' || marketDualMode === 'emlak') && (
                <div className="space-y-4">
                  {/* Emlak Sarı-Siyah Toolbar & Filtreler */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 text-white space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase">
                          🏠 Emlak
                        </span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                            <span>Mahalle Emlak Vitrini</span>
                            <span className="text-amber-400 text-xs">({emlakItems.length} İlan)</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">Komisyonsuz doğrudan mülk sahibinden kiralık &amp; satılıklar</p>
                        </div>
                      </div>

                      {/* Tablo vs Kart Görünümü & Sıralama */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex p-0.5 bg-slate-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setEmlakViewStyle('table')}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              emlakViewStyle === 'table' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Liste / Tablo Görünümü"
                          >
                            📋 Tablo
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmlakViewStyle('cards')}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              emlakViewStyle === 'cards' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Vitrin Kart Görünümü"
                          >
                            🎴 Vitrin
                          </button>
                        </div>

                        <select
                          value={emlakSortBy}
                          onChange={(e) => setEmlakSortBy(e.target.value as any)}
                          className="text-[11px] bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="newest">En Yeni İlanlar</option>
                          <option value="price_asc">Fiyat (Önce En Düşük)</option>
                          <option value="price_desc">Fiyat (Önce En Yüksek)</option>
                        </select>
                      </div>
                    </div>

                    {/* Emlak Kategori & Oda Filtreleri */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {[
                          { id: 'all', label: 'Tümü' },
                          { id: 'kiralik', label: '🔑 Kiralık Daire' },
                          { id: 'satilik', label: '🏷️ Satılık Daire' },
                          { id: 'devren', label: '🏪 Dükkan & Devir' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setEmlakTypeFilter(t.id)}
                            className={`text-[11px] font-black px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                              emlakTypeFilter === t.id
                                ? 'bg-amber-400 text-slate-950 shadow-xs'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}

                        <span className="text-slate-700 self-center">|</span>

                        {/* Oda Filtresi */}
                        {[
                          { id: 'all', label: 'Tüm Odalar' },
                          { id: '1+1', label: '1+1' },
                          { id: '2+1', label: '2+1' },
                          { id: '3+1', label: '3+1' },
                          { id: 'dukkan', label: 'Dükkan' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setEmlakRoomFilter(r.id)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                              emlakRoomFilter === r.id
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── SAHİBİNDEN TABLO / LİSTE GÖRÜNÜMÜ ── */}
                  {emlakViewStyle === 'table' ? (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100/90 text-slate-600 border-b border-slate-200 font-black text-[11px] uppercase tracking-wider">
                              <th className="py-3 px-3 w-16 text-center">Görsel</th>
                              <th className="py-3 px-4">İlan Başlığı &amp; Konum</th>
                              <th className="py-3 px-3 text-center">m² (Brüt)</th>
                              <th className="py-3 px-3 text-center">Oda</th>
                              <th className="py-3 px-4 text-right">Fiyat</th>
                              <th className="py-3 px-3 text-center">Kimden</th>
                              <th className="py-3 px-3 text-center">İncele</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {emlakItems.length > 0 ? (
                              emlakItems.map((item, idx) => (
                                <tr
                                  key={`emlak-row-${item.id || idx}`}
                                  onClick={() => setSelectedEmlakItem(item)}
                                  className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                                >
                                  {/* Thumbnail */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="w-14 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 mx-auto">
                                      <img
                                        src={item.fotolar && item.fotolar[0] ? item.fotolar[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'}
                                        alt={item.baslik}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                  </td>

                                  {/* Başlık & Konum */}
                                  <td className="py-2.5 px-4 min-w-[200px]">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white ${
                                          item.emlakTuru === 'satilik' ? 'bg-emerald-600' : item.emlakTuru === 'devren' ? 'bg-amber-600' : 'bg-blue-600'
                                        }`}>
                                          {item.emlakTuru === 'satilik' ? 'SATILIK' : item.emlakTuru === 'devren' ? 'DEVREN' : 'KİRALIK'}
                                        </span>
                                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                          {item.baslik}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 line-clamp-1">
                                        {item.aciklama}
                                      </p>
                                      <span className="text-[10px] text-slate-400 block">
                                        📍 Mutlular Mah., Yıldırım / Bursa
                                      </span>
                                    </div>
                                  </td>

                                  {/* m² */}
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                    {item.metrekare ? `${item.metrekare} m²` : '-'}
                                  </td>

                                  {/* Oda */}
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                                      {item.odaSayisi || '3+1'}
                                    </span>
                                  </td>

                                  {/* Fiyat */}
                                  <td className="py-2.5 px-4 text-right">
                                    <span className="font-black text-sm text-slate-950 bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-200">
                                      {item.fiyat.toLocaleString('tr-TR')} TL{item.emlakTuru === 'kiralik' ? '/ay' : ''}
                                    </span>
                                  </td>

                                  {/* Kimden */}
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      Mülk Sahibi
                                    </span>
                                  </td>

                                  {/* İncele */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEmlakItem(item);
                                      }}
                                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                                    >
                                      Detay ↗
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                  Bu arama kriterine uygun emlak ilanı bulunamadı.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* ── SAHİBİNDEN VİTRİN KARTLARI GÖRÜNÜMÜ ── */
                    <div className={`grid gap-4 ${marketDualMode === 'emlak' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {emlakItems.map((item, idx) => (
                        <div
                          key={`emlak-card-${item.id || idx}`}
                          onClick={() => setSelectedEmlakItem(item)}
                          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                              <img
                                src={item.fotolar && item.fotolar[0] ? item.fotolar[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                                alt={item.baslik}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                                  SAHİBİNDEN
                                </span>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full text-white shadow-xs ${
                                  item.emlakTuru === 'satilik' ? 'bg-emerald-600' : item.emlakTuru === 'devren' ? 'bg-amber-600' : 'bg-blue-600'
                                }`}>
                                  {item.emlakTuru === 'satilik' ? 'SATILIK' : item.emlakTuru === 'devren' ? 'DEVREN' : 'KİRALIK'}
                                </span>
                              </div>

                              <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md text-amber-400 font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-xs border border-slate-800">
                                {item.fiyat.toLocaleString('tr-TR')} TL{item.emlakTuru === 'kiralik' ? '/ay' : ''}
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <h4 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {item.baslik}
                              </h4>

                              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-600">
                                {item.metrekare && (
                                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                    📐 {item.metrekare} m²
                                  </span>
                                )}
                                {item.odaSayisi && (
                                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                    🚪 {item.odaSayisi}
                                  </span>
                                )}
                                {item.kat && (
                                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                    🏢 {item.kat}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {item.aciklama}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-600 font-bold truncate">
                              👤 {item.saticiAdi}
                            </span>
                            <span className="text-xs font-black text-blue-600 group-hover:underline">
                              İlanı İncele →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════
                  🔴 2. BÖLÜM: 2. EL PAZARI & EŞYA VİTRİNİ
              ════════════════════════════════════════ */}
              {(marketDualMode === 'dual' || marketDualMode === 'ikinci_el') && (
                <div className="space-y-4">
                  {/* 2. El Header & Filtreler */}
                  <div className="bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 rounded-3xl p-4 sm:p-5 text-white space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-xl bg-white text-rose-600 font-black text-xs tracking-wider uppercase shadow-xs">
                          2. El Eşya
                        </span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                            <span>Yakınındaki Fırsatları Keşfet</span>
                            <span className="text-rose-100 text-xs font-bold">({secondHandItems.length} Ürün)</span>
                          </h3>
                          <p className="text-[11px] text-rose-100 font-medium">📍 Mutlular Mah. Çevresi (100m - 500m mesafe)</p>
                        </div>
                      </div>
                    </div>

                    {/* 2. El Kategori Çipleri */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'Mobilya', label: '🛋️ Mobilya' },
                        { id: 'Elektronik', label: '📺 Elektronik' },
                        { id: 'Bebek', label: '🍼 Anne & Bebek' },
                        { id: 'Spor', label: '🚲 Spor & Bisiklet' },
                        { id: 'Giyim', label: '👗 Giyim & Moda' },
                        { id: 'Ücretsiz', label: '🎁 Ücretsiz / Bağış' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSecondHandCatFilter(c.id)}
                          className={`text-[11px] font-black px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                            secondHandCatFilter === c.id
                              ? 'bg-white text-rose-600 shadow-xs'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. El Görsel Ağırlıklı Kartlar Grid'i */}
                  <div className={`grid gap-4 ${marketDualMode === 'ikinci_el' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {secondHandItems.length > 0 ? (
                      secondHandItems.map((item, idx) => {
                        const offer1 = Math.max(50, Math.round((item.fiyat * 0.82) / 50) * 50);
                        const offer2 = Math.max(50, Math.round((item.fiyat * 0.92) / 50) * 50);

                        return (
                          <div
                            key={`esya-item-${item.id || idx}`}
                            onClick={() => setSelectedLetgoItem(item)}
                            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
                          >
                            <div>
                              {/* Eşya Fotoğrafı & Durum Rozeti */}
                              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                                <img
                                  src={item.fotolar && item.fotolar[0] ? item.fotolar[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                                  alt={item.baslik}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                  <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                                    {item.durum === 'sifir' ? 'Sıfır / Kutulu' : item.durum === 'az_kullanilmis' ? 'Yeni Gibi' : 'İkinci El'}
                                  </span>
                                </div>

                                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span>📍 250m yakınında</span>
                                </div>

                                <div className={`absolute bottom-2.5 left-2.5 font-black text-sm sm:text-base px-3 py-1 rounded-xl shadow-md ${
                                  item.fiyat === 0 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 border border-slate-200'
                                }`}>
                                  {item.fiyat === 0 ? '🎁 ÜCRETSİZ' : `${item.fiyat.toLocaleString('tr-TR')} TL`}
                                </div>
                              </div>

                              {/* Eşya Detayları */}
                              <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded">
                                    {item.kategori}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    Pazarlık Yapılır 🤝
                                  </span>
                                </div>

                                <h4 className="font-black text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                                  {item.baslik}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.aciklama}
                                </p>
                              </div>
                            </div>

                            {/* ── HIZLI TEKLİF & PAZARLIK BARI ── */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                              {item.fiyat > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                    ⚡ Hızlı Teklif Ver:
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openWhatsApp(
                                          item.saticiTelefon,
                                          `Merhaba ${item.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${item.baslik}" için ${offer1.toLocaleString('tr-TR')} TL teklif ediyorum. Ne dersiniz?`
                                        );
                                      }}
                                      className="flex-1 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-800 border border-slate-200 text-[11px] font-black py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    >
                                      {offer1.toLocaleString('tr-TR')} TL Teklif Et
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openWhatsApp(
                                          item.saticiTelefon,
                                          `Merhaba ${item.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${item.baslik}" için ${offer2.toLocaleString('tr-TR')} TL teklif ediyorum. Ne dersiniz?`
                                        );
                                      }}
                                      className="flex-1 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-800 border border-slate-200 text-[11px] font-black py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    >
                                      {offer2.toLocaleString('tr-TR')} TL Teklif Et
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openWhatsApp(
                                      item.saticiTelefon,
                                      `Merhaba ${item.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${item.baslik}" hala satılık mı? Görüşmek istiyorum.`
                                    );
                                  }}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> Satıcıyla Pazarlık Et
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDialer(item.saticiTelefon);
                                  }}
                                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                  title="Satıcıyı Ara"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2 col-span-full">
                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-slate-800 text-sm">2. El eşya ilanı bulunamadı</h4>
                        <p className="text-xs text-slate-400">Bu kategoride henüz ürün listelenmedi.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB: MAHALLE PAZARI (DÜKKAN SAHİBİ ESNAF KAMPANYALARI & REKLAMLARI)
        ════════════════════════════════════════ */}
        {activeTab === 'pazar' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Store className="w-6 h-6 text-white" />
                  </span>
                  <h2 className="font-black text-xl text-white">Mahalle Pazarı</h2>
                </div>
                <p className="text-xs text-white/95 max-w-xl leading-relaxed">
                  Dükkan sahibi mahalle esnafımızın vitrini! Güncel kampanyalar, haftalık indirimler, hediye fırsatları ve mahalleliye özel avantajlar tek bir yerde.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <Store className="w-3.5 h-3.5" /> {campaigns.length} Aktif Fırsat
                </div>
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['tumu', 'Fırın & Unlu Mamül', 'Kasap & Et Ürünleri', 'Manav & Organik', 'Oto Bakım & Hizmet', 'Çiçek & Bahçe', 'Kişisel Bakım & Kuaför'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCampaignFilter(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                    campaignFilter === cat
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'tumu' ? 'Tüm Kampanyalar' : cat}
                </button>
              ))}
            </div>

            {/* Kampanyalar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((camp, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={camp.fotoUrl}
                        alt={camp.baslik}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" /> {camp.indirimOrani}
                        </span>
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
                          {camp.rozet}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-md">
                          {camp.kategori}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ⏱️ {camp.gecerlilikTarihi}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                        {camp.isyeriAdi}
                      </h3>

                      <h4 className="font-bold text-xs text-slate-800 leading-snug">
                        {camp.baslik}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {camp.aciklama}
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{camp.adres}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => openWhatsApp(camp.telefon, `Merhaba ${camp.isyeriAdi}, Dijital Mutlular Mahalle Pazarı'ndaki "${camp.baslik}" kampanyanız hakkında bilgi almak istiyorum.`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp ile Sipariş
                    </button>
                    <button
                      onClick={() => openDialer(camp.telefon)}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2.5 rounded-xl transition-all"
                      title="Dükkanı Ara"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Store className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-black text-slate-800 text-base">Bu kategoride henüz kampanya bulunmuyor</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dükkan sahibiyseniz alttaki orta <strong>MH</strong> tuşuna basarak yeni bir kampanya veya indirim duyurusu ekleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB 4: KAYIP & BULUNTU EŞYA
        ════════════════════════════════════════ */}
        {activeTab === 'lostfound' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  <h2 className="font-black text-base text-gray-900">Kayıp &amp; Buluntu Eşya / Evcil Hayvan</h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Zaman kritik olduğu için moderasyon beklemeden anında mahallede yayına girer.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Search className="w-3.5 h-3.5" /> {filteredLostFound.length} Aktif İlan
              </div>
            </div>

            {/* Tür Filtresi */}
            <div className="flex gap-2">
              <button
                onClick={() => setLostFoundFilter('tumu')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'tumu' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setLostFoundFilter('kayip')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'kayip' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                🔍 Kaybettim
              </button>
              <button
                onClick={() => setLostFoundFilter('bulundu')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'bulundu' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                ✅ Buldum
              </button>
              <button
                onClick={() => setLostFoundFilter('acil')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  lostFoundFilter === 'acil' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                🚨 Acil Olanlar
              </button>
            </div>

            {/* Kayıp İlanları Kartları */}
            <div className="space-y-3.5">
              {filteredLostFound.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3.5 transition-all ${
                    item.isCritical ? 'border-red-400 bg-red-50/20 ring-2 ring-red-100' : 'border-gray-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                        item.tur === 'kayip' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.tur === 'kayip' ? '🔍 KAYIP' : '✅ BULUNDU'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {item.kategori}
                      </span>
                      {item.isCritical && (
                        <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded-md animate-pulse">
                          ACİL BİLDİRİM
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">📍 {item.konum || 'Mutlular Mahallesi'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {item.fotolar && item.fotolar[0] && (
                      <img src={item.fotolar[0]} alt={item.baslik} className="w-full sm:w-36 h-36 object-cover rounded-2xl border border-gray-200 shrink-0" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-black text-sm text-gray-900">{item.baslik}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.aciklama}</p>
                      <div className="text-xs text-gray-500 pt-1">
                        İletişim Kişisi: <span className="font-bold text-gray-800">{item.iletisimKisi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">⏱️ Anında Yayında (Post-moderation)</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openWhatsApp(item.iletisimTelefon, `Merhaba, "${item.baslik}" ilanınız hakkında bilgi vermek istiyorum.`)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp ile Ulaş
                      </button>
                      <button
                        onClick={() => openDialer(item.iletisimTelefon)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl transition-all"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB 5: USTA & HİZMET SEKTÖRLERİ & TALEPLER
        ════════════════════════════════════════ */}
        {activeTab === 'services' && (() => {
          const searchLower = serviceSectorSearch.trim().toLowerCase();
          const isSearching = Boolean(searchLower);

          // Matching subcategories across all main categories
          const searchMatchingSubCategories: { mainCat: ServiceMainCategory; sub: ServiceSubCategory }[] = [];
          if (isSearching) {
            ALL_SERVICE_CATEGORIES.forEach(mainCat => {
              mainCat.subCategories.forEach(sub => {
                if (
                  mainCat.name.toLowerCase().includes(searchLower) ||
                  mainCat.shortTitle.toLowerCase().includes(searchLower) ||
                  sub.name.toLowerCase().includes(searchLower) ||
                  sub.desc.toLowerCase().includes(searchLower) ||
                  (sub.badge && sub.badge.toLowerCase().includes(searchLower)) ||
                  sub.sampleRequests.some(s => s.toLowerCase().includes(searchLower))
                ) {
                  searchMatchingSubCategories.push({ mainCat, sub });
                }
              });
            });
          }

          // Matching verified masters
          const searchMatchingMasters = isSearching
            ? VERIFIED_MASTERS.filter(m => 
                m.name.toLowerCase().includes(searchLower) ||
                m.businessName.toLowerCase().includes(searchLower) ||
                m.mainCategoryName.toLowerCase().includes(searchLower) ||
                m.desc.toLowerCase().includes(searchLower) ||
                m.subCategories.some(s => s.toLowerCase().includes(searchLower)) ||
                m.servicesHighlight.some(h => h.toLowerCase().includes(searchLower))
              )
            : VERIFIED_MASTERS.filter(m => 
                masterCategoryFilter === 'all' || m.mainCategoryId === masterCategoryFilter
              );

          // Matching requests
          const searchMatchingRequests = isSearching
            ? serviceRequests.filter(r => 
                r.baslik.toLowerCase().includes(searchLower) ||
                r.kategori.toLowerCase().includes(searchLower) ||
                (r.altKategori && r.altKategori.toLowerCase().includes(searchLower)) ||
                r.aciklama.toLowerCase().includes(searchLower)
              )
            : serviceRequests;

          // Usta için "Bana uygun" filtresi: yalnızca kendi kategorisindeki, açık talepler
          const isEsnafViewer = isUstaProfile(profile);
          const uygunRequests = serviceRequests.filter(r =>
            (!r.status || r.status === 'open') &&
            (!user || r.uid !== user.uid) &&
            requestMatchesEsnaf(r, profile, ALL_SERVICE_CATEGORIES)
          );
          const visibleRequests = (isEsnafViewer && requestScope === 'uygun') ? uygunRequests : searchMatchingRequests;

          // Drill-down selected category
          const activeExpandedCategory = activeExpandedCatId 
            ? ALL_SERVICE_CATEGORIES.find(c => c.id === activeExpandedCatId) 
            : null;

          return (
            <div className="space-y-6">
              {/* ── SCREEN 3: ÖNE ÇIKAN HİZMETLER (MEHMET USTA VB.) ── */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Öne Çıkan Hizmetler</span>
                  </h3>
                  <span className="text-[11px] font-bold text-orange-600">
                    {searchMatchingMasters.length} Onaylı Usta
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchMatchingMasters.slice(0, 6).map((m) => (
                    <MockupMasterCard
                      key={m.id}
                      master={m}
                      onClick={() => setSelectedMockupMaster(m)}
                      onCall={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${m.phone}`;
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── 1. ÜST BAŞLIK VE HİZMET REHBERİ ── */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-200/90 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide uppercase">
                      <span>🛠️</span> MUTLULAR HİZMET
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      MUTLULAR HİZMET — Mahallemizin Onaylı Ustaları ve Hizmetleri
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                      Tesisat, elektrik, boya, temizlik ve organizasyon gibi 18 ana sektörde mahallenin güvenilir ustaları.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenArtisanOnboarding()}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Usta Olarak Katıl</span>
                    </button>
                  </div>
                </div>

                {/* ── CANLI ARAMA ÇUBUĞU ── */}
                <div className="relative pt-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={serviceSectorSearch}
                      onChange={(e) => setServiceSectorSearch(e.target.value)}
                      placeholder="Hangi ustayı veya hizmeti arıyorsunuz? (örn: Pasta, masa sandalye kiralama, abiye, süsleme, su kaçağı, boyacı...)"
                      className="w-full text-xs sm:text-sm pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white font-semibold text-slate-900 transition-all shadow-2xs"
                    />
                    {serviceSectorSearch && (
                      <button
                        onClick={() => setServiceSectorSearch('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Popüler Hızlı Arama Butonları */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                      Hızlı İhtiyaçlar:
                    </span>
                    {[
                      { label: '🎂 Butik Pasta', q: 'pasta' },
                      { label: '🪑 Masa & Sandalye', q: 'sandalye' },
                      { label: '👗 Abiye Kiralama', q: 'abiye' },
                      { label: '🎈 Mekan Süsleme', q: 'süsleme' },
                      { label: '🚰 Su Kaçağı & Tesisat', q: 'tesisat' },
                      { label: '🎨 Boyacı & Badana', q: 'boya' },
                      { label: '⚡ Elektrik Arızası', q: 'elektrik' },
                      { label: '🔑 7/24 Çilingir', q: 'çilingir' },
                      { label: '🧹 Koltuk Yıkama', q: 'koltuk' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setServiceSectorSearch(item.q)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                          serviceSectorSearch.toLowerCase() === item.q.toLowerCase()
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── CANLI ARAMA SONUÇLARI PANELİ (ARAMA YAPILDIĞINDA DOĞRUDAN GÖZÜKÜR) ── */}
              {isSearching ? (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-rose-600" />
                      <h3 className="font-black text-base text-slate-900">
                        "{serviceSectorSearch}" İçin Arama Sonuçları
                      </h3>
                    </div>
                    <button
                      onClick={() => setServiceSectorSearch('')}
                      className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Aramayı Temizle
                    </button>
                  </div>

                  {/* 1. Eşleşen Hizmetler & Alt Kategoriler */}
                  {searchMatchingSubCategories.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <span>🏷️ Eşleşen Hizmet Türleri</span>
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
                          {searchMatchingSubCategories.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {searchMatchingSubCategories.map(({ mainCat, sub }) => (
                          <div
                            key={sub.id}
                            className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl">{sub.icon}</span>
                                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">
                                  {mainCat.shortTitle}
                                </span>
                              </div>
                              <h4 className="font-black text-sm text-slate-900">{sub.name}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{sub.desc}</p>
                            </div>
                            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setServiceViewMode('masters');
                                  setMasterCategoryFilter(mainCat.id);
                                }}
                                className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span>Ustaları Gör</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Eşleşen Onaylı Mahalle Ustaları */}
                  {searchMatchingMasters.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <span>👷 Bu Hizmeti Veren Onaylı Ustalar</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                          {searchMatchingMasters.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {searchMatchingMasters.map(master => (
                          <div
                            key={master.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={master.avatar}
                                alt={master.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-black text-sm text-slate-900">{master.name}</h4>
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Onaylı
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-600">{master.businessName}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {master.servicesHighlight.map((srv, sIdx) => (
                                <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                                  {srv}
                                </span>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                              <a
                                href={`tel:${master.phone}`}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Hemen Ara</span>
                              </a>
                              <a
                                href={`https://wa.me/${master.whatsapp}?text=${encodeURIComponent(`Merhaba ${master.name}, Mutlular Haber Portalı Usta Rehberi'nden ulaştım. Hizmetiniz hakkında bilgi ve fiyat almak istiyorum.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                              <button
                                onClick={() => handleOpenCategoryRequest(master.mainCategoryId, master.subCategories[0])}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                              >
                                Teklif İste
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchMatchingSubCategories.length === 0 && searchMatchingMasters.length === 0 && (
                    <div className="text-center py-8 space-y-3">
                      <Search className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-black text-slate-800 text-sm">
                        "{serviceSectorSearch}" terimi için kayıtlı hizmet veya usta bulunamadı
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Endişelenmeyin! Bu ihtiyaç için doğrudan genel talep açabilirsiniz; mahalle esnaf ve ustalarına bildirim gidecektir.
                      </p>
                      <button
                        onClick={() => handleOpenCategoryRequest(ALL_SERVICE_CATEGORIES[0].id, undefined, serviceSectorSearch)}
                        className="bg-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        "{serviceSectorSearch}" İçin Talep Oluştur
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* ── 2. ÜÇ NET SEÇENEK: KATEGORİLER / USTALAR REHBERİ / MAHALLE TALEPLERİ ── */}
              {!isSearching && (
                <div className="bg-white rounded-3xl p-2 border border-slate-200/90 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setServiceViewMode('categories');
                        setActiveExpandedCatId(null);
                      }}
                      className={`text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        serviceViewMode === 'categories'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-base">🏷️</span>
                      <span>Hizmet Kategorileri ({ALL_SERVICE_CATEGORIES.length})</span>
                    </button>

                    <button
                      onClick={() => setServiceViewMode('masters')}
                      className={`text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        serviceViewMode === 'masters'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-base">👷</span>
                      <span>Mahalle Ustaları{VERIFIED_MASTERS.length > 0 ? ` (${VERIFIED_MASTERS.length} Onaylı Usta)` : ''}</span>
                    </button>

                    <button
                      onClick={() => setServiceViewMode('requests')}
                      className={`text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        serviceViewMode === 'requests'
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-base">📋</span>
                      <span>Mahalledeki Talepler ({serviceRequests.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── GÖRÜNÜM 1: HİZMET KATEGORİLERİ (ANA VE ALT KATEGORİ SEÇİCİ) ── */}
              {!isSearching && serviceViewMode === 'categories' && (
                <div className="space-y-6">
                  {/* Eğer bir kategori detayına tıklanmadıysa: 9 ANA KATEGORİNİN TEMİZ, ANLAŞILIR KARTLARI */}
                  {!activeExpandedCategory ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-base text-slate-900">
                            Hizmet Kategorileri
                          </h3>
                          <p className="text-xs text-slate-500">
                            İhtiyacınız olan ana kategoriyi seçerek alt hizmetleri ve ustaları inceleyin.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ALL_SERVICE_CATEGORIES.map((cat) => (
                          <div
                            key={cat.id}
                            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-rose-400 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
                            onClick={() => setActiveExpandedCatId(cat.id)}
                          >
                            <div className="space-y-3">
                              {/* İkon & Rozet */}
                              <div className="flex items-start justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/80 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-2xs">
                                  {cat.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                                  {cat.badge}
                                </span>
                              </div>

                              {/* Başlık & Kısa Açıklama */}
                              <div>
                                <h4 className="font-black text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                                  {cat.name}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {cat.desc}
                                </p>
                              </div>

                              {/* Alt Hizmetlerin Önizleme Listesi */}
                              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  İçerdiği Alt Hizmetler ({cat.subCategories.length}):
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {cat.subCategories.map((sub, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200"
                                    >
                                      {sub.icon} {sub.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveExpandedCatId(cat.id);
                                }}
                                className="w-full bg-slate-900 group-hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-between gap-1 shadow-2xs"
                              >
                                <span>Alt Hizmetleri &amp; Detayları Gör</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* BİR ANA KATEGORİ SEÇİLDİĞİNDE: NET, ODAKLANMIŞ DETAY SAYFASI */
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Geri Dönüş ve Başlık Barı */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setActiveExpandedCatId(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Tüm Kategorilere Dön</span>
                          </button>
                          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{activeExpandedCategory.icon}</span>
                            <div>
                              <h3 className="font-black text-base text-slate-900 leading-tight">
                                {activeExpandedCategory.name}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {activeExpandedCategory.subCategories.length} Alt Hizmet Mevcut
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setServiceViewMode('masters');
                              setMasterCategoryFilter(activeExpandedCategory.id);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <UserIcon className="w-4 h-4 text-white" />
                            <span>Bu Kategorinin Ustalarını Gör</span>
                          </button>
                        </div>
                      </div>

                      {/* Seçili Kategorinin Alt Hizmet Kartları */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeExpandedCategory.subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0">
                                  {sub.icon}
                                </div>
                                {sub.badge && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-black text-base text-slate-900">{sub.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sub.desc}</p>
                              </div>

                              {/* Sık İstenen İhtiyaçlar */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Popüler Hizmetler:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.sampleRequests.map((sampleText, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg"
                                    >
                                      {sampleText}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Alt Kategori Butonları */}
                            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setServiceViewMode('masters');
                                  setMasterCategoryFilter(activeExpandedCategory.id);
                                }}
                                className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span>Bu Alandaki Ustaları Gör</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── GÖRÜNÜM 2: MAHALLE USTALARI & ESNAF REHBERİ (DOĞRUDAN TELEFON / WHATSAPP) ── */}
              {!isSearching && serviceViewMode === 'masters' && (
                <div className="space-y-4">
                  {/* Kategori Filtre Butonları */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold uppercase tracking-wider">Kategoriye Göre Ustalar:</span>
                      <span>Toplam {searchMatchingMasters.length} Onaylı Esnaf</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setMasterCategoryFilter('all')}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                          masterCategoryFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        🌟 Tüm Ustalar ({VERIFIED_MASTERS.length})
                      </button>
                      {ALL_SERVICE_CATEGORIES.map(cat => {
                        const count = VERIFIED_MASTERS.filter(m => m.mainCategoryId === cat.id).length;
                        if (count === 0) return null;
                        const isSelected = masterCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setMasterCategoryFilter(cat.id)}
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.shortTitle}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Usta Kartları Izgarası */}
                  {searchMatchingMasters.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3">
                      <div className="text-4xl">👷</div>
                      <h4 className="font-black text-base text-slate-900">Rehberde henüz onaylı usta yok</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Mahalle ustaları kayıt olup onaylandıkça burada listelenecek. Ustaysan hemen usta olarak kayıt olabilirsin.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenArtisanOnboarding('usta')}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer"
                        >
                          🛠️ Usta Olarak Kayıt Ol
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceViewMode('requests')}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black cursor-pointer"
                        >
                          Hizmet Talebi Aç
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchMatchingMasters.map(master => (
                      <div
                        key={master.id}
                        className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Üst Kısım: Fotoğraf, İsim, Rozet & Puan */}
                          <div className="flex items-start gap-3.5">
                            <img
                              src={master.avatar}
                              alt={master.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-base text-slate-900">{master.name}</h4>
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Onaylı Mahalle Esnafı
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">{master.businessName}</p>
                              
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                <span className="text-slate-600 font-medium">{master.experience}</span>
                              </div>
                            </div>
                          </div>

                          {/* Adres ve Açıklama */}
                          <div className="text-xs text-slate-600 space-y-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{master.address}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                              {master.desc}
                            </p>
                          </div>

                          {/* Hizmet Etiketleri */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Verdiği Hizmetler:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {master.servicesHighlight.map((h, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Aksiyon Butonları: Ara & WhatsApp */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <a
                            href={`tel:${master.phone}`}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span>Hemen Ara</span>
                          </a>
                          <a
                            href={`https://wa.me/${master.whatsapp}?text=${encodeURIComponent(`Merhaba ${master.name}, Mutlular Haber Portalı Usta Rehberi'nden ulaştım. Hizmetiniz hakkında bilgi ve fiyat almak istiyorum.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            onClick={() => handleOpenCategoryRequest(master.mainCategoryId, master.subCategories[0])}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                          >
                            Teklif İste
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── GÖRÜNÜM 3: MAHALLEDEKİ GÜNCEL TALEPLER ── */}
              {(!isSearching && serviceViewMode === 'requests') && (
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-orange-600" />
                        <h3 className="font-black text-base text-slate-900">Mahalledeki Güncel Talepler</h3>
                        <span className="text-xs font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          {serviceRequests.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Komşularımızın açtığı aktif talepler. Onaylı ustalar teklif sunabilir, sakinler teklifleri inceleyebilir.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenCategoryRequest('dugun_organizasyon')}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Yeni Talep Oluştur
                    </button>
                  </div>

                  {isEsnafViewer && (
                    <div className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200/90">
                      <button
                        type="button"
                        onClick={() => setRequestScope('uygun')}
                        className={`flex-1 text-xs font-black px-3 py-2 rounded-xl transition-all cursor-pointer ${requestScope === 'uygun' ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        🎯 Bana Uygun ({uygunRequests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestScope('tumu')}
                        className={`flex-1 text-xs font-black px-3 py-2 rounded-xl transition-all cursor-pointer ${requestScope === 'tumu' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        Tüm Talepler ({serviceRequests.length})
                      </button>
                    </div>
                  )}

                  {visibleRequests.length === 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 text-center text-xs text-slate-500">
                      {isEsnafViewer && requestScope === 'uygun'
                        ? 'Şu an kategorinize uygun açık talep yok. Yeni talep geldiğinde bildirim alacaksınız.'
                        : 'Henüz açık talep yok.'}
                    </div>
                  )}

                  <div id="service-request-list" className="space-y-3.5">
                    {visibleRequests.map((req, idx) => {
                      const isAuthor = Boolean(
                        (user && req.uid && user.uid === req.uid) ||
                        (user && profile?.name && req.authorName === profile.name) ||
                        (!user && (req.uid === 'sakin_1' || req.uid === 'mock_user_1' || req.authorName === 'Ahmet Turan' || demoRole === 'sakin'))
                      );
                      const isActive = req.status === 'open' || !req.status || req.status === 'in_progress';

                      return (
                        <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative group">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                                  {req.kategori}
                                </span>
                                {req.altKategori && (
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
                                    🏷️ {req.altKategori}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">👤 {req.authorName}</span>
                                {isAuthor && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    ⭐ Sizin Talebiniz
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isActive ? 'Aktif Talep' : 'Tamamlandı'}
                                </span>
                              </div>
                              <h4 className="font-black text-sm text-slate-900">{req.baslik}</h4>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isAuthor && isActive && (
                                <button
                                  onClick={() => handleOpenEditRequest(req)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                  title="Talebi Düzenle"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Düzenle</span>
                                </button>
                              )}
                              <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-100">
                                {Math.max(offersMap[req.id || '']?.length || 0, req.offerCount || 0)} Teklif
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {req.aciklama}
                          </p>

                          {req.fotolar && req.fotolar.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                              {req.fotolar.map((photoUrl, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={photoUrl}
                                  alt={`${req.baslik} - ${pIdx + 1}`}
                                  className="w-32 h-24 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                                />
                              ))}
                            </div>
                          )}

                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs text-slate-400">📍 {req.adres || 'Mutlular Mah.'}</span>
                            <div className="flex items-center gap-2">
                              {isAuthor && isActive && (
                                <button
                                  onClick={() => handleOpenEditRequest(req)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Talebi Düzenle
                                </button>
                              )}
                              {demoRole === 'esnaf' && (!profile || isUstaProfile(profile)) && isActive && !isAuthor && req.status !== 'in_progress' &&
                                !(user && (offersMap[req.id || ''] || []).some(o => o.esnafUid === user.uid)) &&
                                requestMatchesEsnaf(req, profile, ALL_SERVICE_CATEGORIES) && (
                                <button
                                  onClick={() => setShowOfferModal(req)}
                                  className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Coins className="w-4 h-4" /> Teklif Ver (1 Kredi)
                                </button>
                              )}
                              <button
                                onClick={() => setShowRequestDetail(req)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                              >
                                {isAuthor ? 'Teklifleri Gör' : 'Detay'} ({Math.max(offersMap[req.id || '']?.length || 0, req.offerCount || 0)})
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}


        {/* ════════════════════════════════════════
             TAB 6: PROFİL & ESNAF CÜZDANI (EKRAN 7)
        ════════════════════════════════════════ */}
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
                            {profile?.esnafKategori || 'Tesisat & Su Hizmetleri'}
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

        {/* ════════════════════════════════════════
             TAB 7: MAHALLE MECLİSİ (SCREEN 3)
        ════════════════════════════════════════ */}
        {activeTab === 'meclis' && (
          <div className="space-y-4">
            {/* Üst Bilgi Kartı */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">🏛️</span>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">Mahalle Meclisi &amp; Ortak Akıl</h2>
                  <p className="text-xs text-slate-500">Mutlular sakinlerinin ortak kararları ve canlı anketler.</p>
                </div>
              </div>
              {isRealStaff && (
                <button
                  onClick={() => {
                    setAdminOpenTab('polls');
                    setShowAdminPanelModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Anket Oluştur
                </button>
              )}
            </div>

            {/* Kategori Filtresi */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'tumu', label: 'Tüm Anketler' },
                { id: 'guncel', label: '🔥 Açık Oylamalar' },
                { id: 'ulasim', label: '🚲 Ulaşım & Yol' },
                { id: 'cevre', label: '🌳 Park & Çevre' },
                { id: 'sosyal', label: '🤝 Sosyal & Dayanışma' },
                { id: 'genel', label: '📋 Genel' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMeclisFilter(item.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    meclisFilter === item.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {(() => {
              const visible = polls.filter((poll) => {
                if (meclisFilter === 'tumu') return true;
                if (meclisFilter === 'guncel') return isPollOpen(poll);
                return poll.kategori === meclisFilter;
              });
              if (visible.length === 0) {
                return (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-2">
                    <div className="text-4xl">🗳️</div>
                    <h4 className="font-black text-base text-slate-900">Şu an gösterilecek anket yok</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">Yeni anketler yayınlandığında burada oy verebilirsiniz.</p>
                  </div>
                );
              }
              const catLabel: Record<string, string> = { ulasim: 'Ulaşım & Yol', cevre: 'Park & Çevre', sosyal: 'Sosyal & Dayanışma', genel: 'Genel' };
              return (
                <div className="space-y-3.5">
                  {visible.map((poll) => {
                    const open = isPollOpen(poll);
                    const mine = myVotes[poll.id];
                    const hasVoted = mine !== undefined;
                    const showResults = hasVoted || !open || isRealStaff;
                    return (
                      <div key={poll.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{catLabel[poll.kategori] || 'Genel'}</span>
                            <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">{poll.soru}</h3>
                          </div>
                          {open ? (
                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Oylama Açık
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Kapandı</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {poll.secenekler.map((opt, i) => {
                            const count = poll.sayilar[i] || 0;
                            const pct = poll.toplam > 0 ? Math.round((count / poll.toplam) * 100) : 0;
                            const chosen = mine === i;
                            return (
                              <div key={i}>
                                {showResults ? (
                                  <div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                                      <span>{chosen ? '✅ ' : ''}{opt} ({count} oy)</span>
                                      <span className={chosen ? 'text-blue-600' : 'text-slate-400'}>%{pct}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                      <div className={`${chosen ? 'bg-blue-600' : 'bg-slate-300'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleVotePoll(poll, i)}
                                    className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                                  >
                                    {opt}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                          <span>Toplam <strong>{poll.toplam} komşu</strong> oy kullandı</span>
                          {poll.endsAtMs > 0 && <span>Bitiş: {new Date(poll.endsAtMs).toLocaleDateString('tr-TR')}</span>}
                          {!hasVoted && open && !user && <span className="font-bold text-blue-600">Oy vermek için giriş yapın</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB 8: MAHALLE ESNAFI & DÜKKANLAR (SCREEN 4)
        ════════════════════════════════════════ */}
        {activeTab === 'esnaf' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    Mahalle Esnafı &amp; Dükkan Rehberi
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mutlular mahallemizin onaylı fırınları, bakkalları ve yerel dükkanları.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Store className="w-3.5 h-3.5" /> {businesses.length} Onaylı İşletme
              </div>
            </div>

            {/* Kategori filtresi: yalnızca gerçekten var olan işletme türleri */}
            {(() => {
              const cats: string[] = Array.from(new Set<string>(businesses.map((b) => b.kategori))).sort((x: string, y: string) => x.localeCompare(y, 'tr'));
              const filter = esnafCategoryFilter === 'tumu' || cats.includes(esnafCategoryFilter) ? esnafCategoryFilter : 'tumu';
              const shown = businesses.filter((b) => filter === 'tumu' || b.kategori === filter);
              return (
                <>
                  {cats.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                      {['tumu', ...cats].map((c) => (
                        <button
                          key={c}
                          onClick={() => setEsnafCategoryFilter(c)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                            filter === c ? 'bg-slate-900 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                          }`}
                        >
                          {c === 'tumu' ? 'Tüm Esnaflar' : c}
                        </button>
                      ))}
                    </div>
                  )}

                  {shown.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3">
                      <div className="text-4xl">🏪</div>
                      <h4 className="font-black text-base text-slate-900">Rehberde henüz onaylı işletme yok</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Mahalle esnafı işletme sayfasını oluşturup onay aldıkça burada listelenecek.
                      </p>
                      {isEsnafAccount && (
                        <button type="button" onClick={() => setShowBusinessEditor(true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer">
                          🏪 İşletme Sayfamı Oluştur
                        </button>
                      )}
                      {!user && (
                        <button type="button" onClick={() => handleOpenArtisanOnboarding('esnaf')} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer">
                          Esnaf Olarak Kayıt Ol
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {shown.map((b) => (
                      <div key={b.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                        <button type="button" onClick={() => openBusiness(b)} className="text-left cursor-pointer">
                          {b.fotolar && b.fotolar[0] ? (
                            <img src={b.fotolar[0]} alt="" className="w-full h-36 object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-24 bg-emerald-50 flex items-center justify-center text-4xl">🏪</div>
                          )}
                          <div className="p-4 space-y-1.5">
                            <div className="flex items-center gap-2">
                              {b.logoUrl && <img src={b.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />}
                              <div className="min-w-0">
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{b.kategori}</span>
                                <h4 className="font-black text-sm text-slate-900 mt-1 truncate">{b.isyeri}</h4>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.aciklama}</p>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{b.adres}</span>
                            </div>
                          </div>
                        </button>
                        <div className="px-4 pb-4 mt-auto flex gap-2">
                          <button onClick={() => openBusiness(b)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2 rounded-xl cursor-pointer">
                            Sayfayı Aç
                          </button>
                          <button
                            onClick={() => { trackBusinessEvent(b, 'whatsapp'); openWhatsApp(b.whatsapp || b.telefon, `Merhaba ${b.isyeri}, Mutlular Haber üzerinden yazıyorum.`); }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { trackBusinessEvent(b, 'call'); openDialer(b.telefon); }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl cursor-pointer"
                            title="Ara"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB 9: BİLDİRİMLER (SCREEN 5)
        ════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    Bildirimler
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mahallenizdeki son dakika gelişmeler ve duyurular.
                </p>
              </div>

              <button
                onClick={handleMarkAllNotificationsRead}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Tümünü Okundu Say
              </button>
            </div>

            {/* Bildirim Filtreleri */}
            <div className="flex gap-2">
              {[
                { id: 'tumu', label: 'Tümü' },
                { id: 'unread', label: 'Okunmamış' },
                { id: 'duyuru', label: 'Duyurular' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setNotifTab(tab.id as any)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    notifTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bildirim Listesi */}
            <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {allNotifications
                .filter((n: any) => notifTab === 'tumu' || (notifTab === 'unread' && !n.read) || (notifTab === 'duyuru' && n.type === 'duyuru'))
                .map((notif: any) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.target) {
                        handleOpenDerivedNotification(notif);
                      } else if (notif.type === 'sondakika') {
                        if (newsItems[0]) handleOpenNewsDetail(newsItems[0]);
                      } else if (notif.type === 'anket') {
                        setActiveTab('meclis');
                      } else if (notif.type === 'ilan') {
                        setActiveTab('market');
                      }
                    }}
                    className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <div className="text-2xl shrink-0 p-1">
                      {notif.icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-md ${notif.badgeColor}`}>
                          {notif.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        {notif.title}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-2" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
             TAB 10: KEŞFET / MAHALLE MERKEZİ (SCREEN EXPLORE)
        ════════════════════════════════════════ */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-6 h-6 text-red-600" />
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  Mahalle Pusulası &amp; Keşfet
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Mutlular mahallesindeki her noktaya tek dokunuşla ulaşın.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: 'MUTLULAR HİZMET', icon: Wrench, count: '18 Sektör', tab: 'services', color: 'bg-orange-50 text-orange-600' },
                { title: 'Mahalle Meclisi', icon: Megaphone, count: `${polls.filter((p) => isPollOpen(p)).length} Anket`, tab: 'meclis', color: 'bg-blue-50 text-blue-600' },
                { title: 'Esnaf & Dükkanlar', icon: Store, count: `${businesses.length} Kayıt`, tab: 'esnaf', color: 'bg-emerald-50 text-emerald-600' },
                { title: 'MUTLULAR ALIM SATIM', icon: ShoppingBag, count: '12 İlan', tab: 'market', color: 'bg-amber-50 text-amber-600' },
                { title: 'Kayıp & Buluntu', icon: Search, count: '2 Kayıp', tab: 'lostfound', color: 'bg-purple-50 text-purple-600' },
                { title: 'MUTLULAR HABER', icon: Newspaper, count: '16 Haber', tab: 'news', color: 'bg-red-50 text-red-600' }
              ].map((item, idx) => {
                const IconC = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(item.tab as any)}
                    className="p-4 bg-white rounded-3xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <IconC className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
      {showQuickActionSheet && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Karartma arka plan */}
          <div 
            onClick={() => setShowQuickActionSheet(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
              
              {/* Başlık ve Kapat */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    MH
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">Paylaşım &amp; İlan Merkezi</h3>
                    <p className="text-[11px] text-slate-500">Ne paylaşmak veya talep etmek istersiniz?</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuickActionSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Seçenekler Listesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1: Haber veya Duyuru Paylaş */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowNewsModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-blue-700 transition-colors">
                      Haber veya Duyuru Paylaş
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Mahalle bülteni için duyuru ve haber
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2: Emlak İlanı Ver */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setMarketModalType('emlak');
                    setShowMarketModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 hover:border-amber-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-amber-800 transition-colors">
                      Emlak İlanı Ver
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Satılık, kiralık konut, dükkan veya arsa
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3: 2. El Eşya İlanı Ver */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setMarketModalType('ikinci_el');
                    setShowMarketModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-rose-700 transition-colors">
                      2. El Eşya Sat
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Mobilya, elektronik, bisiklet, giyim
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 4: Usta & Hizmet Talebi Aç */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setArmutStep(1);
                    setShowArmutWizard(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-emerald-700 transition-colors">
                      Usta &amp; Hizmet Talebi Aç
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Tesisat, boya, elektrik, temizlik, organizasyon
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 5: Kayıp İhbarı */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowLostFoundModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-purple-700 transition-colors">
                      Kayıp / Buluntu Bildir
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Kayıp evcil hayvan veya bulunan eşya
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 6: Cemiyet & Davet Paylaş */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowDavetModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-50 hover:border-pink-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-pink-700 transition-colors">
                      Düğün &amp; Davet Paylaş
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Düğün, nişan, sünnet davetiyesi yayınla
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 7: Cenaze / Vefat İlanı */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowNewDeceasedModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform text-lg">
                    🕊️
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-slate-800 transition-colors">
                      Vefat &amp; Taziye Bildir
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Cenaze namazı ve taziye duyurusu bırak
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 8: Esnaf Kampanyası & İndirim */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    openCampaignModal();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5 text-amber-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-amber-800 transition-colors">
                      Esnaf İndirimi Duyur
                    </span>
                    <span className="text-[10px] text-slate-600 line-clamp-1">
                      Mahalle Pazarı için kampanya veya indirim
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 6: Mahalle Kürsüsü: Dert & Görüş Bildir */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setKursuBaslik('');
                    setKursuIcerik('');
                    setKursuKonum('');
                    setKursuFoto('');
                    setShowKursuModal(true);
                  }}
                  className="sm:col-span-2 flex items-center gap-3 p-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 hover:border-indigo-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 block group-hover:text-indigo-800 transition-colors">
                        Mahalle Kürsüsünde Görüş / Dert Bildir
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-md">
                        Söz Mahallelinin
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 line-clamp-1">
                      Sorun, şikayet, öneri veya teşekkürünüzü komşularınızla paylaşın
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Kapat Butonu */}
              <button
                onClick={() => setShowQuickActionSheet(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 2: EDİTORYAL HABER DETAYI & YORUMLAR (TAM MOCKUP UYUMU) ── */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto flex flex-col animate-in fade-in duration-200">
          {/* Üst Yapışkan Navigasyon Çubuğu */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {/* Sol: Geri Dön Butonu */}
              <button
                onClick={handleCloseNewsDetail}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Geri Dön"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Sağ: Kaydet (Bookmark) & Paylaş Butonları */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = selectedNews.id || 'current_news';
                    const isBookmarked = savedNewsIds.includes(id);
                    setSavedNewsIds(prev => isBookmarked ? prev.filter(x => x !== id) : [...prev, id]);
                    showToast(isBookmarked ? 'Kaydedilenlerden kaldırıldı' : 'Haber kaydedildi! 🔖');
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Kaydet"
                >
                  <Bookmark className={`w-4 h-4 ${savedNewsIds.includes(selectedNews.id || 'current_news') ? 'fill-red-600 text-red-600' : ''}`} />
                </button>

                <button
                  onClick={() => openShareStudio(newsToShareItem(selectedNews))}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Paylaş"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Haber Gövdesi */}
          <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4 pb-28">
            {/* Rozet: yalnızca gerçekten son dakika işaretli haberlerde */}
            <div className="flex items-center gap-2">
              {selectedNews.sonDakika && (
                <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  SON DAKİKA
                </span>
              )}
              {selectedNews.kategori && (
                <span className="bg-slate-100 text-slate-600 text-[11px] font-black px-3 py-1 rounded-full">{selectedNews.kategori}</span>
              )}
            </div>

            {/* Manşet Başlığı */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
              {selectedNews.baslik}
            </h1>

            {/* Yayın bilgisi: yalnızca kayıtlı gerçek veriler */}
            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  MH
                </div>
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1">
                    <span>{selectedNews.authorName || 'Mutlular Haber'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  {selectedNews.tarihStr && <div className="text-[11px] text-slate-400">{selectedNews.tarihStr}</div>}
                </div>
              </div>

              {(selectedNews.okunmaSayisi || 0) > 1 && (
                <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {(selectedNews.okunmaSayisi || 0).toLocaleString('tr-TR')}
                </span>
              )}
            </div>

            {/* Büyük Manşet Fotoğrafı (yalnızca yüklenmiş fotoğraf varsa) */}
            {selectedNews.imageURL && (
              <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200/80">
                <img src={selectedNews.imageURL} alt={selectedNews.baslik} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Haber Metni */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              {String(selectedNews.icerik || selectedNews.ozet || '')
                .split(/\n{2,}/)
                .filter((para) => para.trim())
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para.trim()}</p>
                ))}
            </div>

            {/* Tepkiler & Etkileşim Çubuğu */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-600">
              <button
                onClick={handleToggleNewsLike}
                className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer px-2 py-1 rounded-lg ${myNewsLike ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${myNewsLike ? 'fill-red-600 text-red-600' : 'text-slate-500'}`} />
                <span>{newsLikeCount}</span>
              </button>

              <div className="flex items-center gap-1.5 font-bold px-2 py-1">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>{newsComments.length}</span>
              </div>

              <button
                onClick={() => openShareStudio(newsToShareItem(selectedNews))}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Paylaş</span>
              </button>
            </div>

            {/* 💬 YORUMLAR (gerçek kayıtlar) */}
            <div className="space-y-3 pt-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">Yorumlar ({newsComments.length})</h3>

              {newsComments.length === 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 text-center text-xs text-slate-500">
                  Henüz yorum yok. İlk yorumu sen yaz.
                </div>
              )}

              <div className="space-y-3">
                {newsComments.map((comm) => (
                  <div key={comm.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {comm.authorPhoto ? (
                          <img src={comm.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center shrink-0">
                            {comm.authorName.charAt(0).toLocaleUpperCase('tr-TR')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">{comm.authorName}</div>
                          <div className="text-[10px] text-slate-400">{timeAgoTr(comm.createdAtMs)}</div>
                        </div>
                      </div>
                      {user && (comm.uid === user.uid || isRealStaff) && (
                        <button onClick={() => handleDeleteNewsComment(comm)} className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer shrink-0">
                          Sil
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✍️ EN ALTA YAPIŞIK YORUM YAZMA ÇUBUĞU (SCREEN 2) */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 shadow-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNewsComment();
              }}
              className="max-w-2xl mx-auto flex items-center gap-2.5"
            >
              <img
                src={profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                alt="Profilim"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  placeholder={user ? "Yorum yaz..." : "Yorum yazmak için giriş yapın"}
                  className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!newCommentInput.trim()}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ HABER ÖNER / İHBAR BİLDİR ── */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-base text-slate-900">
                  {isUserAdmin || isUserEditor ? 'Resmi Mahalle Haberi Yayınla' : 'Mahalle Haberi & İhbar Bildir'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUserAdmin || isUserEditor 
                    ? 'Yönetici/Editör yetkisiyle doğrudan Mutlular Haber bülteninde yayına alınır.' 
                    : 'İhbarınız Mutlular Haber Editör Masası tarafından incelendikten sonra yayına alınır.'}
                </p>
              </div>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const ozet = (form.elements.namedItem('ozet') as HTMLTextAreaElement).value;
                const icerik = (form.elements.namedItem('icerik') as HTMLTextAreaElement).value;
                const kategori = (form.elements.namedItem('kategori') as HTMLSelectElement).value;
                const fotoInput = (form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value;
                const sonDakikaInput = (form.elements.namedItem('sonDakika') as HTMLInputElement)?.checked || false;
                const telefonInput = (form.elements.namedItem('telefon') as HTMLInputElement)?.value;

                const isDirectPublish = isUserAdmin || isUserEditor;
                const newNewsItem: SampleNewsItem = {
                  id: (isDirectPublish ? 'haber_' : 'ihbar_') + Date.now(),
                  baslik,
                  ozet,
                  icerik,
                  kategori,
                  status: isDirectPublish ? 'approved' : 'pending',
                  isTip: !isDirectPublish,
                  authorName: profile?.name || 'Mahalle Sakini',
                  authorPhone: telefonInput || profile?.telefon || '',
                  authorRole: profile?.role || demoRole || 'sakin',
                  authorUid: user?.uid || 'user_demo',
                  sonDakika: isDirectPublish ? sonDakikaInput : false,
                  imageURL: fotoInput || "",
                  okunmaSayisi: 1,
                  begeniSayisi: 0,
                  tarihStr: 'Az önce'
                };

                setNewsItems([newNewsItem, ...newsItems]);
                try {
                  await addDoc(collection(db, 'haberler'), {
                    ...newNewsItem,
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowNewsModal(false);
                if (isDirectPublish) {
                  showToast('Resmi haber Mutlular Haber bültenine eklendi! 📰');
                } else {
                  showToast('Haber ihbarınız editör masasına iletildi! İncelendikten sonra yayınlanacaktır. 📬');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Kategori</label>
                <select name="kategori" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                  <option value="Belediye & Hizmet">Belediye &amp; Hizmet</option>
                  <option value="Çevre & Parklar">Çevre &amp; Parklar</option>
                  <option value="Asayiş & Güvenlik">Asayiş &amp; Güvenlik</option>
                  <option value="Dayanışma & Doğa">Dayanışma &amp; Doğa</option>
                  <option value="Eğitim & Kültür">Eğitim &amp; Kültür</option>
                  <option value="Duyuru">Genel Duyuru</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Haber Başlığı</label>
                <input required name="baslik" type="text" placeholder="Örn: Parktaki banklar yenilendi" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Kısa Özet</label>
                <textarea required name="ozet" rows={2} placeholder="Haberin ana fikri..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Detaylı İçerik</label>
                <textarea required name="icerik" rows={3} placeholder="Geniş açıklama..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Fotoğraf (İsteğe bağlı)</label>
                <PhotoUploadField name="fotoUrl" folder="mutlular_haber/haberler" accentClass="bg-blue-600 hover:bg-blue-700 text-white" />
              </div>

              {isUserAdmin || isUserEditor ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100">
                  <input name="sonDakika" type="checkbox" id="newsSonDakikaCheck" className="w-4 h-4 text-red-600 rounded" />
                  <label htmlFor="newsSonDakikaCheck" className="text-xs font-black text-red-900 cursor-pointer flex items-center gap-1">
                    <span>🚨</span> Son Dakika / Flaş Haber Olarak Yayınla
                  </label>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">İletişim Telefonunuz (Teyit için)</label>
                  <input name="telefon" type="tel" defaultValue={profile?.telefon || ''} placeholder="053x xxx xx xx" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
              )}

              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer ${
                  isUserAdmin || isUserEditor
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                }`}
              >
                {isUserAdmin || isUserEditor ? 'Haberi Doğrudan Yayına Al' : 'İhbarı Editör Masasına Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ MAHALLE DAVETİYESİ PAYLAŞ ── */}
      {showDavetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-pink-100 text-pink-700 rounded-2xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Mahalle Davetiyesi Paylaş</h3>
                  <p className="text-xs text-slate-500">Düğün, nişan, sünnet ve kutlamalarınızı komşularla paylaşın</p>
                </div>
              </div>
              <button onClick={() => setShowDavetModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const tur = (form.elements.namedItem('tur') as HTMLSelectElement).value as any;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const davetSahipleri = (form.elements.namedItem('davetSahipleri') as HTMLInputElement).value;
                const gelinDamat = (form.elements.namedItem('gelinDamat') as HTMLInputElement).value;
                const tarih = (form.elements.namedItem('tarih') as HTMLInputElement).value;
                const saat = (form.elements.namedItem('saat') as HTMLInputElement).value;
                const mekanAdi = (form.elements.namedItem('mekanAdi') as HTMLInputElement).value;
                const salonBilgisi = (form.elements.namedItem('salonBilgisi') as HTMLInputElement).value;
                const adres = (form.elements.namedItem('adres') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const iletisimKisi = (form.elements.namedItem('iletisimKisi') as HTMLInputElement).value;
                const iletisimTelefon = (form.elements.namedItem('iletisimTelefon') as HTMLInputElement).value;
                const davetiyeFoto = (form.elements.namedItem('davetiyeFoto') as HTMLInputElement).value || '';

                const turEtiketiMap: Record<string, string> = {
                  dugun: '💍 Düğün & Nikah',
                  nisan: '💐 Nişan & Söz',
                  sunnet: '👑 Sünnet Şöleni',
                  kina: '✨ Kına Gecesi',
                  dogum_gunu: '🎂 Doğum Günü / Kutlama',
                  mevlid: '🤲 Mevlid-i Şerif',
                };

                const newDavet: MahalleDavetItem = {
                  tur,
                  turEtiketi: turEtiketiMap[tur] || '💍 Cemiyet Daveti',
                  baslik,
                  davetSahipleri,
                  gelinDamat: gelinDamat || undefined,
                  tarih,
                  saat,
                  mekanAdi,
                  salonBilgisi: salonBilgisi || undefined,
                  adres,
                  aciklama,
                  iletisimKisi: iletisimKisi || profile?.name || 'Davet Sahibi',
                  iletisimTelefon,
                  davetiyeFoto,
                  katilanSayisi: 1,
                  tebrikler: []
                };

                setInvitationItems([newDavet, ...invitationItems]);

                try {
                  await addDoc(collection(db, 'mahalle_davetleri'), {
                    ...newDavet,
                    uid: user?.uid || 'davet_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (err: any) {
                  console.warn('Davet kaydetme Firestore:', err.message);
                }

                setShowDavetModal(false);
                showToast('Davetiyeniz panoda paylaşıldı! Hayırlı, uğurlu ve mutlu olsun 💐💍');
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Cemiyet Türü</label>
                  <select name="tur" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-bold">
                    <option value="dugun">💍 Düğün &amp; Nikah</option>
                    <option value="nisan">💐 Nişan &amp; Söz</option>
                    <option value="sunnet">👑 Sünnet Şöleni</option>
                    <option value="kina">✨ Kına Gecesi</option>
                    <option value="dogum_gunu">🎂 Doğum Günü</option>
                    <option value="mevlid">🤲 Bebek / Sünnet Mevlidi</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Damat &amp; Gelin / Çocuk</label>
                  <input name="gelinDamat" type="text" placeholder="Örn: Ayşe &amp; Mehmet" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Başlığı</label>
                <input required name="baslik" type="text" placeholder="Örn: Ayşe &amp; Mehmet Dünyaevine Giriyor" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Eden Aileler / Kişiler</label>
                <input required name="davetSahipleri" type="text" placeholder="Örn: Yılmaz ve Kaya Aileleri" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tarih</label>
                  <input required name="tarih" type="text" placeholder="Örn: 18 Ekim 2026 Pazar" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Saat / Zaman Aralığı</label>
                  <input required name="saat" type="text" placeholder="Örn: 19:00 - 23:00" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mekan / Salon Adı</label>
                  <input required name="mekanAdi" type="text" placeholder="Örn: Mutlular Kültür Düğün Salonu" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Salon / Kat (Opsiyonel)</label>
                  <input name="salonBilgisi" type="text" placeholder="Örn: Safir Salonu - 2. Kat" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mekan Açık Adresi</label>
                <input required name="adres" type="text" placeholder="Örn: Barış Manço Cad. No: 14 Mutlular" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">İletişim Kişisi</label>
                  <input required name="iletisimKisi" defaultValue={profile?.name || 'Hasan Bey'} type="text" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefon Numarası</label>
                  <input required name="iletisimTelefon" defaultValue="0532 555 44 33" type="tel" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Notu / Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Bu mutlu günümüzde tüm mahalleli komşularımızı aramızda görmekten onur duyarız..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davetiye / Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField name="davetiyeFoto" folder="mutlular_haber/davetler" accentClass="bg-pink-600 hover:bg-pink-700 text-white" />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer"
              >
                Davetiyeyi Panoda Yayınla 💐
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ALIM SATIM İLANI VER (EMLAK VE 2. EL EŞYA SEÇİMLİ) ── */}
      {showMarketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {marketModalType === 'emlak' ? '🏠 Emlak İlanı Bırak' : '📦 2. El Eşya İlanı Ver'}
                </h3>
                <p className="text-xs text-slate-500">Komşular doğrudan WhatsApp ile ulaşır, komisyonsuzdur.</p>
              </div>
              <button onClick={() => setShowMarketModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İlan Türü Seçim Sekmesi (Emlak vs 2. El) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setMarketModalType('emlak')}
                className={`text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketModalType === 'emlak'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" /> 🏠 Emlak (Ev / Dükkan)
              </button>
              <button
                type="button"
                onClick={() => setMarketModalType('ikinci_el')}
                className={`text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketModalType === 'ikinci_el'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> 📦 2. El Eşya &amp; Gereç
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const fiyat = parseFloat((form.elements.namedItem('fiyat') as HTMLInputElement).value) || 0;
                const saticiTelefon = (form.elements.namedItem('saticiTelefon') as HTMLInputElement).value;
                const fotoUrl = (form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value;

                let newItem: MarketplaceItem;

                if (marketModalType === 'emlak') {
                  const emlakTuru = (form.elements.namedItem('emlakTuru') as HTMLSelectElement).value as any;
                  const odaSayisi = (form.elements.namedItem('odaSayisi') as HTMLSelectElement).value;
                  const metrekare = parseInt((form.elements.namedItem('metrekare') as HTMLInputElement).value) || 0;
                  const kat = (form.elements.namedItem('kat') as HTMLInputElement).value;
                  const isitma = (form.elements.namedItem('isitma') as HTMLInputElement).value;

                  const genId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                  newItem = {
                    id: genId,
                    baslik,
                    aciklama,
                    fiyat,
                    kategori: emlakTuru === 'kiralik' ? 'Kiralık Daire' : emlakTuru === 'satilik' ? 'Satılık Daire' : 'Devren İşyeri',
                    durum: 'az_kullanilmis',
                    saticiAdi: profile?.name || 'Mahalle Sakini (Ev Sahibi)',
                    saticiTelefon,
                    status: 'active',
                    ilanTuru: 'emlak',
                    emlakTuru,
                    odaSayisi,
                    metrekare,
                    kat,
                    isitma,
                    fotolar: fotoUrl ? [fotoUrl] : []
                  };
                } else {
                  const kategori = (form.elements.namedItem('kategori') as HTMLSelectElement).value;
                  const durum = (form.elements.namedItem('durum') as HTMLSelectElement).value as any;
                  const genId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

                  newItem = {
                    id: genId,
                    baslik,
                    aciklama,
                    fiyat,
                    kategori,
                    durum,
                    saticiAdi: profile?.name || 'Mahalle Sakini',
                    saticiTelefon,
                    status: 'active',
                    ilanTuru: 'ikinci_el',
                    fotolar: fotoUrl ? [fotoUrl] : []
                  };
                }

                setMarketplaceItems([newItem, ...marketplaceItems]);
                try {
                  await addDoc(collection(db, 'marketplace_items'), {
                    ...newItem,
                    uid: user?.uid || 'sakin_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowMarketModal(false);
                showToast(marketModalType === 'emlak' ? 'Emlak ilanınız başarıyla yayınlandı! 🏠' : '2. El ilanı başarıyla yayınlandı! 🛋️');
              }}
              className="space-y-3"
            >
              {/* Emlak İlanına Özel Alanlar */}
              {marketModalType === 'emlak' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emlak Türü</label>
                      <select name="emlakTuru" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold">
                        <option value="kiralik">🔑 Kiralık Daire</option>
                        <option value="satilik">🏷️ Satılık Daire</option>
                        <option value="devren">🏪 Devren Dükkan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Oda Sayısı</label>
                      <select name="odaSayisi" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold">
                        <option value="1+1">1+1</option>
                        <option value="2+1">2+1</option>
                        <option value="3+1">3+1</option>
                        <option value="4+1">4+1</option>
                        <option value="Dükkan">Dükkan / Mağaza</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">m² (Net)</label>
                      <input required name="metrekare" type="number" defaultValue="115" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Kat</label>
                      <input name="kat" type="text" defaultValue="2. Kat" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Isıtma</label>
                      <input name="isitma" type="text" defaultValue="Kombi (Doğalgaz)" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </>
              )}

              {/* 2. El Eşyaya Özel Alanlar */}
              {marketModalType === 'ikinci_el' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Kategori</label>
                    <select name="kategori" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
                      <option value="Mobilya">Mobilya</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Anne & Bebek">Anne &amp; Bebek</option>
                      <option value="Spor & Bisiklet">Spor &amp; Bisiklet</option>
                      <option value="Ev Gereçleri">Ev Gereçleri</option>
                      <option value="Bağış & Ücretsiz">Bağış &amp; Ücretsiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Kullanım Durumu</label>
                    <select name="durum" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
                      <option value="az_kullanilmis">Az Kullanılmış</option>
                      <option value="ikinci_el">İkinci El</option>
                      <option value="sifir">Sıfır / Kutulu</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {marketModalType === 'emlak' ? 'Emlak İlan Başlığı' : 'Eşya / Ürün Başlığı'}
                </label>
                <input
                  required
                  name="baslik"
                  type="text"
                  placeholder={marketModalType === 'emlak' ? 'Örn: Barış Manço Parkı Yanı Ferah 3+1 Kiralık Daire' : 'Örn: Masif Ahşap Çalışma Masası ve Sandalye'}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {marketModalType === 'emlak' ? 'Kira / Fiyat (TL)' : 'Fiyat (TL - 0 = Ücretsiz)'}
                  </label>
                  <input required name="fiyat" type="number" placeholder="0" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp İletişim Telefonu</label>
                  <input required name="saticiTelefon" defaultValue="0532 999 88 77" type="tel" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField
                  key={marketModalType}
                  name="fotoUrl"
                  folder="mutlular_haber/ilanlar"
                  accentClass="bg-slate-900 hover:bg-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Özellikler, konum, teslim şekli..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none" />
              </div>

              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer ${
                  marketModalType === 'emlak' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {marketModalType === 'emlak' ? 'Emlak İlanını Yayınla 🏠' : '2. El İlanını Yayınla 📦'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: KAYIP / BULUNTU BİLDİR ── */}
      {showLostFoundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Kayıp / Buluntu Bildir</h3>
                <p className="text-xs text-gray-500">Zaman kritik olduğu için hemen yayına girer.</p>
              </div>
              <button onClick={() => setShowLostFoundModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const tur = (form.elements.namedItem('tur') as HTMLSelectElement).value as any;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const kategori = (form.elements.namedItem('kategori') as HTMLInputElement).value;
                const konum = (form.elements.namedItem('konum') as HTMLInputElement).value;
                const iletisimTelefon = (form.elements.namedItem('iletisimTelefon') as HTMLInputElement).value;
                const isCritical = (form.elements.namedItem('isCritical') as HTMLInputElement).checked;

                const newItem: LostFoundItem = {
                  tur,
                  baslik,
                  aciklama,
                  kategori,
                  konum,
                  isCritical,
                  iletisimKisi: profile?.name || 'Komşu',
                  iletisimTelefon,
                  status: 'published',
                  fotolar: ((form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value || '') ? [(form.elements.namedItem('fotoUrl') as HTMLInputElement).value] : []
                };

                setLostFoundItems([newItem, ...lostFoundItems]);
                try {
                  await addDoc(collection(db, 'lost_found_items'), {
                    ...newItem,
                    uid: user?.uid || 'sakin_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowLostFoundModal(false);
                showToast('Kayıp / buluntu ilanı yayına girdi! 🔍');
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Durum Türü</label>
                  <select name="tur" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500">
                    <option value="kayip">🔍 Kaybettim</option>
                    <option value="bulundu">✅ Buldum</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Kategori</label>
                  <input required name="kategori" defaultValue="Evcil Hayvan" placeholder="Örn: Evcil Hayvan, Anahtar" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Başlık</label>
                <input required name="baslik" placeholder="Örn: Beyaz tasmalı tekir kedi kayıp" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Görüldüğü Konum</label>
                  <input required name="konum" placeholder="Örn: Gül Sokak / Park" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">İletişim Tel</label>
                  <input required name="iletisimTelefon" defaultValue={profile?.telefon || ''} placeholder="05xx xxx xx xx" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Detaylı Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Özellikler, tasma rengi, ayırt edici işaret..." className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField name="fotoUrl" folder="mutlular_haber/kayip" accentClass="bg-red-600 hover:bg-red-700 text-white" />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                <input type="checkbox" id="isCrit" name="isCritical" className="rounded text-red-600 focus:ring-red-500" />
                <label htmlFor="isCrit" className="text-[11px] font-black text-red-900 cursor-pointer">
                  Kritik Acil Kayıp (Tüm mahalleye acil alarmla gösterilsin)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2"
              >
                Bildirimi Canlı Yayına Al
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ESNAF TEKLİFİ VER (1 Kredi Düşümü) ── */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Hizmet Teklifi Sun</h3>
                <p className="text-xs text-amber-700 font-bold">1 Dijital Kredi Karşılığı</p>
              </div>
              <button onClick={() => setShowOfferModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-500 block">Talep:</span>
              <p className="font-extrabold text-gray-900">{showOfferModal.baslik}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fiyat = parseFloat((form.elements.namedItem('fiyat') as HTMLInputElement).value);
                const mesaj = (form.elements.namedItem('mesaj') as HTMLTextAreaElement).value;
                const sure = (form.elements.namedItem('sure') as HTMLInputElement).value;
                handleGiveOffer(showOfferModal.id || 'req_1', fiyat, mesaj, sure);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Teklif Fiyatı (TL)</label>
                <input required name="fiyat" type="number" placeholder="Örn: 450" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Tahmini İş Süresi</label>
                <input required name="sure" placeholder="Örn: 1 Saat / Bugün 15:00" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Açıklamanız &amp; İşçilik Detayı</label>
                <textarea required name="mesaj" rows={2} placeholder="Malzeme dahil mi, garanti şartları..." className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Coins className="w-4 h-4" /> 1 Kredi ile Teklifi Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HİZMET TALEBİ DETAYI & GELEN TEKLİFLER ── */}
      {showRequestDetail && (() => {
        const isDetailAuthor = Boolean(
          (user && showRequestDetail.uid && user.uid === showRequestDetail.uid) ||
          (user && profile?.name && showRequestDetail.authorName === profile.name) ||
          (!user && (showRequestDetail.uid === 'sakin_1' || showRequestDetail.uid === 'mock_user_1' || showRequestDetail.authorName === 'Ahmet Turan' || demoRole === 'sakin'))
        );
        const isDetailActive = showRequestDetail.status === 'open' || !showRequestDetail.status || showRequestDetail.status === 'in_progress';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                      {showRequestDetail.kategori}
                    </span>
                    {isDetailAuthor && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        ⭐ Sizin Talebiniz
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-base text-gray-900">{showRequestDetail.baslik}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isDetailAuthor && isDetailActive && (
                    <button
                      onClick={() => {
                        const target = showRequestDetail;
                        setShowRequestDetail(null);
                        handleOpenEditRequest(target);
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Talebi Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Düzenle</span>
                    </button>
                  )}
                  <button onClick={() => setShowRequestDetail(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{showRequestDetail.aciklama}</p>

              {/* Fotoğraflar */}
              {showRequestDetail.fotolar && showRequestDetail.fotolar.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-500">Talebe Ait Fotoğraflar:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {showRequestDetail.fotolar.map((photoUrl, pIdx) => (
                      <img
                        key={pIdx}
                        src={photoUrl}
                        alt={`${showRequestDetail.baslik} - ${pIdx + 1}`}
                        className="w-full h-28 object-cover rounded-xl border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const reqId = showRequestDetail.id || '';
                const detailOffers = offersMap[reqId] || [];
                const isOwnerStrict = Boolean(user && showRequestDetail.uid && user.uid === showRequestDetail.uid);
                const isOpen = !showRequestDetail.status || showRequestDetail.status === 'open';
                const offerTotal = Math.max(detailOffers.length, showRequestDetail.offerCount || 0);
                const statusLabel: Record<string, string> = { pending: 'Beklemede', accepted: 'Kabul edildi', rejected: 'Reddedildi' };
                const statusColor: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', accepted: 'bg-emerald-100 text-emerald-800', rejected: 'bg-slate-100 text-slate-500' };

                if (!isOwnerStrict && !detailOffers.length) {
                  return (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                        Bu talebe şu ana kadar {offerTotal} teklif verildi. Teklifleri yalnızca talep sahibi görür.
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="font-black text-xs text-gray-900 mb-2 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      {isOwnerStrict ? `Ustalardan Gelen Teklifler (${detailOffers.length})` : 'Verdiğiniz Teklif'}
                    </h4>

                    <div className="space-y-2">
                      {detailOffers.map((off) => (
                        <div key={off.id} className={`p-3 rounded-2xl border space-y-2 ${off.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200/80'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-xs text-gray-900">{off.esnafIsyeri}</span>
                            <span className="font-black text-sm text-emerald-600">{off.fiyat} TL</span>
                          </div>
                          <p className="text-xs text-gray-600">{off.mesaj}</p>
                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400">⏱️ {off.tahminiSure || 'Aynı Gün'}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${statusColor[off.status] || statusColor.pending}`}>{statusLabel[off.status] || 'Beklemede'}</span>
                            </div>

                            {isOwnerStrict && off.status === 'pending' && isOpen && (
                              <button
                                disabled={acceptingOfferId === off.id}
                                onClick={() => handleAcceptOffer(showRequestDetail, off)}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm cursor-pointer"
                              >
                                ✅ Teklifi Kabul Et
                              </button>
                            )}

                            {isOwnerStrict && off.status === 'accepted' && (
                              <button
                                onClick={() => openWhatsApp(off.esnafTelefon, `Merhaba ${off.esnafIsyeri}, "${showRequestDetail.baslik}" talebim için verdiğiniz ${off.fiyat} TL'lik teklifi kabul ettim.`)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Ustaya Yaz
                              </button>
                            )}

                            {!isOwnerStrict && off.status === 'accepted' && off.musteriTelefon && (
                              <button
                                onClick={() => openWhatsApp(off.musteriTelefon || '', `Merhaba ${off.musteriAdi || ''}, "${showRequestDetail.baslik}" talebiniz için teklifiniz kabul edildi. Ne zaman uygunsunuz?`)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Müşteriye Yaz
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isOwnerStrict && detailOffers.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400">
                          Henüz usta teklifi gelmedi. Kategorinize uygun ustalara bildirim gitti; teklif geldiğinde size bildirim gelecek.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: YENİ HİZMET TALEBİ AÇ (TEKLİF AL) ── */}
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

      {/* ── MODAL: HİZMET TALEBİNİ DÜZENLE (EDIT SERVICE REQUEST) ── */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">Hizmet Talebini Düzenle</h3>
                  <p className="text-xs text-gray-500">Başlık, detaylı açıklama ve fotoğrafları güncelleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingRequest(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRequest} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Talep Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editReqTitle}
                  onChange={(e) => setEditReqTitle(e.target.value)}
                  placeholder="Örn: Mutfak lavabosu su kaçırıyor"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Hizmet Kategorisi
                  </label>
                  <select
                    value={editReqKategori}
                    onChange={(e) => setEditReqKategori(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {ALL_SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                    <option value="Diğer Mahalle Hizmeti">🛠️ Diğer Mahalle Hizmeti</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Açık Adres / Sokak
                  </label>
                  <input
                    type="text"
                    value={editReqAdres}
                    onChange={(e) => setEditReqAdres(e.target.value)}
                    placeholder="Örn: Menekşe Sokak No: 12"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  İhtiyacın Detayı &amp; Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editReqDesc}
                  onChange={(e) => setEditReqDesc(e.target.value)}
                  placeholder="Sorunun detayları, ne zaman müsait olduğunuz, malzeme durumu..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* FOTOĞRAFLAR YÖNETİMİ */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Talebe Ait Fotoğraflar ({editReqPhotos.length})
                  </label>
                  <span className="text-[10px] text-slate-400">Görseller teklif almayı kolaylaştırır</span>
                </div>

                {/* Mevcut Fotoğraflar Önizleme */}
                {editReqPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {editReqPhotos.map((photoUrl, pIdx) => (
                      <div key={pIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                        <img 
                          src={photoUrl} 
                          alt={`Foto ${pIdx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoFromEdit(pIdx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                          title="Fotoğrafı Kaldır"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">
                    Henüz fotoğraf eklenmemiş. Aşağıdan telefonunuzdan veya bilgisayarınızdan fotoğraf yükleyebilirsiniz.
                  </p>
                )}

                {/* Yeni Fotoğraf Yükleme */}
                <div className="pt-1">
                  <PhotoUploadField
                    value=""
                    onChange={(url) => { if (url) handleAddPhotoToEdit(url); }}
                    folder="mutlular_haber/talepler"
                    buttonLabel="Fotoğraf Yükle"
                    accentClass="bg-amber-600 hover:bg-amber-700 text-white"
                  />
                </div>
              </div>

              {/* BUTONLAR */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ESNAF KREDİ SATIN ALMA (WhatsApp Yönlendirmeli) ── */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Teklif Kredisi Satın Al</h3>
                <p className="text-xs text-gray-500">Koordinatör Onaylı WhatsApp Yüklemesi</p>
              </div>
              <button onClick={() => setShowCreditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                Kredi yüklemeleri mahalle koordinatörlüğü tarafından doğrudan onaylanır. 
                Butona tıkladığınızda yönetici WhatsApp hattı açılacak ve UID kodunuz otomatik iletilecektir.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px]">
                <span className="font-bold text-gray-700 block">Esnaf Bilgisi:</span>
                <span className="text-orange-700 font-bold">{profile?.name || 'Esnaf'}</span>
                <code className="text-gray-500 block font-mono text-[10px] mt-0.5">{user?.uid || 'esnaf_uid_101'}</code>
              </div>
            </div>

            <button
              onClick={() => {
                const text = `Merhaba Koordinatör, "${profile?.isyeri || profile?.name || 'Esnaf'}" olarak Dijital Mutlular teklif kredisi satın almak istiyorum. UID: ${user?.uid || 'demo_esnaf'}`;
                openWhatsApp(ADMIN_PHONE, text);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp ile Kredi Talep Et
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: GİRİŞ & KAYIT ── */}
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

      {/* ── MODAL: PROFİL & İLETİŞİM BİLGİLERİNİ GÜNCELLE ── */}
      {showProfileEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Profil Bilgilerini Düzenle</h3>
                <p className="text-xs text-gray-500">İletişim ve rol bilgilerinizi güncelleyin</p>
              </div>
              <button onClick={() => setShowProfileEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Profil Fotoğrafı / Avatarı */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500 shadow-xs shrink-0 bg-white flex items-center justify-center">
                    <img
                      src={editPhotoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editName || 'Sakin')}&backgroundColor=dc2626`}
                      alt="Profil Önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editName || 'Sakin')}&backgroundColor=dc2626`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Profil Fotoğrafı
                    </label>
                    <span className="text-[10px] text-slate-400 block">
                      Üstte ve paylaşımlarda görünecek yuvarlak görsel
                    </span>
                  </div>
                </div>

                <PhotoUploadField value={editPhotoURL} onChange={setEditPhotoURL} round folder="mutlular_haber/avatars" buttonLabel="Profil Fotoğrafı Yükle" accentClass="bg-red-600 hover:bg-red-700 text-white" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Telefon Numarası (WhatsApp İletişim)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Rol / Üyelik Türü</label>
                <select
                  value={editRole === 'sakin' ? 'sakin' : editHesapTipi}
                  onChange={(e) => {
                    const v = e.target.value as 'sakin' | 'usta' | 'esnaf';
                    if (v === 'sakin') {
                      setEditRole('sakin');
                    } else {
                      setEditRole('esnaf');
                      if (v !== editHesapTipi) {
                        setEditHesapTipi(v);
                        setEditEsnafKategori(v === 'usta' ? ALL_SERVICE_CATEGORIES[0].name : ESNAF_TURLERI[0]);
                        setEditCustomArea('');
                      }
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                >
                  <option value="sakin">🏡 Mahalle Sakini</option>
                  <option value="usta">🛠️ Usta (hizmet veriyorum)</option>
                  <option value="esnaf">🏪 Esnaf (dükkanım var)</option>
                </select>
              </div>

              {editRole === 'esnaf' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-amber-950 block">{editHesapTipi === 'usta' ? 'Usta Profil Detayları' : 'Esnaf Profil Detayları'}</span>
                  
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">{editHesapTipi === 'usta' ? 'Usta / Firma Adı' : 'İşletme / Dükkan Ünvanı'}</label>
                    <input
                      type="text"
                      value={editIsyeri}
                      onChange={(e) => setEditIsyeri(e.target.value)}
                      placeholder="Örn: Mutlular Tesisat &amp; Kombi"
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">{editHesapTipi === 'usta' ? 'Faaliyet / Hizmet Alanı' : 'İşletme Türü'}</label>
                    {renderAreaSelect(editHesapTipi, editEsnafKategori, setEditEsnafKategori, editCustomArea, setEditCustomArea)}
                  </div>

                  {/* İşletme Adresi */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">İşletme Adresi</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editAdres}
                        onChange={(e) => setEditAdres(e.target.value)}
                        placeholder="Örn: Mutlular Mah. Fatih Cad. No: 12"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Çalışma Saatleri */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Çalışma Saatleri</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editCalismaSaatleri}
                        onChange={(e) => setEditCalismaSaatleri(e.target.value)}
                        placeholder="Örn: Pzt - Cmt: 08:30 - 19:30"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Uzmanlık Etiketleri (yalnızca usta) */}
                  {editHesapTipi === 'usta' && (
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Uzmanlık Etiketleri</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editUzmanlikEtiketleri.map((t, idx) => (
                        <span key={idx} className="text-[11px] bg-white text-amber-950 px-2 py-0.5 rounded-lg border border-amber-200 font-bold flex items-center gap-1">
                          {t}
                          <button
                            type="button"
                            onClick={() => setEditUzmanlikEtiketleri(editUzmanlikEtiketleri.filter((_, i) => i !== idx))}
                            className="text-red-600 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editUzmanlikInput}
                        onChange={(e) => setEditUzmanlikInput(e.target.value)}
                        placeholder="Etiket ekle..."
                        className="flex-1 text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editUzmanlikInput.trim() && !editUzmanlikEtiketleri.includes(editUzmanlikInput.trim())) {
                            setEditUzmanlikEtiketleri([...editUzmanlikEtiketleri, editUzmanlikInput.trim()]);
                            setEditUzmanlikInput('');
                          }
                        }}
                        className="bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer"
              >
                Bilgileri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ESNAF & USTA KATILIM / HESAP YÜKSELTME SİHİRBAZI ── */}
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

      {/* ── MODAL: MAHALLE PAZARI KAMPANYA & REKLAM YAYINLA ── */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Store className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Mahalle Pazarı Kampanya / Reklam Yayınla</h3>
                  <p className="text-xs text-slate-500">Mahalle sakinlerine özel indirim ve fırsatlarınızı anında vitrine çıkarın.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCampaignModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishCampaign} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dükkan / İşletme Adı <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={campIsyeri}
                    onChange={(e) => setCampIsyeri(e.target.value)}
                    placeholder="Örn: Bereket Kasap & Izgara"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sektör / Kategori <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={campKategori}
                    onChange={(e) => setCampKategori(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Fırın & Unlu Mamül">🥖 Fırın &amp; Unlu Mamül</option>
                    <option value="Kasap & Et Ürünleri">🥩 Kasap &amp; Et Ürünleri</option>
                    <option value="Manav & Organik">🍎 Manav &amp; Organik</option>
                    <option value="Oto Bakım & Hizmet">🚗 Oto Bakım &amp; Hizmet</option>
                    <option value="Çiçek & Bahçe">💐 Çiçek &amp; Bahçe</option>
                    <option value="Kişisel Bakım & Kuaför">✂️ Kişisel Bakım &amp; Kuaför</option>
                    <option value="Bakkal & Şarküteri">🧀 Bakkal &amp; Şarküteri</option>
                    <option value="Kırtasiye & Tuhafiye">📚 Kırtasiye &amp; Tuhafiye</option>
                    <option value="Diğer Mahalle Dükkanı">🏪 Diğer Mahalle Dükkanı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kampanya Başlığı <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={campBaslik}
                  onChange={(e) => setCampBaslik(e.target.value)}
                  placeholder="Örn: 2 Kg Kuşbaşı Alana 1 Paket Kasap Köfte Hediye!"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    İndirim / Fırsat Oranı
                  </label>
                  <input
                    type="text"
                    value={campIndirim}
                    onChange={(e) => setCampIndirim(e.target.value)}
                    placeholder="Örn: %30 İNDİRİM veya 1 ALANA 1 BEDAVA"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rozet Türü
                  </label>
                  <select
                    value={campRozet}
                    onChange={(e) => setCampRozet(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="Günün Fırsatı">🔥 Günün Fırsatı</option>
                    <option value="Haftanın Yıldızı">⭐ Haftanın Yıldızı</option>
                    <option value="Akşam Fırsatı">🌙 Akşam Fırsatı</option>
                    <option value="Komşu İndirimi">🤝 Komşu İndirimi</option>
                    <option value="Açılışa Özel">🎉 Açılışa Özel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kampanya Açıklaması &amp; Şartlar <span className="text-amber-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={campAciklama}
                  onChange={(e) => setCampAciklama(e.target.value)}
                  placeholder="Kampanya şartları, ürün detayları ve mahalleliye özel avantajlar..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dükkan Adresi / Konumu
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={campAdres}
                      onChange={(e) => setCampAdres(e.target.value)}
                      placeholder="Örn: Mutlular Caddesi No: 18"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sipariş / WhatsApp Telefonu <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={campTelefon}
                      onChange={(e) => setCampTelefon(e.target.value)}
                      placeholder="05xx xxx xx xx"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Geçerlilik Süresi
                  </label>
                  <input
                    type="text"
                    value={campGecerlilik}
                    onChange={(e) => setCampGecerlilik(e.target.value)}
                    placeholder="Örn: Pazar Akşamına Kadar veya 30 Eylül"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Fotoğraf (İsteğe Bağlı)
                  </label>
                  <PhotoUploadField value={campFoto} onChange={setCampFoto} folder="mutlular_haber/kampanyalar" accentClass="bg-amber-600 hover:bg-amber-700 text-white" />
                  <p className="text-[10px] text-slate-400 mt-1">Fotoğraf yüklemezseniz dükkan görseli atanır.</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Store className="w-4 h-4" /> Kampanyayı Mahalle Pazarı'nda Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ CENAZE & VEFAT İLANI BIRAK ── */}
      {showNewDeceasedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl text-xl">
                  🕊️
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Vefat &amp; Cenaze İlanı Bırak</h3>
                  <p className="text-xs text-slate-500">Mutlular Mahallesi sakinlerine ve akrabalara taziye duyurusu</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewDeceasedModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishDeceased} className="space-y-3.5">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 font-medium leading-relaxed">
                İlanınız önce <strong>editör onayına</strong> gönderilir. Onaylandığında en üstteki <strong>Vefat &amp; Taziye</strong> şeridinde ve vefat listesinde tüm mahalleye duyurulur.
              </div>

              {/* Merhum / Merhume Adı ve Yaşı */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Merhum / Merhume Adı Soyadı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedName}
                    onChange={(e) => setNewDeceasedName(e.target.value)}
                    placeholder="Örn: Hacı Mehmet Yılmaz"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Yaşı (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={newDeceasedAge}
                    onChange={(e) => setNewDeceasedAge(e.target.value)}
                    placeholder="Örn: 74"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Aile ve Yakınları */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Aile &amp; Taziye Yakınları <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDeceasedFamily}
                  onChange={(e) => setNewDeceasedFamily(e.target.value)}
                  placeholder="Örn: Yılmaz ve Demir Aileleri (Ahmet Yılmaz'ın muhterem pederi)"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>

              {/* Cami ve Cenaze Vakti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cenaze Namazı Camii <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedMosque}
                    onChange={(e) => setNewDeceasedMosque(e.target.value)}
                    placeholder="Örn: Mutlular Fatih Camii"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cenaze Vakti <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newDeceasedPrayer}
                    onChange={(e) => setNewDeceasedPrayer(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-slate-800"
                  >
                    <option value="Öğle Namazını Müteakip">Öğle Namazını Müteakip</option>
                    <option value="İkindi Namazını Müteakip">İkindi Namazını Müteakip</option>
                    <option value="Cuma Namazını Müteakip">Cuma Namazını Müteakip</option>
                    <option value="Sabah 10:30">Sabah 10:30 (Helallik &amp; Mezarlık)</option>
                    <option value="İkindi Öncesi">İkindi Öncesi</option>
                  </select>
                </div>
              </div>

              {/* Mezarlık ve Tarih */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Defin Yeri / Mezarlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedCemetery}
                    onChange={(e) => setNewDeceasedCemetery(e.target.value)}
                    placeholder="Örn: Hamitler Kent Mezarlığı"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tarih
                  </label>
                  <input
                    type="text"
                    value={newDeceasedDate}
                    onChange={(e) => setNewDeceasedDate(e.target.value)}
                    placeholder="Örn: Bugün veya 25 Eylül"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDeceasedModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🕊️</span> Vefat İlanını Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MAHALLE KÜRSÜSÜ YENİ GÖRÜŞ / DERT BİLDİRİMİ ── */}
      {showKursuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-950">Mahalle Kürsüsünde Söz Al</h3>
                  <p className="text-xs text-slate-500">Derdini, önerini veya görüşünü tüm mahalleyle paylaş</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKursuModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishKursu} className="space-y-3.5">
              {/* Kategori Seçimi */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Bildirim Türü / Kategori <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Sorun & Şikayet', label: '🗣️ Sorun & Şikayet', desc: 'Sokak, çöp, altyapı, aydınlatma vb.' },
                    { id: 'Öneri & Fikir', label: '💡 Öneri & Fikir', desc: 'Mahallemizi güzelleştirecek fikirler' },
                    { id: 'Dilek & Talep', label: '📌 Dilek & Talep', desc: 'Belediyeden veya kurumlardan istekler' },
                    { id: 'Teşekkür & Tebrik', label: '👏 Teşekkür & Tebrik', desc: 'Komşulara veya esnafa teşekkür' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setKursuKategori(cat.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        kursuKategori === cat.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-black">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Konu Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kursuBaslik}
                  onChange={(e) => setKursuBaslik(e.target.value)}
                  placeholder="Örn: 104. Sokak çöp konteyneri yenilenmeli veya Barış Parkı aydınlatması"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-900"
                />
              </div>

              {/* Konum / Sokak */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  İlgili Sokak / Konum (Opsiyonel)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={kursuKonum}
                    onChange={(e) => setKursuKonum(e.target.value)}
                    placeholder="Örn: 104. Sokak No: 12 karşısı veya Barış Parkı içi"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Detaylı Açıklama / Dert */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Görüşünüz / Anlatmak İstediğiniz Dert <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={kursuIcerik}
                  onChange={(e) => setKursuIcerik(e.target.value)}
                  placeholder="Yaşadığınız sorunu, mahallemiz için teklifinizi veya düşüncenizi komşularınızın anlayacağı şekilde açıkça yazın..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed text-slate-800"
                />
              </div>

              {/* Fotoğraf Ekleme (Opsiyonel) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Fotoğraf (Opsiyonel)
                </label>
                <PhotoUploadField value={kursuFoto} onChange={setKursuFoto} folder="mutlular_haber/kursus" accentClass="bg-indigo-600 hover:bg-indigo-700 text-white" />
              </div>

              {/* Bilgilendirme kutucuğu */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 flex items-start gap-2">
                <span className="text-base shrink-0">🤝</span>
                <span>
                  Kürsüdeki paylaşımlarınız doğrudan komşularınızın desteğine açılır. Komşular "Ben de Katılıyorum" diyerek sesinizi büyütebilir.
                </span>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKursuModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" /> Kürsüde Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 🟡 MODAL: EMLAK İLAN DETAYI ── */}
      {selectedEmlakItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-300 space-y-4">
            {/* Sarı-Siyah Başlık Barı */}
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between sticky top-0 z-10 border-b border-amber-400">
              <div className="flex items-center gap-3">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase">
                  🏠 Emlak Detayı
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white line-clamp-1">
                    {selectedEmlakItem.baslik}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-medium">
                    İlan No: #{selectedEmlakItem.id ? selectedEmlakItem.id.replace(/\D/g, '').slice(0, 7) || '1049283' : '1049283'} · Mutlular Mahallesi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmlakItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Fotoğraf Galerisi & Fiyat Bandı */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <img
                    src={selectedEmlakItem.fotolar && selectedEmlakItem.fotolar[0] ? selectedEmlakItem.fotolar[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'}
                    alt={selectedEmlakItem.baslik}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                      MÜLK SAHİBİNDEN
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full text-white shadow-md ${
                      selectedEmlakItem.emlakTuru === 'satilik' ? 'bg-emerald-600' : selectedEmlakItem.emlakTuru === 'devren' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {selectedEmlakItem.emlakTuru === 'satilik' ? 'SATILIK' : selectedEmlakItem.emlakTuru === 'devren' ? 'DEVREN' : 'KİRALIK'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md text-amber-400 font-black text-base sm:text-xl px-4 py-1.5 rounded-xl shadow-lg border border-amber-400/40">
                    {selectedEmlakItem.fiyat.toLocaleString('tr-TR')} TL{selectedEmlakItem.emlakTuru === 'kiralik' ? '/ay' : ''}
                  </div>
                </div>
              </div>

              {/* Güven ve Doğrulama Rozeti */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl p-2 bg-amber-100 rounded-xl">🛡️</span>
                <div className="text-xs text-amber-950">
                  <strong className="block font-black text-amber-900">Mahalleli Onaylı Mülk İlanı</strong>
                  Bu taşınmaz doğrudan Mutlular Mahallesi mülk sahibi tarafından komisyonsuz listelenmiştir. Aracısız doğrudan görüşebilirsiniz.
                </div>
              </div>

              {/* Emlak Detaylı Parametre Tablosu */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>İlan Bilgileri &amp; Konut Özellikleri</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">İlan Numarası</span>
                    <span className="font-bold text-slate-900">#{selectedEmlakItem.id ? selectedEmlakItem.id.replace(/\D/g, '').slice(0, 7) || '1049283' : '1049283'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">İlan Tarihi</span>
                    <span className="font-bold text-slate-900">24 Eylül 2026</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Emlak Tipi</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.emlakTuru === 'satilik' ? 'Satılık Daire' : selectedEmlakItem.emlakTuru === 'devren' ? 'Devren Dükkan' : 'Kiralık Daire'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">m² (Brüt / Net)</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.metrekare ? `${selectedEmlakItem.metrekare} m²` : 'Belirtilmemiş'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Oda Sayısı</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.odaSayisi || '3+1'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Bulunduğu Kat</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.kat || '2. Kat (Ara Kat)'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Bina Yaşı</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.binaYasi || '4 Yıllık'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Isıtma Tipi</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.isitma || 'Kombi Doğalgaz'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Balkon / Asansör</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.balkon !== false ? 'Balkon Var' : 'Yok'} · {selectedEmlakItem.asansor !== false ? 'Asansörlü' : 'Asansörsüz'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Otopark / Aidat</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.otopark !== false ? 'Açık Otopark' : 'Sokak'}{selectedEmlakItem.aidat ? ` · ₺${selectedEmlakItem.aidat}/ay` : ''}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Kimden</span>
                    <span className="font-bold text-emerald-700">Mülk Sahibi (Komisyonsuz)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Konum</span>
                    <span className="font-bold text-slate-900 truncate">Mutlular Mah. Yıldırım / Bursa</span>
                  </div>
                </div>
              </div>

              {/* İlan Açıklaması */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Açıklama</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedEmlakItem.aciklama}
                </div>
              </div>

              {/* Mülk Sahibi İletişim Kartı & Aksiyon Butonları */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
                    {selectedEmlakItem.saticiAdi.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h5 className="font-black text-sm">{selectedEmlakItem.saticiAdi}</h5>
                    <p className="text-[11px] text-slate-400">Mülk Sahibi · Mutlular Mahallesi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openWhatsApp(
                      selectedEmlakItem.saticiTelefon,
                      `Merhaba ${selectedEmlakItem.saticiAdi}, Mutlular Mahallesi emlak vitrinindeki "${selectedEmlakItem.baslik}" (${selectedEmlakItem.fiyat.toLocaleString('tr-TR')} TL) ilanınız için görüşmek istiyorum.`
                    )}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                  <button
                    onClick={() => openDialer(selectedEmlakItem.saticiTelefon)}
                    className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> Ara
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 🔴 MODAL: 2. EL EŞYA DETAY & CANLI SOHBET / TEKLİF ── */}
      {selectedLetgoItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-300 space-y-4">
            {/* Kırmızı Başlık Barı */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="bg-white text-rose-600 font-black text-xs px-2.5 py-1 rounded-xl shadow-xs uppercase">
                  2. El Eşya
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base line-clamp-1">{selectedLetgoItem.baslik}</h3>
                  <p className="text-[11px] text-rose-100 font-medium">📍 250m yakınında · Mutlular Mahallesi</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLetgoItem(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Fotoğraf & Durum Rozeti */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img
                    src={selectedLetgoItem.fotolar && selectedLetgoItem.fotolar[0] ? selectedLetgoItem.fotolar[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedLetgoItem.baslik}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                      {selectedLetgoItem.durum === 'sifir' ? 'Sıfır / Kutulu' : selectedLetgoItem.durum === 'az_kullanilmis' ? 'Yeni Gibi' : 'İkinci El'}
                    </span>
                    <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                      Pazarlık Payı Var 🤝
                    </span>
                  </div>

                  <div className={`absolute bottom-3 left-3 font-black text-base sm:text-lg px-4 py-1.5 rounded-xl shadow-lg ${
                    selectedLetgoItem.fiyat === 0 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 border border-slate-200'
                  }`}>
                    {selectedLetgoItem.fiyat === 0 ? '🎁 ÜCRETSİZ' : `${selectedLetgoItem.fiyat.toLocaleString('tr-TR')} TL`}
                  </div>
                </div>
              </div>

              {/* Satıcı Bilgisi */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 font-black text-lg flex items-center justify-center shrink-0 border border-rose-200">
                    {selectedLetgoItem.saticiAdi.charAt(0) || 'K'}
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-slate-900">{selectedLetgoItem.saticiAdi}</h5>
                    <p className="text-[11px] text-slate-500">Mutlular Mah. Sakini · Yanıt süresi: 10 dakika</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  ✓ Güvenilir Komşu
                </span>
              </div>

              {/* Açıklama */}
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">Ürün Açıklaması</span>
                <p className="text-xs text-slate-700 leading-relaxed p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {selectedLetgoItem.aciklama}
                </p>
              </div>

              {/* ⚡ HIZLI TEKLİF & PAZARLIK ALANI */}
              <div className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <span>⚡</span> <span>Tek Tıkla Teklif Ver:</span>
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold">Anında Satıcıya İletilir</span>
                </div>

                {selectedLetgoItem.fiyat > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      Math.max(50, Math.round((selectedLetgoItem.fiyat * 0.8) / 50) * 50),
                      Math.max(50, Math.round((selectedLetgoItem.fiyat * 0.88) / 50) * 50),
                      Math.max(50, Math.round((selectedLetgoItem.fiyat * 0.95) / 50) * 50),
                    ].map((offerVal, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          openWhatsApp(
                            selectedLetgoItem.saticiTelefon,
                            `Merhaba ${selectedLetgoItem.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${selectedLetgoItem.baslik}" için ${offerVal.toLocaleString('tr-TR')} TL teklif ediyorum. Ne dersiniz?`
                          );
                          showToast(`${offerVal.toLocaleString('tr-TR')} TL teklifiniz WhatsApp üzerinden iletiliyor! ⚡`);
                        }}
                        className="bg-white hover:bg-rose-600 hover:text-white text-slate-800 border border-rose-200 font-black text-xs py-2 px-3 rounded-xl transition-all shadow-2xs text-center cursor-pointer"
                      >
                        {offerVal.toLocaleString('tr-TR')} TL Teklif Et
                      </button>
                    ))}
                  </div>
                )}

                {/* Hızlı Soru Butonları */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Hala satılık mı?',
                    'Fiyatta son ne olur?',
                    'Bugün teslim alabilir miyim?',
                    'Çalışır durumda mı?'
                  ].map((msg, mIdx) => (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => {
                        openWhatsApp(
                          selectedLetgoItem.saticiTelefon,
                          `Merhaba ${selectedLetgoItem.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${selectedLetgoItem.baslik}" için sormak istiyorum: ${msg}`
                        );
                        showToast(`"${msg}" mesajınız satıcıya iletiliyor.`);
                      }}
                      className="text-[11px] font-bold bg-white text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      💬 {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Satıcıyla Doğrudan İletişim Butonları */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => openWhatsApp(
                    selectedLetgoItem.saticiTelefon,
                    `Merhaba ${selectedLetgoItem.saticiAdi}, Mutlular Mahallesi ilanınızdaki "${selectedLetgoItem.baslik}" için yazıyorum. Ürün hala satılık mı?`
                  )}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Satıcıyla WhatsApp'ta Konuş
                </button>
                <button
                  onClick={() => openDialer(selectedLetgoItem.saticiTelefon)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Ara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 🛠️ MODAL: 3 KOLAY SORUDA FİYAT TEKLİFİ AL SİHİRBAZI ── */}
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

      {/* ── ŞEHİR HİZMETLERİ MODALLARI (ECZANE, NOTER, TAKSİ, OTOBÜS, VEFAT, GEZİLECEK, YEMEK, İŞ, ETKİNLİK) ── */}
      <CityServicesModal
        activeModal={activeCityModal}
        onClose={() => setActiveCityModal(null)}
        onShowToast={showToast}
        deceasedList={deceasedList}
        onOpenAddDeceased={() => setShowNewDeceasedModal(true)}
        canDeleteDeceased={canDeleteDeceased}
        onDeleteDeceased={handleDeleteDeceased}
        myDeceasedPending={myDeceased.filter((d: any) => d.status === 'pending' || d.status === 'rejected')}
      />

      {/* ── 🚨 ACİL DURUM VE HIZLI ÇAĞRI MODALI ── */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-red-200">
            {/* Başlık */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 bg-white/20 rounded-2xl">🚨</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">Acil Numaralar &amp; Önemli Hatlar</h3>
                  <p className="text-[11px] text-red-100 font-medium">Mutlular Mahallesi &amp; Bursa 7/24 Kesintisiz Hatlar</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İçerik */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* En Kritik: 112 */}
              <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    112
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-red-950">Tek Acil Çağrı Merkezi</h4>
                    <p className="text-[11px] text-red-700">Ambulans, İtfaiye, Polis, Jandarma, AFAD</p>
                  </div>
                </div>
                <a
                  href="tel:112"
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> Ara
                </a>
              </div>

              {/* Diğer Hizmet Numaraları Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: 'Mutlular Muhtarlığı',
                    sub: 'Mahalle Hizmetleri & Teyit',
                    phone: '0224 246 12 34',
                    tel: '02242461234',
                    icon: '🏛️',
                    bg: 'bg-blue-50 border-blue-200 text-blue-900',
                    btn: 'bg-blue-600'
                  },
                  {
                    title: 'Bursa BUSKİ Su Arıza',
                    sub: 'Patlak, Kesinti & Kanalizasyon',
                    phone: '185',
                    tel: '185',
                    icon: '💧',
                    bg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
                    btn: 'bg-cyan-600'
                  },
                  {
                    title: 'UEDAŞ Elektrik Arıza',
                    sub: 'Sokak Lambası & Elektrik Kesintisi',
                    phone: '186',
                    tel: '186',
                    icon: '⚡',
                    bg: 'bg-amber-50 border-amber-200 text-amber-900',
                    btn: 'bg-amber-600'
                  },
                  {
                    title: 'Bursagaz Doğalgaz Acil',
                    sub: 'Gaz Kaçağı & Acil Müdahale',
                    phone: '187',
                    tel: '187',
                    icon: '🔥',
                    bg: 'bg-orange-50 border-orange-200 text-orange-900',
                    btn: 'bg-orange-600'
                  },
                  {
                    title: 'Emek Polis Karakolu',
                    sub: 'Bölge Asayiş & Güvenlik',
                    phone: '0224 243 00 12',
                    tel: '02242430012',
                    icon: '🚓',
                    bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                    btn: 'bg-indigo-600'
                  },
                  {
                    title: 'Belediye Çağrı / Zabıta',
                    sub: 'Şikayet, Çevre & Zabıta',
                    phone: '444 16 00',
                    tel: '4441600',
                    icon: '🏢',
                    bg: 'bg-slate-50 border-slate-200 text-slate-900',
                    btn: 'bg-slate-700'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${item.bg} flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs truncate">{item.title}</h5>
                        <p className="text-[10px] opacity-75 truncate">{item.phone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${item.tel}`}
                      className={`${item.btn} hover:opacity-90 text-white font-black text-[11px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition-all shadow-xs`}
                    >
                      <Phone className="w-3 h-3" /> Ara
                    </a>
                  </div>
                ))}
              </div>

              {/* Kapat Butonu */}
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer text-center"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 📺 MUTLULAR TV CANLI YAYIN MODALI (yönetici / editör tarafından yönetilir) ── */}
      {mutlularTvActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            onClick={() => setMutlularTvActive(false)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
          />

          <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {liveConfig.aktif ? (
                  <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    CANLI
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-200 font-black text-[11px] px-2.5 py-0.5 rounded-lg">KAPALI</span>
                )}
                <span className="font-black text-sm text-slate-100 tracking-tight">📺 Mutlular TV</span>
              </div>
              <button
                onClick={() => setMutlularTvActive(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {liveConfig.aktif && liveConfig.url ? (
              <>
                {liveEmbedUrl ? (
                  <div className="relative aspect-[16/9] w-full bg-black">
                    <iframe
                      src={liveEmbedUrl}
                      title={liveConfig.baslik || 'Mutlular TV Canlı Yayın'}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-slate-900 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="text-4xl">📡</div>
                    <p className="text-xs text-slate-300">Bu yayın uygulama içinde oynatılamıyor. Yayını yeni sekmede açabilirsiniz.</p>
                    <a
                      href={liveConfig.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black"
                    >
                      Yayını Aç ↗
                    </a>
                  </div>
                )}
                <div className="p-4 space-y-1.5 overflow-y-auto bg-slate-900/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">ŞU AN YAYINDA</span>
                  <h3 className="font-black text-base sm:text-lg text-white leading-snug">{liveConfig.baslik || 'Mutlular Mahallesi Canlı Yayını'}</h3>
                  {liveConfig.aciklama && <p className="text-xs text-slate-400 leading-relaxed">{liveConfig.aciklama}</p>}
                  {liveEmbedUrl && (
                    <a href={liveConfig.url} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] font-bold text-slate-400 hover:text-white underline pt-1">
                      Yayın oynatılmazsa yeni sekmede aç ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-900/60">
                <div className="text-5xl">📺</div>
                <h3 className="font-black text-base text-white">Şu an canlı yayın yok</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cenaze namazı, mahalle toplantısı veya özel bir etkinlik olduğunda yayın burada açılır. Yayın başladığında üstteki düğme kırmızı yanar.
                </p>
                {(isUserAdmin || isUserEditor) && (
                  <button
                    type="button"
                    onClick={() => { setMutlularTvActive(false); setShowAdminPanelModal(true); }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-white cursor-pointer border border-white/10"
                  >
                    Yayını Yönet
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
        onOpenCityModal={(modal) => setActiveCityModal(modal)}
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
