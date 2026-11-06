// Helper para formatear el setlist para compartir en WhatsApp y redes sociales
// Formato requerido:
// DOMINGO (DIA) DE (MES) (en MAYÚSCULAS)
// [línea en blanco]
// • Nombre de Canción / Nombre de Autor
// • Nombre de Canción 2 / Nombre de Autor 2
// [línea en blanco]
// • Nombre de Canción 3 / Nombre de Autor 3

export function formatSetlistForSocialShare(slotsOrItems = [], serviceDateString = '', allSongs = []) {
  // 1. Encabezado de Fecha
  let dateHeader = 'DOMINGO';

  if (serviceDateString) {
    const match = serviceDateString.match(/(\d{1,2})\s*(?:de\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
    if (match) {
      dateHeader = `DOMINGO ${match[1]} DE ${match[2]}`.toUpperCase();
    } else {
      const dateObj = new Date(serviceDateString + (serviceDateString.length === 10 ? 'T12:00:00' : ''));
      if (!isNaN(dateObj.getTime())) {
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('es-ES', { month: 'long' });
        dateHeader = `DOMINGO ${day} DE ${month}`.toUpperCase();
      }
    }
  }

  // Capitalizar la primera letra de cada palabra
  const formatCapitalized = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .trim()
      .split(/\s+/)
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  // 2. Agrupación de canciones
  const alabanzas = [];
  const adoraciones = [];

  slotsOrItems.forEach(item => {
    const song = item.song || item;
    if (!song || (!song.title && !item.title)) return;

    // Buscar si falta el artista (por ejemplo en historiales anteriores)
    const songId = song.songId || song.id || item.songId || item.id;
    const foundInAll = allSongs.find(s => s.id === songId);

    const rawTitle = song.title || item.title || foundInAll?.title || '';
    const rawArtist = song.artist || item.artist || foundInAll?.artist || '';

    const formattedTitle = formatCapitalized(rawTitle);
    const formattedArtist = formatCapitalized(rawArtist);

    // Formato con viñeta de punto y autor: • Cancion / Autor
    let line = `• ${formattedTitle}`;
    if (formattedArtist) {
      line += ` / ${formattedArtist}`;
    }

    const category = item.category || song.category || foundInAll?.category;
    if (category === 'adoracion') {
      adoraciones.push(line);
    } else {
      alabanzas.push(line);
    }
  });

  const blocks = [];
  if (alabanzas.length > 0) {
    blocks.push(alabanzas.join('\n'));
  }
  if (adoraciones.length > 0) {
    blocks.push(adoraciones.join('\n'));
  }

  return `${dateHeader}\n\n${blocks.join('\n\n')}`;
}
