'use client';

import { useEffect, useRef } from 'react';
import { primeSounds } from '../game/audio';
import { SpaceScore } from '../game/music/player';
import { useGame } from '../game/store';
import { FIELD_MIN, FIELD_START, fieldRadiusAt } from '../game/tuning';

/* Everything that needs an AudioContext starts here, on one gesture. */
export default function Audio() {
  const { volumes, runId, shots, score } = useGame();
  const engine = useRef(null);

  useEffect(() => {
    const player = new SpaceScore();
    engine.current = player;

    // Browsers refuse an AudioContext until the player interacts. The same
    // gesture decodes the effect buffers, so the first launch is not silent.
    const begin = () => {
      primeSounds();
      void player.start();
    };

    window.addEventListener('pointerdown', begin, { once: true });
    window.addEventListener('keydown', begin, { once: true });

    return () => {
      window.removeEventListener('pointerdown', begin);
      window.removeEventListener('keydown', begin);
      player.stop();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setVolume(volumes.music);
  }, [volumes.music]);

  // The music tightens with the field, which now answers to how the run is going.
  useEffect(() => {
    const squeeze = (FIELD_START - fieldRadiusAt(shots, score)) / (FIELD_START - FIELD_MIN);
    engine.current?.setTension(Math.min(1, Math.max(0, squeeze)));
  }, [shots, score]);

  // A new run gets a new piece.
  useEffect(() => {
    engine.current?.reseed(runId);
  }, [runId]);

  return null;
}
