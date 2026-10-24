import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Music, 
  Flame, 
  Heart, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  Eye, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Filter
} from 'lucide-react';
import SongCard from './SongCard';
import { CATEGORIES, getRotationStatus } from '../mockData';

export default function FullRepertoireView({
  songs,
  selectedSongIds = new Set(),
  onAddToSetlist,
  onViewLyrics,
  onEditSong,
  onOpenNewSongModal,
  onDeleteSong
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRotation, setSelectedRotation] = useState('all');
  const [selectedKey, setSelectedKey] = useState('all');
  const [sortBy, setSortBy] = useState('rotation_desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Metric stats
  const stats = useMemo(() => {
    const total = songs.length;
    const alabanzas = songs.filter(s => s.category === 'alabanza').length;
    const adoraciones = songs.filter(s => s.category === 'adoracion').length;
    const ready = songs.filter(s => s.daysAgo === null || s.daysAgo === undefined || s.daysAgo > 28).length;
    const resting = songs.filter(s => s.daysAgo !== null && s.daysAgo !== undefined && s.daysAgo < 14).length;
    return { total, alabanzas, adoraciones, ready, resting };
  }, [songs]);

  // Keys present in repertoire
  const availableKeys = useMemo(() => {
    const keys = Array.from(new Set(songs.map(s => s.originalKey))).sort();
    return keys;
  }, [songs]);

  // Filter & Sort logic
  const filteredAndSortedSongs = useMemo(() => {
    return songs
      .filter(song => {
        // Search
        const q = searchTerm.toLowerCase();
        const matchesSearch = 
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          song.originalKey.toLowerCase().includes(q);
        if (!matchesSearch) return false;

        // Category
        if (selectedCategory !== 'all' && song.category !== selectedCategory) {
          return false;
        }

        // Key
        if (selectedKey !== 'all' && song.originalKey !== selectedKey) {
          return false;
        }

        // Rotation
        const days = song.daysAgo === null || song.daysAgo === undefined ? 999 : song.daysAgo;
        if (selectedRotation === 'green' && days <= 28) return false;
        if (selectedRotation === 'yellow' && (days < 14 || days > 28)) return false;
        if (selectedRotation === 'red' && days >= 14) return false;

        return true;
      })
      .sort((a, b) => {
        const aDays = a.daysAgo === null || a.daysAgo === undefined ? 999 : a.daysAgo;
        const bDays = b.daysAgo === null || b.daysAgo === undefined ? 999 : b.daysAgo;

        if (sortBy === 'rotation_desc') return bDays - aDays;
        if (sortBy === 'rotation_asc') return aDays - bDays;
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'artist_asc') return a.artist.localeCompare(b.artist);
        if (sortBy === 'key_asc') return a.originalKey.localeCompare(b.originalKey);
        return 0;
      });
  }, [songs, searchTerm, selectedCategory, selectedRotation, selectedKey, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedRotation('all');
    setSelectedKey('all');
    setSortBy('rotation_desc');
  };

  const hasFilters = searchTerm !== '' || selectedCategory !== 'all' || selectedRotation !== 'all' || selectedKey !== 'all' || sortBy !== 'rotation_desc';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-sky-400">
              <Music className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Biblioteca General de Canciones
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Repertorio completo para el ministerio de alabanza.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenNewSongModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Agregar Canción</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Repertorio</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">cantos registrados</span>
        </div>

        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block flex items-center gap-1">
            <span>🔥</span> Alabanza
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.alabanzas}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">tempo rápido</span>
        </div>

        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block flex items-center gap-1">
            <span>🕊️</span> Adoración
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-sky-400 mt-1">{stats.adoraciones}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">tempo íntimo</span>
        </div>

        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block flex items-center gap-1">
            <span>🟢</span> Óptima Rotación
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.ready}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">+28 días sin tocarse</span>
        </div>

        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block flex items-center gap-1">
            <span>🔴</span> Descansar
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.resting}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">&lt;14 días</span>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-5 shadow-xl space-y-4">
        
        {/* Row 1: Search & Sort & View Mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, artista o tono (ej. D, Bethel, Gracia)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="rotation_desc">✨ Más tiempo sin tocarse</option>
              <option value="rotation_asc">🕒 Más recientes primero</option>
              <option value="title_asc">🔤 Título A - Z</option>
              <option value="artist_asc">👤 Artista A - Z</option>
              <option value="key_asc">🎵 Tonalidad (C, D, E...)</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="md:col-span-2 flex items-center justify-end gap-1.5">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-midnight-950 p-1 rounded-2xl border border-slate-200 dark:border-midnight-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-midnight-900 text-indigo-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-midnight-900 text-indigo-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Vista en Tabla"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Filter Pills (Category, Key, Rotation) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-midnight-800/80">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-midnight-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Todos ({songs.length})
              </button>
              <button
                onClick={() => setSelectedCategory('alabanza')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'alabanza'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                <span>🔥 Alabanza ({stats.alabanzas})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('adoracion')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'adoracion'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20'
                }`}
              >
                <span>🕊️ Adoración ({stats.adoraciones})</span>
              </button>
            </div>

            {/* Rotation Semaphore Filter */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-midnight-800">
              <button
                onClick={() => setSelectedRotation(selectedRotation === 'green' ? 'all' : 'green')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  selectedRotation === 'green'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Óptimas ({stats.ready})</span>
              </button>
              <button
                onClick={() => setSelectedRotation(selectedRotation === 'red' ? 'all' : 'red')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  selectedRotation === 'red'
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Descansar ({stats.resting})</span>
              </button>
            </div>

            {/* Key Filter Dropdown */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-midnight-800">
              <span className="text-[11px] font-bold text-slate-400">Tono:</span>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="bg-slate-100 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Todos</option>
                {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 dark:text-sky-400 font-bold hover:underline"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering: Grid Mode or Table Mode */}
      {filteredAndSortedSongs.length === 0 ? (
        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-12 text-center text-slate-400">
          <Music className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron canciones</h3>
          <p className="text-xs text-slate-500 mt-1">Prueba cambiando los términos de búsqueda o los filtros de rotación.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md"
          >
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              isSelected={selectedSongIds.has(song.id)}
              onAddToSetlist={onAddToSetlist}
              onViewLyrics={onViewLyrics}
              onEditSong={onEditSong}
            />
          ))}
        </div>
      ) : (
        /* TABLE MODE */
        <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-midnight-950 border-b border-slate-200 dark:border-midnight-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Canción</th>
                  <th className="py-3.5 px-3">Tono Habitual</th>
                  <th className="py-3.5 px-3">Momento</th>
                  <th className="py-3.5 px-3">Última Vez Tocada</th>
                  <th className="py-3.5 px-3">Rotación</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/80">
                {filteredAndSortedSongs.map(song => {
                  const rotation = getRotationStatus(song.daysAgo);
                  const isSelected = selectedSongIds.has(song.id);
                  const isAlabanza = song.category === 'alabanza';
                  return (
                    <tr 
                      key={song.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-midnight-850/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => onViewLyrics(song)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-sky-400 cursor-pointer text-sm truncate max-w-xs"
                        >
                          {song.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {song.artist}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-black text-indigo-700 dark:text-indigo-300">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-500/30">
                          {song.originalKey}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isAlabanza 
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/10 text-indigo-700 dark:text-sky-300 border border-indigo-500/30'
                        }`}>
                          <span>{isAlabanza ? '🔥' : '🕊️'}</span>
                          <span>{isAlabanza ? 'Alabanza' : 'Adoración'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {song.lastPlayedDate || 'Sin registro'}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${rotation.bg} ${rotation.text} ${rotation.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rotation.dot}`}></span>
                          <span>
                            {song.daysAgo === null || song.daysAgo === undefined 
                              ? 'Nunca' 
                              : song.daysAgo === 0 
                                ? 'Hoy' 
                                : `${song.daysAgo}d`}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewLyrics(song)}
                            title="Ver en Modo Atril"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditSong(song)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAddToSetlist(song)}
                            disabled={isSelected}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                              isSelected
                                ? 'bg-slate-100 dark:bg-midnight-800 text-emerald-600 dark:text-emerald-400'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                            }`}
                          >
                            {isSelected ? 'En Setlist' : '+ Setlist'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
