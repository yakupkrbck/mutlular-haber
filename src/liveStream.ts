// Canlı yayın bağlantısını güvenli bir gömme (embed) adresine çevirir.
// Desteklenenler: YouTube (video, /live/, kanal /live), Facebook video, Vimeo. Diğer bağlantılar "Yayını Aç" düğmesiyle dışarıda açılır.

export interface LiveConfig {
  aktif: boolean;
  baslik: string;
  aciklama: string;
  url: string;
  updatedAt?: any;
}

export const EMPTY_LIVE: LiveConfig = { aktif: false, baslik: '', aciklama: '', url: '' };

/** Yalnızca https bağlantılarını kabul eder; geçersizse null döner. */
export function cleanLiveUrl(raw: string): string | null {
  const t = (raw || '').trim();
  if (!t) return null;
  try {
    const u = new URL(t.startsWith('http') ? t : 'https://' + t);
    if (u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function toEmbedUrl(raw: string): string | null {
  const clean = cleanLiveUrl(raw);
  if (!clean) return null;
  const u = new URL(clean);
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  const path = u.pathname;

  if (host === 'youtu.be') {
    const id = path.split('/')[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0`;
    const m = path.match(/^\/(?:live|embed|shorts)\/([\w-]{6,})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
    const ch = path.match(/^\/channel\/(UC[\w-]+)\/live/);
    if (ch) return `https://www.youtube-nocookie.com/embed/live_stream?channel=${ch[1]}&autoplay=1&rel=0`;
    return null;
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false&autoplay=true`;
  }
  if (host === 'vimeo.com') {
    const id = path.split('/').filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
  }
  return null;
}
