// Pencere: NewsDetailView (eski App.tsx 8773–8969)
import { timeAgoTr, tarihEtiketi } from '../serviceMatching';
import { ChevronLeft, Bookmark, Share2, CheckCircle2, Eye, ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function NewsDetailView() {
  const {
    user, profile, savedNewsIds, setSavedNewsIds, newsComments, newsLikeCount, myNewsLike,
    newCommentInput, setNewCommentInput, isRealStaff, selectedNews, showToast,
    handleCloseNewsDetail, openShareStudio, newsToShareItem, handleToggleNewsLike,
    handleAddNewsComment, handleDeleteNewsComment,
  } = useApp();
  return (
    <>
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto flex flex-col animate-in fade-in duration-200">
          {/* Üst Yapışkan Navigasyon Çubuğu */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {/* Sol: Geri Dön Butonu */}
              <button
                onClick={handleCloseNewsDetail}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="Geri Dön"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Sağ: Kaydet (Bookmark) & Paylaş Butonları */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = selectedNews.id || 'current_news';
                    const isBookmarked = savedNewsIds.includes(id);
                    setSavedNewsIds(prev => isBookmarked ? prev.filter(x => x !== id) : [...prev, id]);
                    showToast(isBookmarked ? 'Kaydedilenlerden kaldırıldı' : 'Haber kaydedildi! 🔖');
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Kaydet"
                >
                  <Bookmark className={`w-4 h-4 ${savedNewsIds.includes(selectedNews.id || 'current_news') ? 'fill-red-600 text-red-600' : ''}`} />
                </button>

                <button
                  onClick={() => openShareStudio(newsToShareItem(selectedNews))}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Paylaş"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Haber Gövdesi */}
          <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4 pb-28">
            {/* Rozet: yalnızca gerçekten son dakika işaretli haberlerde */}
            <div className="flex items-center gap-2">
              {selectedNews.sonDakika && (
                <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  SON DAKİKA
                </span>
              )}
              {selectedNews.kategori && (
                <span className="bg-slate-100 text-slate-600 text-[11px] font-black px-3 py-1 rounded-full">{selectedNews.kategori}</span>
              )}
            </div>

            {/* Manşet Başlığı */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
              {selectedNews.baslik}
            </h1>

            {/* Yayın bilgisi: yalnızca kayıtlı gerçek veriler */}
            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  MH
                </div>
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1">
                    <span>{selectedNews.authorName || 'Mutlular Haber'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  {tarihEtiketi(selectedNews) && <div className="text-[11px] text-slate-400">{tarihEtiketi(selectedNews)}</div>}
                </div>
              </div>

              {(selectedNews.okunmaSayisi || 0) > 1 && (
                <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {(selectedNews.okunmaSayisi || 0).toLocaleString('tr-TR')}
                </span>
              )}
            </div>

            {/* Büyük Manşet Fotoğrafı (yalnızca yüklenmiş fotoğraf varsa) */}
            {selectedNews.imageURL && (
              <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200/80">
                <img src={selectedNews.imageURL} alt={selectedNews.baslik} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Haber Metni */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              {String(selectedNews.icerik || selectedNews.ozet || '')
                .split(/\n{2,}/)
                .filter((para) => para.trim())
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para.trim()}</p>
                ))}
            </div>

            {/* Tepkiler & Etkileşim Çubuğu */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-600">
              <button
                onClick={handleToggleNewsLike}
                className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer px-2 py-1 rounded-lg ${myNewsLike ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${myNewsLike ? 'fill-red-600 text-red-600' : 'text-slate-500'}`} />
                <span>{newsLikeCount}</span>
              </button>

              <div className="flex items-center gap-1.5 font-bold px-2 py-1">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>{newsComments.length}</span>
              </div>

              <button
                onClick={() => openShareStudio(newsToShareItem(selectedNews))}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Paylaş</span>
              </button>
            </div>

            {/* 💬 YORUMLAR (gerçek kayıtlar) */}
            <div className="space-y-3 pt-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">Yorumlar ({newsComments.length})</h3>

              {newsComments.length === 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 text-center text-xs text-slate-500">
                  Henüz yorum yok. İlk yorumu sen yaz.
                </div>
              )}

              <div className="space-y-3">
                {newsComments.map((comm) => (
                  <div key={comm.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {comm.authorPhoto ? (
                          <img src={comm.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center shrink-0">
                            {comm.authorName.charAt(0).toLocaleUpperCase('tr-TR')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">{comm.authorName}</div>
                          <div className="text-[10px] text-slate-400">{timeAgoTr(comm.createdAtMs)}</div>
                        </div>
                      </div>
                      {user && (comm.uid === user.uid || isRealStaff) && (
                        <button onClick={() => handleDeleteNewsComment(comm)} className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer shrink-0">
                          Sil
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✍️ EN ALTA YAPIŞIK YORUM YAZMA ÇUBUĞU (SCREEN 2) */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 shadow-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNewsComment();
              }}
              className="max-w-2xl mx-auto flex items-center gap-2.5"
            >
              <img
                src={profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                alt="Profilim"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  placeholder={user ? "Yorum yaz..." : "Yorum yazmak için giriş yapın"}
                  className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!newCommentInput.trim()}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
