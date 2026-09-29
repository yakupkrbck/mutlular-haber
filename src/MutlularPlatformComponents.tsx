import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  Plus,
  Share2,
  Heart,
  Eye,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Star,
  Building2,
  Car,
  Wrench,
  Newspaper,
  Megaphone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Tag,
  Filter,
  X,
  Sparkles,
  Radio,
  User as UserIcon,
  Menu,
  Bookmark,
  Home,
  Check,
  Flame,
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { type MarketplaceItem } from './firebase';
import { type SampleNewsItem } from './mockNeighborhoodData';

// ══════════════════════════════════════════════════════════════════
// 1. MUTLULAR LOGO BİLEŞENİ (HABER, ALIM SATIM, HİZMET & PANO MARKALARI)
// ══════════════════════════════════════════════════════════════════
export type MutlularBrandVariant = 'haber' | 'market' | 'services' | 'davet' | 'hizmet' | 'alim_satim';

export function MutlularLogo({
  className = "",
  variant = 'haber'
}: {
  className?: string;
  variant?: MutlularBrandVariant;
}) {
  const isMarket = variant === 'market' || variant === 'alim_satim';
  const isServices = variant === 'services' || variant === 'hizmet';
  const isDavet = variant === 'davet';

  const brandInfo = isMarket
    ? {
        badge: 'ALIM SATIM',
        sub: '2. El • Araç • Emlak & Arsa',
        gradient: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 shadow-emerald-500/25',
        badgeClass: 'bg-emerald-600 text-white'
      }
    : isServices
    ? {
        badge: 'HİZMET',
        sub: 'Mahalle Ustaları & Hizmetler',
        gradient: 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 shadow-blue-500/25',
        badgeClass: 'bg-blue-600 text-white'
      }
    : isDavet
    ? {
        badge: 'PANO',
        sub: 'Duyurular & Davetler',
        gradient: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 shadow-purple-500/25',
        badgeClass: 'bg-purple-600 text-white'
      }
    : {
        badge: 'HABER',
        sub: 'Mehmet Akif Mah. & Çevresi',
        gradient: 'bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 shadow-orange-500/25',
        badgeClass: 'bg-orange-600 text-white'
      };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* 3-Tepeli Geometrik Dağ İkonu (Mutlular Logomark) */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-all ${brandInfo.gradient}`}
      >
        <svg
          className="w-5 h-3.5 stroke-white fill-none stroke-[2.4]"
          viewBox="0 0 44 24"
        >
          <polyline points="2,20 10,8 18,20" />
          <polyline points="12,20 22,2 32,20" />
          <polyline points="26,20 34,9 42,20" />
          <line x1="2" y1="20" x2="42" y2="20" />
        </svg>
      </div>

      <div className="flex flex-col leading-none text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Mutlular
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-black tracking-[0.18em] uppercase font-sans px-1.5 py-0.5 rounded-md transition-colors shadow-2xs ${brandInfo.badgeClass}`}
          >
            {brandInfo.badge}
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 hidden xs:block">
          {brandInfo.sub}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. HEADER
// EN SOLDA: Arama mercek işareti (🔍)
// ORTADA: Mutlular Haber / Mutlular Alım Satım / Mutlular Hizmet
// EN SAĞINDA: Kullanıcı profili
// ══════════════════════════════════════════════════════════════════
export function MutlularHeader({
  activeTab,
  onNavigate,
  onOpenSearch,
  onOpenShare,
  onOpenLiveTv,
  onOpenProfile,
  onOpenMenu,
  user,
  profile,
  searchQuery,
  isAdmin,
  isEditor,
  pendingTipsCount,
  onOpenAdminPanel,
  unreadNotifCount,
  onOpenNotifications
}: {
  activeTab: string;
  onNavigate: (tab: 'home' | 'market' | 'services' | 'davet' | 'profile') => void;
  onOpenSearch: () => void;
  onOpenShare: () => void;
  onOpenLiveTv?: () => void;
  onOpenProfile: () => void;
  onOpenMenu?: () => void;
  user: any;
  profile?: any;
  searchQuery?: string;
  isAdmin?: boolean;
  isEditor?: boolean;
  pendingTipsCount?: number;
  onOpenAdminPanel?: () => void;
  unreadNotifCount?: number;
  onOpenNotifications?: () => void;
}) {
  const isMarket = activeTab === 'market';
  const isServices = activeTab === 'services';
  const isDavet = activeTab === 'davet';
  const brandVariant: MutlularBrandVariant = isMarket ? 'market' : isServices ? 'services' : isDavet ? 'davet' : 'haber';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 h-15 sm:h-16 flex items-center justify-between gap-2 relative">
        
        {/* ── EN SOLDA: ARAMA MERCEK İŞARETİ (& Desktop Menü) ── */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={onOpenSearch}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border shadow-2xs active:scale-95 ${
              searchQuery
                ? 'bg-orange-50 border-orange-300 text-orange-600 ring-2 ring-orange-400/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 hover:text-slate-900'
            }`}
            title="Arama Yap (Haber, Emlak, 2. El, Ustalar, Panolar)"
            aria-label="Arama"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Desktop & Tablet Menü */}
          <nav className="hidden xl:flex items-center gap-1 font-semibold text-xs text-slate-700">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home' || activeTab === 'news'
                  ? 'bg-orange-50 text-orange-600 font-black shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Haber</span>
            </button>

            <button
              onClick={() => onNavigate('market')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-emerald-50 text-emerald-600 font-black shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Alım Satım</span>
            </button>

            <button
              onClick={() => onNavigate('services')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-blue-600 font-black shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Hizmet</span>
            </button>

            <button
              onClick={() => onNavigate('davet')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'davet'
                  ? 'bg-purple-50 text-purple-600 font-black shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Mahalle Panosu</span>
            </button>
          </nav>
        </div>

        {/* ── ORTADA: HER ALANIN KENDİ MARKASI (MUTLULAR HABER / MUTLULAR ALIM SATIM / MUTLULAR HİZMET) ── */}
        <div 
          onClick={() => onNavigate(activeTab as any)}
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer transition-transform active:scale-98"
          title={
            isMarket
              ? 'Mutlular Alım Satım Portalı'
              : isServices
              ? 'Mutlular Hizmet Portalı'
              : isDavet
              ? 'Mutlular Mahalle Panosu'
              : 'Mutlular Haber Portalı'
          }
        >
          <MutlularLogo variant={brandVariant} />
        </div>

        {/* ── SAĞ ALAN: CANLI YAYIN + PAYLAŞ + EN SAĞINDA KULLANICI PROFİLİ ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          {/* Canlı Yayın Düğmesi */}
          {onOpenLiveTv && (
            <button
              onClick={onOpenLiveTv}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-[11px] shadow-sm transition-all cursor-pointer animate-pulse shrink-0"
              title="Mutlular TV Canlı Yayını İzle"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="hidden md:inline">📺 Canlı Yayın</span>
              <span className="md:hidden">Canlı</span>
            </button>
          )}

          {/* ＋ PAYLAŞ / İLAN VER BUTONU (HER ALANA ÖZEL RENK VE İSİM) */}
          <button
            onClick={onOpenShare}
            className={`hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-white font-black text-xs shadow-sm transition-all cursor-pointer active:scale-97 shrink-0 ${
              isMarket
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                : isServices
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                : isDavet
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/25'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/25'
            }`}
            title={
              isMarket
                ? 'Mutlular Alım Satım İlanı Ver'
                : isServices
                ? 'Mutlular Hizmet & Usta Kaydı Bırak'
                : isDavet
                ? 'Mahalle Duyurusu Paylaş'
                : 'Mutlular Haber Bildirimi Yap'
            }
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline">
              {isMarket ? 'İlan Ver' : isServices ? 'Usta Ekle' : isDavet ? 'Duyuru Paylaş' : 'Haber Bildir'}
            </span>
          </button>

          {/* ── BİLDİRİMLER (YENİ TALEP / TEKLİF) ── */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border shadow-2xs active:scale-95 shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
              }`}
              title="Bildirimler"
              aria-label="Bildirimler"
            >
              <Bell className="w-4.5 h-4.5" />
              {(unreadNotifCount || 0) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                  {(unreadNotifCount || 0) > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {/* ── YÖNETİCİ & EDİTÖR MASASI DÜĞMESİ ── */}
          {(isAdmin || isEditor) && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-97 shrink-0 border shadow-2xs ${
                isAdmin
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 ring-2 ring-indigo-500/20'
              }`}
              title={isAdmin ? "👑 Yönetici Paneli (Haber, İhbar & Roller)" : "✍️ Editör Masası (Haber & İhbarlar)"}
            >
              <span className="text-sm">{isAdmin ? '👑' : '✍️'}</span>
              <span className="hidden lg:inline">{isAdmin ? 'Yönetici' : 'Editör'}</span>
              {(pendingTipsCount || 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  {pendingTipsCount}
                </span>
              )}
            </button>
          )}

          {/* ── EN SAĞINDA: KULLANICI PROFİLİ ── */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl transition-all cursor-pointer shrink-0 border shadow-2xs active:scale-95 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
            }`}
            title={user || profile ? (profile?.name || user?.displayName || 'Profilim') : 'Giriş Yap / Kayıt Ol'}
            aria-label="Kullanıcı Profili"
          >
            {profile?.photoURL || user?.photoURL ? (
              <img
                src={profile?.photoURL || user?.photoURL}
                alt="Profil"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="hidden md:inline text-xs font-bold truncate max-w-[85px]">
              {profile?.name || user?.displayName || user?.email ? (profile?.name || user?.displayName || user?.email).split(' ')[0] : 'Giriş Yap'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. HAREKETLİ ANA VİTRİN
// Header'ın hemen altında, her 1 saniyede otomatik yatay kayarak:
// 1. 📰 Haber  →  2. 🏠 Emlak  →  3. 🚗 2. El  →  4. 🔧 Ustalar/Hizmet
// Kullanıcı manuel ← / → ile de değiştirebilir. Kategori etiketi görünür.
// ══════════════════════════════════════════════════════════════════
export interface VitrinItem {
  id: string;
  categoryType: 'haber' | 'emlak' | 'ikinci_el' | 'hizmet';
  categoryLabel: string;
  categoryIcon: string;
  categoryBadgeClass: string;
  title: string;
  subtitle: string;
  actionText: string;
  imageUrl: string;
  meta: string;
  dataRef: any;
}

export function MutlularAutoVitrin({
  items,
  onSelectItem
}: {
  items: VitrinItem[];
  onSelectItem: (item: VitrinItem) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // 1 saniyelik otomatik kaydırma döngüsü (kullanıcı üzerine gelince duraklar)
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 1200); // 1.2 saniye: hem talep edilen 1 saniye hızında hem de okunabilirliği koruyan tatlı ritim

    return () => clearInterval(timer);
  }, [items.length, isPaused]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden bg-slate-950 text-white shadow-md border border-slate-800/80 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current !== null) {
          const diff = e.changedTouches[0].clientX - touchStartX.current;
          if (diff > 40) {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          } else if (diff < -40) {
            setCurrentIndex((prev) => (prev + 1) % items.length);
          }
          touchStartX.current = null;
        }
        setIsPaused(false);
      }}
    >
      {/* Arka Plan Görseli & Gradyan Geçişler */}
      <div className="relative aspect-[16/8] sm:aspect-[21/8] md:aspect-[24/8] min-h-[190px] sm:min-h-[220px] w-full overflow-hidden">
        <img
          key={current.id}
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-102 group-hover:scale-105"
        />

        {/* Çok katmanlı Vignette ve Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />

        {/* Üst Bilgi Satırı: Kategori Etiketi + Canlı Döngü Göstergesi */}
        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm transition-all ${current.categoryBadgeClass}`}
            >
              <span>{current.categoryIcon}</span>
              <span>{current.categoryLabel}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md text-amber-200 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Günün Vitrini</span>
            </span>
          </div>

          {/* 1 Saniyelik İlerleme Çubukları (4 Kategori) */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-orange-500 shadow-sm shadow-orange-500'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Kategori ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* İçerik Başlığı ve Eylem Butonu */}
        <div
          onClick={() => onSelectItem(current)}
          className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 cursor-pointer"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
              <span className="text-orange-400 font-bold">{current.meta}</span>
              <span>•</span>
              <span className="text-slate-400">Mehmet Akif Mah.</span>
            </div>

            <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md group-hover:text-orange-300 transition-colors">
              {current.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 sm:line-clamp-2 font-normal leading-relaxed drop-shadow-sm">
              {current.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(current);
              }}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-orange-500 hover:text-white font-black text-xs sm:text-sm transition-all shadow-md group-hover:scale-102 cursor-pointer"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Manuel Kaydırma Butonları: ← Önceki & → Sonraki */}
        <button
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 border border-white/10"
          title="Önceki İçerik"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 border border-white/10"
          title="Sonraki İçerik"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. HABERLER BÖLÜMÜ
// Başlık: 📰 Son Haberler
// İlk bölüm: Büyük öne çıkan haber kartı (Büyük görsel, kategori, başlık, kısa açıklama, tarih, görüntülenme, Haberi Oku butonu)
// Altında: Diğer haberler grid yapısıyla (createdAt DESC)
// ══════════════════════════════════════════════════════════════════
export function MutlularNewsSection({
  news,
  onOpenNews,
  selectedCategory,
  onSelectCategory,
  isAdmin,
  isEditor,
  pendingTipsCount,
  onOpenAdminPanel
}: {
  news: SampleNewsItem[];
  onOpenNews: (item: SampleNewsItem) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isAdmin?: boolean;
  isEditor?: boolean;
  pendingTipsCount?: number;
  onOpenAdminPanel?: () => void;
}) {
  if (!news || news.length === 0) return null;

  // En güncel haber öne çıkan kart olarak ayrılır
  const featuredNews = news[0];
  const otherNews = news.slice(1);

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'Haber', label: 'Mahalle' },
    { id: 'Duyuru', label: 'Duyurular' },
    { id: 'Çevre & Parklar', label: 'Çevre & Park' },
    { id: 'Muhtarlık & Resmi', label: 'Muhtarlık' },
    { id: 'Esnaf & Çarşı', label: 'Esnaf' }
  ];

  return (
    <section className="space-y-4 pt-1">
      {/* ── YÖNETİCİ & EDİTÖR HABER MASASI KONTROL ÇUBUĞU ── */}
      {(isAdmin || isEditor) && onOpenAdminPanel && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-3.5 sm:p-4 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-xs shrink-0">
              {isAdmin ? '👑' : '✍️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">
                  Mutlular Haber Masası
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {isAdmin ? 'Yönetici' : 'Editör'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {(pendingTipsCount || 0) > 0 
                  ? `${pendingTipsCount} adet vatandaş haber ihbarı inceleme bekliyor.` 
                  : 'Gelen tüm ihbarlar incelendi. Buradan doğrudan resmi haber yayını yapabilirsiniz.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenAdminPanel}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>✍️</span>
              <span>+ Resmi Haber Gir</span>
            </button>
            <button
              onClick={onOpenAdminPanel}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer relative"
            >
              <span>📬</span>
              <span>İhbarları İncele</span>
              {(pendingTipsCount || 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black animate-pulse">
                  {pendingTipsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Bölüm Başlığı & Kategori Filtreleri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center text-lg shadow-2xs">
            📰
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Son Haberler
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Mehmet Akif Mahallesi ve çevresinden en güncel gelişmeler
            </p>
          </div>
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BÜYÜK ÖNE ÇIKAN HABER KARTI ── */}
      {featuredNews && (
        <article
          onClick={() => onOpenNews(featuredNews)}
          className="group relative w-full rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col lg:flex-row"
        >
          {/* Büyük Haber Görseli */}
          <div className="relative lg:w-3/5 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto min-h-[220px] sm:min-h-[280px] overflow-hidden bg-slate-900">
            <img
              src={featuredNews.imageURL || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80'}
              alt={featuredNews.baslik}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ÖNE ÇIKAN
              </span>
              <span className="bg-slate-950/70 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                {featuredNews.kategori || 'Mahalle'}
              </span>
            </div>
          </div>

          {/* Büyük Haber Bilgileri */}
          <div className="lg:w-2/5 p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-red-600">
                  <Flame className="w-3.5 h-3.5" /> Flaş Gelişme
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {featuredNews.tarihStr || 'Yeni'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {featuredNews.okunmaSayisi?.toLocaleString('tr-TR') || '1.200'}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                {featuredNews.baslik}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                {featuredNews.ozet || featuredNews.icerik}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Yazar: {featuredNews.authorName || 'Mutlular Haber'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNews(featuredNews);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>Haberi Oku</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </article>
      )}

      {/* ── DİĞER HABERLER (GRID YAPISI - createdAt DESC) ── */}
      {otherNews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {otherNews.map((item, idx) => (
            <article
              key={item.id ? `news-${item.id}-${idx}` : `news-fallback-${idx}-${item.baslik || 'haber'}`}
              onClick={() => onOpenNews(item)}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Haber Kartı Görseli */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.imageURL || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80'}
                  alt={item.baslik}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {item.kategori || 'Haber'}
                </span>
              </div>

              {/* Haber Başlığı ve Özeti */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.tarihStr || 'Bugün'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.okunmaSayisi?.toLocaleString('tr-TR') || '850'}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-black text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                    {item.baslik}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
                    {item.ozet || item.icerik}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">
                    {item.authorName || 'Mutlular Haber'}
                  </span>
                  <span className="font-black text-red-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Devamı <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// 5. EMLAK BÖLÜMÜ (SATILIK / KİRALIK İLANLAR)
// "Tüm Emlak İlanlarını Gör →" butonu ile
// ══════════════════════════════════════════════════════════════════
export function MutlularEmlakSection({
  items,
  onOpenListing,
  onViewAll
}: {
  items: MarketplaceItem[];
  onOpenListing: (item: MarketplaceItem) => void;
  onViewAll: () => void;
}) {
  const emlakList = items
    .filter((i) => i.ilanTuru === 'emlak' || (i.kategori && i.kategori.toLowerCase().includes('emlak')))
    .slice(0, 3);

  if (emlakList.length === 0) return null;

  return (
    <section className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg shadow-2xs font-black">
            🏠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Emlak
              </h2>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Satılık
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Kiralık
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Mehmet Akif Mahallesi güncel satılık ve kiralık konut, arsa ilanları
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer group"
        >
          <span>Tüm Emlak İlanlarını Gör</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {emlakList.map((item, idx) => (
          <div
            key={item.id ? `emlak-${item.id}-${idx}` : `emlak-fallback-${idx}-${item.baslik || 'ilan'}`}
            onClick={() => onOpenListing(item)}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={item.fotolar?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                alt={item.baslik}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {item.emlakTuru === 'kiralik' ? 'KİRALIK DAİRE' : 'SATILIK KONUT'}
              </span>
              <span className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md text-amber-300 font-black text-sm px-3 py-1 rounded-xl">
                {item.fiyat?.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1">
                  <span>{item.odaSayisi || '3+1'}</span>
                  <span>•</span>
                  <span>{item.metrekare ? `${item.metrekare} m²` : '120 m²'}</span>
                  <span>•</span>
                  <span>{item.kat || '2. Kat'}</span>
                </div>
                <h4 className="font-serif text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                  {item.baslik}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {item.aciklama}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  {item.saticiAdi || 'Mehmet Akif Mah.'}
                </span>
                <span className="font-bold text-amber-700 underline">İlanı İncele</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// 6. 2. EL BÖLÜMÜ (ARAÇ, ELEKTRONİK, EV EŞYASI, DİĞER)
// "Tüm 2. El İlanlarını Gör →" butonu ile
// ══════════════════════════════════════════════════════════════════
export function MutlularIkinciElSection({
  items,
  onOpenListing,
  onViewAll
}: {
  items: MarketplaceItem[];
  onOpenListing: (item: MarketplaceItem) => void;
  onViewAll: () => void;
}) {
  const ikinciElList = items
    .filter((i) => i.ilanTuru === 'ikinci_el' || (i.kategori && !i.kategori.toLowerCase().includes('emlak') && !i.kategori.toLowerCase().includes('tarla')))
    .slice(0, 4);

  if (ikinciElList.length === 0) return null;

  return (
    <section className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-2xs font-black">
            🚗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                2. El Alım-Satım
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                Araç • Elektronik • Ev Eşyası
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Komşular arası güvenilir, aracısız ikinci el alışveriş pazarı
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer group"
        >
          <span>Tüm 2. El İlanlarını Gör</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {ikinciElList.map((item, idx) => (
          <div
            key={item.id ? `ikinci-el-${item.id}-${idx}` : `ikinci-el-fallback-${idx}-${item.baslik || 'urun'}`}
            onClick={() => onOpenListing(item)}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.fotolar?.[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'}
                alt={item.baslik}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                {item.kategori || '2. El'}
              </span>
              <span className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-md text-amber-300 font-black text-xs px-2.5 py-0.5 rounded-lg">
                {item.fiyat?.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.baslik}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {item.aciklama}
                </p>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 truncate max-w-[90px]">
                  {item.saticiAdi || 'Komşumuz'}
                </span>
                <span className="font-bold text-blue-600">İncele →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// 7. MAHALLE USTALARI BÖLÜMÜ
// Mahallede hizmet veren kişiler/işletmeler: Elektrikçi, Tesisatçı, Boyacı, Klima servisi, Tamirci
// Kartlarda: Profil görseli, İsim, Hizmet türü, Mahalle, Puan, Telefon/iletişim
// ══════════════════════════════════════════════════════════════════
export interface NeighborhoodMaster {
  id: string;
  name: string;
  businessName?: string;
  profession: string;
  category: string;
  phone: string;
  rating: number;
  reviewCount: number;
  neighborhood: string;
  avatar: string;
  experience: string;
}

export function MutlularUstalarSection({
  masters,
  onOpenMaster,
  onCall
}: {
  masters: NeighborhoodMaster[];
  onOpenMaster: (m: NeighborhoodMaster) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
}) {
  if (!masters || masters.length === 0) return null;

  return (
    <section className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-2xs font-black">
            🔧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Mahalle Ustaları
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Onaylı Hizmetler
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Elektrik, sıhhi tesisat, boya, klima ve tamirat için mahallemizin güvenilir ustaları
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {masters.map((master, idx) => (
          <div
            key={master.id ? `master-${master.id}-${idx}` : `master-fallback-${idx}-${master.name || 'usta'}`}
            onClick={() => onOpenMaster(master)}
            className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Profil/İşletme Görseli */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-emerald-400 shadow-2xs">
                <img
                  src={master.avatar}
                  alt={master.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Usta Bilgileri */}
              <div className="min-w-0 space-y-0.5">
                <h4 className="font-serif font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {master.name}
                </h4>
                <p className="text-xs font-bold text-emerald-800 truncate">
                  {master.profession}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-0.5 text-amber-500 font-black">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{master.rating}</span>
                  </span>
                  <span>({master.reviewCount} yorum)</span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span>{master.neighborhood}</span>
                </p>
              </div>
            </div>

            {/* Telefonla Ara Butonu */}
            <button
              onClick={(e) => onCall(master.phone, e)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-sm hover:scale-105 shrink-0 cursor-pointer"
              title={`${master.name} ile iletişime geç`}
            >
              <Phone className="w-4 h-4 fill-white" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// 8. MAHALLE PANOSU BÖLÜMÜ
// Duyurular, Kayıp/Bulundu, Vefat duyuruları, Mahalle etkinlikleri, Önemli bilgilendirmeler
// ══════════════════════════════════════════════════════════════════
export function MutlularPanoSection({
  onOpenItem,
  onOpenDeceasedModal,
  onOpenLostFoundModal
}: {
  onOpenItem?: (type: string) => void;
  onOpenDeceasedModal: () => void;
  onOpenLostFoundModal: () => void;
}) {
  return (
    <section className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-2xs font-black">
            📌
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mahalle Panosu
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Duyurular, vefat haberleri, kayıp eşyalar ve mahalle etkinlikleri
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Kutu: Vefat & Taziye İlanları */}
        <div
          onClick={onOpenDeceasedModal}
          className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider">
                <span>🕊️</span> Vefat &amp; Taziye
              </span>
              <span className="text-[10px] text-slate-400">Merkez Camii</span>
            </div>
            <h4 className="font-serif text-base font-black group-hover:text-amber-300 transition-colors">
              Hacı Mehmet Dayı (82)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cenazesi bugün ikindi namazını müteakip Mutlular Merkez Camii'nden kaldırılacaktır.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300 font-bold">
            <span>Tüm Vefat &amp; Taziye İlanları</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Kutu: Kayıp & Buluntu */}
        <div
          onClick={onOpenLostFoundModal}
          className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                <span>🔍</span> Kayıp &amp; Buluntu
              </span>
              <span className="text-[10px] text-amber-800 font-bold">2 İlan</span>
            </div>
            <h4 className="font-serif text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
              Park Civarında Sarı Tasmalı Tekir Kedi
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dün akşam saatlerinde yeni park civarında görüldü. Görenlerin muhtarlığa bildirmesi rica olunur.
            </p>
          </div>
          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800 font-bold">
            <span>Kayıp İlanlarına Göz At</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Kutu: Mahalle Etkinlikleri & Duyurular */}
        <div
          onClick={() => onOpenItem && onOpenItem('davet')}
          className="bg-purple-50/70 border border-purple-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                <span>🎪</span> Etkinlik &amp; Duyuru
              </span>
              <span className="text-[10px] text-purple-700 font-bold">Bu Cumartesi</span>
            </div>
            <h4 className="font-serif text-base font-black text-slate-900 group-hover:text-purple-800 transition-colors">
              Geleneksel Mahalle Kermesi &amp; Çay Bahçesi Buluşması
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kültür merkezi bahçesinde el emeği ürünler ve komşuluk buluşması için davetlisiniz!
            </p>
          </div>
          <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs text-purple-800 font-bold">
            <span>Tüm Etkinlikleri Gör</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// 9. + PAYLAŞ BUTONU MODALI (HER ALAN VE MARKA KENDİNE HAS PAYLAŞIMLAR)
// 1. Mutlular Haber (📰 Haber & Gelişme Bildirimi)
// 2. Mutlular Alım Satım (🛍️ 2. El Eşya, Araç & 🏠 Emlak İlanı)
// 3. Mutlular Hizmet (🔧 Mahalle Ustası & Hizmet Talebi)
// 4. Mutlular Pano (📌 Mahalle Duyurusu, Cemiyet & Davet)
// ══════════════════════════════════════════════════════════════════
export function MutlularShareModal({
  isOpen,
  onClose,
  onSelectAction,
  activeTab = 'home'
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: 'news' | 'emlak' | 'ikinci_el' | 'service' | 'duyuru') => void;
  activeTab?: string;
}) {
  const getInitialBrand = (tab: string) => {
    if (tab === 'market') return 'market';
    if (tab === 'services') return 'services';
    if (tab === 'davet') return 'davet';
    return 'haber';
  };

  const [selectedBrand, setSelectedBrand] = useState<'haber' | 'market' | 'services' | 'davet'>(() => getInitialBrand(activeTab));

  useEffect(() => {
    if (isOpen) {
      setSelectedBrand(getInitialBrand(activeTab));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const brandConfigs = {
    market: {
      name: 'Mutlular Alım Satım',
      badge: 'ALIM SATIM',
      badgeColor: 'bg-emerald-600 text-white',
      headerGrad: 'from-emerald-600 to-teal-600',
      icon: '🛍️',
      subtitle: '2. El eşya, araç, traktör, tarım ve emlak ilanlarınızı bu alanda paylaşın',
      scopeNotice: 'Bu ilan sadece Mutlular Alım Satım pazarında yayınlanır.',
      options: [
        {
          type: 'ikinci_el' as const,
          icon: '🚗',
          title: '2. El Eşya & Araç İlanı Ekle',
          subtitle: 'Otomobil, mobilya, telefon, tarım aletleri ve 2. el eşyalar',
          color: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/90'
        },
        {
          type: 'emlak' as const,
          icon: '🏠',
          title: 'Emlak & Arsa İlanı Bırak',
          subtitle: 'Satılık veya kiralık konut, arsa, tarla ve iş yeri ilanı',
          color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/90'
        }
      ]
    },
    services: {
      name: 'Mutlular Hizmet',
      badge: 'HİZMET',
      badgeColor: 'bg-blue-600 text-white',
      headerGrad: 'from-blue-600 to-indigo-600',
      icon: '🔧',
      subtitle: 'Mahallemizdeki usta ve işletme kayıtları ile hizmet talepleri bu alandadır',
      scopeNotice: 'Bu kayıt Mutlular Hizmet ve Mahalle Ustaları rehberinde listelenir.',
      options: [
        {
          type: 'service' as const,
          icon: '🔧',
          title: 'Usta / İşletme Kaydı Ekle',
          subtitle: 'Tesisat, elektrik, boya, marangoz, nakliyat veya esnaf kaydı',
          color: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100/90'
        },
        {
          type: 'service' as const,
          icon: '🛠️',
          title: 'Usta Çağır / Hizmet Talebi Bırak',
          subtitle: 'Ev veya iş yeri tamirat ve tadilat ihtiyacınız için talep oluşturun',
          color: 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100/90'
        }
      ]
    },
    haber: {
      name: 'Mutlular Haber',
      badge: 'HABER',
      badgeColor: 'bg-orange-600 text-white',
      headerGrad: 'from-orange-600 to-amber-600',
      icon: '📰',
      subtitle: 'Mehmet Akif Mahallesi ve çevresindeki sıcak gelişmeler, muhtarlık duyuruları ve bülten',
      scopeNotice: 'Bu haberler teyit edilerek doğrudan Mutlular Haber bülteninde yayınlanır.',
      options: [
        {
          type: 'news' as const,
          icon: '📰',
          title: 'Mahalle Haberi Bildir',
          subtitle: 'Mahalle bülteni için güncel haber, duyuru ve gelişme iletin',
          color: 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100/90'
        },
        {
          type: 'news' as const,
          icon: '📸',
          title: 'Sıcak Olay & Fotoğraflı İhbar',
          subtitle: 'Sokak çalışması, arıza, altyapı veya flaş fotoğraflı ihbar gönderin',
          color: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100/90'
        }
      ]
    },
    davet: {
      name: 'Mutlular Pano',
      badge: 'PANO',
      badgeColor: 'bg-purple-600 text-white',
      headerGrad: 'from-purple-600 to-pink-600',
      icon: '📌',
      subtitle: 'Mahalle cemiyetleri, düğün davetleri, kayıp ilanları ve taziye duyuruları',
      scopeNotice: 'Bu paylaşımlar Mutlular Mahalle Panosu ve Davetler alanında görünür.',
      options: [
        {
          type: 'duyuru' as const,
          icon: '📌',
          title: 'Mahalle Duyurusu Paylaş',
          subtitle: 'Kayıp eşya / evcil hayvan, etkinlik ve genel mahalle duyurusu',
          color: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100/90'
        },
        {
          type: 'duyuru' as const,
          icon: '💍',
          title: 'Düğün & Cemiyet Daveti Bırak',
          subtitle: 'Düğün, kına, sünnet veya taziye merasim bilgilerinizi komşularla paylaşın',
          color: 'bg-pink-50 text-pink-900 border-pink-200 hover:bg-pink-100/90'
        }
      ]
    }
  };

  const currentBrand = brandConfigs[selectedBrand];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Modal Üst Başlık Çubuğu */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${currentBrand.headerGrad} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
              {currentBrand.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-black text-slate-900 leading-tight">
                  {currentBrand.name} Paylaşımı
                </h3>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${currentBrand.badgeColor}`}>
                  {currentBrand.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Her alan ve marka kendine has paylaşımlara sahiptir
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── ALAN / MARKA SEÇİM SEKMELERİ ── */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200/80">
          <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-black">
            <button
              onClick={() => setSelectedBrand('haber')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedBrand === 'haber'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm">📰</span>
              <span className="text-[10px] sm:text-[11px] truncate">Haber</span>
            </button>

            <button
              onClick={() => setSelectedBrand('market')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedBrand === 'market'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm">🛍️</span>
              <span className="text-[10px] sm:text-[11px] truncate">Alım Satım</span>
            </button>

            <button
              onClick={() => setSelectedBrand('services')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedBrand === 'services'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm">🔧</span>
              <span className="text-[10px] sm:text-[11px] truncate">Hizmet</span>
            </button>

            <button
              onClick={() => setSelectedBrand('davet')}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                selectedBrand === 'davet'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm">📌</span>
              <span className="text-[10px] sm:text-[11px] truncate">Pano</span>
            </button>
          </div>
        </div>

        {/* Seçilen Markaya Özel Seçenekler Listesi */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          <p className="text-xs text-slate-600 font-medium">
            {currentBrand.subtitle}
          </p>

          <div className="space-y-2.5">
            {currentBrand.options.map((opt, idx) => (
              <button
                key={`${opt.type}-${idx}`}
                onClick={() => onSelectAction(opt.type)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer group shadow-2xs ${opt.color}`}
              >
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {opt.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-serif font-black text-sm sm:text-base block text-slate-900 group-hover:text-slate-950 transition-colors">
                    {opt.title}
                  </span>
                  <span className="text-xs text-slate-600 block line-clamp-1">
                    {opt.subtitle}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all shrink-0" />
              </button>
            ))}
          </div>

          {/* Kapsam Bildirimi */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{currentBrand.scopeNotice}</span>
          </div>

          {/* Onay Kuyruğu / Güvenlik Bilgilendirmesi */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-black">Güvenli Mahalle Politikası:</strong> Paylaşılan tüm haber ve ilanlar, mahalle güvenliği için <strong>yönetici onayından</strong> geçtikten sonra ilgili alanda yayına alınır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 10. MOBİL ALT SABİT NAVİGASYON (STANDART BAR)
// 📰 Haber | 🛍️ Alım Satım | ＋ Paylaş | 🔧 Hizmet | 📌 Pano
// Ortadaki + butonu daha büyük ve dikkat çekici
// ══════════════════════════════════════════════════════════════════
export function MutlularMobileNav({
  activeTab,
  onNavigate,
  onOpenShare
}: {
  activeTab: string;
  onNavigate: (tab: 'home' | 'market' | 'services' | 'davet' | 'profile') => void;
  onOpenShare: () => void;
}) {
  const isMarket = activeTab === 'market';
  const isServices = activeTab === 'services';
  const isDavet = activeTab === 'davet';
  const isHome = activeTab === 'home' || activeTab === 'news';

  const centerButtonGrad = isMarket
    ? 'from-emerald-600 via-teal-500 to-emerald-500 shadow-emerald-500/35'
    : isServices
    ? 'from-blue-600 via-sky-500 to-indigo-600 shadow-blue-500/35'
    : isDavet
    ? 'from-purple-600 via-pink-500 to-rose-500 shadow-purple-500/35'
    : 'from-orange-600 via-amber-500 to-orange-500 shadow-orange-500/35';

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5 flex items-center justify-around">
      {/* 1: Haber */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isHome
            ? 'text-orange-600 font-black'
            : 'text-slate-500 hover:text-slate-900 font-bold'
        }`}
      >
        <Newspaper className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px]">Haber</span>
      </button>

      {/* 2: Alım Satım */}
      <button
        onClick={() => onNavigate('market')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isMarket
            ? 'text-emerald-600 font-black'
            : 'text-slate-500 hover:text-slate-900 font-bold'
        }`}
      >
        <Building2 className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px]">Alım Satım</span>
      </button>

      {/* 3: ＋ PAYLAŞ (Öne çıkan büyük yuvarlak buton) */}
      <button
        onClick={onOpenShare}
        className={`-mt-5 w-13 h-13 rounded-full bg-gradient-to-tr ${centerButtonGrad} text-white flex items-center justify-center shadow-lg border-3 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer`}
        title="Paylaşım Yap"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* 4: Hizmet */}
      <button
        onClick={() => onNavigate('services')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isServices
            ? 'text-blue-600 font-black'
            : 'text-slate-500 hover:text-slate-900 font-bold'
        }`}
      >
        <Wrench className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px]">Hizmet</span>
      </button>

      {/* 5: Mahalle Panosu / Daha */}
      <button
        onClick={() => onNavigate('davet')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isDavet
            ? 'text-purple-600 font-black'
            : 'text-slate-500 hover:text-slate-900 font-bold'
        }`}
      >
        <Megaphone className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px]">Pano</span>
      </button>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════
// 11. FOOTER (MODERN MAHALLE BÜLTENİ BİTİŞ ALANI)
// ══════════════════════════════════════════════════════════════════
export function MutlularFooter({
  onNavigate
}: {
  onNavigate: (tab: 'home' | 'market' | 'services' | 'davet' | 'profile') => void;
}) {
  return (
    <footer className="mt-12 bg-slate-950 text-slate-300 border-t border-slate-800 text-xs py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-serif text-xl font-black text-white">
                Mutlular Haber
              </span>
              <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                Dijital Mahalle
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md">
              Mehmet Akif Mahallesi'nin sesi, esnafın ve komşuların güvenilir dijital buluşma noktası.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
            >
              Haber
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigate('market')}
              className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
            >
              Alım Satım
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
            >
              Hizmet &amp; Ustalar
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigate('davet')}
              className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
            >
              Mahalle Panosu
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Mutlular Haber. Tüm hakları saklıdır. Mehmet Akif Mah. / Osmangazi - Bursa</p>
          <p className="flex items-center gap-3">
            <span>Muhtarlık İletişim: 0224 246 00 00</span>
            <span>•</span>
            <span className="text-red-400 font-bold">Acil Çağrı: 112</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════
// 12. ARAMA MODALI (MERCEK İŞARETİNE TIKLANDIĞINDA AÇILIR)
// ══════════════════════════════════════════════════════════════════
export function MutlularSearchModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  newsItems = [],
  marketplaceItems = [],
  masters = [],
  onSelectNews,
  onSelectMarketplace,
  onSelectMaster,
  onNavigateTab
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  newsItems?: SampleNewsItem[];
  marketplaceItems?: MarketplaceItem[];
  masters?: NeighborhoodMaster[];
  onSelectNews: (item: SampleNewsItem) => void;
  onSelectMarketplace: (item: MarketplaceItem) => void;
  onSelectMaster: (master: NeighborhoodMaster) => void;
  onNavigateTab: (tab: 'home' | 'market' | 'services' | 'davet') => void;
}) {
  const [activeSearchFilter, setActiveSearchFilter] = useState<'all' | 'haber' | 'emlak' | 'ikinci_el' | 'usta'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = searchQuery.trim().toLowerCase();

  // Filtrelenmiş Haberler
  const filteredNews = q
    ? newsItems.filter(n => (n.baslik + (n.ozet || '') + (n.kategori || '')).toLowerCase().includes(q))
    : newsItems.slice(0, 3);

  // Filtrelenmiş Emlak İlanları
  const filteredEmlak = q
    ? marketplaceItems.filter(m => {
        const isEmlak = (m.kategori || '').toLowerCase().includes('emlak') || (m.baslik || '').toLowerCase().includes('satılık') || (m.baslik || '').toLowerCase().includes('kiralık');
        return isEmlak && (m.baslik + (m.aciklama || '')).toLowerCase().includes(q);
      })
    : marketplaceItems.filter(m => (m.kategori || '').toLowerCase().includes('emlak')).slice(0, 3);

  // Filtrelenmiş 2. El İlanları
  const filteredIkinciEl = q
    ? marketplaceItems.filter(m => {
        const isEmlak = (m.kategori || '').toLowerCase().includes('emlak');
        return !isEmlak && (m.baslik + (m.aciklama || '') + (m.kategori || '')).toLowerCase().includes(q);
      })
    : marketplaceItems.filter(m => !(m.kategori || '').toLowerCase().includes('emlak')).slice(0, 3);

  // Filtrelenmiş Ustalar
  const filteredMasters = q
    ? masters.filter(m => (m.name + m.profession + m.neighborhood).toLowerCase().includes(q))
    : masters.slice(0, 3);

  const totalResults = (activeSearchFilter === 'all' || activeSearchFilter === 'haber' ? filteredNews.length : 0) +
    (activeSearchFilter === 'all' || activeSearchFilter === 'emlak' ? filteredEmlak.length : 0) +
    (activeSearchFilter === 'all' || activeSearchFilter === 'ikinci_el' ? filteredIkinciEl.length : 0) +
    (activeSearchFilter === 'all' || activeSearchFilter === 'usta' ? filteredMasters.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arama Başlığı ve Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-black text-slate-900">
                Mutlular Arama
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Haber, satılık ev, 2. el eşya veya usta ara..."
              className="w-full bg-white text-slate-900 text-sm rounded-2xl pl-11 pr-10 py-3 border border-slate-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-lg"
              >
                Temizle
              </button>
            )}
          </div>

          {/* Filtre Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'haber', label: '📰 Haberler' },
              { id: 'emlak', label: '🏠 Emlak' },
              { id: 'ikinci_el', label: '🚗 2. El' },
              { id: 'usta', label: '🔧 Ustalar' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveSearchFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  activeSearchFilter === f.id
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sonuçlar Listesi */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="font-bold text-sm text-slate-600">
                "{searchQuery}" için sonuç bulunamadı
              </p>
              <p className="text-xs">
                Farklı bir arama terimi deneyebilir veya kategorilere göz atabilirsiniz.
              </p>
            </div>
          ) : (
            <>
              {/* Haberler */}
              {(activeSearchFilter === 'all' || activeSearchFilter === 'haber') && filteredNews.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span>📰 Haberler ({filteredNews.length})</span>
                    <button
                      onClick={() => onNavigateTab('home')}
                      className="text-orange-600 hover:underline normal-case font-bold"
                    >
                      Tüm Haberler →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {filteredNews.map((item, idx) => (
                      <div
                        key={item.id ? `search-news-${item.id}-${idx}` : `search-news-fallback-${idx}`}
                        onClick={() => onSelectNews(item)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={item.imageURL || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80'}
                          alt={item.baslik}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black text-orange-600 uppercase">
                            {item.kategori || 'Haber'}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-700">
                            {item.baslik}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {item.ozet || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emlak İlanları */}
              {(activeSearchFilter === 'all' || activeSearchFilter === 'emlak') && filteredEmlak.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span>🏠 Emlak İlanları ({filteredEmlak.length})</span>
                    <button
                      onClick={() => onNavigateTab('market')}
                      className="text-blue-600 hover:underline normal-case font-bold"
                    >
                      Tüm Emlak →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {filteredEmlak.map((item, idx) => (
                      <div
                        key={item.id ? `search-emlak-${item.id}-${idx}` : `search-emlak-fallback-${idx}`}
                        onClick={() => onSelectMarketplace(item)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={item.fotolar?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'}
                          alt={item.baslik}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase">
                            {item.fiyat?.toLocaleString('tr-TR')} ₺
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-700">
                            {item.baslik}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.emlakTuru || item.odaSayisi || 'Satılık / Kiralık'} • {item.kategori || 'Emlak'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. El İlanları */}
              {(activeSearchFilter === 'all' || activeSearchFilter === 'ikinci_el') && filteredIkinciEl.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span>🚗 2. El İlanları ({filteredIkinciEl.length})</span>
                    <button
                      onClick={() => onNavigateTab('market')}
                      className="text-amber-600 hover:underline normal-case font-bold"
                    >
                      Tüm 2. El →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {filteredIkinciEl.map((item, idx) => (
                      <div
                        key={item.id ? `search-ikinci-${item.id}-${idx}` : `search-ikinci-fallback-${idx}`}
                        onClick={() => onSelectMarketplace(item)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={item.fotolar?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80'}
                          alt={item.baslik}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black text-amber-600 uppercase">
                            {item.fiyat ? `${item.fiyat.toLocaleString('tr-TR')} ₺` : 'Fiyat Belirtilmemiş'}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-amber-700">
                            {item.baslik}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.kategori || '2. El'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mahalle Ustaları */}
              {(activeSearchFilter === 'all' || activeSearchFilter === 'usta') && filteredMasters.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span>🔧 Mahalle Ustaları ({filteredMasters.length})</span>
                    <button
                      onClick={() => onNavigateTab('services')}
                      className="text-emerald-600 hover:underline normal-case font-bold"
                    >
                      Tüm Ustalar →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {filteredMasters.map((master, idx) => (
                      <div
                        key={master.id ? `search-master-${master.id}-${idx}` : `search-master-fallback-${idx}`}
                        onClick={() => onSelectMaster(master)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={master.avatar}
                          alt={master.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-emerald-300"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-700">
                            {master.name}
                          </h4>
                          <p className="text-[11px] font-bold text-emerald-800">
                            {master.profession}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {master.neighborhood} • ⭐ {master.rating} ({master.reviewCount})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alt Çubuk */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {searchQuery ? `"${searchQuery}" aranıyor` : 'Aramak için kelime yazın'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
