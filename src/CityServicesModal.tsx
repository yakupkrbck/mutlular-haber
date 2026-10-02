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
import {
  NOTARIES,
  TAXI_STANDS,
  BUS_ROUTES,
  DECEASED_ITEMS,
  FOOD_PLACES,
  JOB_LISTINGS,
  COMMUNITY_EVENTS,
  type DeceasedItem
} from './cityServicesData';
import type { UserProfile, UserRole } from './firebase';
import { COORDINATOR_PHONE_INTL } from './siteConfig';

interface CityServicesModalProps {
  activeModal: 'noter' | 'taksi' | 'otobus' | 'vefat' | 'yemek' | 'is' | 'etkinlik' | 'odalar' | 'neleroluyor' | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  deceasedList?: DeceasedItem[];
  onOpenAddDeceased?: () => void;
  canDeleteDeceased?: (d: DeceasedItem) => boolean;
  onDeleteDeceased?: (d: DeceasedItem) => void;
  myDeceasedPending?: DeceasedItem[];
}

export function CityServicesModal({ activeModal, onClose, onShowToast, deceasedList, onOpenAddDeceased, canDeleteDeceased, onDeleteDeceased, myDeceasedPending }: CityServicesModalProps) {
  if (!activeModal) return null;

  // Örnek (sahte) kayıtlara geri düşülmez: liste boşsa boş durum gösterilir.
  const currentDeceasedList = deceasedList || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL BAŞLIĞI */}
        <div className="p-4 sm:p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            {activeModal === 'noter' && (
              <div className="w-9 h-9 rounded-2xl bg-red-600 text-white font-black text-xs flex items-center justify-center">
                NOTER
              </div>
            )}
            {activeModal === 'taksi' && (
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center">
                <Car className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'otobus' && (
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                <Bus className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'vefat' && (
              <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-base">
                🕊️
              </div>
            )}
            {activeModal === 'yemek' && (
              <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center">
                <Utensils className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'is' && (
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Briefcase className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'etkinlik' && (
              <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                <Calendar className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'odalar' && (
              <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <Award className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            {activeModal === 'neleroluyor' && (
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}

            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                {activeModal === 'noter' && 'Nöbetçi Noterler'}
                {activeModal === 'taksi' && 'Taksi Durakları (7/24)'}
                {activeModal === 'otobus' && 'Mahalle Otobüs Saatleri'}
                {activeModal === 'vefat' && 'Kaybettiklerimiz (Vefat & Taziye)'}
                {activeModal === 'yemek' && 'Yemek & Restoranlar'}
                {activeModal === 'is' && 'İş İlanları & Mahalle Fırsatları'}
                {activeModal === 'etkinlik' && 'Mahalle Etkinlikleri & Buluşmalar'}
                {activeModal === 'odalar' && 'Mutlular Muhtarlığı & Esnaf Dayanışması'}
                {activeModal === 'neleroluyor' && 'Mahallede Neler Oluyor?'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Mutlular Plus · Güncel Mahalle ve Şehir Verileri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* MODAL İÇERİĞİ */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* 2. NÖBETÇİ NOTERLER */}
          {activeModal === 'noter' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 font-semibold">
                Hafta sonu nöbetçi noterler 10:00 - 16:00 saatleri arasında vekaletname, tasdik ve araç satış işlemlerini yapmaktadır.
              </div>

              {NOTARIES.map((n) => (
                <div key={n.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">{n.name}</h4>
                    <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {n.hours}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {n.address}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium italic">{n.note}</p>
                  <div className="pt-2">
                    <a
                      href={`tel:${n.phone.replace(/\s+/g, '')}`}
                      className="w-full bg-slate-900 hover:bg-black text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" /> Noterliği Ara ({n.phone})
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. TAKSİ DURAKLARI */}
          {activeModal === 'taksi' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-semibold flex items-center gap-2">
                <span>🚖 Tüm duraklar 7 gün 24 saat şehir içi ve şehir dışı yolcu hizmeti vermektedir.</span>
              </div>

              {TAXI_STANDS.map((t) => (
                <div key={t.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {t.location}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 mt-1 inline-block">
                      {t.vehicleCount}
                    </span>
                  </div>

                  <a
                    href={`tel:${t.phone.replace(/\s+/g, '')}`}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5 stroke-[2.5]" /> Taksi Çağır
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* 4. OTOBÜS SAATLERİ */}
          {activeModal === 'otobus' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-semibold">
                Belediye ve özel halk otobüsleri hat ve sefer saatleri.
              </div>

              {BUS_ROUTES.map((b) => (
                <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-1 rounded-xl">
                      {b.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {b.frequency}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{b.route}</p>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <span>İlk Sefer: <strong className="text-slate-900">{b.firstBus}</strong></span>
                    <span>Son Sefer: <strong className="text-slate-900">{b.lastBus}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. KAYBETTİKLERİMİZ (VEFAT & TAZİYE) */}
          {activeModal === 'vefat' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2.5">
                <div className="text-xs text-emerald-900 font-semibold leading-relaxed">
                  🕊️ Mutlular Mahallesi ve Bursa genelinde vefat eden hemşerilerimizin taziye ve cenaze namazı bilgileri. Merhum ve merhumelere Allah'tan rahmet dileriz.
                </div>
                {onOpenAddDeceased && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddDeceased();
                    }}
                    className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+</span> İlan Bırak
                  </button>
                )}
              </div>

              {myDeceasedPending && myDeceasedPending.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="text-xs font-black text-amber-900">Bıraktığınız ilanlar</div>
                  {myDeceasedPending.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-800 truncate">{d.fullName}</span>
                      <span className={`shrink-0 font-black px-2 py-0.5 rounded-md ${d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-200 text-amber-900'}`}>
                        {d.status === 'rejected' ? 'Reddedildi' : '⏳ Onay bekliyor'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {currentDeceasedList.length === 0 && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <div className="text-2xl">🕊️</div>
                  <div className="font-bold text-slate-700">Şu an yayında vefat ilanı yok.</div>
                  <div>Bir vefat olduğunda yukarıdaki "İlan Bırak" düğmesiyle cenaze ve taziye bilgisini duyurabilirsiniz.</div>
                </div>
              )}

              {currentDeceasedList.map((d) => (
                <div key={d.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      {d.fullName} {d.age ? `(${d.age} yaşında)` : ''}
                    </h4>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      {d.dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium italic">{d.family}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Cenaze Vakti:</span>
                      <span className="text-emerald-800">{d.mosque} - {d.prayerTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Defin:</span>
                      <span>{d.cemetery}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`${d.fullName} vefat duyurusu - Cami: ${d.mosque} (${d.prayerTime}) - Defin: ${d.cemetery}`);
                      onShowToast('Taziye bilgisi kopyalandı');
                    }}
                    className="w-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Taziye Bilgisini Paylaş
                  </button>

                  {onDeleteDeceased && canDeleteDeceased && canDeleteDeceased(d) && (
                    <button
                      type="button"
                      onClick={() => onDeleteDeceased(d)}
                      className="w-full text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      🗑️ İlanı Kaldır
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 7. YEMEK & RESTORANLAR */}
          {activeModal === 'yemek' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-950 font-semibold">
                🍕 Bursa İskenderi, pideli köfte, cantık, tahinli pide ve ev yemekleri sunan yerel lezzet durakları.
              </div>

              {FOOD_PLACES.map((f) => (
                <div key={f.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all flex gap-3 items-center">
                  <img src={f.imageUrl} alt={f.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">{f.name}</h4>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                        ⭐ {f.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{f.specialty}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Min: {f.minOrder}</span>
                      <span>·</span>
                      <span>{f.deliveryTime}</span>
                    </div>
                    <a
                      href={`tel:${f.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 text-[11px] font-black text-orange-700 hover:text-orange-900 mt-1"
                    >
                      <Phone className="w-3 h-3" /> Sipariş Ver ({f.phone})
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 8. İŞ İLANLARI */}
          {activeModal === 'is' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-semibold">
                💼 Mahalle esnafları ve yerel firmaların aktif iş ilanları.
              </div>

              {JOB_LISTINGS.map((j) => (
                <div key={j.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{j.title}</h4>
                      <p className="text-xs text-slate-600 font-semibold">{j.company}</p>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                      {j.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-black text-emerald-700">{j.salary}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                  </div>

                  <a
                    href={`tel:${j.phone.replace(/\s+/g, '')}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Başvuru İçin Ara ({j.phone})
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* 9. ETKİNLİKLER */}
          {activeModal === 'etkinlik' && (
            <div className="space-y-4">
              {COMMUNITY_EVENTS.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xs transition-all">
                  <img src={e.imageUrl} alt={e.title} className="w-full h-36 object-cover" />
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {e.category}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm leading-tight">{e.title}</h4>
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-600" /> {e.dateStr} - {e.timeStr}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {e.location}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">Düzenleyen: {e.organizer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 10. MUHTARLIK & ESNAF DAYANIŞMASI */}
          {activeModal === 'odalar' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-950 font-semibold space-y-1.5">
                <h4 className="font-black text-teal-900 text-sm">Mutlular Mahallesi Muhtarlığı & Esnaf Dayanışması</h4>
                <p>Mahallemiz sakinleri için resmi evrak, ikametgâh, belediye talepleri ve esnaf dayanışma hizmetleri.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                <h5 className="font-black text-slate-900 text-sm">Muhtarlık İletişim & Danışma</h5>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Mutlular Mah. Çınaraltı Meydanı No: 12, Osmangazi / Bursa
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Hafta İçi: 08:30 - 17:30
                </p>
              </div>
            </div>
          )}

          {/* 11. NELER OLUYOR */}
          {activeModal === 'neleroluyor' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 space-y-2">
                <span className="font-black text-purple-900 text-sm block">📊 Mahalle Meclisi & Haftalık Anket</span>
                <p>Mutlular Mahallesi için yürütülen projeler ve komşuluk oylaması.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-sm">
                  Mutlular Parkı ve Çevre Düzenlemesinde Hangisi Öncelikli Yapılmalı?
                </h4>
                <div className="space-y-2 text-xs">
                  <button 
                    onClick={() => onShowToast('Oyunuz kaydedildi! Teşekkürler.')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 font-bold border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all"
                  >
                    <span>🚲 Çınaraltı & Park Çevresi Aydınlatmalı Yürüyüş Yolu</span>
                    <span className="text-slate-400 font-normal">%48</span>
                  </button>
                  <button 
                    onClick={() => onShowToast('Oyunuz kaydedildi! Teşekkürler.')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 font-bold border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all"
                  >
                    <span>☕ Gençlik & Emekli Çay Salonu Yenilemesi</span>
                    <span className="text-slate-400 font-normal">%34</span>
                  </button>
                  <button 
                    onClick={() => onShowToast('Oyunuz kaydedildi! Teşekkürler.')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 font-bold border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all"
                  >
                    <span>🎪 Yeni Nesil Güvenli Çocuk Macera Parkı</span>
                    <span className="text-slate-400 font-normal">%18</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL ALTI: KAPAT BUTONU */}
        <div className="p-3 border-t border-slate-150 bg-slate-50/80 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-black text-white text-xs font-black px-5 py-2 rounded-xl transition-all shadow-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  demoRole: UserRole;
  onToggleRole: (r: UserRole) => void;
  canSwitchRole?: boolean;
  onNavigateTab: (tab: any) => void;
  onOpenCityModal: (modal: any) => void;
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
  onOpenCityModal,
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

            {/* Şehir Hizmetleri Kısayolları */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                Şehir & Mahalle Birimleri
              </span>
              
              <button
                onClick={() => { onClose(); onOpenCityModal('noter'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[8px] flex items-center justify-center">NOT</span>
                  Nöbetçi Noterler
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onOpenCityModal('taksi'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-amber-500" /> Taksi Durakları (7/24)
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onOpenCityModal('otobus'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Bus className="w-4 h-4 text-blue-600" /> Otobüs Saatleri & Hatlar
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onOpenCityModal('vefat'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-emerald-700">🕊️</span> Kaybettiklerimiz (Vefat & Taziye)
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onOpenCityModal('is'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> İş İlanları
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { onClose(); onOpenCityModal('odalar'); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-teal-600" /> Mutlular Muhtarlığı & Danışma
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
