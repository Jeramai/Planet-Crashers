'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { textureUrl } from '../../game/assets';
import { GameEvent, on } from '../../game/events';
import { specOf } from '../../game/planets';
import { useGame } from '../../game/store';
import { GameState, START_LIVES } from '../../game/state';

/* A flat jpg in a circle looks like a sticker. The inset shading makes it read
   as a lit sphere, which is what the same planet looks like in the scene. */
const LIFE_SLOTS = Array.from({ length: START_LIVES }, (_, i) => `life-${i}`);

const ORB_SHADING = 'inset -7px -7px 16px rgba(0,0,0,0.8), inset 4px 4px 12px rgba(255,255,255,0.14)';

function Orb({ type, size }) {
  return (
    <span className='relative block shrink-0 overflow-hidden rounded-full' style={{ width: size, height: size }}>
      <Image
        src={textureUrl(`2k_${type}.jpg`)}
        alt={type}
        width={size}
        height={size}
        className='size-full object-cover'
        unoptimized
      />
      <span className='absolute inset-0 rounded-full' style={{ boxShadow: ORB_SHADING }} />
    </span>
  );
}

export default function Hud() {
  const { score, highscore, lives, queue, combo, setGameState } = useGame();
  const [danger, setDanger] = useState(false);

  useEffect(() => on(GameEvent.Danger, setDanger), []);

  const [current, ...upcoming] = queue;
  const currentType = current?.type;

  return (
    <div className='pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 sm:p-5'>
      {danger ? (
        <div
          aria-hidden='true'
          className='animate-danger-flash pointer-events-none fixed inset-0 opacity-0'
          style={{ boxShadow: 'inset 0 0 190px 40px rgba(255,45,45,0.5)' }}
        />
      ) : null}

      <div className='grid grid-cols-[1fr_auto_1fr] items-start gap-3'>
        <div className='chip flex w-fit items-center gap-2' aria-label={`${lives} lives left`}>
          {LIFE_SLOTS.map((slot, i) => (
            <span
              key={slot}
              className={`size-3 rounded-full transition ${
                i < lives ? 'bg-gradient-to-b from-rose-300 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]' : 'bg-white/12'
              }`}
            />
          ))}
        </div>

        <div className='flex flex-col items-center'>
          <div className='chip flex flex-col items-center px-6'>
            <span className='font-mono text-3xl leading-none font-black tabular-nums sm:text-4xl'>{score.toLocaleString()}</span>
            <span className='label mt-1'>Best {highscore.toLocaleString()}</span>
          </div>
          {combo > 1 ? (
            <span className='animate-rise-in mt-2 rounded-full bg-amber-400/90 px-3 py-1 text-[0.65rem] font-black tracking-widest text-neutral-950 uppercase'>
              {combo}x chain
            </span>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => setGameState(GameState.Paused)}
          className='chip pointer-events-auto ml-auto flex size-11 items-center justify-center'
          aria-label='Pause'
        >
          <span className='flex gap-1'>
            <span className='block h-4 w-1 rounded-full bg-white/80' />
            <span className='block h-4 w-1 rounded-full bg-white/80' />
          </span>
        </button>
      </div>

      <div className='flex items-end justify-end gap-3'>
        <p className='chip mr-auto hidden max-w-64 text-[0.7rem] leading-relaxed text-white/55 sm:block'>
          Tap to launch. Drag to orbit. Scroll to zoom. Keep every planet inside the grid.
        </p>

        <div className='chip flex items-end gap-4 py-3'>
          <div className='flex flex-col items-center gap-1.5'>
            {currentType ? <Orb type={currentType} size={64} /> : <span className='size-16' />}
            <span className='label'>{currentType ? `${specOf(currentType).points} pts` : ''}</span>
          </div>
          <div className='flex flex-col items-center gap-1.5'>
            <div className='flex gap-2'>
              {upcoming.map((item) => (
                <Orb key={item.id} type={item.type} size={30} />
              ))}
            </div>
            <span className='label'>Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
