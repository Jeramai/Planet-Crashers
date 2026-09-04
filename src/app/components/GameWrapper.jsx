'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { useGame } from '../game/store';
import { GameState } from '../game/state';
import { useIsClient } from '../game/use-is-client';
import Scene from './scene/Scene';
import GameOver from './ui/GameOver';
import Hud from './ui/Hud';
import Loading from './ui/Loading';
import Menu from './ui/Menu';
import Options from './ui/Options';
import Paused from './ui/Paused';
import Music from './Music';

const LOADING_FALLBACK_MS = 4000;

export default function GameWrapper() {
  const { gameState, setGameState } = useGame();
  const { active, progress } = useProgress();
  const isClient = useIsClient();
  const [gaveUpWaiting, setGaveUpWaiting] = useState(false);

  // Derived, not latched in an effect: once the loader is idle at 100 it stays there.
  const ready = gaveUpWaiting || (!active && progress >= 100);

  useEffect(() => {
    const bail = window.setTimeout(() => setGaveUpWaiting(true), LOADING_FALLBACK_MS);
    return () => window.clearTimeout(bail);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (gameState === GameState.Playing) setGameState(GameState.Paused);
      else if (gameState === GameState.Paused) setGameState(GameState.Playing);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, setGameState]);

  if (!isClient) return <Loading progress={0} />;

  return (
    <>
      <Scene />
      <Music />

      {gameState === GameState.Playing ? <Hud /> : null}
      {gameState === GameState.Menu ? <Menu /> : null}
      {gameState === GameState.Options ? <Options /> : null}
      {gameState === GameState.Paused ? <Paused /> : null}
      {gameState === GameState.Over ? <GameOver /> : null}

      {ready ? null : <Loading progress={progress} />}
    </>
  );
}
