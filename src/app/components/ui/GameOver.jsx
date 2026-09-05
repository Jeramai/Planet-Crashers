'use client';

import Image from 'next/image';
import { useState } from 'react';
import { thumbUrl } from '../../game/assets';
import { PlanetType } from '../../game/planets';
import { GameState } from '../../game/state';
import { useGame } from '../../game/store';
import Button from './Button';

function shareUrl(seed) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}?seed=${seed}`;
}

export default function GameOver() {
  const { score, highscore, seed, best, merges, shots, suns, startRun, setGameState } = useGame();
  const [shared, setShared] = useState(null);
  const isBest = score > 0 && score >= highscore;

  const share = async () => {
    const url = shareUrl(seed);
    const text = `Planet Crashers — ${score.toLocaleString()} points. Same planets, same order: ${url}`;

    /* Share first, clipboard second. navigator.share exists on plenty of
       platforms that then refuse the call, so a failed share has to fall through
       rather than end there. A dismissed sheet is not a failure and says nothing;
       anything else does, because a silent dead button is worse. */
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Planet Crashers', text, url });
        setShared('Shared');
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShared('Copied');
    } catch {
      setShared('Could not copy');
    }
  };

  return (
    <div className='pointer-events-none fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-black/35 p-5'>
      <div className='animate-rise-in panel pointer-events-auto my-auto flex w-full max-w-sm flex-col items-center gap-6 px-8 py-9 text-center'>
        <div className='flex flex-col items-center gap-1'>
          <span className='label text-rose-300/80'>Run over</span>
          <h2 className='text-3xl font-black tracking-tight'>Out of lives</h2>
        </div>

        <div className='flex w-full items-stretch gap-3'>
          <Stat label='Score' value={score.toLocaleString()} highlight />
          <Stat label='Best' value={highscore.toLocaleString()} />
        </div>

        {isBest ? (
          <span className='rounded-full bg-amber-400 px-4 py-1.5 text-[0.65rem] font-black tracking-widest text-neutral-950 uppercase'>
            New personal best
          </span>
        ) : null}

        <dl className='m-0 grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <Row label='Furthest'>
            {best.type ? (
              <span className='inline-flex items-center gap-1.5'>
                <Image src={thumbUrl(best.type)} alt='' width={18} height={18} unoptimized className='size-[18px] rounded-full' />
                <span className='capitalize'>{best.type}</span>
                {best.type === PlanetType.Sun && suns > 1 ? <span className='text-amber-300'>&times;{suns}</span> : null}
              </span>
            ) : (
              '—'
            )}
          </Row>
          <Row label='Longest chain'>{best.chain > 1 ? `${best.chain}x` : '—'}</Row>
          <Row label='Merges'>{merges}</Row>
          <Row label='Launched'>{shots}</Row>
        </dl>

        <div className='flex w-full flex-col gap-3'>
          <Button variant='primary' onClick={startRun}>
            Run it back
          </Button>
          <Button onClick={share}>{shared ?? 'Share this board'}</Button>
          <Button onClick={() => setGameState(GameState.Menu)}>Main menu</Button>
        </div>

        <p className='label'>Seed {seed}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`flex-1 rounded-xl border px-4 py-3 ${highlight ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/[0.03]'}`}
    >
      <div className='font-mono text-2xl font-black tabular-nums'>{value}</div>
      <div className='label mt-0.5'>{label}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-white/5 pb-1.5'>
      <dt className='text-white/45'>{label}</dt>
      <dd className='m-0 font-medium text-white/85'>{children}</dd>
    </div>
  );
}
