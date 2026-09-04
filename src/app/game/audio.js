import { soundUrl } from './assets';

const VOICES = 4;
const pools = new Map();

function pool(name) {
  let found = pools.get(name);
  if (!found) {
    found = { clips: Array.from({ length: VOICES }, () => new Audio(soundUrl(name))), at: 0 };
    pools.set(name, found);
  }
  return found;
}

/* Four voices per clip, reused. The old build made one Audio element per planet. */
export function playSound(name, volume = 0.5) {
  if (typeof window === 'undefined' || volume <= 0) return;
  const p = pool(name);
  const clip = p.clips[p.at];
  p.at = (p.at + 1) % VOICES;
  clip.volume = Math.min(1, Math.max(0, volume));
  clip.currentTime = 0;
  clip.play().catch(() => {});
}
