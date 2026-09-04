'use client';

import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import Button from './Button';
import { Shell } from './Menu';
import Slider from './Slider';

export default function Options() {
  const { volumes, setVolume, setGameState } = useGame();

  return (
    <Shell>
      <h2 className='text-3xl font-black tracking-tight'>Options</h2>

      <div className='panel flex w-full max-w-md flex-col gap-5 px-7 py-7'>
        <Slider label='Music' value={volumes.music} onChange={(v) => setVolume('music', v)} />
        <Slider label='Launch' value={volumes.shot} onChange={(v) => setVolume('shot', v)} />
        <Slider label='Merge' value={volumes.merge} onChange={(v) => setVolume('merge', v)} />
        <Slider label='Explosion' value={volumes.explosion} onChange={(v) => setVolume('explosion', v)} />
      </div>

      <Button variant='primary' onClick={() => setGameState(GameState.Menu)}>
        Back
      </Button>
    </Shell>
  );
}
