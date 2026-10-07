// Pencere: DavetModal (eski App.tsx 9102–9268)
import { type MahalleDavetItem, addDoc, collection, db, serverTimestamp } from '../firebase';
import { Sparkles, X } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function DavetModal() {
  const {
    user, profile, invitationItems, setInvitationItems, showDavetModal, setShowDavetModal,
    showToast,
  } = useApp();
  return (
    <>
      {showDavetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-pink-100 text-pink-700 rounded-2xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900">Mahalle Davetiyesi Paylaş</h3>
                  <p className="text-xs text-slate-500">Düğün, nişan, sünnet ve kutlamalarınızı komşularla paylaşın</p>
                </div>
              </div>
              <button onClick={() => setShowDavetModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const tur = (form.elements.namedItem('tur') as HTMLSelectElement).value as any;
                const baslik = (form.elements.namedItem('baslik') as HTMLInputElement).value;
                const davetSahipleri = (form.elements.namedItem('davetSahipleri') as HTMLInputElement).value;
                const gelinDamat = (form.elements.namedItem('gelinDamat') as HTMLInputElement).value;
                const tarih = (form.elements.namedItem('tarih') as HTMLInputElement).value;
                const saat = (form.elements.namedItem('saat') as HTMLInputElement).value;
                const mekanAdi = (form.elements.namedItem('mekanAdi') as HTMLInputElement).value;
                const salonBilgisi = (form.elements.namedItem('salonBilgisi') as HTMLInputElement).value;
                const adres = (form.elements.namedItem('adres') as HTMLInputElement).value;
                const aciklama = (form.elements.namedItem('aciklama') as HTMLTextAreaElement).value;
                const iletisimKisi = (form.elements.namedItem('iletisimKisi') as HTMLInputElement).value;
                const iletisimTelefon = (form.elements.namedItem('iletisimTelefon') as HTMLInputElement).value;
                const davetiyeFoto = (form.elements.namedItem('davetiyeFoto') as HTMLInputElement).value || '';

                const turEtiketiMap: Record<string, string> = {
                  dugun: '💍 Düğün & Nikah',
                  nisan: '💐 Nişan & Söz',
                  sunnet: '👑 Sünnet Şöleni',
                  kina: '✨ Kına Gecesi',
                  dogum_gunu: '🎂 Doğum Günü / Kutlama',
                  mevlid: '🤲 Mevlid-i Şerif',
                };

                const newDavet: MahalleDavetItem = {
                  tur,
                  turEtiketi: turEtiketiMap[tur] || '💍 Cemiyet Daveti',
                  baslik,
                  davetSahipleri,
                  gelinDamat: gelinDamat || undefined,
                  tarih,
                  saat,
                  mekanAdi,
                  salonBilgisi: salonBilgisi || undefined,
                  adres,
                  aciklama,
                  iletisimKisi: iletisimKisi || profile?.name || 'Davet Sahibi',
                  iletisimTelefon,
                  davetiyeFoto,
                  katilanSayisi: 1,
                  tebrikler: []
                };

                setInvitationItems([newDavet, ...invitationItems]);

                try {
                  await addDoc(collection(db, 'mahalle_davetleri'), {
                    ...newDavet,
                    uid: user?.uid || 'davet_demo',
                    createdAt: serverTimestamp()
                  });
                } catch (err: any) {
                  console.warn('Davet kaydetme Firestore:', err.message);
                }

                setShowDavetModal(false);
                showToast('Davetiyeniz panoda paylaşıldı! Hayırlı, uğurlu ve mutlu olsun 💐💍');
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Cemiyet Türü</label>
                  <select name="tur" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-bold">
                    <option value="dugun">💍 Düğün &amp; Nikah</option>
                    <option value="nisan">💐 Nişan &amp; Söz</option>
                    <option value="sunnet">👑 Sünnet Şöleni</option>
                    <option value="kina">✨ Kına Gecesi</option>
                    <option value="dogum_gunu">🎂 Doğum Günü</option>
                    <option value="mevlid">🤲 Bebek / Sünnet Mevlidi</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Damat &amp; Gelin / Çocuk</label>
                  <input name="gelinDamat" type="text" placeholder="Örn: Ayşe &amp; Mehmet" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Başlığı</label>
                <input required name="baslik" type="text" placeholder="Örn: Ayşe &amp; Mehmet Dünyaevine Giriyor" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Eden Aileler / Kişiler</label>
                <input required name="davetSahipleri" type="text" placeholder="Örn: Yılmaz ve Kaya Aileleri" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tarih</label>
                  <input required name="tarih" type="text" placeholder="Örn: 18 Ekim 2026 Pazar" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Saat / Zaman Aralığı</label>
                  <input required name="saat" type="text" placeholder="Örn: 19:00 - 23:00" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mekan / Salon Adı</label>
                  <input required name="mekanAdi" type="text" placeholder="Örn: Mutlular Kültür Düğün Salonu" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Salon / Kat (Opsiyonel)</label>
                  <input name="salonBilgisi" type="text" placeholder="Örn: Safir Salonu - 2. Kat" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mekan Açık Adresi</label>
                <input required name="adres" type="text" placeholder="Örn: Barış Manço Cad. No: 14 Mutlular" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">İletişim Kişisi</label>
                  <input required name="iletisimKisi" defaultValue={profile?.name || 'Hasan Bey'} type="text" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefon Numarası</label>
                  <input required name="iletisimTelefon" defaultValue="0532 555 44 33" type="tel" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davet Notu / Açıklama</label>
                <textarea required name="aciklama" rows={2} placeholder="Bu mutlu günümüzde tüm mahalleli komşularımızı aramızda görmekten onur duyarız..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Davetiye / Fotoğraf (Opsiyonel)</label>
                <PhotoUploadField name="davetiyeFoto" folder="mutlular_haber/davetler" accentClass="bg-pink-600 hover:bg-pink-700 text-white" />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer"
              >
                Davetiyeyi Panoda Yayınla 💐
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
