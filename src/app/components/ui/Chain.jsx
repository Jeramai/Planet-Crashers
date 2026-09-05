'use client';

import Image from 'next/image';
import { thumbUrl } from '../../game/assets';
import { MERGE_CHAIN } from '../../game/planets';

export default function Chain() {
  return (
    <div className='flex max-w-md flex-wrap items-center justify-center gap-1.5'>
      {MERGE_CHAIN.map((type, i) => (
        <span key={type} className='flex items-center gap-1.5'>
          <Image
            src={thumbUrl(type)}
            alt={type}
            width={26}
            height={26}
            unoptimized
            className='size-[26px] rounded-full object-cover shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.8)]'
          />
          {i < MERGE_CHAIN.length - 1 ? <span className='text-[0.6rem] text-white/25'>›</span> : null}
        </span>
      ))}
    </div>
  );
}
