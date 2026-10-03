// Pencere: QuickActionSheet (eski App.tsx 8516–8770)
import { X, Megaphone, ChevronRight, Building2, Tag, Wrench, Search, Sparkles, Store } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function QuickActionSheet() {
  const {
    setShowDavetModal, setMarketModalType, setShowArmutWizard, setArmutStep, setShowKursuModal,
    setKursuBaslik, setKursuIcerik, setKursuKonum, setKursuFoto, setShowMarketModal,
    setShowLostFoundModal, setShowNewsModal, showQuickActionSheet, setShowQuickActionSheet,
    setShowNewDeceasedModal, openCampaignModal,
  } = useApp();
  return (
    <>
      {showQuickActionSheet && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Karartma arka plan */}
          <div 
            onClick={() => setShowQuickActionSheet(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
              
              {/* Başlık ve Kapat */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    MH
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">Paylaşım &amp; İlan Merkezi</h3>
                    <p className="text-[11px] text-slate-500">Ne paylaşmak veya talep etmek istersiniz?</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuickActionSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Seçenekler Listesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1: Haber veya Duyuru Paylaş */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowNewsModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-blue-700 transition-colors">
                      Haber veya Duyuru Paylaş
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Mahalle bülteni için duyuru ve haber
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2: Emlak İlanı Ver */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setMarketModalType('emlak');
                    setShowMarketModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 hover:border-amber-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-amber-800 transition-colors">
                      Emlak İlanı Ver
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Satılık, kiralık konut, dükkan veya arsa
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3: 2. El Eşya İlanı Ver */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setMarketModalType('ikinci_el');
                    setShowMarketModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-rose-700 transition-colors">
                      2. El Eşya Sat
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Mobilya, elektronik, bisiklet, giyim
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 4: Usta & Hizmet Talebi Aç */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setArmutStep(1);
                    setShowArmutWizard(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-emerald-700 transition-colors">
                      Usta &amp; Hizmet Talebi Aç
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Tesisat, boya, elektrik, temizlik, organizasyon
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 5: Kayıp İhbarı */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowLostFoundModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-purple-700 transition-colors">
                      Kayıp / Buluntu Bildir
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Kayıp evcil hayvan veya bulunan eşya
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 6: Cemiyet & Davet Paylaş */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowDavetModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-50 hover:border-pink-300 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-pink-700 transition-colors">
                      Düğün &amp; Davet Paylaş
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Düğün, nişan, sünnet davetiyesi yayınla
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 7: Cenaze / Vefat İlanı */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setShowNewDeceasedModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform text-lg">
                    🕊️
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-slate-800 transition-colors">
                      Vefat &amp; Taziye Bildir
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      Cenaze namazı ve taziye duyurusu bırak
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 8: Esnaf Kampanyası & İndirim */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    openCampaignModal();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5 text-amber-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-xs text-slate-900 block group-hover:text-amber-800 transition-colors">
                      Esnaf İndirimi Duyur
                    </span>
                    <span className="text-[10px] text-slate-600 line-clamp-1">
                      Mahalle Pazarı için kampanya veya indirim
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 6: Mahalle Kürsüsü: Dert & Görüş Bildir */}
                <button
                  onClick={() => {
                    setShowQuickActionSheet(false);
                    setKursuBaslik('');
                    setKursuIcerik('');
                    setKursuKonum('');
                    setKursuFoto('');
                    setShowKursuModal(true);
                  }}
                  className="sm:col-span-2 flex items-center gap-3 p-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 hover:border-indigo-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 block group-hover:text-indigo-800 transition-colors">
                        Mahalle Kürsüsünde Görüş / Dert Bildir
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-md">
                        Söz Mahallelinin
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 line-clamp-1">
                      Sorun, şikayet, öneri veya teşekkürünüzü komşularınızla paylaşın
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Kapat Butonu */}
              <button
                onClick={() => setShowQuickActionSheet(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
