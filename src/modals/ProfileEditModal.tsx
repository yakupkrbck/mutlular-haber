// Pencere: ProfileEditModal (eski App.tsx 10577–10773)
import { ESNAF_TURLERI } from '../serviceMatching';
import { X, Phone, MapPin, Clock } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function ProfileEditModal() {
  const {
    editHesapTipi, setEditHesapTipi, editCustomArea, setEditCustomArea, ALL_SERVICE_CATEGORIES,
    showProfileEditModal, setShowProfileEditModal, editName, setEditName, editPhone, setEditPhone,
    editPhotoURL, setEditPhotoURL, editRole, setEditRole, editIsyeri, setEditIsyeri,
    editEsnafKategori, setEditEsnafKategori, editAdres, setEditAdres, editCalismaSaatleri,
    setEditCalismaSaatleri, editUzmanlikEtiketleri, setEditUzmanlikEtiketleri, editUzmanlikInput,
    setEditUzmanlikInput, handleSaveProfile, renderAreaSelect,
  } = useApp();
  return (
    <>
      {showProfileEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Profil Bilgilerini Düzenle</h3>
                <p className="text-xs text-gray-500">İletişim ve rol bilgilerinizi güncelleyin</p>
              </div>
              <button onClick={() => setShowProfileEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Profil Fotoğrafı / Avatarı */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500 shadow-xs shrink-0 bg-white flex items-center justify-center">
                    <img
                      src={editPhotoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editName || 'Sakin')}&backgroundColor=dc2626`}
                      alt="Profil Önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editName || 'Sakin')}&backgroundColor=dc2626`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Profil Fotoğrafı
                    </label>
                    <span className="text-[10px] text-slate-400 block">
                      Üstte ve paylaşımlarda görünecek yuvarlak görsel
                    </span>
                  </div>
                </div>

                <PhotoUploadField value={editPhotoURL} onChange={setEditPhotoURL} round folder="mutlular_haber/avatars" buttonLabel="Profil Fotoğrafı Yükle" accentClass="bg-red-600 hover:bg-red-700 text-white" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Telefon Numarası (WhatsApp İletişim)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Rol / Üyelik Türü</label>
                <select
                  value={editRole === 'sakin' ? 'sakin' : editHesapTipi}
                  onChange={(e) => {
                    const v = e.target.value as 'sakin' | 'usta' | 'esnaf';
                    if (v === 'sakin') {
                      setEditRole('sakin');
                    } else {
                      setEditRole('esnaf');
                      if (v !== editHesapTipi) {
                        setEditHesapTipi(v);
                        setEditEsnafKategori(v === 'usta' ? ALL_SERVICE_CATEGORIES[0].name : ESNAF_TURLERI[0]);
                        setEditCustomArea('');
                      }
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                >
                  <option value="sakin">🏡 Mahalle Sakini</option>
                  <option value="usta">🛠️ Usta (hizmet veriyorum)</option>
                  <option value="esnaf">🏪 Esnaf (dükkanım var)</option>
                </select>
              </div>

              {editRole === 'esnaf' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-amber-950 block">{editHesapTipi === 'usta' ? 'Usta Profil Detayları' : 'Esnaf Profil Detayları'}</span>
                  
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">{editHesapTipi === 'usta' ? 'Usta / Firma Adı' : 'İşletme / Dükkan Ünvanı'}</label>
                    <input
                      type="text"
                      value={editIsyeri}
                      onChange={(e) => setEditIsyeri(e.target.value)}
                      placeholder="Örn: Mutlular Tesisat &amp; Kombi"
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">{editHesapTipi === 'usta' ? 'Faaliyet / Hizmet Alanı' : 'İşletme Türü'}</label>
                    {renderAreaSelect(editHesapTipi, editEsnafKategori, setEditEsnafKategori, editCustomArea, setEditCustomArea)}
                  </div>

                  {/* İşletme Adresi */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">İşletme Adresi</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editAdres}
                        onChange={(e) => setEditAdres(e.target.value)}
                        placeholder="Örn: Mutlular Mah. Fatih Cad. No: 12"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Çalışma Saatleri */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Çalışma Saatleri</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editCalismaSaatleri}
                        onChange={(e) => setEditCalismaSaatleri(e.target.value)}
                        placeholder="Örn: Pzt - Cmt: 08:30 - 19:30"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Uzmanlık Etiketleri (yalnızca usta) */}
                  {editHesapTipi === 'usta' && (
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Uzmanlık Etiketleri</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editUzmanlikEtiketleri.map((t, idx) => (
                        <span key={idx} className="text-[11px] bg-white text-amber-950 px-2 py-0.5 rounded-lg border border-amber-200 font-bold flex items-center gap-1">
                          {t}
                          <button
                            type="button"
                            onClick={() => setEditUzmanlikEtiketleri(editUzmanlikEtiketleri.filter((_, i) => i !== idx))}
                            className="text-red-600 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editUzmanlikInput}
                        onChange={(e) => setEditUzmanlikInput(e.target.value)}
                        placeholder="Etiket ekle..."
                        className="flex-1 text-xs p-2 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editUzmanlikInput.trim() && !editUzmanlikEtiketleri.includes(editUzmanlikInput.trim())) {
                            setEditUzmanlikEtiketleri([...editUzmanlikEtiketleri, editUzmanlikInput.trim()]);
                            setEditUzmanlikInput('');
                          }
                        }}
                        className="bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all mt-2 cursor-pointer"
              >
                Bilgileri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
