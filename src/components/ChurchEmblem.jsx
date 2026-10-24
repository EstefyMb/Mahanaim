import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export const EMBLEM_PRESETS = [
  { id: 'harp', label: 'Arpa de Alabanza', description: 'Símbolo davídico de adoración' },
  { id: 'cross', label: 'Cruz Celestial', description: 'Gracia y salvación central' },
  { id: 'flame', label: 'Fuego del Espíritu', description: 'Avivamiento y júbilo' },
  { id: 'dove', label: 'Paloma de Paz', description: 'Consolador e intimidad' },
  { id: 'crown', label: 'Corona del Rey', description: 'Cristo Rey de Reyes' },
  { id: 'star', label: 'Luz Celestial', description: 'Estrella resplandeciente' }
];

export default function ChurchEmblem({ settings, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-20 h-20 rounded-3xl'
  };

  const containerClasses = `${sizeMap[size] || sizeMap.md} flex items-center justify-center relative overflow-hidden shrink-0 ${className}`;

  if (settings?.logoType === 'custom' && settings?.customLogoUrl) {
    return (
      <div className={`${containerClasses} bg-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-600/20`}>
        <img 
          src={settings.customLogoUrl} 
          alt={settings.name || 'Logo Iglesia'} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Presets vectoriales con gradientes y sombras celestiales
  const preset = settings?.logoPreset || 'harp';

  const renderIcon = () => {
    switch (preset) {
      case 'cross':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18M7 8h10" />
          </svg>
        );
      case 'flame':
        return <Flame className="w-3/5 h-3/5 text-amber-300" />;
      case 'dove':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" />
            <path d="M18 9a5 5 0 0 0-5-5H9" />
            <path d="M22 6s-4 1-5 4c-1 3-3 4-5 4" />
          </svg>
        );
      case 'crown':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        );
      case 'star':
        return <Sparkles className="w-3/5 h-3/5 text-amber-300" />;
      case 'harp':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.4" />
            <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.4" />
          </svg>
        );
    }
  };

  return (
    <div className={`${containerClasses} bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/25`}>
      {renderIcon()}
    </div>
  );
}
