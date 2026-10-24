import React, { useState } from 'react';
import { X, Plus, Music2, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../mockData';

export default function NewSongModal({ isOpen, onClose, onSaveSong }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [category, setCategory] = useState('alabanza');
  const [lyricsAndChords, setLyricsAndChords] = useState(`[Intro]
[G]  [C]  [Em]  [D]

[Verso 1]
[G]Aquí comienza el primer verso
Con acordes [C]resaltados
[Em]Caminando en Tu [D]presencia

[Coro]
[G]Digno eres Señor
[C]Toda gloria sea a Ti
[Em]Por los siglos de los [D]siglos`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const newSong = {
      id: `song-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      category,
      daysAgo: null, // Canción nueva: Nunca tocada aún (Óptima rotación)
      lastPlayedDate: 'Nunca tocada aún',
      lyricsAndChords
    };

    onSaveSong(newSong);
    setTitle('');
    setArtist('');
    onClose();
  };

  const keys = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Am', 'Em', 'Bm', 'F#m', 'C#m'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-midnight-800 flex items-center justify-between bg-slate-50 dark:bg-midnight-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-sky-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Agregar Canción al Repertorio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Define si es Alabanza o Adoración y su tono habitual.</p>
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
                placeholder="Ej. Gracia Sublime Es"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Artista / Autor *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Phil Wickham / En Espíritu y En Verdad"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tono Habitual
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
                  <option value="alabanza">🔥 Alabanza (Bloque 1 - 3 cantos)</option>
                  <option value="adoracion">🕊️ Adoración (Bloque 2 - 2 cantos)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Letra y Acordes ([Acorde])
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ejemplo: <code className="text-amber-500 dark:text-amber-400 font-mono">[G]</code>Dios es fiel
                </span>
              </div>
              <textarea
                rows={7}
                value={lyricsAndChords}
                onChange={(e) => setLyricsAndChords(e.target.value)}
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              Guardar Canción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
