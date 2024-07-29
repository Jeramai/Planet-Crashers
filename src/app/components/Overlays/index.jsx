'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useGameContext } from '../Context';

export const imgPrefix = process.env.NODE_ENV === 'production' ? '/Planet-Crashers/' : '/';

export default function Overlays() {
  const { score, planetTypeQueue } = useGameContext();

  return (
    <div className='fixed top-0 left-0 pointer-events-none w-full h-full flex flex-col justify-between select-none'>
      <Score score={score} />
      <div className='flex flex-col items-end p-3'>
        <div className='flex flex-col items-center mt-3 px-5 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10'>
          <PlanetsShowcase currentPlanet={planetTypeQueue[0]} nextPlanet={planetTypeQueue[1]} />
        </div>
      </div>
    </div>
  );
}

function Score({ score }) {
  const [highscore, setHighscore] = useState(0);
  useEffect(() => {
    const localHighscore = parseInt(localStorage.getItem('highscore')) ?? 0;
    setHighscore(Math.max(score, localHighscore));

    if (score > localHighscore) {
      localStorage.setItem('highscore', score);
    }
  }, [score]);

  return (
    <div className='flex justify-center'>
      <div
        className='flex flex-col items-center mt-3 px-7 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 pointer-events-auto'
        title={`Highscore: ${highscore}`}
      >
        <span className='text-3xl font-semibold mb-1'>{score}</span>
        <span className='text-xs uppercase text-white/70'>Score</span>
      </div>
    </div>
  );
}
function PlanetsShowcase({ currentPlanet, nextPlanet }) {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col items-center'>
        <span className='relative text-3xl font-semibold mb-2'>
          {currentPlanet ? (
            <Image
              priority
              src={`${imgPrefix}textures/2k_${currentPlanet}.jpg`}
              width={100}
              height={100}
              alt={`Current planet "${currentPlanet}"`}
              className='aspect-square rounded-full object-cover'
            />
          ) : (
            <div className='w-[100px] h-[100px]' />
          )}
        </span>
        <span className='text-xs uppercase text-white/70'>Current</span>
      </div>
      <div className='flex justify-end'>
        <div className='flex flex-col items-center'>
          <span className='relative text-3xl font-semibold mb-2'>
            {nextPlanet ? (
              <Image
                src={`${imgPrefix}textures/2k_${nextPlanet}.jpg`}
                width={60}
                height={60}
                alt={`Next planet: "${nextPlanet}"`}
                className='aspect-square rounded-full object-cover'
              />
            ) : (
              <div className='w-[60px] h-[60px]' />
            )}
          </span>
          <span className='text-xs uppercase text-white/70'>Up next</span>
        </div>
      </div>
    </div>
  );
}
