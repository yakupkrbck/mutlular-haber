import { 
  type NewsItem, 
  type MarketplaceItem, 
  type LostFoundItem, 
  type ServiceRequest,
  type ServiceOffer,
  type EsnafCampaign,
  type MahalleKursusuItem,
  type MahalleDavetItem,
  type UserProfile
} from './firebase';

export interface SampleNewsItem extends NewsItem {
  kategori: string;
  okunmaSayisi: number;
  begeniSayisi: number;
  tarihStr: string;
}

export const INITIAL_NEWS: SampleNewsItem[] = [
  {
    id: "haber_salla_salla",
    baslik: "Mutlular'da \"Salla Salla\" Rüzgarı",
    ozet: "Düğün ve asker eğlencelerinde sergilenen dans figürleri sosyal medyada büyük ilgi görüyor.",
    icerik: "Mutlular Mahallesi'nde son dönemde düzenlenen düğün, kına ve asker uğurlama merasimlerinde gençlerin sergilediği coşkulu 'Salla Salla' dansı ve geleneksel mahalle oyunları sosyal medyada viral oldu.\n\nMahalle kültürünün neşesini ve bir arada olmanın samimiyetini yansıtan görüntüler binlerce beğeni alırken, mahalle sakinleri bu güzel geleneklerin yaşatılmasından gurur duyduklarını belirttiler.",
    sonDakika: true,
    status: "approved",
    authorName: "Mutlular Haber",
    kategori: "Haber",
    imageURL: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    okunmaSayisi: 12400,
    begeniSayisi: 243,
    tarihStr: "2 saat önce"
  },
  {
    id: "duyuru_fiber",
    baslik: "TurkNet Fiber Çalışmaları Başlıyor",
    ozet: "Mehmet Akif Mahallesi'nde fiber altyapı çalışmaları 08.05.2026'da başlıyor.",
    icerik: "Mahallemiz genelinde yüksek hızlı gigabit internet erişimi sağlamak amacıyla TurkNet ve belediye fen işleri iş birliğiyle kazı ve fiber kablo döşeme çalışmaları başlatılacaktır. Çalışmalar süresince sokaklarımızda gerekli uyarı levhaları konulacak ve kazılan alanlar ivedilikle kapatılacaktır.",
    sonDakika: false,
    status: "approved",
    authorName: "Altyapı Bülteni",
    kategori: "Duyuru",
    imageURL: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    okunmaSayisi: 4120,
    begeniSayisi: 98,
    tarihStr: "4 saat önce"
  },
  {
    id: "haber_park",
    baslik: "Mahallemizde Yeni Park Hizmete Açıldı 💐",
    ozet: "Mutlular Mahallesi'ne kazandırılan yeni park, düzenlenen törenle hizmete açıldı. Çocuklar için oyun alanları, yürüyüş yolları ve dinlenme alanları ile mahallemize nefes olacak.",
    icerik: "Mutlular Mahallesi sakinlerinin uzun süredir heyecanla beklediği modern rekreasyon ve yeşil alan projesi tamamlanarak mahalle halkımızın hizmetine sunuldu.\n\nBelediye yetkilileri, mahalle muhtarımız ve komşularımızın geniş katılımıyla gerçekleşen açılış töreninde çocuk oyun grupları, kauçuk zeminli koşu parkuru, spor aletleri ve gölgelikli dinlenme kamelyaları tanıtıldı. Akşam saatlerinde güvenliği artırmak için enerji tasarruflu led aydınlatmalar ve güvenlik kameraları devreye alındı.\n\nMahallemizdeki tüm aileleri, çocuklarımızı ve büyüklerimizi yeni parkımızın keyfini çıkarmaya davet ediyoruz.",
    sonDakika: true,
    status: "approved",
    authorName: "Mutlular Haber",
    kategori: "Çevre & Parklar",
    imageURL: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80",
    okunmaSayisi: 2450,
    begeniSayisi: 184,
    tarihStr: "2 saat önce"
  },
  {
    id: "haber_muhtarlik_destek",
    baslik: "Muhtarlıktan Kışlık Yakacak ve Sosyal Destek Başvuruları Başladı ❄️",
    ozet: "İhtiyaç sahibi aileler için belediye ve kaymakamlık iş birliğiyle kışlık yakacak, eğitim ve gıda desteği müracaatları muhtarlık ofisinde kabul ediliyor.",
    icerik: "Mahalle muhtarlığımız öncülüğünde yaklaşan kış ayları öncesinde ihtiyaç sahibi komşularımıza yönelik sosyal yardım seferberliği başlatıldı. Başvurular hafta içi her gün 09:00 - 17:00 saatleri arasında muhtarlık hizmet binasında şahsen alınacaktır.",
    sonDakika: true,
    status: "approved",
    authorName: "Mahalle Muhtarlığı",
    kategori: "Muhtarlık & Resmi",
    imageURL: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 3120,
    begeniSayisi: 215,
    tarihStr: "35 dk önce"
  },
  {
    id: "h_temizlik",
    baslik: "Temizlik Çalışmaları Tüm Hızıyla Devam Ediyor",
    ozet: "Belediyemiz temizlik işleri ekipleri sokaklarımızda genel yıkama ve dezenfeksiyon çalışmalarına aralıksız devam ediyor.",
    icerik: "Mahallemizin tüm cadde ve ara sokaklarında kapsamlı sonbahar temizliği başlatıldı. Çöp konteynerleri basınçlı sıcak suyla dezenfekte edilirken, kaldırım kenarları ve park çevresi süpürge araçlarıyla arındırıldı.",
    sonDakika: false,
    status: "approved",
    authorName: "Belediye Saha Ekibi",
    kategori: "Belediye & Altyapı",
    imageURL: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    okunmaSayisi: 1340,
    begeniSayisi: 78,
    tarihStr: "4 saat önce"
  },
  {
    id: "h_guvenlik",
    baslik: "Mahallemizde Gece Güvenlik Devriyeleri ve LED Aydınlatma Yenilemesi",
    ozet: "Emniyet birimleri ile yapılan görüşmeler neticesinde okul çevreleri ve ana caddelerde devriyeler artırıldı, karanlık sokaklar yeni LED lambalarla aydınlatıldı.",
    icerik: "Mahalle sakinlerimizin ve velilerimizin talepleri doğrultusunda okul giriş-çıkış saatleri ile akşam vakitlerinde asayiş önlemleri güçlendirildi. Ayrıca arızalı aydınlatma direkleri ekiplerce yenilendi.",
    sonDakika: false,
    status: "approved",
    authorName: "Asayiş Dayanışma Masası",
    kategori: "Asayiş & Güvenlik",
    imageURL: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=800&q=80",
    okunmaSayisi: 1680,
    begeniSayisi: 142,
    tarihStr: "5 saat önce"
  },
  {
    id: "h_kasap",
    baslik: "Kasap Ahmet'ten Hafta Sonu İndirimi!",
    ozet: "Mahallemizin kıdemli esnafı Kasap Ahmet, hafta sonuna özel kendi üretimi dana sucuk ve kıymada %20 indirim başlattı.",
    icerik: "35 yıllık mahalle esnafımız Kasap Ahmet, komşularımıza özel hafta sonu kampanyasını duyurdu: Yerli besi kıyma ve geleneksel kangal sucukta net %20 indirim uygulanacaktır.",
    sonDakika: false,
    status: "approved",
    authorName: "Kasap Ahmet",
    kategori: "Esnaf & Çarşı",
    imageURL: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
    okunmaSayisi: 890,
    begeniSayisi: 54,
    tarihStr: "6 saat önce"
  },
  {
    id: "h_spor",
    baslik: "Mutlular Spor Kulübü Halı Sahası ve Ücretsiz Sabah Yürüyüş Grubu",
    ozet: "Hafta sonları mahalle sakinlerimize yönelik uzman antrenör eşliğinde sabah esneme hareketleri ve yürüyüş programı başlıyor.",
    icerik: "Sağlıklı yaşam için bir araya gelen mahalle sakinlerimiz, her Cumartesi ve Pazar sabahı saat 08:30'da park girişinde toplanarak yürüyüş ve hafif spor egzersizleri gerçekleştirecek.",
    sonDakika: false,
    status: "approved",
    authorName: "Spor Komisyonu",
    kategori: "Spor & Sağlık",
    imageURL: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
    okunmaSayisi: 720,
    begeniSayisi: 88,
    tarihStr: "1 gün önce"
  },
  {
    id: "h_vefat",
    baslik: "Mahallemizden Taziye Haberi",
    ozet: "Mahallemiz sakinlerinden Hacı Mehmet Amcamız hakkın rahmetine kavuşmuştur. Ailesine ve tüm komşularımıza başsağlığı dileriz.",
    icerik: "Mahallemizin eski sakinlerinden, sevilen büyüğümüz Hacı Mehmet Amca vefat etmiştir. Cenazesi bugün ikindi namazını müteakip Mutlular Merkez Camii'nden kaldırılacaktır. Allah rahmet eylesin.",
    sonDakika: false,
    status: "approved",
    authorName: "Mahalle Muhtarlığı",
    kategori: "Duyuru & Taziye",
    imageURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    okunmaSayisi: 1540,
    begeniSayisi: 96,
    tarihStr: "1 gün önce"
  },
  {
    id: "h_barinak",
    baslik: "Mahalle İmecesi: Sokak Hayvanları İçin Kışlık Barınaklar Kuruldu",
    ozet: "Gençler ve esnafımız bir araya gelerek park çevresine yalıtımlı kedi ve köpek kulübeleri yerleştirdi, mama odakları oluşturuldu.",
    icerik: "Mahalle sakinimiz veteriner hekim Elif Hanım öncülüğünde toplanan gönüllüler, ahşap paletlerden korunaklı barınaklar inşa etti. Kulübelerin temizliği ve mama takviyesi mahalle esnafımız tarafından haftalık olarak takip edilecek.",
    sonDakika: false,
    status: "approved",
    authorName: "Elif Karaca (Mahalle Sakini)",
    kategori: "Dayanışma & Doğa",
    imageURL: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 1220,
    begeniSayisi: 165,
    tarihStr: "1 gün önce"
  },
  {
    id: "h_kutuphane",
    baslik: "Mahalle Kütüphanesi ve Çocuk Etüt Merkezi Hizmete Açıldı",
    ozet: "Eski muhtarlık binası restore edilerek gençlerimizin ders çalışabileceği, 2.500 kitaplık ücretsiz kütüphaneye dönüştürüldü.",
    icerik: "Tüm komşularımızın bağışlarıyla zenginleşen kütüphanemizde hafta içi etüt saatleri, hafta sonları ise ilkokul öğrencileri için masal atölyeleri düzenlenecek. Kitap bağışında bulunmak isteyenler doğrudan merkeze teslim edebilir.",
    sonDakika: false,
    status: "approved",
    authorName: "Öğretmen Selma Hanım",
    kategori: "Eğitim & Kültür",
    imageURL: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 680,
    begeniSayisi: 112,
    tarihStr: "2 gün önce"
  },
  {
    id: "h_ulasim",
    baslik: "Salı Pazarı Servis Güzergahı ve Hareket Saatleri Güncellendi",
    ozet: "Özellikle yaşlı ve pazar yükü olan sakinlerimiz için her Salı 09:00 - 17:00 arası ring seferi düzenlenecektir.",
    icerik: "Muhtarlık önünden hareket eden ring servisimiz sırasıyla Cami Meydanı, Çınaraltı Parkı ve Salı Pazarı girişine ücretsiz yolcu taşıyacaktır. Araç saat başı ring atacaktır.",
    sonDakika: false,
    status: "approved",
    authorName: "Mahalle Ulaşım Komitesi",
    kategori: "Belediye & Altyapı",
    imageURL: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 540,
    begeniSayisi: 45,
    tarihStr: "3 gün önce"
  },
  // ── 📬 GELEN VATANDAŞ HABER İHBARLARI (Admin / Editör İncelemesi İçin) ──
  {
    id: "ihbar_su_patlagi_1",
    baslik: "Çınar Caddesi No:42 Önünde Ana Şebeke Su Borusu Arızası",
    ozet: "Sabah saatlerinden beri asfalt altından temiz su akıyor, araç geçişlerinde çökme tehlikesi var.",
    icerik: "Çınar Caddesi No:42 önündeki şebeke borusunda sabah erken saatlerde patlak meydana geldi. Temiz su cadde boyunca boşa akmakta ve asfalt altında oyuk oluşma riski taşımaktadır. Su ve Kanalizasyon ekiplerine bildirildi ancak henüz müdahale edilmedi. Komşularımızın araçlarıyla geçerken dikkatli olmasını rica ederiz.",
    sonDakika: false,
    status: "pending",
    isTip: true,
    authorName: "Ahmet Karaca (Mahalle Sakini)",
    authorPhone: "0532 999 11 22",
    authorRole: "sakin",
    kategori: "Belediye & Altyapı",
    imageURL: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 18,
    begeniSayisi: 3,
    tarihStr: "25 dk önce"
  },
  {
    id: "ihbar_kasis_1",
    baslik: "Çocuk Parkı Girişine Acil Kasis ve Uyarı Levhası Talebi",
    ozet: "Okul çıkışında ve park girişinde araçlar aşırı hız yapıyor, çocuklar için güvenlik riski oluşuyor.",
    icerik: "Mutlular Parkı ana kapısının hemen önüne okul ve park çıkış saatlerinde süratli araç geçişleri nedeniyle tehlike arz ediyor. Mahalle meclisimiz ve muhtarlığımız kanalıyla belediyeden buraya kauçuk kasis ve 'Okul/Park Geçidi Yavaş' tabelası talep ediyoruz.",
    sonDakika: false,
    status: "pending",
    isTip: true,
    authorName: "Zeynep Kaya (Veli / Sakin)",
    authorPhone: "0533 888 33 44",
    authorRole: "sakin",
    kategori: "Asayiş & Güvenlik",
    imageURL: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
    okunmaSayisi: 42,
    begeniSayisi: 12,
    tarihStr: "1 saat önce"
  }
];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  // ── 📱 EKRAN 2 GÖRSELİNDEKİ BİREBİR İLANLAR ──
  {
    id: "m_satilik_daire_1",
    ilanTuru: "emlak",
    emlakTuru: "satilik",
    baslik: "Satılık Daire",
    aciklama: "Mahallemizin nezih ve merkezi konumunda, ısıtma sistemi kombili, geniş ve ferah bir daire. Detaylı bilgi için iletişime geçebilirsiniz.",
    fiyat: 2450000,
    kategori: "Emlak",
    odaSayisi: "3+1",
    metrekare: 120,
    kat: "5. Kat",
    isitma: "Doğalgaz (Kombi)",
    binaYasi: "5 Yaşında",
    aidat: 250,
    balkon: true,
    asansor: true,
    otopark: true,
    saticiAdi: "Mehmet Akif Mah. / Osmangazi",
    saticiTelefon: "05321112233",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "m_clio_1",
    ilanTuru: "ikinci_el",
    baslik: "2019 Model Clio",
    aciklama: "İlk sahibinden, hatasız, boyasız, bakımları yetkili serviste yapılmış 2019 Renault Clio 1.0 TCe Joy paket. Yakıt cimrisi.",
    fiyat: 645000,
    kategori: "Otomotiv",
    durum: "az_kullanilmis",
    saticiAdi: "Mehmet Akif Mah. / Osmangazi",
    saticiTelefon: "05332223344",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "m_koltuk_1",
    ilanTuru: "ikinci_el",
    baslik: "Koltuk Takımı",
    aciklama: "İstikbal marka L köşe ve 3'lü koltuk takımı. Leke tutmayan nubuk kumaş, sandıklı ve yatak olabilen mekanizmalı. Çok temiz durumda.",
    fiyat: 8500,
    kategori: "Ev & Yaşam",
    durum: "az_kullanilmis",
    saticiAdi: "Mehmet Akif Mah. / Osmangazi",
    saticiTelefon: "05353334455",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "m_iphone_1",
    ilanTuru: "ikinci_el",
    baslik: "iPhone 14",
    aciklama: "128 GB Mavi/Mor renk, pil sağlığı %91, kutu fatura orijinal şarj kablosu mevcut. Ekranda çizik dahi yoktur, kılıf ve cam filmiyle kullanıldı.",
    fiyat: 18000,
    kategori: "Elektronik",
    durum: "az_kullanilmis",
    saticiAdi: "Mehmet Akif Mah. / Osmangazi",
    saticiTelefon: "05364445566",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ── 🌾 TARLA & ARSA İLANLARI ──
  {
    id: "m_tarla_1",
    ilanTuru: "emlak",
    emlakTuru: "satilik",
    baslik: "Sahibinden Satılık 2.450 m² Yatırımlık Zeytinlik & Verimli Tarla",
    aciklama: "Kadastro yolu açık, resmi yola cepheli, suyu ve elektriği yakın mesafede. İçinde 65 adet yetişkin verimli zeytin ağacı bulunmaktadır. Yatırıma ve prefabrik/hobi evi yapımına çok uygundur. Tek tapu, hissesiz.",
    fiyat: 1450000,
    kategori: "Tarla & Arsa",
    odaSayisi: "Tarla (2.450 m²)",
    metrekare: 2450,
    kat: "Müstakil Parsel",
    isitma: "Yok",
    binaYasi: "Tarla / Arazi",
    aidat: 0,
    balkon: false,
    asansor: false,
    otopark: true,
    saticiAdi: "Halil İbrahim Dayı (Köylümüz)",
    saticiTelefon: "05327891234",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "m_tarla_2",
    ilanTuru: "emlak",
    emlakTuru: "kiralik",
    baslik: "Kiralık 600 m² Tel Örgülü Hobi Bahçesi & Ekilebilir Tarla",
    aciklama: "Mahallemizin hemen yanı başında, etrafı tel örgüyle çevrili, damlama su sistemi ve artezyen kuyusu hazır tarla. Organik sebze yetiştiriciliği ve aile hobi bahçesi için hazır.",
    fiyat: 4500,
    kategori: "Tarla & Arsa",
    odaSayisi: "Hobi Bahçesi (600 m²)",
    metrekare: 600,
    kat: "Düz Arazi",
    isitma: "Yok",
    binaYasi: "Bahçe / Tarla",
    aidat: 0,
    balkon: false,
    asansor: false,
    otopark: true,
    saticiAdi: "Hüseyin Çiftçi",
    saticiTelefon: "05364443322",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ── 🏠 EMLAK İLANLARI (KİRALIK & SATILIK DAİRE, DÜKKAN) ──
  {
    ilanTuru: "emlak",
    emlakTuru: "kiralik",
    baslik: "Kiralık 3+1 Park Manzaralı Geniş Aile Dairesi - 135 m²",
    aciklama: "Yeni boyalı, masrafsız, kombili, çift balkonlu, güney cephe aydınlık daire. Aile apartmanıdır, asansör ve açık otopark mevcuttur. Yeni açılan mahalle parkının hemen karşısındadır.",
    fiyat: 18500,
    kategori: "Kiralık Daire",
    odaSayisi: "3+1",
    metrekare: 135,
    kat: "3. Kat",
    isitma: "Doğalgaz (Kombi)",
    binaYasi: "6 Yaşında",
    aidat: 350,
    balkon: true,
    asansor: true,
    otopark: true,
    saticiAdi: "Kemal Bey (Ev Sahibi)",
    saticiTelefon: "05325556677",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "emlak",
    emlakTuru: "satilik",
    baslik: "Satılık 2+1 Sıfır Lüks Daire - Yerden Isıtmalı - 95 m²",
    aciklama: "Kat mülkiyetli, krediye uygun sıfır daire. Lake mutfak dolapları, 3'lü ankastre set, ebeveyn banyosu ve kapalı otopark. İlkokul ve pazar yerine 2 dakika yürüme mesafesinde.",
    fiyat: 2850000,
    kategori: "Satılık Daire",
    odaSayisi: "2+1",
    metrekare: 95,
    kat: "2. Kat",
    isitma: "Yerden Isıtma",
    binaYasi: "Sıfır Bina",
    aidat: 400,
    balkon: true,
    asansor: true,
    otopark: true,
    saticiAdi: "Murat İnşaat / Ahmet Bey",
    saticiTelefon: "05334445566",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "emlak",
    emlakTuru: "kiralik",
    baslik: "Kiralık Köşe Başı Çarşı Dükkanı & Mağaza - 80 m²",
    aciklama: "Mahalle çarşısı ana cadde üzerinde, önünde geniş sundurma alanı olan köşe dükkan. Berber, terzi, butik, kuru temizleme veya paket servis gıda için hazır baca ve su tesisatı vardır.",
    fiyat: 15000,
    kategori: "Kiralık Dükkan",
    odaSayisi: "Dükkan / İşyeri",
    metrekare: 80,
    kat: "Giriş Kat",
    isitma: "Klima & Doğalgaz",
    binaYasi: "10 Yaşında",
    aidat: 150,
    balkon: false,
    asansor: false,
    otopark: true,
    saticiAdi: "Hacı Mehmet Amca",
    saticiTelefon: "05357778899",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "emlak",
    emlakTuru: "kiralik",
    baslik: "Kiralık 1+1 Eşyalı Masrafsız Temiz Daire - 60 m²",
    aciklama: "Tüm beyaz eşyaları, koltuğu ve yatağı sıfır ayarında eşyalı daire. Bekara, memura veya öğrenciye uygundur. Otobüs durağına 50 metre.",
    fiyat: 12000,
    kategori: "Kiralık Daire",
    odaSayisi: "1+1",
    metrekare: 60,
    kat: "1. Kat",
    isitma: "Doğalgaz (Kombi)",
    binaYasi: "4 Yaşında",
    aidat: 200,
    balkon: true,
    asansor: true,
    otopark: false,
    saticiAdi: "Ayşe Teyze",
    saticiTelefon: "05423334455",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ── 📦 2. EL EŞYA VE MALZEME İLANLARI ──
  {
    ilanTuru: "ikinci_el",
    baslik: "İKEA Çalışma Masası ve Ergonomik Koltuk Takımı",
    aciklama: "Taşınma sebebiyle satılıktır. Tertemiz durumda, çizik veya deformasyon yoktur. 120x60 cm meşe kaplama tabla.",
    fiyat: 1450,
    kategori: "Mobilya",
    durum: "az_kullanilmis",
    saticiAdi: "Selim Yılmaz",
    saticiTelefon: "05324567890",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "ikinci_el",
    baslik: "Chicco Bebek Arabası & Ana Kucağı (Puset Dahil)",
    aciklama: "Çok temiz kullanıldı, kılıfları yeni yıkandı. Çift yönlü kullanılabilir, tek elle kolay katlanır. Yağmurluğu mevcuttur.",
    fiyat: 2800,
    kategori: "Anne & Bebek",
    durum: "az_kullanilmis",
    saticiAdi: "Merve Demirci",
    saticiTelefon: "05441112233",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "ikinci_el",
    baslik: "Kron XC 100 Dağ Bisikleti - 26 Jant / 21 Vites",
    aciklama: "Bakımları Çınaraltı Bisiklet'te yeni yapıldı. Ön süspansiyonlu, vites geçişleri sorunsuz. Yanında kilit ve kask hediyedir.",
    fiyat: 3250,
    kategori: "Spor & Bisiklet",
    durum: "ikinci_el",
    saticiAdi: "Emre Kaya",
    saticiTelefon: "05559876543",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "ikinci_el",
    baslik: "Arçelik Telve Çift Hazneli Türk Kahvesi Makinesi",
    aciklama: "Kutusu ve cezveleri tamdır, sorunsuz çalışıyor. Ofis kapanışı dolayısıyla elden çıkarıyoruz. Mahalle içi elden teslim.",
    fiyat: 750,
    kategori: "Elektronik & Mutfak",
    durum: "az_kullanilmis",
    saticiAdi: "Fatma Teyze",
    saticiTelefon: "05332223344",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "ikinci_el",
    baslik: "Bosch Serie 4 9kg A+++ Sessiz Çamaşır Makinesi",
    aciklama: "Körüğü ve kazanı tertemizdir. Sessiz EcoSilence motordur, 15 dk hızlı yıkama programı vardır. Nakliye alıcıya aittir.",
    fiyat: 6200,
    kategori: "Beyaz Eşya",
    durum: "az_kullanilmis",
    saticiAdi: "Kadir Usta",
    saticiTelefon: "05369998877",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    ilanTuru: "ikinci_el",
    baslik: "Üniversite/Lise Öğrencilerine 2 Adet Ahşap Kitaplık (ÜCRETSİZ)",
    aciklama: "Komşuluk dayanışması kapsamında ihtiyacı olan öğrenci kardeşlerimize ücretsiz verilecektir. 3. kattan indirilmesi gerekmektedir.",
    fiyat: 0,
    kategori: "Bağış & Ücretsiz",
    durum: "ikinci_el",
    saticiAdi: "Hüseyin Hoca",
    saticiTelefon: "05307778899",
    status: "active",
    fotolar: [
      "https://images.unsplash.com/photo-1594657112702-86862590212a?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    tur: "kayip",
    baslik: "KAYIP: 2 Yaşında Tekir Kedi 'Duman' (Kırmızı Tasmada Telefon Yazılı)",
    aciklama: "Gül Sokak / Park çevresinde dün akşamdan beri kayıptır. Çok cana yakındır, boynunda kırmızı zil tasma bulunmaktadır. Görenlerin aramasını rica ediyoruz.",
    kategori: "Evcil Hayvan",
    isCritical: true,
    iletisimKisi: "Buse Çelik",
    iletisimTelefon: "05367890123",
    konum: "Gül Sokak & Çocuk Parkı Civarı",
    status: "published",
    fotolar: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    tur: "bulundu",
    baslik: "BULUNDU: Cami Önü Çınaraltı Bankında Renault Araba Anahtarı",
    aciklama: "Üzerinde siyah deri kılıf ve nazar boncuklu anahtarlık bulunmaktadır. Bulan Bakkal Hasan Usta'ya teslim etmiştir.",
    kategori: "Anahtar / Araç",
    isCritical: false,
    iletisimKisi: "Bakkal Hasan Usta",
    iletisimTelefon: "05321114455",
    konum: "Mutlular Merkez Cami Meydanı",
    status: "published",
    fotolar: [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    tur: "kayip",
    baslik: "KAYIP: Mavi Okul Sırt Çantası ve Matara",
    aciklama: "İçinde 4. sınıf ders kitapları ve resim defteri olan mavi Puma marka çanta spor sahası kenarında unutulmuştur.",
    kategori: "Kişisel Eşya",
    isCritical: false,
    iletisimKisi: "Serkan Baba",
    iletisimTelefon: "05436665544",
    konum: "Mahalle Halı Sahası Yanı",
    status: "published",
    fotolar: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const INITIAL_SERVICES: ServiceRequest[] = [
  {
    authorName: "Büşra Yıldız",
    telefon: "05367778899",
    kategori: "Düğün, Nişan & Doğum Günü",
    altKategori: "Masa Sandalye Kiralama",
    baslik: "Bahçede Nişan İçin 60 Adet Tiffany Sandalye ve 6 Adet Masa Kiralama",
    aciklama: "Mutlular Mahallesi'ndeki müstakil evimizin bahçesinde yapılacak nişan töreni için cumartesi günü teslim edilecek masa ve sandalye kiralama teklifi rica ediyoruz.",
    adres: "Gül Sokak No: 12 (Müstakil)",
    status: "open",
    offerCount: 3,
    fotolar: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    ],
    uid: "mock_user_3"
  },
  {
    authorName: "Selin Çelik",
    telefon: "05334445566",
    kategori: "Düğün, Nişan & Doğum Günü",
    altKategori: "Pasta & Tatlı Siparişi",
    baslik: "1 Yaş Doğum Günü İçin Özel Konsept Butik Yaş Pasta ve 20 Adet Cupcake",
    aciklama: "Kızımızın 1 yaş partisi için safari konseptli, şeker hamurlu 25 kişilik butik yaş pasta ve uyumlu cupcake tekliflerini bekliyoruz.",
    adres: "Çınar Sokak No: 4",
    status: "open",
    offerCount: 2,
    fotolar: [
      "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
    ],
    uid: "mock_user_4"
  },
  {
    authorName: "Ahmet Turan",
    telefon: "05325556677",
    kategori: "Tesisat, Su & Isıtma",
    altKategori: "Musluk, Batarya & Sifon Tamiri",
    baslik: "Mutfak Lavabosu Altı Boru Değişimi ve Batarya Montajı",
    aciklama: "Eski flex hortum su damlatıyor, yeni aç-kapa batarya satın aldım montajının yapılması gerekiyor.",
    adres: "Papatya Sokak No: 8 Daire: 4",
    status: "open",
    offerCount: 2,
    fotolar: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80"
    ],
    uid: "mock_user_1"
  },
  {
    authorName: "Zehra Hanım",
    telefon: "05423334455",
    kategori: "Elektrik & Aydınlatma",
    baslik: "Salon Avize Montajı ve Sigorta Kontrolü",
    aciklama: "2 adet tavan avizesi montajı yapılacak. Ayrıca salondaki priz sigorta attırıyor, kontrol edilmesi rica olunur.",
    adres: "Mutlular Caddesi Kardelen Apt.",
    status: "open",
    offerCount: 1,
    fotolar: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
    ],
    uid: "mock_user_2"
  }
];

export const INITIAL_CAMPAIGNS: EsnafCampaign[] = [
  {
    isyeriAdi: "Mutlular Ekmek & Taş Fırını",
    kategori: "Fırın & Unlu Mamül",
    baslik: "Akşam 19:00 Sonrası Tüm Pasta ve Unlu Mamullerde %30 İndirim",
    aciklama: "Günün taze üretilen pasta, kuru pasta, poğaça ve börek çeşitlerinde israfı önlemek ve komşularımıza destek olmak için her akşam %30 net indirim!",
    indirimOrani: "%30 İNDİRİM",
    rozet: "Akşam Fırsatı",
    adres: "Mutlular Ana Cadde No: 14 (Cami Karşısı)",
    telefon: "05321112233",
    gecerlilikTarihi: "Her Gün 19:00 - 22:00",
    fotolar: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    isyeriAdi: "Bereket Kasap & Şarküteri",
    kategori: "Kasap & Et Ürünleri",
    baslik: "3 Kg Kıyma veya Kuşbaşı Alana 1 Paket Özel Kasap Köfte Hediye!",
    aciklama: "Balıkesir yöresi yerli besi etlerimiz taze kesimdir. 3 kg ve üzeri alımlarda kendi hazırladığımız baharatlı anne köftesi ikramımızdır. Adrese servisimiz vardır.",
    indirimOrani: "HEDİYE KÖFTE",
    rozet: "Haftanın Yıldızı",
    adres: "Gül Sokak No: 8",
    telefon: "05332223344",
    gecerlilikTarihi: "Pazar Akşamına Kadar",
    fotolar: [
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    isyeriAdi: "Şafak Manav & Köy Pazarı",
    kategori: "Manav & Organik",
    baslik: "Bursa Dağ Köylerinden Taze Domates, Salatalık ve Meyvelerde Kasa İndirimi",
    aciklama: "Doğal tarla mahsulü tarla domatesi, kıl biber, çilek ve şeftalide kasa alımlarında toptan fiyatına perakende satış. Kışlık konserve ve sos yapacak komşularımıza özel!",
    indirimOrani: "KASA İNDİRİMİ",
    rozet: "Taze Mahsul",
    adres: "Pazar Meydanı No: 3 (Muhtarlık Yanı)",
    telefon: "05343334455",
    gecerlilikTarihi: "Stoklar Tükenene Kadar",
    fotolar: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    isyeriAdi: "Mutlular Oto Yıkama & Lastik",
    kategori: "Oto Bakım & Hizmet",
    baslik: "Mahalle Sakinlerimize Özel İç-Dış Cilalı Detaylı Yıkama 200 TL",
    aciklama: "Köpüklü nano şampuanla yıkama, jant temizliği ve iç süpürge dahil mahalle sakinlerimize özel tanıtım fiyatı. Randevu alarak sıra beklemeden teslim alabilirsiniz.",
    indirimOrani: "ÖZEL FİYAT 200 TL",
    rozet: "Komşu İndirimi",
    adres: "Sanayi Girişi No: 21",
    telefon: "05354445566",
    gecerlilikTarihi: "Bu Ay Sonuna Kadar",
    fotolar: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    isyeriAdi: "Sevgi Çiçekçilik & Saksı Bahçesi",
    kategori: "Çiçek & Bahçe",
    baslik: "Balkon ve Salon Bitkilerinde 2 Alana 1 Hediye Kampanyası",
    aciklama: "Begonvil, orkide, sukulent ve saksı çiçeklerinde bahara özel kampanya. Mahalle içi kapıya teslim edilir, ücretsiz toprak değişimi yapılır.",
    indirimOrani: "2 ALANA 1 HEDİYE",
    rozet: "Bahar Fırsatı",
    adres: "Sağlık Ocağı Yanı No: 5",
    telefon: "05365556677",
    gecerlilikTarihi: "Hafta Sonu Geçerli",
    fotolar: [
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    isyeriAdi: "Usta Hasan Erkek Kuaförü",
    kategori: "Kişisel Bakım & Kuaför",
    baslik: "Hafta İçi Saç-Sakal ve Cilt Maskesi Bakım Paketi %25 İndirimli",
    aciklama: "Hijyenik tek kullanımlık havlu, saç kesimi, sakal tıraşı ve buharlı siyah nokta maskesi paketi mahalle esnafı dayanışmasıyla komşularımıza indirimli sunulmaktadır.",
    indirimOrani: "%25 İNDİRİM",
    rozet: "Hafta İçi Fırsatı",
    adres: "Okul Caddesi No: 12",
    telefon: "05376667788",
    gecerlilikTarihi: "Pazartesi - Perşembe",
    fotolar: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const INITIAL_KURSUS: MahalleKursusuItem[] = [
  {
    authorName: "Ahmet Yıldırım",
    authorPhotoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    role: "Mahalle Sakini (24 yıldır)",
    kategori: "Sorun & Şikayet",
    baslik: "104. Sokak Başındaki Çöp Konteynerlerinin Kapakları Kırık ve Koku Yapıyor",
    icerik: "104. Sokak girişindeki iki adet büyük çöp konteynerinin kapak mekanizmaları kırılmış, sokak hayvanları çöpleri dağıtıyor ve sıcak havalarda çok koku yapıyor. Belediyemizden bu konteynerlerin yenilenmesini veya kapaklarının tamir edilmesini talep ediyoruz.",
    konum: "104. Sokak & Barış Parkı Girişi",
    destekSayisi: 28,
    destekleyenler: ["user-1", "user-2", "user-3"],
    durum: "belediyeye_iletildi",
    tarihStr: "Bugün, 11:20",
    fotolar: [
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80"
    ],
    yorumlar: [
      {
        id: "c-1",
        authorName: "Merve Demir",
        authorPhotoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        mesaj: "Kesinlikle katılıyorum, özellikle akşam saatlerinde rüzgarla birlikte koku evlere kadar geliyor.",
        tarihStr: "2 saat önce"
      },
      {
        id: "c-2",
        authorName: "Kemal Güler (Muhtar)",
        authorPhotoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        mesaj: "Komşularım merhaba, konu belediye temizlik işleri müdürlüğüne bu sabah dilekçeyle resmi olarak iletildi. Hafta içi değişim yapılacak.",
        tarihStr: "1 saat önce"
      }
    ]
  },
  {
    authorName: "Fatma Öğretmen",
    authorPhotoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    role: "Emekli Eğitimci",
    kategori: "Öneri & Fikir",
    baslik: "Çınaraltı Parkına Çocuklar ve Gençler İçin Beton Satranç Masaları Konsun",
    icerik: "Mahallemizin kalbi olan ulu çınarın altındaki gölgelik alana beton satranç masaları yerleştirilirse, hem dedeler torunlarıyla vakit geçirir hem de çocuklarımız ekran başından kalkıp zihin jimnastiği yapar. Belediye veya mahalle imecesiyle rahatça yapılabilir.",
    konum: "Çınaraltı Parkı Meydanı",
    destekSayisi: 42,
    destekleyenler: ["user-4", "user-5", "user-6", "user-7"],
    durum: "acik",
    tarihStr: "Dün, 15:40",
    fotolar: [
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80"
    ],
    yorumlar: [
      {
        id: "c-3",
        authorName: "Usta Hasan",
        authorPhotoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        mesaj: "Harika bir fikir! Taşları da biz esnaflar olarak hediye edebiliriz.",
        tarihStr: "Dün"
      }
    ]
  },
  {
    authorName: "Serkan Yılmaz",
    authorPhotoURL: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    role: "Veli & Mahalle Sakini",
    kategori: "Dilek & Talep",
    baslik: "İlkokul Önündeki Yaya Geçidine Hız Kesici Kasis ve Güvenlik Aynası Talebi",
    icerik: "Sabah okul giriş ve 15:30 çıkış saatlerinde okul caddesinde arabalar ve servisler çok süratli geçiyor. Çocuklarımız karşıdan karşıya geçerken büyük tehlike atlatıyor. Karayolları veya belediyemizden acilen çift yönlü kauçuk hız kesici kasis talep ediyoruz.",
    konum: "Atatürk İlkokulu Önü & 82. Cadde",
    destekSayisi: 67,
    destekleyenler: ["user-8", "user-9", "user-10"],
    durum: "belediyeye_iletildi",
    tarihStr: "2 gün önce",
    yorumlar: [
      {
        id: "c-4",
        authorName: "Ayşe K.",
        authorPhotoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        mesaj: "Dün az kalsın bir öğrenciye araba çarpıyordu, lütfen bu talebi herkes desteklesin.",
        tarihStr: "2 gün önce"
      }
    ]
  },
  {
    authorName: "Halil İbrahim Usta",
    authorPhotoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    role: "Mahalle Fırıncısı",
    kategori: "Teşekkür & Tebrik",
    baslik: "Kırılan Su Borusunu Gece Yarısı 2 Saatte Onaran Su Arıza Ekiplerine Helal Olsun",
    icerik: "Dün gece saat 01:00 sularında fırınımızın önündeki ana şebeke borusu patladı. Çağrı merkezine bildirdikten 20 dakika sonra ekipler geldi ve gece soğukta canla başla çalışarak sabaha kadar tüm mahalleye suyu verdiler. Emekçi kardeşlerimize mahallemiz adına gönülden teşekkür ederiz.",
    konum: "Merkez Cami Yanı & Fırın Sokağı",
    destekSayisi: 53,
    destekleyenler: ["user-11", "user-12"],
    durum: "cozuldu",
    tarihStr: "3 gün önce",
    yorumlar: []
  }
];

export const INITIAL_INVITATIONS: MahalleDavetItem[] = [
  {
    id: "davet-1",
    tur: "dugun",
    turEtiketi: "💍 Düğün & Nikah Töreni",
    baslik: "Fatma Çetin & Burak Kaya Çiftinin Düğün Töreni",
    davetSahipleri: "Çetin ve Kaya Aileleri (Mehmet & Sevim Çetin - İbrahim & Hatice Kaya)",
    gelinDamat: "Fatma & Burak",
    tarih: "28 Eylül 2024 Cumartesi",
    saat: "19:00 - 23:30 (Nikah: 20:00)",
    mekanAdi: "Mutlular Saray Düğün & Balo Salonu",
    salonBilgisi: "Büyük Balo Salonu (Kat 2)",
    adres: "Mutlular Caddesi No:42 (Merkez Camii Karşısı)",
    haritaUrl: "https://maps.google.com/?q=Mutlular+Mahallesi+Bursa",
    davetiyeFoto: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    aciklama: "Evlatlarımızın bu en mutlu gününde, tüm mahalleli komşularımızı, dostlarımızı ve akrabalarımızı aramızda görmekten büyük onur ve mutluluk duyarız. Yemek ve düğün pastası ikramımız mevcuttur.",
    ozellikler: [
      "🍽️ Yemekli & Pasta İkramı",
      "🎻 Canlı Müzik Orkestrası",
      "🎈 Çocuk Oyun Alanı & Palyaço",
      "🚗 Ücretsiz Otopark & Vale",
      "🎁 Takı Merasimi: 21:00"
    ],
    iletisimKisi: "Mehmet Çetin (Gelinin Babası)",
    iletisimTelefon: "05325551234",
    katilanSayisi: 42,
    tebrikler: [
      {
        id: "t-1",
        isim: "Bakkal Hasan Usta & Ailesi",
        mesaj: "Gençlerimize bir ömür boyu iki cihan saadeti dileriz. Allah mesut bahtiyar eylesin, kesinlikle oradayız! 💐",
        tarihStr: "Dün",
        katilimDurumu: "katilacagim"
      },
      {
        id: "t-2",
        isim: "Hüseyin Hoca & Emine Hanım",
        mesaj: "Çetin ve Kaya ailelerini tebrik eder, yavrularımıza hayırlı bereketli bir yuva temenni ederiz.",
        tarihStr: "2 gün önce",
        katilimDurumu: "tebrik_ederim"
      }
    ]
  },
  {
    id: "davet-2",
    tur: "nisan",
    turEtiketi: "💐 Nişan & Söz Merasimi",
    baslik: "Zeynep Demir & Murat Yıldırım Nişan Merasimi",
    davetSahipleri: "Demir ve Yıldırım Aileleri",
    gelinDamat: "Zeynep & Murat",
    tarih: "5 Ekim 2024 Pazar",
    saat: "18:00 - 22:00",
    mekanAdi: "Mutlular Kültür Merkezi Kır Bahçesi",
    salonBilgisi: "Açık Hava Çim Alanı",
    adres: "Park Caddesi No:12 (Yeni Park Yanı)",
    haritaUrl: "https://maps.google.com/?q=Mutlular+Park+Bursa",
    davetiyeFoto: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    aciklama: "Evlilik yolunda attığımız bu ilk adımda, söz ve nişan yüzüklerimizi takarken siz değerli komşularımızı yanımızda görmekten kıvanç duyarız.",
    ozellikler: [
      "🌿 Kır Bahçesi Açık Alan",
      "☕ Kokteyl & Özel İkramlar",
      "📸 Hatıra Fotoğraf Köşesi",
      "🚗 Kolay Park İmkanı"
    ],
    iletisimKisi: "Hasan Demir (Kız Babası)",
    iletisimTelefon: "05334442211",
    katilanSayisi: 28,
    tebrikler: [
      {
        id: "t-3",
        isim: "Selma Öğretmen",
        mesaj: "Zeynep kızımıza ve damat beye hayırlı olsun, çok yakışmışlar maşallah! 💍",
        tarihStr: "3 gün önce",
        katilimDurumu: "katilacagim"
      }
    ]
  },
  {
    id: "davet-3",
    tur: "sunnet",
    turEtiketi: "👑 Sünnet Cemiyeti & Araç Konvoyu",
    baslik: "Emirhan Şahin'in Erkekliğe İlk Adım Sünnet Cemiyeti",
    davetSahipleri: "Şahin Ailesi (Hüseyin & Sevim Şahin)",
    tarih: "12 Ekim 2024 Pazar",
    saat: "13:00 - Konvoy: 15:00 - Yemek & Dua: 16:30",
    mekanAdi: "Şahin Konağı Bahçesi & Merkez Düğün Salonu",
    salonBilgisi: "Bahçe & Kapalı Salon",
    adres: "Çınaraltı Sokak No:8 (Camii Karşısı)",
    haritaUrl: "https://maps.google.com/?q=Mutlular+Camii+Bursa",
    davetiyeFoto: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
    aciklama: "Biricik oğlumuz Emirhan'ın sünnet cemiyetinde siz mahalleli dostlarımızla bir arada olmaktan şeref duyarız. Saat 15:00'te araç konvoyu mahalle turu atacaktır. Ardından geleneksel sünnet pilavı, tatlı ve ayran ikram edilecektir.",
    ozellikler: [
      "🍚 Geleneksel Sünnet Pilavı & Helva",
      "🚗 Mahalle Araç Konvoyu (Saat 15:00)",
      "🎪 Palyaço, Balon & Sihirbaz Gösterisi",
      "🕊️ Kuran-ı Kerim Tilaveti & Dua"
    ],
    iletisimKisi: "Hüseyin Şahin (Babası)",
    iletisimTelefon: "05357778899",
    katilanSayisi: 35,
    tebrikler: [
      {
        id: "t-4",
        isim: "Kasap Ahmet",
        mesaj: "Maşallah aslan parçasına! Mürüvvetini, askerliğini de görürsünüz inşallah Hüseyin kardeşim. 👏",
        tarihStr: "Dün",
        katilimDurumu: "mutluluklar"
      }
    ]
  },
  {
    id: "davet-4",
    tur: "kina",
    turEtiketi: "🪔 Geleneksel Kına Gecesi",
    baslik: "Elif Koç'un Kına Gecesi Merasimi",
    davetSahipleri: "Koç Ailesi (Kemal & Hatice Koç)",
    gelinDamat: "Elif Koç",
    tarih: "27 Eylül 2024 Cuma",
    saat: "19:30 - 23:00",
    mekanAdi: "Mutlular Kadınlar Lokali & Davet Salonu",
    salonBilgisi: "Yalnızca Hanımlara Özeldir",
    adres: "Gül Sokak No:15",
    haritaUrl: "https://maps.google.com/?q=Mutlular+Mahallesi+Gül+Sokak",
    davetiyeFoto: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80",
    aciklama: "Kızımız Elif'in kına gecesine mahallemizin tüm hanımefendileri ve genç kızları davetlidir. Kına yakımı, testi kırma oyunu ve bindallı seremonisi gerçekleşecektir. (Bayanlar arasıdır)",
    ozellikler: [
      "👩 Yalnızca Kadınlara Özel",
      "🪔 Testi Kırma & Kına Seremonisi",
      "🎶 Canlı Def & DJ Müzik",
      "☕ Çay, Kına Çerezi & Lokma İkramı"
    ],
    iletisimKisi: "Hatice Koç (Annesi)",
    iletisimTelefon: "05423334455",
    katilanSayisi: 54,
    tebrikler: []
  },
  {
    id: "davet-5",
    tur: "kutlama",
    turEtiketi: "🎂 Mahalle Büyüğümüz 90. Yaş Kutlaması",
    baslik: "Hacı Tahsin Dede 90. Yaş Çınaraltı Çayı & Kutlaması",
    davetSahipleri: "Öztürk Ailesi & Mutlular Mahalle Gençliği",
    tarih: "4 Ekim 2024 Cumartesi",
    saat: "14:00 - 17:00",
    mekanAdi: "Tarihi Çınaraltı Meydan Kahvesi",
    salonBilgisi: "Meydan Çınarları Altı",
    adres: "Mutlular Merkez Meydanı",
    haritaUrl: "https://maps.google.com/?q=Mutlular+Meydan",
    davetiyeFoto: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
    aciklama: "Mahallemizin en kıdemli büyüğü, hepimizin dedesi Hacı Tahsin amcamızın 90. yaşını hep birlikte pasta keserek, çay içerek ve hatıralarını dinleyerek kutluyoruz. Tüm komşularımız çayımıza ve tatlımıza davetlidir.",
    ozellikler: [
      "☕ Çay & Kahve İkramı",
      "🎂 Dev Mahalle Yaş Pastası",
      "📸 Nostaljik Mahalle Albümü Gösterimi",
      "🎙️ Mahalle Hatıraları Sohbeti"
    ],
    iletisimKisi: "Muhtarlık & Gençlik Temsilciliği",
    iletisimTelefon: "05551234567",
    katilanSayisi: 65,
    tebrikler: []
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: "user_yakup_admin",
    name: "Yakup Karabacak",
    email: "yakupkrbck@gmail.com",
    role: "admin",
    telefon: "0532 111 22 33",
    credits: 9999,
    isApproved: true,
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "user_selin_editor",
    name: "Selin Çelik (Haber Masası)",
    email: "selin.editor@mutlular.com",
    role: "editor",
    telefon: "0533 444 55 66",
    credits: 500,
    isApproved: true,
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "user_mehmet_esnaf",
    name: "Mehmet Aktaş (Elektrikçi Usta)",
    email: "mehmet.elektrik@mutlular.com",
    role: "esnaf",
    telefon: "0532 555 12 34",
    businessName: "Mutlular Elektrik & Aydınlatma",
    esnafKategori: "Elektrik & Aydınlatma",
    credits: 250,
    isApproved: true,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "user_ahmet_sakin",
    name: "Ahmet Karaca",
    email: "ahmet.karaca@gmail.com",
    role: "sakin",
    telefon: "0532 999 11 22",
    credits: 50,
    isApproved: true,
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  },
  {
    uid: "user_zeynep_sakin",
    name: "Zeynep Kaya",
    email: "zeynep.kaya@gmail.com",
    role: "sakin",
    telefon: "0533 888 33 44",
    credits: 50,
    isApproved: true,
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80"
  }
];


