import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Phone, 
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Flame,
  PlusCircle,
  Save,
  Clock,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { type SampleNewsItem } from './mockNeighborhoodData';
import { type UserProfile, type UserRole } from './firebase';

interface MutlularAdminEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  currentUser: UserProfile | null;
  newsItems: SampleNewsItem[];
  allUsers: UserProfile[];
  onPublishNews: (newsData: {
    baslik: string;
    kategori: string;
    ozet: string;
    icerik: string;
    imageURL: string;
    sonDakika: boolean;
    authorName?: string;
  }) => Promise<void>;
  onApproveTip: (tip: SampleNewsItem) => Promise<void>;
  onRejectTip: (tip: SampleNewsItem, reason?: string) => Promise<void>;
  onDeleteNews: (id?: string, title?: string) => Promise<void>;
  onUpdateUserRole: (targetUid: string, newRole: UserRole, targetEmail?: string) => Promise<void>;
  onSwitchDemoRole?: (role: UserRole) => void;
  activeDemoRole?: UserRole;
  showToast: (msg: string) => void;
}

export function MutlularAdminEditorPanel({
  isOpen,
  onClose,
  isAdmin,
  isEditor,
  currentUser,
  newsItems,
  allUsers,
  onPublishNews,
  onApproveTip,
  onRejectTip,
  onDeleteNews,
  onUpdateUserRole,
  onSwitchDemoRole,
  activeDemoRole = 'admin',
  showToast
}: MutlularAdminEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'create_news' | 'review_tips' | 'manage_roles'>('review_tips');

  // Review sub-filter
  const [tipFilter, setTipFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [tipSearch, setTipSearch] = useState('');

  // Editing tip modal state
  const [editingTip, setEditingTip] = useState<SampleNewsItem | null>(null);

  // New News form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Belediye & Hizmet');
  const [newsOzet, setNewsOzet] = useState('');
  const [newsIcerik, setNewsIcerik] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80');
  const [newsSonDakika, setNewsSonDakika] = useState(false);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);

  // User management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [preAssignEmail, setPreAssignEmail] = useState('');
  const [preAssignRole, setPreAssignRole] = useState<UserRole>('editor');
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter tips
  const tips = newsItems.filter(n => n.status === 'pending' || n.isTip || n.id?.startsWith('ihbar_'));
  const pendingTipsCount = newsItems.filter(n => n.status === 'pending').length;

  const filteredTips = tips.filter(tip => {
    if (tipFilter === 'pending' && tip.status !== 'pending') return false;
    if (tipFilter === 'approved' && tip.status !== 'approved') return false;
    if (tipFilter === 'rejected' && tip.status !== 'rejected') return false;
    
    if (tipSearch.trim()) {
      const q = tipSearch.toLowerCase();
      return (
        (tip.baslik || '').toLowerCase().includes(q) ||
        (tip.authorName || '').toLowerCase().includes(q) ||
        (tip.ozet || '').toLowerCase().includes(q) ||
        (tip.kategori || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.telefon || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Preset images for fast news publishing
  const presetImages = [
    { label: 'Belediye & Hizmet', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Park & Yeşil Alan', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Kültür & Etkinlik', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Eğitim & Okul', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Esnaf & Çarşı', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Güvenlik & Asayiş', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80' }
  ];

  // Submit new news
  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsOzet.trim()) {
      showToast('Lütfen başlık ve özet alanlarını doldurun.');
      return;
    }

    setIsSubmittingNews(true);
    try {
      await onPublishNews({
        baslik: newsTitle.trim(),
        kategori: newsCategory,
        ozet: newsOzet.trim(),
        icerik: newsIcerik.trim() || newsOzet.trim(),
        imageURL: newsImageUrl.trim(),
        sonDakika: newsSonDakika,
        authorName: currentUser?.name ? `${currentUser.name} (${isAdmin ? 'Yönetici' : 'Editör'})` : 'Mutlular Haber'
      });

      // Reset form
      setNewsTitle('');
      setNewsOzet('');
      setNewsIcerik('');
      setNewsSonDakika(false);
      setActiveTab('review_tips');
    } catch (err: any) {
      showToast('Haber yayınlanırken bir sorun oluştu.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  // Submit edit tip
  const handleSaveAndPublishEditedTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTip) return;

    try {
      await onApproveTip(editingTip);
      setEditingTip(null);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* ── ÜST BAŞLIK BARI ── */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-black tracking-tight text-white">
                  Mutlular Yönetim &amp; Editör Masası
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {isAdmin ? 'Yönetici (Admin)' : 'Editör Masası'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resmi haber girişi, vatandaş ihbarlarının değerlendirilmesi ve kullanıcı yetki kontrolü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Rol Test Butonu (Yakup Bey'in hızlı rol testi için) */}
            {onSwitchDemoRole && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400 text-[10px] font-bold">Aktif Rol:</span>
                <span className="font-black text-amber-300 capitalize">{activeDemoRole}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── SEKMELER ── */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Sekme 1: Gelen İhbarlar */}
            <button
              onClick={() => setActiveTab('review_tips')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'review_tips'
                  ? 'bg-white text-orange-700 shadow-sm border border-slate-200/80 ring-2 ring-orange-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>📬</span>
              <span>Gelen İhbarlar</span>
              {pendingTipsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  {pendingTipsCount} bekliyor
                </span>
              )}
            </button>

            {/* Sekme 2: Haber Girişi */}
            <button
              onClick={() => setActiveTab('create_news')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'create_news'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 ring-2 ring-blue-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>✍️</span>
              <span>Resmi Haber Gir</span>
            </button>

            {/* Sekme 3: Rol Yönetimi */}
            <button
              onClick={() => setActiveTab('manage_roles')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'manage_roles'
                  ? 'bg-white text-purple-700 shadow-sm border border-slate-200/80 ring-2 ring-purple-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>👥</span>
              <span>Kullanıcı Rolleri</span>
              {isAdmin ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                  Admin
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Yetkili:</span>
            <strong className="text-slate-800">{currentUser?.name || 'Yönetici'}</strong>
          </div>
        </div>

        {/* ── İÇERİK ALANI ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">

          {/* ═════════════════════════════════════════════════════════════
              SEKME 1: GELEN HABER İHBARLARINI DEĞERLENDİRME MASASI
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'review_tips' && (
            <div className="space-y-4">
              
              {/* Filtre ve Arama Çubuğu */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setTipFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      tipFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bekleyenler ({newsItems.filter(n => n.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setTipFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      tipFilter === 'approved'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Onaylananlar ({newsItems.filter(n => n.status === 'approved' && n.isTip).length})
                  </button>
                  <button
                    onClick={() => setTipFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      tipFilter === 'rejected'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Reddedilenler ({newsItems.filter(n => n.status === 'rejected').length})
                  </button>
                  <button
                    onClick={() => setTipFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      tipFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tüm İhbarlar ({tips.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="İhbarlarda ara..."
                    value={tipSearch}
                    onChange={(e) => setTipSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* İhbar Listesi */}
              {filteredTips.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                    📬
                  </div>
                  <h4 className="font-black text-sm text-slate-800">
                    {tipFilter === 'pending' ? 'İnceleme Bekleyen Yeni İhbar Yok' : 'Filtreye Uygun İhbar Bulunamadı'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Mahalle sakinleri tarafından gönderilen haber, duyuru ve fotoğraflı sıcak olay ihbarları anlık olarak bu masaya düşer.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredTips.map((tip) => {
                    const isPending = tip.status === 'pending';
                    const isApproved = tip.status === 'approved';
                    const isRejected = tip.status === 'rejected';

                    return (
                      <div
                        key={tip.id || tip.baslik}
                        className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-2xs transition-all space-y-3.5 ${
                          isPending
                            ? 'border-amber-300 ring-2 ring-amber-400/20'
                            : isApproved
                            ? 'border-emerald-200'
                            : 'border-slate-200 opacity-75'
                        }`}
                      >
                        {/* Üst Satır: Gönderen Bilgisi & Durum */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700">
                              👤
                            </span>
                            <div>
                              <strong className="text-slate-900">{tip.authorName || 'Mahalle Sakini'}</strong>
                              <span className="text-slate-400 ml-2">({tip.authorRole || 'Sakin'})</span>
                            </div>
                            {tip.tarihStr && (
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tip.tarihStr}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* İletişim Butonları */}
                            {tip.authorPhone && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={`tel:${tip.authorPhone}`}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                                  title="Ara"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{tip.authorPhone}</span>
                                </a>
                                <a
                                  href={`https://wa.me/90${tip.authorPhone.replace(/\D/g, '')}?text=Merhaba, Dijital Mutlular'a ilettiğiniz haber ihbarınız ile ilgili görüşmek istiyoruz.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                  title="WhatsApp ile İletişime Geç"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}

                            {/* Durum Rozeti */}
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                                <span>⏳</span>
                                <span>İnceleme Bekliyor</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span>✅</span>
                                <span>Onaylandı &amp; Yayında</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                <span>❌</span>
                                <span>Reddedildi</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Gövde: Fotoğraf + Başlık + Detay */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {tip.imageURL && (
                            <div className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img
                                src={tip.imageURL}
                                alt={tip.baslik}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                                {tip.kategori || 'İhbar Fotoğrafı'}
                              </span>
                            </div>
                          )}

                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                                {tip.kategori || 'Genel İhbar'}
                              </span>
                              {tip.sonDakika && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                                  🚨 Flaş
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif text-sm sm:text-base font-black text-slate-900 tracking-tight">
                              {tip.baslik}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {tip.ozet}
                            </p>
                            {tip.icerik && tip.icerik !== tip.ozet && (
                              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {tip.icerik}
                              </p>
                            )}

                            {tip.tipStatusNote && (
                              <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                                <strong>Red Nedeni / Not:</strong> {tip.tipStatusNote}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            İşlem Yapılacak Yetkili: <strong>{currentUser?.name || 'Yönetici / Editör'}</strong>
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Düzenle & Yayına Al Butonu */}
                            <button
                              onClick={() => setEditingTip(tip)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Metni veya başlığı düzenleyip yayınla"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Düzenle &amp; Yayınla</span>
                            </button>

                            {/* Onayla ve Haberi Yayına Al */}
                            {tip.status !== 'approved' && (
                              <button
                                onClick={() => onApproveTip(tip)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-97"
                              >
                                <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>✅ Onayla &amp; Haberi Yayınla</span>
                              </button>
                            )}

                            {/* Reddet */}
                            {tip.status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  const reason = prompt('İhbarı reddetme nedeninizi yazabilirsiniz (örn: Teyit edilemedi, mükerrer bildirim):', 'Teyit edilemedi');
                                  if (reason !== null) {
                                    onRejectTip(tip, reason);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reddet</span>
                              </button>
                            )}

                            {/* Sil */}
                            <button
                              onClick={() => {
                                if (confirm('Bu ihbar kaydını kalıcı olarak silmek istediğinizden emin misiniz?')) {
                                  onDeleteNews(tip.id, tip.baslik);
                                }
                              }}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                              title="Kaydı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SEKME 2: RESMİ HABER GİRİŞİ (YÖNETİCİ & EDİTÖR)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'create_news' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📰</span>
                  <h3 className="font-serif text-lg font-black text-slate-900">
                    Mutlular Haber • Doğrudan Resmi Haber Yayını
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Yönetici veya Editör olarak girdiğiniz haberler inceleme gerekmeksizin doğrudan canlı bültene eklenir.
                </p>
              </div>

              <form onSubmit={handleSubmitNews} className="space-y-4">
                {/* Başlık */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Haber Başlığı *
                  </label>
                  <input
                    required
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Örn: Mehmet Akif Mahallesi'nde Yeni Çocuk Oyun Parkı Hizmete Açıldı"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-bold text-slate-900"
                  />
                </div>

                {/* Kategori ve Flaş Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Belediye & Hizmet">Belediye &amp; Hizmet</option>
                      <option value="Çevre & Parklar">Çevre &amp; Parklar</option>
                      <option value="Asayiş & Güvenlik">Asayiş &amp; Güvenlik</option>
                      <option value="Dayanışma & Doğa">Dayanışma &amp; Doğa</option>
                      <option value="Eğitim & Kültür">Eğitim &amp; Kültür</option>
                      <option value="Spor & Gençlik">Spor &amp; Gençlik</option>
                      <option value="Duyuru">Genel Muhtarlık Duyurusu</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-red-50/50 cursor-pointer w-full mt-auto">
                      <input
                        type="checkbox"
                        checked={newsSonDakika}
                        onChange={(e) => setNewsSonDakika(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-red-600" />
                          <span>Son Dakika / Flaş Haber</span>
                        </span>
                        <p className="text-[10px] text-slate-500">Üst vitrinde kırmızı rozetle sabitlenir</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Kısa Özet */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Kısa Özet (Manşet Açıklaması) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newsOzet}
                    onChange={(e) => setNewsOzet(e.target.value)}
                    placeholder="Vitrinde ve haber kartında görünecek 1-2 cümlelik çarpıcı özet..."
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-none font-medium"
                  />
                </div>

                {/* Detaylı İçerik */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Detaylı Haber Metni
                  </label>
                  <textarea
                    rows={4}
                    value={newsIcerik}
                    onChange={(e) => setNewsIcerik(e.target.value)}
                    placeholder="Haberin tüm ayrıntıları, yetkili açıklamaları ve adres bilgileri..."
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Görsel URL & Hızlı Şablonlar */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">
                    Haber Görseli URL
                  </label>
                  <input
                    type="url"
                    value={newsImageUrl}
                    onChange={(e) => setNewsImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />

                  {/* Hazır Görsel Seçenekleri */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      Hızlı Tematik Görsel Seç:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {presetImages.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setNewsImageUrl(p.url)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            newsImageUrl === p.url
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gönder Butonu */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingNews}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <span>🚀</span>
                    <span>{isSubmittingNews ? 'Yayınlanıyor…' : 'Haberi Doğrudan Yayına Al (Mutlular Haber)'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SEKME 3: KULLANICI & ROL YÖNETİMİ (YÖNETİCİ / ADMIN)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'manage_roles' && (
            <div className="space-y-5">
              {!isAdmin ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
                    🔒
                  </div>
                  <h4 className="font-black text-sm text-slate-900">Bu Alan Yalnızca Sistem Yöneticisine Açıktır</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Kullanıcı rolleri ve yetki dağıtımı yalnızca Süper Yönetici (Admin) hesabı tarafından düzenlenebilir.
                  </p>
                </div>
              ) : (
                <>
                  {/* İstatistikler */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-400 block">Toplam Kullanıcı</span>
                      <strong className="text-xl font-black text-slate-900">{allUsers.length}</strong>
                    </div>
                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
                      <span className="text-[11px] font-black text-amber-800 block">👑 Yöneticiler (Admin)</span>
                      <strong className="text-xl font-black text-amber-900">
                        {allUsers.filter(u => u.role === 'admin').length}
                      </strong>
                    </div>
                    <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200/80 shadow-2xs">
                      <span className="text-[11px] font-black text-indigo-800 block">✍️ Editörler</span>
                      <strong className="text-xl font-black text-indigo-900">
                        {allUsers.filter(u => u.role === 'editor').length}
                      </strong>
                    </div>
                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                      <span className="text-[11px] font-black text-emerald-800 block">🏪 Mahalle Esnafı</span>
                      <strong className="text-xl font-black text-emerald-900">
                        {allUsers.filter(u => u.role === 'esnaf').length}
                      </strong>
                    </div>
                  </div>

                  {/* Hızlı Rol Atama / E-posta ile Yetkilendirme Kartı */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="font-serif text-sm font-black tracking-tight text-white">
                        Hızlı Rol Ata / E-posta ile Yetkilendir
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      Yeni bir editör veya yönetici eklemek için kullanıcının e-posta adresini girip istediğiniz rolü tanımlayabilirsiniz.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                      <input
                        type="email"
                        placeholder="kullanici@gmail.com"
                        value={preAssignEmail}
                        onChange={(e) => setPreAssignEmail(e.target.value)}
                        className="w-full sm:flex-1 text-xs p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <select
                        value={preAssignRole}
                        onChange={(e) => setPreAssignRole(e.target.value as UserRole)}
                        className="w-full sm:w-48 text-xs p-3 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                      >
                        <option value="editor">✍️ Editör (Editor)</option>
                        <option value="admin">👑 Yönetici (Admin)</option>
                        <option value="esnaf">🏪 Mahalle Esnafı</option>
                        <option value="sakin">👤 Mahalle Sakini</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (!preAssignEmail.trim() || !preAssignEmail.includes('@')) {
                            showToast('Lütfen geçerli bir e-posta adresi girin.');
                            return;
                          }
                          await onUpdateUserRole(`email_${preAssignEmail.trim()}`, preAssignRole, preAssignEmail.trim());
                          setPreAssignEmail('');
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shrink-0 shadow-md active:scale-97"
                      >
                        Rolü Tanımla
                      </button>
                    </div>
                  </div>

                  {/* Kullanıcı Listesi ve Filtre */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="font-serif text-sm font-black text-slate-900">
                          Kayıtlı Kullanıcılar ve Rol Yetkileri
                        </h4>
                        <p className="text-xs text-slate-500">
                          Seçilen rol anında veritabanına ve kullanıcının oturumuna yansıtılır.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value as any)}
                          className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="all">Tüm Roller</option>
                          <option value="admin">Yöneticiler</option>
                          <option value="editor">Editörler</option>
                          <option value="esnaf">Esnaflar</option>
                          <option value="sakin">Sakinler</option>
                        </select>

                        <div className="relative flex-1 sm:w-48">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="İsim / E-posta..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full text-xs pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kullanıcı Tablosu / Listesi */}
                    <div className="space-y-2.5">
                      {filteredUsers.map((u) => {
                        const isSuperAdminEmail = u.email === 'yakupkrbck@gmail.com';
                        const isCurrent = currentUser?.uid === u.uid;

                        return (
                          <div
                            key={u.uid || u.email}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              u.role === 'admin'
                                ? 'bg-amber-50/40 border-amber-200'
                                : u.role === 'editor'
                                ? 'bg-indigo-50/40 border-indigo-200'
                                : u.role === 'esnaf'
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{u.name?.slice(0, 1) || 'U'}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <strong className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {u.name}
                                  </strong>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-900 text-white">
                                      Sen
                                    </span>
                                  )}
                                  {isSuperAdminEmail && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                                      Süper Yönetici
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {u.email || 'E-posta belirtilmemiş'}
                                  {u.telefon ? ` • ${u.telefon}` : ''}
                                </p>
                              </div>
                            </div>

                            {/* Rol Değiştirme Seçici */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <select
                                value={u.role || 'sakin'}
                                disabled={isSuperAdminEmail && isCurrent}
                                onChange={async (e) => {
                                  const newRole = e.target.value as UserRole;
                                  setIsUpdatingRole(u.uid);
                                  try {
                                    await onUpdateUserRole(u.uid, newRole, u.email);
                                  } finally {
                                    setIsUpdatingRole(null);
                                  }
                                }}
                                className={`text-xs font-black p-2 rounded-xl border focus:outline-none transition-all cursor-pointer ${
                                  u.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : u.role === 'editor'
                                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                    : u.role === 'esnaf'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-white text-slate-700 border-slate-300'
                                }`}
                              >
                                <option value="admin">👑 Yönetici (Admin)</option>
                                <option value="editor">✍️ Editör (Editor)</option>
                                <option value="esnaf">🏪 Mahalle Esnafı</option>
                                <option value="sakin">👤 Mahalle Sakini</option>
                              </select>

                              {isUpdatingRole === u.uid && (
                                <span className="text-[10px] text-slate-400 animate-pulse">Kaydediliyor…</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rol Yetki Matrisi Bilgi Kutusu */}
                  <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                    <h5 className="font-serif font-black text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Rol Yetki Matrisi &amp; Sorumluluklar</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <strong className="text-amber-800 font-black block mb-1">👑 Yönetici (Admin) Yetkileri:</strong>
                        <span>Tüm platforma tam erişim, doğrudan haber girişi, vatandaş haber ihbarlarını onaylama/düzenleme/silme, tüm kullanıcıların rollerini atama ve düzenleme.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <strong className="text-indigo-800 font-black block mb-1">✍️ Editör (Editor) Yetkileri:</strong>
                        <span>Mutlular Haber bültenine doğrudan haber girme, vatandaş ihbarlarını inceleme, düzenleme, yayına alma ve reddetme.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <strong className="text-emerald-800 font-black block mb-1">🏪 Mahalle Esnafı Yetkileri:</strong>
                        <span>Esnaf vitrininde dükkan kaydı, kampanya ve indirim yayınlama, hizmet taleplerine teklif verme, haber ihbarı gönderme.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <strong className="text-slate-800 font-black block mb-1">👤 Mahalle Sakini Yetkileri:</strong>
                        <span>2. El ve Emlak ilanı verme, usta talebi oluşturma, fotoğraf ve bilgiyle haber ihbarı gönderme.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── İHBAR DÜZENLEME & YAYINLAMA MODALI ── */}
      {editingTip && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-black text-slate-900">
                  İhbarı Düzenle &amp; Haberi Yayına Al
                </h3>
                <p className="text-xs text-slate-500">
                  Metni, başlığı ve görseli kontrol edip düzenledikten sonra doğrudan canlı bültene ekleyin.
                </p>
              </div>
              <button
                onClick={() => setEditingTip(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublishEditedTip} className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Haber Başlığı</label>
                <input
                  required
                  type="text"
                  value={editingTip.baslik}
                  onChange={(e) => setEditingTip({ ...editingTip, baslik: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={editingTip.kategori || 'Haber'}
                    onChange={(e) => setEditingTip({ ...editingTip, kategori: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Belediye & Hizmet">Belediye &amp; Hizmet</option>
                    <option value="Çevre & Parklar">Çevre &amp; Parklar</option>
                    <option value="Asayiş & Güvenlik">Asayiş &amp; Güvenlik</option>
                    <option value="Dayanışma & Doğa">Dayanışma &amp; Doğa</option>
                    <option value="Eğitim & Kültür">Eğitim &amp; Kültür</option>
                    <option value="Duyuru">Genel Duyuru</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 w-full mt-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTip.sonDakika || false}
                      onChange={(e) => setEditingTip({ ...editingTip, sonDakika: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-xs font-black text-slate-800">🚨 Flaş Haber</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Özet</label>
                <textarea
                  required
                  rows={2}
                  value={editingTip.ozet}
                  onChange={(e) => setEditingTip({ ...editingTip, ozet: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Detaylı İçerik</label>
                <textarea
                  rows={3}
                  value={editingTip.icerik || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, icerik: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Görsel URL</label>
                <input
                  type="url"
                  value={editingTip.imageURL || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, imageURL: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Onayla &amp; Haberi Yayınla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
