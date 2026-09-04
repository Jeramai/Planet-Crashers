'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { PlanetType } from '../../game/planets';
import PlanetVisual from './PlanetVisual';

/* A slow hero shot behind the menu, so the first frame is the game, not a page. */
export default function MenuStage() {
  const group = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.045;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.35;
  });

  return (
    <group ref={group}>
      <group position={[4.6, -1.4, -2]} scale={1}>
        <PlanetVisual type={PlanetType.Saturn} spin={0.05} />
      </group>
      <group position={[-6.4, 2.4, -4]} scale={0.5}>
        <PlanetVisual type={PlanetType.Earth} spin={0.12} />
      </group>
      <group position={[-3.6, -3.2, 3]} scale={0.35}>
        <PlanetVisual type={PlanetType.Mars} spin={0.1} />
      </group>
    </group>
  );
}
