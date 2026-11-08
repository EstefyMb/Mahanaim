// Mock Data para Worship PWA (3 Alabanza + 2 Adoración)

export const DEFAULT_CHURCH_SETTINGS = {
  name: '',
  subtitle: 'Ministerio de Alabanza & Adoración',
  logoType: 'preset', // 'preset' | 'custom'
  logoPreset: 'harp', // 'cross', 'flame', 'dove', 'crown', 'harp', 'star'
  customLogoUrl: '',
  sharedEmail: '',
  sessionActive: true,
  sessionUser: 'Director de Alabanza'
};

export const CATEGORIES = {
  alabanza: {
    id: 'alabanza',
    name: 'Alabanza',
    emoji: '🔥',
    badgeClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30',
    dotClass: 'bg-amber-400',
    iconColor: 'text-amber-500 dark:text-amber-400',
    glowClass: 'shadow-amber-500/10'
  },
  adoracion: {
    id: 'adoracion',
    name: 'Adoración',
    emoji: '🕊️',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30',
    dotClass: 'bg-indigo-400',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    glowClass: 'shadow-indigo-500/10'
  }
};

export const ROTATION_STATUS = {
  green: {
    id: 'green',
    label: 'Óptima rotación',
    shortLabel: 'Listo',
    sublabel: 'Más de 28 días',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30'
  },
  yellow: {
    id: 'yellow',
    label: 'Reciente',
    shortLabel: 'Reciente',
    sublabel: '14 a 27 días',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/30'
  },
  red: {
    id: 'red',
    label: 'Muy reciente / Descansar',
    shortLabel: 'Descansar',
    sublabel: 'Menos de 14 días',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/30'
  }
};

// Helper para calcular el estado de rotación según días
export function getRotationStatus(daysAgo) {
  if (daysAgo === undefined || daysAgo === null || daysAgo > 28) return ROTATION_STATUS.green;
  if (daysAgo >= 14) return ROTATION_STATUS.yellow;
  return ROTATION_STATUS.red;
}

// Helper para formatear fecha simulada
export function formatDateAgo(daysAgo) {
  if (daysAgo === undefined || daysAgo === null) return 'Nunca tocada aún';
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const INITIAL_SONGS = [];

export const SUNDAY_HISTORY = [];

// Helper para transposición musical real
export const CHROMATIC_SCALE_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_SCALE_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord, semitones) {
  if (!chord || semitones === 0) return chord;
  
  if (chord.includes('/')) {
    const [root, bass] = chord.split('/');
    return `${transposeChord(root, semitones)}/${transposeChord(bass, semitones)}`;
  }

  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const rootNote = match[1];
  const suffix = match[2];

  let index = CHROMATIC_SCALE_SHARPS.indexOf(rootNote);
  if (index === -1) {
    index = CHROMATIC_SCALE_FLATS.indexOf(rootNote);
  }
  if (index === -1) return chord;

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  const preferFlats = rootNote.includes('b');
  const transposedRoot = preferFlats ? CHROMATIC_SCALE_FLATS[newIndex] : CHROMATIC_SCALE_SHARPS[newIndex];

  return transposedRoot + suffix;
}

export function transposeLyricsAndChords(text, semitones) {
  if (!text || semitones === 0) return text;
  return text.replace(/\[([A-G][^\]]*)\]/g, (match, chord) => {
    return `[${transposeChord(chord, semitones)}]`;
  });
}

// Calcular diferencia de semitonos entre dos notas raíz
export function getSemitonesDifference(fromNote, toNote) {
  if (!fromNote || !toNote) return 0;
  const matchFrom = fromNote.match(/^([A-G][#b]?)/);
  const matchTo = toNote.match(/^([A-G][#b]?)/);
  if (!matchFrom || !matchTo) return 0;

  const fromRoot = matchFrom[1];
  const toRoot = matchTo[1];

  let fromIdx = CHROMATIC_SCALE_SHARPS.indexOf(fromRoot);
  if (fromIdx === -1) fromIdx = CHROMATIC_SCALE_FLATS.indexOf(fromRoot);

  let toIdx = CHROMATIC_SCALE_SHARPS.indexOf(toRoot);
  if (toIdx === -1) toIdx = CHROMATIC_SCALE_FLATS.indexOf(toRoot);

  if (fromIdx === -1 || toIdx === -1) return 0;

  let diff = (toIdx - fromIdx) % 12;
  if (diff > 6) diff -= 12;
  if (diff < -5) diff += 12;
  return diff;
}
