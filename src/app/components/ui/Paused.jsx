'use client';

import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import Button from './Button';

export default function Paused() {
  const { setGameState } = useGame();

  return (
    <div className='pointer-events-none fixed inset-0 z-20 grid place-items-center bg-black/35 p-6'>
      <div className='animate-rise-in panel pointer-events-auto flex w-full max-w-sm flex-col items-center gap-6 px-8 py-10'>
        <h2 className='text-3xl font-black tracking-tight'>Paused</h2>
        <div className='flex w-full flex-col gap-3'>
          <Button variant='primary' onClick={() => setGameState(GameState.Playing)}>
            Resume
          </Button>
          <Button onClick={() => setGameState(GameState.Menu)}>Quit to menu</Button>
        </div>
        <p className='label'>Esc resumes</p>
      </div>
    </div>
  );
}
