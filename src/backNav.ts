// Geri tuşu (Android sistem geri tuşu, tarayıcı geri düğmesi, kaydırarak geri) yönetimi.
//
// Mantık:
//  • Bir pencere / detay ekranı açılınca geçmişe (history) bir giriş eklenir ve yığına (stack) kaydolur.
//  • Geri tuşuna basılınca (popstate) yığının en üstündeki pencere kapanır; sayfa/sekme değişmez.
//  • Pencere ekrandaki X ile kapatılırsa, eklenmiş geçmiş girişi sessizce geri alınır (history.back, ignore).
//  • Hiçbir pencere yokken: sekme geçmişi normal çalışır. Uygulamanın ilk girişine dönülünce
//    önce ana sayfaya gidilir, ana sayfadaysa "çıkmak için tekrar basın" uyarısı gösterilir;
//    2,5 saniye içinde ikinci kez basılırsa uygulamadan/sayfadan çıkılır.
//
// Bu dosya React'e bağlı değildir; useOverlayBack kancası aşağıdadır.
import { useEffect, useRef } from 'react';

interface Entry {
  id: string;
  close: () => void;
  hasEntry: boolean; // geçmişte bu pencereye ait bir giriş var mı
  afterClose?: () => void;
}

const stack: Entry[] = [];
let ignorePops = 0;
let pendingAfter: Array<() => void> = [];
let installed = false;

let exitHandler: null | (() => 'home-redirected' | 'confirm' | 'exit') = null;
let exitToast: (() => void) | null = null;
let lastBaseHit = 0;
const EXIT_WINDOW_MS = 2500;

const stateOf = () => (typeof history !== 'undefined' ? (history.state as any) : null);

function onPop(e: PopStateEvent) {
  // 1) Bizim sessiz geri almamızın sonucu
  if (ignorePops > 0) {
    ignorePops -= 1;
    e.stopImmediatePropagation();
    const fns = pendingAfter;
    pendingAfter = [];
    fns.forEach((f) => { try { f(); } catch { /* yok say */ } });
    return;
  }

  // 2) Açık pencere varsa: en üsttekini kapat, başka hiçbir şey yapma
  const top = stack.pop();
  if (top) {
    e.stopImmediatePropagation();
    top.hasEntry = false;
    try { top.close(); } finally { if (top.afterClose) { try { top.afterClose(); } catch { /* yok say */ } } }
    return;
  }

  // 3) Uygulamanın taban girişine ulaşıldı mı? (çıkış onayı)
  const st = stateOf();
  if (st && st.__base) {
    e.stopImmediatePropagation();
    const decision = exitHandler ? exitHandler() : 'confirm';
    if (decision === 'home-redirected') {
      history.pushState({ __guard: true }, '', location.href);
      return;
    }
    const now = Date.now();
    if (now - lastBaseHit <= EXIT_WINDOW_MS) {
      lastBaseHit = 0;
      history.back(); // gerçekten çık
      return;
    }
    lastBaseHit = now;
    if (exitToast) exitToast();
    history.pushState({ __guard: true }, '', location.href);
  }
}

/** Uygulama açılışında bir kez çağrılır: taban girişini işaretler ve koruma girişi ekler. */
export function installBackNav(opts: {
  /** Taban girişine dönüldüğünde: ana sayfada değilsek ana sayfaya yönlendir ve 'home-redirected' döndür; ana sayfadaysak 'confirm'. */
  onBase: () => 'home-redirected' | 'confirm' | 'exit';
  /** "Çıkmak için tekrar geri tuşuna basın" uyarısını göster. */
  showExitToast: () => void;
}) {
  exitHandler = opts.onBase;
  exitToast = opts.showExitToast;
  if (installed || typeof window === 'undefined') return;
  installed = true;
  history.replaceState({ ...(history.state || {}), __base: true }, '', location.href);
  history.pushState({ __guard: true }, '', location.href);
  window.addEventListener('popstate', onPop, true); // yakalama aşaması: diğer popstate dinleyicilerinden önce
}

/** Yığındaki açık pencere sayısı (test ve tanılama için). */
export function openOverlayCount() {
  return stack.length;
}

/**
 * Bir pencereyi geri tuşu yığınına kaydeder. Dönen fonksiyon, pencere EKRANDAN (X vb.) kapatıldığında çağrılır.
 *  - push: geçmişe giriş eklenir (varsayılan true)
 *  - url: eklenen girişin adresi (varsayılan: geçerli adres)
 *  - afterClose: pencere kapandıktan sonra (geri tuşuyla ya da ekrandan) çalışır, örn. adresi temizlemek için
 */
export function registerOverlay(
  id: string,
  close: () => void,
  opts: { push?: boolean; url?: string; afterClose?: () => void } = {}
): () => void {
  const push = opts.push !== false;
  const entry: Entry = { id, close, hasEntry: push, afterClose: opts.afterClose };
  stack.push(entry);
  if (push) {
    try {
      history.pushState({ __ov: id }, '', opts.url || location.href);
    } catch {
      entry.hasEntry = false;
    }
  }
  return () => {
    const idx = stack.indexOf(entry);
    if (idx === -1) return; // geri tuşuyla zaten kapandı
    const wasTop = idx === stack.length - 1;
    stack.splice(idx, 1);
    if (entry.hasEntry && wasTop) {
      ignorePops += 1;
      if (entry.afterClose) pendingAfter.push(entry.afterClose);
      history.back();
    } else if (entry.afterClose) {
      entry.afterClose();
    }
  };
}

/** Pencere açıkken (open=true) geri tuşuna bağlar. */
export function useOverlayBack(
  open: boolean,
  onClose: () => void,
  id: string,
  opts?: { push?: boolean; url?: () => string | undefined; afterClose?: () => void }
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  useEffect(() => {
    if (!open) return;
    const o = optsRef.current;
    return registerOverlay(id, () => closeRef.current(), {
      push: o?.push,
      url: o?.url ? o.url() : undefined,
      afterClose: o?.afterClose ? () => optsRef.current?.afterClose?.() : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);
}
