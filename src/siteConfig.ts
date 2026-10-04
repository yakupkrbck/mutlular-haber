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
// Nöbetçi eczane ilçesi (veri hattı betiğiyle aynı olmalı: scripts/fetch-nobetci-eczane.mjs)
export const PHARMACY_DISTRICT_LABEL = 'Osmangazi / Bursa';

// Burulaş: resmi canlı otobüs takibi (Otobüsüm Nerede) ve Burulaş sitesi.
export const BURULAS_LIVE_URL = 'https://www.bursakart.com.tr/wheremybus';
export const BURULAS_SITE_URL = 'https://www.burulas.com.tr';
// Mahalleden geçen hatlar: YALNIZCA doğrulanmış gerçek hatları yazın, örn: { code: '15/H', name: 'Hat adı' }.
// Boş bırakılırsa ana sayfada hat çipi gösterilmez (uydurma hat gösterilmez).
export const LOCAL_BUS_LINES: { code: string; name: string }[] = [];
