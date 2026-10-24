import React, { useState, useMemo } from 'react';
import { Search, Music2, ArrowUpDown, Sparkles } from 'lucide-react';
import SongCard from './SongCard';
import { CATEGORIES } from '../mockData';

export default function RepertoireExplorer({
  songs,
  selectedSongIds = new Set(),
  onAddToSetlist,
  onViewLyrics,
  onEditSong
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRotation, setSelectedRotation] = useState('all');
  const [sortBy, setSortBy] = useState('rotation_desc'); // Default: Regla de oro (más tiempo sin tocarse primero)

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    return songs
      .filter(song => {
        // Search term
        const matchesSearch = 
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.originalKey.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        // Category filter (alabanza or adoracion)
        if (selectedCategory !== 'all' && song.category !== selectedCategory) {
          return false;
        }

        // Rotation filter
        const days = song.daysAgo === null || song.daysAgo === undefined ? 999 : song.daysAgo;
        if (selectedRotation === 'green' && days <= 28) return false;
        if (selectedRotation === 'yellow' && (days < 14 || days > 28)) return false;
        if (selectedRotation === 'red' && days >= 14) return false;

        return true;
      })
      .sort((a, b) => {
        const aDays = a.daysAgo === null || a.daysAgo === undefined ? 999 : a.daysAgo;
        const bDays = b.daysAgo === null || b.daysAgo === undefined ? 999 : b.daysAgo;

        if (sortBy === 'rotation_desc') {
          // Más tiempo sin tocarse primero (Regla de Oro)
          return bDays - aDays;
        }
        if (sortBy === 'rotation_asc') {
          // Tocadas más recientemente primero
          return aDays - bDays;
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'key_asc') {
          return a.originalKey.localeCompare(b.originalKey);
        }
        return 0;
      });
  }, [songs, searchTerm, selectedCategory, selectedRotation, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedRotation('all');
    setSortBy('rotation_desc');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || selectedRotation !== 'all' || sortBy !== 'rotation_desc';

  return (
    <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-5 md:p-6 flex flex-col h-full shadow-xl dark:shadow-2xl transition-colors duration-200">
      
      {/* Header & Search */}
      <div className="pb-4 border-b border-slate-200 dark:border-midnight-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
              <span>Repertorio General</span>
              <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {filteredAndSortedSongs.length} de {songs.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Filtra y ordena por la regla de oro: canciones más descansadas primero.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 dark:text-sky-400 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              Restablecer
            </button>
          )}
        </div>

        {/* Search Input & Sort Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, artista o tono (ej. D, Bethel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
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
          <div className="sm:col-span-5 relative">
            <div className="flex items-center gap-1.5 h-full">
              <span className="text-slate-400 text-xs hidden sm:inline"><ArrowUpDown className="w-3.5 h-3.5" /></span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="rotation_desc">✨ Más tiempo sin tocarse</option>
                <option value="rotation_asc">🕒 Más recientes primero</option>
                <option value="title_asc">🔤 Título A - Z</option>
                <option value="key_asc">🎵 Tonalidad (C, D, E...)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs (Momento & Rotación) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Moments */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-midnight-950 dark:text-slate-400 dark:hover:bg-midnight-850'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('alabanza')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCategory === 'alabanza'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span>🔥 Alabanza</span>
              <span className="text-[10px] opacity-75">(3 cantos)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('adoracion')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCategory === 'adoracion'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20'
              }`}
            >
              <span>🕊️ Adoración</span>
              <span className="text-[10px] opacity-75">(2 cantos)</span>
            </button>
          </div>

          {/* Rotation Semaphore Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedRotation(selectedRotation === 'green' ? 'all' : 'green')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                selectedRotation === 'green'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Filtrar por canciones listas (>28 días)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Óptimas</span>
            </button>
            <button
              onClick={() => setSelectedRotation(selectedRotation === 'red' ? 'all' : 'red')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                selectedRotation === 'red'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title="Filtrar canciones que requieren descanso (<14 días)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Descansar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song Cards List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 min-h-[400px]">
        {filteredAndSortedSongs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No se encontraron cantos con los filtros actuales.</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-xs text-indigo-600 dark:text-sky-400 font-bold underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          filteredAndSortedSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isSelected={selectedSongIds.has(song.id)}
              onAddToSetlist={onAddToSetlist}
              onViewLyrics={onViewLyrics}
              onEditSong={onEditSong}
            />
          ))
        )}
      </div>
    </div>
  );
}
