// Paylaşılan bağlantıdan açılan içerik sayfası (FAZ 2A).
// Haber dışındaki içerik türleri (ilan, kayıp eşya, duyuru, vefat, esnaf kampanyası) için ortak, salt okunur görünüm.
import React from 'react';
import { X, Share2, Link2, Phone, MessageCircle } from 'lucide-react';
import type { ContentKind, ContentType } from './links';

export interface SharedContent {
  kind: ContentKind;
  type: ContentType;
  id: string;
  data: any;
  url: string;
}

interface ViewModel {
  badge: string;
  title: string;
  image?: string;
  lines: string[];
  body?: string;
  phone?: string;
  phoneLabel?: string;
}

const waNumber = (phone: string) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('90') && d.length >= 12) return d;
  if (d.startsWith('0')) return '9' + d;
  if (d.length === 10) return '90' + d;
  return d;
};

export function toViewModel(kind: ContentKind, d: any): ViewModel {
  const firstPhoto: string | undefined = (d.fotolar && d.fotolar[0]) || d.fotoUrl || d.davetiyeFoto || d.imageURL || undefined;
  switch (kind) {
    case 'cenaze':
      return {
        badge: '🕊️ Vefat İlanı',
        title: `${d.fullName}${d.age ? `, ${d.age}` : ''}`,
        lines: [
          d.family ? `👪 ${d.family}` : '',
          d.mosque ? `🕌 ${d.mosque}${d.prayerTime ? ' • ' + d.prayerTime : ''}` : '',
          d.cemetery ? `⚰️ Defin yeri: ${d.cemetery}` : '',
          d.dateStr ? `📅 ${d.dateStr}` : ''
        ].filter(Boolean),
        body: "Merhuma Allah'tan rahmet, kederli ailesine ve sevenlerine başsağlığı dileriz."
      };
    case 'marketplace': {
      const emlak = d.ilanTuru === 'emlak';
      return {
        badge: emlak ? '🏠 Emlak İlanı' : '🏷️ 2. El İlanı',
        title: d.baslik,
        image: firstPhoto,
        lines: [
          typeof d.fiyat === 'number' ? `💰 ${d.fiyat.toLocaleString('tr-TR')} TL` : '',
          d.kategori ? `📂 ${d.kategori}` : '',
          emlak && d.odaSayisi ? `🛏️ ${d.odaSayisi}${d.metrekare ? ' • ' + d.metrekare + ' m²' : ''}` : '',
          emlak && d.emlakTuru ? `🔑 ${d.emlakTuru === 'kiralik' ? 'Kiralık' : d.emlakTuru === 'satilik' ? 'Satılık' : 'Devren'}` : '',
          d.status === 'sold' ? '✅ Satıldı' : ''
        ].filter(Boolean),
        body: d.aciklama,
        phone: d.saticiTelefon,
        phoneLabel: d.saticiAdi
      };
    }
    case 'kayip':
      return {
        badge: d.tur === 'bulundu' ? '✅ Bulundu' : '🔎 Kayıp İlanı',
        title: d.baslik,
        image: firstPhoto,
        lines: [d.kategori ? `📂 ${d.kategori}` : '', d.konum ? `📍 ${d.konum}` : ''].filter(Boolean),
        body: d.aciklama,
        phone: d.iletisimTelefon,
        phoneLabel: d.iletisimKisi
      };
    case 'davet':
      return {
        badge: d.turEtiketi || '🎉 Mahalle Duyurusu',
        title: d.baslik,
        image: firstPhoto,
        lines: [
          d.tarih ? `📅 ${d.tarih}${d.saat ? ' • ' + d.saat : ''}` : '',
          d.mekanAdi ? `📍 ${d.mekanAdi}` : '',
          d.adres ? `🗺️ ${d.adres}` : ''
        ].filter(Boolean),
        body: d.aciklama
      };
    case 'kursu':
      return {
        badge: `🎤 ${d.kategori || 'Mahalle Kürsüsü'}`,
        title: d.baslik,
        image: firstPhoto,
        lines: [d.authorName ? `✍️ ${d.authorName}` : '', d.konum ? `📍 ${d.konum}` : '', d.tarihStr ? `📅 ${d.tarihStr}` : ''].filter(Boolean),
        body: d.icerik
      };
    case 'kampanya':
      return {
        badge: `🏪 ${d.isyeriAdi || 'Esnaf Kampanyası'}`,
        title: d.baslik,
        image: firstPhoto,
        lines: [
          d.indirimOrani ? `🏷️ ${d.indirimOrani}` : '',
          d.gecerlilikTarihi ? `⏳ ${d.gecerlilikTarihi}` : '',
          d.adres ? `📍 ${d.adres}` : ''
        ].filter(Boolean),
        body: d.aciklama,
        phone: d.telefon,
        phoneLabel: d.isyeriAdi
      };
    default:
      return { badge: 'Mutlular Haber', title: d.baslik || d.title || '', image: firstPhoto, lines: [], body: d.aciklama || d.icerik };
  }
}

export function SharedContentView({
  content,
  onClose,
  onShare,
  onCopyLink
}: {
  content: SharedContent | null;
  onClose: () => void;
  onShare: (content: SharedContent) => void;
  onCopyLink: (content: SharedContent) => void;
}) {
  if (!content) return null;
  const vm = toViewModel(content.kind, content.data);

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col z-10 overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">{vm.badge}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {vm.image && <img src={vm.image} alt="" className="w-full max-h-72 object-cover" referrerPolicy="no-referrer" />}
          <div className="p-5 space-y-3">
            <h2 className="font-serif font-black text-2xl text-slate-900 leading-tight">{vm.title}</h2>
            {vm.lines.length > 0 && (
              <div className="space-y-1 text-sm text-slate-700 font-semibold">
                {vm.lines.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            )}
            {vm.body && <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{vm.body}</p>}

            {vm.phone && (
              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${vm.phone.replace(/\s/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2.5 rounded-xl"
                >
                  <Phone className="w-4 h-4" /> Ara
                </a>
                <a
                  href={`https://wa.me/${waNumber(vm.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2.5 rounded-xl"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => onCopyLink(content)}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2.5 rounded-xl cursor-pointer"
          >
            <Link2 className="w-4 h-4" /> Bağlantıyı Kopyala
          </button>
          <button
            onClick={() => onShare(content)}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Paylaş
          </button>
          <button
            onClick={onClose}
            className="col-span-2 text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 cursor-pointer"
          >
            Mutlular Haber ana sayfasına git
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharedContentView;
