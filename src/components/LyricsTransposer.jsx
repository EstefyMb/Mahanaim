import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  RotateCcw, 
  Edit3, 
  Play, 
  Pause, 
  Music, 
  Copy, 
  Check, 
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart
} from 'lucide-react';
import { 
  transposeChord, 
  transposeLyricsAndChords, 
  getSemitonesDifference,
  CHROMATIC_SCALE_SHARPS,
  CATEGORIES 
} from '../mockData';

export default function LyricsTransposer({
  song,
  allSongs = [],
  currentSetlist = [], // slots array
  onSelectSong,
  onBack,
  onEditSong
}) {
  const [semitones, setSemitones] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // 0: xs, 1: sm, 2: base, 3: lg, 4: xl, 5: 2xl
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1, 1.5, 2
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSemitones(0);
    setIsAutoScrolling(false);
  }, [song?.id]);

  useEffect(() => {
    let interval = null;
    if (isAutoScrolling) {
      const ms = scrollSpeed === 2 ? 25 : scrollSpeed === 1.5 ? 35 : 45;
      interval = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, ms);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed]);

  if (!song) {
    return (
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
        <Music className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <p className="text-base font-semibold">Selecciona una canción para ver sus acordes y letra en modo atril.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
        >
          Volver al Repertorio
        </button>
      </div>
    );
  }

  const currentKey = transposeChord(song.originalKey, semitones);
  const transposedLyrics = transposeLyricsAndChords(song.lyricsAndChords, semitones);
  const categoryInfo = CATEGORIES[song.category] || CATEGORIES.alabanza;

  // Direct Key Transposition Handler
  const handleDirectKeySelect = (targetKey) => {
    const diff = getSemitonesDifference(song.originalKey, targetKey);
    setSemitones(diff);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(transposedLyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Font Size Map
  const fontSizes = [
    { label: 'XS', class: 'text-xs leading-normal' },
    { label: 'S', class: 'text-xs md:text-sm leading-normal' },
    { label: 'M', class: 'text-sm md:text-base leading-relaxed' },
    { label: 'L', class: 'text-base md:text-lg leading-relaxed' },
    { label: 'XL', class: 'text-lg md:text-xl leading-loose' },
    { label: 'XXL', class: 'text-xl md:text-2xl leading-loose' }
  ];

  // Setlist navigation (if song is in current setlist)
  const setlistSongs = currentSetlist.filter(Boolean);
  const currentIndexInSetlist = setlistSongs.findIndex(s => s.id === song.id);
  const hasPreviousInSetlist = currentIndexInSetlist > 0;
  const hasNextInSetlist = currentIndexInSetlist >= 0 && currentIndexInSetlist < setlistSongs.length - 1;

  const renderFormattedLine = (line, idx) => {
    const sectionMatch = line.match(/^\[(Intro|Verso|Coro|Puente|Outro|Pre-Coro|Instrumental)[^\]]*\]$/i);
    if (sectionMatch) {
      return (
        <div key={idx} className="pt-5 pb-1.5">
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-black font-sans tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-sky-300 border border-indigo-500/30 uppercase">
            {line.replace(/[\[\]]/g, '')}
          </span>
        </div>
      );
    }

    const parts = line.split(/(\[[A-G][^\]]*\])/g);
    
    return (
      <div key={idx} className="min-h-[1.8rem] whitespace-pre-wrap leading-relaxed py-0.5">
        {parts.map((part, pIdx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            return (
              <span
                key={pIdx}
                className="inline-block px-2 py-0.5 my-0.5 mx-0.5 font-bold font-mono rounded-md shadow-sm transition-colors cursor-default text-amber-700 dark:text-amber-300 bg-amber-400/20 dark:bg-amber-400/20 border border-amber-400/40"
                title={`Acorde: ${chord}`}
              >
                {chord}
              </span>
            );
          }
          return <span key={pIdx} className="text-slate-800 dark:text-slate-100">{part}</span>;
        })}
      </div>
    );
  };

  const commonKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Eb', 'F#', 'Ab', 'Bb'];

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-midnight-950 p-6 overflow-y-auto' : ''}`}>
      
      {/* Setlist Fast Switcher Bar (If viewing within Sunday Setlist) */}
      {currentIndexInSetlist >= 0 && (
        <div className="bg-indigo-50 dark:bg-midnight-900 border border-indigo-200 dark:border-midnight-800 rounded-2xl p-2.5 flex items-center justify-between shadow-sm">
          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist - 1])}
            disabled={!hasPreviousInSetlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasPreviousInSetlist
                ? 'bg-white dark:bg-midnight-800 text-indigo-600 dark:text-sky-400 shadow-sm hover:scale-105'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Canto Anterior</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-sky-400 font-mono">
              {currentIndexInSetlist + 1} de {setlistSongs.length} del Setlist
            </span>
            <span className="truncate max-w-[140px] sm:max-w-none text-slate-900 dark:text-white">
              {song.title}
            </span>
          </div>

          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist + 1])}
            disabled={!hasNextInSetlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasNextInSetlist
                ? 'bg-white dark:bg-midnight-800 text-indigo-600 dark:text-sky-400 shadow-sm hover:scale-105'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <span className="hidden sm:inline">Siguiente Canto</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Atril Reader Card */}
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-5 sm:p-7 shadow-xl dark:shadow-2xl transition-colors duration-200">
        
        {/* Navigation & Song Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-midnight-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-midnight-950 dark:hover:bg-midnight-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 transition-all active:scale-95"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {song.title}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${categoryInfo.badgeClass}`}>
                  <span>{categoryInfo.emoji}</span>
                  <span>{categoryInfo.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {song.artist} · Tono Original: <strong className="font-mono text-slate-700 dark:text-slate-200">{song.originalKey}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions (Full screen, Edit, Copy) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-midnight-950 hover:bg-slate-200 dark:hover:bg-midnight-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 transition-all text-xs font-bold inline-flex items-center gap-1.5"
              title="Copiar letra con acordes"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            {onEditSong && (
              <button
                onClick={() => onEditSong(song)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-midnight-950 hover:bg-slate-200 dark:hover:bg-midnight-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 transition-all text-xs font-bold inline-flex items-center gap-1.5"
                title="Editar Letra o Acordes"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all text-xs font-bold inline-flex items-center gap-1.5"
              title="Pantalla Completa para Atril"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Salir' : 'Atril Completo'}</span>
            </button>
          </div>
        </div>

        {/* Musician Control Panel (Selector de Tonos & Ajuste de Fuente) */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-midnight-950/80 border border-slate-200 dark:border-midnight-800 space-y-4">
          
          {/* Tone Selector & Transposition Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Current Key Indicator & Step Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tono:
                </span>
                <span className="text-lg font-black font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm">
                  {currentKey}
                </span>
                {semitones !== 0 && (
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-sky-400">
                    ({semitones > 0 ? `+${semitones}` : semitones} semitonos)
                  </span>
                )}
              </div>

              {/* -1 / +1 Step */}
              <div className="flex items-center gap-1 bg-white dark:bg-midnight-900 p-1 rounded-xl border border-slate-200 dark:border-midnight-800">
                <button
                  onClick={() => setSemitones(s => s - 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-midnight-800 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Bajar 1 semitono"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSemitones(0)}
                  disabled={semitones === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-midnight-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-30"
                  title="Restablecer al tono original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSemitones(s => s + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-midnight-800 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Subir 1 semitono"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Font Size & Auto-Scroll Controls */}
            <div className="flex items-center gap-3">
              {/* Font Size (A- / A+) */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-midnight-900 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-midnight-800">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Fuente</span>
                <button
                  onClick={() => setFontSizeIndex(i => Math.max(0, i - 1))}
                  disabled={fontSizeIndex === 0}
                  className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 disabled:opacity-30"
                >
                  A-
                </button>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-sky-400 px-1">
                  {fontSizes[fontSizeIndex].label}
                </span>
                <button
                  onClick={() => setFontSizeIndex(i => Math.min(fontSizes.length - 1, i + 1))}
                  disabled={fontSizeIndex === fontSizes.length - 1}
                  className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 disabled:opacity-30"
                >
                  A+
                </button>
              </div>

              {/* Auto Scroll Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-midnight-900 p-1 rounded-xl border border-slate-200 dark:border-midnight-800">
                <button
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isAutoScrolling
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-800'
                  }`}
                >
                  {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoScrolling ? 'Pausar' : 'Auto-Scroll'}</span>
                </button>

                {isAutoScrolling && (
                  <button
                    onClick={() => setScrollSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300"
                    title="Velocidad de desplazamiento"
                  >
                    {scrollSpeed}x
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tone Pills (Direct 1-Click Key Selector) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-midnight-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Tonos directos:
            </span>
            {commonKeys.map(k => {
              const isActive = currentKey.startsWith(k);
              return (
                <button
                  key={k}
                  onClick={() => handleDirectKeySelect(k)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                      : 'bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-midnight-700'
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chords and Lyrics Sheet (Modo Atril) */}
        <div className={`mt-6 font-mono select-text transition-all duration-200 ${fontSizes[fontSizeIndex].class}`}>
          {transposedLyrics.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
        </div>
      </div>
    </div>
  );
}
