// Hizmet kategorileri, sektörler ve sabit veriler (eski App.tsx 180–955).
import { COORDINATOR_PHONE_INTL } from '../siteConfig';

export const ADMIN_PHONE = COORDINATOR_PHONE_INTL; // Koordinatör WhatsApp hattı (siteConfig.ts)

export const PHOTO_PRESETS = [
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
