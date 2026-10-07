import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Loader2, RefreshCw, X } from 'lucide-react';
import { useOverlayBack } from './backNav';

// Doğrudan cihaz kamerasından fotoğraf çekme penceresi.
// Çekilen kare File olarak üst bileşene verilir (orada kırpma ve yükleme akışına girer).
// Kamera açılamazsa (izin yok, kamera yok, güvenli bağlantı değil) onUnavailable çağrılır;
// üst bileşen bu durumda cihazın kendi kamera/dosya seçicisine yönlendirir.

interface CameraCaptureModalProps {
  /** 'environment' = arka kamera (varsayılan), 'user' = ön kamera (profil fotoğrafı) */
  facing?: 'environment' | 'user';
  onCapture: (file: File) => void;
  onCancel: () => void;
  onUnavailable: () => void;
}

const MAX_SIDE = 1920;

export default function CameraCaptureModal({
  facing = 'environment',
  onCapture,
  onCancel,
  onUnavailable,
}: CameraCaptureModalProps) {
  // Geri tuşu bu pencereyi kapatır
  useOverlayBack(true, onCancel, 'kamera');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<'environment' | 'user'>(facing);
  const [ready, setReady] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);
  const [busy, setBusy] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Kamerayı başlat (mod değişince yeniden)
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    stopStream();
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    if (!md || typeof md.getUserMedia !== 'function') {
      onUnavailable();
      return;
    }
    md.getUserMedia({
      video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.play().catch(() => {});
        }
        md.enumerateDevices()
          .then((list) => !cancelled && setCanSwitch(list.filter((d) => d.kind === 'videoinput').length > 1))
          .catch(() => {});
      })
      .catch(() => {
        if (!cancelled) onUnavailable();
      });
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Arka sayfa kaymasın, Escape kapatsın
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !ready || busy) return;
    setBusy(true);
    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;
    const k = Math.min(1, MAX_SIDE / Math.max(vw, vh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vw * k);
    canvas.height = Math.round(vh * k);
    const ctx = canvas.getContext('2d');
    if (!ctx) { setBusy(false); onUnavailable(); return; }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (!blob) { onUnavailable(); return; }
        stopStream();
        onCapture(new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.9
    );
  };

  // İçindeki tıklamalar, onu içeren üst pencerenin "dışarı tıkla kapat" davranışına ulaşmasın.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={stop}
      onMouseDown={stop}
      onMouseUp={stop}
      onTouchStart={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
      onPointerUp={stop}
      role="dialog"
      aria-modal="true"
      aria-label="Kamera ile fotoğraf çek"
    >
      <div className="w-full max-w-[480px] bg-slate-900 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Kamera</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Vazgeç"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative rounded-xl bg-slate-950 overflow-hidden aspect-[4/3] flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setReady(true)}
            className="w-full h-full object-cover"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="w-10 h-10" />
          <button
            type="button"
            onClick={shoot}
            disabled={!ready || busy}
            aria-label="Fotoğraf çek"
            className="w-16 h-16 rounded-full bg-white ring-4 ring-white/30 hover:ring-white/50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            {busy ? <Loader2 className="w-6 h-6 animate-spin text-slate-900" /> : <span className="w-12 h-12 rounded-full border-2 border-slate-900" />}
          </button>
          {canSwitch ? (
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'environment' ? 'user' : 'environment'))}
              aria-label="Kamerayı çevir"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
