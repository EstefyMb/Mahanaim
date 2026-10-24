import React from 'react';
import { Calendar, Copy, Eye, Music2 } from 'lucide-react';
import { CATEGORIES } from '../mockData';

export default function SundayHistory({
  history,
  onLoadHistoricalSetlist,
  onViewSongLyrics
}) {
  return (
    <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-2xl transition-colors duration-200">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-midnight-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
            <span>Histórico de Cultos Dominicales</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro automático de cultos y auditoría de rotación del repertorio.
          </p>
        </div>

        <div className="text-xs font-mono font-bold bg-slate-100 dark:bg-midnight-950 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-midnight-800">
          Cultos guardados: <span className="text-indigo-600 dark:text-sky-400 font-extrabold">{history.length}</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative mt-8 space-y-8 before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-midnight-800">
        {history.map((record, index) => (
          <div key={record.id} className="relative flex items-start gap-6 group">
            {/* Timeline Dot */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-transform duration-200 group-hover:scale-110 shadow-lg ${
              index === 0 
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 border-indigo-300 text-white shadow-indigo-500/30' 
                : 'bg-white dark:bg-midnight-900 border-slate-300 dark:border-midnight-700 text-slate-400'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            </div>

            {/* Sunday Card */}
            <div className="flex-1 bg-slate-50 dark:bg-midnight-950/80 hover:bg-slate-100/80 dark:hover:bg-midnight-950 border border-slate-200 dark:border-midnight-800 rounded-2xl p-5 md:p-6 transition-all shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-midnight-800">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {record.date}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-sky-300 border border-indigo-500/20">
                      {record.setlist?.length || 0} cantos
                    </span>
                    {record.relativeDays && (
                      <span className="text-xs font-medium text-slate-400">
                        ({record.relativeDays})
                      </span>
                    )}
                  </div>

                  {record.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                      {record.notes}
                    </p>
                  )}
                </div>

                {/* Quick Action: Re-use setlist */}
                {onLoadHistoricalSetlist && (
                  <button
                    onClick={() => onLoadHistoricalSetlist(record)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-midnight-900 hover:bg-indigo-50 dark:hover:bg-midnight-800 text-indigo-600 dark:text-sky-400 border border-slate-200 dark:border-midnight-700 transition-all shadow-sm"
                    title="Cargar esta estructura de cantos en el Armador"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Usar como Plantilla</span>
                  </button>
                )}
              </div>

              {/* Songs Breakdown (Supports any number of songs) */}
              <div className="mt-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                  <span>Cantos del Servicio:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Clic para ver acordes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {record.setlist.map((item, idx) => {
                    const isAlabanza = item.category === 'alabanza';
                    return (
                      <div
                        key={idx}
                        onClick={() => onViewSongLyrics?.(item.songId)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group/song ${
                          isAlabanza
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
                            : 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono border ${
                            isAlabanza 
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30' 
                              : 'bg-indigo-500/20 text-indigo-600 dark:text-sky-300 border-indigo-500/30'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/song:text-indigo-600 dark:group-hover/song:text-sky-400 truncate block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                              {isAlabanza ? '🔥 Alabanza' : '🕊️ Adoración'}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-white dark:bg-midnight-900 text-indigo-600 dark:text-sky-400 border border-slate-200 dark:border-midnight-800 shrink-0">
                          {item.key}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
