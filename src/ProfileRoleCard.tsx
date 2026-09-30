// Role göre "Benim Alanım" kartı (FAZ 3): her rolün profilinde yalnızca gerçekten var olan verileri gösterir.
import React from 'react';
import PhotoUploadField from './PhotoUploadField';
import type { UserProfile, ServiceRequest, ServiceOffer, EsnafCampaign } from './firebase';

export type RoleKind = 'admin' | 'editor' | 'usta' | 'esnaf' | 'sakin';

const REQ_STATUS: Record<string, string> = {
  open: 'Teklif bekleniyor',
  in_progress: 'İşlem devam ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi'
};
const OFFER_STATUS: Record<string, { t: string; c: string }> = {
  pending: { t: 'Beklemede', c: 'bg-amber-100 text-amber-800' },
  accepted: { t: 'Kabul edildi', c: 'bg-emerald-100 text-emerald-800' },
  rejected: { t: 'Reddedildi', c: 'bg-slate-100 text-slate-500' }
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500">{title}</h5>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">{children}</div>;
}

export function ProfileRoleCard({
  roleKind,
  profile,
  myRequests,
  offersByRequest,
  myOffers,
  myCampaigns,
  pendingCount,
  onOpenRequest,
  onOpenPanel,
  onGoTab,
  onAddSample,
  onRemoveSample,
  onOpenEdit
}: {
  roleKind: RoleKind;
  profile: UserProfile;
  myRequests: ServiceRequest[];
  offersByRequest: Record<string, ServiceOffer[]>;
  myOffers: ServiceOffer[];
  myCampaigns: EsnafCampaign[];
  pendingCount: number;
  onOpenRequest: (r: ServiceRequest) => void;
  onOpenPanel: () => void;
  onGoTab: (tab: string) => void;
  onAddSample: (url: string) => void;
  onRemoveSample: (url: string) => void;
  onOpenEdit: () => void;
}) {
  const samples: string[] = ((profile as any).ornekCalismalar as string[]) || [];
  const btn = 'text-xs font-black px-3.5 py-2 rounded-xl cursor-pointer transition-all';

  let title = 'Benim Alanım';
  let body: React.ReactNode = null;

  if (roleKind === 'sakin') {
    const received = myRequests.reduce((n, r) => n + (offersByRequest[r.id || '']?.length || 0), 0);
    title = '🏡 Taleplerim ve Tekliflerim';
    body = (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="text-xl font-black text-slate-900">{myRequests.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Hizmet talebim</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="text-xl font-black text-emerald-700">{received}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Aldığım teklif</div>
          </div>
        </div>
        <Section title="Son taleplerim">
          {myRequests.length === 0 ? (
            <Empty>Henüz hizmet talebi açmadın.</Empty>
          ) : (
            myRequests.slice(0, 5).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpenRequest(r)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">{r.baslik}</span>
                  <span className="text-[11px] text-slate-500 block">{REQ_STATUS[r.status as string] || 'Açık'}</span>
                </span>
                <span className="text-[11px] font-black text-orange-700 shrink-0">{offersByRequest[r.id || '']?.length || 0} teklif</span>
              </button>
            ))
          )}
        </Section>
        <button type="button" onClick={() => onGoTab('services')} className={`${btn} bg-orange-600 hover:bg-orange-700 text-white`}>
          Yeni hizmet talebi aç
        </button>
      </>
    );
  } else if (roleKind === 'usta') {
    const accepted = myOffers.filter((o) => o.status === 'accepted').length;
    title = '🛠️ Usta Alanım';
    body = (
      <>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="text-xl font-black text-slate-900">{myOffers.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Verilen teklif</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="text-xl font-black text-emerald-700">{accepted}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Kabul edilen</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="text-xl font-black text-amber-700">{profile.credits ?? 0}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Teklif kredisi</div>
          </div>
        </div>

        <Section title="Hizmet bilgilerim">
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <div><strong>Faaliyet alanı:</strong> {profile.esnafKategori || '—'}</div>
            <div><strong>Çalışma bölgesi:</strong> {profile.adres || '—'}</div>
            {profile.uzmanlikEtiketleri && profile.uzmanlikEtiketleri.length > 0 && (
              <div><strong>Uzmanlık:</strong> {profile.uzmanlikEtiketleri.join(', ')}</div>
            )}
          </div>
          <button type="button" onClick={onOpenEdit} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
            Bilgilerimi düzenle
          </button>
        </Section>

        <Section title="Son tekliflerim">
          {myOffers.length === 0 ? (
            <Empty>Henüz teklif vermedin. Hizmet sekmesindeki “Bana Uygun” taleplere teklif verebilirsin.</Empty>
          ) : (
            myOffers.slice(0, 5).map((o) => {
              const st = OFFER_STATUS[o.status] || OFFER_STATUS.pending;
              return (
                <div key={o.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="text-xs font-black text-slate-900 block truncate">{o.requestTitle || 'Hizmet talebi'}</span>
                    <span className="text-[11px] text-slate-500 block">{o.fiyat} TL</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${st.c}`}>{st.t}</span>
                </div>
              );
            })
          )}
        </Section>

        <Section title="Örnek çalışmalarım">
          {samples.length === 0 ? (
            <Empty>Yaptığın işlerin fotoğraflarını ekle, komşular seni daha kolay seçsin.</Empty>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {samples.map((u) => (
                <div key={u} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={u} alt="Örnek çalışma" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveSample(u)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-black cursor-pointer"
                    aria-label="Fotoğrafı kaldır"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {samples.length < 12 ? (
            <PhotoUploadField
              value=""
              onChange={(u: string) => {
                if (u) onAddSample(u);
              }}
              folder="mutlular_haber/ornek_calismalar"
              buttonLabel="Örnek çalışma fotoğrafı yükle"
              accentClass="bg-slate-900 hover:bg-slate-800 text-white"
            />
          ) : (
            <Empty>En fazla 12 fotoğraf ekleyebilirsin.</Empty>
          )}
        </Section>
      </>
    );
  } else if (roleKind === 'esnaf') {
    title = '🏪 İşletmem';
    body = (
      <>
        <Section title="İşletme bilgilerim">
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <div><strong>İşletme:</strong> {profile.isyeri || '—'}</div>
            <div><strong>Tür:</strong> {profile.esnafKategori || '—'}</div>
            <div><strong>Adres:</strong> {profile.adres || '—'}</div>
            <div><strong>Çalışma saatleri:</strong> {profile.calismaSaatleri || '—'}</div>
          </div>
          <button type="button" onClick={onOpenEdit} className={`${btn} bg-slate-100 hover:bg-slate-200 text-slate-800`}>
            İşletme bilgilerimi düzenle
          </button>
        </Section>
        <Section title={`Kampanyalarım (${myCampaigns.length})`}>
          {myCampaigns.length === 0 ? (
            <Empty>Henüz kampanya yayınlamadın.</Empty>
          ) : (
            myCampaigns.slice(0, 5).map((c) => (
              <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-900 truncate">
                {c.baslik}
              </div>
            ))
          )}
        </Section>
      </>
    );
  } else {
    const isAdmin = roleKind === 'admin';
    title = isAdmin ? '👑 Yönetim' : '✍️ Editör Masası';
    body = (
      <>
        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
          {isAdmin
            ? 'Kullanıcılar, roller, içerikler, vefat onayı, canlı yayın ve sosyal medya paylaşımı yönetim panelindedir.'
            : 'Haber, ihbar, vefat onayı, canlı yayın ve sosyal medya paylaşımı editör masasındadır. Şu an tüm içerik kategorilerinde yetkilisin; kategori bazlı kapsam FAZ 7’de gelecek.'}
        </div>
        <button type="button" onClick={onOpenPanel} className={`${btn} bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2`}>
          <span>{isAdmin ? 'Yönetim Paneline Git' : 'Editör Masasına Git'}</span>
          {pendingCount > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">{pendingCount}</span>}
        </button>
      </>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <h4 className="font-black text-base text-slate-900">{title}</h4>
      {body}
    </div>
  );
}

export default ProfileRoleCard;
