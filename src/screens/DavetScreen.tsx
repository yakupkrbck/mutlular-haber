// Ekran: DavetScreen (eski App.tsx 5418–5688)
import { tarihEtiketi } from '../serviceMatching';
import {
  Sparkles,
  Users,
  Search,
  X,
  Calendar,
  Clock,
  MapPin,
  Heart,
  MessageSquare,
  Share2,
  Phone
} from 'lucide-react';
import { useApp } from '../app/AppContext';

export function DavetScreen() {
  const {
    activeTab, invitationItems, davetCategoryFilter, setDavetCategoryFilter, davetSearch,
    setDavetSearch, attendedDavetIds, activeTebrikDavetId, setActiveTebrikDavetId, newTebrikName,
    setNewTebrikName, newTebrikMsg, setNewTebrikMsg, openDialer, handleToggleAttendDavet,
    handleAddTebrikMessage, handleShareDavetWhatsApp, handleAddToCalendar, filteredDavetler,
  } = useApp();
  return (
    <>
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
                                  <span className="text-[9px] text-slate-400 shrink-0">{tarihEtiketi(tb)}</span>
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
    </>
  );
}
