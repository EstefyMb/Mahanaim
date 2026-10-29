import React, { useState } from 'react';
import { X, Music2, Save, Wand2, Sparkles, Check } from 'lucide-react';
import { convertLaCuerdaToBracketNotation, isLaCuerdaFormat } from '../utils/chordParser';

export default function NewSongModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [category, setCategory] = useState('alabanza');
  const [daysAgo, setDaysAgo] = useState(0);
  const [lyricsAndChords, setLyricsAndChords] = useState('');
  const [convertedNotice, setConvertedNotice] = useState(false);

  // Detecta automáticamente si el texto pegado tiene el formato de acordes arriba (LaCuerda)
  const detectedLaCuerda = isLaCuerdaFormat(lyricsAndChords);

  // Función para convertir los acordes al formato [Acorde] automáticamente
  const handleConvertLaCuerda = () => {
    const converted = convertLaCuerdaToBracketNotation(lyricsAndChords);
    setLyricsAndChords(converted);
    setConvertedNotice(true);
    setTimeout(() => setConvertedNotice(false), 3000);

    // Intenta detectar el primer tono y ponerlo como Tono Original automáticamente
    const toneMatch = converted.match(/\[([A-G][#b]?m?)\]/);
    if (toneMatch && toneMatch[1]) {
      setOriginalKey(toneMatch[1]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const newSong = {
      id: Date.now().toString(),
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      category,
      daysAgo: Number(daysAgo),
      lastPlayedDate: daysAgo === 0 ? 'Hoy' : `${daysAgo} días atrás`,
      lyricsAndChords
    };

    onSave(newSong);

    // Limpiar formulario y cerrar
    setTitle('');
    setArtist('');
    setOriginalKey('G');
    setCategory('alabanza');
    setDaysAgo(0);
    setLyricsAndChords('');
    onClose();
  };

  const keys = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Am', 'Em', 'Bm', 'F#m', 'C#m'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-midnight-800 flex items-center justify-between bg-slate-50 dark:bg-midnight-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Music2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Agregar Nueva Canción</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ingresa la letra y ajusta los acordes fácilmente.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Título del Canto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Cerca de ti"
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Artista / Autor *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej: Ministerio de Alabanza"
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tono Original
                </label>
                <select
                  value={originalKey}
                  onChange={(e) => setOriginalKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                >
                  {keys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Momento del Culto
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="alabanza">🔥 Alabanza (3 cantos)</option>
                  <option value="adoracion">🕊️ Adoración (2 cantos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Días sin tocarse
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={daysAgo}
                  onChange={(e) => setDaysAgo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Letra y Acordes
                </label>
                <button
                  type="button"
                  onClick={handleConvertLaCuerda}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                  title="Convierte automáticamente texto con acordes arriba al formato [Acorde]"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Ajustar formato LaCuerda</span>
                </button>
              </div>

              {/* Aviso si detecta formato de acordes arriba */}
              {detectedLaCuerda && (
                <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Detectamos acordes arriba estilo LaCuerda.net.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConvertLaCuerda}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-white shadow-sm transition-all shrink-0"
                  >
                    Ajustar a corchetes []
                  </button>
                </div>
              )}

              {convertedNotice && (
                <div className="mb-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Acordes convertidos exitosamente a corchetes [X]!</span>
                </div>
              )}

              <textarea
                rows={10}
                value={lyricsAndChords}
                onChange={(e) => setLyricsAndChords(e.target.value)}
                placeholder="Pega la letra y acordes aquí..."
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tip: Pega texto con acordes y toca <strong>"Ajustar formato LaCuerda"</strong> para ordenarlos automáticamente con corchetes `[ ]`.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Canción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}