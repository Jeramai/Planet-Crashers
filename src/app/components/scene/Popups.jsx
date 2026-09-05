'use client';

import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { GameEvent, on } from '../../game/events';
import { nextId } from '../../game/ids';

const LIFE_MS = 1100;

export default function Popups() {
  const [popups, setPopups] = useState([]);

  useEffect(
    () =>
      on(GameEvent.Popup, ({ at, text, combo }) => {
        const id = nextId();
        setPopups((list) => [...list, { id, at, text, combo }]);
        window.setTimeout(() => setPopups((list) => list.filter((p) => p.id !== id)), LIFE_MS);
      }),
    []
  );

  return popups.map((popup) => (
    <Html key={popup.id} position={popup.at} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className='animate-score-pop text-center whitespace-nowrap select-none'>
        <div className='text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]'>{popup.text}</div>
        {popup.combo > 1 ? (
          <div className='text-xs font-bold tracking-widest text-amber-300 uppercase'>{popup.combo}x chain</div>
        ) : null}
      </div>
    </Html>
  ));
}
