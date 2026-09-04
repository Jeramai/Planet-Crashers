'use client';

import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import Button from './Button';

export default function GameOver() {
  const { score, highscore, startRun, setGameState } = useGame();
  const isBest = score > 0 && score >= highscore;

  return (
    <div className='pointer-events-none fixed inset-0 z-20 grid place-items-center bg-black/35 p-6'>
      <div className='animate-rise-in panel pointer-events-auto flex w-full max-w-sm flex-col items-center gap-6 px-8 py-10 text-center'>
        <div className='flex flex-col items-center gap-1'>
          <span className='label text-rose-300/80'>Run over</span>
          <h2 className='text-3xl font-black tracking-tight'>Out of lives</h2>
        </div>

        <div className='flex w-full items-stretch gap-3'>
          <Stat label='Score' value={score} highlight />
          <Stat label='Best' value={highscore} />
        </div>

        {isBest ? (
          <span className='rounded-full bg-amber-400 px-4 py-1.5 text-[0.65rem] font-black tracking-widest text-neutral-950 uppercase'>
            New personal best
          </span>
        ) : null}

        <div className='flex w-full flex-col gap-3'>
          <Button variant='primary' onClick={startRun}>
            Run it back
          </Button>
          <Button onClick={() => setGameState(GameState.Menu)}>Main menu</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`flex-1 rounded-xl border px-4 py-3 ${highlight ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/[0.03]'}`}
    >
      <div className='font-mono text-2xl font-black tabular-nums'>{value.toLocaleString()}</div>
      <div className='label mt-0.5'>{label}</div>
    </div>
  );
}
