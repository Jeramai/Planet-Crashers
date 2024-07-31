import { useEffect, useState } from 'react';
import { useGameContext } from './Context';
import Button from './Helpers/Button';
import SwipeToConfirmButton from './Helpers/SwipeToConfirmButton';

export default function Options() {
  const { setGameState, setHighscore } = useGameContext();

  const [msg, setMsg] = useState('');

  const clearHighscore = () => {
    setHighscore(0);
    localStorage.setItem('highscore', 0);

    setMsg('Highscore has been cleared');
  };

  // Reset the msg field on page leave
  useEffect(() => {
    return setMsg('');
  }, []);

  return (
    <div className='py-24 px-8 flex flex-col items-center gap-5'>
      <div className='mb-3'>
        <div className='text-4xl font-semibold text-center'>Options</div>
        {msg ? <div className='text-center text-green-400/80 mt-3'>{msg}</div> : null}
      </div>
      <SwipeToConfirmButton onConfirm={clearHighscore} onError={() => setMsg('')}>
        Clear highscore
      </SwipeToConfirmButton>
      <hr className='w-full max-w-[400px] border-white/30 my-7' />
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
