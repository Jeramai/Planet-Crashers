'use client';

import { START_LIVES } from '../../game/state';
import { useGame } from '../../game/store';
import { GRACE_SECONDS } from '../../game/tuning';
import Button from './Button';
import Chain from './Chain';

const CONTROLS = [
  ['Launch', 'Tap, or click'],
  ['Aim', 'Drag to orbit the field'],
  ['Zoom', 'Scroll, or pinch'],
  ['Pause', 'Esc']
];

export default function Rules() {
  const { closeRules } = useGame();

  return (
    <div className='pointer-events-none fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-black/45 p-5'>
      <div className='animate-rise-in panel pointer-events-auto my-auto flex w-full max-w-lg flex-col gap-6 px-7 py-8'>
        <h2 className='text-2xl font-black tracking-tight'>How to play</h2>

        <section className='flex flex-col gap-2'>
          <span className='label'>The chain</span>
          <p className='m-0 text-sm leading-relaxed text-white/75'>
            Land a planet on its twin and the pair becomes the next body up. Moon to star.
          </p>
          <Chain />
        </section>

        <section className='flex flex-col gap-2'>
          <span className='label'>The field</span>
          <p className='m-0 text-sm leading-relaxed text-white/75'>
            The field is sized to what it holds, so it is always close. Merging widens it. Every shot narrows it.
          </p>
        </section>

        <section className='flex flex-col gap-2'>
          <span className='label'>Burning up</span>
          <p className='m-0 text-sm leading-relaxed text-white/75'>
            A planet more than <b className='text-white'>half outside</b> the field turns red and burns {GRACE_SECONDS} seconds
            later. Get it back inside and the clock resets. {START_LIVES} burns ends the run.
          </p>
        </section>

        <section className='flex flex-col gap-2'>
          <span className='label'>Controls</span>
          <dl className='m-0 grid grid-cols-[5rem_1fr] gap-x-4 gap-y-1.5 text-sm'>
            {CONTROLS.map(([key, how]) => (
              <div key={key} className='contents'>
                <dt className='text-white/45'>{key}</dt>
                <dd className='m-0 text-white/75'>{how}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Button variant='primary' onClick={closeRules}>
          Got it
        </Button>
      </div>
    </div>
  );
}
