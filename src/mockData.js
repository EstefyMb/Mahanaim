// Mock Data para Worship PWA (3 Alabanza + 2 Adoración)

export const DEFAULT_CHURCH_SETTINGS = {
  name: 'Iglesia Gracia & Verdad',
  subtitle: 'Ministerio de Alabanza & Adoración',
  logoType: 'preset', // 'preset' | 'custom'
  logoPreset: 'harp', // 'cross', 'flame', 'dove', 'crown', 'harp', 'star'
  customLogoUrl: '',
  sharedEmail: 'equipo@alabanza.org',
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

export const INITIAL_SONGS = [
  // --- ALABANZAS ---
  {
    id: 'song-1',
    title: 'Digno de Alabar (Lion and the Lamb)',
    artist: 'Bethel Music / Leeland',
    originalKey: 'B',
    category: 'alabanza',
    daysAgo: 42, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(42),
    lyricsAndChords: `[Intro]
[B]  [E]  [G#m]  [F#]

[Verso 1]
[B]Viene en las nubes, reyes caerán
[C#m]Cadenas se rompen, los [E]hombres clamarán
¿Quién parará al Señor [F#]Todopoderoso?

[Coro]
Nuestro [B]Dios es el León, rugiendo en [F#]poder
Peleando la [G#m]batalla, el enemigo [E]caerá
Toda rodilla se [B]doblará ante [F#]Él
Nuestro [B]Dios es Cordero que fue [F#]inmolado
Su sangre en la [G#m]cruz libertó al [E]pecador
Toda rodilla se [B]doblará ante el Cordero y el [F#]León

[Puente]
¿Quién parará al Se[C#m]ñor Todopode[B/D#]roso?
¿Quién parará al Se[E]ñor Todopode[F#]roso?`
  },
  {
    id: 'song-2',
    title: 'En Tu Luz',
    artist: 'En Espíritu y En Verdad',
    originalKey: 'D',
    category: 'alabanza',
    daysAgo: 35, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(35),
    lyricsAndChords: `[Intro]
[D]  [G]  [Bm]  [A]

[Verso 1]
[D]Todo lo que anhelo, [G]todo lo que busco
[Bm]Es estar en Tu presencia, Señor [A]
[D]Eres mi consuelo, [G]mi refugio eterno
[Bm]En Tus brazos encuentro [A]paz

[Coro]
En Tu [D]luz veo la luz, en Tu [G]gracia me gozo
Jesús, [Bm]Tú eres todo para [A]mí
En Tu [D]luz veo la luz, Tu a[G]mor me cautiva
Por la e[Bm]ternidad te alaba[A]ré [D]`
  },
  {
    id: 'song-3',
    title: 'El León de Judá',
    artist: 'Robin Mark / Paul Wilbur',
    originalKey: 'Am',
    category: 'alabanza',
    daysAgo: 29, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(29),
    lyricsAndChords: `[Intro]
[Am]  [F]  [C]  [G]

[Verso 1]
[Am]Oye la voz de los que cantan
[F]Oye el clamor de redención
[C]El León de Judá ha vencido
[G]Rompió cadenas con poder

[Coro]
[Am]Ruge, ruge León de Judá
[F]Ruge con fuego y tempestad
[C]Todo principado caerá
[G]Ante el Gran Yo [Am]Soy`
  },
  {
    id: 'song-4',
    title: 'Fiesta en el Desierto',
    artist: 'Montesanto',
    originalKey: 'F#m',
    category: 'alabanza',
    daysAgo: 21, // 🟡 Amarillo (14 a 27 días)
    lastPlayedDate: formatDateAgo(21),
    lyricsAndChords: `[Intro]
[F#m]  [D]  [A]  [E]

[Verso 1]
[F#m]Aunque la higuera no florezca
[D]Y no haya fruto en las vides
[A]Yo me alegraré en el Señor
[E]En el Dios de mi salvación

[Coro]
[F#m]Hay fiesta, fiesta en el desierto
[D]Hay gozo en medio de la prueba
[A]Danzaré, me regocijaré
[E]Porque mi Dios vive y reina hoy [F#m]`
  },
  {
    id: 'song-5',
    title: 'Grande y Fuerte',
    artist: 'Miel San Marcos',
    originalKey: 'Em',
    category: 'alabanza',
    daysAgo: 10, // 🔴 Rojo (<14 días)
    lastPlayedDate: formatDateAgo(10),
    lyricsAndChords: `[Intro]
[Em]  [C]  [D]  [Em]

[Verso 1]
[Em]Grande y fuerte es nuestro Dios
[C]Grande y fuerte es nuestro Dios
[D]Grande y fuerte es nuestro Dios
[Em]Vestido en gloria y majestad

[Coro]
Canten al [C]Señor con júbilo
[D]Griten con voz de triunfo
[Em]Porque Él reina con poder`
  },
  {
    id: 'song-11',
    title: 'A Danzar',
    artist: 'Gateway Worship Español',
    originalKey: 'G',
    category: 'alabanza',
    daysAgo: 60, // 🟢 Verde (60 días)
    lastPlayedDate: formatDateAgo(60),
    lyricsAndChords: `[Intro]
[G]  [C]  [Em]  [D]

[Verso]
[G]Tú cambiaste mi lamento en baile
[C]Quitaste mi luto y dolor
[Em]Me vestiste con ropas de fiesta
[D]Para siempre cantar Tu loor

[Coro]
A [G]danzar, celebremos Su victoria
A [C]danzar, cantemos de Su gloria
Al [Em]Señor que nos dio liber[D]tad [G]`
  },
  {
    id: 'song-12',
    title: 'Tú Eres Santo (Príncipe de Paz)',
    artist: 'Michael W. Smith',
    originalKey: 'E',
    category: 'alabanza',
    daysAgo: null, // 🟢 Verde (Nunca tocada)
    lastPlayedDate: 'Nunca tocada aún',
    lyricsAndChords: `[Intro]
[E]  [A]  [F#m]  [B]

[Verso]
[E]Tú eres Santo (Tú eres Santo)
[A]Poderoso (Poderoso)
[F#m]Digno de gloria (Digno de gloria)
[B]De recibir loor

[Coro]
Y yo [A]cantaré y alaba[B]ré
Al [C#m]Rey que es digno
Te a[A]maré y adoraré
Ante [B]Ti me postro [E]`
  },

  // --- ADORACIONES ---
  {
    id: 'song-6',
    title: 'La Bondad de Dios (Goodness of God)',
    artist: 'Bethel Music / Jenn Johnson',
    originalKey: 'G',
    category: 'adoracion',
    daysAgo: 45, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(45),
    lyricsAndChords: `[Intro]
[G]  [C]  [G]  [C]

[Verso 1]
Te [G]amo, Dios, Tu gracia no me [C]falla
En Tus [G]manos están todos mis [D/F#]días[Em]
Desde que des[C]pierto hasta que me [G]acueste[D/F#]
[Em]Yo canta[C]ré de la [D]bondad de [G]Dios

[Coro]
Toda mi [C]vida has sido bueno
Toda mi [G]vida has sido tan, tan [D]fiel
Con cada a[C]liento que me das, [G]oh Señor[D/F#]
[Em]Yo canta[C]ré de la [D]bondad de [G]Dios

[Puente]
Tu fide[C]lidad me persigue, me [D]sigue a donde [G]voy
Tu fide[C]lidad me persigue, me [D]sigue a donde [G]voy
Todo mi [C]ser te entrego a Ti, [D]Señor te rindo [Em]todo
Tu fide[C]lidad me persigue, me [D]sigue a donde [G]voy`
  },
  {
    id: 'song-7',
    title: 'Tumbas a Jardines (Graves Into Gardens)',
    artist: 'Elevation Worship / Brandon Lake',
    originalKey: 'B',
    category: 'adoracion',
    daysAgo: 38, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(38),
    lyricsAndChords: `[Intro]
[B]  [E]  [B]  [E]

[Verso 1]
[B]Busqué en el mundo por algo que llenara
[E]Mi sed más profunda y nunca me bastó
[G#m]Pero viniste Tú con gracia y [F#]amor
[E]Y todo vacío se desvaneció

[Coro]
No hay [B]nada, nada mejor que Tú
No hay [G#m]nada, nada mejor que Tú
No hay [E]nada, no hay nada mejor que [B]Tú

[Puente]
Tú cambias [B]tumbas en jardines
Resucitas [G#m]huesos secos
Conviertes [E]duelo en danza
Solo Tú lo puedes ha[B]cer`
  },
  {
    id: 'song-8',
    title: 'Hermoso Nombre (What a Beautiful Name)',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    category: 'adoracion',
    daysAgo: 30, // 🟢 Verde (>28 días)
    lastPlayedDate: formatDateAgo(30),
    lyricsAndChords: `[Intro]
[D]  [G]  [Bm]  [A]

[Verso 1]
Tú [D]fuiste la Palabra en el principio
Uno [G]con Dios, el [Bm]Gran Crea[A]dor
Tu [Bm]gloria oculta en Tu [A/C#]creación
En [D]Cristo se reve[G]ló

[Coro]
Cuán hermoso su [D]nombre es, cuán hermoso su [A]nombre es
El nombre de [Bm]Jesús, [A]mi [G]Rey
Cuán hermoso su [D/F#]nombre es, nada se [A]compara a Él
Cuán hermoso su [Bm]nombre es, el [A]nombre de Je[G]sús`
  },
  {
    id: 'song-9',
    title: 'Gracias por la Cruz',
    artist: 'En Espíritu y En Verdad',
    originalKey: 'E',
    category: 'adoracion',
    daysAgo: 14, // 🟡 Amarillo (14 a 27 días)
    lastPlayedDate: formatDateAgo(14),
    lyricsAndChords: `[Intro]
[E]  [B]  [C#m]  [A]

[Verso 1]
[E]Gracias por la cruz, [B]oh Dios
El [C#m]precio que pagas[B]te por mí
Llevaste mi mal[A]dad, mi culpa y dolor
Por [B]Tu amor, gracia sin [E]fin

[Coro]
[E]Digno es el Cordero [B]Santo
[C#m]Sentado en el trono de amor[B]
[A]Hoy te corona[E]mos Rey
[F#m]Vencedor, Majes[B]tuoso
[E]Digno es el Cor[B]dero [E]de Dios`
  },
  {
    id: 'song-10',
    title: 'Rey de Reyes',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    category: 'adoracion',
    daysAgo: 7, // 🔴 Rojo (<14 días)
    lastPlayedDate: formatDateAgo(7),
    lyricsAndChords: `[Intro]
[D]  [G]  [D]  [G]

[Verso 1]
[D]En la oscuridad [G]esperábamos
[A]Sin esperanza [D]ni paz
Hasta que del cielo corrien[G]do
Vino el [A]amor a alum[D]brar

[Coro]
Alabemos [D]al Padre, alabemos [G]al Hijo
Alabemos [Bm]al Santo Espíritu de [A]Dios
Gloria y majes[D]tad, Dios de amor y [G]gracia
Alabemos [Bm]por siempre al [A]Rey de [D]Reyes`
  },
  {
    id: 'song-13',
    title: 'Cuán Grande Es Dios',
    artist: 'Chris Tomlin',
    originalKey: 'G',
    category: 'adoracion',
    daysAgo: 55, // 🟢 Verde (55 días)
    lastPlayedDate: formatDateAgo(55),
    lyricsAndChords: `[Intro]
[G]  [Em]  [C]  [D]

[Verso 1]
El es[G]plendor de un Rey, vestido en majestad
La [Em]tierra alegre está, la tierra alegre está
Se [C]cubre de Su luz, tinieblas huirán
Al [D]oír Su voz temblarán

[Coro]
Cuán [G]grande es Dios, cántale: Cuán [Em]grande es Dios
Todos lo ve[C]rán, cuán [D]grande es [G]Dios`
  }
];

// Historial cronológico con los 5 cantos exactos (3 Alabanza + 2 Adoración)
export const SUNDAY_HISTORY = [
  {
    id: 'history-1',
    date: '19 de Octubre, 2026',
    relativeDays: 'Hace 4 días',
    leader: 'David Rodríguez',
    theme: 'Victoria y Gracia',
    notes: 'Las 3 alabanzas iniciales prepararon el ambiente para las 2 adoraciones íntimas.',
    setlist: [
      { order: 1, songId: 'song-1', title: 'Digno de Alabar', key: 'B', category: 'alabanza' },
      { order: 2, songId: 'song-2', title: 'En Tu Luz', key: 'D', category: 'alabanza' },
      { order: 3, songId: 'song-5', title: 'Grande y Fuerte', key: 'Em', category: 'alabanza' },
      { order: 4, songId: 'song-6', title: 'La Bondad de Dios', key: 'G', category: 'adoracion' },
      { order: 5, songId: 'song-8', title: 'Hermoso Nombre', key: 'D', category: 'adoracion' }
    ]
  },
  {
    id: 'history-2',
    date: '12 de Octubre, 2026',
    relativeDays: 'Hace 11 días',
    leader: 'Priscila Mendoza',
    theme: 'El Gozo de la Salvación',
    notes: 'Tiempo congregacional fluido de 5 cantos.',
    setlist: [
      { order: 1, songId: 'song-3', title: 'El León de Judá', key: 'Am', category: 'alabanza' },
      { order: 2, songId: 'song-4', title: 'Fiesta en el Desierto', key: 'F#m', category: 'alabanza' },
      { order: 3, songId: 'song-2', title: 'En Tu Luz', key: 'D', category: 'alabanza' },
      { order: 4, songId: 'song-7', title: 'Tumbas a Jardines', key: 'B', category: 'adoracion' },
      { order: 5, songId: 'song-9', title: 'Gracias por la Cruz', key: 'E', category: 'adoracion' }
    ]
  },
  {
    id: 'history-3',
    date: '5 de Octubre, 2026',
    relativeDays: 'Hace 18 días',
    leader: 'Carlos Morales',
    theme: 'Fidelidad Inagotable',
    notes: 'Excelente rotación y balance de voces.',
    setlist: [
      { order: 1, songId: 'song-1', title: 'Digno de Alabar', key: 'B', category: 'alabanza' },
      { order: 2, songId: 'song-3', title: 'El León de Judá', key: 'Am', category: 'alabanza' },
      { order: 3, songId: 'song-4', title: 'Fiesta en el Desierto', key: 'F#m', category: 'alabanza' },
      { order: 4, songId: 'song-6', title: 'La Bondad de Dios', key: 'G', category: 'adoracion' },
      { order: 5, songId: 'song-10', title: 'Rey de Reyes', key: 'D', category: 'adoracion' }
    ]
  }
];

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
