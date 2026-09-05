'use client';

/* Phones feel dead without this, and a game that buzzes with no way to stop it
   is worse than one that never does, so it answers to a setting. */
export const HAPTICS = {
  merge: 12,
  chain: [10, 30, 12],
  burn: 70,
  star: [20, 70, 20, 70, 45]
};

export function buzz(pattern, enabled) {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* refused by the browser, which is not worth reacting to */
  }
}
