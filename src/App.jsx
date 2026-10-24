import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SetlistBuilder from './components/SetlistBuilder';
import RepertoireExplorer from './components/RepertoireExplorer';
import FullRepertoireView from './components/FullRepertoireView';
import LyricsTransposer from './components/LyricsTransposer';
import SundayHistory from './components/SundayHistory';
import NewSongModal from './components/NewSongModal';
import EditSongModal from './components/EditSongModal';
import SettingsModal from './components/SettingsModal';
import { 
  INITIAL_SONGS, 
  SUNDAY_HISTORY, 
  DEFAULT_CHURCH_SETTINGS 
} from './mockData';
import { CheckCircle2, Info, PartyPopper } from 'lucide-react';

const DEFAULT_INITIAL_SLOTS = [
  { id: 'slot-1', category: 'alabanza', song: INITIAL_SONGS[0] }, // Digno de Alabar
  { id: 'slot-2', category: 'alabanza', song: INITIAL_SONGS[1] }, // En Tu Luz
  { id: 'slot-3', category: 'alabanza', song: INITIAL_SONGS[2] }, // El León de Judá
  { id: 'slot-4', category: 'adoracion', song: INITIAL_SONGS[7] }, // La Bondad de Dios
  { id: 'slot-5', category: 'adoracion', song: INITIAL_SONGS[8] }, // Tumbas a Jardines
];

export default function App() {
  // 1. Theme State ("Azul Medianoche" vs "Luz Celestial")
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('worship_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('worship_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Church Identity & Profile Settings
  const [churchSettings, setChurchSettings] = useState(() => {
    const saved = localStorage.getItem('worship_church_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CHURCH_SETTINGS;
  });

  const handleSaveSettings = (newSettings) => {
    setChurchSettings(newSettings);
    localStorage.setItem('worship_church_settings', JSON.stringify(newSettings));
    showToast('Configuración e identidad de la iglesia guardadas.', 'success');
  };

  // 3. Songs Repertoire (CRUD & Persistence)
  const [songs, setSongs] = useState(() => {
    const saved = localStorage.getItem('worship_songs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SONGS;
  });

  const persistSongs = (updatedSongs) => {
    setSongs(updatedSongs);
    localStorage.setItem('worship_songs', JSON.stringify(updatedSongs));
  };

  // Helper for upcoming Sunday date
  const getDefaultSundayDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToSunday = (7 - dayOfWeek) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + distanceToSunday);
    return nextSunday.toISOString().split('T')[0];
  };

  // 4. Flexible Setlist Builder State (Supports 5, 6, 7 or more songs)
  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem('worship_flexible_slots');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_INITIAL_SLOTS;
  });

  const persistSlots = (newSlots) => {
    setSlots(newSlots);
    localStorage.setItem('worship_flexible_slots', JSON.stringify(newSlots));
  };

  const [serviceDate, setServiceDate] = useState(getDefaultSundayDate());
  const [serviceNotes, setServiceNotes] = useState('Culto Dominical con transición fluida de Alabanza a Adoración.');

  // 5. Sunday History State
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('worship_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SUNDAY_HISTORY;
  });

  const persistHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('worship_history', JSON.stringify(newHistory));
  };

  // Active Tab: 'dashboard' (Armador), 'repertoire' (Repertorio Completo), 'viewer' (Atril), 'history' (Histórico)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSong, setSelectedSong] = useState(INITIAL_SONGS[7]);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [toast, setToast] = useState(null);
  const [publishedCelebration, setPublishedCelebration] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Set of selected song IDs currently occupying any slot
  const selectedSongIds = useMemo(() => {
    return new Set(slots.filter(s => Boolean(s.song)).map(s => s.song.id));
  }, [slots]);

  // Assign song from repertoire to next available slot or add one if needed
  const handleAddToSetlist = (song) => {
    if (selectedSongIds.has(song.id)) {
      showToast(`"${song.title}" ya está asignada en el Setlist.`, 'info');
      return;
    }

    const emptySlot = slots.find(s => s.category === song.category && !s.song);
    if (emptySlot) {
      const nextSlots = slots.map(s => s.id === emptySlot.id ? { ...s, song } : s);
      persistSlots(nextSlots);
      showToast(`"${song.title}" asignada al bloque de ${song.category === 'alabanza' ? 'Alabanza' : 'Adoración'}.`, 'success');
    } else {
      // If all slots of that category are filled, automatically add another slot for it!
      const newSlot = {
        id: `slot-${Date.now()}`,
        category: song.category,
        song
      };
      const nextSlots = [...slots, newSlot];
      persistSlots(nextSlots);
      showToast(`"${song.title}" agregada como canción adicional de ${song.category === 'alabanza' ? 'Alabanza' : 'Adoración'}.`, 'success');
    }
  };

  // Direct slot assignment from drawer
  const handleAssignSongToSlot = (song, slotId) => {
    if (selectedSongIds.has(song.id)) {
      showToast(`"${song.title}" ya está asignada en el Setlist.`, 'info');
      return;
    }
    const nextSlots = slots.map(s => s.id === slotId ? { ...s, song } : s);
    persistSlots(nextSlots);
    showToast(`"${song.title}" asignada correctamente.`, 'success');
  };

  // Clear song from specific slot
  const handleClearSlotSong = (slotId) => {
    const nextSlots = slots.map(s => s.id === slotId ? { ...s, song: null } : s);
    persistSlots(nextSlots);
  };

  // Add new empty slot to a specific block (Alabanza or Adoración)
  const handleAddSlot = (category) => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      category,
      song: null
    };
    // Insert after the last item of that category
    const lastIndex = slots.map(s => s.category).lastIndexOf(category);
    const nextSlots = [...slots];
    if (lastIndex !== -1) {
      nextSlots.splice(lastIndex + 1, 0, newSlot);
    } else {
      nextSlots.push(newSlot);
    }
    persistSlots(nextSlots);
    showToast(`Nuevo espacio de ${category === 'alabanza' ? 'Alabanza' : 'Adoración'} añadido.`, 'success');
  };

  // Remove a slot entirely
  const handleRemoveSlot = (slotId) => {
    const nextSlots = slots.filter(s => s.id !== slotId);
    persistSlots(nextSlots);
    showToast('Espacio eliminado del setlist.', 'info');
  };

  // Clear all slots
  const handleClearAllSlots = () => {
    const emptiedSlots = slots.map(s => ({ ...s, song: null }));
    persistSlots(emptiedSlots);
    showToast('Todos los espacios de la lista han sido vaciados.', 'info');
  };

  // Drag & Drop reorder (swaps songs between two slots)
  const handleReorderSlots = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const sourceIndex = slots.findIndex(s => s.id === sourceId);
    const targetIndex = slots.findIndex(s => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextSlots = [...slots];
    const sourceSong = nextSlots[sourceIndex].song;
    const targetSong = nextSlots[targetIndex].song;

    nextSlots[sourceIndex] = { ...nextSlots[sourceIndex], song: targetSong };
    nextSlots[targetIndex] = { ...nextSlots[targetIndex], song: sourceSong };

    persistSlots(nextSlots);
    showToast('Orden de canciones actualizado.', 'info');
  };

  // Up/Down move by 1 position (swaps with adjacent slot)
  const handleMoveSlot = (slotId, direction) => {
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;

    const nextSlots = [...slots];
    const currentSong = nextSlots[index].song;
    const targetSong = nextSlots[targetIndex].song;

    nextSlots[index] = { ...nextSlots[index], song: targetSong };
    nextSlots[targetIndex] = { ...nextSlots[targetIndex], song: currentSong };

    persistSlots(nextSlots);
  };

  // Intelligent Auto-Suggest (Regla de Oro: canciones con más días sin tocarse)
  const handleAutoSuggest = () => {
    const sortByOldest = (list) => {
      return [...list].sort((a, b) => {
        const aDays = a.daysAgo === null || a.daysAgo === undefined ? 999 : a.daysAgo;
        const bDays = b.daysAgo === null || b.daysAgo === undefined ? 999 : b.daysAgo;
        return bDays - aDays;
      });
    };

    const eligibleAlabanzas = sortByOldest(songs.filter(s => s.category === 'alabanza'));
    const eligibleAdoraciones = sortByOldest(songs.filter(s => s.category === 'adoracion'));

    let alabanzaIdx = 0;
    let adoracionIdx = 0;

    const nextSlots = slots.map(slot => {
      if (slot.category === 'alabanza') {
        const song = eligibleAlabanzas[alabanzaIdx++] || null;
        return { ...slot, song };
      } else {
        const song = eligibleAdoraciones[adoracionIdx++] || null;
        return { ...slot, song };
      }
    });

    persistSlots(nextSlots);
    showToast('✨ ¡Setlist generado con la Regla de Oro: canciones más descansadas asignadas!', 'success');
  };

  // Publish Setlist: Saves to history & atomically updates "lastPlayedDate" to today
  const handlePublishSetlist = () => {
    const filled = slots.filter(s => Boolean(s.song));
    if (filled.length < slots.length) {
      showToast(`Por favor asigna todos los cantos (${filled.length}/${slots.length}) antes de publicar.`, 'error');
      return;
    }

    const formattedDate = new Date(serviceDate + 'T12:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // 1. Create history entry (sin líder)
    const newHistoryEntry = {
      id: `history-${Date.now()}`,
      date: formattedDate,
      relativeDays: 'Publicado',
      notes: serviceNotes,
      setlist: slots.map((s, idx) => ({
        order: idx + 1,
        songId: s.song.id,
        title: s.song.title,
        key: s.song.originalKey,
        category: s.category
      }))
    };

    const nextHistory = [newHistoryEntry, ...history];
    persistHistory(nextHistory);

    // 2. ATOMIC UPDATE: Update "lastPlayedDate" and "daysAgo = 0" for all songs in the setlist
    const setlistSongIds = new Set(slots.map(s => s.song.id));
    const nextSongs = songs.map(song => {
      if (setlistSongIds.has(song.id)) {
        return {
          ...song,
          daysAgo: 0,
          lastPlayedDate: formattedDate
        };
      }
      return song;
    });

    persistSongs(nextSongs);

    // Update in current slots
    const updatedActiveSlots = slots.map(s => ({
      ...s,
      song: s.song ? { ...s.song, daysAgo: 0, lastPlayedDate: formattedDate } : null
    }));
    persistSlots(updatedActiveSlots);

    // 3. Show celebration feedback
    setPublishedCelebration({
      date: formattedDate,
      songs: slots.map(s => s.song)
    });
    showToast('💾 ¡Culto publicado y fechas de rotación actualizadas a hoy!', 'success');
  };

  // View song lyrics in Atril Mode
  const handleViewLyrics = (song) => {
    setSelectedSong(song);
    setActiveTab('viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSongLyricsById = (songId) => {
    const found = songs.find(s => s.id === songId);
    if (found) {
      handleViewLyrics(found);
    }
  };

  // Re-load past service template into current builder (adapts slots length!)
  const handleLoadHistoricalSetlist = (historicalRecord) => {
    const loadedSlots = historicalRecord.setlist.map((item, idx) => {
      const foundSong = songs.find(s => s.id === item.songId);
      return {
        id: `slot-${idx + 1}`,
        category: item.category || 'alabanza',
        song: foundSong || null
      };
    });

    persistSlots(loadedSlots);
    setActiveTab('dashboard');
    showToast(`Plantilla de ${historicalRecord.setlist.length} cantos del "${historicalRecord.date}" cargada en el Setlist.`, 'success');
  };

  // Repertoire CRUD operations
  const handleSaveNewSong = (newSong) => {
    const nextSongs = [newSong, ...songs];
    persistSongs(nextSongs);
    showToast(`Canto "${newSong.title}" agregado al repertorio.`, 'success');
  };

  const handleUpdateSong = (updatedSong) => {
    const nextSongs = songs.map(s => s.id === updatedSong.id ? updatedSong : s);
    persistSongs(nextSongs);

    // Update in slots if present
    const nextSlots = slots.map(s => s.song?.id === updatedSong.id ? { ...s, song: updatedSong } : s);
    persistSlots(nextSlots);

    if (selectedSong?.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }

    showToast(`Canto "${updatedSong.title}" actualizado con éxito.`, 'success');
  };

  const handleDeleteSong = (songId) => {
    const target = songs.find(s => s.id === songId);
    const nextSongs = songs.filter(s => s.id !== songId);
    persistSongs(nextSongs);

    const nextSlots = slots.map(s => s.song?.id === songId ? { ...s, song: null } : s);
    persistSlots(nextSlots);

    showToast(`"${target?.title || 'Canción'}" eliminada del repertorio.`, 'info');
  };

  const handleResetRepertoire = () => {
    persistSongs(INITIAL_SONGS);
    persistHistory(SUNDAY_HISTORY);
    persistSlots(DEFAULT_INITIAL_SLOTS);
    showToast('Repertorio e historial restablecidos a los datos de demostración.', 'info');
  };

  const filledCount = slots.filter(s => Boolean(s.song)).length;
  const currentSetlistSongs = slots.map(s => s.song).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 text-slate-800 dark:text-slate-100 flex selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-midnight-900 border border-indigo-500/50 shadow-2xl shadow-black/20 text-sm animate-in slide-in-from-bottom duration-300">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* Published Culto Celebration Banner Modal */}
      {publishedCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
              <PartyPopper className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              ¡Culto Publicado y Fechas Actualizadas!
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              El servicio para el <strong>{publishedCelebration.date}</strong> ha sido registrado en el historial con sus {publishedCelebration.songs.length} canciones. Las canciones ahora aparecen como <span className="text-rose-500 font-bold">"Tocada hoy"</span> en la rotación general para evitar repeticiones próximas.
            </p>

            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 text-left space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {publishedCelebration.songs.length} Cantos actualizados a hoy en el repertorio:
              </span>
              {publishedCelebration.songs.map((song, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {i + 1}. {song.title}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Hoy (0d)
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPublishedCelebration(null)}
              className="w-full py-3 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* MODERN SIDEBAR (Barra Lateral) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        churchSettings={churchSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNewSongModal={() => setIsNewSongModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        filledCount={filledCount}
        totalSlotsCount={slots.length}
        totalSongsCount={songs.length}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsSidebarOpenMobile(true)}
          onOpenNewSongModal={() => setIsNewSongModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          churchSettings={churchSettings}
          filledCount={filledCount}
        />

        {/* Content View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* TAB 1: ARMADOR DE SETLIST (Dashboard dinámico de bloques) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda: Armador de Setlist (Bloque Alabanzas + Bloque Adoraciones) */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <SetlistBuilder
                  slots={slots}
                  allSongs={songs}
                  serviceDate={serviceDate}
                  setServiceDate={setServiceDate}
                  serviceNotes={serviceNotes}
                  setServiceNotes={setServiceNotes}
                  onAssignSongToSlot={handleAssignSongToSlot}
                  onClearSlotSong={handleClearSlotSong}
                  onAddSlot={handleAddSlot}
                  onRemoveSlot={handleRemoveSlot}
                  onAutoSuggest={handleAutoSuggest}
                  onPublishSetlist={handlePublishSetlist}
                  onViewLyrics={handleViewLyrics}
                  onClearAllSlots={handleClearAllSlots}
                  onReorderSlots={handleReorderSlots}
                  onMoveSlot={handleMoveSlot}
                />
              </div>

              {/* Columna Derecha: Repertorio Rápido */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <RepertoireExplorer
                  songs={songs}
                  selectedSongIds={selectedSongIds}
                  onAddToSetlist={handleAddToSetlist}
                  onViewLyrics={handleViewLyrics}
                  onEditSong={(song) => setEditingSong(song)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: REPERTORIO COMPLETO (Biblioteca General de Canciones) */}
          {activeTab === 'repertoire' && (
            <FullRepertoireView
              songs={songs}
              selectedSongIds={selectedSongIds}
              onAddToSetlist={handleAddToSetlist}
              onViewLyrics={handleViewLyrics}
              onEditSong={(song) => setEditingSong(song)}
              onOpenNewSongModal={() => setIsNewSongModalOpen(true)}
              onDeleteSong={handleDeleteSong}
            />
          )}

          {/* TAB 3: MODO ATRIL (Letras & Acordes para Músicos) */}
          {activeTab === 'viewer' && (
            <div className="max-w-4xl mx-auto">
              <LyricsTransposer
                song={selectedSong}
                allSongs={songs}
                currentSetlist={currentSetlistSongs}
                onSelectSong={setSelectedSong}
                onBack={() => setActiveTab('repertoire')}
                onEditSong={(song) => setEditingSong(song)}
              />
            </div>
          )}

          {/* TAB 4: HISTÓRICO DE CULTOS */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <SundayHistory
                history={history}
                onLoadHistoricalSetlist={handleLoadHistoricalSetlist}
                onViewSongLyrics={handleViewSongLyricsById}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-midnight-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
          {churchSettings.name} · Worship PWA · Alabanzas y Adoraciones en Rotación Continua
        </footer>
      </div>

      {/* Modal Nueva Canción */}
      <NewSongModal
        isOpen={isNewSongModalOpen}
        onClose={() => setIsNewSongModalOpen(false)}
        onSaveSong={handleSaveNewSong}
      />

      {/* Modal Editar Canción */}
      <EditSongModal
        isOpen={Boolean(editingSong)}
        song={editingSong}
        onClose={() => setEditingSong(null)}
        onUpdateSong={handleUpdateSong}
        onDeleteSong={handleDeleteSong}
      />

      {/* Modal Configuración de Iglesia & Perfil */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={churchSettings}
        onSaveSettings={handleSaveSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetRepertoire={handleResetRepertoire}
        songsCount={songs.length}
      />
    </div>
  );
}
