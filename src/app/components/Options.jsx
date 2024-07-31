import { useEffect, useState } from 'react';
import { useGameContext } from './Context';
import Button from './Helpers/Button';
import Slider from './Helpers/Slider';
import SwipeToConfirmButton from './Helpers/SwipeToConfirmButton';

export default function Options() {
  const {
    setGameState,
    setHighscore,
    audioVolume,
    explosionVolume,
    mergeVolume,
    shotVolume,
    setAudioVolume,
    setExplosionVolume,
    setMergeVolume,
    setShotVolume
  } = useGameContext();

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

      <Slider
        title='Main volume'
        value={`${audioVolume}`}
        onChange={(e) => {
          setAudioVolume(e.target.valueAsNumber);
          localStorage.setItem('audioVolume', e.target.valueAsNumber);
        }}
        min={0}
        max={1}
        step={0.1}
      />
      <Slider
        title='Shot volume'
        value={`${shotVolume}`}
        onChange={(e) => {
          setShotVolume(e.target.valueAsNumber);
          localStorage.setItem('shotVolume', e.target.valueAsNumber);
        }}
        min={0}
        max={1}
        step={0.1}
      />
      <Slider
        title='Explosion volume'
        value={`${explosionVolume}`}
        onChange={(e) => {
          setExplosionVolume(e.target.valueAsNumber);
          localStorage.setItem('explosionVolume', e.target.valueAsNumber);
        }}
        min={0}
        max={1}
        step={0.1}
      />
      <Slider
        title='Merge volume'
        value={`${mergeVolume}`}
        onChange={(e) => {
          setMergeVolume(e.target.valueAsNumber);
          localStorage.setItem('mergeVolume', e.target.valueAsNumber);
        }}
        min={0}
        max={1}
        step={0.1}
      />

      <SwipeToConfirmButton onConfirm={clearHighscore} onError={() => setMsg('')}>
        Clear highscore
      </SwipeToConfirmButton>
      <hr className='w-full max-w-[400px] border-white/30 my-7' />
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
