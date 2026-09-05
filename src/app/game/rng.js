/* Deterministic deals, for testing and for sharing a run.

   Without a seed the deal is Math.random, which is right for play and useless
   for comparing two builds: the sequence of planets dominates the outcome, so
   two runs of the same build differ more than two builds do. ?seed=<n> fixes
   the sequence. The physics is not seeded, so runs are close rather than
   identical, but the largest source of variance is gone. */

export function makeRandom(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromUrl() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = new URLSearchParams(window.location.search).get('seed');
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export const newSeed = () => Math.floor(Math.random() * 1e9);

/* Every run gets a seed, whether or not the URL asked for one, so any run can be
   handed to somebody else exactly as it was played. */
export const seedForRun = () => seedFromUrl() ?? newSeed();
