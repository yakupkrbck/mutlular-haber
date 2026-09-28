// Cloudinary (unsigned) fotoğraf yükleme yardımcıları.
// Eski Mutlular Haber uygulamasında kullanılan aynı hesap ve preset.
export const CLD_CLOUD = 'dn2wanvcr';
export const CLD_PRESET = 'mutlular_haber';

// Telefon fotoğrafları çok büyük olabilir; yüklemeden önce küçültüp sıkıştırır.
async function shrinkImage(file: File, maxSide = 1600, quality = 0.85): Promise<Blob | File> {
  try {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Lütfen bir fotoğraf dosyası seçiniz.');
  }
  const body = await shrinkImage(file);
  const endpoint = `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`;
  const fd = new FormData();
  fd.append('file', body);
  fd.append('upload_preset', CLD_PRESET);
  fd.append('folder', folder);

  let res: Response;
  try {
    res = await fetch(endpoint, { method: 'POST', body: fd });
  } catch (netErr: any) {
    throw new Error('Ağ hatası: ' + (netErr?.message || netErr));
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Cloudinary yanıt okunamadı (HTTP ' + res.status + ')');
  }

  if (data.secure_url) return data.secure_url as string;

  const errMsg: string = data.error?.message || JSON.stringify(data).substring(0, 200);
  if (errMsg.includes('preset')) {
    throw new Error('Cloudinary preset hatası: "' + CLD_PRESET + '" unsigned preset bulunamadı.');
  }
  throw new Error('Cloudinary: ' + errMsg);
}
