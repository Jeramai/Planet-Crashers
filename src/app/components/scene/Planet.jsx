'use client';

import { useFrame } from '@react-three/fiber';
import { BallCollider, RigidBody } from '@react-three/rapier';
import { memo, useEffect, useMemo, useRef } from 'react';
import { massOf, specOf } from '../../game/planets';
import { ANGULAR_DAMPING, LINEAR_DAMPING, RESTITUTION } from '../../game/tuning';
import PlanetVisual from './PlanetVisual';

const POP_SECONDS = 0.28;
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

function Planet({ id, type, position, velocity, born, bodies, flags, onCollide }) {
  const spec = specOf(type);
  const group = useRef(null);
  const age = useRef(0);
  const launched = useRef(false);

  // Derived from the id, so every planet spins differently without a random
  // call during render.
  const spin = 0.05 + (((id * 2654435761) % 97) / 97) * 0.12;
  const overshoot = born === 'merge' ? 1.3 : 1;
  const colliderArgs = useMemo(() => [spec.radius], [spec.radius]);

  const body = useRef(null);

  useEffect(() => {
    const registry = bodies.current;
    if (body.current) registry.set(id, body.current);
    return () => registry.delete(id);
  }, [bodies, id]);

  useFrame((_, delta) => {
    /* The launch velocity is applied once, on the first frame, and never passed
       as a prop. As a prop rapier re-applies it on every re-render, so adding one
       planet re-launched every planet already settled — the shockwave. The ref
       callback is too early: the body is not in the world yet. */
    if (!launched.current && body.current) {
      launched.current = true;
      body.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true);
    }

    if (!group.current) return;
    age.current = Math.min(POP_SECONDS, age.current + delta);
    const t = age.current / POP_SECONDS;
    group.current.scale.setScalar(t >= 1 ? 1 : easeOutBack(t) * overshoot - (overshoot - 1) * t);
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      linearDamping={LINEAR_DAMPING}
      angularDamping={ANGULAR_DAMPING}
      restitution={RESTITUTION}
      friction={0.45}
      ccd
      userData={{ id, type }}
      onCollisionEnter={({ other }) => onCollide(id, other?.rigidBody?.userData)}
    >
      <BallCollider args={colliderArgs} mass={massOf(type)} />
      <group ref={group}>
        <PlanetVisual type={type} spin={spin} flags={flags} flagKey={id} />
      </group>
    </RigidBody>
  );
}

/* Adding a planet must not re-render the ones already settled. */
export default memo(Planet);
