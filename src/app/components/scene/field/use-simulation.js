'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3 } from 'three';
import { playSound } from '../../../game/audio';
import { emit, GameEvent } from '../../../game/events';
import { buzz, HAPTICS } from '../../../game/haptics';
import { specOf } from '../../../game/planets';
import {
  BURN_COOLDOWN_MS,
  GRACE_SECONDS,
  GRAVITY,
  INBOUND_MAX_MS,
  LOST_DISTANCE,
  MAX_SPEED,
  MUTUAL_GRAVITY,
  WARNING_AFTER
} from '../../../game/tuning';

/* Scratch vectors, reused every frame. One field exists at a time. */
const PULL = new Vector3();
const BETWEEN = new Vector3();

function clampSpeed(body) {
  const speed = body.linvel();
  const rate = Math.hypot(speed.x, speed.y, speed.z);
  if (rate <= MAX_SPEED) return;
  const scale = MAX_SPEED / rate;
  body.setLinvel({ x: speed.x * scale, y: speed.y * scale, z: speed.z * scale }, true);
}

/* Planets pull on each other as well as on the middle, so twins resting on
   opposite sides of a giant eventually find one another. Clamped at contact
   distance, or a resolved overlap would launch the pair. */
function attract(world, delta) {
  const live = world.list.current;
  for (let i = 0; i < live.length; i++) {
    const bodyA = world.bodies.current.get(live[i].id);
    if (!bodyA) continue;
    const a = bodyA.translation();
    const radiusA = specOf(live[i].type).radius;

    for (let j = i + 1; j < live.length; j++) {
      const bodyB = world.bodies.current.get(live[j].id);
      if (!bodyB) continue;
      const b = bodyB.translation();

      BETWEEN.set(b.x - a.x, b.y - a.y, b.z - a.z);
      const gap = BETWEEN.length();
      if (gap < 0.0001) continue;

      const touching = radiusA + specOf(live[j].type).radius;
      const spread = Math.max(gap, touching);
      const pull = (MUTUAL_GRAVITY * bodyA.mass() * bodyB.mass() * delta) / (spread * spread);

      BETWEEN.multiplyScalar(pull / gap);
      bodyA.applyImpulse(BETWEEN, true);
      bodyB.applyImpulse(BETWEEN.multiplyScalar(-1), true);
    }
  }
}

/* Gravity, the boundary clock, and everything that burns. Returns nothing: the
   frame writes to the rapier bodies and to the two edge-triggered events the
   HUD listens on. */
export default function useSimulation({ world, field, running, loseLife, haptics, volume }) {
  const shieldUntil = useRef(0);
  const wasReady = useRef(true);
  const alerting = useRef(false);

  useFrame((_, rawDelta) => {
    if (!running) return;
    const delta = Math.min(rawDelta, 0.05);
    const doomed = [];

    // Everything that was on the clock when a planet burned gets it wiped, and
    // nothing else can burn until the player has had a beat to react.
    const shielded = performance.now() < shieldUntil.current;
    if (shielded) {
      world.outside.current.clear();
      world.flags.current.clear();
    }

    for (const planet of world.list.current) {
      const body = world.bodies.current.get(planet.id);
      if (!body) continue;

      const at = body.translation();
      const distance = Math.hypot(at.x, at.y, at.z);

      if (distance > LOST_DISTANCE) {
        doomed.push({ id: planet.id, silent: true });
        continue;
      }

      clampSpeed(body);

      if (distance > 0.001) {
        PULL.set(-at.x, -at.y, -at.z)
          .normalize()
          .multiplyScalar(GRAVITY * body.mass() * delta);
        body.applyImpulse(PULL, true);
      }

      // Half the planet has to be outside before its clock starts, which is its
      // centre past the boundary. Judging it by the first pixel poking through
      // read as arbitrary, and there is no arming latch any more: a launch
      // starts 1.6 units out and is inside within a quarter of a second, so the
      // rule is simply "half out for three seconds, continuously".
      const inside = distance <= field;
      if (world.inbound.current.has(planet.id)) {
        const since = performance.now() - world.inbound.current.get(planet.id);
        if (inside || since > INBOUND_MAX_MS) world.inbound.current.delete(planet.id);
      }
      const held = inside ? 0 : (world.outside.current.get(planet.id) ?? 0) + delta;
      world.outside.current.set(planet.id, held);
      // Visible the moment it means anything, which is once a launch has had
      // time to arrive. Then it is bright immediately rather than fading up.
      const shown =
        held <= WARNING_AFTER ? 0 : Math.min(1, 0.32 + (0.68 * (held - WARNING_AFTER)) / (GRACE_SECONDS - WARNING_AFTER));
      world.flags.current.set(planet.id, shown);

      if (!shielded && held >= GRACE_SECONDS) {
        doomed.push({ id: planet.id, at: [at.x, at.y, at.z], type: planet.type, silent: false });
      }
    }

    attract(world, delta);

    // Edges only, both of these: the reticle and the HUD need the flip, not a
    // sixty-times-a-second stream.
    const ready = world.inbound.current.size === 0;
    if (ready !== wasReady.current) {
      wasReady.current = ready;
      emit(GameEvent.Ready, ready);
    }

    let worst = 0;
    for (const value of world.flags.current.values()) worst = Math.max(worst, value);
    const alert = worst > 0.05;
    if (alert !== alerting.current) {
      alerting.current = alert;
      emit(GameEvent.Danger, alert);
    }

    if (doomed.length === 0) return;

    if (doomed.some((one) => !one.silent)) shieldUntil.current = performance.now() + BURN_COOLDOWN_MS;

    doomed.forEach(({ at, type, silent }) => {
      if (silent) return;
      const lost = specOf(type).radius;
      playSound('explosion', volume, lost);
      buzz(HAPTICS.burn, haptics);
      emit(GameEvent.Explode, { at, radius: lost, color: '#ff7a2a' });
      emit(GameEvent.Shake, { trauma: 0.55 });
      loseLife();
    });

    world.drop(doomed.map((one) => one.id));
  });
}
