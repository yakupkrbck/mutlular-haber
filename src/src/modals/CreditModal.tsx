// Pencere: CreditModal (eski App.tsx 10192–10228)
import { X, MessageCircle } from 'lucide-react';
import { ADMIN_PHONE } from '../data/serviceCategories';
import { useApp } from '../app/AppContext';

export function CreditModal() {
  const {
    user, profile, showCreditModal, setShowCreditModal, openWhatsApp,
  } = useApp();
  return (
    <>
      {showCreditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900">Teklif Kredisi Satın Al</h3>
                <p className="text-xs text-gray-500">Koordinatör Onaylı WhatsApp Yüklemesi</p>
              </div>
              <button onClick={() => setShowCreditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                Kredi yüklemeleri mahalle koordinatörlüğü tarafından doğrudan onaylanır. 
                Butona tıkladığınızda yönetici WhatsApp hattı açılacak ve UID kodunuz otomatik iletilecektir.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px]">
                <span className="font-bold text-gray-700 block">Esnaf Bilgisi:</span>
                <span className="text-orange-700 font-bold">{profile?.name || 'Esnaf'}</span>
                <code className="text-gray-500 block font-mono text-[10px] mt-0.5">{user?.uid || 'esnaf_uid_101'}</code>
              </div>
            </div>

            <button
              onClick={() => {
                const text = `Merhaba Koordinatör, "${profile?.isyeri || profile?.name || 'Esnaf'}" olarak Dijital Mutlular teklif kredisi satın almak istiyorum. UID: ${user?.uid || 'demo_esnaf'}`;
                openWhatsApp(ADMIN_PHONE, text);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp ile Kredi Talep Et
            </button>
          </div>
        </div>
      )}
    </>
  );
}
