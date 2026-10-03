import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadToCloudinary } from './cloudinary';
import ImageCropModal from './ImageCropModal';

interface PhotoUploadFieldProps {
  /** Kontrollü kullanım: mevcut fotoğraf adresi */
  value?: string;
  /** Kontrollü kullanım: yükleme bitince / silinince çağrılır */
  onChange?: (url: string) => void;
  /** Form (FormData) ile okunan alanlar için: gizli input adı */
  name?: string;
  /** Form alanları için başlangıç değeri */
  defaultValue?: string;
  /** Cloudinary klasörü, örn. 'mutlular_haber/haberler' */
  folder: string;
  /** Yükle butonunun yazısı */
  buttonLabel?: string;
  /** Küçük önizleme için yuvarlak (avatar) kullan */
  round?: boolean;
  /** Örn. 'focus:border-blue-500' yerine buton rengi */
  accentClass?: string;
  /** Kırpma penceresinin başlangıç oranı (genişlik / yükseklik). Varsayılan 4:3; yuvarlak alanda kare. */
  aspect?: number;
}

export default function PhotoUploadField({
  value,
  onChange,
  name,
  defaultValue = '',
  folder,
  buttonLabel = 'Fotoğraf Yükle',
  round = false,
  accentClass = 'bg-slate-900 hover:bg-slate-800 text-white',
  aspect = 4 / 3,
}: PhotoUploadFieldProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const current = isControlled ? (value as string) : inner;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Seçilen fotoğraf önce yakınlaştırma/kırpma penceresinde açılır; yükleme onaydan sonra başlar.
  const [cropFile, setCropFile] = useState<File | null>(null);

  const setUrl = (url: string) => {
    if (!isControlled) setInner(url);
    onChange?.(url);
  };

  const upload = async (file: File) => {
    setCropFile(null);
    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, folder);
      setUrl(url);
    } catch (e: any) {
      setError(e?.message || 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file?: File | null) => {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir fotoğraf dosyası seçiniz.');
      return;
    }
    // GIF / SVG kırpılamaz (hareket ve vektör kaybolur): doğrudan yüklenir.
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      upload(file);
      return;
    }
    setCropFile(file);
  };

  return (
    <div className="space-y-2">
      {name && <input type="hidden" name={name} value={current} />}
      <div className="flex items-center gap-3">
        {current ? (
          <div className="relative shrink-0">
            <img
              src={current}
              alt="Seçilen fotoğraf"
              className={`w-16 h-16 object-cover border border-slate-200 ${round ? 'rounded-full' : 'rounded-xl'}`}
            />
            <button
              type="button"
              onClick={() => setUrl('')}
              aria-label="Fotoğrafı kaldır"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`${accentClass} font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60`}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploading ? 'Yükleniyor...' : current ? 'Fotoğrafı Değiştir' : buttonLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          initialAspect={aspect}
          round={round}
          accentClass={accentClass}
          onCancel={() => setCropFile(null)}
          onDone={(cropped) => upload(cropped)}
          onSkip={() => upload(cropFile)}
        />
      )}
    </div>
  );
}
