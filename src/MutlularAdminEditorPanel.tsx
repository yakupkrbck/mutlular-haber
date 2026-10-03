import { tarihEtiketi } from './serviceMatching';
import { type LiveConfig, EMPTY_LIVE, toEmbedUrl } from './liveStream';
import { AdminDataManager } from './AdminDataManager';
import React, { useState, useEffect } from 'react';
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
import PhotoUploadField from './PhotoUploadField';
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
    bildirimKategorisi?: 'sondakika' | 'haber' | 'duyuru' | 'etkinlik';
    authorName?: string;
  }) => Promise<void>;
  onApproveTip: (tip: SampleNewsItem) => Promise<void>;
  onRejectTip: (tip: SampleNewsItem, reason?: string) => Promise<void>;
  onDeleteNews: (id?: string, title?: string) => Promise<void>;
  liveConfig?: LiveConfig;
  onSaveLive?: (cfg: LiveConfig) => Promise<boolean>;
  polls?: { id: string; soru: string; kategori: string; secenekler: string[]; aktif: boolean; toplam: number; sayilar: number[]; endsAtMs: number }[];
  onCreatePoll?: (data: { soru: string; kategori: any; secenekler: string[]; endsAt: Date | null }) => Promise<boolean>;
  onTogglePoll?: (p: any) => Promise<void>;
  onDeletePoll?: (p: any) => Promise<void>;
  openTab?: string;
  pendingBusinesses?: any[];
  pendingCampaigns?: any[];
  onApproveBusiness?: (b: any) => Promise<void>;
  onRejectBusiness?: (b: any) => Promise<void>;
  onApproveCampaign?: (c: any) => Promise<void>;
  onRejectCampaign?: (c: any) => Promise<void>;
  shareSources?: { key: string; group: string; label: string; sub: string; item: any }[];
  onPrepareShare?: (item: any) => void;
  pendingDeceased?: { id: string; fullName: string; age?: number; family?: string; mosque?: string; prayerTime?: string; cemetery?: string; dateStr?: string; authorName?: string }[];
  onApproveDeceased?: (d: any) => Promise<void>;
  onRejectDeceased?: (d: any) => Promise<void>;
  onUpdateUserRole: (targetUid: string, newRole: UserRole, targetEmail?: string) => Promise<void>;
  onSwitchDemoRole?: (role: UserRole) => void;
  activeDemoRole?: UserRole;
  showToast: (msg: string, isError?: boolean) => void;
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
  liveConfig = EMPTY_LIVE,
  onSaveLive,
  polls = [],
  onCreatePoll,
  onTogglePoll,
  onDeletePoll,
  openTab,
  pendingBusinesses = [],
  pendingCampaigns = [],
  onApproveBusiness,
  onRejectBusiness,
  onApproveCampaign,
  onRejectCampaign,
  shareSources = [],
  onPrepareShare,
  pendingDeceased = [],
  onApproveDeceased,
  onRejectDeceased,
  onUpdateUserRole,
  onSwitchDemoRole,
  activeDemoRole = 'admin',
  showToast
}: MutlularAdminEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'create_news' | 'review_tips' | 'manage_roles' | 'manage_content' | 'live' | 'deceased' | 'social' | 'esnaf' | 'polls'>('review_tips');

  // Review sub-filter
  const [tipFilter, setTipFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [tipSearch, setTipSearch] = useState('');

  // Editing tip modal state
  const [editingTip, setEditingTip] = useState<SampleNewsItem | null>(null);

  // New News form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Belediye & Hizmet');
  const [newsNotifCat, setNewsNotifCat] = useState<'sondakika' | 'haber' | 'duyuru' | 'etkinlik'>('haber');
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

  // Canlı yayın taslağı (kayıtlı ayardan başlar)
  const [liveDraft, setLiveDraft] = useState<LiveConfig>(liveConfig);
  const [liveSaving, setLiveSaving] = useState(false);
  useEffect(() => {
    setLiveDraft({ ...EMPTY_LIVE, ...liveConfig });
  }, [liveConfig.aktif, liveConfig.baslik, liveConfig.aciklama, liveConfig.url]);

  // Anket oluşturma state
  const [pollQ, setPollQ] = useState('');
  const [pollCat, setPollCat] = useState<'ulasim' | 'cevre' | 'sosyal' | 'genel'>('genel');
  const [pollOpts, setPollOpts] = useState<string[]>(['Evet', 'Hayır']);
  const [pollEnd, setPollEnd] = useState('');
  const [pollSaving, setPollSaving] = useState(false);

  // Dışarıdan istenen sekmeyi aç (örn. Meclis ekranındaki "Anket Oluştur")
  useEffect(() => {
    if (isOpen && openTab) setActiveTab(openTab as any);
  }, [isOpen, openTab]);

  // Sosyal medya paneli state
  const [shareGroup, setShareGroup] = useState<string>('haber');
  const [shareSearch, setShareSearch] = useState('');

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
        bildirimKategorisi: newsSonDakika ? 'sondakika' : newsNotifCat,
        authorName: currentUser?.name ? `${currentUser.name} (${isAdmin ? 'Yönetici' : 'Editör'})` : 'Mutlular Haber'
      });

      // Reset form
      setNewsTitle('');
      setNewsOzet('');
      setNewsIcerik('');
      setNewsSonDakika(false);
      setNewsNotifCat('haber');
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

            {/* Sekme: Anketler (yönetici + editör) */}
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'polls'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 ring-2 ring-blue-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>🗳️</span>
              <span>Anketler</span>
            </button>

            {/* Sekme: Esnaf Onayı (işletmeler: yönetici, kampanyalar: yönetici + editör) */}
            <button
              onClick={() => setActiveTab('esnaf')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'esnaf'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80 ring-2 ring-teal-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>🏪</span>
              <span>Esnaf Onayı</span>
              {(pendingCampaigns.length + (isAdmin ? pendingBusinesses.length : 0)) > 0 && (
                <span className="px-1.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                  {pendingCampaigns.length + (isAdmin ? pendingBusinesses.length : 0)}
                </span>
              )}
            </button>

            {/* Sekme: Sosyal Medya (yönetici + editör) */}
            <button
              onClick={() => setActiveTab('social')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'social'
                  ? 'bg-white text-pink-700 shadow-sm border border-slate-200/80 ring-2 ring-pink-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>📸</span>
              <span>Sosyal Medya</span>
            </button>

            {/* Sekme: Vefat ilanı onayı (yönetici + editör) */}
            <button
              onClick={() => setActiveTab('deceased')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'deceased'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 ring-2 ring-emerald-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>🕊️</span>
              <span>Vefat Onayı</span>
              {pendingDeceased.length > 0 && (
                <span className="px-1.5 rounded-full text-[10px] font-black bg-red-600 text-white">{pendingDeceased.length}</span>
              )}
            </button>

            {/* Sekme 5: Canlı Yayın (yönetici + editör) */}
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-white text-red-700 shadow-sm border border-slate-200/80 ring-2 ring-red-500/20'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <span>📺</span>
              <span>Canlı Yayın</span>
              {liveConfig.aktif && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
            </button>

            {/* Sekme 4: İçerik Yönetimi (yalnızca yönetici) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('manage_content')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'manage_content'
                    ? 'bg-white text-red-700 shadow-sm border border-slate-200/80 ring-2 ring-red-500/20'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <span>🗑️</span>
                <span>İçerik Yönetimi</span>
              </button>
            )}
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
                            {tarihEtiketi(tip) && (
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tarihEtiketi(tip)}
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

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Bildirim kategorisi</label>
                    <select
                      value={newsSonDakika ? 'sondakika' : newsNotifCat}
                      disabled={newsSonDakika}
                      onChange={(e) => setNewsNotifCat(e.target.value as 'haber' | 'duyuru' | 'etkinlik')}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-60"
                    >
                      <option value="haber">📰 Mahalle haberi</option>
                      <option value="duyuru">📢 Önemli mahalle duyurusu</option>
                      <option value="etkinlik">🎉 Etkinlik</option>
                      {newsSonDakika && <option value="sondakika">🚨 Son dakika (işaretli)</option>}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">Kullanıcılar yalnızca seçtikleri kategorilerde bildirim alır.</p>
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
                    Haber Görseli
                  </label>
                  <PhotoUploadField value={newsImageUrl} onChange={setNewsImageUrl} folder="mutlular_haber/haberler" buttonLabel="Haber Fotoğrafı Yükle" accentClass="bg-blue-600 hover:bg-blue-700 text-white" />

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
          {activeTab === 'polls' && (
            <div className="space-y-5">
              <form
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!onCreatePoll) return;
                  setPollSaving(true);
                  const ok = await onCreatePoll({
                    soru: pollQ,
                    kategori: pollCat,
                    secenekler: pollOpts,
                    endsAt: pollEnd ? new Date(pollEnd + 'T23:59:59') : null
                  });
                  setPollSaving(false);
                  if (ok) {
                    setPollQ('');
                    setPollOpts(['Evet', 'Hayır']);
                    setPollEnd('');
                  }
                }}
              >
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Yeni anket</h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Soru</label>
                  <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} maxLength={200} required placeholder="Örn: Mahalleye yeni bir çocuk parkı yapılsın mı?" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategori</label>
                    <select value={pollCat} onChange={(e) => setPollCat(e.target.value as any)} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="genel">📋 Genel</option>
                      <option value="ulasim">🚲 Ulaşım & Yol</option>
                      <option value="cevre">🌳 Park & Çevre</option>
                      <option value="sosyal">🤝 Sosyal & Dayanışma</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Bitiş tarihi (opsiyonel)</label>
                    <input type="date" value={pollEnd} onChange={(e) => setPollEnd(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">Seçenekler (2 ile 6 arası)</label>
                  {pollOpts.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={o} onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))} maxLength={60} placeholder={`Seçenek ${i + 1}`} className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                      {pollOpts.length > 2 && (
                        <button type="button" onClick={() => setPollOpts(pollOpts.filter((_, j) => j !== i))} className="px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black cursor-pointer" aria-label="Seçeneği kaldır">×</button>
                      )}
                    </div>
                  ))}
                  {pollOpts.length < 6 && (
                    <button type="button" onClick={() => setPollOpts([...pollOpts, ''])} className="text-xs font-black text-blue-700 hover:text-blue-900 cursor-pointer">+ Seçenek ekle</button>
                  )}
                </div>
                <button type="submit" disabled={pollSaving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer">
                  {pollSaving ? 'Yayınlanıyor…' : '🗳️ Anketi Yayınla'}
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Anketler ({polls.length})</h4>
                {polls.length === 0 && <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center text-xs text-slate-500">Henüz anket yok.</div>}
                {polls.map((pl) => (
                  <div key={pl.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black text-sm text-slate-900">{pl.soru}</div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${pl.aktif && (!pl.endsAtMs || pl.endsAtMs > Date.now()) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {pl.aktif && (!pl.endsAtMs || pl.endsAtMs > Date.now()) ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      {pl.secenekler.map((o, i) => (
                        <div key={i}>• {o}: <strong>{pl.sayilar[i] || 0}</strong> oy</div>
                      ))}
                      <div className="text-slate-400 pt-0.5">Toplam {pl.toplam} oy</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => onTogglePoll?.(pl)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2 rounded-xl cursor-pointer">
                        {pl.aktif ? 'Anketi Kapat' : 'Yeniden Aç'}
                      </button>
                      <button type="button" onClick={() => onDeletePoll?.(pl)} className="px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black py-2 rounded-xl cursor-pointer">Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'esnaf' && (
            <div className="space-y-5">
              {isAdmin && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">İşletme başvuruları ({pendingBusinesses.length})</h4>
                  {pendingBusinesses.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center text-xs text-slate-500">Onay bekleyen işletme yok.</div>
                  )}
                  {pendingBusinesses.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                      <div className="flex items-start gap-3">
                        {(b.logoUrl || (b.fotolar && b.fotolar[0])) && (
                          <img src={b.logoUrl || b.fotolar[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-black text-sm text-slate-900">{b.isyeri}</div>
                          <div className="text-[11px] font-bold text-emerald-700">{b.kategori}</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{b.aciklama}</p>
                      <div className="text-xs text-slate-700 space-y-0.5">
                        <div>📍 {b.adres}</div>
                        {b.calismaSaatleri && <div>🕒 {b.calismaSaatleri}</div>}
                        <div>📞 {b.telefon}</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => onApproveBusiness?.(b)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl cursor-pointer">
                          ✅ Onayla ve Yayınla
                        </button>
                        <button type="button" onClick={() => onRejectBusiness?.(b)} className="px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black py-2 rounded-xl cursor-pointer">
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Kampanya onayları ({pendingCampaigns.length})</h4>
                {pendingCampaigns.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center text-xs text-slate-500">Onay bekleyen kampanya yok.</div>
                )}
                {pendingCampaigns.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                    <div className="flex items-start gap-3">
                      {(c.fotoUrl || (c.fotolar && c.fotolar[0])) && (
                        <img src={c.fotoUrl || c.fotolar[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-black text-sm text-slate-900">{c.baslik}</div>
                        <div className="text-[11px] text-slate-500">{c.isyeriAdi}{c.indirimOrani ? ` • ${c.indirimOrani}` : ''}</div>
                        {c.gecerlilikTarihi && <div className="text-[11px] text-slate-500">⏳ {c.gecerlilikTarihi}</div>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.aciklama}</p>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => onApproveCampaign?.(c)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl cursor-pointer">
                        ✅ Onayla ve Yayınla
                      </button>
                      <button type="button" onClick={() => onRejectCampaign?.(c)} className="px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black py-2 rounded-xl cursor-pointer">
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-3">
              <div className="rounded-2xl p-3 text-xs border bg-pink-50 border-pink-200 text-pink-900">
                Bir içerik seçin; hikâye görseli (1080 × 1920), kalıcı bağlantı ve paylaşım metni hazırlanır.
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['haber', '📰 Haber'],
                  ['cenaze', '🕊️ Vefat'],
                  ['duyuru', '📢 Duyuru'],
                  ['ilan', '🏷️ İlan'],
                  ['esnaf', '🏪 Esnaf']
                ] as const).map(([g, label]) => (
                  <button
                    key={g}
                    onClick={() => setShareGroup(g)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                      shareGroup === g ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label} ({shareSources.filter((x) => x.group === g).length})
                  </button>
                ))}
              </div>

              <input
                value={shareSearch}
                onChange={(e) => setShareSearch(e.target.value)}
                placeholder="İçerikte ara…"
                className="w-full sm:max-w-xs text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {shareSources
                  .filter((x) => x.group === shareGroup)
                  .filter((x) => !shareSearch.trim() || (x.label + ' ' + x.sub).toLowerCase().includes(shareSearch.toLowerCase()))
                  .slice(0, 60)
                  .map((x) => (
                    <div key={x.key} className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">{x.label}</div>
                        {x.sub && <div className="text-[11px] text-slate-500 truncate">{x.sub}</div>}
                      </div>
                      <button
                        onClick={() => onPrepareShare?.(x.item)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black cursor-pointer"
                      >
                        Paylaşım Hazırla
                      </button>
                    </div>
                  ))}
                {shareSources.filter((x) => x.group === shareGroup).length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">Bu türde yayında içerik yok.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deceased' && (
            <div className="space-y-3">
              <div className="rounded-2xl p-3 text-xs border bg-emerald-50 border-emerald-200 text-emerald-900">
                Mahalleliler, esnaf ve ustalar vefat ilanı bıraktığında ilan burada onayınızı bekler. Onayladığınızda üst şeritte ve vefat listesinde yayınlanır.
              </div>

              {pendingDeceased.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                  Onay bekleyen vefat ilanı yok.
                </div>
              )}

              {pendingDeceased.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-black text-sm text-slate-900">
                        {d.fullName}{d.age ? `, ${d.age}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500">İlanı bırakan: {d.authorName || 'Bilinmiyor'}</div>
                    </div>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">Onay bekliyor</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-0.5">
                    {d.family && <div>👪 {d.family}</div>}
                    {d.mosque && <div>🕌 {d.mosque} • {d.prayerTime}</div>}
                    {d.cemetery && <div>⚰️ {d.cemetery}</div>}
                    {d.dateStr && <div>📅 {d.dateStr}</div>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onApproveDeceased?.(d)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl cursor-pointer"
                    >
                      ✅ Onayla ve Yayınla
                    </button>
                    <button
                      type="button"
                      onClick={() => onRejectDeceased?.(d)}
                      className="px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black py-2 rounded-xl cursor-pointer"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'live' && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-3 text-xs border ${liveDraft.aktif ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {liveConfig.aktif
                  ? '📺 Yayın şu an AÇIK. Sakinler üstteki Canlı Yayın düğmesinden izleyebilir.'
                  : 'Yayın şu an kapalı. Aşağıya bağlantıyı yazıp "Yayını Başlat" derseniz sitede canlı yayın açılır.'}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Yayın Başlığı</label>
                  <input
                    value={liveDraft.baslik}
                    maxLength={100}
                    onChange={(e) => setLiveDraft({ ...liveDraft, baslik: e.target.value })}
                    placeholder="Örn: Cenaze Namazı Canlı Yayını"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Açıklama (opsiyonel)</label>
                  <textarea
                    value={liveDraft.aciklama}
                    maxLength={300}
                    rows={2}
                    onChange={(e) => setLiveDraft({ ...liveDraft, aciklama: e.target.value })}
                    placeholder="Kısa bilgi: saat, konu, yer…"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Yayın Bağlantısı (https)</label>
                  <input
                    value={liveDraft.url}
                    onChange={(e) => setLiveDraft({ ...liveDraft, url: e.target.value })}
                    placeholder="YouTube canlı yayın, Facebook video veya Vimeo bağlantısı"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    YouTube'da yayını başlattıktan sonra bağlantıyı kopyalayıp buraya yapıştırın. Sürekli kullanılan bir kanal için
                    <span className="font-mono"> youtube.com/channel/KANAL_ID/live</span> biçimi de çalışır.
                    {liveDraft.url.trim() && (toEmbedUrl(liveDraft.url)
                      ? ' ✅ Bu bağlantı uygulama içinde oynatılır.'
                      : ' ⚠️ Bu bağlantı uygulama içinde oynatılamaz; sakinlere "Yayını Aç" düğmesi gösterilir.')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={liveSaving}
                    onClick={async () => {
                      if (!onSaveLive) return;
                      setLiveSaving(true);
                      await onSaveLive({ ...liveDraft, aktif: true });
                      setLiveSaving(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black cursor-pointer"
                  >
                    {liveConfig.aktif ? '💾 Kaydet (yayın açık kalır)' : '🔴 Yayını Başlat'}
                  </button>
                  {liveConfig.aktif && (
                    <button
                      type="button"
                      disabled={liveSaving}
                      onClick={async () => {
                        if (!onSaveLive) return;
                        setLiveSaving(true);
                        await onSaveLive({ ...liveDraft, aktif: false });
                        setLiveSaving(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black cursor-pointer"
                    >
                      ⏹️ Yayını Bitir
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage_content' && isAdmin && (
            <AdminDataManager currentUid={currentUser?.uid} onToast={showToast} />
          )}

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
                <label className="text-xs font-black text-slate-700 block mb-1">Görsel</label>
                <PhotoUploadField
                  value={editingTip.imageURL || ''}
                  onChange={(url) => setEditingTip({ ...editingTip, imageURL: url })}
                  folder="mutlular_haber/haberler"
                  buttonLabel="Fotoğraf Yükle"
                  accentClass="bg-blue-600 hover:bg-blue-700 text-white"
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
