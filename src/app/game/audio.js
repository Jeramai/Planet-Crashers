'use client';

import { soundUrl } from './assets';
import { createAudio, getAudio } from './sound-context';

const NAMES = ['shot', 'merge', 'explosion'];

/* Earth sits at 1.0. A Moon comes out most of an octave up and a Sun most of an
   octave down, so the size of a merge is audible without looking at it. */
const REFERENCE_RADIUS = 1.2;
const PITCH_CURVE = 0.45;
const MIN_RATE = 0.55;
const MAX_RATE = 1.9;
const DETUNE = 0.06;

const buffers = new Map();
let primed = false;

export function primeSounds() {
  const audio = createAudio();
  if (!audio || primed) return;
  primed = true;

  NAMES.forEach((name) => {
    fetch(soundUrl(name))
      .then((response) => {
        if (!response.ok) throw new Error(`${name}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((raw) => audio.ctx.decodeAudioData(raw))
      .then((buffer) => buffers.set(name, buffer))
      .catch(() => {
        /* one missing effect is not worth breaking the run over */
      });
  });
}

function rateFor(radius) {
  const rate = (REFERENCE_RADIUS / Math.max(0.05, radius)) ** PITCH_CURVE;
  const jittered = rate * (1 + (Math.random() - 0.5) * DETUNE);
  return Math.min(MAX_RATE, Math.max(MIN_RATE, jittered));
}

export function playSound(name, volume = 0.5, radius = REFERENCE_RADIUS) {
  if (volume <= 0) return;

  const audio = getAudio();
  const buffer = buffers.get(name);
  if (!audio || !buffer) return;

  const source = audio.ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rateFor(radius);

  const gain = audio.ctx.createGain();
  // Bigger bodies land heavier as well as lower.
  gain.gain.value = Math.min(1, volume * (0.75 + 0.35 * Math.min(1, radius / 3)));

  source.connect(gain).connect(audio.effects);
  source.start();
}
