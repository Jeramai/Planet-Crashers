'use client';

import { useGameContext } from './Context';
import Game from './Game';
import GameOver from './GameOver';
import SoundHelper from './Helpers/SoundHelper';
import Menu from './Menu';
import Options from './Options';
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
          <SoundHelper />
        </>
      ) : null}
      {gameState === 'OPTIONS' ? <Options /> : null}
      {gameState === 'GAME_OVER' ? <GameOver /> : null}
    </>
  );
}
