// Ekran: ServicesScreen (eski App.tsx 6573–7443)
import { esnafCategoryIds } from '../serviceMatching';
import { isUstaProfile, requestMatchesEsnaf } from '../serviceMatching';
import { MockupMasterCard } from '../MockupViewComponents';
import {
  Store,
  Search,
  X,
  User as UserIcon,
  CheckCircle2,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Wrench,
  PlusCircle,
  Edit3,
  Coins
} from 'lucide-react';
import { ServiceMainCategory, ServiceSubCategory, VERIFIED_MASTERS } from '../data/serviceCategories';
import { useApp } from '../app/AppContext';

export function ServicesScreen() {
  const {
    user, profile, demoRole, setSelectedMockupMaster, activeTab, serviceRequests, offersMap,
    requestScope, setRequestScope, ALL_SERVICE_CATEGORIES, serviceViewMode, setServiceViewMode,
    activeExpandedCatId, setActiveExpandedCatId, masterCategoryFilter, setMasterCategoryFilter,
    serviceSectorSearch, setServiceSectorSearch, handleOpenCategoryRequest, setShowOfferModal, ustaProfiles,
    setShowRequestDetail, handleOpenEditRequest, handleOpenArtisanOnboarding,
  } = useApp();
  // Gerçek (ortak listedeki) usta sayısı: ana kategoriye göre
  const ustaCountFor = (mainCatId: string) =>
    ustaProfiles.filter((u: any) => {
      const ids = esnafCategoryIds({ esnafKategori: u.alanlar[0], faaliyetAlanlari: u.alanlar } as any, ALL_SERVICE_CATEGORIES as any);
      return ids === 'all' || ids.has(mainCatId);
    }).length;
  const NO_USTA_TEXT = 'Şu an bu alanda faaliyet yürüten ustamız bulunmamaktadır. İlerleyen günlerde yeni usta kayıtlarıyla birlikte hizmete açılacaktır.';
  const NoUstaNotice = () => (
    <p className="flex-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">{NO_USTA_TEXT}</p>
  );

  return (
    <>
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
                            {ustaCountFor(mainCat.id) === 0 ? (
                              <NoUstaNotice />
                            ) : (
                              <button
                                onClick={() => handleOpenCategoryRequest(mainCat.id, sub.name)}
                                className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span>Ustalardan Fiyat Al</span>
                              </button>
                            )}
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
                            {ustaCountFor(activeExpandedCategory.id) === 0 ? (
                              <NoUstaNotice />
                            ) : (
                              <button
                                onClick={() => handleOpenCategoryRequest(activeExpandedCategory.id)}
                                className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span>Bu Alandaki Ustalardan Fiyat Al</span>
                              </button>
                            )}
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
    </>
  );
}
