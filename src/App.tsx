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
  type User,
  type UserProfile,
  type UserRole,
  type NewsNotificationPreferences,
  type ServiceRequest,
  type ServiceOffer,
  type MarketplaceItem,
  type LostFoundItem,
  type NewsItem,
  type EsnafCampaign,
  type MahalleKursusuItem,
  type MahalleDavetItem,
  type MahalleDavetTebrik
} from './firebase';
import {
  INITIAL_NEWS,
  INITIAL_MARKETPLACE,
  INITIAL_LOST_FOUND,
  INITIAL_SERVICES,
  INITIAL_CAMPAIGNS,
  INITIAL_KURSUS,
  INITIAL_INVITATIONS,
  INITIAL_USERS,
  type SampleNewsItem
} from './mockNeighborhoodData';
import { MutlularAdminEditorPanel } from './MutlularAdminEditorPanel';
import {
  PHARMACIES,
  NOTARIES,
  TAXI_STANDS,
  BUS_ROUTES,
  DECEASED_ITEMS,
  TOURIST_SPOTS,
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

const ADMIN_PHONE = '905321112233'; // Dijital Mutlular / Mutlular Haber Portalı Koordinatör WhatsApp Hattı

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

export const VERIFIED_MASTERS: VerifiedMaster[] = [
  {
    id: 'master_mehmet_elektrik',
    name: 'Mehmet Usta',
    businessName: 'Mehmet Usta Elektrik Tesisatı & Arıza',
    mainCategoryId: 'elektrik_aydinlatma_elektronik',
    mainCategoryName: 'Elektrik & Aydınlatma',
    subCategories: ['Elektrik Tesisatı', 'Arıza Tespiti ve Onarım', 'Kombi Elektrik Bağlantısı', 'Aydınlatma Sistemleri', 'Tadilat ve Montaj'],
    phone: '05342223355',
    whatsapp: '905342223355',
    rating: 4.9,
    reviewCount: 128,
    experience: '18 Yıllık Mahalle Elektrikçisi',
    address: 'Mehmet Akif Mah. / Osmangazi',
    badge: '7/24 Ulaşılabilir',
    avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    desc: 'Mahallemizin onaylı elektrik ustası. Ev ve iş yeri tesisatı, avize/LED montajı, sigorta kutusu değişimi, kombi elektrik hattı ve acil arıza tamiri.',
    servicesHighlight: ['Elektrik Tesisatı', 'Arıza Tespiti ve Onarım', 'Kombi Elektrik Bağlantısı', 'Aydınlatma Sistemleri', 'Tadilat ve Montaj']
  },
  {
    id: 'master_ali_tesisat',
    name: 'Ali Tesisat',
    businessName: 'Ali Usta Su Tesisatı & Doğalgaz',
    mainCategoryId: 'tesisat_su_isitma',
    mainCategoryName: 'Su Tesisatı & Doğalgaz',
    subCategories: ['Su Tesisatı & Doğalgaz', 'Kırmadan Kaçak Tespiti', 'Tıkalı Gider Açma', 'Petek & Kombi Bakımı'],
    phone: '05321112244',
    whatsapp: '905321112244',
    rating: 4.8,
    reviewCount: 96,
    experience: '15 Yıllık Tesisat & Doğalgaz Ustası',
    address: 'Mehmet Akif Mah. / Osmangazi',
    badge: 'Cihazla Kırmadan Tespit',
    avatar: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    desc: 'Termal kamera ve akustik dinleme ile kırmadan su kaçağı bulma, doğalgaz proje/montaj, tıkalı mutfak/banyo gideri açma.',
    servicesHighlight: ['Su Kaçağı Bulma', 'Tıkalı Gider Açma', 'Doğalgaz Tesisatı', 'Batarya Montajı']
  },
  {
    id: 'master_berk_boya',
    name: 'Berk Boya',
    businessName: 'Berk Usta Boya & Badana Dekorasyon',
    mainCategoryId: 'ev_tadilat_boya_marangoz',
    mainCategoryName: 'Boya & Badana',
    subCategories: ['Boya Badana', 'Alçı & Kartonpiyer', 'Duvar Kağıdı', 'Dış Cephe'],
    phone: '05363334466',
    whatsapp: '905363334466',
    rating: 4.7,
    reviewCount: 73,
    experience: '12 Yıllık Boya & Dekorasyon Deneyimi',
    address: 'Mehmet Akif Mah. / Osmangazi',
    badge: 'Temiz & Eşyaları Koruyarak Teslim',
    avatar: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    desc: '1 günde temiz daire boyama, silinebilir kaliteli boyalar, zemin ve mobilya maskeleme garantisi.',
    servicesHighlight: ['Daire Boyama', 'Alçı Tamiratı', 'Eşya Koruma', 'Silinebilir Boya']
  },
  {
    id: 'master_temizlik_hanim',
    name: 'Temizlik Hanım',
    businessName: 'Temizlik Hanım Ev & Ofis Temizliği',
    mainCategoryId: 'temizlik_yikama_ilaclama',
    mainCategoryName: 'Ev & Ofis Temizliği',
    subCategories: ['Ev & Ofis Temizliği', 'Koltuk & Yatak Yıkama', 'Boş Daire Taşınma Temizliği', 'İnşaat Sonrası'],
    phone: '05374445577',
    whatsapp: '905374445577',
    rating: 4.9,
    reviewCount: 54,
    experience: '8 Yıllık Hijyen & Temizlik Ekibi',
    address: 'Mehmet Akif Mah. / Osmangazi',
    badge: 'Güvenilir & Referanslı',
    avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    desc: 'Detaylı ev temizliği, taşınma öncesi boş ev temizliği, profesyonel buharlı koltuk ve yatak yıkama.',
    servicesHighlight: ['Ev Temizliği', 'Buharlı Koltuk Yıkama', 'Cam & Balkon', 'Taşınma Temizliği']
  },
  {
    id: 'master_suheyla',
    name: 'Süheyla Hanım',
    businessName: 'Süheyla Butik Pasta & Organizasyon',
    mainCategoryId: 'dugun_organizasyon',
    mainCategoryName: 'Düğün, Nişan & Doğum Günü',
    subCategories: ['Pasta & Tatlı Siparişi', 'Masa & Mekan Süsleme', 'Catering & İkramlıklar'],
    phone: '05327778811',
    whatsapp: '905327778811',
    rating: 4.9,
    reviewCount: 48,
    experience: '8 Yıllık Mahalle Butik Pastacısı',
    address: 'Mutlular Mah. Gül Sokak No: 14',
    badge: '👑 Onaylı Butik Pastacı',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    desc: 'Katlı nişan pastası, 1 yaş ve çocuk konsept yaş pastaları, cupcake, şeker hamurlu kurabiyeler ve nişan masası süslemeleri.',
    servicesHighlight: ['Nişan Pastası', 'Doğum Günü Pastası', 'Cupcake & Kurabiye', 'Masa Süsleme']
  },
  {
    id: 'master_ahmet_organizasyon',
    name: 'Ahmet Bey',
    businessName: 'Mutlular Masa, Sandalye & Ekipman Kiralama',
    mainCategoryId: 'dugun_organizasyon',
    mainCategoryName: 'Düğün, Nişan & Doğum Günü',
    subCategories: ['Masa Sandalye Kiralama', 'Ses Sistemi & DJ / Müzik', 'Masa & Mekan Süsleme'],
    phone: '05338889922',
    whatsapp: '905338889922',
    rating: 5.0,
    reviewCount: 64,
    experience: '15 Yıllık Organizasyon & Kiralama',
    address: 'Mutlular Cad. No: 42 (Pazar Yeri Karşısı)',
    badge: '⚡ Hızlı Nakliye & Kurulum',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    desc: 'Ev bahçesi, sokak veya salon cemiyetleri için beyaz tiffany sandalyeler, yuvarlak banket masalar, kokteyl masaları ve ses sistemi.',
    servicesHighlight: ['Tiffany Sandalye', 'Bistro Kokteyl Masası', 'Banket Masa', 'Ses Sistemi & Mikrofon']
  },
  {
    id: 'master_zeynep_abiye',
    name: 'Zeynep Hanım',
    businessName: 'Zeynep Moda Evi & Abiye Kiralama',
    mainCategoryId: 'dugun_organizasyon',
    mainCategoryName: 'Düğün, Nişan & Doğum Günü',
    subCategories: ['Abiye & Kıyafet Kiralama', 'Terzi & Kıyafet Tadilatı'],
    phone: '05359990033',
    whatsapp: '905359990033',
    rating: 4.8,
    reviewCount: 36,
    experience: '10 Yıllık Moda & Dikim Evi',
    address: 'Mutlular Çınar Meydanı No: 8/B',
    badge: '✨ Kuru Temizlemeli Teslim',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    desc: 'Söz, nişan, mezuniyet ve düğün davetleri için tasarım abiyeler, kına kaftanları, bindallı modelleri ve vücuda özel prova tadilatı.',
    servicesHighlight: ['Nişan Abiyesi', 'Kına Kaftanı & Bindallı', 'Tadilat & Beden Ayarı', 'Aksesuar Temini']
  },
  {
    id: 'master_masal_susleme',
    name: 'Derya Hanım',
    businessName: 'Masal Organizasyon & Konsept Süsleme',
    mainCategoryId: 'dugun_organizasyon',
    mainCategoryName: 'Düğün, Nişan & Doğum Günü',
    subCategories: ['Masa & Mekan Süsleme', 'Fotoğraf & Video Çekimi'],
    phone: '05391234567',
    whatsapp: '905391234567',
    rating: 4.9,
    reviewCount: 41,
    experience: '7 Yıllık Etkinlik Tasarımcısı',
    address: 'Mutlular Mah. Bahar Sokak No: 3',
    badge: '🎈 Trend Konsept Tasarım',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    desc: 'Nişan arka fon tagı, ışıklı harfler, organik balon zincirleri, pleksi isimlikler, şamdan ve çiçek aranjmanları.',
    servicesHighlight: ['Nişan Masası Tagı', 'Işıklı Rakam & Harf', 'Balon Kemeri', 'Fotoğraf Çekimi']
  },
  {
    id: 'master_mustafa_tesisat',
    name: 'Mustafa Usta',
    businessName: 'Mutlular Su Tesisatı & Termal Kaçak Tespiti',
    mainCategoryId: 'tesisat_su_isitma',
    mainCategoryName: 'Tesisat, Su & Isıtma',
    subCategories: ['Su Kaçağı & Tıkalı Gider Açma', 'Musluk, Batarya & Sifon Tamiri', 'Kombi Bakımı & Petek Temizliği'],
    phone: '05321112244',
    whatsapp: '905321112244',
    rating: 4.9,
    reviewCount: 88,
    experience: '22 Yıllık Usta Öğretici',
    address: 'Mutlular Mah. Papatya Sokak No: 5',
    badge: '🔍 Kırmadan Cihazla Tespit',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    desc: 'Akustik dinleme ve termal kamera ile kırmadan su kaçağı bulma, robotla tıkalı lavabo/tuvalet açma, batarya değişimi ve petek temizleme.',
    servicesHighlight: ['Kırmadan Kaçak Tespiti', 'Tıkalı Gider Açma', 'Batarya Montajı', 'Petek Temizliği']
  },
  {
    id: 'master_hasan_elektrik',
    name: 'Hasan Usta',
    businessName: 'Işık Elektrik & Aydınlatma Servisi',
    mainCategoryId: 'elektrik_aydinlatma_elektronik',
    mainCategoryName: 'Elektrik, Aydınlatma & Cihaz',
    subCategories: ['Elektrik Arızası & Sigorta Değişimi', 'Avize Montajı & LED Aydınlatma', 'TV, Çanak Anten & İnternet Kablosu'],
    phone: '05342223355',
    whatsapp: '905342223355',
    rating: 4.9,
    reviewCount: 72,
    experience: '18 Yıllık Mahalle Elektrikçisi',
    address: 'Mutlular Ana Cadde No: 31 (Cami Yanı)',
    badge: '⚡ 7/24 Acil Müdahale',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    desc: 'Ev sigorta atması tamiri, şerit LED ve avize montajı, zayıf akım, internet kablosu çekimi ve merkezi uydu çanak ayarı.',
    servicesHighlight: ['Sigorta Arızası', 'Avize Montajı', 'İnternet Kablolama', 'Çanak Anten Ayarı']
  },
  {
    id: 'master_murat_boya',
    name: 'Murat Usta',
    businessName: 'Gökkuşağı Boya, Badana & Tadilat',
    mainCategoryId: 'ev_tadilat_boya_marangoz',
    mainCategoryName: 'Ev Tadilat, Boya & Marangoz',
    subCategories: ['Boya Badana, Alçı & Duvar Kağıdı', 'Mobilya Montaj & Marangoz', 'Fayans, Seramik & Banyo Tadilatı'],
    phone: '05363334466',
    whatsapp: '905363334466',
    rating: 5.0,
    reviewCount: 56,
    experience: '16 Yıllık Boya & Dekorasyon Ustası',
    address: 'Mutlular Mah. Karanfil Sokak No: 11',
    badge: '🎨 Eşyaları Koruyarak Boyama',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    desc: 'Bütün yerleri ve mobilyaları naylonla koruyarak 1 günde temiz daire boyama, tavan alçısı, çatlak tamiri ve kapı boyama.',
    servicesHighlight: ['1 Günde Temiz Boya', 'Alçı & Çatlak Onarımı', 'Eşya Koruma Örtüsü', 'Silinebilir Boya']
  },
  {
    id: 'master_gulsen_temizlik',
    name: 'Gülşen Hanım',
    businessName: 'Pak Ev & Buharlı Koltuk / Halı Yıkama',
    mainCategoryId: 'temizlik_yikama_ilaclama',
    mainCategoryName: 'Temizlik, Yıkama & İlaçlama',
    subCategories: ['Koltuk, Yatak & Halı Yıkama', 'Ev & Boş Daire Temizliği'],
    phone: '05374445577',
    whatsapp: '905374445577',
    rating: 4.8,
    reviewCount: 42,
    experience: '9 Yıllık Temizlik Şirketi Sahibi',
    address: 'Mutlular Mah. Zambak Sokak No: 7',
    badge: '🌿 Doğal / Antialerjik Ürünler',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    desc: 'Yerinde vakumlu buharlı koltuk, köşe takımı ve yatak yıkama; taşınma öncesi boş daire ve inşaat sonrası detaylı temizlik hizmeti.',
    servicesHighlight: ['Buharlı Koltuk Yıkama', 'Boş Daire Temizliği', 'Yatak Mite Temizliği', 'Cam & Çerçeve']
  },
  {
    id: 'master_ali_cilingir',
    name: 'Ali Usta',
    businessName: 'Güven 7/24 Çilingir & Kamyonet Nakliyat',
    mainCategoryId: 'nakliyat_cilingir_yardim',
    mainCategoryName: 'Nakliyat, Çilingir & Acil Servis',
    subCategories: ['7/24 Çilingir & Kilit Değişimi', 'Şehir İçi Kamyonet & Parça Eşya'],
    phone: '05385556688',
    whatsapp: '905385556688',
    rating: 5.0,
    reviewCount: 95,
    experience: '20 Yıllık Güvenilir Çilingir',
    address: 'Mutlular Merkez No: 18 (Muhtarlık Yanı)',
    badge: '⏱️ 15 Dakikada Adrese Varış',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    desc: 'Kapıda kalan komşularımıza hasarsız kapı açma, çelik kapı göbek değişimi, emniyet kilidi montajı ve mahalle içi parça eşya kamyonet taşımacılığı.',
    servicesHighlight: ['Hasarsız Kapı Açma', 'Çelik Kapı Göbeği', 'Kamyonet Nakliye', '7/24 Nöbetçi Usta']
  }
];

export default function App() {
  // Current user state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [demoRole, setDemoRole] = useState<UserRole>('sakin');
  // Sunucudaki (gerçek) rol. Rol önizleme yalnızca gerçek yöneticiye açıktır ve hiçbir zaman kaydedilmez.
  const [realRole, setRealRole] = useState<UserRole>('sakin');
  // Kayıt / Google girişi sırasında otomatik "sakin" profil oluşturulmasını engeller (yarış durumu)
  const suppressAutoProfileRef = useRef(false);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>(INITIAL_USERS);
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
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'news' | 'davet' | 'market' | 'pazar' | 'lostfound' | 'services' | 'esnaf' | 'meclis' | 'notifications' | 'profile' | 'yemek'>('home');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [activeCityModal, setActiveCityModal] = useState<null | 'eczane' | 'noter' | 'taksi' | 'otobus' | 'vefat' | 'gezilecek' | 'yemek' | 'is' | 'etkinlik' | 'odalar' | 'neleroluyor'>(null);

  // ── TASARIM & ETKİLEŞİM STATE'LERİ (MOCKUP REFERANSI) ──
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(['haber_park', 'h1']);
  const [notifTab, setNotifTab] = useState<'tumu' | 'unread' | 'duyuru'>('tumu');
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      type: 'sondakika',
      title: 'Yeni bir haber paylaşıldı: "Mahallemizde Yeni Park Hizmete Açıldı"',
      category: 'SON DAKİKA',
      time: '2 dk önce',
      read: false,
      badgeColor: 'bg-red-600',
      icon: '🚨'
    },
    {
      id: 'notif_2',
      type: 'duyuru',
      title: 'Belediyeden duyuru: Yol bakım çalışmaları hakkında bilgilendirme.',
      category: 'DUYURU',
      time: '1 saat önce',
      read: true,
      badgeColor: 'bg-purple-600',
      icon: '📢'
    },
    {
      id: 'notif_3',
      type: 'anket',
      title: 'Yeni bir anket eklendi: Sokak lambaları yeterli mi?',
      category: 'ANKET',
      time: '2 saat önce',
      read: true,
      badgeColor: 'bg-emerald-600',
      icon: '📊'
    },
    {
      id: 'notif_4',
      type: 'ilan',
      title: 'İlanınız yayına alındı: 2. El Çalışma Masası.',
      category: 'İLAN',
      time: '3 saat önce',
      read: true,
      badgeColor: 'bg-blue-600',
      icon: '🏷️'
    }
  ]);

  // ── 📺 MUTLULAR TV & VİTRİN STATE'LERİ ──
  const [mutlularTvActive, setMutlularTvActive] = useState<boolean>(false);
  const [vitrinIndex, setVitrinIndex] = useState<number>(0);
  const [tvMuted, setTvMuted] = useState<boolean>(true);
  const [tvLikes, setTvLikes] = useState<number>(184);
  const [hasLikedTv, setHasLikedTv] = useState<boolean>(false);
  const [homeNewsCategoryFilter, setHomeNewsCategoryFilter] = useState<string>('tumu');

  // ── 🛍️ MUTLULAR ALIM SATIM (BİRLEŞİK / DİREKT YAYIN) STATE'LERİ ──
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>('all');
  const [marketUnifiedSort, setMarketUnifiedSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  interface PollItem {
    id: string;
    title: string;
    category: 'ulasim' | 'cevre' | 'sosyal';
    icon: string;
    evetCount: number;
    hayirCount: number;
    userVote: 'evet' | 'hayir' | null;
  }

  // Mahalle Meclisi (Canlı Anketler & Gündem)
  const [meclisFilter, setMeclisFilter] = useState<'tumu' | 'guncel' | 'cevre' | 'ulasim' | 'sosyal'>('tumu');
  const [polls, setPolls] = useState<PollItem[]>(() => {
    try {
      const saved = localStorage.getItem('dijitalmutlular_polls_v2');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'poll_lamp',
        title: 'Sokak lambaları yeterli mi? (Gece aydınlatması güçlendirilmeli mi?)',
        category: 'ulasim',
        icon: '🏮',
        evetCount: 228,
        hayirCount: 84,
        userVote: 'evet' as 'evet' | 'hayir' | null
      },
      {
        id: 'poll_green',
        title: 'Mahallemizde daha fazla yeşil alan ve çocuk parkı oluşturulmalı mı?',
        category: 'cevre',
        icon: '🌳',
        evetCount: 312,
        hayirCount: 16,
        userVote: null as 'evet' | 'hayir' | null
      },
      {
        id: 'poll_market',
        title: 'Mutlular kapalı pazar yerinde organik üretici ve kadın emeği pazarı açılsın mı?',
        category: 'sosyal',
        icon: '🧺',
        evetCount: 294,
        hayirCount: 22,
        userVote: null as 'evet' | 'hayir' | null
      }
    ];
  });

  const handleVotePoll = (pollId: string, choice: 'evet' | 'hayir') => {
    setPolls((prev: PollItem[]) => {
      const updated = prev.map((p: PollItem) => {
        if (p.id !== pollId) return p;
        if (p.userVote === choice) {
          return {
            ...p,
            evetCount: choice === 'evet' ? Math.max(0, p.evetCount - 1) : p.evetCount,
            hayirCount: choice === 'hayir' ? Math.max(0, p.hayirCount - 1) : p.hayirCount,
            userVote: null
          };
        }
        let evet = p.evetCount;
        let hayir = p.hayirCount;
        if (p.userVote === 'evet') evet = Math.max(0, evet - 1);
        if (p.userVote === 'hayir') hayir = Math.max(0, hayir - 1);
        if (choice === 'evet') evet++;
        if (choice === 'hayir') hayir++;
        return {
          ...p,
          evetCount: evet,
          hayirCount: hayir,
          userVote: choice
        };
      });
      try {
        localStorage.setItem('dijitalmutlular_polls_v2', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Oyunuz "${choice === 'evet' ? 'Evet' : 'Hayır'}" olarak kaydedildi! 🗳️`);
  };

  // Haber Yıldız Puanı & Yorumlar
  const [newsRatingMap, setNewsRatingMap] = useState<Record<string, { rating?: number; score: number; count: number; userRating?: number }>>({
    'haber_park': { score: 4.8, rating: 4.8, count: 124, userRating: 5 },
    'default': { score: 4.8, rating: 4.8, count: 86 }
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, Array<{
    id: string;
    author?: string;
    authorName?: string;
    avatar?: string;
    authorAvatar?: string;
    time?: string;
    timeAgo?: string;
    rating?: number;
    stars?: number;
    badge?: string;
    text: string;
    likes: number;
    userLiked?: boolean;
  }>>>({
    'haber_park': [
      {
        id: 'c1',
        author: 'Ayşe Yılmaz',
        authorName: 'Ayşe Yılmaz',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        time: '2 dk önce',
        timeAgo: '2 dk önce',
        rating: 5,
        stars: 5,
        badge: 'MAHALLE YORUMU',
        text: 'Harika bir gelişme! Çocuklar çok mutlu oldu. Emeği geçen herkese teşekkürler.',
        likes: 12,
        userLiked: false
      },
      {
        id: 'c2',
        author: 'Mehmet Demir',
        authorName: 'Mehmet Demir',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        time: '15 dk önce',
        timeAgo: '15 dk önce',
        rating: 5,
        stars: 5,
        text: 'Çok güzel düşünülmüş, özellikle yürüyüş yolları çok kullanışlı.',
        likes: 5,
        userLiked: false
      }
    ]
  });
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
  const [newsItems, setNewsItems] = useState<SampleNewsItem[]>(INITIAL_NEWS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(INITIAL_LOST_FOUND);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(INITIAL_SERVICES);
  const [campaigns, setCampaigns] = useState<EsnafCampaign[]>(INITIAL_CAMPAIGNS);
  const [offersMap, setOffersMap] = useState<Record<string, ServiceOffer[]>>({});

  // ── 💍 MAHALLE CEMİYET & DAVETLERİ STATE ──
  const [invitationItems, setInvitationItems] = useState<MahalleDavetItem[]>(INITIAL_INVITATIONS);
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
    const mainCat = MAIN_SERVICE_CATEGORIES.find(c => c.id === mainCatId) || MAIN_SERVICE_CATEGORIES[0];
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
    const matchedMain = MAIN_SERVICE_CATEGORIES.find(c => 
      c.name.toLowerCase() === sectorName.toLowerCase() ||
      c.shortTitle.toLowerCase() === sectorName.toLowerCase() ||
      c.subCategories.some(s => s.name.toLowerCase().includes(sectorName.toLowerCase()))
    ) || MAIN_SERVICE_CATEGORIES[0];

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
  const [kursuItems, setKursuItems] = useState<MahalleKursusuItem[]>(INITIAL_KURSUS);
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
  const [authRole, setAuthRole] = useState<'sakin' | 'esnaf'>('sakin');
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
  const [editVergiLevhasiFoto, setEditVergiLevhasiFoto] = useState('');
  const [editUzmanlikEtiketleri, setEditUzmanlikEtiketleri] = useState<string[]>([]);
  const [editUzmanlikInput, setEditUzmanlikInput] = useState('');
  const [editEsnafAciklama, setEditEsnafAciklama] = useState('');

  // ── ESNAF & USTA KATILIM / HESAP YÜKSELTME SİHİRBAZI STATE ──
  const [showArtisanRegisterModal, setShowArtisanRegisterModal] = useState(false);
  const [artisanBusinessName, setArtisanBusinessName] = useState('');
  const [artisanCategory, setArtisanCategory] = useState('Tesisat & Su');
  const [artisanAddress, setArtisanAddress] = useState('Mutlular Mahallesi, Yıldırım / Bursa');
  const [artisanWorkingHours, setArtisanWorkingHours] = useState('Pazartesi - Cumartesi: 08:30 - 19:30');
  const [artisanTaxPlatePhoto, setArtisanTaxPlatePhoto] = useState('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
  const [artisanTags, setArtisanTags] = useState<string[]>(['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
  const [artisanTagInput, setArtisanTagInput] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanDescription, setArtisanDescription] = useState('Mutlular Mahallesi sakinlerine profesyonel ve garantili usta hizmeti sunmaktayız.');
  const [artisanRegisterEmail, setArtisanRegisterEmail] = useState('');
  const [artisanRegisterPassword, setArtisanRegisterPassword] = useState('');
  const [artisanRegisterName, setArtisanRegisterName] = useState('');
  const [artisanIsSubmitting, setArtisanIsSubmitting] = useState(false);

  // Mahalle Pazarı / Esnaf Kampanya Form State
  const [campIsyeri, setCampIsyeri] = useState('Mutlular Taş Fırını');
  const [campKategori, setCampKategori] = useState('Fırın & Unlu Mamül');
  const [campBaslik, setCampBaslik] = useState('Akşam 19:00 Sonrası Tüm Sıcak Ekmek ve Pidelerde %30 İndirim!');
  const [campAciklama, setCampAciklama] = useState('Günün taze taş fırın ekmekleri, simit ve ramazan pidelerinde komşularımıza özel akşam indirimi başlamıştır. İsrafı önlüyor, bereketi paylaşıyoruz.');
  const [campIndirim, setCampIndirim] = useState('%30 İNDİRİM');
  const [campRozet, setCampRozet] = useState('Akşam Fırsatı');
  const [campAdres, setCampAdres] = useState('Mutlular Caddesi No: 14');
  const [campTelefon, setCampTelefon] = useState('0532 999 88 77');
  const [campGecerlilik, setCampGecerlilik] = useState('Her Gün 19:00 - 22:00');
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
  const [deceasedList, setDeceasedList] = useState(DECEASED_ITEMS);
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
    const cleanPath = url.pathname + (url.search ? url.search : '');
    window.history.pushState({}, '', cleanPath);
  };

  const getNewsShareUrl = (news: SampleNewsItem) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?haber=${news.id || encodeURIComponent(news.baslik)}`;
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
            setProfile(data);
            setDemoRole(data.role);
            setRealRole(data.role);
          } else if (!suppressAutoProfileRef.current) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || (isUserAdmin ? 'Yakup Bey (Yönetici)' : currentUser.email || 'Mahalle Sakini'),
              email: currentUser.email || '',
              role: isUserAdmin ? 'admin' : 'sakin',
              credits: isUserAdmin ? 9999 : 0,
              isApproved: true,
              newsNotificationPreferences: newsNotifPrefs,
              createdAt: new Date(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
            setDemoRole(newProfile.role);
            setRealRole(newProfile.role);
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

    // Service Requests
    const qReq = query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      {
        const seen = new Set<string>();
        const items: ServiceRequest[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = data.baslik || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as ServiceRequest);
          }
        });
        setServiceRequests(items);
      }
    }, (err) => console.warn('service firestore:', err.message));

    // Offers
    const qOffers = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubOffers = onSnapshot(qOffers, (snap) => {
      const map: Record<string, ServiceOffer[]> = {};
      snap.forEach((d) => {
        const o = { ...d.data(), id: d.id } as ServiceOffer;
        if (!map[o.requestId]) map[o.requestId] = [];
        map[o.requestId].push(o);
      });
      setOffersMap(map);
    }, (err) => console.warn('offers firestore:', err.message));

    // Campaigns / Mahalle Pazarı
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
    const qDeceased = query(collection(db, 'cenaze_ilanlari'), orderBy('createdAt', 'desc'));
    const unsubDeceased = onSnapshot(qDeceased, (snap) => {
      {
        const seen = new Set<string>();
        const items: DeceasedItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const key = (data.fullName + '-' + data.dateStr) || data.id || d.id;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ ...data, id: d.id } as DeceasedItem);
          }
        });
        setDeceasedList(items);
      }
    }, (err) => console.warn('cenaze firestore:', err.message));

    // Kullanıcılar (Rol Yönetimi için)
    const qUsers = query(collection(db, 'users'), limit(50));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      if (!snap.empty) {
        const uList: UserProfile[] = [];
        snap.forEach((d) => {
          uList.push({ ...d.data(), uid: d.id } as UserProfile);
        });
        // INITIAL_USERS ile birleştirerek demo hesapların da görünmesini sağla
        const merged = [...uList];
        for (const initU of INITIAL_USERS) {
          if (!merged.some(u => u.uid === initU.uid || u.email === initU.email)) {
            merged.push(initU);
          }
        }
        setAllUsersList(merged);
      }
    }, (err) => console.warn('users firestore:', err.message));

    // İlk açılışta canlı veritabanı boşsa otomatik başlangıç verilerini senkronize et
    const autoSeedIfClean = async () => {
      try {
        const hasSeeded = localStorage.getItem('dijitalmutlular_auto_seeded_v1');
        if (!hasSeeded) {
          const markerRef = doc(db, 'system', 'seed_marker');
          const markerSnap = await getDoc(markerRef);
          if (!markerSnap.exists()) {
            await handleSeedAllToFirestore(true);
            await setDoc(markerRef, { seededAt: serverTimestamp(), version: '1.0' });
          }
          localStorage.setItem('dijitalmutlular_auto_seeded_v1', 'true');
        }
      } catch (e: any) {
        // Suppress offline / unavailable warning during initial boot check
        if (e?.message?.includes('unavailable') || e?.message?.includes('client is offline')) {
          return;
        }
        console.warn('Auto-seed check note:', e.message);
      }
    };
    // Otomatik örnek veri yüklemesi kapatıldı: silinen test verileri geri gelmesin.
    // Örnek veri gerekirse yönetici panelindeki manuel aktarım düğmesi kullanılır.
    void autoSeedIfClean;

    return () => {
      unsubNews();
      unsubMarket();
      unsubLf();
      unsubReq();
      unsubOffers();
      unsubCamp();
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
    authorName?: string;
  }) => {
    const newItem: SampleNewsItem = {
      id: 'h_' + Date.now(),
      baslik: newsData.baslik,
      kategori: newsData.kategori,
      ozet: newsData.ozet,
      icerik: newsData.icerik,
      imageURL: newsData.imageURL || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      sonDakika: newsData.sonDakika,
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

  // ── Yönetici: tüm içerik türleri için silme (haber, ilan, kayıp eşya, talep, davet, kampanya, kürsü, vefat) ──
  const adminContentSetters: Record<string, (fn: (prev: any[]) => any[]) => void> = {
    haberler: setNewsItems as any,
    marketplace_items: setMarketplaceItems as any,
    lost_found_items: setLostFoundItems as any,
    service_requests: setServiceRequests as any,
    mahalle_davetleri: setInvitationItems as any,
    esnaf_kampanyalar: setCampaigns as any,
    mahalle_kursusu: setKursuItems as any,
    cenaze_ilanlari: setDeceasedList as any
  };

  const describeDeleteError = (e: any) =>
    e?.code === 'permission-denied'
      ? 'yetkiniz yok (yönetici e-postanızı doğrulayıp yeniden giriş yapın; Firestore kuralları yayınlı olmalı)'
      : (e?.message || 'bilinmeyen hata');

  const handleAdminDeleteContent = async (col: string, id: string): Promise<void> => {
    if (!isUserAdmin) {
      showToast('Bu işlem yalnızca yöneticiye açıktır.', true);
      return;
    }
    try {
      if (col === 'service_requests') {
        const offerSnap = await getDocs(query(collection(db, 'offers'), where('requestId', '==', id)));
        await Promise.all(offerSnap.docs.map(d => deleteDoc(d.ref)));
      }
      await deleteDoc(doc(db, col, id));
      adminContentSetters[col]?.(prev => prev.filter((x: any) => x.id !== id));
      showToast('Kayıt silindi. 🗑️');
    } catch (e: any) {
      showToast('Silinemedi: ' + describeDeleteError(e), true);
    }
  };

  const handleAdminDeleteAllContent = async (col: string): Promise<void> => {
    if (!isUserAdmin) {
      showToast('Bu işlem yalnızca yöneticiye açıktır.', true);
      return;
    }
    try {
      const snap = await getDocs(collection(db, col));
      if (col === 'service_requests') {
        const offerSnap = await getDocs(collection(db, 'offers'));
        await Promise.all(offerSnap.docs.map(d => deleteDoc(d.ref)));
      }
      const results = await Promise.allSettled(snap.docs.map(d => deleteDoc(d.ref)));
      const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length === 0) {
        adminContentSetters[col]?.(() => []);
        showToast(`${snap.size} kayıt silindi. 🗑️`);
      } else {
        showToast(`${snap.size - failed.length} kayıt silindi, ${failed.length} kayıt silinemedi: ` + describeDeleteError(failed[0].reason), true);
      }
    } catch (e: any) {
      showToast('Silinemedi: ' + describeDeleteError(e), true);
    }
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

  // Seed sample data to Firestore with 1-click
  const handleSeedAllToFirestore = async (silent = false) => {
    if (!silent) showToast('Örnek veriler canlı veritabanına aktarılıyor…');
    try {
      // 1. News
      for (const item of INITIAL_NEWS) {
        await addDoc(collection(db, 'haberler'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      // 2. Marketplace (Emlak & 2. El)
      for (const item of INITIAL_MARKETPLACE) {
        await addDoc(collection(db, 'marketplace_items'), {
          ...item,
          uid: user?.uid || 'sakin_1',
          createdAt: serverTimestamp()
        });
      }
      // 3. Lost & Found
      for (const item of INITIAL_LOST_FOUND) {
        await addDoc(collection(db, 'lost_found_items'), {
          ...item,
          uid: user?.uid || 'sakin_1',
          createdAt: serverTimestamp()
        });
      }
      // 4. Services
      for (const item of INITIAL_SERVICES) {
        await addDoc(collection(db, 'service_requests'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      // 5. Invitations (Mahalle Davetleri: Düğün, Nişan, Sünnet)
      for (const item of INITIAL_INVITATIONS) {
        await addDoc(collection(db, 'mahalle_davetleri'), {
          ...item,
          uid: user?.uid || 'davet_demo',
          createdAt: serverTimestamp()
        });
      }
      // 6. Campaigns
      for (const item of INITIAL_CAMPAIGNS) {
        await addDoc(collection(db, 'esnaf_kampanyalar'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      // 7. Kursu
      for (const item of INITIAL_KURSUS) {
        await addDoc(collection(db, 'mahalle_kursusu'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      // 8. Cenaze & Vefat İlanları
      for (const item of DECEASED_ITEMS) {
        await addDoc(collection(db, 'cenaze_ilanlari'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      if (!silent) showToast('Tüm mahalle veritabanı (Davetler, Emlak, 2.El, Haberler, Cenaze) başarıyla buluta aktarıldı! 🎉');
    } catch (e: any) {
      if (!silent) showToast('Aktarım hatası: ' + e.message, true);
    }
  };

  // Vefat / Cenaze & Taziye İlanı Yayınlama
  const handlePublishDeceased = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeceasedName.trim()) {
      showToast('Lütfen merhum / merhume adı soyadı giriniz.', true);
      return;
    }

    const newDeceasedItem: DeceasedItem = {
      id: 'vefat_' + Date.now(),
      fullName: newDeceasedName.trim(),
      age: newDeceasedAge ? parseInt(newDeceasedAge) : undefined,
      family: newDeceasedFamily.trim() || 'Ailesi ve Sevenleri',
      mosque: newDeceasedMosque.trim() || 'Mutlular Fatih Camii',
      prayerTime: newDeceasedPrayer || 'Öğle Namazını Müteakip',
      cemetery: newDeceasedCemetery.trim() || 'Hamitler Kent Mezarlığı',
      dateStr: newDeceasedDate || 'Bugün'
    };

    setDeceasedList(prev => [newDeceasedItem, ...prev]);

    try {
      await addDoc(collection(db, 'cenaze_ilanlari'), {
        ...newDeceasedItem,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.warn('Firestore cenaze save error:', err.message);
    }

    setShowNewDeceasedModal(false);
    setNewDeceasedName('');
    setNewDeceasedAge('');
    setNewDeceasedFamily('');
    showToast("Vefat ve cenaze ilanı duyuruldu. Merhuma Allah'tan rahmet, kederli ailesine başsağlığı dileriz. 🕊️");
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
        if (authRole === 'esnaf' && !authIsyeri.trim()) {
          setAuthError('Lütfen dükkan, işletme veya meslek ünvanınızı belirtiniz.');
          return;
        }

        const emailClean = authEmail.trim().toLowerCase();
        // Yönetici yetkisi yalnızca e-posta doğrulandıktan sonra (girişte) verilir; kayıt her zaman normal rolle başlar.
        const finalRole: UserRole = authRole;

        let userUid = '';
        suppressAutoProfileRef.current = true;
        try {
          const cred = await createUserWithEmailAndPassword(auth, emailClean, authPassword);
          userUid = cred.user.uid;
          try { await updateProfile(cred.user, { displayName: authName.trim() }); } catch (_) {}

          const newProfile: UserProfile = {
            uid: userUid,
            name: authName.trim(),
            email: emailClean,
            telefon: authPhone.trim(),
            role: finalRole,
            credits: finalRole === 'esnaf' ? 10 : 0,
            welcomeBonusGiven: finalRole === 'esnaf' ? true : undefined,
            isyeri: finalRole === 'esnaf' ? authIsyeri.trim() : undefined,
            esnafKategori: finalRole === 'esnaf' ? authEsnafKategori : undefined,
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
        } else if (finalRole === 'esnaf') {
          showToast(`Kayıt tamamlandı! Sayın esnafımız, 10 teklif kredisi hesabınıza yüklendi 🛠️🎁`);
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
        const newRole: UserRole = isAdminEmail ? 'admin' : authRole;
        const newProfile: UserProfile = {
          uid: u.uid,
          name: u.displayName || 'Mahalle Sakini',
          email: u.email || '',
          telefon: authPhone.trim() || '',
          role: newRole,
          credits: isAdminEmail ? 9999 : (newRole === 'esnaf' ? 10 : 0),
          welcomeBonusGiven: (!isAdminEmail && newRole === 'esnaf') ? true : undefined,
          isyeri: newRole === 'esnaf' ? (authIsyeri.trim() || u.displayName || '') : undefined,
          esnafKategori: newRole === 'esnaf' ? authEsnafKategori : undefined,
          isApproved: true,
          createdAt: new Date(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
        setDemoRole(newRole);
        setRealRole(newRole);
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
    playAlertSound(true);
    const testNotif = {
      id: 'test_sd_' + Date.now(),
      type: 'sondakika',
      title: '🚨 [TEST] SON DAKİKA: Mahallemizde acil su ve altyapı güncellemesi tamamlandı!',
      category: 'SON DAKİKA',
      time: 'Az önce',
      read: false,
      badgeColor: 'bg-red-600',
      icon: '🚨'
    };
    setNotifications(prev => [testNotif, ...prev]);
    showToast('🚨 [SON DAKİKA TESTİ] Test uyarısı tetiklendi! Bildirim sesi ve uyarı kutusu başarıyla çalıştı.');
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
    setEditEsnafKategori(profile.esnafKategori || 'Tesisat & Su');
    setEditAdres(profile.adres || 'Mutlular Mahallesi, Yıldırım / Bursa');
    setEditCalismaSaatleri(profile.calismaSaatleri || 'Pazartesi - Cumartesi: 08:30 - 19:30');
    setEditVergiLevhasiFoto(profile.vergiLevhasiFoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
    setEditUzmanlikEtiketleri(profile.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0 ? profile.uzmanlikEtiketleri : ['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
    setEditEsnafAciklama(profile.esnafAciklama || 'Mutlular Mahallesi sakinlerine profesyonel ve garantili usta hizmeti sunmaktayız.');
    setProfileModalTab('bilgiler');
    setShowProfileEditModal(true);
  };

  const handleOpenArtisanOnboarding = () => {
    if (profile) {
      setArtisanBusinessName(profile.isyeri || (profile.name ? `${profile.name} Usta & Hizmet` : ''));
      setArtisanCategory(profile.esnafKategori || 'Tesisat & Su');
      setArtisanAddress(profile.adres || 'Mutlular Mahallesi, Yıldırım / Bursa');
      setArtisanWorkingHours(profile.calismaSaatleri || 'Pazartesi - Cumartesi: 08:30 - 19:30');
      setArtisanTaxPlatePhoto(profile.vergiLevhasiFoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
      setArtisanTags(profile.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0
        ? profile.uzmanlikEtiketleri
        : ['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
      setArtisanPhone(profile.telefon || '');
      setArtisanDescription(profile.esnafAciklama || 'Mutlular Mahallesi sakinlerine profesyonel, güvenilir ve garantili hizmet sunmaktayız.');
    } else {
      setArtisanBusinessName('');
      setArtisanCategory('Tesisat & Su');
      setArtisanAddress('Mutlular Mahallesi, Yıldırım / Bursa');
      setArtisanWorkingHours('Pazartesi - Cumartesi: 08:30 - 19:30');
      setArtisanTaxPlatePhoto('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
      setArtisanTags(['Garantili İşçilik', '7/24 Acil Usta', 'Hızlı Servis']);
      setArtisanPhone('');
      setArtisanDescription('Mutlular Mahallesi sakinlerine profesyonel, güvenilir ve garantili usta hizmeti sunmaktayız.');
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
    if (!artisanBusinessName.trim()) {
      showToast('Lütfen işletme veya dükkan adınızı giriniz.', true);
      return;
    }
    if (!artisanAddress.trim()) {
      showToast('Lütfen işletme adresinizi giriniz.', true);
      return;
    }
    setArtisanIsSubmitting(true);
    try {
      if (user && profile) {
        // Mevcut kullanıcıyı doğrudan esnaf hesabına yükselt
        const userRef = doc(db, 'users', user.uid);
        // Hoş geldin kredisi (10) yalnızca bir kez verilir; zaten esnaf olan veya bonusu almış hesaba tekrar eklenmez.
        const alreadyGotBonus = profile.role === 'esnaf' || (profile as any).welcomeBonusGiven === true;
        const updatedCredits = alreadyGotBonus ? (profile.credits || 0) : Math.max(10, profile.credits || 0);
        const updatedProfile: UserProfile = {
          ...profile,
          role: 'esnaf',
          isyeri: artisanBusinessName.trim(),
          esnafKategori: artisanCategory,
          adres: artisanAddress.trim(),
          calismaSaatleri: artisanWorkingHours.trim() || 'Pazartesi - Cumartesi: 08:30 - 19:30',
          vergiLevhasiFoto: artisanTaxPlatePhoto.trim() || undefined,
          uzmanlikEtiketleri: artisanTags,
          esnafAciklama: artisanDescription.trim(),
          telefon: artisanPhone.trim() || profile.telefon,
          credits: updatedCredits,
          isApproved: true,
        };

        await updateDoc(userRef, {
          role: 'esnaf',
          isyeri: updatedProfile.isyeri,
          esnafKategori: updatedProfile.esnafKategori,
          adres: updatedProfile.adres,
          calismaSaatleri: updatedProfile.calismaSaatleri,
          vergiLevhasiFoto: updatedProfile.vergiLevhasiFoto || '',
          uzmanlikEtiketleri: updatedProfile.uzmanlikEtiketleri || [],
          esnafAciklama: updatedProfile.esnafAciklama || '',
          telefon: updatedProfile.telefon || '',
          credits: updatedCredits,
          welcomeBonusGiven: true,
          isApproved: true,
        });

        setProfile(updatedProfile);
        setDemoRole('esnaf');
        setShowArtisanRegisterModal(false);
        showToast('🎉 Tebrikler! Hesabınız başarıyla Esnaf & Usta hesabına yükseltildi. 10 başlangıç teklif krediniz cüzdanınıza tanımlandı!');
      } else {
        // Misafir kullanıcı için doğrudan esnaf hesabı aç
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

          const newProfile: UserProfile = {
            uid: userUid,
            name: artisanRegisterName.trim() || artisanBusinessName.trim() || 'Esnaf Komşumuz',
            email: emailClean,
            role: 'esnaf',
            telefon: artisanPhone.trim(),
            isyeri: artisanBusinessName.trim(),
            esnafKategori: artisanCategory,
            adres: artisanAddress.trim(),
            calismaSaatleri: artisanWorkingHours.trim() || 'Pazartesi - Cumartesi: 08:30 - 19:30',
            vergiLevhasiFoto: artisanTaxPlatePhoto.trim() || undefined,
            uzmanlikEtiketleri: artisanTags,
            esnafAciklama: artisanDescription.trim(),
            credits: 10,
            welcomeBonusGiven: true,
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
        showToast('🎉 Tebrikler! Esnaf & Usta hesabınız başarıyla oluşturuldu ve 10 teklif kredisi yüklendi!');
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
    try {
      const newReq: ServiceRequest = {
        id: `req_${Date.now()}`,
        baslik: `${armutSelectedSub} (${armutTiming})`,
        aciklama: armutDetail.trim(),
        kategori: armutSelectedCat,
        altKategori: armutSelectedSub,
        adres: armutAddress.trim() || 'Mutlular Mahallesi',
        konum: armutAddress.trim() || 'Mutlular Mahallesi',
        status: 'open',
        authorName: profile?.name || 'Mahalle Sakini',
        telefon: armutPhone.trim() || profile?.telefon || '',
        authorPhone: armutPhone.trim() || profile?.telefon || '',
        urgent: armutTiming.toLowerCase().includes('hemen') || armutTiming.toLowerCase().includes('acil'),
        offerCount: 0,
        fotolar: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'],
        createdAt: new Date(),
      };

      if (db) {
        await addDoc(collection(db, 'service_requests'), {
          baslik: newReq.baslik,
          aciklama: newReq.aciklama,
          kategori: newReq.kategori,
          altKategori: newReq.altKategori,
          konum: newReq.konum,
          status: 'open',
          authorName: newReq.authorName,
          authorPhone: newReq.authorPhone,
          urgent: newReq.urgent,
          createdAt: new Date(),
        });
      }

      setServiceRequests([newReq, ...serviceRequests]);
      setShowArmutWizard(false);
      setServiceViewMode('requests');
      showToast('Hizmet talebiniz başarıyla açıldı! Onaylı ustalardan teklifler toplanacak. 👍');
    } catch (err: any) {
      showToast('Talep oluşturulurken hata: ' + err.message, true);
    }
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
      const updated: UserProfile = {
        ...profile,
        name: editName.trim() || profile.name,
        telefon: editPhone.trim() || profile.telefon,
        photoURL: editPhotoURL.trim() || profile.photoURL,
        role: savedRole,
        isyeri: editRole === 'esnaf' ? (editIsyeri.trim() || profile.isyeri || editName) : undefined,
        esnafKategori: editRole === 'esnaf' ? (editEsnafKategori || profile.esnafKategori) : undefined,
        adres: editRole === 'esnaf' ? (editAdres.trim() || profile.adres) : profile.adres,
        calismaSaatleri: editRole === 'esnaf' ? (editCalismaSaatleri.trim() || profile.calismaSaatleri) : profile.calismaSaatleri,
        vergiLevhasiFoto: editRole === 'esnaf' ? (editVergiLevhasiFoto.trim() || profile.vergiLevhasiFoto) : profile.vergiLevhasiFoto,
        uzmanlikEtiketleri: editRole === 'esnaf' ? editUzmanlikEtiketleri : profile.uzmanlikEtiketleri,
        esnafAciklama: editRole === 'esnaf' ? (editEsnafAciklama.trim() || profile.esnafAciklama) : profile.esnafAciklama,
      };

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          name: updated.name,
          telefon: updated.telefon || '',
          photoURL: updated.photoURL || '',
          role: updated.role,
          isyeri: updated.isyeri || '',
          esnafKategori: updated.esnafKategori || '',
          adres: updated.adres || '',
          calismaSaatleri: updated.calismaSaatleri || '',
          vergiLevhasiFoto: updated.vergiLevhasiFoto || '',
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

          if (esnafDoc.exists()) {
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
          }

          tx.set(offerRef, {
            requestId,
            esnafUid: user.uid,
            esnafIsyeri: profile.isyeri || profile.name || 'Esnaf',
            esnafTelefon: profile.telefon || '05321112233',
            fiyat: price,
            mesaj: message,
            tahminiSure: duration,
            creditCost: 1,
            status: 'pending',
            createdAt: serverTimestamp()
          });

          if (reqDoc.exists()) {
            tx.update(requestRef, { offerCount: increment(1) });
          }
        });

        setProfile((prev) => prev ? { ...prev, credits: (prev.credits || 1) - 1 } : null);
      } else {
        // Mock state update if running in demo mode
        const newOffer: ServiceOffer = {
          id: 'offer_' + Date.now(),
          requestId,
          esnafUid: 'demo_esnaf',
          esnafIsyeri: profile?.isyeri || 'Mutlular Usta Servisi',
          esnafTelefon: '05321112233',
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
      showToast('Teklifiniz başarıyla iletildi! (1 Kredi düşüldü) 🛠️');
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // Mahalle Pazarı / Esnaf Kampanya Yayınlama
  const handlePublishCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campIsyeri || !campBaslik || !campAciklama) {
      showToast('Lütfen dükkan adı, başlık ve açıklamayı doldurun.', true);
      return;
    }

    const defaultImages: Record<string, string> = {
      'Fırın & Unlu Mamül': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      'Kasap & Et Ürünleri': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
      'Manav & Organik': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      'Oto Bakım & Hizmet': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80',
      'Çiçek & Bahçe': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
      'Kişisel Bakım & Kuaför': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    };

    const finalPhoto = campFoto.trim() || defaultImages[campKategori] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';

    const newCamp: EsnafCampaign = {
      id: 'camp_' + Date.now(),
      esnafId: user?.uid || 'guest_esnaf',
      isyeriAdi: campIsyeri,
      kategori: campKategori,
      baslik: campBaslik,
      aciklama: campAciklama,
      indirimOrani: campIndirim || '%20 İNDİRİM',
      rozet: campRozet || 'Günün Fırsatı',
      fotoUrl: finalPhoto,
      adres: campAdres || 'Mutlular Mahallesi',
      telefon: campTelefon || '0532 999 88 77',
      gecerlilikTarihi: campGecerlilik || 'Süresiz',
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'esnaf_kampanyalar'), {
        ...newCamp,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore campaign save err:', err.message);
    }

    setCampaigns((prev) => [newCamp, ...prev]);
    setShowCampaignModal(false);
    showToast('Kampanyanız Mahalle Pazarı\'nda başarıyla yayına alındı! 🏪');
  };

  // Role & Admin Check
  const isUserAdmin = Boolean((user || profile) && (demoRole === 'admin' || profile?.role === 'admin' || (user?.email === 'yakupkrbck@gmail.com' && user?.emailVerified)));
  const isUserEditor = Boolean((user || profile) && (isUserAdmin || demoRole === 'editor' || profile?.role === 'editor'));
  const pendingTipsCount = useMemo(() => {
    return newsItems.filter(n => n.status === 'pending').length;
  }, [newsItems]);

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

  const vitrinSlideItems: VitrinItem[] = useMemo(() => {
    const topNews = newsItems[0] || INITIAL_NEWS[0];
    const topEmlak = marketplaceItems.find(i => i.ilanTuru === 'emlak' || (i.kategori && i.kategori.toLowerCase().includes('emlak'))) || marketplaceItems[0];
    const topIkinciEl = marketplaceItems.find(i => i.ilanTuru === 'ikinci_el' || (i.kategori && !i.kategori.toLowerCase().includes('emlak'))) || marketplaceItems[1];
    
    return [
      {
        id: 'vitrin-haber',
        categoryType: 'haber',
        categoryLabel: 'SON HABER',
        categoryIcon: '📰',
        categoryBadgeClass: 'bg-red-600 text-white',
        title: topNews?.baslik || "Mehmet Akif Mahallesi'nde Önemli Gelişme Yaşandı",
        subtitle: topNews?.ozet || "Mahallemizdeki son dakika gelişmeler ve güncel bülten detayları.",
        actionText: 'Haberi Oku →',
        imageUrl: topNews?.imageURL || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
        meta: 'Flaş Haber • Yeni',
        dataRef: topNews
      },
      {
        id: 'vitrin-emlak',
        categoryType: 'emlak',
        categoryLabel: 'EMLAK',
        categoryIcon: '🏠',
        categoryBadgeClass: 'bg-amber-500 text-slate-950 font-black',
        title: topEmlak?.baslik || "Mehmet Akif Mahallesi'nde Satılık 3+1 Daire",
        subtitle: `${topEmlak?.fiyat ? topEmlak.fiyat.toLocaleString('tr-TR') + ' TL' : '2.450.000 TL'} • ${topEmlak?.odaSayisi || '3+1'} • ${topEmlak?.aciklama?.slice(0, 90) || 'Kombili, asansörlü ferah daire.'}`,
        actionText: 'İlanı Gör →',
        imageUrl: topEmlak?.fotolar?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        meta: 'Günün Emlak Fırsatı',
        dataRef: topEmlak
      },
      {
        id: 'vitrin-ikinciel',
        categoryType: 'ikinci_el',
        categoryLabel: '2. EL',
        categoryIcon: '🚗',
        categoryBadgeClass: 'bg-blue-600 text-white',
        title: topIkinciEl?.baslik || "Sahibinden Satılık Temiz Araç & Eşya",
        subtitle: `${topIkinciEl?.fiyat ? topIkinciEl.fiyat.toLocaleString('tr-TR') + ' TL' : '1.450 TL'} • ${topIkinciEl?.aciklama?.slice(0, 90) || 'Komşumuzdan tertemiz az kullanılmış ürün.'}`,
        actionText: 'İlanı Gör →',
        imageUrl: topIkinciEl?.fotolar?.[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
        meta: 'Uygun Fiyatlı 2. El',
        dataRef: topIkinciEl
      },
      {
        id: 'vitrin-hizmet',
        categoryType: 'hizmet',
        categoryLabel: 'USTALAR / HİZMET',
        categoryIcon: '🔧',
        categoryBadgeClass: 'bg-emerald-600 text-white',
        title: 'Mustafa Usta — Tesisat, Kombi & Isıtma',
        subtitle: '⭐ 4.9 (88 Değerlendirme) • 25 yıllık mahalle tecrübesi, garantili işçilik ve kaçak tespiti.',
        actionText: 'Profili Gör →',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
        meta: 'Haftanın Onaylı Ustası',
        dataRef: {
          id: 'usta_mustafa',
          name: 'Mustafa Usta',
          profession: 'Sıhhi Tesisat, Kombi & Kalorifer',
          phone: '05329998811',
          rating: 4.9,
          reviewCount: 88,
          neighborhood: 'Mehmet Akif Mah.',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
        }
      }
    ];
  }, [newsItems, marketplaceItems]);

  const neighborhoodMastersList: NeighborhoodMaster[] = [
    {
      id: 'usta_1',
      name: 'Mustafa Usta',
      profession: 'Sıhhi Tesisat & Kombi',
      category: 'tesisat',
      phone: '05329998811',
      rating: 4.9,
      reviewCount: 88,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      experience: '25 Yıl'
    },
    {
      id: 'usta_2',
      name: 'Mehmet Usta',
      profession: 'Elektrik, Avize & Tesisat',
      category: 'elektrik',
      phone: '05321112233',
      rating: 4.9,
      reviewCount: 128,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      experience: '18 Yıl'
    },
    {
      id: 'usta_3',
      name: 'Hasan Usta',
      profession: 'Boya, Badana & Alçıpan',
      category: 'boya',
      phone: '05423334455',
      rating: 4.8,
      reviewCount: 64,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      experience: '15 Yıl'
    },
    {
      id: 'usta_4',
      name: 'Ali Usta',
      profession: 'Klima Servisi & Bakım',
      category: 'klima',
      phone: '05357778899',
      rating: 4.9,
      reviewCount: 92,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      experience: '12 Yıl'
    },
    {
      id: 'usta_5',
      name: 'Ahmet Usta',
      profession: 'Oto Tamir & Mekanik Bakım',
      category: 'tamir',
      phone: '05445556677',
      rating: 4.8,
      reviewCount: 45,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      experience: '20 Yıl'
    },
    {
      id: 'usta_6',
      name: 'Selma Hanım',
      profession: 'Ev & Ofis Detaylı Temizlik',
      category: 'temizlik',
      phone: '05362223344',
      rating: 5.0,
      reviewCount: 56,
      neighborhood: 'Mehmet Akif Mah.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      experience: '10 Yıl'
    }
  ];

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

  const headerBrand = getHeaderBrand();

  const adminContentSections = [
    { col: 'haberler', label: 'Haberler', emoji: '📰', items: newsItems.map((n: any) => ({ id: n.id || '', title: n.baslik || '(başlıksız)', sub: [n.kategori, n.authorName, n.status === 'pending' ? 'Onay bekliyor' : ''].filter(Boolean).join(' • ') })) },
    { col: 'marketplace_items', label: 'Emlak & 2. El İlanları', emoji: '🏷️', items: marketplaceItems.map((m: any) => ({ id: m.id || '', title: m.baslik || '(başlıksız)', sub: [m.kategori, m.saticiAdi].filter(Boolean).join(' • ') })) },
    { col: 'lost_found_items', label: 'Kayıp Eşya', emoji: '🔎', items: lostFoundItems.map((l: any) => ({ id: l.id || '', title: l.baslik || '(başlıksız)', sub: [l.tur, l.kategori].filter(Boolean).join(' • ') })) },
    { col: 'service_requests', label: 'Usta Talepleri', emoji: '🛠️', items: serviceRequests.map((r: any) => ({ id: r.id || '', title: r.baslik || '(başlıksız)', sub: [r.kategori, r.authorName].filter(Boolean).join(' • ') })) },
    { col: 'mahalle_davetleri', label: 'Davetiyeler', emoji: '💍', items: invitationItems.map((d: any) => ({ id: d.id || '', title: d.baslik || '(başlıksız)', sub: [d.tur, d.davetSahipleri].filter(Boolean).join(' • ') })) },
    { col: 'esnaf_kampanyalar', label: 'Esnaf Kampanyaları', emoji: '🏪', items: campaigns.map((c: any) => ({ id: c.id || '', title: c.baslik || '(başlıksız)', sub: [c.isyeriAdi, c.kategori].filter(Boolean).join(' • ') })) },
    { col: 'mahalle_kursusu', label: 'Mahalle Kürsüsü', emoji: '🎤', items: kursuItems.map((k: any) => ({ id: k.id || '', title: k.baslik || '(başlıksız)', sub: [k.kategori, k.authorName].filter(Boolean).join(' • ') })) },
    { col: 'cenaze_ilanlari', label: 'Vefat İlanları', emoji: '🕊️', items: deceasedList.map((d: any) => ({ id: d.id || '', title: d.fullName || '(isimsiz)', sub: [d.dateStr, d.mosque].filter(Boolean).join(' • ') })) }
  ];


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans pb-24">
      {/* ════════════════════════════════════════
           EN ÜSTTE TEK ŞERİT: CENAZE İLANLARI (VEFAT & TAZİYE)
      ════════════════════════════════════════ */}
      {deceasedList.length > 0 && (
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

            <div className="truncate text-slate-200 group-hover:text-amber-300 transition-colors text-[11px] sm:text-xs">
              <span className="font-black text-amber-400">
                {deceasedList[currentDeceasedIdx]?.fullName || 'Merhum'} {deceasedList[currentDeceasedIdx]?.age ? `(${deceasedList[currentDeceasedIdx]?.age})` : ''}
              </span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-slate-300">
                Cenazesi {deceasedList[currentDeceasedIdx]?.dateStr?.toLowerCase() || 'bugün'} {deceasedList[currentDeceasedIdx]?.mosque}'nden {deceasedList[currentDeceasedIdx]?.prayerTime?.toLowerCase() || 'namazı müteakip'} kaldırılacaktır.
              </span>
              {deceasedList[currentDeceasedIdx]?.family && (
                <span className="text-slate-400 hidden lg:inline ml-1.5">
                  ({deceasedList[currentDeceasedIdx]?.family})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {deceasedList.length > 1 && (
              <div className="flex items-center text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDeceasedIdx(prev => (prev > 0 ? prev - 1 : deceasedList.length - 1));
                  }}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Önceki Cenaze İlanı"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 select-none text-slate-400">
                  {currentDeceasedIdx + 1}/{deceasedList.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDeceasedIdx(prev => (prev < deceasedList.length - 1 ? prev + 1 : 0));
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
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[10px] sm:text-[11px] tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse"
              title="Mutlular TV Canlı Yayını İzle"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>📺 Canlı Yayın</span>
            </button>

            <button
              onClick={() => setShowNewDeceasedModal(true)}
              className="text-[10px] sm:text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2 py-1 rounded-lg transition-all hidden sm:inline-flex items-center gap-1"
              title="Cenaze / Taziye İlanı Bırak"
            >
              <PlusCircle className="w-3 h-3" /> İlan Bırak
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* ── MUTLULAR HABER & HİZMET MODERN SABİT HEADER (SOL: ARAMA | ORTA: MUTLULAR HABER / HİZMET | SAĞ: PROFİL) ── */}
      <MutlularHeader
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenShare={() => setShowMutlularShareModal(true)}
        onOpenLiveTv={() => setMutlularTvActive(true)}
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
                          <span className="flex items-center gap-1 text-amber-300">
                            <Eye className="w-3 h-3" /> {(trendItem.okunmaSayisi || 120).toLocaleString('tr-TR')}
                          </span>
                          <span className="flex items-center gap-1 text-rose-400">
                            <Heart className="w-3 h-3 fill-rose-500" /> {trendItem.begeniSayisi || 15}
                          </span>
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
                            <span className="flex items-center gap-1 font-semibold text-slate-500">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {(item.okunmaSayisi || 150).toLocaleString('tr-TR')}
                            </span>
                            <span className="flex items-center gap-1 text-rose-600 font-bold">
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                              {item.begeniSayisi || 34}
                            </span>
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
            MAIN_SERVICE_CATEGORIES.forEach(mainCat => {
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

          // Drill-down selected category
          const activeExpandedCategory = activeExpandedCatId 
            ? MAIN_SERVICE_CATEGORIES.find(c => c.id === activeExpandedCatId) 
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
                      onClick={handleOpenArtisanOnboarding}
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
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                    ⭐ {master.rating}
                                  </span>
                                  <span>({master.reviewCount} Değerlendirme)</span>
                                </div>
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
                        onClick={() => handleOpenCategoryRequest(MAIN_SERVICE_CATEGORIES[0].id, undefined, serviceSectorSearch)}
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
                      <span>Hizmet Kategorileri ({MAIN_SERVICE_CATEGORIES.length})</span>
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
                      <span>Mahalle Ustaları ({VERIFIED_MASTERS.length} Onaylı Esnaf)</span>
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
                        {MAIN_SERVICE_CATEGORIES.map((cat) => (
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
                      {MAIN_SERVICE_CATEGORIES.map(cat => {
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
                                <span className="text-amber-500 font-black flex items-center gap-1">
                                  ⭐ {master.rating}
                                </span>
                                <span>({master.reviewCount} Değerlendirme)</span>
                                <span className="text-slate-400">•</span>
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

                  <div id="service-request-list" className="space-y-3.5">
                    {searchMatchingRequests.map((req, idx) => {
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
                                {offersMap[req.id || '']?.length || req.offerCount || 0} Teklif
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
                              {demoRole === 'esnaf' && (
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
                                Teklifleri Gör ({offersMap[req.id || '']?.length || req.offerCount || 0})
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
                <span>Haber Bildirimleri</span>
                {newsNotifPrefs.sonDakikaOnly && newsNotifPrefs.enabled && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    profileSubTab === 'haber_bildirimleri'
                      ? 'bg-white text-red-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Son Dakika
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
                          onClick={handleOpenArtisanOnboarding}
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

                        {/* Vergi Levhası / Ustalık Belgesi */}
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="text-[10px] font-bold text-emerald-800 block uppercase">Belge / Vergi Levhası</span>
                              <span className="font-bold text-emerald-700 text-xs">
                                {profile?.vergiLevhasiFoto ? '✓ Belge Yüklendi (Onaylı)' : 'Standart Kayıt'}
                              </span>
                            </div>
                          </div>
                          {profile?.vergiLevhasiFoto && (
                            <a
                              href={profile.vergiLevhasiFoto}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                            >
                              Görüntüle ↗
                            </a>
                          )}
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
                        onClick={handleOpenArtisanOnboarding}
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
                        Haber Bildirim Durumu: {newsNotifPrefs.sonDakikaOnly ? 'Sadece "Son Dakika" Haberleri' : 'Tüm Mahalle Haberleri'}
                      </span>
                      <span className="text-[11px] text-red-700 block">
                        {newsNotifPrefs.enabled ? 'Anlık sesli ve görsel bildirimler devrede.' : 'Bildirimler şu an kapalı.'}
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
                          <h4 className="font-black text-base sm:text-lg">Haber Bildirim Ayarları</h4>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            !newsNotifPrefs.enabled
                              ? 'bg-black/30 text-white'
                              : newsNotifPrefs.sonDakikaOnly
                              ? 'bg-amber-300 text-red-950 font-black tracking-wide shadow-xs'
                              : 'bg-emerald-400 text-emerald-950 font-black'
                          }`}>
                            {!newsNotifPrefs.enabled ? '🔕 BİLDİRİMLER KAPALI' : newsNotifPrefs.sonDakikaOnly ? '⚡ YALNIZCA SON DAKİKA AKTİF' : '📢 TÜM HABERLER AKTİF'}
                          </span>
                        </div>
                        <p className="text-xs text-red-100 mt-1 leading-relaxed max-w-xl">
                          Mahallemizdeki acil su/elektrik kesintileri, güvenlik uyarıları ve muhtarlık flaş duyuruları için anlık bildirim kriterlerinizi belirleyin.
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

                {/* Ana Bildirim Kapsamı Seçimi (Sadece Son Dakika vs Tüm Haberler) */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      <span>Haber Bildirim Kapsamı</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hangi haberler yayınlandığında anlık bildirim (sesli ve görsel uyarı) almak istersiniz?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Seçenek 1: Sadece Son Dakika */}
                    <div
                      onClick={() => handleSaveNewsNotifPrefs({ ...newsNotifPrefs, sonDakikaOnly: true, enabled: true })}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        newsNotifPrefs.sonDakikaOnly && newsNotifPrefs.enabled
                          ? 'border-red-500 bg-red-50/70 ring-2 ring-red-200 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {newsNotifPrefs.sonDakikaOnly && newsNotifPrefs.enabled && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> SEÇİLİ (ÖNERİLEN)
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">🚨</span>
                          <div>
                            <h5 className="font-black text-sm text-slate-900">
                              Sadece "Son Dakika" Haberleri
                            </h5>
                            <span className="text-[10px] font-bold text-red-700 bg-red-100/90 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              Acil &amp; Kritik Gelişmeler
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Yalnızca acil mahalle gelişmeleri, su, elektrik ve doğalgaz kesintileri, afet ve güvenlik uyarıları ile muhtarlık tarafından <strong>"Son Dakika"</strong> olarak etiketlenen haberler için anlık sesli/görsel bildirim alırsınız.
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[10px] bg-white border border-red-200 text-red-800 font-semibold px-2 py-0.5 rounded-md">⚡ Anlık Flaş Haber</span>
                          <span className="text-[10px] bg-white border border-red-200 text-red-800 font-semibold px-2 py-0.5 rounded-md">🚰 Altyapı Kesintileri</span>
                          <span className="text-[10px] bg-white border border-red-200 text-red-800 font-semibold px-2 py-0.5 rounded-md">🛡️ Acil Durumlar</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-red-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Rutin bültenlerde rahatsız edilmezsiniz.</span>
                        <span className="font-black text-red-600">Seç ve Kaydet →</span>
                      </div>
                    </div>

                    {/* Seçenek 2: Tüm Mahalle Haberleri */}
                    <div
                      onClick={() => handleSaveNewsNotifPrefs({ ...newsNotifPrefs, sonDakikaOnly: false, enabled: true })}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        !newsNotifPrefs.sonDakikaOnly && newsNotifPrefs.enabled
                          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-200 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {!newsNotifPrefs.sonDakikaOnly && newsNotifPrefs.enabled && (
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> SEÇİLİ
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">📢</span>
                          <div>
                            <h5 className="font-black text-sm text-slate-900">
                              Tüm Mahalle Haberleri &amp; Bültenler
                            </h5>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              Tüm İçerikler
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Son dakika haberlerinin yanı sıra mahalle park açılışları, esnaf indirimleri, belediye duyuruları, temizlik programları ve kültürel etkinliklerin tümü için anlık bildirim alırsınız.
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[10px] bg-white border border-blue-200 text-blue-800 font-semibold px-2 py-0.5 rounded-md">🌳 Park &amp; Çevre</span>
                          <span className="text-[10px] bg-white border border-blue-200 text-blue-800 font-semibold px-2 py-0.5 rounded-md">🛒 Esnaf Kampanyaları</span>
                          <span className="text-[10px] bg-white border border-blue-200 text-blue-800 font-semibold px-2 py-0.5 rounded-md">🎉 Etkinlikler</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-blue-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Mahalledeki hiçbir gelişmeyi kaçırmazsınız.</span>
                        <span className="font-black text-blue-600">Seç ve Kaydet →</span>
                      </div>
                    </div>
                  </div>
                </div>

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
                          <span className="text-xs font-black text-slate-900 block">Anlık Haber Bildirimleri (Genel Anahtar)</span>
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

                {/* Filtre Karşılaştırma Tablosu */}
                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Haber Filtresi Karşılaştırma Rehberi</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500">
                          <th className="py-2 pr-3">Haber Konusu</th>
                          <th className="py-2 px-3 text-red-600">🚨 Sadece Son Dakika (Mevcut)</th>
                          <th className="py-2 pl-3 text-blue-600">📢 Tüm Haberler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-2.5 pr-3 font-semibold">Acil Su / Elektrik / Gaz Kesintisi</td>
                          <td className="py-2.5 px-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                          <td className="py-2.5 pl-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-3 font-semibold">Muhtarlık Acil Güvenlik &amp; Flaş Duyurusu</td>
                          <td className="py-2.5 px-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                          <td className="py-2.5 pl-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-3 font-semibold">Park, Yeşil Alan ve Sosyal Tesis Açılışı</td>
                          <td className="py-2.5 px-3 font-bold text-slate-400">⛔ Filtrelenir (Sessiz)</td>
                          <td className="py-2.5 pl-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-3 font-semibold">Esnaf Hafta Sonu İndirim Kampanyası</td>
                          <td className="py-2.5 px-3 font-bold text-slate-400">⛔ Filtrelenir (Sessiz)</td>
                          <td className="py-2.5 pl-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-3 font-semibold">Sokak Temizlik ve Asfalt Programı</td>
                          <td className="py-2.5 px-3 font-bold text-slate-400">⛔ Filtrelenir (Sessiz)</td>
                          <td className="py-2.5 pl-3 font-black text-emerald-600">✅ Anında Bildirilir</td>
                        </tr>
                      </tbody>
                    </table>
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

                  <button
                    type="button"
                    onClick={() => handleSeedAllToFirestore()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-purple-300/40"
                  >
                    <span>⚡</span>
                    <span>Canlı Veritabanını Başlat (Seed)</span>
                  </button>
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
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    🏛️
                  </span>
                  <div>
                    <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                      Mahalle Meclisi &amp; Ortak Akıl
                    </h2>
                    <p className="text-xs text-slate-500">
                      Mutlular sakinlerinin ortak kararları, canlı anketler ve muhtarlık gündemi.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => showToast('Yeni gündem maddesi öneriniz meclis divanına iletildi! 📝')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" /> Gündem Maddesi Öner
              </button>
            </div>

            {/* Kategori Filtresi */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'tumu', label: 'Tüm Anketler & Kararlar' },
                { id: 'guncel', label: '🔥 Aktif Oylamalar' },
                { id: 'ulasim', label: '🚲 Ulaşım & Yol' },
                { id: 'cevre', label: '🌳 Park & Çevre' },
                { id: 'sosyal', label: '🤝 Sosyal & Dayanışma' }
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

            {/* Canlı Anketler Listesi */}
            <div className="space-y-3.5">
              {polls
                .filter(poll => {
                  if (meclisFilter === 'tumu' || meclisFilter === 'guncel') return true;
                  return poll.category === meclisFilter;
                })
                .map((poll) => {
                const totalVotes = poll.evetCount + poll.hayirCount;
                const evetPercent = totalVotes > 0 ? Math.round((poll.evetCount / totalVotes) * 100) : 50;
                const hayirPercent = 100 - evetPercent;

                return (
                  <div
                    key={poll.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{poll.icon}</span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {poll.category === 'ulasim' ? 'Ulaşım & Yol' : poll.category === 'cevre' ? 'Park & Çevre' : 'Sosyal & Pazar'}
                          </span>
                          <h3 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
                            {poll.title}
                          </h3>
                        </div>
                      </div>

                      <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Oylama Açık
                      </span>
                    </div>

                    {/* İlerleme Çubukları */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>Evet ({poll.evetCount} oy)</span>
                          <span className="text-blue-600">%{evetPercent}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${evetPercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>Hayır ({poll.hayirCount} oy)</span>
                          <span className="text-slate-400">%{hayirPercent}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-slate-300 h-2.5 rounded-full transition-all duration-500" style={{ width: `${hayirPercent}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Oylama Aksiyonları */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                      <div className="text-xs text-slate-400">
                        Toplam <strong>{totalVotes} komşu</strong> oy kullandı
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVotePoll(poll.id, 'evet')}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                            poll.userVote === 'evet'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Evet
                        </button>

                        <button
                          onClick={() => handleVotePoll(poll.id, 'hayir')}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            poll.userVote === 'hayir'
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Hayır
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Geçmişte Kabul Edilen Meclis Kararları */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Karara Bağlanan Mahalle Talepleri
              </h3>
              <div className="divide-y divide-slate-100 text-xs text-slate-600">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-800">✅ 3. Sokak Hız Kasısi ve Uyarı Levhaları Yapımı</span>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Tamamlandı</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-800">✅ Çocuk Parkı Aydınlatma Direklerinin Yenilenmesi</span>
                  <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Uygulamada</span>
                </div>
              </div>
            </div>
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
                  Mutlular mahallemizin güvenilir fırınları, bakkalları, ustaları ve yerel dükkanları.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Store className="w-3.5 h-3.5" /> 45 Onaylı Esnaf
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'tumu', label: 'Tüm Esnaflar' },
                { id: 'firin', label: '🥖 Fırın & Ekmek' },
                { id: 'market', label: '🛒 Market & Bakkal' },
                { id: 'tamir', label: '🔧 Tesisat & Tamirat' },
                { id: 'kasap', label: '🥩 Kasap & Şarküteri' },
                { id: 'terzi', label: '🧵 Terzi & Kuru Temizleme' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEsnafCategoryFilter(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    esnafCategoryFilter === item.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Esnaf Kartları Listesi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'e1',
                  name: 'Mutlular Taş Fırını',
                  category: 'Fırın & Unlu Mamüller',
                  desc: '30 yıldır odun ateşinde taş fırın ekmeği, simit, poğaça ve ramazan pidesi üretimi.',
                  rating: 4.9,
                  phone: '0532 999 88 77',
                  address: 'Mutlular Cad. No: 14',
                  image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
                  badge: 'Günün İndirimi'
                },
                {
                  id: 'e2',
                  name: 'Yıldız Elektrik & Aydınlatma',
                  category: 'Elektrik & Aydınlatma',
                  desc: 'Ev sigorta değişimi, avize montajı, LED aydınlatma ve 7/24 acil arıza servisi.',
                  rating: 4.8,
                  phone: '0533 111 22 33',
                  address: 'Fatih Cad. No: 22',
                  image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                  badge: 'Yetkili Esnaf'
                },
                {
                  id: 'e3',
                  name: 'Emek Su Tesisatı & Doğalgaz',
                  category: 'Tesisat & Sıhhi Tesisat',
                  desc: 'Kırmadan cihazla su kaçağı tespiti, musluk tamiri, kombi petek temizliği.',
                  rating: 4.9,
                  phone: '0544 555 66 77',
                  address: 'Mutlular Sokak No: 8',
                  image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
                  badge: 'Acil Usta'
                },
                {
                  id: 'e4',
                  name: 'Ekin Bakkal & Şarküteri',
                  category: 'Market & Bakkal',
                  desc: 'Taze köy yumurtası, günlük süt, tulum peyniri ve temel ihtiyaç ürünleri.',
                  rating: 4.7,
                  phone: '0555 444 33 22',
                  address: 'Park Meydanı No: 5',
                  image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                  badge: 'Gece Açık'
                },
                {
                  id: 'e5',
                  name: 'Mutlular Kasabı',
                  category: 'Kasap & Et Ürünleri',
                  desc: 'Yerli besi dana kıyma, kuşbaşı, kuzu pirzola ve özel ev yapımı köfte.',
                  rating: 4.9,
                  phone: '0532 888 77 66',
                  address: 'Cumhuriyet Cad. No: 18',
                  image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
                  badge: 'Yerli Besi'
                },
                {
                  id: 'e6',
                  name: 'Terzi Selim Usta',
                  category: 'Terzi & Tadilat',
                  desc: 'Pantolon paçası, fermuar değişimi, ceket daraltma ve kuru temizleme teslimat.',
                  rating: 5.0,
                  phone: '0535 777 88 99',
                  address: 'Pazar Yolu No: 3',
                  image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=600&q=80',
                  badge: 'Usta Esnaf'
                }
              ].map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                      {shop.badge}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> {shop.rating}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {shop.category}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1">
                        {shop.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {shop.desc}
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{shop.address}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => openWhatsApp(shop.phone, `Merhaba ${shop.name}, Dijital Mutlular üzerinden yazıyorum.`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button
                        onClick={() => openDialer(shop.phone)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
                        title="Dükkanı Ara"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  showToast('Tüm bildirimler okundu olarak işaretlendi!');
                }}
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
              {notifications
                .filter(n => notifTab === 'tumu' || (notifTab === 'unread' && !n.read) || (notifTab === 'duyuru' && n.type === 'duyuru'))
                .map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.type === 'sondakika') {
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
                { title: 'Mahalle Meclisi', icon: Megaphone, count: '3 Anket', tab: 'meclis', color: 'bg-blue-50 text-blue-600' },
                { title: 'Esnaf & Dükkanlar', icon: Store, count: '45 Kayıt', tab: 'esnaf', color: 'bg-emerald-50 text-emerald-600' },
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
                    setShowCampaignModal(true);
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
                  onClick={() => handleShareWhatsApp(selectedNews)}
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
            {/* SON DAKİKA Rozeti */}
            <div>
              <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                SON DAKİKA
              </span>
            </div>

            {/* Manşet Başlığı */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
              {selectedNews.baslik}
            </h1>

            {/* Yazar Bilgisi Şeridi */}
            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  MH
                </div>
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1">
                    <span>Mutlular Haber</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    2 saat önce · 1.8K görüntülenme
                  </div>
                </div>
              </div>

              <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> 1.8K
              </span>
            </div>

            {/* Büyük Manşet Fotoğrafı */}
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200/80">
              <img
                src={selectedNews.imageURL || "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80"}
                alt={selectedNews.baslik}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Haber Metni */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                {selectedNews.icerik || selectedNews.ozet || "Mahallemizin merkezinde yer alan eski atıl alan, belediyemizin ve mahalle sakinlerimizin ortak çalışmasıyla modern bir yaşam ve dinlenme parkına dönüştürüldü. Proje kapsamında çocuk oyun alanları, tartan pist yürüyüş yolları ve oturma kamelyaları mahalleye kazandırıldı."}
              </p>
              <p>
                Parkta çocuklar için güvenli kauçuk zeminli oyun grupları, spor yapmak isteyen komşularımız için açık hava fitness aletleri ve yürüyüş parkuru yer alıyor. Ayrıca çevre aydınlatması yenilenerek 24 saat aydınlık ve güvenli bir ortam oluşturuldu.
              </p>
              <p>
                Açılış törenine mahalle muhtarımız ve çok sayıda sakin katıldı. Muhtarımız yaptığı konuşmada "Mahallemize yakışır, yeşille iç içe güzel bir yaşam alanı kazandırdık. Tüm komşularımıza hayırlı olsun" dedi.
              </p>
            </div>

            {/* Tepkiler & Etkileşim Çubuğu */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-600">
              <button
                onClick={() => {
                  setSelectedNews({ ...selectedNews, begeniSayisi: (selectedNews.begeniSayisi || 128) + 1 });
                  showToast('Beğenildi! 👍');
                }}
                className="flex items-center gap-1.5 font-bold hover:text-red-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <ThumbsUp className="w-4 h-4 text-slate-500" />
                <span>{selectedNews.begeniSayisi || 128}</span>
              </button>

              <div className="flex items-center gap-1.5 font-bold px-2 py-1">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>{(commentsMap[selectedNews.id || 'haber_park']?.length || 0) + 43}</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-amber-500 px-2 py-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{newsRatingMap[selectedNews.id || 'haber_park'] ? (newsRatingMap[selectedNews.id || 'haber_park'].score).toFixed(1) : '4.8'}</span>
              </div>

              <button
                onClick={() => handleShareWhatsApp(selectedNews)}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Paylaş</span>
              </button>
            </div>

            {/* ⭐ İNTERAKTİF HABER PUANLAMA KUTUSU (SCREEN 2) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs text-center space-y-2">
              <h4 className="text-xs font-black text-slate-900">Bu habere puan verin</h4>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const currentScore = newsRatingMap[selectedNews.id || 'haber_park']?.score || 4.8;
                  const isFilled = starVal <= Math.round(currentScore);
                  return (
                    <button
                      key={starVal}
                      onClick={() => {
                        const newsId = selectedNews.id || 'haber_park';
                        const current = newsRatingMap[newsId] || { score: 4.8, count: 124 };
                        const newCount = current.count + 1;
                        const newScore = ((current.score * current.count) + starVal) / newCount;
                        setNewsRatingMap(prev => ({
                          ...prev,
                          [newsId]: { score: newScore, count: newCount }
                        }));
                        showToast(`Puanınız kaydedildi: ${starVal} Yıldız ⭐`);
                      }}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                {newsRatingMap[selectedNews.id || 'haber_park'] 
                  ? `${newsRatingMap[selectedNews.id || 'haber_park'].score.toFixed(1)} / 5 (${newsRatingMap[selectedNews.id || 'haber_park'].count} oy)`
                  : '4.8 / 5 (124 oy)'}
              </p>
            </div>

            {/* 💬 YORUMLAR BÖLÜMÜ (SCREEN 2) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Yorumlar ({(commentsMap[selectedNews.id || 'haber_park']?.length || 0) + 43})
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  En İyi Yorumlar
                </span>
              </div>

              {/* Yorum Listesi */}
              <div className="space-y-3">
                {/* Sabit Mockup Yorum 1: Ayşe Yılmaz */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                        alt="Ayşe Yılmaz"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-900">Ayşe Yılmaz</div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-2.5 h-2.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-200">
                        MAHALLE YORUMU
                      </span>
                      <span className="text-[10px] text-slate-400">2 dk önce</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Harika bir gelişme! Çocuklar çok mutlu oldu. Emeği geçen herkese teşekkürler.
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold pt-1">
                    <button 
                      onClick={() => showToast('Beğenildi ❤️')}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" /> 12
                    </button>
                    <button 
                      onClick={() => showToast('Yanıt yazma alanı açıldı')}
                      className="hover:text-slate-800 cursor-pointer"
                    >
                      Yanıtla
                    </button>
                  </div>
                </div>

                {/* Sabit Mockup Yorum 2: Mehmet Demir */}
                <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                        alt="Mehmet Demir"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-900">Mehmet Demir</div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-2.5 h-2.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400">15 dk önce</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Çok güzel düşünülmüş, özellikle yürüyüş yolları çok kullanışlı.
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold pt-1">
                    <button 
                      onClick={() => showToast('Beğenildi ❤️')}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" /> 5
                    </button>
                    <button 
                      onClick={() => showToast('Yanıt yazma alanı açıldı')}
                      className="hover:text-slate-800 cursor-pointer"
                    >
                      Yanıtla
                    </button>
                  </div>
                </div>

                {/* Kullanıcının Eklediği Yorumlar */}
                {(commentsMap[selectedNews.id || 'haber_park'] || []).map((comm) => (
                  <div key={comm.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.authorAvatar}
                          alt={comm.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-black text-slate-900">{comm.authorName}</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= (comm.stars || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-200">
                          MAHALLE YORUMU
                        </span>
                        <span className="text-[10px] text-slate-400">{comm.timeAgo}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {comm.text}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold pt-1">
                      <button 
                        onClick={() => showToast('Beğenildi ❤️')}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" /> {comm.likes}
                      </button>
                      <button 
                        onClick={() => showToast('Yanıt yazma alanı açıldı')}
                        className="hover:text-slate-800 cursor-pointer"
                      >
                        Yanıtla
                      </button>
                    </div>
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
                if (!newCommentInput.trim()) return;
                const newsId = selectedNews.id || 'haber_park';
                const newCommentObj = {
                  id: `comm_${Date.now()}`,
                  authorName: profile?.name || user?.displayName || 'Mehmet Yılmaz',
                  authorAvatar: profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                  stars: 5,
                  text: newCommentInput.trim(),
                  timeAgo: 'Az önce',
                  likes: 1
                };
                setCommentsMap(prev => ({
                  ...prev,
                  [newsId]: [newCommentObj, ...(prev[newsId] || [])]
                }));
                setNewCommentInput('');
                showToast('Yorumunuz yayınlandı! 💬');
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
                  placeholder="Yorum yaz..."
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
                  authorPhone: telefonInput || profile?.telefon || '0532 111 22 33',
                  authorRole: profile?.role || demoRole || 'sakin',
                  authorUid: user?.uid || 'user_demo',
                  sonDakika: isDirectPublish ? sonDakikaInput : false,
                  imageURL: fotoInput || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80",
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
                  <input name="telefon" type="tel" defaultValue={profile?.telefon || '0532 111 22 33'} placeholder="053x xxx xx xx" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
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
                const davetiyeFoto = (form.elements.namedItem('davetiyeFoto') as HTMLInputElement).value || 
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

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
                <PhotoUploadField name="davetiyeFoto" defaultValue="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" folder="mutlular_haber/davetler" accentClass="bg-pink-600 hover:bg-pink-700 text-white" />
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
                  const metrekare = parseInt((form.elements.namedItem('metrekare') as HTMLInputElement).value) || 100;
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
                    fotolar: [fotoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80']
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
                    fotolar: [fotoUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80']
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
                  defaultValue={
                    marketModalType === 'emlak'
                      ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
                  }
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
                  fotolar: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80"]
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
                  <input required name="iletisimTelefon" defaultValue="05321112233" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Detaylı Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Özellikler, tasma rengi, ayırt edici işaret..." className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none" />
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

              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-black text-xs text-gray-900 mb-2 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" /> Esnaflardan Gelen Teklifler ({offersMap[showRequestDetail.id || '']?.length || 0})
                </h4>

                <div className="space-y-2">
                  {(offersMap[showRequestDetail.id || ''] || []).map((off, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-gray-900">{off.esnafIsyeri}</span>
                        <span className="font-black text-sm text-emerald-600">{off.fiyat} TL</span>
                      </div>
                      <p className="text-xs text-gray-600">{off.mesaj}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-400">⏱️ {off.tahminiSure || 'Aynı Gün'}</span>
                        <button
                          onClick={() => openWhatsApp(off.esnafTelefon, `Merhaba ${off.esnafIsyeri}, verdiğiniz ${off.fiyat} TL'lik teklifi kabul etmek istiyorum.`)}
                          className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Kabul Et &amp; Yaz
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!offersMap[showRequestDetail.id || ''] || offersMap[showRequestDetail.id || ''].length === 0) && (
                    <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400">
                      Henüz esnaflardan teklif gelmedi. İlgili kategorideki ustalara bildirim iletildi.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: YENİ HİZMET TALEBİ AÇ (TEKLİF AL) ── */}
      {showServiceModal && (() => {
        const activeMainCat = MAIN_SERVICE_CATEGORIES.find(c => c.id === modalMainCatId) || 
          MAIN_SERVICE_CATEGORIES.find(c => c.name === selectedServiceSector) || 
          MAIN_SERVICE_CATEGORIES[0];
        
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

                  const newReq: ServiceRequest = {
                    authorName: profile?.name || 'Mahalle Sakini',
                    telefon: newServiceReqPhone || profile?.telefon || '05321112233',
                    kategori: activeMainCat?.name || selectedServiceSector,
                    altKategori: modalSubCatName || activeSubCat?.name,
                    baslik: newServiceReqTitle.trim() || `${modalSubCatName || activeMainCat?.name} Talebi`,
                    aciklama: newServiceReqDesc.trim(),
                    adres: newServiceReqAddress.trim() || 'Mutlular Mahallesi',
                    status: 'open',
                    offerCount: 0,
                    fotolar: newServiceReqPhoto ? [newServiceReqPhoto] : [
                      PHOTO_PRESETS.find(p => p.label.includes(activeSubCat?.name?.split(' ')[0] || ''))?.url ||
                      PHOTO_PRESETS.find(p => p.label.includes(activeMainCat?.shortTitle?.split(' ')[0] || ''))?.url ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                    ],
                    uid: user?.uid || 'sakin_1'
                  };

                  setServiceRequests([newReq, ...serviceRequests]);
                  try {
                    await addDoc(collection(db, 'service_requests'), {
                      ...newReq,
                      urgent: newServiceReqUrgent,
                      createdAt: serverTimestamp()
                    });
                  } catch (_) {}

                  setShowServiceModal(false);
                  setNewServiceReqTitle('');
                  setNewServiceReqDesc('');
                  setNewServiceReqPhoto('');
                  setNewServiceReqUrgent(false);
                  showToast(`${activeMainCat?.name} (${modalSubCatName}) talebiniz yayınlandı! Mahalle ustalarına bildirim gitti 🛠️`);
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
                      const cat = MAIN_SERVICE_CATEGORIES.find(c => c.id === newCatId);
                      if (cat) {
                        setSelectedServiceSector(cat.name);
                        if (cat.subCategories.length > 0) {
                          setModalSubCatName(cat.subCategories[0].name);
                        }
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                  >
                    {MAIN_SERVICE_CATEGORIES.map((cat) => (
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
                    {MAIN_SERVICE_CATEGORIES.map((cat) => (
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
                    Henüz fotoğraf eklenmemiş. Aşağıdan fotoğraf yükleyebilir veya hazır görsellerden seçebilirsiniz.
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

                {/* Hızlı Örnek Görseller */}
                <div className="space-y-1 pt-1.5 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500">Hızlı Örnek Görsel Ekle:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((preset, prIdx) => (
                      <button
                        key={prIdx}
                        type="button"
                        onClick={() => handleAddPhotoToEdit(preset.url)}
                        className="text-[10px] font-semibold bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
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
                  <div className="grid grid-cols-2 gap-2.5">
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

                    {/* Esnaf Seçeneği */}
                    <button
                      type="button"
                      onClick={() => setAuthRole('esnaf')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative ${
                        authRole === 'esnaf'
                          ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-sm ring-1 ring-amber-500'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">🏪</span>
                        {authRole === 'esnaf' && (
                          <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Seçildi
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-gray-900">Esnaf & Usta</span>
                        <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                          Taleplere teklif ver, komşulara hizmet sağla, iş al
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

              {/* ESNAF SEÇİLDİYSE: DÜKKAN / İŞLETME & UZMANLIK ALANI */}
              {authMode === 'register' && authRole === 'esnaf' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Esnaf / İşyeri Detayları</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      İşletme / Dükkan veya Usta Ünvanı <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={authRole === 'esnaf'}
                        value={authIsyeri}
                        onChange={(e) => setAuthIsyeri(e.target.value)}
                        placeholder="Örn: Mutlular Sıhhi Tesisat veya Hasan Usta"
                        className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Faaliyet / Hizmet Alanı
                    </label>
                    <select
                      value={authEsnafKategori}
                      onChange={(e) => setAuthEsnafKategori(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Tesisat & Su">Tesisat &amp; Su</option>
                      <option value="Elektrik & Aydınlatma">Elektrik &amp; Aydınlatma</option>
                      <option value="Boya & Badana / Tadilat">Boya &amp; Badana / Tadilat</option>
                      <option value="Tamirat & Mobilya Montaj">Tamirat &amp; Mobilya Montaj</option>
                      <option value="Temizlik & İlaçlama">Temizlik &amp; İlaçlama</option>
                      <option value="Bakkal, Market & Şarküteri">Bakkal, Market &amp; Şarküteri</option>
                      <option value="Kuaför & Kişisel Bakım">Kuaför &amp; Kişisel Bakım</option>
                      <option value="Çilingir & Anahtar">Çilingir &amp; Anahtar</option>
                      <option value="Diğer Mahalle Hizmeti">Diğer Mahalle Hizmeti</option>
                    </select>
                  </div>

                  <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start gap-2">
                    <span className="text-base shrink-0">🎁</span>
                    <span>
                      <strong>Hoşgeldin Hediyesi:</strong> Mahalle esnafı kaydınızla birlikte hizmet taleplerine teklif verebilmeniz için <strong>10 Ücretsiz Teklif Kredisi</strong> hesabınıza tanımlanacaktır.
                    </span>
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
                  authRole === 'esnaf' && authMode === 'register'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                }`}
              >
                {authMode === 'login' ? (
                  'Giriş Yap'
                ) : authRole === 'esnaf' ? (
                  <>
                    <Building2 className="w-4 h-4" /> Esnaf Olarak Kayıt Ol (10 Kredi Hediyeli)
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

                {/* Hızlı Hazır Avatarlar */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Örnek:</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    {[
                      { label: '👨 Komşu', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
                      { label: '👩 Sakin', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
                      { label: '👴 Emekli', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
                      { label: '🛠️ Usta', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' },
                    ].map((av, avIdx) => (
                      <button
                        key={avIdx}
                        type="button"
                        onClick={() => setEditPhotoURL(av.url)}
                        className="text-[10px] font-bold bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 px-2 py-0.5 rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        {av.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'sakin' | 'esnaf')}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                >
                  <option value="sakin">🏡 Mahalle Sakini</option>
                  <option value="esnaf">🏪 Mahalle Esnafı &amp; Usta</option>
                </select>
              </div>

              {editRole === 'esnaf' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-amber-950 block">Esnaf &amp; Usta Profil Detayları</span>
                  
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">İşletme / Dükkan Ünvanı</label>
                    <input
                      type="text"
                      value={editIsyeri}
                      onChange={(e) => setEditIsyeri(e.target.value)}
                      placeholder="Örn: Mutlular Tesisat &amp; Kombi"
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Hizmet Kategorisi</label>
                    <select
                      value={editEsnafKategori}
                      onChange={(e) => setEditEsnafKategori(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    >
                      <option value="Tesisat &amp; Su">Tesisat &amp; Su</option>
                      <option value="Elektrik &amp; Aydınlatma">Elektrik &amp; Aydınlatma</option>
                      <option value="Boya &amp; Badana / Tadilat">Boya &amp; Badana / Tadilat</option>
                      <option value="Tamirat &amp; Mobilya Montaj">Tamirat &amp; Mobilya Montaj</option>
                      <option value="Düğün, Nişan &amp; Doğum Günü">Düğün, Nişan &amp; Doğum Günü</option>
                      <option value="Temizlik &amp; İlaçlama">Temizlik &amp; İlaçlama</option>
                      <option value="Bakkal, Market &amp; Şarküteri">Bakkal, Market &amp; Şarküteri</option>
                      <option value="Kuaför &amp; Kişisel Bakım">Kuaför &amp; Kişisel Bakım</option>
                      <option value="Çilingir &amp; Anahtar">Çilingir &amp; Anahtar</option>
                      <option value="Diğer Mahalle Hizmeti">Diğer Mahalle Hizmeti</option>
                    </select>
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

                  {/* Vergi Levhası / Belge Fotoğrafı */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Vergi Levhası / Belge Fotoğrafı</label>
                    <PhotoUploadField value={editVergiLevhasiFoto} onChange={setEditVergiLevhasiFoto} folder="mutlular_haber/belgeler" buttonLabel="Belge Fotoğrafı Yükle" accentClass="bg-amber-600 hover:bg-amber-700 text-white" />
                  </div>

                  {/* Uzmanlık Etiketleri */}
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
                  <h3 className="font-black text-lg text-slate-900">Usta &amp; Esnaf Olarak Katıl</h3>
                  <p className="text-xs text-slate-500">Mutlular Mahallesi usta rehberine katılın, komşulardan teklif talebi alın.</p>
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
                    İşletme / Dükkan Ünvanı <span className="text-red-500">*</span>
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

                {/* Hizmet Sektörü / Kategorisi */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Hizmet Kategorisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={artisanCategory}
                    onChange={(e) => setArtisanCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="Tesisat &amp; Su">Tesisat &amp; Su</option>
                    <option value="Elektrik &amp; Aydınlatma">Elektrik &amp; Aydınlatma</option>
                    <option value="Boya &amp; Badana / Tadilat">Boya &amp; Badana / Tadilat</option>
                    <option value="Tamirat &amp; Mobilya Montaj">Tamirat &amp; Mobilya Montaj</option>
                    <option value="Düğün, Nişan &amp; Doğum Günü">Düğün, Nişan &amp; Doğum Günü</option>
                    <option value="Temizlik &amp; İlaçlama">Temizlik &amp; İlaçlama</option>
                    <option value="Bakkal, Market &amp; Şarküteri">Bakkal, Market &amp; Şarküteri</option>
                    <option value="Kuaför &amp; Kişisel Bakım">Kuaför &amp; Kişisel Bakım</option>
                    <option value="Çilingir &amp; Anahtar">Çilingir &amp; Anahtar</option>
                    <option value="Diğer Mahalle Hizmeti">Diğer Mahalle Hizmeti</option>
                  </select>
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
                    İşletme Adresi <span className="text-red-500">*</span>
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

                {/* Vergi Levhası / Ustalık Belgesi (Fotoğraf) */}
                <div className="sm:col-span-2 space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Vergi Levhası / Ustalık Belgesi (Fotoğraf)</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Güven Rozeti Kazandırır
                    </span>
                  </div>

                  <PhotoUploadField value={artisanTaxPlatePhoto} onChange={setArtisanTaxPlatePhoto} folder="mutlular_haber/belgeler" buttonLabel="Belge Fotoğrafı Yükle" accentClass="bg-amber-600 hover:bg-amber-700 text-white" />

                  {/* Hazır Örnek Belge Seçenekleri */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Örnek:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                      {[
                        { label: '📜 Vergi Levhası', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80' },
                        { label: '🛠️ Ustalık Belgesi', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80' },
                        { label: '🏪 Dükkan / Tabela', url: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=600&q=80' },
                      ].map((preset, prIdx) => (
                        <button
                          key={prIdx}
                          type="button"
                          onClick={() => setArtisanTaxPlatePhoto(preset.url)}
                          className="text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 px-2 py-0.5 rounded-lg transition-all shrink-0 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {artisanTaxPlatePhoto && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={artisanTaxPlatePhoto}
                        alt="Belge Önizleme"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="text-[11px] text-slate-600 font-medium">Belge görseli hazırlandı. Profilde ve tekliflerinizde onay rozetiyle gösterilir.</span>
                    </div>
                  )}
                </div>

                {/* Uzmanlık Etiketleri */}
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
                    <h5 className="font-black text-xs sm:text-sm">10 Ücretsiz Teklif Kredisi Hediye!</h5>
                    <p className="text-[11px] text-amber-100 mt-0.5">
                      Esnaf hesabınız açıldığında mahalle taleplerine anında teklif verebilmeniz için 10 kredi doğrudan cüzdanınıza tanımlanacaktır.
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
                İlanınız anında en üstteki <strong>Vefat &amp; Taziye</strong> şeridine ve şehir vefat bültenine eklenerek tüm mahalleye duyurulacaktır.
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
                      {selectedEmlakItem.metrekare || 135} m² / {Math.round((selectedEmlakItem.metrekare || 135) * 0.88)} m²
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
                      {selectedEmlakItem.otopark !== false ? 'Açık Otopark' : 'Sokak'} · ₺{selectedEmlakItem.aidat || 200}/ay
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
                    {MAIN_SERVICE_CATEGORIES.map((cat) => {
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
                  {MAIN_SERVICE_CATEGORIES.find(c => c.name === armutSelectedCat) && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Spesifik Alt Hizmet / İhtiyaç:
                      </label>
                      <select
                        value={armutSelectedSub}
                        onChange={(e) => setArmutSelectedSub(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
                      >
                        {MAIN_SERVICE_CATEGORIES.find(c => c.name === armutSelectedCat)?.subCategories.map((sub) => (
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
                        const newReq: ServiceRequest = {
                          authorName: profile?.name || user?.displayName || 'Mahalle Sakini',
                          telefon: armutPhone || profile?.telefon || '05330001122',
                          kategori: armutSelectedCat,
                          altKategori: armutSelectedSub,
                          baslik: `${armutSelectedSub} (${armutTiming})`,
                          aciklama: armutDetail.trim() || `${armutSelectedCat} alanında hizmete ihtiyacım var.`,
                          adres: armutAddress,
                          status: 'open',
                          offerCount: 0,
                          fotolar: [
                            'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'
                          ],
                          uid: user?.uid || 'sakin_1'
                        };

                        setServiceRequests(prev => [newReq, ...prev]);
                        try {
                          await addDoc(collection(db, 'service_requests'), {
                            ...newReq,
                            createdAt: serverTimestamp()
                          });
                        } catch (_) {}

                        setArmutStep(4);
                        showToast('Hizmet talebiniz oluşturuldu! Mahalle ustaları bilgilendirildi. 👍');
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

              {/* Nöbetçi Eczaneler Hızlı Butonu */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-sm">
                    💊
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-emerald-950">Nöbetçi Eczaneler</h4>
                    <p className="text-[11px] text-emerald-700">Bugün nöbetçi olan en yakın eczaneler</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setActiveCityModal('eczane');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  Listeyi Gör
                </button>
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

      {/* ── 📺 MUTLULAR TV CANLI YAYIN MODALI ── */}
      {mutlularTvActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          {/* Karartma Backdrop */}
          <div 
            onClick={() => setMutlularTvActive(false)} 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
          />

          <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            {/* Canlı Yayın Üst Başlık Çubuğu */}
            <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  CANLI
                </span>
                <span className="font-black text-sm text-slate-100 tracking-tight">
                  📺 Mutlular TV Canlı Yayını
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-black/40 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 text-slate-300 border border-slate-800">
                  <Eye className="w-3.5 h-3.5 text-red-400" /> 542 Sakin İzliyor
                </span>
                <button
                  onClick={() => setMutlularTvActive(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[16/9] w-full bg-black group overflow-hidden">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={tvMuted}
                playsInline
                poster="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              />

              {/* Ses Aç / Kapat Butonu */}
              <button
                onClick={() => setTvMuted(!tvMuted)}
                className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 p-2 rounded-xl text-white transition-all cursor-pointer backdrop-blur-md border border-white/10"
                title={tvMuted ? "Sesi Aç" : "Sesi Kapat"}
              >
                {tvMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Program Detayı ve Etkileşim Barı */}
            <div className="p-4 space-y-3.5 overflow-y-auto bg-slate-900/60">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                  GÜNCEL YAYIN AKIŞI
                </span>
                <h3 className="font-black text-base sm:text-lg text-white leading-snug">
                  🎙️ Mutlular Mahalle Meclisi &amp; Muhtarlık Haftalık Bilgilendirme Bülteni
                </h3>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Mahallemizdeki altyapı çalışmaları, yeni park projesi ve esnaf dayanışma bülteni canlı yayında mahalle sakinlerimizin katılımıyla görüşülüyor.
                </p>
              </div>

              {/* Etkileşim Butonları */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!hasLikedTv) {
                        setTvLikes(prev => prev + 1);
                        setHasLikedTv(true);
                        showToast('Canlı yayına beğeni gönderildi! ❤️');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasLikedTv ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLikedTv ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
                    <span>{tvLikes} Beğeni</span>
                  </button>

                  <button
                    onClick={() => showToast('Canlı sohbet paneli aktiftir. Mahalle sakinleri yorumlarını paylaşıyor.')}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>48 Canlı Yorum</span>
                  </button>
                </div>

                <button
                  onClick={() => setMutlularTvActive(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-white transition-all cursor-pointer ml-auto border border-white/10"
                >
                  Yayın Penceresini Kapat
                </button>
              </div>
            </div>
          </div>
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
        contentSections={adminContentSections}
        onDeleteContent={handleAdminDeleteContent}
        onDeleteAllContent={handleAdminDeleteAllContent}
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
