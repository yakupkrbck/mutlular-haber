// Pencere: EditRequestModal (eski App.tsx 10038–10189)
import { Edit3, X, Camera, Check } from 'lucide-react';
import PhotoUploadField from '../PhotoUploadField';
import { useApp } from '../app/AppContext';

export function EditRequestModal() {
  const {
    ALL_SERVICE_CATEGORIES, editingRequest, setEditingRequest, editReqTitle, setEditReqTitle,
    editReqDesc, setEditReqDesc, editReqPhotos, editReqKategori, setEditReqKategori, editReqAdres,
    setEditReqAdres, handleAddPhotoToEdit, handleRemovePhotoFromEdit, handleSaveEditRequest,
  } = useApp();
  return (
    <>
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">Hizmet Talebini Düzenle</h3>
                  <p className="text-xs text-gray-500">Başlık, detaylı açıklama ve fotoğrafları güncelleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingRequest(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRequest} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Talep Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editReqTitle}
                  onChange={(e) => setEditReqTitle(e.target.value)}
                  placeholder="Örn: Mutfak lavabosu su kaçırıyor"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Hizmet Kategorisi
                  </label>
                  <select
                    value={editReqKategori}
                    onChange={(e) => setEditReqKategori(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {ALL_SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                    <option value="Diğer Mahalle Hizmeti">🛠️ Diğer Mahalle Hizmeti</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Açık Adres / Sokak
                  </label>
                  <input
                    type="text"
                    value={editReqAdres}
                    onChange={(e) => setEditReqAdres(e.target.value)}
                    placeholder="Örn: Menekşe Sokak No: 12"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  İhtiyacın Detayı &amp; Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editReqDesc}
                  onChange={(e) => setEditReqDesc(e.target.value)}
                  placeholder="Sorunun detayları, ne zaman müsait olduğunuz, malzeme durumu..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* FOTOĞRAFLAR YÖNETİMİ */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Talebe Ait Fotoğraflar ({editReqPhotos.length})
                  </label>
                  <span className="text-[10px] text-slate-400">Görseller teklif almayı kolaylaştırır</span>
                </div>

                {/* Mevcut Fotoğraflar Önizleme */}
                {editReqPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {editReqPhotos.map((photoUrl, pIdx) => (
                      <div key={pIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                        <img 
                          src={photoUrl} 
                          alt={`Foto ${pIdx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoFromEdit(pIdx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                          title="Fotoğrafı Kaldır"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">
                    Henüz fotoğraf eklenmemiş. Aşağıdan telefonunuzdan veya bilgisayarınızdan fotoğraf yükleyebilirsiniz.
                  </p>
                )}

                {/* Yeni Fotoğraf Yükleme */}
                <div className="pt-1">
                  <PhotoUploadField
                    value=""
                    onChange={(url) => { if (url) handleAddPhotoToEdit(url); }}
                    folder="mutlular_haber/talepler"
                    buttonLabel="Fotoğraf Yükle"
                    accentClass="bg-amber-600 hover:bg-amber-700 text-white"
                  />
                </div>
              </div>

              {/* BUTONLAR */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
