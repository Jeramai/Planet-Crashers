'use client';

import { useEffect, useRef } from 'react';
import { primeSounds } from '../game/audio';
import { SpaceScore } from '../game/music/player';
import { useGame } from '../game/store';
import { DANGER_MIN, DANGER_START, dangerRadiusAt } from '../game/tuning';

/* Everything that needs an AudioContext starts here, on one gesture. */
export default function Audio() {
  const { volumes, runId, shots } = useGame();
  const score = useRef(null);

  useEffect(() => {
    const engine = new SpaceScore();
    score.current = engine;

    // Browsers refuse an AudioContext until the player interacts. The same
    // gesture decodes the effect buffers, so the first launch is not silent.
    const begin = () => {
      primeSounds();
      void engine.start();
    };

    window.addEventListener('pointerdown', begin, { once: true });
    window.addEventListener('keydown', begin, { once: true });

    return () => {
      window.removeEventListener('pointerdown', begin);
      window.removeEventListener('keydown', begin);
      engine.stop();
      score.current = null;
    };
  }, []);

  useEffect(() => {
    score.current?.setVolume(volumes.music);
  }, [volumes.music]);

  // The score tightens with the field.
  useEffect(() => {
    score.current?.setTension((DANGER_START - dangerRadiusAt(shots)) / (DANGER_START - DANGER_MIN));
  }, [shots]);

  // A new run gets a new piece.
  useEffect(() => {
    score.current?.reseed(runId);
  }, [runId]);

  return null;
}
