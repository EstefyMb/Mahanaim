import React from 'react';
import { 
  Layers, 
  Music, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  LogOut,
  X
} from 'lucide-react';
import ChurchEmblem from './ChurchEmblem';

export default function Sidebar({
  activeTab,
  setActiveTab,
  churchSettings,
  theme,
  onToggleTheme,
  onOpenSettingsModal,
  session,
  onLogout,
  filledCount = 0,
  totalSlotsCount = 5,
  totalSongsCount = 0,
  isOpenMobile,
  onCloseMobile
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Armador de Setlist',
      description: 'Estructura por Bloques',
      icon: Layers,
      badge: `${filledCount}/${totalSlotsCount}`,
      badgeColor: filledCount === totalSlotsCount && totalSlotsCount > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-midnight-800 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'viewer',
      label: 'Modo Atril',
      description: 'Acordes y transposición',
      icon: BookOpen
    },
    {
      id: 'repertoire',
      label: 'Repertorio Completo',
      description: 'Catálogo de alabanza y adoración',
      icon: Music,
      badge: `${totalSongsCount}`,
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-sky-400 border border-indigo-500/20'
    },
    {
      id: 'history',
      label: 'Histórico de Cultos',
      description: 'Auditoría de domingos',
      icon: Calendar
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0
        bg-white dark:bg-midnight-950 border-r border-slate-200 dark:border-midnight-800
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top: Church Branding Header */}
        <div className="p-5 border-b border-slate-200 dark:border-midnight-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ChurchEmblem settings={churchSettings} size="md" />
              <div className="min-w-0">
                <h1 className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">
                  {churchSettings?.name || 'Worship Manager'}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {churchSettings?.subtitle || 'Ministerio de Alabanza'}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle: Navigation Items */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menú Principal
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 dark:bg-midnight-900 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block truncate">{item.label}</span>
                    <span className={`text-[10px] block font-normal truncate ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Active Session & Logout Pinned to Bottom */}
        <div className="mt-auto sticky bottom-0 p-4 border-t border-slate-200 dark:border-midnight-800 bg-slate-50/95 dark:bg-midnight-950/95 backdrop-blur-md space-y-2.5 z-10">
          <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate font-mono">{session?.adminEmail || session?.email || 'equipo@alabanza.org'}</span>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                onCloseMobile?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all active:scale-[0.99]"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
