'use client';

import { useGameContext } from './Context';
import Game from './Game';
import GameOver from './GameOver';
import Menu from './Menu';
import Overlays from './Overlays';

export default function GameWrapper() {
  const { gameState } = useGameContext();

  return (
    <>
      {gameState === 'MENU' ? <Menu /> : null}
      {gameState === 'GAME' ? (
        <>
          <Game />
          <Overlays />
        </>
      ) : null}
      {gameState === 'OPTIONS' ? <GameOver /> : null}
      {gameState === 'GAME_OVER' ? <GameOver /> : null}
    </>
  );
}
