'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useGameContext } from '../Context';

export const imgPrefix = process.env.NODE_ENV === 'production' ? '/Planet-Crashers/' : '/';

export default function Overlays() {
  return (
    <div className='fixed top-0 left-0 pointer-events-none w-full h-full flex flex-col justify-between gap-3 select-none'>
      <Score />
      <div className='flex justify-between items-end py-3 px-1 sm:p-3 gap-3'>
        <div className='w-full hidden sm:flex' />
        <div className='w-full flex justify-center'>
          <Lives />
        </div>
        <div className='w-full flex justify-end'>
          <PlanetsShowcase />
        </div>
      </div>
    </div>
  );
}

function Score() {
  const { score, highscore } = useGameContext();
  const [showHighscore, setShowHighscore] = useState(false);

  return (
    <div className='flex justify-center'>
      <button
        className='flex flex-col items-center mt-3 px-7 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 pointer-events-auto'
        onClick={() => setShowHighscore((sh) => !sh)}
      >
        <span className='text-3xl font-semibold mb-1'>{showHighscore ? highscore : score}</span>
        <span className='text-xs uppercase text-white/70'>{showHighscore ? 'Highscore' : 'Score'}</span>
      </button>
    </div>
  );
}
function Lives() {
  const { lives, setGameState } = useGameContext();

  useEffect(() => {
    if (lives <= 0) {
      setGameState('GAME_OVER');
    }
  }, [lives, setGameState]);

  return (
    <div className='flex justify-center'>
      <div className='flex gap-3 items-center mt-3 px-7 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10'>
        <span className={`text-3xl ${lives === 3 ? '' : 'grayscale'}`}>💜</span>
        <span className={`text-3xl ${lives >= 2 ? '' : 'grayscale'}`}>💜</span>
        <span className={`text-3xl ${lives >= 1 ? '' : 'grayscale'}`}>💜</span>
      </div>
    </div>
  );
}
function PlanetsShowcase() {
  const { planetTypeQueue } = useGameContext();
  const [currentPlanet, nextPlanet] = planetTypeQueue;

  return (
    <div className='w-max flex flex-col items-center mt-3 px-5 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10'>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-col items-center'>
          <span className='relative text-3xl font-semibold mb-2'>
            {currentPlanet ? (
              <Image
                priority
                src={`${imgPrefix}textures/2k_${currentPlanet}.jpg`}
                width={70}
                height={70}
                alt={`Current planet "${currentPlanet}"`}
                className='aspect-square rounded-full object-cover sm:w-[100px]'
              />
            ) : (
              <div className='w-[70px] h-[70px] sm:w-[100px] sm:h-[100px]' />
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
                  width={35}
                  height={35}
                  alt={`Next planet: "${nextPlanet}"`}
                  className='aspect-square rounded-full object-cover sm:w-[60px]'
                />
              ) : (
                <div className='w-[35px] h-[35px] sm:w-[60px] sm:h-[60px]' />
              )}
            </span>
            <span className='text-xs uppercase text-white/70'>Up next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
