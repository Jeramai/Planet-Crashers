import { useEffect } from 'react';
import planetTypes from '../Enums/planets';
import { useGameContext } from './Context';

export default function GameOver() {
  const { setGameState, setLives, setPlanetTypeQueue } = useGameContext();

  // On gameover, reset all values
  useEffect(() => {
    setLives(3);
    setPlanetTypeQueue([planetTypes.MOON]);
  }, []);

  return (
    <div>
      <div onClick={() => setGameState('MENU')}>MENU</div>
    </div>
  );
}
