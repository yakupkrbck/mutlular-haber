// Birden fazla faaliyet alanı seçimi (etiket sistemi). Seçenekler yalnızca yöneticinin yönettiği standart listedendir.
import { X } from 'lucide-react';

export function AreaMultiSelect({
  options,
  primary,
  value,
  onChange,
  max = 8,
}: {
  options: string[];
  /** Ana faaliyet alanı (ayrıca seçilemez, listede gösterilmez) */
  primary: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const available = options.filter((o) => o !== primary && !value.includes(o));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {primary && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black" title="Ana faaliyet alanı">
            ★ {primary}
          </span>
        )}
        {value.map((a) => (
          <span key={a} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-300">
            {a}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== a))}
              aria-label={`${a} alanını kaldır`}
              className="w-4 h-4 rounded-full hover:bg-amber-200 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {value.length + 1 < max ? (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onChange([...value, e.target.value]);
          }}
          className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
          aria-label="Ek faaliyet alanı ekle"
        >
          <option value="">➕ Ek faaliyet alanı ekle…</option>
          {available.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <p className="text-[10px] text-slate-500">En fazla {max} faaliyet alanı seçebilirsiniz.</p>
      )}
      <p className="text-[10px] text-amber-900/80 leading-snug">Birden fazla alanda hizmet veriyorsanız ek alanları ekleyin; bu alanlardaki taleplerde size de teklif gelir.</p>
    </div>
  );
}
