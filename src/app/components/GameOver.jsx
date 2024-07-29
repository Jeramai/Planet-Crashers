import { useEffect } from 'react';
import planetTypes from '../Enums/planets';
import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function GameOver() {
  const { setGameState, setLives, setPlanetTypeQueue } = useGameContext();

  // On gameover, reset all values
  useEffect(() => {
    setLives(3);
    setPlanetTypeQueue([planetTypes.MOON]);
  }, []);

  return (
    <div className='p-24 flex flex-col items-center gap-5'>
      <div className='text-4xl font-semibold mb-5 text-center'>GAME OVER</div>
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
