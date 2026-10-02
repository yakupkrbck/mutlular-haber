export interface PharmacyItem {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  directionsUrl: string;
}

export interface NotaryItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  note: string;
}

export interface TaxiStandItem {
  id: string;
  name: string;
  location: string;
  phone: string;
  vehicleCount: string;
}

export interface BusRouteItem {
  id: string;
  code: string;
  name: string;
  route: string;
  firstBus: string;
  lastBus: string;
  frequency: string;
  stops: string[];
}

export interface DeceasedItem {
  id: string;
  fullName: string;
  age?: number;
  family: string;
  mosque: string;
  prayerTime: string;
  cemetery: string;
  dateStr: string;
  uid?: string;
  authorName?: string;
  createdAt?: any;
  status?: 'pending' | 'published' | 'rejected';
  publishedAt?: any;
}

export interface TouristSpotItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string;
  highlights: string[];
}

export interface FoodPlaceItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  minOrder: string;
  deliveryTime: string;
  specialty: string;
  phone: string;
  imageUrl: string;
}

export interface JobListingItem {
  id: string;
  title: string;
  company: string;
  category: string;
  salary: string;
  location: string;
  phone: string;
  type: string;
}

export interface EventItem {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string;
  location: string;
  category: string;
  organizer: string;
  imageUrl: string;
}

// 🏥 Nöbetçi Eczaneler (Mutlular & Osmangazi Çevresi)

// 📜 Nöbetçi Noterler (Osmangazi / Bursa)
export const NOTARIES: NotaryItem[] = [
  {
    id: 'n1',
    name: 'Bursa 8. Noterliği (Hafta Sonu Nöbetçi)',
    address: 'Fevzi Çakmak Cad. Çarşı Durağı Yanı Kat: 2',
    phone: '0224 221 40 40',
    hours: 'Cumartesi & Pazar: 10:00 - 16:00',
    note: 'Araç satış, devir, vekaletname ve noter tasdik işlemleri kesintisiz yapılmaktadır.'
  },
  {
    id: 'n2',
    name: 'Bursa 14. Noterliği',
    address: 'Santral Garaj Kent Meydanı Karşısı Kat: 1',
    phone: '0224 252 70 80',
    hours: 'Hafta İçi: 09:00 - 17:30',
    note: 'Ticari ve bireysel tüm noterlik işlemleri.'
  }
];

// 🚕 Taksi Durakları (Mutlular ve Çevresi 7/24)
export const TAXI_STANDS: TaxiStandItem[] = [
  {
    id: 't1',
    name: 'Mutlular Meydan Taksi',
    location: 'Mutlular Parkı Karşısı, Çınaraltı Durağı',
    phone: '0224 233 11 22',
    vehicleCount: '8 Araç (7/24 Hizmetinizde)'
  },
  {
    id: 't2',
    name: 'Kanalboyu Merkez Taksi',
    location: 'Kanalboyu Caddesi Köprü Başı',
    phone: '0224 234 55 66',
    vehicleCount: '10 Araç (7/24 Aktif)'
  },
  {
    id: 't3',
    name: 'Merinos Kent Taksi',
    location: 'Merinos Parkı Doğu Çıkışı',
    phone: '0224 250 80 80',
    vehicleCount: '12 Araç (7/24 Hizmetinizde)'
  }
];

// 🚌 Otobüs Saatleri (Mutlular Mahallesi Hatları)
export const BUS_ROUTES: BusRouteItem[] = [
  {
    id: 'b1',
    code: '15/D',
    name: 'Mutlular Mah. - Çarşı - Heykel',
    route: 'Mutlular Meydanı ➔ Kanalboyu ➔ Çirişhane ➔ Şehreküstü ➔ Heykel',
    firstBus: '06:15',
    lastBus: '23:45',
    frequency: 'Her 12 dakikada bir',
    stops: ['Mutlular Muhtarlık', 'Fatih Camii', 'Kanalboyu', 'Merinos İstasyonu', 'Şehreküstü', 'Heykel']
  },
  {
    id: 'b2',
    code: 'B/2',
    name: 'Mutlular - Kent Meydanı - Terminal',
    route: 'Mutlular Mahallesi ➔ Soğanlı ➔ Santral Garaj ➔ Bursa Şehirlerarası Otobüs Terminali',
    firstBus: '06:30',
    lastBus: '23:00',
    frequency: 'Her 15 dakikada bir',
    stops: ['Mutlular Parkı', 'Soğanlı Giriş', 'Kent Meydanı AVM', 'Terminal Ana Giriş']
  },
  {
    id: 'b3',
    code: '19/C',
    name: 'Mutlular Ring - Üniversite Bağlantı',
    route: 'Mutlular ➔ Acemler Bursaray İstasyonu ➔ Uludağ Üniversitesi Görükle',
    firstBus: '07:00',
    lastBus: '22:30',
    frequency: 'Her 20 dakikada bir',
    stops: ['Mutlular Çınaraltı', 'Kanalboyu', 'Acemler Aktarma Merkezi', 'Tıp Fakültesi']
  }
];

// 🕊️ Kaybettiklerimiz (Mutlular Vefat & Taziye)
export const DECEASED_ITEMS: DeceasedItem[] = [
  {
    id: 'd1',
    fullName: 'Hacı Ahmet Demirtaş',
    age: 78,
    family: 'Demirtaş ve Öztürk Ailelerinin Kıymetli Büyüğü',
    mosque: 'Mutlular Fatih Camii',
    prayerTime: 'Öğle Namazını Müteakip',
    cemetery: 'Hamitler Kent Mezarlığı',
    dateStr: 'Bugün'
  },
  {
    id: 'd2',
    fullName: 'Ayşe Karaca (Emekli Öğretmen)',
    age: 69,
    family: 'Karaca ve Şahin Ailelerinin Acı Kaybı',
    mosque: 'Mutlular Çınaraltı Camii',
    prayerTime: 'İkindi Namazını Müteakip',
    cemetery: 'Erdoğanköy Aile Kabristanlığı',
    dateStr: 'Bugün'
  },
  {
    id: 'd3',
    fullName: 'Mustafa Yılmaz (Mahalle Esnafı)',
    age: 64,
    family: 'Yılmaz Manav & Bakkaliye Ailesi',
    mosque: 'Kanalboyu Merkez Camii',
    prayerTime: 'Öğle Namazını Müteakip',
    cemetery: 'Hamitler Mezarlığı',
    dateStr: 'Dün'
  }
];

// 🏞️ Mahalle ve Şehir Rehberi (Gezilecek Yerler & Parklar)

// 🍽️ Yemek & Mahalle Restoranları
export const FOOD_PLACES: FoodPlaceItem[] = [
  {
    id: 'f1',
    name: 'Mutlular Meşhur Bursa Pideli Köfte',
    category: 'Kebap & Köfte',
    rating: 4.9,
    minOrder: '180 TL',
    deliveryTime: '20-30 dk',
    specialty: 'Hakiki Pideli Köfte, Tereyağlı İskender, Şıra',
    phone: '0224 233 10 50',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'f2',
    name: 'Çınaraltı Taş Fırın & Pide Salonu',
    category: 'Fırın & Pide',
    rating: 4.8,
    minOrder: '130 TL',
    deliveryTime: '15-25 dk',
    specialty: 'Kuşbaşılı Kaşarlı Cantık, Çıtır Lahmacun, Tahinli Pide',
    phone: '0224 233 77 88',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'f3',
    name: 'Mutlular Bereket Esnaf Ev Yemekleri',
    category: 'Ev Yemekleri',
    rating: 4.9,
    minOrder: '100 TL',
    deliveryTime: '15-20 dk',
    specialty: 'Kelle Paça & Mercimek Çorbası, Güveç, Anne Köftesi, Sütlaç',
    phone: '0224 233 99 00',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  }
];

// 💼 İş İlanları (Mutlular Esnafı & Çevresi)
export const JOB_LISTINGS: JobListingItem[] = [
  {
    id: 'j1',
    title: 'A2 Ehliyetli Mahalle İçi Moto Kurye',
    company: 'Mutlular Plus Hızlı Teslimat Ağı',
    category: 'Kurye & Dağıtım',
    salary: '34.000 TL - 40.000 TL + Paket Başı Prim',
    location: 'Mutlular Mah. & Kanalboyu',
    phone: '0532 999 11 22',
    type: 'Tam Zamanlı'
  },
  {
    id: 'j2',
    title: 'Şarküteri Satış Elemanı & Kasiyer',
    company: 'Mutlular Çınar Gurme Şarküteri',
    category: 'Perakende & Satış',
    salary: '26.000 TL + Yemek + SGK',
    location: 'Mutlular Cad. No: 18',
    phone: '0544 333 44 55',
    type: 'Tam Zamanlı'
  },
  {
    id: 'j3',
    title: 'Oto Yıkama ve Detaylı Temizlik Elemanı',
    company: 'Mutlular Parlak Oto Yıkama',
    category: 'Oto Bakım',
    salary: '25.000 TL + Günlük Bahşiş',
    location: 'Kanalboyu Caddesi',
    phone: '0505 111 88 99',
    type: 'Tam Zamanlı'
  }
];

// 🎪 Mahalle Etkinlikleri & Buluşmaları
export const COMMUNITY_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Mutlular Mahalle Meclisi & Komşuluk Kahvaltısı',
    dateStr: 'Bu Pazar',
    timeStr: '09:30 - 12:00',
    location: 'Mutlular Parkı Açık Hava Çay Bahçesi',
    category: 'Komşuluk & Buluşma',
    organizer: 'Mutlular Mahallesi Muhtarlığı & Gönüllüler',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'e2',
    title: 'Açık Hava Mahalle Sineması & Çocuk Şenliği',
    dateStr: 'Cumartesi Akşamı',
    timeStr: '20:00',
    location: 'Fatih İlkokulu Bahçesi',
    category: 'Kültür & Çocuk',
    organizer: 'Osmangazi Belediyesi & Mutlular Dayanışması',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
  }
];
