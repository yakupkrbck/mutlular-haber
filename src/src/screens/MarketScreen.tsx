// Ekran: MarketScreen (eski App.tsx 5693–6321)
import { MockupMarketCard } from '../MockupViewComponents';
import { ShoppingBag, Plus, Building2, Search, X, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function MarketScreen() {
  const {
    setSelectedMockupListing, mockupFavorites, setMockupFavorites, activeTab, marketDualMode,
    setMarketDualMode, emlakTypeFilter, setEmlakTypeFilter, emlakRoomFilter, setEmlakRoomFilter,
    emlakViewStyle, setEmlakViewStyle, emlakSortBy, setEmlakSortBy, setSelectedEmlakItem,
    secondHandCatFilter, setSecondHandCatFilter, setSelectedLetgoItem, marketSearchTerm,
    setMarketSearchTerm, setMarketModalType, setShowMarketModal, showToast, openWhatsApp,
    openDialer, emlakItems, secondHandItems, filteredUnifiedMarket,
  } = useApp();
  return (
    <>
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
    </>
  );
}
