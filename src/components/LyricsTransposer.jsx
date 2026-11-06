import React, { useState, useEffect, useRef } from 'react';
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
  Gauge,
  Columns2,
  Music2,
  FileText
} from 'lucide-react';
import { 
  transposeChord, 
  transposeLyricsAndChords, 
  getSemitonesDifference,
  CATEGORIES 
} from '../mockData';
import { convertLaCuerdaToBracketNotation, isLaCuerdaFormat } from '../utils/chordParser';

export default function LyricsTransposer({
  song,
  allSongs = [],
  currentSetlist = [],
  onSelectSong,
  onBack,
  onEditSong
}) {
  const [semitones, setSemitones] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // 0: XS, 1: S, 2: M, 3: L, 4: XL, 5: XXL
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 0.5, 1, 1.5, 2, 2.5
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTwoColumns, setIsTwoColumns] = useState(false); // Dividir canción en 2 columnas si es muy larga
  const [copied, setCopied] = useState(false);
  const [showOnlyLyrics, setShowOnlyLyrics] = useState(false); // Toggle: solo letra sin acordes

  const containerRef = useRef(null);

  // Setlist navigation (calculado antes de los efectos)
  const setlistSongs = currentSetlist.filter(Boolean);
  const currentIndexInSetlist = song ? setlistSongs.findIndex(s => s.id === song.id) : -1;
  const hasPreviousInSetlist = currentIndexInSetlist > 0;
  const hasNextInSetlist = currentIndexInSetlist >= 0 && currentIndexInSetlist < setlistSongs.length - 1;

  // Sync fullscreen state with browser events (e.g. user presses Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset when song changes
  useEffect(() => {
    setSemitones(0);
    setIsAutoScrolling(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [song?.id]);

  // Arrow key navigation between songs in setlist (modo atril)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only navigate if we are in the setlist
      if (currentIndexInSetlist < 0) return;
      // Avoid triggering when user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (hasNextInSetlist) {
          onSelectSong(setlistSongs[currentIndexInSetlist + 1]);
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (hasPreviousInSetlist) {
          onSelectSong(setlistSongs[currentIndexInSetlist - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndexInSetlist, setlistSongs, hasPreviousInSetlist, hasNextInSetlist, onSelectSong]);

  // Robust, 60fps RequestAnimationFrame Auto-Scroll (Works both in Fullscreen and Normal Window)
  useEffect(() => {
    if (!isAutoScrolling) return;

    let animationFrameId = null;
    let lastTimestamp = performance.now();
    let accumulatedPixels = 0;

    // Speeds: 0.5x (~15px/s), 1x (~30px/s), 1.5x (~45px/s), 2x (~60px/s), 2.5x (~80px/s)
    const basePixelsPerSecond = 30;
    const speedMultiplier = scrollSpeed;

    const performScroll = (currentTimestamp) => {
      const deltaSeconds = (currentTimestamp - lastTimestamp) / 1000;
      lastTimestamp = currentTimestamp;

      // Calculate how many fractional pixels to advance
      accumulatedPixels += basePixelsPerSecond * speedMultiplier * deltaSeconds;

      if (accumulatedPixels >= 1) {
        const pixelsToScroll = Math.floor(accumulatedPixels);
        accumulatedPixels -= pixelsToScroll;

        // Auto-scroll the fullscreen container element if active
        if (containerRef.current) {
          containerRef.current.scrollTop += pixelsToScroll;
        }
        // Also advance window for normal view
        if (!isFullscreen) {
          window.scrollBy(0, pixelsToScroll);
        }
      }

      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAutoScrolling, scrollSpeed, isFullscreen]);

  if (!song) {
    return (
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-8 sm:p-12 text-center text-slate-500 dark:text-slate-400">
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

  // Auto-normalize if lyrics were pasted in LaCuerda format without brackets
  const rawContent = song.lyricsAndChords || '';
  const normalizedContent = isLaCuerdaFormat(rawContent)
    ? convertLaCuerdaToBracketNotation(rawContent)
    : rawContent;

  const currentKey = transposeChord(song.originalKey, semitones);
  const transposedLyrics = transposeLyricsAndChords(normalizedContent, semitones);
  const categoryInfo = CATEGORIES[song.category] || CATEGORIES.alabanza;

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
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Mobile-Optimized Font Sizes
  const fontSizes = [
    { label: 'XS', class: 'text-[11px] sm:text-xs leading-normal' },
    { label: 'S', class: 'text-xs sm:text-sm leading-normal' },
    { label: 'M', class: 'text-sm sm:text-base leading-relaxed' },
    { label: 'L', class: 'text-base sm:text-lg leading-relaxed' },
    { label: 'XL', class: 'text-lg sm:text-xl leading-loose' },
    { label: 'XXL', class: 'text-xl sm:text-2xl leading-loose' }
  ];

  const speedOptions = [0.5, 1, 1.5, 2, 2.5];

  const cycleSpeed = () => {
    const currentIdx = speedOptions.indexOf(scrollSpeed);
    const nextIdx = (currentIdx + 1) % speedOptions.length;
    setScrollSpeed(speedOptions[nextIdx]);
  };

  const renderFormattedLine = (line, idx) => {
    // Section headers like [Intro], [Verso 1], [Coro], [Puente]
    const sectionMatch = line.match(/^\[(Intro|Verso|Coro|Puente|Outro|Pre-Coro|Instrumental)[^\]]*\]$/i);

    // Expresión regular robusta para detectar cualquier acorde (menores, bemoles, sostenidos)
    const chordRegex = /(\[[A-Ga-g][#b]?[a-zA-Z0-9]*\])/g;

    // Check if line consists purely of chords and whitespace
    const isPureChordLine = line.trim().length > 0 && line.replace(chordRegex, '').trim().length === 0;

    // In lyrics-only mode: skip pure chord lines
    if (showOnlyLyrics && isPureChordLine) return null;

    if (sectionMatch) {
      return (
        <div key={idx} className="pt-4 pb-1 sm:pt-5 sm:pb-1.5 w-full text-left">
          <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black font-sans tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-sky-300 border border-indigo-500/30 uppercase shadow-sm">
            {line.replace(/[\[\]]/g, '')}
          </span>
        </div>
      );
    }

    const parts = line.split(chordRegex);
    
    return (
      <div 
        key={idx} 
        className={`whitespace-pre-wrap font-mono w-full text-left ${
          isPureChordLine 
            ? 'pt-2 pb-0 leading-normal text-amber-500 dark:text-amber-400 font-bold' 
            : 'pt-0 pb-1 leading-relaxed text-slate-800 dark:text-slate-100'
        }`}
      >
        {parts.map((part, pIdx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            // In lyrics-only mode: skip inline chord tokens
            if (showOnlyLyrics) return null;
            const chord = part.slice(1, -1);
            return (
              <span
                key={pIdx}
                className="font-bold font-mono text-amber-500 dark:text-amber-400 select-none inline"
                title={`Acorde: ${chord}`}
              >
                {chord}
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>
    );
  };

  // Helper para dividir canciones largas en 2 columnas de forma natural
  const getTwoColumnSplit = (lines) => {
    if (lines.length <= 4) return { left: lines, right: [] };
    
    const mid = Math.ceil(lines.length / 2);
    let bestSplitIndex = mid;

    // Buscar el corte más limpio (salto de línea o inicio de sección) cerca del centro
    for (let offset = 0; offset <= 6; offset++) {
      const minus = mid - offset;
      if (minus > 2 && (!lines[minus].trim() || lines[minus].trim().startsWith('['))) {
        bestSplitIndex = minus;
        break;
      }
      const plus = mid + offset;
      if (plus < lines.length - 2 && (!lines[plus].trim() || lines[plus].trim().startsWith('['))) {
        bestSplitIndex = plus;
        break;
      }
    }

    return {
      left: lines.slice(0, bestSplitIndex),
      right: lines.slice(bestSplitIndex)
    };
  };

  const commonKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Eb', 'F#', 'Ab', 'Bb'];

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col gap-3 sm:gap-4 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-midnight-950 p-2 sm:p-4 overflow-y-auto pb-44' 
          : 'relative pb-24'
      }`}
    >
      
      {/* Top Setlist Switcher Bar (If viewing within Sunday Setlist) */}
      {currentIndexInSetlist >= 0 && (
        <div className="bg-indigo-50 dark:bg-midnight-900 border border-indigo-200 dark:border-midnight-800 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between shadow-sm">
          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist - 1])}
            disabled={!hasPreviousInSetlist}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasPreviousInSetlist
                ? 'bg-white dark:bg-midnight-800 text-indigo-600 dark:text-sky-400 shadow-sm active:scale-95'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-sky-400 font-mono text-[10px] sm:text-xs shrink-0">
              {currentIndexInSetlist + 1} de {setlistSongs.length}
            </span>
            <span className="truncate max-w-[120px] sm:max-w-xs text-slate-900 dark:text-white">
              {song.title}
            </span>
          </div>

          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist + 1])}
            disabled={!hasNextInSetlist}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasNextInSetlist
                ? 'bg-white dark:bg-midnight-800 text-indigo-600 dark:text-sky-400 shadow-sm active:scale-95'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Atril Reader Card */}
      <div className={`bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl shadow-xl dark:shadow-2xl transition-colors duration-200 ${
        isFullscreen 
          ? (isTwoColumns ? 'max-w-7xl mx-auto w-full p-3 sm:p-5' : 'max-w-5xl mx-auto w-full p-3 sm:p-5') 
          : (isTwoColumns ? 'w-full p-4 sm:p-7' : 'p-4 sm:p-7')
      }`}>
        
        {/* Navigation & Song Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-midnight-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {song.title}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${categoryInfo.badgeClass}`}>
                  <span>{categoryInfo.emoji}</span>
                  <span>{categoryInfo.name}</span>
                </span>
                {isFullscreen && (
                  <span className="font-mono text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shrink-0">
                    Tono: {currentKey} {semitones !== 0 ? `(${semitones > 0 ? `+${semitones}` : semitones})` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {song.artist} {!isFullscreen && <>· Tono Original: <strong className="font-mono text-slate-700 dark:text-slate-200">{song.originalKey}</strong></>}
              </p>
            </div>
          </div>

          {/* Quick Actions (Atril Completo vs Modo Normal) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
            {isFullscreen ? (
              <>
                {/* En Modo Atril Completo: Selector de tamaño de letra en lugar de Copiar/Editar */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-midnight-950 px-2 py-1 rounded-xl border border-slate-200 dark:border-midnight-800">
                  <span className="text-[10px] font-bold text-slate-400 mr-0.5 uppercase hidden sm:inline">Letra</span>
                  <button
                    onClick={() => setFontSizeIndex(i => Math.max(0, i - 1))}
                    disabled={fontSizeIndex === 0}
                    className="px-1.5 py-0.5 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-midnight-800 disabled:opacity-30"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-sky-400 px-1">
                    {fontSizes[fontSizeIndex].label}
                  </span>
                  <button
                    onClick={() => setFontSizeIndex(i => Math.min(fontSizes.length - 1, i + 1))}
                    disabled={fontSizeIndex === fontSizes.length - 1}
                    className="px-1.5 py-0.5 rounded-lg text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-midnight-800 disabled:opacity-30"
                  >
                    A+
                  </button>
                </div>

                {/* Botón 2 Columnas */}
                <button
                  onClick={() => setIsTwoColumns(!isTwoColumns)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                    isTwoColumns
                      ? 'bg-indigo-500/20 text-indigo-700 dark:text-sky-300 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-slate-100 dark:bg-midnight-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-midnight-800 hover:bg-slate-200'
                  }`}
                  title={isTwoColumns ? 'Dividido en 2 columnas' : 'Dividir canción en 2 columnas'}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isTwoColumns ? '2 Col.' : 'Dividir'}</span>
                </button>

                {/* Toggle Solo Letra vs Letra + Acordes */}
                <button
                  onClick={() => setShowOnlyLyrics(!showOnlyLyrics)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                    showOnlyLyrics
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 shadow-sm'
                      : 'bg-slate-100 dark:bg-midnight-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-midnight-800 hover:bg-slate-200'
                  }`}
                  title={showOnlyLyrics ? 'Mostrando solo letra' : 'Mostrando letra y acordes'}
                >
                  {showOnlyLyrics ? <FileText className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{showOnlyLyrics ? 'Solo Letra' : 'Acordes'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopyText}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-midnight-950 hover:bg-slate-200 dark:hover:bg-midnight-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 text-xs font-bold inline-flex items-center gap-1"
                  title="Copiar letra con acordes"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                {onEditSong && (
                  <button
                    onClick={() => onEditSong(song)}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-midnight-950 hover:bg-slate-200 dark:hover:bg-midnight-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 text-xs font-bold inline-flex items-center gap-1"
                    title="Editar Letra o Acordes"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden md:inline">Editar</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 text-xs font-bold inline-flex items-center gap-1"
              title="Pantalla Completa para Atril"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Salir' : 'Atril Completo'}</span>
            </button>
          </div>
        </div>

        {/* Musician Control Panel (Solo visible fuera del modo pantalla completa) */}
        {!isFullscreen && (
          <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-midnight-950/80 border border-slate-200 dark:border-midnight-800 space-y-3.5">
            
            {/* Tone Selector & Transposition Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Current Key Indicator & Step Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tono:
                </span>
                <span className="text-base sm:text-lg font-black font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm">
                  {currentKey}
                </span>
                {semitones !== 0 && (
                  <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-sky-400">
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
                  <Minus className="w-3.5 h-3.5" />
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
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font Size, Alignment & Auto-Scroll Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Font Size (A- / A+) */}
              <div className="flex items-center gap-1 bg-white dark:bg-midnight-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-midnight-800">
                <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Letra</span>
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

              {/* Botón Dividir Canción en 2 Columnas */}
              <button
                onClick={() => setIsTwoColumns(!isTwoColumns)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                  isTwoColumns
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-sky-300 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-midnight-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-midnight-800 hover:bg-slate-50'
                }`}
                title={isTwoColumns ? 'Dividido en 2 columnas (Clic para 1 columna)' : 'Dividir canción en 2 columnas'}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isTwoColumns ? '2 Columnas' : 'Dividir en 2'}</span>
              </button>

              {/* Toggle Solo Letra vs Letra + Acordes */}
              <button
                onClick={() => setShowOnlyLyrics(!showOnlyLyrics)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                  showOnlyLyrics
                    ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 shadow-sm'
                    : 'bg-white dark:bg-midnight-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-midnight-800 hover:bg-slate-50'
                }`}
                title={showOnlyLyrics ? 'Mostrando solo letra' : 'Mostrando letra y acordes'}
              >
                {showOnlyLyrics ? <FileText className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{showOnlyLyrics ? 'Solo Letra' : 'Letra y Acordes'}</span>
              </button>

              {/* Auto Scroll Button */}
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
                  <span>{isAutoScrolling ? 'Pausa' : 'Auto-Scroll'}</span>
                </button>

                <button
                  onClick={cycleSpeed}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  title="Cambiar velocidad de scroll"
                >
                  {scrollSpeed}x
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tone Pills (Scrollable on mobile) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-midnight-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Tonos directos:
            </span>
            {commonKeys.map(k => {
              const isActive = currentKey.startsWith(k);
              return (
                <button
                  key={k}
                  onClick={() => handleDirectKeySelect(k)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
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
        )}

        {/* Chords and Lyrics Sheet (1 Columna o Dividido en 2 Columnas) */}
        <div className={`mt-4 sm:mt-6 font-mono select-text transition-all duration-200 overflow-x-auto w-full ${fontSizes[fontSizeIndex].class}`}>
          {isTwoColumns ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full text-left">
              <div className="space-y-0 text-left border-b md:border-b-0 md:border-r border-slate-200 dark:border-midnight-800 pb-6 md:pb-0 md:pr-8">
                {getTwoColumnSplit(transposedLyrics.split('\n')).left.map((line, idx) => renderFormattedLine(line, `col1-${idx}`))}
              </div>
              <div className="space-y-0 text-left">
                {getTwoColumnSplit(transposedLyrics.split('\n')).right.map((line, idx) => renderFormattedLine(line, `col2-${idx}`))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl text-left">
              {transposedLyrics.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Musician Stage Pill (Ideal for mobile live playing) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 dark:bg-midnight-900/95 backdrop-blur-md border border-slate-300 dark:border-midnight-700 shadow-2xl shadow-black/40">
        {hasPreviousInSetlist && (
          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist - 1])}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-midnight-800 text-slate-700 dark:text-slate-300"
            title="Canto Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
            isAutoScrolling 
              ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
              : 'bg-indigo-600 text-white shadow-indigo-600/30'
          }`}
        >
          {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isAutoScrolling ? 'Pausar Scroll' : 'Iniciar Scroll'}</span>
        </button>

        <button
          onClick={cycleSpeed}
          className="px-2.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-midnight-700 hover:scale-105 transition-all"
          title="Cambiar velocidad"
        >
          {scrollSpeed}x
        </button>

        {hasNextInSetlist && (
          <button
            onClick={() => onSelectSong(setlistSongs[currentIndexInSetlist + 1])}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-midnight-800 text-slate-700 dark:text-slate-300"
            title="Siguiente Canto"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}