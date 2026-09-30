// Kategori bazlı bildirim tercihleri (FAZ 3).
import React from 'react';
import { NOTIF_CATEGORIES, type NotifPrefs, type NotifCategory } from './notifications';

export function NotificationPrefsCard({
  prefs,
  onChange,
  isUsta,
  masterEnabled
}: {
  prefs: NotifPrefs;
  onChange: (next: NotifPrefs) => void;
  isUsta: boolean;
  masterEnabled: boolean;
}) {
  const toggle = (k: NotifCategory) => onChange({ ...prefs, [k]: !prefs[k] });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Hangi bildirimleri almak istiyorsunuz?</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Seçmediğiniz kategoriler için bildirim gelmez. İçeriklerin hepsini uygulamadan her zaman görebilirsiniz.
        </p>
        {!masterEnabled && (
          <p className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
            Genel anahtar kapalı, hiçbir bildirim gelmiyor. Aşağıdaki “Anlık Bildirimler” anahtarını açın.
          </p>
        )}
      </div>

      <div className="space-y-2">
        {NOTIF_CATEGORIES.filter((c) => c.audience !== 'usta' || isUsta).map((c) => {
          const soon = c.audience === 'soon';
          const on = prefs[c.key] && !soon;
          return (
            <div
              key={c.key}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${soon ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{c.emoji}</span>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block">{c.label}</span>
                  <span className="text-[11px] text-slate-500 block">{c.desc}</span>
                </div>
              </div>
              <button
                type="button"
                disabled={soon}
                onClick={() => toggle(c.key)}
                aria-pressed={on}
                aria-label={c.label}
                className={`w-12 h-6 flex items-center rounded-full p-1 shrink-0 transition-colors duration-300 ${soon ? 'cursor-not-allowed' : 'cursor-pointer'} ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${on ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPrefsCard;
