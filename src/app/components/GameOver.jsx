import { useEffect } from 'react';
import planetTypes from '../Enums/planets';
import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function GameOver() {
  const { setGameState, setLives, setPlanetTypeQueue, setScore } = useGameContext();

  // On gameover, reset all values
  useEffect(() => {
    setPlanetTypeQueue([planetTypes.MOON]);
    setScore(0);
    setLives(3);
  }, [setLives, setPlanetTypeQueue]);

  return (
    <div className='py-24 px-8 flex flex-col items-center gap-5'>
      <div className='text-4xl font-semibold mb-5 text-center'>GAME OVER</div>
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
