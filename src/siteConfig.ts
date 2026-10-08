// Platform genelinde kullanılan sabit iletişim bilgileri (tek yerden değişir).
// Koordinatör WhatsApp hattı: kredi yükleme ve şehir hizmetleri mesajları bu numaraya gider.
export const COORDINATOR_PHONE_INTL = '905073848216';
export const COORDINATOR_PHONE_DISPLAY = '0507 384 82 16';

// Paylaşılan bağlantıların her zaman gerçek alan adıyla üretilmesi için (yerel geliştirmede geçerli adres kullanılır).
export const SITE_ORIGIN = 'https://www.mutlularhaber.com';

// ── Ana sayfa gerçek veri / bağlantı ayarları ──────────────────────────────
// Mahalle adı ve nöbetçi eczane adres eşleştirmesi (adres/semt metninde bu kelimeler geçerse "Mahallede" rozeti çıkar).
export const NEIGHBORHOOD_NAME = 'Mehmet Akif Mahallesi';
export const NEIGHBORHOOD_KEYWORDS = ['mehmet akif', 'mutlular'];
// Nöbetçi eczane ilçeleri (veri hattı betiğiyle aynı olmalı: scripts/fetch-nobetci-eczane.mjs → ECZANE_DISTRICTS)
export const PHARMACY_DISTRICT_LABEL = 'Bursa (Osmangazi, Nilüfer, Yıldırım)';

// Burulaş: resmi canlı otobüs takibi (Otobüsüm Nerede) ve Burulaş sitesi.
export const BURULAS_LIVE_URL = 'https://www.bursakart.com.tr/wheremybus';
export const BURULAS_SITE_URL = 'https://www.burulas.com.tr';
// BursaKart (bilet / kart yükleme) resmî sayfası.
export const BURSAKART_URL = 'https://www.bursakart.com.tr';
// Mahalleden ve yakınındaki duraktan geçen hatlar (mahalle sakinlerinin bildirdiği gerçek bilgi).
// `name` bilinmiyorsa yazılmaz; uydurma hat adı eklenmez.
export interface BusLine { code: string; name?: string }
export interface BusLineGroup { title: string; collapsible?: boolean; lines: BusLine[] }
export const LOCAL_BUS_GROUPS: BusLineGroup[] = [
  {
    title: 'Mahalleye hizmet veren hatlar',
    lines: [{ code: '15' }, { code: '15H' }, { code: 'B15' }, { code: 'B15C' }],
  },
  {
    title: 'Mahalle yakınındaki durak: Avrupa Konseyi Bulvarı Durak',
    collapsible: true,
    lines: [
      { code: '43A', name: 'Kent Güvenlik Merkezi – Uludağ Üniversitesi' },
      { code: '43H', name: 'Terminal – Uludağ Üniversitesi' },
      { code: '43HB', name: 'Terminal – Uludağ Üniversitesi' },
      { code: '92', name: 'Terminal – Beşevler' },
      { code: '92B', name: 'Terminal – Beşevler' },
      { code: '93', name: 'Terminal – Uludağ Üniversitesi' },
      { code: '95', name: 'Terminal – Ataevler' },
      { code: '95A', name: 'Terminal – Ataevler' },
      { code: '95B', name: 'Terminal – Ataevler' },
      { code: '97', name: 'Terminal – Emek' },
      { code: '97B', name: 'Terminal – Emek' },
      { code: '97F', name: 'Terminal – Geçit' },
      { code: 'B44B', name: 'Uludağ Üniversitesi – Çiftehavuzlar' },
    ],
  },
];
