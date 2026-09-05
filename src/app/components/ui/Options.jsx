'use client';

import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import Button from './Button';
import { Shell } from './Menu';
import Slider from './Slider';

export default function Options() {
  const { volumes, setVolume, haptics, setHaptics, setGameState } = useGame();

  return (
    <Shell>
      <h2 className='text-3xl font-black tracking-tight'>Options</h2>

      <div className='panel flex w-full max-w-md flex-col gap-5 px-7 py-7'>
        <Slider label='Music' value={volumes.music} onChange={(v) => setVolume('music', v)} />
        <Slider label='Launch' value={volumes.shot} onChange={(v) => setVolume('shot', v)} />
        <Slider label='Merge' value={volumes.merge} onChange={(v) => setVolume('merge', v)} />
        <Slider label='Explosion' value={volumes.explosion} onChange={(v) => setVolume('explosion', v)} />

        <div className='flex w-full items-center gap-4'>
          <span className='label w-28 shrink-0'>Vibration</span>
          <button
            type='button'
            onClick={() => setHaptics(!haptics)}
            aria-pressed={haptics}
            aria-label='Vibration'
            className={`h-7 w-14 shrink-0 rounded-full border transition ${haptics ? 'border-amber-400/60 bg-amber-400/80' : 'border-white/15 bg-white/10'}`}
          >
            <span
              className={`block size-5 rounded-full bg-white transition-transform ${haptics ? 'translate-x-8' : 'translate-x-1'}`}
            />
          </button>
          <span className='w-10 shrink-0 text-right font-mono text-xs text-white/60'>{haptics ? 'on' : 'off'}</span>
        </div>
      </div>

      <Button variant='primary' onClick={() => setGameState(GameState.Menu)}>
        Back
      </Button>
    </Shell>
  );
}
