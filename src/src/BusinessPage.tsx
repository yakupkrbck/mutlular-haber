// Herkese açık işletme detay sayfası (FAZ 4).
import React from 'react';
import { X, Phone, MessageCircle, MapPin, Clock, Share2, Instagram, Globe } from 'lucide-react';
import type { Business, EsnafCampaign } from './firebase';
import { cleanLiveUrl } from './liveStream';

export type BusinessEvent = 'call' | 'whatsapp' | 'share' | 'map';

const waNumber = (phone: string) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('90') && d.length >= 12) return d;
  if (d.startsWith('0')) return '9' + d;
  if (d.length === 10) return '90' + d;
  return d;
};

export function BusinessPage({
  business,
  campaigns,
  onClose,
  onShare,
  onEvent
}: {
  business: Business | null;
  campaigns: EsnafCampaign[];
  onClose: () => void;
  onShare: (b: Business) => void;
  onEvent: (b: Business, type: BusinessEvent) => void;
}) {
  if (!business) return null;
  const cover = business.fotolar && business.fotolar[0];
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.adres + ' Bursa')}`;
  const web = business.website ? cleanLiveUrl(business.website) : null;
  const wa = waNumber(business.whatsapp || business.telefon);
  const mine = campaigns.filter((c) => (c.uid || c.esnafId) === business.ownerUid);

  return (
    <div className="fixed inset-0 z-[66] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col z-10 overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-black bg-emerald-700 text-white px-2.5 py-1 rounded-lg">🏪 {business.kategori}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer" aria-label="Kapat">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {cover && <img src={cover} alt="" className="w-full max-h-64 object-cover" referrerPolicy="no-referrer" />}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              {business.logoUrl && <img src={business.logoUrl} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />}
              <h2 className="font-black text-2xl text-slate-900 leading-tight">{business.isyeri}</h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{business.aciklama}</p>

            <div className="space-y-1.5 text-sm text-slate-700 font-semibold">
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /><span>{business.adres}</span></div>
              {business.calismaSaatleri && <div className="flex items-start gap-2"><Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /><span>{business.calismaSaatleri}</span></div>}
            </div>

            {business.fotolar && business.fotolar.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {business.fotolar.slice(1).map((u) => (
                  <img key={u} src={u} alt="" className="aspect-square w-full rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${business.telefon.replace(/\s/g, '')}`} onClick={() => onEvent(business, 'call')} className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2.5 rounded-xl">
                <Phone className="w-4 h-4" /> Ara
              </a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={() => onEvent(business, 'whatsapp')} className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2.5 rounded-xl">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={() => onEvent(business, 'map')} className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2.5 rounded-xl">
                <MapPin className="w-4 h-4" /> Haritada Aç
              </a>
              <button onClick={() => onShare(business)} className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer">
                <Share2 className="w-4 h-4" /> Paylaş
              </button>
              {business.instagram && /^[A-Za-z0-9._]{1,30}$/.test(business.instagram) && (
                <a href={`https://www.instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-black py-2.5 rounded-xl">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              )}
              {web && (
                <a href={web} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black py-2.5 rounded-xl">
                  <Globe className="w-4 h-4" /> Web Sitesi
                </a>
              )}
            </div>

            {mine.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Kampanyalar</h5>
                {mine.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl border border-amber-200 bg-amber-50/60">
                    <div className="text-xs font-black text-slate-900">{c.baslik}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{c.indirimOrani}{c.gecerlilikTarihi ? ` • ${c.gecerlilikTarihi}` : ''}</div>
                    {c.aciklama && <div className="text-[11px] text-slate-600 mt-1 line-clamp-3">{c.aciklama}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessPage;
