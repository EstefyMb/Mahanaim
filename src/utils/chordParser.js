// Chord Parser & Converter Utility
// Converts chord-above-lyrics text (e.g., from LaCuerda.net, Ultimate Guitar, Tablatura)
// into inline bracket notation [Chord] utilized by Worship Manager's transposition engine.

// Standard musical chords regex (English notation with modifiers and bass notes)
const CHORD_REGEX = /^[A-G][#b]?(m|min|maj|dim|aug|sus|add)?[0-9]*((\+|M|b|#)[0-9]*)?(\([^\)]+\))?(\/[A-G][#b]?)?$/i;

// Spanish Solfège chords regex (Do, Re, Mi, Fa, Sol, La, Si)
const SPANISH_CHORD_REGEX = /^(Do|Re|Mi|Fa|Sol|La|Si)[#b]?(m|min|maj|dim|aug|sus|add)?[0-9]*((\+|M|b|#)[0-9]*)?(\([^\)]+\))?(\/(Do|Re|Mi|Fa|Sol|La|Si)[#b]?)?$/i;

/**
 * Checks if a single token is a musical chord
 */
export function isChordToken(token) {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim().replace(/^[\(\[\{]/, '').replace(/[\)\]\}]$/, '').replace(/[,.:;]$/, '');
  if (!clean) return false;
  
  // Ignore purely numbers, punctuation, or short Spanish words
  if (/^[0-9]+$/.test(clean)) return false;
  if (/^(y|o|el|la|de|en|un|tu|su|al|del|por|con|para)$/i.test(clean)) return false;

  return CHORD_REGEX.test(clean) || SPANISH_CHORD_REGEX.test(clean);
}

/**
 * Checks if a given text line is predominantly composed of chords.
 */
export function isChordLine(line) {
  if (!line || typeof line !== 'string') return false;
  const trimmed = line.trim();
  if (!trimmed) return false;

  // If already bracketed chords e.g. [G] [C], it's handled
  if (/^(\[[A-G][^\]]*\]\s*)+$/i.test(trimmed)) return false;

  // Split line into whitespace-separated tokens
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    if (isChordToken(token)) {
      chordCount++;
    }
  }

  // If at least 70% of tokens are valid chords (and at least 1 chord), it's a chord line
  return chordCount > 0 && (chordCount / tokens.length) >= 0.7;
}

/**
 * Normalizes section headers (e.g. "Intro: G C G", "Coro", "Verso 1:", "Puente:")
 */
function normalizeSectionHeader(line) {
  const trimmed = line.trim();
  
  // Section patterns
  const headerMatch = trimmed.match(/^(Intro|Introducci[oó]n|Verso|Estrofa|Coro|Puente|Bridge|Outro|Final|Pre-?coro|Instrumental|Solo)(\s*\d+)?\s*:?\s*(.*)$/i);
  
  if (headerMatch) {
    const rawType = headerMatch[1].toLowerCase();
    const number = headerMatch[2] ? headerMatch[2].trim() : '';
    const remainder = headerMatch[3] ? headerMatch[3].trim() : '';

    let standardType = 'Verso';
    if (/intro/i.test(rawType)) standardType = 'Intro';
    else if (/coro/i.test(rawType)) standardType = 'Coro';
    else if (/puente|bridge/i.test(rawType)) standardType = 'Puente';
    else if (/outro|final/i.test(rawType)) standardType = 'Outro';
    else if (/pre-?coro/i.test(rawType)) standardType = 'Pre-Coro';
    else if (/instrumental|solo/i.test(rawType)) standardType = 'Instrumental';

    const headerLabel = `[${standardType}${number ? ' ' + number : ''}]`;
    return {
      isHeader: true,
      header: headerLabel,
      remainder
    };
  }

  return { isHeader: false, header: '', remainder: '' };
}

/**
 * Extracts chords and their column positions from a chord line.
 */
function getChordsWithPositions(chordLine) {
  const chords = [];
  // Match tokens and their character index
  const regex = /\S+/g;
  let match;

  while ((match = regex.exec(chordLine)) !== null) {
    const token = match[0];
    const index = match.index;
    if (isChordToken(token)) {
      chords.push({
        chord: token.replace(/[\[\]]/g, ''),
        index
      });
    }
  }

  return chords;
}

/**
 * Encloses chord tokens in brackets [Chord] while preserving their column positions.
 * Compensates extra characters added by brackets from trailing spaces when possible.
 */
export function bracketChordTokensInLine(line) {
  if (!line || typeof line !== 'string') return line;

  const tokenRegex = /\S+/g;
  const tokens = [];
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }

  if (tokens.length === 0) return line;

  let result = '';
  let lastPos = 0;
  let shiftAcc = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let whitespace = line.slice(lastPos, token.start);

    // Compensate previous brackets expansion from spacing
    if (shiftAcc > 0 && whitespace.length > 0) {
      const minSpaces = 1;
      const canTrim = Math.max(0, whitespace.length - minSpaces);
      const trimAmount = Math.min(shiftAcc, canTrim);
      whitespace = whitespace.slice(trimAmount);
      shiftAcc -= trimAmount;
    }

    result += whitespace;

    let tokenText = token.text;
    if (isChordToken(tokenText)) {
      if (tokenText.startsWith('[') && tokenText.endsWith(']')) {
        result += tokenText;
      } else {
        const cleanChord = tokenText.replace(/^[\(\[\{]/, '').replace(/[\)\]\}]$/, '');
        result += `[${cleanChord}]`;
        shiftAcc += (cleanChord.length + 2) - tokenText.length;
      }
    } else {
      result += tokenText;
    }

    lastPos = token.end;
  }

  if (lastPos < line.length) {
    result += line.slice(lastPos);
  }

  return result;
}

/**
 * Main Conversion Function:
 * Keeps chords ABOVE the lyrics on their own lines, simply wrapping each chord in brackets [Chord]
 * and normalizing section headers (e.g. Intro, Coro, Verso).
 */
export function convertLaCuerdaToBracketNotation(text) {
  if (!text || typeof text !== 'string') return '';

  const rawLines = text.split(/\r?\n/);
  const outputLines = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Preserve blank lines
    if (!trimmed) {
      outputLines.push('');
      continue;
    }

    // Check if line is a section header (e.g. "Intro: G C G" or "Coro")
    const headerInfo = normalizeSectionHeader(line);
    if (headerInfo.isHeader) {
      outputLines.push(headerInfo.header);

      if (headerInfo.remainder) {
        outputLines.push(bracketChordTokensInLine(headerInfo.remainder));
      }
      continue;
    }

    // Check if line is a chord line: keep on its own line above lyrics, just bracket the chords
    if (isChordLine(line)) {
      outputLines.push(bracketChordTokensInLine(line));
      continue;
    }

    // Lyrics line: keep as is on its own line
    outputLines.push(line);
  }

  // Preserve leading spaces of lines, only trim blank start/end lines
  return outputLines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
}

/**
 * Detects if a text block appears to be in LaCuerda / chords-above-lyrics format
 */
export function isLaCuerdaFormat(text) {
  if (!text || typeof text !== 'string') return false;
  
  // If text already has many brackets like [G], it's probably already formatted
  const bracketMatches = text.match(/\[[A-G][^\]]*\]/g);
  if (bracketMatches && bracketMatches.length >= 4) {
    return false;
  }

  const lines = text.split(/\r?\n/).filter(l => Boolean(l.trim()));
  let chordLineCount = 0;

  for (const line of lines) {
    if (isChordLine(line)) {
      chordLineCount++;
    }
  }

  // If at least 2 chord lines detected without brackets, it's LaCuerda format
  return chordLineCount >= 2;
}
