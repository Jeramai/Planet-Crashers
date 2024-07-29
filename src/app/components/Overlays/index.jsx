'use client';

import { useEffect } from 'react';
import { useGameContext } from '../Context';

export default function Overlays() {
  const { score, planetTypeQueue } = useGameContext();
  useEffect(() => console.log(score), [score]);

  return null;
}
