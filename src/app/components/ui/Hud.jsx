'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { thumbUrl } from '../../game/assets';
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
      <Image src={thumbUrl(type)} alt={type} width={size} height={size} className='size-full object-cover' unoptimized />
      <span className='absolute inset-0 rounded-full' style={{ boxShadow: ORB_SHADING }} />
    </span>
  );
}

export default function Hud() {
  const { score, highscore, lives, queue, combo, hold, swapHold, setGameState, showRules } = useGame();
  const [danger, setDanger] = useState(false);

  useEffect(() => on(GameEvent.Danger, setDanger), []);

  const [current, next] = queue;
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

        <div className='ml-auto flex gap-2'>
          <button
            type='button'
            onClick={() => showRules(GameState.Playing)}
            className='chip pointer-events-auto flex size-11 items-center justify-center font-serif text-lg leading-none font-bold text-white/80'
            aria-label='How to play'
          >
            i
          </button>
          <button
            type='button'
            onClick={() => setGameState(GameState.Paused)}
            className='chip pointer-events-auto flex size-11 items-center justify-center'
            aria-label='Pause'
          >
            <span className='flex gap-1'>
              <span className='block h-4 w-1 rounded-full bg-white/80' />
              <span className='block h-4 w-1 rounded-full bg-white/80' />
            </span>
          </button>
        </div>
      </div>

      <div className='flex items-end justify-end gap-3'>
        <div className='chip flex items-end gap-4 py-3'>
          <div className='flex flex-col items-center gap-1.5'>
            {currentType ? <Orb type={currentType} size={64} /> : <span className='size-16' />}
            <span className='label'>{currentType ? `${specOf(currentType).points} pts` : ''}</span>
          </div>

          <div className='flex flex-col items-center gap-1.5'>
            {next ? <Orb type={next.type} size={30} /> : <span className='size-[30px]' />}
            <span className='label'>Next</span>
          </div>

          <div className='flex flex-col items-center gap-1.5'>
            <button
              type='button'
              onClick={swapHold}
              className='pointer-events-auto grid size-[30px] place-items-center rounded-full border border-dashed border-white/25 text-white/50 transition hover:border-white/60 hover:text-white/90'
              aria-label={hold ? `Swap with held ${hold}` : 'Hold this planet'}
            >
              {hold ? <Orb type={hold} size={30} /> : <span className='text-base leading-none'>+</span>}
            </button>
            <span className='label'>Hold</span>
          </div>
        </div>
      </div>
    </div>
  );
}
