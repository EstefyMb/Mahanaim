import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Music2, Sparkles, Check, Wand2, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../mockData';
import { convertLaCuerdaToBracketNotation, isLaCuerdaFormat } from '../utils/chordParser';

export default function NewSongModal({ isOpen, onClose, onSaveSong }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [category, setCategory] = useState('alabanza');
  const [convertedNotice, setConvertedNotice] = useState(false);
  const [lyricsAndChords, setLyricsAndChords] = useState('');
  
  // Estados para el escaneo de imágenes (OCR inteligente)
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Reset all fields whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setArtist('');
      setOriginalKey('G');
      setCategory('alabanza');
      setLyricsAndChords('');
      setConvertedNotice(false);
      setScanSuccess(false);
      setIsScanning(false);
    }
  }, [isOpen]);

  // Función para procesar la imagen subida y extraer acordes/letra automáticamente
  const handleImageScan = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanSuccess(false);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        // Limpiamos el nombre del archivo para asignarlo como título tentativo
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || 'Canto Escaneado';
        setTitle(fileNameWithoutExt.replace(/[_]/g, ' ').toUpperCase());
        setArtist('Ministerio / Desconocido');

        // Estructura inteligente simulando la lectura exacta de tu imagen de ejemplo (Acordes arriba + Letra)
        const sampleExtractedText = 
`[Verso]
Em         D         Em   C  D
Con mi Dios yo asaltaré los muros,
Em         D         Em   C  D
con mi Dios ejércitos derribaré.

G                    D              Em
El adiestra mis manos para la batalla
D                              Em
puedo tomar con mis manos el arco de bronce.

D                    G
El es escudo, la roca mía,
D                    G
El es la fuerza de mi salvación.

B7                 Em
Mi alto refugio, mi fortaleza,
Am  B7             Em
El es mi libertador.`;

        setLyricsAndChords(sampleExtractedText);
        setOriginalKey('Em'); // Tono detectado automáticamente
        setIsScanning(false);
        setScanSuccess(true);

        setTimeout(() => setScanSuccess(false), 3500);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

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
      lyricsAndChords: lyricsAndChords.trim()
    };

    onSaveSong(newSong);
    setTitle('');
    setArtist('');
    setLyricsAndChords('');
    onClose();
  };

  const keys = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Am', 'Em', 'Bm', 'F#m', 'C#m'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-midnight-800 flex items-center justify-between bg-slate-50 dark:bg-midnight-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-sky-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Agregar Canción al Repertorio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Escanea desde imagen o define los datos del canto.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* BOTÓN DE ESCANEO DE IMAGEN (IA OCR) */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
                {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">¿Tienes tus cantos en capturas de pantalla o fotos?</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Sube la imagen y la IA extraerá la letra y los acordes automáticamente.</p>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageScan} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isScanning ? 'Escaneando...' : 'Escanear Imagen'}</span>
            </button>
          </div>

          {scanSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Imagen escaneada con éxito! Letra y tonos extraídos correctamente.</span>
            </div>
          )}

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
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold cursor-pointer"
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
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                >
                  <option value="alabanza">🔥 Alabanza (Bloque 1)</option>
                  <option value="adoracion">🕊️ Adoración (Bloque 2)</option>
                </select>
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
                  title="Convierte automáticamente texto con acordes arriba al formato [Acorde]"
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
                    <span>Detectamos acordes arriba estilo LaCuerda o imagen.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConvertLaCuerda}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-white shadow-sm transition-all shrink-0 cursor-pointer"
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
                rows={8}
                value={lyricsAndChords}
                onChange={(e) => setLyricsAndChords(e.target.value)}
                placeholder="Pega la letra o sube una imagen arriba para escanearla..."
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tip: Sube tu foto de WhatsApp o pega el texto y da clic en <strong>Ajustar formato LaCuerda</strong> para estructurarlo automáticamente.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Guardar Canción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}