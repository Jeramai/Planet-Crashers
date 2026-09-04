'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { SUN_DIRECTION, SUN_DISTANCE } from '../../game/tuning';

export default function Sunlight() {
  return (
    <>
      <directionalLight
        position={[SUN_DIRECTION.x * SUN_DISTANCE, SUN_DIRECTION.y * SUN_DISTANCE, SUN_DIRECTION.z * SUN_DISTANCE]}
        intensity={1.55}
        color='#fff4e2'
      />

      <CameraFill />

      {/* A trace of bounce, so the night side is dark but not a silhouette. */}
      <hemisphereLight args={['#2b3a6b', '#0a0a12', 0.34]} />
      <ambientLight intensity={0.07} />
    </>
  );
}

/* Orbit round to the night side and the pile would be unreadable. This keeps a
   dim fill on whatever the player is looking at, without flattening the terminator. */
function CameraFill() {
  const light = useRef(null);
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    if (light.current) light.current.position.copy(camera.position);
  });

  return <directionalLight ref={light} intensity={0.5} color='#9fb6e8' />;
}
