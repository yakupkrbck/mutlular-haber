// Pencere: EmergencyModal (eski App.tsx 12241–12372)
import { X, Phone } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function EmergencyModal() {
  const {
    showEmergencyModal, setShowEmergencyModal,
  } = useApp();
  return (
    <>
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-red-200">
            {/* Başlık */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 bg-white/20 rounded-2xl">🚨</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">Acil Numaralar &amp; Önemli Hatlar</h3>
                  <p className="text-[11px] text-red-100 font-medium">Mutlular Mahallesi &amp; Bursa 7/24 Kesintisiz Hatlar</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İçerik */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* En Kritik: 112 */}
              <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    112
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-red-950">Tek Acil Çağrı Merkezi</h4>
                    <p className="text-[11px] text-red-700">Ambulans, İtfaiye, Polis, Jandarma, AFAD</p>
                  </div>
                </div>
                <a
                  href="tel:112"
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> Ara
                </a>
              </div>

              {/* Diğer Hizmet Numaraları Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: 'Mutlular Muhtarlığı',
                    sub: 'Mahalle Hizmetleri & Teyit',
                    phone: '0224 246 12 34',
                    tel: '02242461234',
                    icon: '🏛️',
                    bg: 'bg-blue-50 border-blue-200 text-blue-900',
                    btn: 'bg-blue-600'
                  },
                  {
                    title: 'Bursa BUSKİ Su Arıza',
                    sub: 'Patlak, Kesinti & Kanalizasyon',
                    phone: '185',
                    tel: '185',
                    icon: '💧',
                    bg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
                    btn: 'bg-cyan-600'
                  },
                  {
                    title: 'UEDAŞ Elektrik Arıza',
                    sub: 'Sokak Lambası & Elektrik Kesintisi',
                    phone: '186',
                    tel: '186',
                    icon: '⚡',
                    bg: 'bg-amber-50 border-amber-200 text-amber-900',
                    btn: 'bg-amber-600'
                  },
                  {
                    title: 'Bursagaz Doğalgaz Acil',
                    sub: 'Gaz Kaçağı & Acil Müdahale',
                    phone: '187',
                    tel: '187',
                    icon: '🔥',
                    bg: 'bg-orange-50 border-orange-200 text-orange-900',
                    btn: 'bg-orange-600'
                  },
                  {
                    title: 'Emek Polis Karakolu',
                    sub: 'Bölge Asayiş & Güvenlik',
                    phone: '0224 243 00 12',
                    tel: '02242430012',
                    icon: '🚓',
                    bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                    btn: 'bg-indigo-600'
                  },
                  {
                    title: 'Belediye Çağrı / Zabıta',
                    sub: 'Şikayet, Çevre & Zabıta',
                    phone: '444 16 00',
                    tel: '4441600',
                    icon: '🏢',
                    bg: 'bg-slate-50 border-slate-200 text-slate-900',
                    btn: 'bg-slate-700'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${item.bg} flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs truncate">{item.title}</h5>
                        <p className="text-[10px] opacity-75 truncate">{item.phone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${item.tel}`}
                      className={`${item.btn} hover:opacity-90 text-white font-black text-[11px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition-all shadow-xs`}
                    >
                      <Phone className="w-3 h-3" /> Ara
                    </a>
                  </div>
                ))}
              </div>

              {/* Kapat Butonu */}
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer text-center"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
