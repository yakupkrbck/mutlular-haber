// Pencere: DeceasedModal (eski App.tsx 11303–11456)
import { X } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function DeceasedModal() {
  const {
    showNewDeceasedModal, setShowNewDeceasedModal, newDeceasedName, setNewDeceasedName,
    newDeceasedAge, setNewDeceasedAge, newDeceasedFamily, setNewDeceasedFamily, newDeceasedMosque,
    setNewDeceasedMosque, newDeceasedPrayer, setNewDeceasedPrayer, newDeceasedCemetery,
    setNewDeceasedCemetery, newDeceasedDate, setNewDeceasedDate, handlePublishDeceased,
  } = useApp();
  return (
    <>
      {showNewDeceasedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl text-xl">
                  🕊️
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Vefat &amp; Cenaze İlanı Bırak</h3>
                  <p className="text-xs text-slate-500">Mutlular Mahallesi sakinlerine ve akrabalara taziye duyurusu</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewDeceasedModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishDeceased} className="space-y-3.5">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 font-medium leading-relaxed">
                İlanınız önce <strong>editör onayına</strong> gönderilir. Onaylandığında en üstteki <strong>Vefat &amp; Taziye</strong> şeridinde ve vefat listesinde tüm mahalleye duyurulur.
              </div>

              {/* Merhum / Merhume Adı ve Yaşı */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Merhum / Merhume Adı Soyadı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedName}
                    onChange={(e) => setNewDeceasedName(e.target.value)}
                    placeholder="Örn: Hacı Mehmet Yılmaz"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Yaşı (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={newDeceasedAge}
                    onChange={(e) => setNewDeceasedAge(e.target.value)}
                    placeholder="Örn: 74"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Aile ve Yakınları */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Aile &amp; Taziye Yakınları <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDeceasedFamily}
                  onChange={(e) => setNewDeceasedFamily(e.target.value)}
                  placeholder="Örn: Yılmaz ve Demir Aileleri (Ahmet Yılmaz'ın muhterem pederi)"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>

              {/* Cami ve Cenaze Vakti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cenaze Namazı Camii <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedMosque}
                    onChange={(e) => setNewDeceasedMosque(e.target.value)}
                    placeholder="Örn: Mutlular Fatih Camii"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Cenaze Vakti <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newDeceasedPrayer}
                    onChange={(e) => setNewDeceasedPrayer(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-slate-800"
                  >
                    <option value="Öğle Namazını Müteakip">Öğle Namazını Müteakip</option>
                    <option value="İkindi Namazını Müteakip">İkindi Namazını Müteakip</option>
                    <option value="Cuma Namazını Müteakip">Cuma Namazını Müteakip</option>
                    <option value="Sabah 10:30">Sabah 10:30 (Helallik &amp; Mezarlık)</option>
                    <option value="İkindi Öncesi">İkindi Öncesi</option>
                  </select>
                </div>
              </div>

              {/* Mezarlık ve Tarih */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Defin Yeri / Mezarlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeceasedCemetery}
                    onChange={(e) => setNewDeceasedCemetery(e.target.value)}
                    placeholder="Örn: Hamitler Kent Mezarlığı"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tarih
                  </label>
                  <input
                    type="text"
                    value={newDeceasedDate}
                    onChange={(e) => setNewDeceasedDate(e.target.value)}
                    placeholder="Örn: Bugün veya 25 Eylül"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDeceasedModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🕊️</span> Vefat İlanını Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
