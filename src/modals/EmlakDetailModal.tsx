// Pencere: EmlakDetailModal (eski App.tsx 11595–11763)
import { X, Building2, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function EmlakDetailModal() {
  const {
    selectedEmlakItem, setSelectedEmlakItem, openWhatsApp, openDialer,
  } = useApp();
  return (
    <>
      {selectedEmlakItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-300 space-y-4">
            {/* Sarı-Siyah Başlık Barı */}
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between sticky top-0 z-10 border-b border-amber-400">
              <div className="flex items-center gap-3">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md tracking-wider uppercase">
                  🏠 Emlak Detayı
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white line-clamp-1">
                    {selectedEmlakItem.baslik}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-medium">
                    İlan No: #{selectedEmlakItem.id ? selectedEmlakItem.id.replace(/\D/g, '').slice(0, 7) || '1049283' : '1049283'} · Mutlular Mahallesi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmlakItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Fotoğraf Galerisi & Fiyat Bandı */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <img
                    src={selectedEmlakItem.fotolar && selectedEmlakItem.fotolar[0] ? selectedEmlakItem.fotolar[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'}
                    alt={selectedEmlakItem.baslik}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                      MÜLK SAHİBİNDEN
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full text-white shadow-md ${
                      selectedEmlakItem.emlakTuru === 'satilik' ? 'bg-emerald-600' : selectedEmlakItem.emlakTuru === 'devren' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {selectedEmlakItem.emlakTuru === 'satilik' ? 'SATILIK' : selectedEmlakItem.emlakTuru === 'devren' ? 'DEVREN' : 'KİRALIK'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md text-amber-400 font-black text-base sm:text-xl px-4 py-1.5 rounded-xl shadow-lg border border-amber-400/40">
                    {selectedEmlakItem.fiyat.toLocaleString('tr-TR')} TL{selectedEmlakItem.emlakTuru === 'kiralik' ? '/ay' : ''}
                  </div>
                </div>
              </div>

              {/* Güven ve Doğrulama Rozeti */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl p-2 bg-amber-100 rounded-xl">🛡️</span>
                <div className="text-xs text-amber-950">
                  <strong className="block font-black text-amber-900">Mahalleli Onaylı Mülk İlanı</strong>
                  Bu taşınmaz doğrudan Mutlular Mahallesi mülk sahibi tarafından komisyonsuz listelenmiştir. Aracısız doğrudan görüşebilirsiniz.
                </div>
              </div>

              {/* Emlak Detaylı Parametre Tablosu */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>İlan Bilgileri &amp; Konut Özellikleri</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">İlan Numarası</span>
                    <span className="font-bold text-slate-900">#{selectedEmlakItem.id ? selectedEmlakItem.id.replace(/\D/g, '').slice(0, 7) || '1049283' : '1049283'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">İlan Tarihi</span>
                    <span className="font-bold text-slate-900">24 Eylül 2026</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Emlak Tipi</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.emlakTuru === 'satilik' ? 'Satılık Daire' : selectedEmlakItem.emlakTuru === 'devren' ? 'Devren Dükkan' : 'Kiralık Daire'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">m² (Brüt / Net)</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.metrekare ? `${selectedEmlakItem.metrekare} m²` : 'Belirtilmemiş'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Oda Sayısı</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.odaSayisi || '3+1'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Bulunduğu Kat</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.kat || '2. Kat (Ara Kat)'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Bina Yaşı</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.binaYasi || '4 Yıllık'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Isıtma Tipi</span>
                    <span className="font-bold text-slate-900">{selectedEmlakItem.isitma || 'Kombi Doğalgaz'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Balkon / Asansör</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.balkon !== false ? 'Balkon Var' : 'Yok'} · {selectedEmlakItem.asansor !== false ? 'Asansörlü' : 'Asansörsüz'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Otopark / Aidat</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmlakItem.otopark !== false ? 'Açık Otopark' : 'Sokak'}{selectedEmlakItem.aidat ? ` · ₺${selectedEmlakItem.aidat}/ay` : ''}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Kimden</span>
                    <span className="font-bold text-emerald-700">Mülk Sahibi (Komisyonsuz)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Konum</span>
                    <span className="font-bold text-slate-900 truncate">Mutlular Mah. Yıldırım / Bursa</span>
                  </div>
                </div>
              </div>

              {/* İlan Açıklaması */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Açıklama</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedEmlakItem.aciklama}
                </div>
              </div>

              {/* Mülk Sahibi İletişim Kartı & Aksiyon Butonları */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
                    {selectedEmlakItem.saticiAdi.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h5 className="font-black text-sm">{selectedEmlakItem.saticiAdi}</h5>
                    <p className="text-[11px] text-slate-400">Mülk Sahibi · Mutlular Mahallesi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openWhatsApp(
                      selectedEmlakItem.saticiTelefon,
                      `Merhaba ${selectedEmlakItem.saticiAdi}, Mutlular Mahallesi emlak vitrinindeki "${selectedEmlakItem.baslik}" (${selectedEmlakItem.fiyat.toLocaleString('tr-TR')} TL) ilanınız için görüşmek istiyorum.`
                    )}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                  <button
                    onClick={() => openDialer(selectedEmlakItem.saticiTelefon)}
                    className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> Ara
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
