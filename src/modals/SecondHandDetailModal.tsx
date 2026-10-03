// Pencere: SecondHandDetailModal (eski App.tsx 11766–11919)
import { X, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function SecondHandDetailModal() {
  const {
    selectedLetgoItem, setSelectedLetgoItem, showToast, openWhatsApp, openDialer,
  } = useApp();
  return (
    <>
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
    </>
  );
}
