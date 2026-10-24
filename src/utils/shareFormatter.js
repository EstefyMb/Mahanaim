// Helper for formatting setlist for WhatsApp and social networks sharing
// Strict format requested:
// DOMINGO (DIA) DE (MES) (in uppercase)
// [blank line]
// song1/artist1 (in lowercase)
// song2/artist2
// [blank line]
// song3/artist3
// song4/artist4

export function formatSetlistForSocialShare(slotsOrItems, serviceDateString) {
  // 1. Date Header
  let dateHeader = 'DOMINGO';

  if (serviceDateString) {
    // Check if it's already a Spanish text like "25 de octubre de 2026"
    const match = serviceDateString.match(/(\d{1,2})\s*(?:de\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
    if (match) {
      dateHeader = `DOMINGO ${match[1]} DE ${match[2]}`.toUpperCase();
    } else {
      // YYYY-MM-DD
      const dateObj = new Date(serviceDateString + (serviceDateString.length === 10 ? 'T12:00:00' : ''));
      if (!isNaN(dateObj.getTime())) {
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('es-ES', { month: 'long' });
        dateHeader = `DOMINGO ${day} DE ${month}`.toUpperCase();
      }
    }
  }

  // 2. Songs grouping
  const alabanzas = [];
  const adoraciones = [];

  slotsOrItems.forEach(item => {
    const song = item.song || item;
    if (!song || !song.title) return;

    const title = (song.title || '').trim().toLowerCase();
    const artist = (song.artist || '').trim().toLowerCase();
    const line = `${title}/${artist}`;

    const category = item.category || song.category;
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
