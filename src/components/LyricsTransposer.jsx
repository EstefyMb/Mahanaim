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
  AlignCenter,
  AlignLeft
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
  const [isCentered, setIsCentered] = useState(true); // Center lyrics & chords by default (ideal for fullscreen atril)
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);

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

  // Setlist navigation (if song is in current setlist)
  const setlistSongs = currentSetlist.filter(Boolean);
  const currentIndexInSetlist = setlistSongs.findIndex(s => s.id === song.id);
  const hasPreviousInSetlist = currentIndexInSetlist > 0;
  const hasNextInSetlist = currentIndexInSetlist >= 0 && currentIndexInSetlist < setlistSongs.length - 1;

  const speedOptions = [0.5, 1, 1.5, 2, 2.5];

  const cycleSpeed = () => {
    const currentIdx = speedOptions.indexOf(scrollSpeed);
    const nextIdx = (currentIdx + 1) % speedOptions.length;
    setScrollSpeed(speedOptions[nextIdx]);
  };

  const renderFormattedLine = (line, idx) => {
    // Section headers like [Intro], [Verso 1], [Coro], [Puente]
    const sectionMatch = line.match(/^\[(Intro|Verso|Coro|Puente|Outro|Pre-Coro|Instrumental)[^\]]*\]$/i);
    if (sectionMatch) {
      return (
        <div key={idx} className={`pt-4 pb-1 sm:pt-5 sm:pb-1.5 w-full ${isCentered ? 'text-center flex justify-center' : ''}`}>
          <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black font-sans tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-sky-300 border border-indigo-500/30 uppercase shadow-sm">
            {line.replace(/[\[\]]/g, '')}
          </span>
        </div>
      );
    }

    // Check if line consists purely of chords and whitespace (e.g., chord line above lyrics)
    const isPureChordLine = line.trim().length > 0 && line.replace(/\[[A-G][^\]]*\]/g, '').trim().length === 0;

    const parts = line.split(/(\[[A-G][^\]]*\])/g);
    
    return (
      <div 
        key={idx} 
        className={`whitespace-pre-wrap font-mono w-full ${
          isPureChordLine 
            ? 'pt-2.5 pb-0 leading-tight text-amber-600 dark:text-amber-400 font-bold' 
            : 'pt-0 pb-1 leading-relaxed text-slate-800 dark:text-slate-100'
        } ${isCentered ? 'text-center' : 'text-left'}`}
      >
        {parts.map((part, pIdx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            return (
              <span
                key={pIdx}
                className="inline-block px-1.5 py-0.5 my-0.5 mx-0.5 font-bold font-mono rounded-md shadow-sm transition-colors cursor-default text-amber-700 dark:text-amber-300 bg-amber-400/20 dark:bg-amber-400/20 border border-amber-400/40 whitespace-nowrap text-xs sm:text-sm"
                title={`Acorde: ${chord}`}
              >
                [{chord}]
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>
    );
  };

  const commonKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Eb', 'F#', 'Ab', 'Bb'];

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col gap-3 sm:gap-4 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-midnight-950 p-4 sm:p-6 overflow-y-auto pb-96' 
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
      <div className={`bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl p-4 sm:p-7 shadow-xl dark:shadow-2xl transition-colors duration-200 ${
        isFullscreen ? 'max-w-4xl mx-auto w-full' : ''
      }`}>
        
        {/* Navigation & Song Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-midnight-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-midnight-950 dark:hover:bg-midnight-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 transition-all active:scale-95 shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {song.title}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${categoryInfo.badgeClass}`}>
                  <span>{categoryInfo.emoji}</span>
                  <span>{categoryInfo.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {song.artist} · Tono Original: <strong className="font-mono text-slate-700 dark:text-slate-200">{song.originalKey}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions (Full screen, Edit, Copy) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

        {/* Musician Control Panel (Responsive) */}
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

              {/* Text Alignment Button (Centrado vs Izquierda) */}
              <button
                onClick={() => setIsCentered(!isCentered)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all ${
                  isCentered
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-sm'
                    : 'bg-white dark:bg-midnight-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-midnight-800 hover:bg-slate-50'
                }`}
                title={isCentered ? 'Centrado activado' : 'Alinear a la izquierda'}
              >
                {isCentered ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isCentered ? 'Centrado' : 'Izquierda'}</span>
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

        {/* Chords and Lyrics Sheet (Modo Atril Centrado / Alineado) */}
        <div className={`mt-4 sm:mt-6 font-mono select-text transition-all duration-200 overflow-x-auto w-full ${
          isCentered ? 'text-center flex flex-col items-center justify-center' : ''
        } ${fontSizes[fontSizeIndex].class}`}>
          <div className={`w-full max-w-3xl ${isCentered ? 'text-center' : ''}`}>
            {transposedLyrics.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
          </div>
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
