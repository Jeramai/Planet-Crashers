'use client';

import { useEffect, useRef } from 'react';
import { soundUrl } from '../game/assets';
import { useGame } from '../game/store';

const TRACKS = ['soundtrack-1', 'soundtrack-2', 'soundtrack-3'];

export default function Music() {
  const { volumes } = useGame();
  const audio = useRef(null);
  const track = useRef(0);

  useEffect(() => {
    track.current = Math.floor(Math.random() * TRACKS.length);
    const el = new Audio(soundUrl(TRACKS[track.current]));
    el.volume = 0;
    audio.current = el;

    const advance = () => {
      track.current = (track.current + 1) % TRACKS.length;
      el.src = soundUrl(TRACKS[track.current]);
      el.play().catch(() => {});
    };

    // Browsers refuse audio until the player interacts, so the first gesture starts it.
    const start = () => el.play().catch(() => {});

    el.addEventListener('ended', advance);
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });

    return () => {
      el.removeEventListener('ended', advance);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      el.pause();
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.volume = Math.min(1, Math.max(0, volumes.music));
  }, [volumes.music]);

  return null;
}
