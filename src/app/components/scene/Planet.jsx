'use client';

import { useFrame } from '@react-three/fiber';
import { BallCollider, RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { massOf, specOf } from '../../game/planets';
import { ANGULAR_DAMPING, LINEAR_DAMPING, RESTITUTION } from '../../game/tuning';
import PlanetVisual from './PlanetVisual';

const POP_SECONDS = 0.28;
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

export default function Planet({ id, type, position, velocity, born, bodies, flags, onCollide }) {
  const spec = specOf(type);
  const group = useRef(null);
  const age = useRef(0);
  // Derived from the id, so every planet spins differently without a random
  // call during render.
  const spin = 0.05 + (((id * 2654435761) % 97) / 97) * 0.12;
  const overshoot = born === 'merge' ? 1.3 : 1;

  useFrame((_, delta) => {
    if (!group.current) return;
    age.current = Math.min(POP_SECONDS, age.current + delta);
    const t = age.current / POP_SECONDS;
    group.current.scale.setScalar(t >= 1 ? 1 : easeOutBack(t) * overshoot - (overshoot - 1) * t);
  });

  return (
    <RigidBody
      ref={(body) => {
        if (body) bodies.current.set(id, body);
        else bodies.current.delete(id);
      }}
      colliders={false}
      position={position}
      linearVelocity={velocity}
      linearDamping={LINEAR_DAMPING}
      angularDamping={ANGULAR_DAMPING}
      restitution={RESTITUTION}
      friction={0.45}
      ccd
      userData={{ id, type }}
      onCollisionEnter={({ other }) => onCollide(id, other?.rigidBody?.userData)}
    >
      <BallCollider args={[spec.radius]} mass={massOf(type)} />
      <group ref={group}>
        <PlanetVisual type={type} spin={spin} flags={flags} flagKey={id} />
      </group>
    </RigidBody>
  );
}
