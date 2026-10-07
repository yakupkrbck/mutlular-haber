// Pencere: RequestDetailModal (eski App.tsx 9672–9820)
import { Edit3, X, Coins, MessageCircle } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function RequestDetailModal() {
  const {
    user, profile, demoRole, offersMap, ustaPhones, acceptingOfferId, showRequestDetail, setShowRequestDetail,
    handleOpenEditRequest, handleAcceptOffer, openWhatsApp,
  } = useApp();
  return (
    <>
      {showRequestDetail && (() => {
        const isDetailAuthor = Boolean(
          (user && showRequestDetail.uid && user.uid === showRequestDetail.uid) ||
          (user && profile?.name && showRequestDetail.authorName === profile.name) ||
          (!user && (showRequestDetail.uid === 'sakin_1' || showRequestDetail.uid === 'mock_user_1' || showRequestDetail.authorName === 'Ahmet Turan' || demoRole === 'sakin'))
        );
        const isDetailActive = showRequestDetail.status === 'open' || !showRequestDetail.status || showRequestDetail.status === 'in_progress';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                      {showRequestDetail.kategori}
                    </span>
                    {isDetailAuthor && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        ⭐ Sizin Talebiniz
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-base text-gray-900">{showRequestDetail.baslik}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isDetailAuthor && isDetailActive && (
                    <button
                      onClick={() => {
                        const target = showRequestDetail;
                        setShowRequestDetail(null);
                        handleOpenEditRequest(target);
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Talebi Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Düzenle</span>
                    </button>
                  )}
                  <button onClick={() => setShowRequestDetail(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{showRequestDetail.aciklama}</p>

              {/* Fotoğraflar */}
              {showRequestDetail.fotolar && showRequestDetail.fotolar.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-500">Talebe Ait Fotoğraflar:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {showRequestDetail.fotolar.map((photoUrl, pIdx) => (
                      <img
                        key={pIdx}
                        src={photoUrl}
                        alt={`${showRequestDetail.baslik} - ${pIdx + 1}`}
                        className="w-full h-28 object-cover rounded-xl border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const reqId = showRequestDetail.id || '';
                const detailOffers = offersMap[reqId] || [];
                const isOwnerStrict = Boolean(user && showRequestDetail.uid && user.uid === showRequestDetail.uid);
                const isOpen = !showRequestDetail.status || showRequestDetail.status === 'open';
                const offerTotal = Math.max(detailOffers.length, showRequestDetail.offerCount || 0);
                const statusLabel: Record<string, string> = { pending: 'Beklemede', accepted: 'Kabul edildi', rejected: 'Reddedildi' };
                const statusColor: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', accepted: 'bg-emerald-100 text-emerald-800', rejected: 'bg-slate-100 text-slate-500' };

                if (!isOwnerStrict && !detailOffers.length) {
                  return (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                        Bu talebe şu ana kadar {offerTotal} teklif verildi. Teklifleri yalnızca talep sahibi görür.
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="font-black text-xs text-gray-900 mb-2 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      {isOwnerStrict ? `Ustalardan Gelen Teklifler (${detailOffers.length})` : 'Verdiğiniz Teklif'}
                    </h4>

                    <div className="space-y-2">
                      {detailOffers.map((off) => (
                        <div key={off.id} className={`p-3 rounded-2xl border space-y-2 ${off.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200/80'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-xs text-gray-900">{off.esnafIsyeri}</span>
                            <span className="font-black text-sm text-emerald-600">{off.fiyat} TL</span>
                          </div>
                          <p className="text-xs text-gray-600">{off.mesaj}</p>
                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400">⏱️ {off.tahminiSure || 'Aynı Gün'}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${statusColor[off.status] || statusColor.pending}`}>{statusLabel[off.status] || 'Beklemede'}</span>
                            </div>

                            {isOwnerStrict && off.status === 'pending' && isOpen && (
                              <button
                                disabled={acceptingOfferId === off.id}
                                onClick={() => handleAcceptOffer(showRequestDetail, off)}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm cursor-pointer"
                              >
                                ✅ Teklifi Kabul Et
                              </button>
                            )}

                            {isOwnerStrict && off.status === 'accepted' && (
                              <button
                                disabled={!(ustaPhones[off.id || ''] || off.esnafTelefon)}
                                onClick={() => openWhatsApp(ustaPhones[off.id || ''] || off.esnafTelefon || '', `Merhaba ${off.esnafIsyeri}, "${showRequestDetail.baslik}" talebim için verdiğiniz ${off.fiyat} TL'lik teklifi kabul ettim.`)}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Ustaya Yaz
                              </button>
                            )}

                            {!isOwnerStrict && off.status === 'accepted' && off.musteriTelefon && (
                              <button
                                onClick={() => openWhatsApp(off.musteriTelefon || '', `Merhaba ${off.musteriAdi || ''}, "${showRequestDetail.baslik}" talebiniz için teklifiniz kabul edildi. Ne zaman uygunsunuz?`)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Müşteriye Yaz
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isOwnerStrict && detailOffers.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400">
                          Henüz usta teklifi gelmedi. Kategorinize uygun ustalara bildirim gitti; teklif geldiğinde size bildirim gelecek.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}
    </>
  );
}
