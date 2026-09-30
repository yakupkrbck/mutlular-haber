// Paylaşım stüdyosu (FAZ 2B): içerik için 1080x1920 (9:16) hikâye görseli üretir;
// görseli kaydetme/paylaşma, bağlantı ve metin kopyalama ve mobil paylaşım menüsünü sunar.
import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Share2, Download, Link2, MessageCircle } from 'lucide-react';
import type { ContentType } from './links';

export interface ShareItem {
  type: ContentType;
  title: string;
  summary?: string;
  category?: string;
  imageUrl?: string;
  /** Görselde ve metinde kullanılacak kısa satırlar (tarih, yer vb.). Kişisel iletişim bilgisi EKLENMEZ. */
  meta?: string[];
  url: string;
  contentId?: string;
}

const W = 1080;
const H = 1920;

const THEMES: Record<ContentType, { from: string; to: string; label: string; emoji: string; cta: string }> = {
  haber: { from: '#7f1d1d', to: '#D32F2F', label: 'HABER', emoji: '📰', cta: 'Haberin tamamı için bağlantıya tıklayın' },
  duyuru: { from: '#1e3a8a', to: '#2563eb', label: 'DUYURU', emoji: '📢', cta: 'Detaylar için bağlantıya tıklayın' },
  cenaze: { from: '#0f172a', to: '#334155', label: 'VEFAT İLANI', emoji: '🕊️', cta: 'Cenaze ve taziye bilgileri için bağlantıya tıklayın' },
  ilan: { from: '#065f46', to: '#059669', label: 'İLAN', emoji: '🏷️', cta: 'İlan detayı için bağlantıya tıklayın' },
  esnaf: { from: '#9a3412', to: '#ea580c', label: 'ESNAF', emoji: '🏪', cta: 'İşletme ve kampanya için bağlantıya tıklayın' },
  hizmet: { from: '#312e81', to: '#6d28d9', label: 'HİZMET', emoji: '🛠️', cta: 'Hizmet talebi oluşturmak ve teklif almak için bağlantıya tıklayın' }
};

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const SERIF = '"Newsreader", Georgia, "Times New Roman", serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = (text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const test = cur ? cur + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width <= maxWidth || !cur) {
      cur = test;
    } else {
      lines.push(cur);
      cur = words[i];
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  // Sığmayan metin üç nokta ile biter
  const consumed = lines.join(' ').split(' ').length;
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = last.replace(/[\s,.;:!-]+$/, '') + '…';
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function ensureFonts() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`800 54px ${SANS}`),
        document.fonts.load(`600 38px ${SANS}`),
        document.fonts.load(`400 40px ${SANS}`),
        document.fonts.load(`700 76px ${SERIF}`)
      ]),
      new Promise((r) => setTimeout(r, 2500))
    ]);
  } catch (_) {
    /* yazı tipi yüklenemezse yedek aileler kullanılır */
  }
}

async function drawCard(canvas: HTMLCanvasElement, item: ShareItem): Promise<{ imageFailed: boolean }> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { imageFailed: false };
  await ensureFonts();
  const t = THEMES[item.type];

  const img = item.imageUrl ? await loadImage(item.imageUrl) : null;
  const imageFailed = Boolean(item.imageUrl) && !img;

  // Arka plan
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, t.from);
  g.addColorStop(1, t.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.arc(W - 120, 260, 360, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, H - 420, 300, 0, Math.PI * 2);
  ctx.fill();

  // Üst şerit: marka + tür
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 54px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('Mutlular Haber', 80, 140);
  ctx.font = `700 30px ${SANS}`;
  const label = t.label;
  const lw = ctx.measureText(label).width + 56;
  roundRect(ctx, W - 80 - lw, 92, lw, 64, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(label, W - 80 - lw / 2, 135);
  ctx.textAlign = 'left';

  // Görsel alanı
  const ix = 80;
  const iy = 210;
  const iw = W - 160;
  const ih = item.type === 'cenaze' ? 520 : 700;
  ctx.save();
  roundRect(ctx, ix, iy, iw, ih, 44);
  ctx.clip();
  if (img) {
    const scale = Math.max(iw / img.width, ih / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(ix, iy, iw, ih);
    ctx.font = `400 220px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(t.emoji, ix + iw / 2, iy + ih / 2 + 76);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // Kategori rozeti
  let y = iy + ih + 70;
  if (item.category) {
    ctx.font = `700 34px ${SANS}`;
    const cw = Math.min(ctx.measureText(item.category).width + 52, W - 160);
    roundRect(ctx, 80, y - 44, cw, 60, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = t.from;
    ctx.fillText(item.category, 80 + 26, y - 2);
    y += 70;
  }

  // Başlık
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 76px ${SERIF}`;
  const titleLines = wrapLines(ctx, item.title, W - 160, 4);
  titleLines.forEach((ln, i) => ctx.fillText(ln, 80, y + 60 + i * 90));
  y += 60 + titleLines.length * 90;

  // Özet
  if (item.summary) {
    ctx.font = `400 40px ${SANS}`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const maxSum = y > 1330 ? 2 : 4;
    const sumLines = wrapLines(ctx, item.summary, W - 160, maxSum);
    sumLines.forEach((ln, i) => ctx.fillText(ln, 80, y + 40 + i * 56));
    y += 40 + sumLines.length * 56 + 10;
  }

  // Tarih / konum satırları
  if (item.meta && item.meta.length) {
    ctx.font = `600 38px ${SANS}`;
    ctx.fillStyle = '#ffffff';
    item.meta.slice(0, 3).forEach((m, i) => {
      const ln = wrapLines(ctx, m, W - 220, 1)[0] || '';
      ctx.fillText('•  ' + ln, 80, y + 36 + i * 54);
    });
  }

  // Bağlantı çağrısı
  const by = H - 300;
  roundRect(ctx, 80, by, W - 160, 200, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = t.from;
  ctx.font = `800 40px ${SANS}`;
  const ctaLines = wrapLines(ctx, t.cta, W - 240, 2);
  ctaLines.forEach((ln, i) => ctx.fillText(ln, 120, by + 76 + i * 52));
  ctx.fillStyle = '#475569';
  ctx.font = `600 32px ${SANS}`;
  ctx.fillText('🔗 Bağlantı hikâyede', 120, by + 76 + ctaLines.length * 52 + 14);

  return { imageFailed };
}

function buildText(item: ShareItem): string {
  const t = THEMES[item.type];
  const parts = [`${t.emoji} ${item.title}`];
  if (item.summary) parts.push(item.summary);
  if (item.meta && item.meta.length) parts.push(item.meta.slice(0, 3).join('\n'));
  parts.push(`👉 ${item.url}`);
  return parts.join('\n\n');
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (_) {
    /* yedek yönteme geç */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

export function ShareStudio({
  item,
  onClose,
  onToast,
  onShared
}: {
  item: ShareItem | null;
  onClose: () => void;
  onToast: (msg: string, isError?: boolean) => void;
  onShared?: (item: ShareItem, channel: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!item || !canvasRef.current) return;
    let cancelled = false;
    setReady(false);
    setImageFailed(false);
    drawCard(canvasRef.current, item).then((r) => {
      if (cancelled) return;
      setImageFailed(r.imageFailed);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [item]);

  if (!item) return null;

  const fileName = `mutlular-haber-${item.type}.png`;

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      try {
        canvasRef.current?.toBlob((b: Blob | null) => resolve(b), 'image/png');
      } catch (_) {
        resolve(null);
      }
    });

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) {
      onToast('Görsel oluşturulamadı. Fotoğraf kaynağı dışa aktarmaya izin vermiyor olabilir.', true);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    onToast('Görsel kaydedildi. Instagram hikâyene ekleyebilirsin 📸');
    onShared?.(item, 'gorsel_kaydet');
  };

  const handleShareImage = async () => {
    const blob = await getBlob();
    if (!blob) {
      onToast('Görsel oluşturulamadı. Fotoğraf kaynağı dışa aktarmaya izin vermiyor olabilir.', true);
      return;
    }
    const file = new File([blob], fileName, { type: 'image/png' });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
      try {
        await nav.share({ files: [file], title: item.title, text: buildText(item) });
        onShared?.(item, 'gorsel_paylas');
      } catch (e: any) {
        if (e?.name !== 'AbortError') onToast('Paylaşım açılamadı: ' + (e?.message || 'bilinmeyen hata'), true);
      }
    } else {
      await handleDownload();
    }
  };

  const handleShareMenu = async () => {
    const nav: any = navigator;
    if (nav.share) {
      try {
        await nav.share({ title: item.title, text: item.summary || item.title, url: item.url });
        onShared?.(item, 'paylasim_menusu');
      } catch (e: any) {
        if (e?.name !== 'AbortError') onToast('Paylaşım açılamadı: ' + (e?.message || 'bilinmeyen hata'), true);
      }
    } else {
      const ok = await copyText(item.url);
      onToast(ok ? 'Bu cihazda paylaşım menüsü yok, bağlantı kopyalandı 🔗' : 'Bağlantı kopyalanamadı.', !ok);
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyText(item.url);
    onToast(ok ? 'Bağlantı kopyalandı 🔗' : 'Bağlantı kopyalanamadı.', !ok);
    if (ok) onShared?.(item, 'baglanti_kopyala');
  };

  const handleCopyText = async () => {
    const ok = await copyText(buildText(item));
    onToast(ok ? 'Paylaşım metni kopyalandı 📋' : 'Metin kopyalanamadı.', !ok);
    if (ok) onShared?.(item, 'metin_kopyala');
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(buildText(item))}`, '_blank');
    onShared?.(item, 'whatsapp');
  };

  const btn = 'flex items-center justify-center gap-1.5 text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-[0.98]';

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] flex flex-col z-10">
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-black text-lg text-slate-900">Paylaş</h3>
            <p className="text-[11px] text-slate-500">Hikâye görseli (1080 × 1920) ve bağlantı</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="relative mx-auto bg-slate-100 rounded-2xl overflow-hidden" style={{ height: '46vh', aspectRatio: '9 / 16', maxWidth: '100%' }}>
            <canvas ref={canvasRef} width={W} height={H} className="w-full h-full block" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-100/90">
                Görsel hazırlanıyor…
              </div>
            )}
          </div>

          {imageFailed && (
            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              Fotoğraf görsele eklenemedi (kaynak dışa aktarmaya izin vermedi). Görsel fotoğrafsız hazırlandı.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleShareImage} className={`${btn} bg-slate-900 hover:bg-slate-800 text-white col-span-2`}>
              <Share2 className="w-4 h-4" /> Görseli Paylaş / Kaydet
            </button>
            <button onClick={handleDownload} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
              <Download className="w-4 h-4" /> Görseli Kaydet
            </button>
            <button onClick={handleShareMenu} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
              <Share2 className="w-4 h-4" /> Paylaşım Menüsü
            </button>
            <button onClick={handleCopyLink} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
              <Link2 className="w-4 h-4" /> Bağlantıyı Kopyala
            </button>
            <button onClick={handleCopyText} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
              <Copy className="w-4 h-4" /> Metni Kopyala
            </button>
            <button onClick={handleWhatsApp} className={`${btn} bg-green-600 hover:bg-green-700 text-white col-span-2`}>
              <MessageCircle className="w-4 h-4" /> WhatsApp'ta Paylaş
            </button>
          </div>

          <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 leading-relaxed">
            <div className="font-black text-slate-900">Instagram hikâyesi için</div>
            <div>1. Görseli kaydet.</div>
            <div>2. Instagram'da hikâye ekle ve görseli seç.</div>
            <div>3. Çıkartmalardan 🔗 <strong>Bağlantı</strong>'yı seç, kopyaladığın bağlantıyı yapıştır.</div>
            <div className="text-slate-500">Instagram, bağlantıyı otomatik eklemeye izin vermez; 3. adımı senin yapman gerekir.</div>
          </div>

          <div className="text-[10px] text-slate-400 break-all">{item.url}</div>
        </div>
      </div>
    </div>
  );
}

export default ShareStudio;
