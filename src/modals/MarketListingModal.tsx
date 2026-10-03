// Pencere: MarketListingModal (eski App.tsx 9271–9502)
import { type MarketplaceItem, addDoc, collection, db, serverTimestamp } from '../firebase';
import { X, Building2, ShoppingBag } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function MarketListingModal() {
  const {
    user, profile, marketplaceItems, setMarketplaceItems, marketModalType, setMarketModalType,
    showMarketModal, setShowMarketModal, showToast,
  } = useApp();
  return (
    <>
      {showMarketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {marketModalType === 'emlak' ? '🏠 Emlak İlanı Bırak' : '📦 2. El Eşya İlanı Ver'}
                </h3>
                <p className="text-xs text-slate-500">Komşular doğrudan WhatsApp ile ulaşır, komisyonsuzdur.</p>
              </div>
              <button onClick={() => setShowMarketModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İlan Türü Seçim Sekmesi (Emlak vs 2. El) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setMarketModalType('emlak')}
                className={`text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketModalType === 'emlak'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" /> 🏠 Emlak (Ev / Dükkan)
              </button>
              <button
                type="button"
                onClick={() => setMarketModalType('ikinci_el')}
                className={`text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketModalType === 'ikinci_el'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> 📦 2. El Eşya &amp; Gereç
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const fiyat = parseFloat((form.elements.namedItem('fiyat') as HTMLInputElement).value) || 0;
                const saticiTelefon = (form.elements.namedItem('saticiTelefon') as HTMLInputElement).value;
                const fotoUrl = (form.elements.namedItem('fotoUrl') as HTMLInputElement)?.value;

                let newItem: MarketplaceItem;

                if (marketModalType === 'emlak') {
                  const emlakTuru = (form.elements.namedItem('emlakTuru') as HTMLSelectElement).value as any;
                  const odaSayisi = (form.elements.namedItem('odaSayisi') as HTMLSelectElement).value;
                  const metrekare = parseInt((form.elements.namedItem('metrekare') as HTMLInputElement).value) || 0;
                  const kat = (form.elements.namedItem('kat') as HTMLInputElement).value;
                  const isitma = (form.elements.namedItem('isitma') as HTMLInputElement).value;

                  const genId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                  newItem = {
                    id: genId,
                    baslik,
                    aciklama,
                    fiyat,
                    kategori: emlakTuru === 'kiralik' ? 'Kiralık Daire' : emlakTuru === 'satilik' ? 'Satılık Daire' : 'Devren İşyeri',
                    durum: 'az_kullanilmis',
                    saticiAdi: profile?.name || 'Mahalle Sakini (Ev Sahibi)',
                    saticiTelefon,
                    status: 'active',
                    ilanTuru: 'emlak',
                    emlakTuru,
                    odaSayisi,
                    metrekare,
                    kat,
                    isitma,
                    fotolar: fotoUrl ? [fotoUrl] : []
                  };
                } else {
                  const kategori = (form.elements.namedItem('kategori') as HTMLSelectElement).value;
                  const durum = (form.elements.namedItem('durum') as HTMLSelectElement).value as any;
                  const genId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

                  newItem = {
                    id: genId,
                    baslik,
                    aciklama,
                    fiyat,
                    kategori,
                    durum,
                    saticiAdi: profile?.name || 'Mahalle Sakini',
                    saticiTelefon,
                    status: 'active',
                    ilanTuru: 'ikinci_el',
                    fotolar: fotoUrl ? [fotoUrl] : []
                  };
                }

                setMarketplaceItems([newItem, ...marketplaceItems]);
                try {
                  await addDoc(collection(db, 'marketplace_items'), {
                    ...newItem,
                    uid: user?.uid || 'sakin_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (_) {}

                setShowMarketModal(false);
                showToast(marketModalType === 'emlak' ? 'Emlak ilanınız başarıyla yayınlandı! 🏠' : '2. El ilanı başarıyla yayınlandı! 🛋️');
              }}
              className="space-y-3"
            >
              {/* Emlak İlanına Özel Alanlar */}
              {marketModalType === 'emlak' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emlak Türü</label>
                      <select name="emlakTuru" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold">
                        <option value="kiralik">🔑 Kiralık Daire</option>
                        <option value="satilik">🏷️ Satılık Daire</option>
                        <option value="devren">🏪 Devren Dükkan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Oda Sayısı</label>
                      <select name="odaSayisi" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold">
                        <option value="1+1">1+1</option>
                        <option value="2+1">2+1</option>
                        <option value="3+1">3+1</option>
                        <option value="4+1">4+1</option>
                        <option value="Dükkan">Dükkan / Mağaza</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">m² (Net)</label>
                      <input required name="metrekare" type="number" defaultValue="115" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Kat</label>
                      <input name="kat" type="text" defaultValue="2. Kat" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Isıtma</label>
                      <input name="isitma" type="text" defaultValue="Kombi (Doğalgaz)" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </>
              )}

              {/* 2. El Eşyaya Özel Alanlar */}
              {marketModalType === 'ikinci_el' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Kategori</label>
                    <select name="kategori" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
                      <option value="Mobilya">Mobilya</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Anne & Bebek">Anne &amp; Bebek</option>
                      <option value="Spor & Bisiklet">Spor &amp; Bisiklet</option>
                      <option value="Ev Gereçleri">Ev Gereçleri</option>
                      <option value="Bağış & Ücretsiz">Bağış &amp; Ücretsiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Kullanım Durumu</label>
                    <select name="durum" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
                      <option value="az_kullanilmis">Az Kullanılmış</option>
                      <option value="ikinci_el">İkinci El</option>
                      <option value="sifir">Sıfır / Kutulu</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {marketModalType === 'emlak' ? 'Emlak İlan Başlığı' : 'Eşya / Ürün Başlığı'}
                </label>
                <input
                  required
                  name="baslik"
                  type="text"
                  placeholder={marketModalType === 'emlak' ? 'Örn: Barış Manço Parkı Yanı Ferah 3+1 Kiralık Daire' : 'Örn: Masif Ahşap Çalışma Masası ve Sandalye'}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {marketModalType === 'emlak' ? 'Kira / Fiyat (TL)' : 'Fiyat (TL - 0 = Ücretsiz)'}
                  </label>
                  <input required name="fiyat" type="number" placeholder="0" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp İletişim Telefonu</label>
                  <input required name="saticiTelefon" defaultValue="0532 999 88 77" type="tel" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField
                  key={marketModalType}
                  name="fotoUrl"
                  folder="mutlular_haber/ilanlar"
                  accentClass="bg-slate-900 hover:bg-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Özellikler, konum, teslim şekli..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none" />
              </div>

              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer ${
                  marketModalType === 'emlak' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {marketModalType === 'emlak' ? 'Emlak İlanını Yayınla 🏠' : '2. El İlanını Yayınla 📦'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
