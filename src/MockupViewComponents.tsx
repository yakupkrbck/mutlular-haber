import React, { useState } from 'react';
import {
  Search,
  Bell,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
  ShoppingBag,
  Plus,
  Wrench,
  User as UserIcon,
  Star,
  Phone,
  MapPin,
  Clock,
  Eye,
  Car,
  Smartphone,
  Tv,
  Check,
  X,
  Building2,
  Calendar,
  Megaphone,
  HelpCircle,
  LogOut,
  LogIn,
  MessageSquare,
  ShieldCheck,
  Tag,
  Zap,
  Sparkles,
  Settings,
  Newspaper,
  Compass
} from 'lucide-react';
import { type MarketplaceItem } from './firebase';
import { type SampleNewsItem } from './mockNeighborhoodData';

// ── 1. SCREEN 1: MUTLULAR HABER HEADER (SCENIC MOUNTAIN & LOGO) ──
export function MockupNewsHeader({
  onSearchClick,
  onNotificationClick,
  onLiveTvClick,
  activeCategory,
  onSelectCategory
}: {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onLiveTvClick?: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}) {
  return (
    <div className="relative w-full">
      {/* Scenic Hero Panoramic Banner */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1400&q=80"
          alt="Mutlular Mahallesi Panoramik"
          className="w-full h-full object-cover object-center opacity-70 scale-105"
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />

        {/* Top Status & Action Bar (Search & Notification & Canlı Yayın) */}
        <div className="absolute top-2.5 left-4 right-4 flex items-center justify-between z-10">
          <div className="text-[11px] font-bold text-slate-300">
            9:41
          </div>
          <div className="flex items-center gap-2">
            {onLiveTvClick && (
              <button
                onClick={onLiveTvClick}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white font-black text-[11px] shadow-lg shadow-red-600/40 backdrop-blur-md transition-all border border-red-400/40 cursor-pointer animate-pulse"
                title="Mutlular TV Canlı Yayını İzle"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Canlı Yayın</span>
              </button>
            )}
            <button
              onClick={onSearchClick}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
              title="Ara"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onNotificationClick}
              className="relative w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
              title="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-600 rounded-full border border-slate-900" />
            </button>
          </div>
        </div>

        {/* Center Brand Identity (Logo & Title) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-3 select-none pointer-events-none">
          {/* Orange 3-Peak Geometric Mountain Silhouette Icon */}
          <div className="mb-1 text-orange-500 flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)]">
            <svg
              className="w-11 h-7 stroke-current fill-none stroke-[2.2]"
              viewBox="0 0 44 24"
            >
              {/* Left small peak */}
              <polyline points="2,20 10,8 18,20" />
              {/* Main high peak */}
              <polyline points="12,20 22,2 32,20" />
              {/* Right peak */}
              <polyline points="26,20 34,9 42,20" />
              {/* Base line */}
              <line x1="2" y1="20" x2="42" y2="20" />
            </svg>
          </div>

          {/* Mutlular - Elegant Serif */}
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md leading-none">
            Mutlular
          </h1>

          {/* H A B E R - Spaced Bold Sans */}
          <div className="text-[13px] sm:text-sm font-black tracking-[0.35em] text-white/95 uppercase drop-shadow-sm mt-0.5">
            H A B E R
          </div>

          {/* Slogan - Italic Script Style */}
          <p className="font-serif italic text-xs sm:text-[13px] text-amber-200/90 font-medium drop-shadow-sm mt-1">
            Mahallemizin Sesi, Hepimizin Haberi
          </p>
        </div>
      </div>

      {/* Floating Location Pill (Centered, overlapping the bottom of the hero banner) */}
      <div className="relative -mt-3.5 flex justify-center z-20 px-4">
        <div className="bg-white rounded-full px-4 py-1.5 shadow-md border border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <MapPin className="w-3.5 h-3.5 text-orange-600 fill-orange-100 shrink-0" />
          <span className="truncate">Mehmet Akif Mahallesi / Osmangazi - Bursa</span>
        </div>
      </div>

      {/* Categories Row (Horizontal Pills with Icons & Orange Selected State) */}
      <div className="px-3 pt-3 pb-2 overflow-x-auto scrollbar-none flex items-center justify-between sm:justify-center gap-2">
        {[
          { id: 'tumu', label: 'Tümü', icon: Home },
          { id: 'pano', label: 'Mahalle Panosu', icon: Compass },
          { id: 'haber', label: 'Haber', icon: Newspaper },
          { id: 'kampanya', label: 'Kampanya', icon: Tag },
          { id: 'duyuru', label: 'Duyuru', icon: Megaphone }
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center gap-1 min-w-[62px] sm:min-w-[72px] cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-5 h-5 stroke-[2]" />
              </div>
              <span
                className={`text-[11px] font-bold text-center leading-tight transition-colors ${
                  isSelected ? 'text-orange-600' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {cat.label}
              </span>
              {isSelected && (
                <span className="w-4 h-0.5 bg-orange-500 rounded-full -mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. SCREEN 2: MUTLULAR ALIM SATIM HEADER ──
export function MockupMarketHeader({
  searchTerm,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  onOpenFilter
}: {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenFilter?: () => void;
}) {
  return (
    <div className="w-full bg-[#0F172A] text-white pt-3 pb-3 px-4 shadow-md space-y-3">
      {/* Top Header: Shopping Bag Icon + Mutlular Alım Satım */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
          <ShoppingBag className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black tracking-tight leading-tight text-white">
            Mutlular Alım Satım
          </h2>
          <div className="text-[11px] font-black tracking-[0.25em] text-emerald-300 uppercase">
            2. EL &amp; EMLAK ALIM SATIM
          </div>
        </div>
      </div>

      {/* Search Input Bar with Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ne aramıştınız?"
            className="w-full bg-white text-slate-900 text-xs rounded-2xl pl-9 pr-3 py-2.5 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={onOpenFilter}
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
          title="Filtrele"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Subcategory Chips Row */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-4 overflow-x-auto pb-1 scrollbar-none pt-1">
        {[
          { id: 'all', label: 'Tümü', icon: ShoppingBag },
          { id: 'emlak', label: 'Emlak', icon: Building2 },
          { id: 'otomotiv', label: 'Otomotiv', icon: Car },
          { id: 'elektronik', label: 'Elektronik', icon: Smartphone },
          { id: 'ev_yasam', label: 'Ev & Yaşam', icon: Home }
        ].map((c) => {
          const isSelected = activeCategory === c.id;
          const IconComp = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className="flex flex-col items-center gap-1 min-w-[58px] cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isSelected ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {c.label}
              </span>
              {isSelected && (
                <span className="w-4 h-0.5 bg-orange-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 3. SCREEN 3: MUTLULAR HİZMET HEADER ──
export function MockupServicesHeader({
  searchTerm,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  onOpenFilter
}: {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenFilter?: () => void;
}) {
  return (
    <div className="w-full bg-[#0F172A] text-white pt-3 pb-3 px-4 shadow-md space-y-3">
      {/* Top Header: Wrench Icon + Mutlular Hizmet */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black tracking-tight leading-tight text-white">
            Mutlular Hizmet
          </h2>
          <div className="text-[11px] font-black tracking-[0.25em] text-slate-300 uppercase">
            MAHALLE USTALARI &amp; HİZMETLER
          </div>
        </div>
      </div>

      {/* Search Input Bar with Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Hangi hizmeti arıyorsunuz?"
            className="w-full bg-white text-slate-900 text-xs rounded-2xl pl-9 pr-3 py-2.5 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={onOpenFilter}
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
          title="Filtrele"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Service Categories Row */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-4 overflow-x-auto pb-1 scrollbar-none pt-1">
        {[
          { id: 'all', label: 'Tümü', icon: Wrench },
          { id: 'elektrik', label: 'Elektrikçi', icon: Zap },
          { id: 'tesisat', label: 'Su Tesisatçısı', icon: Wrench },
          { id: 'boya', label: 'Boya Badana', icon: Tag },
          { id: 'temizlik', label: 'Temizlik', icon: Sparkles }
        ].map((c) => {
          const isSelected = activeCategory === c.id;
          const IconComp = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className="flex flex-col items-center gap-1 min-w-[58px] cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isSelected ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {c.label}
              </span>
              {isSelected && (
                <span className="w-4 h-0.5 bg-orange-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 4. SCREEN 2: MARKETPLACE LISTING CARD (HORIZONTAL CLEAN CARD) ──
export function MockupMarketCard({
  item,
  isFavorite,
  onToggleFavorite,
  onClick
}: {
  item: MarketplaceItem;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const photo =
    item.fotolar && item.fotolar[0]
      ? item.fotolar[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 group relative"
    >
      {/* Thumbnail Left */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
        <img
          src={photo}
          alt={item.baslik}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Satılık / Kiralık Badge */}
        <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
          {item.emlakTuru === 'kiralik' ? 'Kiralık' : 'Satılık'}
        </span>
      </div>

      {/* Content Right */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
        <div className="space-y-0.5">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.baslik}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            {item.saticiAdi || 'Mehmet Akif Mah. / Osmangazi'}
          </p>
        </div>

        {/* Price & Meta */}
        <div className="space-y-1 pt-1">
          <div className="font-black text-sm sm:text-base text-slate-950">
            {item.fiyat.toLocaleString('tr-TR')} TL
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> 1.2K
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> 3 saat önce
            </span>
          </div>
        </div>
      </div>

      {/* Favorite Heart Button (Top Right) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.(e);
        }}
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
        title="Favorilere Ekle"
      >
        <Heart
          className={`w-4 h-4 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
          }`}
        />
      </button>
    </div>
  );
}

// ── 5. SCREEN 3: CRAFTSMAN SERVICE CARD (WITH GREEN CALL BUTTON) ──
export function MockupMasterCard({
  master,
  onClick,
  onCall
}: {
  master: {
    id: string;
    name: string;
    businessName?: string;
    mainCategoryName?: string;
    phone: string;
    rating: number;
    reviewCount: number;
    address: string;
    avatar: string;
    subCategories?: string[];
  };
  onClick: () => void;
  onCall: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Master Avatar / Photo */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          <img
            src={master.avatar}
            alt={master.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Master Details */}
        <div className="min-w-0 space-y-0.5">
          <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
            {master.name}
          </h4>
          <p className="text-[11px] text-slate-500 truncate">
            {master.subCategories?.[0] || master.mainCategoryName || 'Elektrik Tesisatı'}
          </p>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="flex items-center gap-0.5 text-amber-500 font-black">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{master.rating || 4.9}</span>
            </span>
            <span className="text-slate-400">({master.reviewCount || 128} yorum)</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span className="truncate">{master.address || 'Mehmet Akif Mah.'}</span>
          </p>
        </div>
      </div>

      {/* Green Quick Call Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCall(e);
        }}
        className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 cursor-pointer"
        title={`${master.name} Ustayla Hemen Görüş`}
      >
        <Phone className="w-4 h-4 fill-white" />
      </button>
    </div>
  );
}

// ── 6. SCREEN 4: POST BOTTOM SHEET ("Ne paylaşmak istersiniz?") ──
export function MockupPostBottomSheet({
  isOpen,
  onClose,
  onSelectAction
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'market' | 'service' | 'news' | 'event') => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100 z-10 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">
              Ne paylaşmak istersiniz?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              İlanınızı, haberinizi veya hizmet talebinizi kolayca paylaşın.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Large Rounded Action Options Matching Mockup */}
        <div className="space-y-2.5 pt-2">
          {/* 1. Alışveriş / Satılık / Kiralık İlanı (Orange Pill) */}
          <button
            onClick={() => onSelectAction('market')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1">Alışveriş / Satılık / Kiralık İlanı</span>
          </button>

          {/* 2. Hizmet Talebi (Blue Pill) */}
          <button
            onClick={() => onSelectAction('service')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1">Hizmet Talebi</span>
          </button>

          {/* 3. Haber Paylaş (Green Pill) */}
          <button
            onClick={() => onSelectAction('news')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1">Haber Paylaş</span>
          </button>

          {/* 4. Duyuru / Etkinlik (Purple Pill) */}
          <button
            onClick={() => onSelectAction('event')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1">Duyuru / Etkinlik</span>
          </button>
        </div>

        {/* Bottom Tip Notice */}
        <div className="pt-2 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>💡</span>
          <span>Paylaşımınız, kısa sürede mahalle sakinlerine ulaşır.</span>
        </div>
      </div>
    </div>
  );
}

// ── 7. SCREEN 5: LISTING DETAIL MODAL ("Satılık Daire") ──
export function MockupListingDetailModal({
  item,
  onClose,
  onCall
}: {
  item: MarketplaceItem | null;
  onClose: () => void;
  onCall: (phone: string) => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!item) return null;

  const photos =
    item.fotolar && item.fotolar.length > 0
      ? item.fotolar
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-white sm:rounded-3xl overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Top Image Carousel with Action Controls */}
          <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden">
            <img
              src={photos[photoIdx] || photos[0]}
              alt={item.baslik}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar (Back, Share, Heart) */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white z-10">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: item.baslik, url: window.location.href });
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Photo Index Indicator (Bottom Right) */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {photoIdx + 1}/{photos.length}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Green Badge: Satılık */}
            <div>
              <span className="inline-block bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {item.emlakTuru === 'kiralik' ? 'Kiralık' : 'Satılık'}
              </span>
            </div>

            {/* Title & Price */}
            <div className="space-y-1">
              <h2 className="font-black text-xl text-slate-900 leading-tight">
                {item.baslik}
              </h2>
              <div className="font-black text-2xl text-orange-600">
                {item.fiyat.toLocaleString('tr-TR')} TL
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 pt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{item.saticiAdi || 'Mehmet Akif Mah. / Osmangazi - Bursa'}</span>
              </p>
            </div>

            {/* Spec Cards Grid (3+1 Oda, 120 m² Brüt Alan, 5. Kat, 2 Banyo) */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Car className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-xs text-slate-900">{item.odaSayisi || '3+1'}</span>
                <span className="text-[10px] text-slate-400">Oda</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-xs text-slate-900">{item.metrekare ? `${item.metrekare} m²` : '120 m²'}</span>
                <span className="text-[10px] text-slate-400">Brüt Alan</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-xs text-slate-900">{item.kat || '5. Kat'}</span>
                <span className="text-[10px] text-slate-400">Kat</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Home className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-xs text-slate-900">2</span>
                <span className="text-[10px] text-slate-400">Banyo</span>
              </div>
            </div>

            {/* Section: Açıklama */}
            <div className="space-y-1.5 pt-2">
              <h4 className="font-black text-sm text-slate-900">Açıklama</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.aciklama ||
                  'Mahallemizin nezih ve merkezi konumunda, ısıtma sistemi kombili, geniş ve ferah bir daire. Detaylı bilgi için iletişime geçebilirsiniz.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section: İletişim & Big Orange Action Button */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2 sticky bottom-0">
          <span className="text-xs font-bold text-slate-400">İletişim</span>
          <button
            disabled={!item.saticiTelefon}
            onClick={() => item.saticiTelefon && onCall(item.saticiTelefon)}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>{item.saticiTelefon ? 'Telefon ile Ara' : 'Telefon bilgisi yok'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 8. SCREEN 6: CRAFTSMAN DETAIL MODAL ("Mehmet Usta") ──
export function MockupMasterDetailModal({
  master,
  onClose,
  onCall
}: {
  master: {
    id: string;
    name: string;
    businessName?: string;
    mainCategoryName?: string;
    phone: string;
    rating: number;
    reviewCount: number;
    address: string;
    avatar: string;
    servicesHighlight?: string[];
  } | null;
  onClose: () => void;
  onCall: (phone: string) => void;
}) {
  const [isFavorited, setIsFavorited] = useState(false);

  if (!master) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-white sm:rounded-3xl overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Top Hero Photo */}
          <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden">
            <img
              src={master.avatar}
              alt={master.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white z-10">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: master.name, url: window.location.href });
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Master Info */}
          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="font-black text-xl text-slate-900 leading-tight">
                {master.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {master.mainCategoryName || 'Elektrik Tesisatı'}
              </p>
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="flex items-center gap-1 text-amber-500 font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{master.rating || 4.9}</span>
                </span>
                <span className="text-slate-400">({master.reviewCount || 128} yorum)</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 pt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{master.address || 'Mehmet Akif Mah. / Osmangazi'}</span>
              </p>
            </div>

            {/* 3 Highlight Cards Matching Mockup */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Clock className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-[11px] text-slate-900">7/24</span>
                <span className="text-[9px] text-slate-400">Ulaşılabilir</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <Tag className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-[11px] text-slate-900">Uygun</span>
                <span className="text-[9px] text-slate-400">Fiyat</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-slate-600 mb-1" />
                <span className="font-black text-[11px] text-slate-900">Güvenilir</span>
                <span className="text-[9px] text-slate-400">Hizmet</span>
              </div>
            </div>

            {/* Section: Hizmetler (Checklisted) */}
            <div className="space-y-2 pt-1">
              <h4 className="font-black text-sm text-slate-900">Hizmetler</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {(
                  master.servicesHighlight || [
                    'Elektrik Tesisatı',
                    'Arıza Tespiti ve Onarım',
                    'Kombi Elektrik Bağlantısı',
                    'Aydınlatma Sistemleri',
                    'Tadilat ve Montaj'
                  ]
                ).map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Green Call Button */}
        <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
          <button
            disabled={!master.phone}
            onClick={() => master.phone && onCall(master.phone)}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>{master.phone ? 'Hemen Ara' : 'Telefon bilgisi yok'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 9. SCREEN 7: PROFILE SCREEN ──
export function MockupProfileScreen({
  user,
  profile,
  onOpenEdit,
  onNavigateTab,
  onLogout,
  onOpenAuth
}: {
  user: any;
  profile: any;
  onOpenEdit: () => void;
  onNavigateTab: (tab: any) => void;
  onLogout: () => void;
  onOpenAuth?: () => void;
}) {
  const isLoggedIn = Boolean(user || profile);
  const displayName = profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Misafir Sakin');
  const userHandle = isLoggedIn
    ? `@${(profile?.email || user?.email || displayName).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : '@misafir';

  return (
    <div className="space-y-4 pb-4">
      {/* Starry Dark Sky Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0F172A] to-[#1E293B] p-6 text-white shadow-md text-center space-y-3">
        {/* Settings Icon Top Right */}
        {isLoggedIn && (
          <button
            onClick={onOpenEdit}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Ayarlar"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* User Avatar (Circle with Outline) */}
        <div className="flex justify-center pt-2">
          <div className="w-20 h-20 rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-lg">
            {profile?.photoURL || user?.photoURL ? (
              <img
                src={profile?.photoURL || user?.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-white stroke-[1.5]" />
            )}
          </div>
        </div>

        {/* Name & Handle */}
        <div className="space-y-0.5">
          <h3 className="font-black text-lg text-white">
            {displayName}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {isLoggedIn ? userHandle : 'Giriş yapılmadı (Misafir Oturumu)'}
          </p>
        </div>

        {/* Aksiyon Butonu */}
        <div>
          {isLoggedIn ? (
            <button
              onClick={onOpenEdit}
              className="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Profili Düzenle</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap / Kayıt Ol</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Stats Card Matching Mockup (12 İlanım, 8 Hizmet Talebim, 45 Takipçi) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs grid grid-cols-3 divide-x divide-slate-100 text-center">
        <div className="px-2">
          <div className="font-black text-base text-slate-900">12</div>
          <div className="text-[11px] text-slate-400 font-medium">İlanım</div>
        </div>
        <div className="px-2">
          <div className="font-black text-base text-slate-900">8</div>
          <div className="text-[11px] text-slate-400 font-medium">Hizmet Talebim</div>
        </div>
        <div className="px-2">
          <div className="font-black text-base text-slate-900">45</div>
          <div className="text-[11px] text-slate-400 font-medium">Takipçi</div>
        </div>
      </div>

      {/* Menu List Items with Arrows */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
        <button
          onClick={() => onNavigateTab('market')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">İlanlarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigateTab('services')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">Hizmet Taleplerim</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => alert('Favori ilanlarınız')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">Favorilerim</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => alert('Yorumlarınız ve değerlendirmeleriniz')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">Yorumlarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenEdit}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">Bildirim Ayarlarım</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => alert('Mahalle Yardım & Destek Masası')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs text-slate-800">Yardım &amp; Destek</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 transition-colors text-left cursor-pointer text-red-600"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="font-bold text-xs text-red-600">Oturumu Kapat / Çıkış Yap</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-between p-3.5 hover:bg-emerald-50 transition-colors text-left cursor-pointer text-emerald-700"
          >
            <div className="flex items-center gap-3">
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-emerald-700">Giriş Yap / Kayıt Ol</span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── 10. SCREEN 1-3 BOTTOM NAVIGATION BAR (FIXED AT BOTTOM) ──
export function MockupBottomNav({
  activeTab,
  onNavigate,
  onOpenPost
}: {
  activeTab: string;
  onNavigate: (tab: any) => void;
  onOpenPost: () => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg py-1.5">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between relative">
        {/* 1: Anasayfa */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' || activeTab === 'news'
              ? 'text-orange-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home
            className={`w-5 h-5 ${
              activeTab === 'home' || activeTab === 'news'
                ? 'text-orange-600 stroke-[2.5]'
                : ''
            }`}
          />
          <span className="text-[10px]">Anasayfa</span>
        </button>

        {/* 2: Alım Satım */}
        <button
          onClick={() => onNavigate('market')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'market' || activeTab === 'pazar'
              ? 'text-orange-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag
            className={`w-5 h-5 ${
              activeTab === 'market' || activeTab === 'pazar'
                ? 'text-orange-600 stroke-[2.5]'
                : ''
            }`}
          />
          <span className="text-[10px]">Alım Satım</span>
        </button>

        {/* 3: Center Elevated Orange Button: + İlan Ver */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onOpenPost}
            className="w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-all group cursor-pointer border-[3.5px] border-white"
            title="İlan Ver / Paylaş"
          >
            <Plus className="w-7 h-7 stroke-[2.8] text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
          <span className="text-[10px] font-black text-slate-800 mt-0.5">
            İlan Ver
          </span>
        </div>

        {/* 4: Usta / Hizmet */}
        <button
          onClick={() => onNavigate('services')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'services' || activeTab === 'esnaf'
              ? 'text-orange-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Wrench
            className={`w-5 h-5 ${
              activeTab === 'services' || activeTab === 'esnaf'
                ? 'text-orange-600 stroke-[2.5]'
                : ''
            }`}
          />
          <span className="text-[10px]">Usta / Hizmet</span>
        </button>

        {/* 5: Profil */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-orange-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <UserIcon
            className={`w-5 h-5 ${
              activeTab === 'profile'
                ? 'text-orange-600 stroke-[2.5]'
                : ''
            }`}
          />
          <span className="text-[10px]">Profil</span>
        </button>
      </div>
    </nav>
  );
}
