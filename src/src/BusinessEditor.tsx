// İşletme sayfası düzenleyici (FAZ 4): esnaf, herkese açık işletme sayfasının bilgilerini girer.
// Sayfa, admin onayından sonra esnaf rehberinde ve özel bağlantıda yayınlanır.
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import PhotoUploadField from './PhotoUploadField';
import type { Business } from './firebase';
import { ESNAF_TURLERI, DIGER_ALAN } from './serviceMatching';
import { cleanLiveUrl } from './liveStream';

export interface BusinessFormData {
  isyeri: string;
  kategori: string;
  aciklama: string;
  logoUrl: string;
  fotolar: string[];
  adres: string;
  calismaSaatleri: string;
  telefon: string;
  whatsapp: string;
  instagram: string;
  website: string;
}

const STATUS_TEXT: Record<string, { t: string; c: string; d: string }> = {
  pending: { t: '⏳ Onay bekliyor', c: 'bg-amber-50 border-amber-200 text-amber-900', d: 'Bilgileriniz yönetici tarafından inceleniyor. Onaylanınca sayfanız esnaf rehberinde yayınlanır.' },
  approved: { t: '✅ Yayında', c: 'bg-emerald-50 border-emerald-200 text-emerald-900', d: 'Sayfanız esnaf rehberinde görünüyor. Değişiklikleriniz hemen yansır.' },
  rejected: { t: '❌ Onaylanmadı', c: 'bg-red-50 border-red-200 text-red-900', d: 'Bilgileri düzeltip tekrar gönderebilirsiniz.' }
};

const digits = (s: string) => (s || '').replace(/\D/g, '');

export function BusinessEditor({
  open,
  initial,
  existing,
  onClose,
  onSave
}: {
  open: boolean;
  initial: BusinessFormData;
  existing: Business | null;
  onClose: () => void;
  onSave: (data: BusinessFormData) => Promise<boolean>;
}) {
  const [form, setForm] = useState<BusinessFormData>(initial);
  const [customKat, setCustomKat] = useState('');
  const [katChoice, setKatChoice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setError('');
    const known = ESNAF_TURLERI.includes(initial.kategori);
    setKatChoice(known ? initial.kategori : initial.kategori ? DIGER_ALAN : ESNAF_TURLERI[0]);
    setCustomKat(known ? '' : initial.kategori);
  }, [open]);

  if (!open) return null;

  const set = <K extends keyof BusinessFormData>(k: K, v: BusinessFormData[K]) => setForm((p) => ({ ...p, [k]: v }));
  const field = 'w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500';
  const label = 'text-[11px] font-bold text-slate-700 block mb-1';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kategori = katChoice === DIGER_ALAN ? customKat.replace(/\s+/g, ' ').trim() : katChoice;
    const data: BusinessFormData = {
      ...form,
      isyeri: form.isyeri.trim(),
      kategori,
      aciklama: form.aciklama.trim(),
      adres: form.adres.trim(),
      calismaSaatleri: form.calismaSaatleri.trim(),
      telefon: form.telefon.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim().replace(/^@/, ''),
      website: form.website.trim()
    };
    if (data.isyeri.length < 2) return setError('İşletme adını yazın.');
    if (kategori.length < 3) return setError('İşletme türünü seçin veya yazın (en az 3 harf).');
    if (data.aciklama.length < 10) return setError('İşletmenizi tanıtan kısa bir açıklama yazın (en az 10 karakter).');
    if (!data.adres) return setError('İşletme adresini yazın.');
    if (digits(data.telefon).length < 10) return setError('Geçerli bir telefon numarası yazın.');
    if (data.whatsapp && digits(data.whatsapp).length < 10) return setError('WhatsApp numarası geçersiz, boş bırakabilir veya düzeltebilirsiniz.');
    if (data.instagram && !/^[A-Za-z0-9._]{1,30}$/.test(data.instagram)) return setError('Instagram kullanıcı adı geçersiz (yalnızca harf, rakam, nokta ve alt çizgi).');
    if (data.website) {
      const clean = cleanLiveUrl(data.website);
      if (!clean) return setError('Web sitesi adresi geçerli bir https bağlantısı olmalı.');
      data.website = clean;
    }
    setError('');
    setSaving(true);
    const ok = await onSave(data);
    setSaving(false);
    if (ok) onClose();
  };

  const st = existing ? STATUS_TEXT[existing.approvalStatus] : null;

  return (
    <div className="fixed inset-0 z-[68] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col z-10">
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900">🏪 İşletme Sayfam</h3>
            <p className="text-[11px] text-slate-500">Esnaf rehberinde görünecek herkese açık bilgiler</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer" aria-label="Kapat">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {st && existing && (
            <div className={`rounded-2xl border p-3 text-xs ${st.c}`}>
              <div className="font-black">{st.t}</div>
              <div className="mt-0.5">{st.d}</div>
              {existing.approvalStatus === 'rejected' && existing.reviewNote && <div className="mt-1 font-bold">Not: {existing.reviewNote}</div>}
            </div>
          )}

          <div>
            <label className={label}>İşletme / Dükkan Adı *</label>
            <input className={field} value={form.isyeri} onChange={(e) => set('isyeri', e.target.value)} maxLength={80} />
          </div>

          <div>
            <label className={label}>İşletme Türü *</label>
            <select className={field} value={katChoice} onChange={(e) => setKatChoice(e.target.value)}>
              {ESNAF_TURLERI.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value={DIGER_ALAN}>➕ Diğer (kendim yazacağım)</option>
            </select>
            {katChoice === DIGER_ALAN && (
              <input className={`${field} mt-2`} value={customKat} onChange={(e) => setCustomKat(e.target.value)} maxLength={40} placeholder="Örn: Bisiklet Tamir Dükkanı" />
            )}
          </div>

          <div>
            <label className={label}>Tanıtım Açıklaması *</label>
            <textarea className={field} rows={3} value={form.aciklama} onChange={(e) => set('aciklama', e.target.value)} maxLength={600} placeholder="Ne satıyorsunuz, neyle öne çıkıyorsunuz?" />
          </div>

          <div>
            <label className={label}>Logo</label>
            <PhotoUploadField value={form.logoUrl} onChange={(u: string) => set('logoUrl', u)} folder="mutlular_haber/isletme_logo" buttonLabel="Logo Yükle" round accentClass="bg-emerald-600 hover:bg-emerald-700 text-white" />
          </div>

          <div>
            <label className={label}>İşletme Fotoğrafları (en fazla 6)</label>
            {form.fotolar.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {form.fotolar.map((u) => (
                  <div key={u} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={u} alt="İşletme" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => set('fotolar', form.fotolar.filter((x) => x !== u))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-black cursor-pointer" aria-label="Kaldır">×</button>
                  </div>
                ))}
              </div>
            )}
            {form.fotolar.length < 6 && (
              <PhotoUploadField
                value=""
                onChange={(u: string) => {
                  if (u) setForm((p) => (p.fotolar.length < 6 && !p.fotolar.includes(u) ? { ...p, fotolar: [...p.fotolar, u] } : p));
                }}
                folder="mutlular_haber/isletme"
                buttonLabel="Fotoğraf Ekle"
                accentClass="bg-slate-900 hover:bg-slate-800 text-white"
              />
            )}
          </div>

          <div>
            <label className={label}>Adres *</label>
            <input className={field} value={form.adres} onChange={(e) => set('adres', e.target.value)} maxLength={160} />
          </div>

          <div>
            <label className={label}>Çalışma Saatleri</label>
            <input className={field} value={form.calismaSaatleri} onChange={(e) => set('calismaSaatleri', e.target.value)} maxLength={100} placeholder="Pazartesi - Cumartesi: 08:30 - 19:30" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={label}>Telefon *</label>
              <input className={field} type="tel" inputMode="tel" value={form.telefon} onChange={(e) => set('telefon', e.target.value)} placeholder="05xx xxx xx xx" />
            </div>
            <div>
              <label className={label}>WhatsApp (opsiyonel)</label>
              <input className={field} type="tel" inputMode="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="Farklıysa yazın" />
            </div>
            <div>
              <label className={label}>Instagram (opsiyonel)</label>
              <input className={field} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="kullanici_adi" />
            </div>
            <div>
              <label className={label}>Web sitesi (opsiyonel)</label>
              <input className={field} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Bu sayfadaki telefon ve adres herkese açık yayınlanır. Ruhsat veya vergi levhası istenmez.
          </p>

          {error && <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm py-3 rounded-2xl cursor-pointer">
            {saving ? 'Kaydediliyor…' : !existing ? 'Onaya Gönder' : existing.approvalStatus === 'rejected' ? 'Düzelt ve Tekrar Gönder' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BusinessEditor;
