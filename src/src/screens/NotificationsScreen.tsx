// Ekran: NotificationsScreen (eski App.tsx 8265–8354)
import { Bell } from 'lucide-react';
import { useApp } from '../app/AppContext';

export function NotificationsScreen() {
  const {
    activeTab, setActiveTab, notifTab, setNotifTab, newsItems, handleOpenNewsDetail,
    allNotifications, handleMarkAllNotificationsRead, handleOpenDerivedNotification,
  } = useApp();
  return (
    <>
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                  Bildirimler
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mahallenizdeki son dakika gelişmeler ve duyurular.
              </p>
            </div>

            <button
              onClick={handleMarkAllNotificationsRead}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              Tümünü Okundu Say
            </button>
          </div>

          {/* Bildirim Filtreleri */}
          <div className="flex gap-2">
            {[
              { id: 'tumu', label: 'Tümü' },
              { id: 'unread', label: 'Okunmamış' },
              { id: 'duyuru', label: 'Duyurular' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setNotifTab(tab.id as any)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    notifTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bildirim Listesi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {allNotifications
              .filter((n: any) => notifTab === 'tumu' || (notifTab === 'unread' && !n.read) || (notifTab === 'duyuru' && n.type === 'duyuru'))
              .map((notif: any) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.target) {
                      handleOpenDerivedNotification(notif);
                    } else if (notif.type === 'sondakika') {
                      if (newsItems[0]) handleOpenNewsDetail(newsItems[0]);
                    } else if (notif.type === 'anket') {
                      setActiveTab('meclis');
                    } else if (notif.type === 'ilan') {
                      setActiveTab('market');
                    }
                  }}
                  className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-red-50/30' : ''
                    }`}
                >
                  <div className="text-2xl shrink-0 p-1">
                    {notif.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-md ${notif.badgeColor}`}>
                        {notif.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      {notif.title}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-2" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
