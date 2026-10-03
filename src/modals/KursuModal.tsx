// Pencere: KursuModal (eski App.tsx 11459–11592)
import { Megaphone, X, MapPin } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function KursuModal() {
  const {
    showKursuModal, setShowKursuModal, kursuBaslik, setKursuBaslik, kursuKategori, setKursuKategori,
    kursuIcerik, setKursuIcerik, kursuKonum, setKursuKonum, kursuFoto, setKursuFoto,
    handlePublishKursu,
  } = useApp();
  return (
    <>
      {showKursuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-950">Mahalle Kürsüsünde Söz Al</h3>
                  <p className="text-xs text-slate-500">Derdini, önerini veya görüşünü tüm mahalleyle paylaş</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKursuModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishKursu} className="space-y-3.5">
              {/* Kategori Seçimi */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Bildirim Türü / Kategori <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Sorun & Şikayet', label: '🗣️ Sorun & Şikayet', desc: 'Sokak, çöp, altyapı, aydınlatma vb.' },
                    { id: 'Öneri & Fikir', label: '💡 Öneri & Fikir', desc: 'Mahallemizi güzelleştirecek fikirler' },
                    { id: 'Dilek & Talep', label: '📌 Dilek & Talep', desc: 'Belediyeden veya kurumlardan istekler' },
                    { id: 'Teşekkür & Tebrik', label: '👏 Teşekkür & Tebrik', desc: 'Komşulara veya esnafa teşekkür' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setKursuKategori(cat.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        kursuKategori === cat.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-black">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Konu Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kursuBaslik}
                  onChange={(e) => setKursuBaslik(e.target.value)}
                  placeholder="Örn: 104. Sokak çöp konteyneri yenilenmeli veya Barış Parkı aydınlatması"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-900"
                />
              </div>

              {/* Konum / Sokak */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  İlgili Sokak / Konum (Opsiyonel)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={kursuKonum}
                    onChange={(e) => setKursuKonum(e.target.value)}
                    placeholder="Örn: 104. Sokak No: 12 karşısı veya Barış Parkı içi"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Detaylı Açıklama / Dert */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Görüşünüz / Anlatmak İstediğiniz Dert <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={kursuIcerik}
                  onChange={(e) => setKursuIcerik(e.target.value)}
                  placeholder="Yaşadığınız sorunu, mahallemiz için teklifinizi veya düşüncenizi komşularınızın anlayacağı şekilde açıkça yazın..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed text-slate-800"
                />
              </div>

              {/* Fotoğraf Ekleme (Opsiyonel) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Fotoğraf (Opsiyonel)
                </label>
                <PhotoUploadField value={kursuFoto} onChange={setKursuFoto} folder="mutlular_haber/kursus" accentClass="bg-indigo-600 hover:bg-indigo-700 text-white" />
              </div>

              {/* Bilgilendirme kutucuğu */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 flex items-start gap-2">
                <span className="text-base shrink-0">🤝</span>
                <span>
                  Kürsüdeki paylaşımlarınız doğrudan komşularınızın desteğine açılır. Komşular "Ben de Katılıyorum" diyerek sesinizi büyütebilir.
                </span>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKursuModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" /> Kürsüde Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
