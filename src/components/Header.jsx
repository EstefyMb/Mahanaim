import React from 'react';
import { 
  Menu, 
  Calendar, 
  Moon, 
  Sun, 
  Settings2, 
  Plus, 
  ShieldCheck 
} from 'lucide-react';
import ChurchEmblem from './ChurchEmblem';

export default function Header({
  activeTab,
  onOpenMobileSidebar,
  onOpenNewSongModal,
  onOpenSettingsModal,
  theme,
  onToggleTheme,
  churchSettings,
  filledCount = 0
}) {
  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToSunday = (7 - dayOfWeek) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + distanceToSunday);
    return nextSunday.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const nextSundayFormatted = getNextSunday();

  const tabTitles = {
    dashboard: 'Armador de Setlist (Regla de Oro)',
    repertoire: 'Repertorio General de Canciones',
    viewer: 'Modo Atril (Letras & Acordes)',
    history: 'Histórico de Cultos Dominicales'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-md border-b border-slate-200 dark:border-midnight-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Hamburger & Active Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-900 lg:hidden border border-slate-200 dark:border-midnight-800"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {tabTitles[activeTab] || 'Worship Manager'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
              <span className="capitalize">
                Próximo Culto: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{nextSundayFormatted}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            title={`Cambiar a ${theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}`}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-midnight-900 dark:hover:bg-midnight-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-midnight-800 transition-all active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettingsModal}
            title="Configuración de Iglesia & Perfil"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-midnight-900 dark:hover:bg-midnight-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-midnight-800 transition-all active:scale-95"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
