import React, { useState } from 'react';
import { 
  Wand2, 
  Save, 
  Trash2, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Music2,
  Plus,
  Flame,
  Heart,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { CATEGORIES, getRotationStatus } from '../mockData';

export default function SetlistBuilder({
  slots, // Array of { id, category: 'alabanza'|'adoracion', song: song|null }
  allSongs = [],
  serviceDate,
  setServiceDate,
  serviceNotes,
  setServiceNotes,
  onAssignSongToSlot,
  onClearSlotSong,
  onAddSlot,
  onRemoveSlot,
  onAutoSuggest,
  onPublishSetlist,
  onViewLyrics,
  onClearAllSlots,
  onReorderSlots,
  onMoveSlot
}) {
  const [selectedSlotForDrawer, setSelectedSlotForDrawer] = useState(null);
  const [draggedSlotId, setDraggedSlotId] = useState(null);
  const [dragOverSlotId, setDragOverSlotId] = useState(null);

  // Group slots into the 2 blocks
  const alabanzaSlots = slots.filter(s => s.category === 'alabanza');
  const adoracionSlots = slots.filter(s => s.category === 'adoracion');

  const filledSlots = slots.filter(s => Boolean(s.song));
  const filledCount = filledSlots.length;
  const totalSlotsCount = slots.length;
  const isComplete = totalSlotsCount > 0 && filledCount === totalSlotsCount;

  const alabanzaFilled = alabanzaSlots.filter(s => Boolean(s.song)).length;
  const adoracionFilled = adoracionSlots.filter(s => Boolean(s.song)).length;

  // Compute suggestions for a specific slot, ordered by oldest played first (Regla de Oro)
  const getSlotSuggestions = (category) => {
    const selectedIds = new Set(slots.filter(s => Boolean(s.song)).map(s => s.song.id));
    return allSongs
      .filter(s => s.category === category && !selectedIds.has(s.id))
      .sort((a, b) => {
        const aDays = a.daysAgo === null || a.daysAgo === undefined ? 999 : a.daysAgo;
        const bDays = b.daysAgo === null || b.daysAgo === undefined ? 999 : b.daysAgo;
        return bDays - aDays;
      })
      .slice(0, 6);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, slotId) => {
    e.dataTransfer.setData('text/plain', slotId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSlotId(slotId);
  };

  const handleDragOver = (e, slotId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotId !== slotId) {
      setDragOverSlotId(slotId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlotId(null);
  };

  const handleDrop = (e, targetSlotId) => {
    e.preventDefault();
    const sourceSlotId = e.dataTransfer.getData('text/plain') || draggedSlotId;
    if (sourceSlotId && sourceSlotId !== targetSlotId && onReorderSlots) {
      onReorderSlots(sourceSlotId, targetSlotId);
    }
    setDraggedSlotId(null);
    setDragOverSlotId(null);
  };

  const handleDragEnd = () => {
    setDraggedSlotId(null);
    setDragOverSlotId(null);
  };

  return (
    <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-5 md:p-6 flex flex-col h-full shadow-xl dark:shadow-2xl transition-colors duration-200 relative overflow-hidden">
      
      {/* Top Header */}
      <div className="relative pb-4 border-b border-slate-200 dark:border-midnight-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Lista de canciones
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            </p>
          </div>

          {filledCount > 0 && (
            <button
              onClick={onClearAllSlots}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Progress Bar & Badges */}
        <div className="mt-3.5 bg-slate-50 dark:bg-midnight-950/80 p-3 rounded-2xl border border-slate-200 dark:border-midnight-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {isComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> ¡Lista Completa ({filledCount} cantos listos)!
                </span>
              ) : (
                <span>
                  Progreso: <strong className="text-indigo-600 dark:text-sky-400">{filledCount} de {totalSlotsCount} cantos</strong>
                </span>
              )}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {alabanzaFilled}/{alabanzaSlots.length} Alabanzas · {adoracionFilled}/{adoracionSlots.length} Adoraciones
            </span>
          </div>

          {/* Dynamic visual segments */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalSlotsCount}, minmax(0, 1fr))` }}>
            {slots.map((slot, idx) => {
              const isFilled = Boolean(slot.song);
              const isAlabanza = slot.category === 'alabanza';
              return (
                <div 
                  key={slot.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isFilled 
                      ? isAlabanza
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-indigo-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                      : 'bg-slate-200 dark:bg-midnight-800'
                  }`}
                  title={`${slot.label || `Canto ${idx + 1}`}: ${isFilled ? slot.song.title : 'Vacío'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Fecha del Culto */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-midnight-950 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-midnight-800 flex-1">
            <Calendar className="w-4 h-4 text-indigo-500 dark:text-sky-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Fecha del Culto:</span>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none flex-1"
              title="Fecha del Culto"
            />
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline flex items-center gap-1">

          </span>
        </div>
      </div>

      {/* Auto-Suggest Button (Regla de Oro) */}
      <div className="my-3.5">
        <button
          onClick={onAutoSuggest}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:via-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.99] border border-indigo-400/30 group transition-all"
        >
          <Wand2 className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span> Auto-Sugerir lista</span>
        </button>
      </div>

      {/* Structured 2 Flexible Blocks List with Drag & Drop */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1 min-h-[380px]">
        
        {/* BLOQUE 1: ALABANZAS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>🔥 Primer tiempo</span>
            </span>
            
            <button
              onClick={() => onAddSlot('alabanza')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline px-2 py-0.5 rounded-lg hover:bg-amber-500/10 transition-colors"
              title="Añadir otra canción de Alabanza a este bloque"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Agregar Alabanza</span>
            </button>
          </div>

          {alabanzaSlots.map((slot, indexInBlock) => {
            const song = slot.song;
            const globalIndex = slots.findIndex(s => s.id === slot.id);
            const rotation = song ? getRotationStatus(song.daysAgo) : null;
            const canDeleteSlot = alabanzaSlots.length > 1;
            const isDragging = draggedSlotId === slot.id;
            const isDragOver = dragOverSlotId === slot.id;

            if (!song) {
              return (
                <div
                  key={slot.id}
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slot.id)}
                  className={`rounded-2xl border-2 border-dashed p-3 flex items-center justify-between gap-3 transition-all ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 scale-[1.01]' 
                      : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 hover:bg-amber-500/10'
                  }`}
                >
                  <div 
                    onClick={() => setSelectedSlotForDrawer({ ...slot, indexInBlock, globalIndex })}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                      {globalIndex + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        🔥 {indexInBlock + 1}ª Alabanza
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Haz clic para ver sugerencias descansadas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedSlotForDrawer({ ...slot, indexInBlock, globalIndex })}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    >
                      + Asignar
                    </button>
                    {canDeleteSlot && (
                      <button
                        onClick={() => onRemoveSlot(slot.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar este espacio"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, slot.id)}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id)}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-2xl p-3 flex items-center justify-between gap-3 border transition-all duration-150 select-none ${
                  isDragging 
                    ? 'opacity-40 scale-95 border-indigo-400 bg-indigo-50/20' 
                    : isDragOver
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/40 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-midnight-950/80 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
                }`}
              >
                {/* Drag Handle & Song Details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Grip Icon for Drag & Drop */}
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 shrink-0" 
                    title="Arrastra para cambiar el orden de la canción"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Slot Number */}
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shrink-0">
                    {globalIndex + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onViewLyrics?.(song)}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-sky-400 cursor-pointer truncate"
                        title={song.title}
                      >
                        {song.title}
                      </span>
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {song.originalKey}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[110px] sm:max-w-[140px]">{song.artist}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{indexInBlock + 1}ª Alabanza</span>
                      <span>•</span>
                      <span className={`inline-flex items-center gap-1 font-medium ${rotation.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rotation.dot}`}></span>
                        {song.daysAgo === null || song.daysAgo === undefined ? 'Nunca' : `${song.daysAgo}d`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Reorder Chevrons */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Up / Down Move buttons */}
                  {onMoveSlot && (
                    <div className="flex flex-col -space-y-1">
                      <button
                        onClick={() => onMoveSlot(slot.id, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                        title="Subir canción"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveSlot(slot.id, 'down')}
                        disabled={globalIndex === slots.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                        title="Bajar canción"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onViewLyrics?.(song)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                    title="Ver Letra y Acordes en Atril"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onClearSlotSong(slot.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    title="Vaciar espacio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {canDeleteSlot && (
                    <button
                      onClick={() => onRemoveSlot(slot.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Quitar este espacio del setlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BLOQUE 2: ADORACIONES */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-midnight-800">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-sky-400 flex items-center gap-1.5">
              <span>🕊️ Segundo tiempo</span>
            </span>

            <button
              onClick={() => onAddSlot('adoracion')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-sky-400 hover:text-indigo-700 hover:underline px-2 py-0.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
              title="Añadir otra canción de Adoración a este bloque"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Agregar Adoración</span>
            </button>
          </div>

          {adoracionSlots.map((slot, indexInBlock) => {
            const song = slot.song;
            const globalIndex = slots.findIndex(s => s.id === slot.id);
            const rotation = song ? getRotationStatus(song.daysAgo) : null;
            const canDeleteSlot = adoracionSlots.length > 1;
            const isDragging = draggedSlotId === slot.id;
            const isDragOver = dragOverSlotId === slot.id;

            if (!song) {
              return (
                <div
                  key={slot.id}
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slot.id)}
                  className={`rounded-2xl border-2 border-dashed p-3 flex items-center justify-between gap-3 transition-all ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 scale-[1.01]' 
                      : 'border-indigo-500/30 bg-indigo-50/5 hover:border-indigo-500/60 hover:bg-indigo-50/10'
                  }`}
                >
                  <div 
                    onClick={() => setSelectedSlotForDrawer({ ...slot, indexInBlock, globalIndex })}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
                      {globalIndex + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        🕊️ {indexInBlock + 1}ª Adoración
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Haz clic para ver sugerencias descansadas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedSlotForDrawer({ ...slot, indexInBlock, globalIndex })}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-50/10 text-indigo-600 dark:text-sky-400 hover:bg-indigo-500/20"
                    >
                      + Asignar
                    </button>
                    {canDeleteSlot && (
                      <button
                        onClick={() => onRemoveSlot(slot.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar este espacio"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, slot.id)}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id)}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-2xl p-3 flex items-center justify-between gap-3 border transition-all duration-150 select-none ${
                  isDragging 
                    ? 'opacity-40 scale-95 border-indigo-400 bg-indigo-50/20' 
                    : isDragOver
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/40 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-midnight-950/80 border-indigo-500/30 hover:border-indigo-500/60 shadow-sm'
                }`}
              >
                {/* Drag Handle & Song Details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Grip Icon for Drag & Drop */}
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-indigo-500 dark:hover:text-sky-400 shrink-0" 
                    title="Arrastra para cambiar el orden de la canción"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Slot Number */}
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/40 shrink-0">
                    {globalIndex + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onViewLyrics?.(song)}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-sky-400 cursor-pointer truncate"
                        title={song.title}
                      >
                        {song.title}
                      </span>
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {song.originalKey}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[110px] sm:max-w-[140px]">{song.artist}</span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-sky-400 font-semibold">{indexInBlock + 1}ª Adoración</span>
                      <span>•</span>
                      <span className={`inline-flex items-center gap-1 font-medium ${rotation.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rotation.dot}`}></span>
                        {song.daysAgo === null || song.daysAgo === undefined ? 'Nunca' : `${song.daysAgo}d`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Reorder Chevrons */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Up / Down Move buttons */}
                  {onMoveSlot && (
                    <div className="flex flex-col -space-y-1">
                      <button
                        onClick={() => onMoveSlot(slot.id, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                        title="Subir canción"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveSlot(slot.id, 'down')}
                        disabled={globalIndex === slots.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                        title="Bajar canción"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onViewLyrics?.(song)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-midnight-800 transition-colors"
                    title="Ver Letra y Acordes en Atril"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onClearSlotSong(slot.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                    title="Vaciar espacio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {canDeleteSlot && (
                    <button
                      onClick={() => onRemoveSlot(slot.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Quitar este espacio del setlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Suggestions Drawer Modal for a specific Slot */}
      {selectedSlotForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-md shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-midnight-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedSlotForDrawer.category === 'alabanza' ? '🔥' : '🕊️'}</span>
                  <span>Sugerencias para {selectedSlotForDrawer.indexInBlock + 1}ª {selectedSlotForDrawer.category === 'alabanza' ? 'Alabanza' : 'Adoración'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ordenadas de mayor a menor descanso
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForDrawer(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {getSlotSuggestions(selectedSlotForDrawer.category).map(song => (
                <div
                  key={song.id}
                  onClick={() => {
                    onAssignSongToSlot(song, selectedSlotForDrawer.id);
                    setSelectedSlotForDrawer(null);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-midnight-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-midnight-800 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{song.title}</span>
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-sky-400">({song.originalKey})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {song.artist} · <strong className="text-emerald-600 dark:text-emerald-400">{song.daysAgo ? `${song.daysAgo} días` : 'Nunca tocada'}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-sky-400">+ Asignar</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Action Button */}
      <div className="pt-3.5 mt-auto border-t border-slate-200 dark:border-midnight-800">
        <button
          onClick={onPublishSetlist}
          disabled={!isComplete}
          className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 active:scale-[0.99] ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 ring-2 ring-emerald-400/20'
              : 'bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>
            {isComplete 
              ? `Publicar lista` 
              : `Completa todos los cantos asignados (${filledCount}/${totalSlotsCount})`}
          </span>
        </button>
      </div>
    </div>
  );
}
