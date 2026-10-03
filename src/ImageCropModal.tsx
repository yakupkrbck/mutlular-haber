import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, Minus, Plus, X } from 'lucide-react';

// Fotoğraf yüklemeden önce yakınlaştırıp kırpma penceresi.
// Dış paket kullanmaz: sürükle = konumlandır, iki parmak / çubuk / fare tekerleği = yakınlaştır.

const ASPECTS: { label: string; value: number }[] = [
  { label: 'Kare', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const MAX_OUTPUT_SIDE = 1600;

interface ImageCropModalProps {
  file: File;
  /** Başlangıç oranı (genişlik / yükseklik). */
  initialAspect?: number;
  /** Yuvarlak (profil) alan: oran kare kilitlenir, çerçeve daire görünür. */
  round?: boolean;
  /** Onay düğmesinin rengi (PhotoUploadField'ın accentClass değeri). */
  accentClass?: string;
  onCancel: () => void;
  /** Kırpılmış dosya hazır. */
  onDone: (cropped: File) => void;
  /** Kırpmadan orijinal dosyayı kullan (veya fotoğraf bu pencerede açılamadıysa). */
  onSkip: () => void;
}

interface View {
  zoom: number;
  x: number; // çerçeve merkezine göre kaydırma (px)
  y: number;
}

function viewportBox() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 640;
  return { maxW: Math.min(vw - 32, 440), maxH: Math.min(vh * 0.48, 460) };
}

export default function ImageCropModal({
  file,
  initialAspect = 4 / 3,
  round = false,
  accentClass = 'bg-slate-900 hover:bg-slate-800 text-white',
  onCancel,
  onDone,
  onSkip,
}: ImageCropModalProps) {
  const [imgUrl, setImgUrl] = useState('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [aspect, setAspect] = useState(round ? 1 : initialAspect);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [box, setBox] = useState(viewportBox);
  const [busy, setBusy] = useState(false);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDist = useRef(0);

  // Dosyayı göster
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNat({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => onSkip(); // tarayıcı açamadıysa (örn. HEIC) orijinali olduğu gibi yükle
    img.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Arka sayfa kaymasın, Escape kapatsın, ekran dönünce çerçeve yeniden hesaplansın
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    const onResize = () => setBox(viewportBox());
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Çerçeve boyutu (oran + ekran)
  const frame = useMemo(() => {
    let fw = box.maxW;
    let fh = fw / aspect;
    if (fh > box.maxH) {
      fh = box.maxH;
      fw = fh * aspect;
    }
    return { fw: Math.round(fw), fh: Math.round(fh) };
  }, [box, aspect]);

  // Çerçeveyi dolduran taban ölçek (zoom = 1)
  const baseScale = nat ? Math.max(frame.fw / nat.w, frame.fh / nat.h) : 1;

  const clampView = useCallback(
    (v: View): View => {
      if (!nat) return v;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom));
      const scale = baseScale * zoom;
      const maxX = Math.max(0, (nat.w * scale - frame.fw) / 2);
      const maxY = Math.max(0, (nat.h * scale - frame.fh) / 2);
      return { zoom, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
    },
    [nat, baseScale, frame.fw, frame.fh]
  );

  // Oran / ekran değişince görüntüyü çerçeve içinde tut
  useEffect(() => {
    setView((v) => clampView(v));
  }, [clampView]);

  const setZoom = (next: number) =>
    setView((v) => {
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      const k = z / v.zoom;
      return clampView({ zoom: z, x: v.x * k, y: v.y * k });
    });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values()) as { x: number; y: number }[];
      lastDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values()) as { x: number; y: number }[];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDist.current > 0 && dist > 0) {
        const ratio = dist / lastDist.current;
        setView((v) => {
          const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * ratio));
          const k = z / v.zoom;
          return clampView({ zoom: z, x: v.x * k, y: v.y * k });
        });
      }
      lastDist.current = dist;
    }
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    lastDist.current = 0;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setZoom(view.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
  };

  const handleDone = () => {
    const img = imgRef.current;
    if (!img || !nat || busy) return;
    setBusy(true);
    try {
      const scale = baseScale * view.zoom;
      const sw = frame.fw / scale;
      const sh = frame.fh / scale;
      const sx = Math.max(0, Math.min(nat.w - sw, nat.w / 2 - sw / 2 - view.x / scale));
      const sy = Math.max(0, Math.min(nat.h - sh, nat.h / 2 - sh / 2 - view.y / scale));
      const outW = Math.max(1, Math.min(MAX_OUTPUT_SIDE, Math.round(sw)));
      const outH = Math.max(1, Math.round((outW * frame.fh) / frame.fw));
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) { onSkip(); return; }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      canvas.toBlob(
        (blob) => {
          if (!blob) { onSkip(); return; }
          const base = (file.name || 'fotograf').replace(/\.[^.]+$/, '') || 'fotograf';
          onDone(new File([blob], `${base}.jpg`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.9
      );
    } catch {
      onSkip();
    }
  };

  // Pencere içindeki tıklamalar, onu içeren üst pencerenin "dışarı tıkla kapat" davranışına ulaşmasın.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const scale = baseScale * view.zoom;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4"
      style={{ overscrollBehavior: 'contain' }}
      onClick={stop}
      onMouseDown={stop}
      onMouseUp={stop}
      onTouchStart={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
      onPointerUp={stop}
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğrafı yakınlaştır ve kırp"
    >
      <div className="w-full max-w-[480px] bg-slate-900 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Fotoğrafı yakınlaştır ve kırp</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sürükleyerek konumlandırın, iki parmakla veya çubukla yakınlaştırın.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Vazgeç"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center">
          <div
            className={`relative overflow-hidden bg-slate-950 ring-2 ring-white/80 ${round ? 'rounded-full' : 'rounded-xl'} cursor-grab active:cursor-grabbing`}
            style={{ width: frame.fw, height: frame.fh, touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onWheel={onWheel}
          >
            {nat && imgUrl ? (
              <img
                src={imgUrl}
                alt="Kırpılacak fotoğraf"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: nat.w * scale,
                  height: nat.h * scale,
                  maxWidth: 'none',
                  transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px)`,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {!round && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setZoom(view.zoom / 1.25)}
            aria-label="Uzaklaştır"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={view.zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            aria-label="Yakınlaştırma"
            className="flex-1 accent-white"
          />
          <button
            type="button"
            onClick={() => setZoom(view.zoom * 1.25)}
            aria-label="Yakınlaştır"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {!round && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-slate-400">Oran:</span>
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAspect(a.value)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  Math.abs(aspect - a.value) < 0.001 ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] font-bold text-slate-400 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Kırpmadan yükle
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={!nat || busy}
              className={`${accentClass} text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60`}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Kırp ve yükle
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
