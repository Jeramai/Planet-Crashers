'use client';

import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import Button from './Button';
import Chain from './Chain';

export default function Menu() {
  const { highscore, startRun, setGameState } = useGame();

  return (
    <Shell>
      <div className='animate-rise-in flex flex-col items-center gap-2'>
        <h1 className='bg-gradient-to-b from-white to-white/55 bg-clip-text text-center text-5xl font-black tracking-tight text-transparent sm:text-7xl'>
          Planet Crashers
        </h1>
        <p className='label'>Merge the solar system, one collision at a time</p>
      </div>

      <div className='animate-rise-in panel flex flex-col items-center gap-4 px-8 py-6' style={{ animationDelay: '80ms' }}>
        <span className='label'>Personal best</span>
        <span className='font-mono text-4xl font-black tabular-nums'>{highscore.toLocaleString()}</span>
      </div>

      <div className='animate-rise-in flex flex-col items-center gap-3' style={{ animationDelay: '150ms' }}>
        <Button variant='primary' onClick={startRun}>
          Start run
        </Button>
        <Button onClick={() => setGameState(GameState.Options)}>Options</Button>
      </div>

      <div className='animate-rise-in flex flex-col items-center gap-3' style={{ animationDelay: '220ms' }}>
        <span className='label'>The chain</span>
        <Chain />
      </div>
    </Shell>
  );
}

export function Shell({ children }) {
  return (
    <div className='pointer-events-none fixed inset-0 z-20 grid place-items-center overflow-y-auto p-6'>
      <div
        aria-hidden='true'
        className='pointer-events-none fixed inset-0'
        style={{ background: 'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(3,4,10,0.88), rgba(3,4,10,0) 70%)' }}
      />
      <div className='pointer-events-auto relative flex flex-col items-center gap-8 py-10 text-center'>{children}</div>
    </div>
  );
}
