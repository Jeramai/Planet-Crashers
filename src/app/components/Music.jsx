'use client';

import { useEffect, useRef } from 'react';
import { GameEvent, on } from '../game/events';
import { SpaceScore } from '../game/music/player';
import { useGame } from '../game/store';

export default function Music() {
  const { volumes, runId } = useGame();
  const score = useRef(null);

  useEffect(() => {
    const engine = new SpaceScore();
    score.current = engine;

    // Browsers refuse an AudioContext until the player interacts, so the first
    // gesture starts it.
    const begin = () => void engine.start();
    window.addEventListener('pointerdown', begin, { once: true });
    window.addEventListener('keydown', begin, { once: true });

    const offTension = on(GameEvent.Tension, (value) => engine.setTension(value));

    return () => {
      window.removeEventListener('pointerdown', begin);
      window.removeEventListener('keydown', begin);
      offTension();
      engine.stop();
      score.current = null;
    };
  }, []);

  useEffect(() => {
    score.current?.setVolume(volumes.music);
  }, [volumes.music]);

  // A new run gets a new piece.
  useEffect(() => {
    score.current?.reseed(runId);
    score.current?.setTension(0);
  }, [runId]);

  return null;
}
