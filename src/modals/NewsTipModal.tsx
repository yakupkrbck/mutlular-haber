// Pencere: NewsTipModal (eski App.tsx 8972–9099)
import { addDoc, collection, db, serverTimestamp } from '../firebase';
import { type SampleNewsItem } from '../mockNeighborhoodData';
import { X } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function NewsTipModal() {
  const {
    user, profile, demoRole, newsItems, setNewsItems, showNewsModal, setShowNewsModal, showToast,
    isUserAdmin, isUserEditor,
  } = useApp();
  return (
    <>
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-base text-slate-900">
                  {isUserAdmin || isUserEditor ? 'Resmi Mahalle Haberi Yayınla' : 'Mahalle Haberi & İhbar Bildir'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUserAdmin || isUserEditor 
                    ? 'Yönetici/Editör yetkisiyle doğrudan Mutlular Haber bülteninde yayına alınır.' 
                    : 'İhbarınız Mutlular Haber Editör Masası tarafından incelendikten sonra yayına alınır.'}
                </p>
              </div>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const ozet = (form.elements.namedItem('ozet') as HTMLTextAreaElement).value;
                const icerik = (form.elements.namedItem('icerik') as HTMLTextAreaElement).value;
                const kategori = (form.elements.namedItem('kategori') as HTMLSelectElement).value;
                const fotoInput = (form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value;
                const sonDakikaInput = (form.elements.namedItem('sonDakika') as HTMLInputElement)?.checked || false;
                const telefonInput = (form.elements.namedItem('telefon') as HTMLInputElement)?.value;

                const isDirectPublish = isUserAdmin || isUserEditor;
                const newNewsItem: SampleNewsItem = {
                  id: (isDirectPublish ? 'haber_' : 'ihbar_') + Date.now(),
                  baslik,
                  ozet,
                  icerik,
                  kategori,
                  status: isDirectPublish ? 'approved' : 'pending',
                  isTip: !isDirectPublish,
                  authorName: profile?.name || 'Mahalle Sakini',
                  authorPhone: telefonInput || profile?.telefon || '',
                  authorRole: profile?.role || demoRole || 'sakin',
                  authorUid: user?.uid || 'user_demo',
                  sonDakika: isDirectPublish ? sonDakikaInput : false,
                  imageURL: fotoInput || "",
                  okunmaSayisi: 1,
                  begeniSayisi: 0,
                  tarihStr: 'Az önce'
                };

                setNewsItems([newNewsItem, ...newsItems]);
                try {
                  await addDoc(collection(db, 'haberler'), {
                    ...newNewsItem,
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowNewsModal(false);
                if (isDirectPublish) {
                  showToast('Resmi haber Mutlular Haber bültenine eklendi! 📰');
                } else {
                  showToast('Haber ihbarınız editör masasına iletildi! İncelendikten sonra yayınlanacaktır. 📬');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Kategori</label>
                <select name="kategori" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                  <option value="Belediye & Hizmet">Belediye &amp; Hizmet</option>
                  <option value="Çevre & Parklar">Çevre &amp; Parklar</option>
                  <option value="Asayiş & Güvenlik">Asayiş &amp; Güvenlik</option>
                  <option value="Dayanışma & Doğa">Dayanışma &amp; Doğa</option>
                  <option value="Eğitim & Kültür">Eğitim &amp; Kültür</option>
                  <option value="Duyuru">Genel Duyuru</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Haber Başlığı</label>
                <input required name="baslik" type="text" placeholder="Örn: Parktaki banklar yenilendi" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Kısa Özet</label>
                <textarea required name="ozet" rows={2} placeholder="Haberin ana fikri..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Detaylı İçerik</label>
                <textarea required name="icerik" rows={3} placeholder="Geniş açıklama..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Fotoğraf (İsteğe bağlı)</label>
                <PhotoUploadField name="fotoUrl" folder="mutlular_haber/haberler" accentClass="bg-blue-600 hover:bg-blue-700 text-white" />
              </div>

              {isUserAdmin || isUserEditor ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100">
                  <input name="sonDakika" type="checkbox" id="newsSonDakikaCheck" className="w-4 h-4 text-red-600 rounded" />
                  <label htmlFor="newsSonDakikaCheck" className="text-xs font-black text-red-900 cursor-pointer flex items-center gap-1">
                    <span>🚨</span> Son Dakika / Flaş Haber Olarak Yayınla
                  </label>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">İletişim Telefonunuz (Teyit için)</label>
                  <input name="telefon" type="tel" defaultValue={profile?.telefon || ''} placeholder="053x xxx xx xx" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
              )}

              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer ${
                  isUserAdmin || isUserEditor
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                }`}
              >
                {isUserAdmin || isUserEditor ? 'Haberi Doğrudan Yayına Al' : 'İhbarı Editör Masasına Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
