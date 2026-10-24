import React from 'react';
import { Plus, Check, Eye, Edit3 } from 'lucide-react';
import { CATEGORIES, getRotationStatus } from '../mockData';

export default function SongCard({
  song,
  isSelected,
  onAddToSetlist,
  onViewLyrics,
  onEditSong
}) {
  const categoryInfo = CATEGORIES[song.category] || CATEGORIES.alabanza;
  const rotation = getRotationStatus(song.daysAgo);
  const isAlabanza = song.category === 'alabanza';

  return (
    <div className={`group relative rounded-2xl p-4 transition-all duration-200 border ${
      isSelected 
        ? 'bg-indigo-50/70 dark:bg-midnight-900 border-indigo-500/70 shadow-lg shadow-indigo-950/20 ring-1 ring-indigo-500/40' 
        : 'bg-white dark:bg-midnight-900/80 hover:bg-slate-50 dark:hover:bg-midnight-850 border-slate-200 dark:border-midnight-800 hover:border-slate-300 dark:hover:border-midnight-700 shadow-sm hover:shadow-md'
    }`}>
      {/* Visual Accent Glow on Hover */}
      <div 
        className={`absolute inset-y-3 left-0 w-1.5 rounded-r-full transition-all duration-300 ${
          isAlabanza 
            ? 'bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.4)]' 
            : 'bg-gradient-to-b from-indigo-500 to-sky-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
        }`}
      />

      <div className="flex items-center justify-between gap-3 pl-2.5">
        <div className="flex-1 min-w-0">
          {/* Header Row: Title & Key */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 
              onClick={() => onViewLyrics?.(song)}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-sky-400 cursor-pointer transition-colors truncate tracking-tight"
              title={song.title}
            >
              {song.title}
            </h3>
            
            {/* Tone/Key Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black font-mono bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm">
              Tono {song.originalKey}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
            {song.artist}
          </p>

          {/* Badges Row: Category & Rotation Status */}
          <div className="flex items-center flex-wrap gap-2 mt-2.5 text-xs">
            {/* Category Badge (Only 2 types: Alabanza or Adoración) */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryInfo.badgeClass}`}>
              <span>{categoryInfo.emoji}</span>
              <span>{categoryInfo.name}</span>
            </span>

            {/* Rotation Semaphore */}
            <div 
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${rotation.bg} ${rotation.text} ${rotation.border}`}
              title={`Última vez tocada: ${song.lastPlayedDate || 'Sin registro'}`}
            >
              <span className={`w-2 h-2 rounded-full ${rotation.dot} ${rotation.id === 'green' ? 'animate-pulse' : ''}`}></span>
              <span>
                {song.daysAgo === null || song.daysAgo === undefined 
                  ? 'Nunca tocada' 
                  : song.daysAgo === 0 
                    ? 'Tocada hoy' 
                    : `${song.daysAgo} días`}
              </span>
              <span className="text-[11px] opacity-75 hidden sm:inline">· {rotation.label}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-center shrink-0">
          {/* Edit Song Button */}
          {onEditSong && (
            <button
              onClick={() => onEditSong(song)}
              title="Editar datos de la canción"
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-midnight-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Preview / Lyrics Button */}
          {onViewLyrics && (
            <button
              onClick={() => onViewLyrics(song)}
              title="Ver en Modo Atril"
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-midnight-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Quick Add / Select Button */}
          <button
            onClick={() => onAddToSetlist?.(song)}
            disabled={isSelected}
            title={isSelected ? 'Ya está seleccionada en la lista' : `Agregar a ${categoryInfo.name}`}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl font-bold text-xs transition-all duration-150 ${
              isSelected
                ? 'bg-slate-100 dark:bg-midnight-800 text-emerald-600 dark:text-emerald-400 cursor-not-allowed border border-emerald-500/30'
                : isAlabanza
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-orange-500/20 active:scale-95'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 active:scale-95'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Asignada</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
