'use client';

import Image from 'next/image';
import { useGameContext } from '../Context';

export default function Overlays() {
  const { score, planetTypeQueue } = useGameContext();

  return (
    <div className='fixed top-0 left-0 pointer-events-none w-full h-full flex flex-col justify-between'>
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
  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center mt-3 px-7 py-3 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10'>
        <span className='text-3xl font-semibold mb-1'>{score}</span>
        <span className='text-xs uppercase text-white/70'>Score</span>
      </div>
    </div>
  );
}
function PlanetsShowcase({ currentPlanet, nextPlanet }) {
  const currentImg = `/textures/2k_${currentPlanet}.jpg`;
  const nextImg = `/textures/2k_${nextPlanet}.jpg`;

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col items-center'>
        <span className='relative text-3xl font-semibold mb-2'>
          <Image
            src={currentImg}
            width={100}
            height={100}
            alt={`Current planet "${currentPlanet}"`}
            className='aspect-square rounded-full object-cover'
          />
        </span>
        <span className='text-xs uppercase text-white/70'>Current</span>
      </div>
      <div className='flex justify-end'>
        <div className='flex flex-col items-center'>
          <span className='relative text-3xl font-semibold mb-2'>
            <Image
              src={nextImg}
              width={60}
              height={60}
              alt={`Next planet: "${nextPlanet}"`}
              className='aspect-square rounded-full object-cover'
            />
          </span>
          <span className='text-xs uppercase text-white/70'>Up next</span>
        </div>
      </div>
    </div>
  );
}
