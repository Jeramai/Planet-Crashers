'use client';

/* One AudioContext for the whole game. The score and the effects share it, and
   share the limiter on the way out, so a merge landing on a loud beat cannot
   clip the output. */

let audio = null;

export function getAudio() {
  return audio;
}

export function createAudio() {
  if (audio) return audio;

  const Ctor = typeof window === 'undefined' ? null : (window.AudioContext ?? window.webkitAudioContext);
  if (!Ctor) return null;

  const ctx = new Ctor();

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.004;
  limiter.release.value = 0.25;
  limiter.connect(ctx.destination);

  const music = ctx.createGain();
  music.connect(limiter);

  const effects = ctx.createGain();
  effects.connect(limiter);

  audio = { ctx, limiter, music, effects };
  return audio;
}
