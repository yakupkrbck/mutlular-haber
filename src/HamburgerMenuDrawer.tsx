import React from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Navigation,
  Share2,
  AlertCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  Calendar,
  Briefcase,
  Car,
  Bus,
  Utensils,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
  Tag,
  Store,
  Wrench,
  Heart,
  Newspaper,
  ShoppingBag
} from 'lucide-react';
import type { UserProfile, UserRole } from './firebase';
import { COORDINATOR_PHONE_INTL } from './siteConfig';

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  demoRole: UserRole;
  onToggleRole: (r: UserRole) => void;
  canSwitchRole?: boolean;
  onNavigateTab: (tab: any) => void;
  onOpenVefat: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onShowCredit: () => void;
  onOpenEmergency?: () => void;
  onOpenAdminPanel?: () => void;
}

export function HamburgerMenuDrawer({
  isOpen,
  onClose,
  user,
  profile,
  demoRole,
  onToggleRole,
  canSwitchRole = false,
  onNavigateTab,
  onOpenVefat,
  onOpenAuth,
  onLogout,
  onShowCredit,
  onOpenEmergency,
  onOpenAdminPanel
}: HamburgerMenuDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Karartma arka plan */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          
          {/* ÜST: LOGO VE KAPAT */}
          <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-xs">
                <span>M</span><span className="text-red-500 font-extrabold">+</span><span>P</span>
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm tracking-tight">MUTLULAR PLUS</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mahallenin Dijital Merkezi</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* ORTA: PROFİL VE MENÜ BAĞLANTILARI */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            
            {/* Kullanıcı Kartı */}
            <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center">
                    {(profile?.name || user?.displayName || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm leading-tight">
                      {profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Misafir Kullanıcı')}
                    </h4>
                    <span className="text-[10px] text-slate-300">
                      {user || profile
                        ? (demoRole === 'admin' ? '👑 Yönetici (Admin)' : demoRole === 'editor' ? '✍️ Haber Editörü' : demoRole === 'esnaf' ? '🏪 Esnaf / Usta' : '🏡 Mahalle Sakini')
                        : 'Giriş Yapılmadı (Misafir Oturumu)'}
                    </span>
                  </div>
                </div>
                {demoRole === 'esnaf' && (
                  <button
                    onClick={() => { onClose(); onShowCredit(); }}
                    className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-1 rounded-lg"
                  >
                    {profile?.credits ?? 8} Kredi
                  </button>
                )}
              </div>

              {/* Rol Önizleme (yalnızca gerçek yönetici) */}
              {canSwitchRole && (
              <div className="pt-2 border-t border-white/10 grid grid-cols-4 gap-1 text-[10px]">
                <button
                  onClick={() => onToggleRole('sakin')}
                  className={`py-1 rounded-lg font-bold transition-all text-center ${
                    demoRole === 'sakin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👤 Sakin
                </button>
                <button
                  onClick={() => onToggleRole('esnaf')}
                  className={`py-1 rounded-lg font-bold transition-all text-center ${
                    demoRole === 'esnaf' ? 'bg-emerald-500 text-white font-black shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🏪 Esnaf
                </button>
                <button
                  onClick={() => onToggleRole('editor')}
                  className={`py-1 rounded-lg font-bold transition-all text-center ${
                    demoRole === 'editor' ? 'bg-indigo-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ✍️ Editör
                </button>
                <button
                  onClick={() => onToggleRole('admin')}
                  className={`py-1 rounded-lg font-bold transition-all text-center ${
                    demoRole === 'admin' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👑 Admin
                </button>
              </div>
              )}

              {/* Yönetici & Editör Paneli Giriş Butonu */}
              {(demoRole === 'admin' || demoRole === 'editor' || profile?.role === 'admin' || profile?.role === 'editor') && onOpenAdminPanel && (
                <button
                  onClick={() => { onClose(); onOpenAdminPanel(); }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>👑</span>
                  <span>Yönetici &amp; Editör Masasını Aç</span>
                </button>
              )}
            </div>

            {/* ── KULLANICININ İSTEDİĞİ HIZLI KUTUCUKLAR: HABERLER, İLANLAR, ESNAF, ETKİNLİK ── */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                Hızlı Menü &amp; Kategoriler
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onClose(); onNavigateTab('home'); }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 transition-all border border-red-100 text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs block leading-tight text-slate-900 group-hover:text-red-700">Haberler</span>
                    <span className="text-[10px] text-slate-500 font-medium">Mutlular Haber</span>
                  </div>
                </button>

                <button
                  onClick={() => { onClose(); onNavigateTab('market'); }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all border border-amber-100 text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs block leading-tight text-slate-900 group-hover:text-amber-800">İlanlar</span>
                    <span className="text-[10px] text-slate-500 font-medium">Alım Satım</span>
                  </div>
                </button>

                <button
                  onClick={() => { onClose(); onNavigateTab('services'); }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all border border-emerald-100 text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs block leading-tight text-slate-900 group-hover:text-emerald-800">Esnaf &amp; Usta</span>
                    <span className="text-[10px] text-slate-500 font-medium">Mutlular Hizmet</span>
                  </div>
                </button>

                <button
                  onClick={() => { onClose(); onNavigateTab('davet'); }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-all border border-purple-100 text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs block leading-tight text-slate-900 group-hover:text-purple-800">Etkinlik</span>
                    <span className="text-[10px] text-slate-500 font-medium">Davet &amp; Kermes</span>
                  </div>
                </button>
              </div>

              {/* Acil Çağrı & Eczane Butonu (Üst kısımdan hamburger menü içine taşındı) */}
              {onOpenEmergency && (
                <button
                  onClick={() => { onClose(); onOpenEmergency(); }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-sm cursor-pointer mt-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>🚨 Acil Numaralar</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </button>
              )}
            </div>

            {/* Vefat & Taziye ilanları */}
            <div className="space-y-1">
              <button
                onClick={() => { onClose(); onOpenVefat(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm">🕊️</span> Vefat &amp; Taziye İlanları
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Süper Uygulama Temel Sekmeleri */}
            <div className="space-y-1 pt-2 border-t border-slate-150">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                Pazar, Davet & Hizmetler
              </span>

              <button
                onClick={() => { onClose(); onNavigateTab('davet'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-pink-50 text-slate-800 hover:text-pink-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-pink-600 text-sm">💍</span> Mahalle Davetleri (Düğün & Nişan)
                </span>
                <ChevronRight className="w-4 h-4 text-pink-400" />
              </button>

              <button
                onClick={() => { onClose(); onNavigateTab('pazar'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-amber-600" /> Mahalle Pazarı (Esnaf Vitrini)
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onNavigateTab('market'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-emerald-600" /> MUTLULAR ALIM SATIM
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onNavigateTab('services'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-orange-600" /> MUTLULAR HİZMET
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onNavigateTab('lostfound'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-purple-600" /> Kayıp & Buluntu Eşya
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onNavigateTab('news'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Mahalle Bülteni & Haberler
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* WhatsApp Destek Hattı */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${COORDINATOR_PHONE_INTL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>💬 Mutlular Mahalle Koordinasyon Hattı</span>
              </a>
            </div>

          </div>

          {/* ALT: ÇIKIŞ YA DA GİRİŞ BUTONU */}
          <div className="p-4 border-t border-slate-150 bg-slate-50/90">
            {user || profile ? (
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Oturumu Kapat / Çıkış Yap
              </button>
            ) : (
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Giriş Yap / Ücretsiz Kayıt Ol
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
