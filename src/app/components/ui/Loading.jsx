'use client';

export default function Loading({ progress }) {
  return (
    <div className='fixed inset-0 z-30 grid place-items-center bg-[#03040a]'>
      <div className='flex w-64 flex-col items-center gap-5'>
        <span className='text-lg font-black tracking-[0.2em] uppercase'>Planet Crashers</span>
        <span className='h-[3px] w-full overflow-hidden rounded-full bg-white/10'>
          <span
            className='block h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-200'
            style={{ width: `${Math.round(progress)}%` }}
          />
        </span>
        <span className='label'>Loading textures {Math.round(progress)}%</span>
      </div>
    </div>
  );
}
