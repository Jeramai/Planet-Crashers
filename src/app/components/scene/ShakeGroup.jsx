'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { GameEvent, on } from '../../game/events';

const DECAY = 1.9;
const MAX_ROTATION = 0.055;
const MAX_OFFSET = 0.35;

/* The world shakes, not the camera. OrbitControls owns the camera transform
   every frame, so anything written there is overwritten before it is seen. */
export default function ShakeGroup({ children }) {
  const group = useRef(null);
  const trauma = useRef(0);

  useEffect(
    () =>
      on(GameEvent.Shake, ({ trauma: t }) => {
        trauma.current = Math.min(1, trauma.current + t);
      }),
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;

    if (trauma.current <= 0.0001) {
      group.current.rotation.set(0, 0, 0);
      group.current.position.set(0, 0, 0);
      return;
    }

    trauma.current = Math.max(0, trauma.current - DECAY * delta);
    const shake = trauma.current * trauma.current;
    const t = state.clock.elapsedTime * 34;

    group.current.rotation.set(
      Math.sin(t * 1.11) * MAX_ROTATION * shake,
      Math.sin(t * 1.37) * MAX_ROTATION * shake,
      Math.sin(t * 0.93) * MAX_ROTATION * shake
    );
    group.current.position.set(Math.sin(t * 1.7) * MAX_OFFSET * shake, Math.sin(t * 2.1) * MAX_OFFSET * shake, 0);
  });

  return <group ref={group}>{children}</group>;
}
