/* Pure composition. No WebAudio here, so the musical decisions stay readable. */

const SCALES = {
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10]
};

const MODES = ['aeolian', 'dorian', 'lydian', 'phrygian'];

/* Slow, unresolved movement. Nothing lands on the tonic at the end of a loop,
   so the score never sounds like it finished. */
const PROGRESSIONS = [
  [0, 5, 3, 4],
  [0, 3, 5, 4],
  [0, 6, 4, 3],
  [5, 3, 0, 4],
  [0, 4, 6, 3]
];

export const BEATS_PER_CHORD = 8;
export const CHORDS = 4;

function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function degreeToSemitone(scale, degree) {
  const octave = Math.floor(degree / scale.length);
  return scale[((degree % scale.length) + scale.length) % scale.length] + 12 * octave;
}

export const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12);

export function composeScore(seed) {
  const r = rng(seed);
  const mode = MODES[Math.floor(r() * MODES.length)];

  return {
    mode,
    scale: SCALES[mode],
    root: 38 + Math.floor(r() * 5),
    bpm: 52 + Math.floor(r() * 16),
    progression: PROGRESSIONS[Math.floor(r() * PROGRESSIONS.length)],
    // A sparse figure reused every loop, so the bells have a shape rather than
    // wandering. Tension decides how much of it is actually played.
    motif: Array.from({ length: BEATS_PER_CHORD }, () => (r() < 0.34 ? Math.floor(r() * 8) : null))
  };
}

/* Stacked thirds, an octave above the root. Voiced any lower and the chord turns
   to mud long before the lowpass gets to it; the sub covers the bottom. */
export function chordNotes(score, chordIndex) {
  const base = score.progression[chordIndex % score.progression.length];
  return [0, 2, 4, 6].map((step) => score.root + 12 + degreeToSemitone(score.scale, base + step));
}

export function subNote(score, chordIndex) {
  const base = score.progression[chordIndex % score.progression.length];
  return score.root + degreeToSemitone(score.scale, base);
}

export function bellNote(score, chordIndex, degree) {
  const base = score.progression[chordIndex % score.progression.length];
  return score.root + 24 + degreeToSemitone(score.scale, base + degree);
}
