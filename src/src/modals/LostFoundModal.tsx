// Pencere: LostFoundModal (eski App.tsx 9505–9613)
import { type LostFoundItem, addDoc, collection, db, serverTimestamp } from '../firebase';
import { X } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function LostFoundModal() {
  const {
    user, profile, lostFoundItems, setLostFoundItems, showLostFoundModal, setShowLostFoundModal,
    showToast,
  } = useApp();
  return (
    <>
      {showLostFoundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Kayıp / Buluntu Bildir</h3>
                <p className="text-xs text-gray-500">Zaman kritik olduğu için hemen yayına girer.</p>
              </div>
              <button onClick={() => setShowLostFoundModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const tur = (form.elements.namedItem('tur') as HTMLSelectElement).value as any;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const kategori = (form.elements.namedItem('kategori') as HTMLInputElement).value;
                const konum = (form.elements.namedItem('konum') as HTMLInputElement).value;
                const iletisimTelefon = (form.elements.namedItem('iletisimTelefon') as HTMLInputElement).value;
                const isCritical = (form.elements.namedItem('isCritical') as HTMLInputElement).checked;

                const newItem: LostFoundItem = {
                  tur,
                  baslik,
                  aciklama,
                  kategori,
                  konum,
                  isCritical,
                  iletisimKisi: profile?.name || 'Komşu',
                  iletisimTelefon,
                  status: 'published',
                  fotolar: ((form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value || '') ? [(form.elements.namedItem('fotoUrl') as HTMLInputElement).value] : []
                };

                setLostFoundItems([newItem, ...lostFoundItems]);
                try {
                  await addDoc(collection(db, 'lost_found_items'), {
                    ...newItem,
                    uid: user?.uid || 'sakin_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowLostFoundModal(false);
                showToast('Kayıp / buluntu ilanı yayına girdi! 🔍');
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Durum Türü</label>
                  <select name="tur" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500">
                    <option value="kayip">🔍 Kaybettim</option>
                    <option value="bulundu">✅ Buldum</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Kategori</label>
                  <input required name="kategori" defaultValue="Evcil Hayvan" placeholder="Örn: Evcil Hayvan, Anahtar" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Başlık</label>
                <input required name="baslik" placeholder="Örn: Beyaz tasmalı tekir kedi kayıp" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Görüldüğü Konum</label>
                  <input required name="konum" placeholder="Örn: Gül Sokak / Park" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">İletişim Tel</label>
                  <input required name="iletisimTelefon" defaultValue={profile?.telefon || ''} placeholder="05xx xxx xx xx" className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Detaylı Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Özellikler, tasma rengi, ayırt edici işaret..." className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField name="fotoUrl" folder="mutlular_haber/kayip" accentClass="bg-red-600 hover:bg-red-700 text-white" />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                <input type="checkbox" id="isCrit" name="isCritical" className="rounded text-red-600 focus:ring-red-500" />
                <label htmlFor="isCrit" className="text-[11px] font-black text-red-900 cursor-pointer">
                  Kritik Acil Kayıp (Tüm mahalleye acil alarmla gösterilsin)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2"
              >
                Bildirimi Canlı Yayına Al
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
