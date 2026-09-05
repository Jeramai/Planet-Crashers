'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { playSound } from '../../../game/audio';
import { GameEvent, on } from '../../../game/events';
import { nextId } from '../../../game/ids';
import { specOf } from '../../../game/planets';
import { LAUNCH_STEP, LAUNCH_STEPS_MAX, SHOT_COOLDOWN_MS, SHOT_SPEED, spawnRadiusFor } from '../../../game/tuning';

const AIM = new Vector3();

/* Fires the planet at the head of the queue from wherever the camera is looking
   in from. One shot at a time, and never into an occupied muzzle. */
export default function useLauncher({ world, camera, field, queue, running, takeFromQueue, volume }) {
  const lastShot = useRef(0);

  useEffect(() => {
    if (!running) return;

    const fire = () => {
      const now = performance.now();
      if (now - lastShot.current < SHOT_COOLDOWN_MS) return;
      // Nothing leaves the muzzle while the last one is still on its way in.
      if (world.inbound.current.size > 0) return;
      lastShot.current = now;

      AIM.copy(camera.position).normalize();
      const { x, y, z } = AIM;
      const spec = specOf(queue[0].type);
      // Spawning inside another body makes Rapier fling both of them out of the
      // well. Refusing to fire when the muzzle is occupied looked like a fix, but
      // once a giant sits across the muzzle it never clears, and the run locks up
      // with the player unable to shoot. So step outward until there is room.
      const occupied = (at) =>
        world.list.current.some((other) => {
          const body = world.bodies.current.get(other.id);
          if (!body) return false;
          const there = body.translation();
          const gap = Math.hypot(there.x - at[0], there.y - at[1], there.z - at[2]);
          return gap < specOf(other.type).radius + spec.radius + 0.4;
        });

      let muzzle = spawnRadiusFor(field);
      let spawn = [x * muzzle, y * muzzle, z * muzzle];
      for (let step = 0; step < LAUNCH_STEPS_MAX && occupied(spawn); step++) {
        muzzle += LAUNCH_STEP;
        spawn = [x * muzzle, y * muzzle, z * muzzle];
      }

      const launched = {
        id: nextId(),
        type: queue[0].type,
        position: spawn,
        velocity: [-x * SHOT_SPEED, -y * SHOT_SPEED, -z * SHOT_SPEED],
        born: 'shot'
      };
      world.add(launched);
      world.inbound.current.set(launched.id, now);

      takeFromQueue();
      playSound('shot', volume, spec.radius);
    };

    return on(GameEvent.Shoot, fire);
  }, [world, camera, field, queue, running, takeFromQueue, volume]);
}
