// Pencere: OfferModal (eski App.tsx 9616–9669)
import { X, Coins } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function OfferModal() {
  const {
    showOfferModal, setShowOfferModal, handleGiveOffer,
  } = useApp();
  return (
    <>
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Hizmet Teklifi Sun</h3>
                <p className="text-xs text-amber-700 font-bold">1 Dijital Kredi Karşılığı</p>
              </div>
              <button onClick={() => setShowOfferModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-500 block">Talep:</span>
              <p className="font-extrabold text-gray-900">{showOfferModal.baslik}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fiyat = parseFloat((form.elements.namedItem('fiyat') as HTMLInputElement).value);
                const mesaj = (form.elements.namedItem('mesaj') as HTMLTextAreaElement).value;
                const sure = (form.elements.namedItem('sure') as HTMLInputElement).value;
                handleGiveOffer(showOfferModal.id || 'req_1', fiyat, mesaj, sure);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Teklif Fiyatı (TL)</label>
                <input required name="fiyat" type="number" placeholder="Örn: 450" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Tahmini İş Süresi</label>
                <input required name="sure" placeholder="Örn: 1 Saat / Bugün 15:00" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Açıklamanız &amp; İşçilik Detayı</label>
                <textarea required name="mesaj" rows={2} placeholder="Malzeme dahil mi, garanti şartları..." className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Coins className="w-4 h-4" /> 1 Kredi ile Teklifi Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
