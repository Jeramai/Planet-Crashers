'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { nextId } from './ids';
import { DEALT, PlanetType } from './planets';
import { makeRandom, seedForRun } from './rng';
import { runReducer, startingRun } from './run';
import { fieldRadius } from './tuning';

const QUEUE_AHEAD = 3;
const KEY = 'pc:v1:';

function readNumber(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(KEY + key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function writeNumber(key, value) {
  try {
    localStorage.setItem(KEY + key, String(value));
  } catch {
    /* private mode, settings just do not persist */
  }
}

function readHighscore() {
  if (typeof window === 'undefined') return 0;
  const current = readNumber('highscore', 0);
  if (current > 0) return current;
  try {
    const legacy = Number(localStorage.getItem('highscore'));
    return Number.isFinite(legacy) ? legacy : 0;
  } catch {
    return 0;
  }
}

const deal = (random, type) => ({ id: nextId(), type: type ?? DEALT[Math.floor(random() * DEALT.length)] });
const freshQueue = (random) => [deal(random, PlanetType.Moon), ...Array.from({ length: QUEUE_AHEAD - 1 }, () => deal(random))];

/* A seeded run replays the same deal every time; an unseeded one still gets a
   seed, so it can be shared afterwards. */
function openingDeal() {
  const seed = seedForRun();
  const random = makeRandom(seed);
  return { seed, rng: { next: random }, queue: freshQueue(random) };
}

const GameContext = createContext(null);

export default function GameProvider({ children }) {
  const [run, dispatch] = useReducer(runReducer, null, () => startingRun({ ...openingDeal(), highscore: readHighscore() }));
  const [haptics, setHapticsState] = useState(() => readNumber('haptics', 1) === 1);
  const [volumes, setVolumes] = useState(() => ({
    music: readNumber('musicVolume', 0.45),
    explosion: readNumber('explosionVolume', 0.5),
    merge: readNumber('mergeVolume', 0.5),
    shot: readNumber('shotVolume', 0.5)
  }));

  useEffect(() => {
    if (run.highscore > 0) writeNumber('highscore', run.highscore);
  }, [run.highscore]);

  const setHaptics = useCallback((value) => {
    setHapticsState(value);
    writeNumber('haptics', value ? 1 : 0);
  }, []);

  const setVolume = useCallback((name, value) => {
    setVolumes((v) => ({ ...v, [name]: value }));
    writeNumber(`${name}Volume`, value);
  }, []);

  const setGameState = useCallback((to) => dispatch({ type: 'goto', to }), []);
  const showRules = useCallback((from) => dispatch({ type: 'openRules', from }), []);
  const closeRules = useCallback(() => dispatch({ type: 'closeRules' }), []);
  const startRun = useCallback(() => dispatch({ type: 'start', ...openingDeal() }), []);
  const addScore = useCallback((points) => dispatch({ type: 'score', points }), []);
  const loseLife = useCallback(() => dispatch({ type: 'burn' }), []);
  const gainLife = useCallback(() => dispatch({ type: 'star' }), []);
  const setBoard = useCallback((board) => dispatch({ type: 'board', board }), []);
  const countMerge = useCallback((planet, chain) => dispatch({ type: 'merge', planet, chain }), []);
  const setCombo = useCallback((value) => dispatch({ type: 'combo', value }), []);

  const takeFromQueue = useCallback(() => dispatch({ type: 'shoot', dealt: deal(run.rng.next) }), [run.rng]);

  // The draw only happens when the slot is empty, so a trade cannot quietly
  // advance the seeded deal and put two players on different sequences.
  const swapHold = useCallback(() => {
    if (!run.queue[0]) return;
    if (run.hold === null) dispatch({ type: 'hold', dealt: deal(run.rng.next) });
    else dispatch({ type: 'hold', traded: { id: nextId(), type: run.hold } });
  }, [run.queue, run.hold, run.rng]);

  // The field is sized to what is inside it, so it belongs with the run rather
  // than with any one component that happens to draw it.
  const field = fieldRadius(run.board, run.shots, run.score, run.merges);

  const value = useMemo(
    () => ({
      ...run,
      field,
      haptics,
      setHaptics,
      volumes,
      setVolume,
      setGameState,
      showRules,
      closeRules,
      startRun,
      addScore,
      loseLife,
      gainLife,
      setBoard,
      countMerge,
      setCombo,
      takeFromQueue,
      swapHold
    }),
    [
      run,
      field,
      haptics,
      setHaptics,
      volumes,
      setVolume,
      setGameState,
      showRules,
      closeRules,
      startRun,
      addScore,
      loseLife,
      gainLife,
      setBoard,
      countMerge,
      setCombo,
      takeFromQueue,
      swapHold
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
