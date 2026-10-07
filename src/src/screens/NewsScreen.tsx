// Ekran: NewsScreen (eski App.tsx 5057–5413)
import { tarihEtiketi } from '../serviceMatching';
import { Newspaper, Eye, Heart, Search, X, Filter } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function NewsScreen() {
  const {
    activeTab, newsSearchTerm, setNewsSearchTerm, newsSortBy, setNewsSortBy, newsFilter,
    setNewsFilter, newsItems, handleOpenNewsDetail, trendingNews, filteredNews, newsCategories,
  } = useApp();
  return (
    <>
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
                        <span className="text-slate-400 font-medium">{tarihEtiketi(trendItem)}</span>
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
                  ...newsCategories.map((c) => ({ id: c.id, label: c.ad, icon: c.ikon })),
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
                          {tarihEtiketi(item) || 'Yeni'}
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
    </>
  );
}
