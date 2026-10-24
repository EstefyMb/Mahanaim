import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Trash2, Music2, Wand2, Sparkles, Check } from 'lucide-react';
import { CATEGORIES } from '../mockData';
import { convertLaCuerdaToBracketNotation, isLaCuerdaFormat } from '../utils/chordParser';

export default function EditSongModal({
  isOpen,
  song,
  onClose,
  onUpdateSong,
  onDeleteSong
}) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [category, setCategory] = useState('alabanza');
  const [daysAgo, setDaysAgo] = useState(30);
  const [lyricsAndChords, setLyricsAndChords] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertedNotice, setConvertedNotice] = useState(false);

  const detectedLaCuerda = isLaCuerdaFormat(lyricsAndChords);

  const handleConvertLaCuerda = () => {
    const converted = convertLaCuerdaToBracketNotation(lyricsAndChords);
    setLyricsAndChords(converted);
    setConvertedNotice(true);
    setTimeout(() => setConvertedNotice(false), 3000);

    const toneMatch = converted.match(/\[([A-G][#b]?m?)\]/);
    if (toneMatch && toneMatch[1]) {
      setOriginalKey(toneMatch[1]);
    }
  };

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist || '');
      setOriginalKey(song.originalKey || 'G');
      setCategory(song.category || 'alabanza');
      setDaysAgo(song.daysAgo !== null && song.daysAgo !== undefined ? song.daysAgo : 45);
      setLyricsAndChords(song.lyricsAndChords || '');
      setConfirmDelete(false);
    }
  }, [song]);

  if (!isOpen || !song) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const updatedSong = {
      ...song,
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      category,
      daysAgo: Number(daysAgo),
      lastPlayedDate: daysAgo === 0 ? 'Hoy' : `${daysAgo} días atrás`,
      lyricsAndChords
    };

    onUpdateSong(updatedSong);
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
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Editar Canción</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actualiza los datos musicales y rotación del repertorio.</p>
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
                  title="Convierte automáticamente texto con acordes arriba (LaCuerda.net) al formato [Acorde]"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Ajustar formato LaCuerda</span>
                </button>
              </div>

              {/* Notice when LaCuerda format is detected */}
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
                rows={9}
                value={lyricsAndChords}
                onChange={(e) => setLyricsAndChords(e.target.value)}
                placeholder="Pega la letra con acordes arriba de LaCuerda.net..."
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tip: Pega de <strong>lacuerda.net</strong> y toca "Ajustar formato LaCuerda" para convertir automáticamente.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-between gap-3">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-500 font-bold">¿Seguro?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteSong(song.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar del repertorio</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
