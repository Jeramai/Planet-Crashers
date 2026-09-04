'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEALT, PlanetType } from './planets';
import { GameState, START_LIVES } from './state';

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

let nextQueueId = 1;

const deal = (type) => ({ id: nextQueueId++, type: type ?? DEALT[Math.floor(Math.random() * DEALT.length)] });
const freshQueue = () => [deal(PlanetType.Moon), ...Array.from({ length: QUEUE_AHEAD - 1 }, () => deal())];

const GameContext = createContext(null);

export default function GameProvider({ children }) {
  const [gameState, setGameState] = useState(GameState.Menu);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(readHighscore);
  const [lives, setLives] = useState(START_LIVES);
  const [queue, setQueue] = useState(freshQueue);
  const [combo, setCombo] = useState(0);
  const [runId, setRunId] = useState(0);
  const livesLeft = useRef(START_LIVES);
  const scoreSoFar = useRef(0);
  const bestSoFar = useRef(0);

  const [volumes, setVolumes] = useState(() => ({
    music: readNumber('musicVolume', 0.35),
    explosion: readNumber('explosionVolume', 0.5),
    merge: readNumber('mergeVolume', 0.5),
    shot: readNumber('shotVolume', 0.5)
  }));

  const setVolume = useCallback((name, value) => {
    setVolumes((v) => ({ ...v, [name]: value }));
    writeNumber(`${name}Volume`, value);
  }, []);

  useEffect(() => {
    bestSoFar.current = Math.max(bestSoFar.current, highscore);
  }, [highscore]);

  // Both counters live in refs so neither updater has to reach for the other.
  const addScore = useCallback((points) => {
    scoreSoFar.current += points;
    setScore(scoreSoFar.current);
    if (scoreSoFar.current <= bestSoFar.current) return;
    bestSoFar.current = scoreSoFar.current;
    setHighscore(bestSoFar.current);
    writeNumber('highscore', bestSoFar.current);
  }, []);

  // The run ends from the event that ended it, not from an effect watching lives.
  const loseLife = useCallback(() => {
    livesLeft.current = Math.max(0, livesLeft.current - 1);
    setLives(livesLeft.current);
    if (livesLeft.current === 0) setGameState(GameState.Over);
  }, []);

  const takeFromQueue = useCallback(() => {
    setQueue((q) => [...q.slice(1), deal()]);
  }, []);

  const startRun = useCallback(() => {
    livesLeft.current = START_LIVES;
    scoreSoFar.current = 0;
    setRunId((n) => n + 1);
    setScore(0);
    setLives(START_LIVES);
    setQueue(freshQueue());
    setCombo(0);
    setGameState(GameState.Playing);
  }, []);

  const value = useMemo(
    () => ({
      gameState,
      setGameState,
      score,
      highscore,
      lives,
      queue,
      combo,
      setCombo,
      runId,
      volumes,
      setVolume,
      addScore,
      loseLife,
      takeFromQueue,
      startRun
    }),
    [gameState, score, highscore, lives, queue, combo, runId, volumes, setVolume, addScore, loseLife, takeFromQueue, startRun]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
