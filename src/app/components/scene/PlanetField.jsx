'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { playSound } from '../../game/audio';
import { emit, GameEvent, on } from '../../game/events';
import { nextId } from '../../game/ids';
import { nextInChain, specOf } from '../../game/planets';
import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import {
  COMBO_STEP,
  COMBO_WINDOW_MS,
  dangerRadiusAt,
  GRACE_SECONDS,
  WARNING_AFTER,
  GRAVITY,
  LOST_DISTANCE,
  MAX_SPEED,
  MERGE_VELOCITY_KEEP,
  spawnRadiusAt,
  SHOT_COOLDOWN_MS,
  SHOT_SPEED
} from '../../game/tuning';
import DangerShell from './DangerShell';

/* Scratch vectors, reused every frame. One PlanetField exists at a time. */
const AIM = new Vector3();
const PULL = new Vector3();
import Planet from './Planet';

export default function PlanetField() {
  const { gameState, addScore, loseLife, takeFromQueue, queue, shots, volumes, setCombo } = useGame();
  const camera = useThree((state) => state.camera);

  const [planets, setPlanets] = useState([]);
  const collide = useRef(null);
  const planetsRef = useRef([]);
  const bodies = useRef(new Map());
  const flags = useRef(new Map());
  const outside = useRef(new Map());
  const consumed = useRef(new Set());
  const lastShot = useRef(0);
  const lastMerge = useRef(0);
  const comboRef = useRef(0);
  const alerting = useRef(false);

  const running = gameState === GameState.Playing;

  const write = useCallback((update) => {
    planetsRef.current = update(planetsRef.current);
    setPlanets(planetsRef.current);
  }, []);

  const drop = useCallback(
    (ids) => {
      const gone = new Set(ids);
      gone.forEach((id) => {
        bodies.current.delete(id);
        flags.current.delete(id);
        outside.current.delete(id);
      });
      write((list) => list.filter((p) => !gone.has(p.id)));
    },
    [write]
  );

  /* Only the lower id resolves a pair, and both ids are locked before any state
     is written, so one impact can never produce two planets. */
  const handleCollide = useCallback(
    (idA, otherData) => {
      const idB = otherData?.id;
      if (!idB || idA >= idB) return;
      if (consumed.current.has(idA) || consumed.current.has(idB)) return;

      const a = planetsRef.current.find((p) => p.id === idA);
      const b = planetsRef.current.find((p) => p.id === idB);
      if (!a || !b || a.type !== b.type) return;

      const grown = nextInChain(a.type);
      if (!grown) return;

      const bodyA = bodies.current.get(idA);
      const bodyB = bodies.current.get(idB);
      if (!bodyA || !bodyB) return;

      consumed.current.add(idA);
      consumed.current.add(idB);

      const pa = bodyA.translation();
      const pb = bodyB.translation();
      const va = bodyA.linvel();
      const vb = bodyB.linvel();
      const at = [(pa.x + pb.x) / 2, (pa.y + pb.y) / 2, (pa.z + pb.z) / 2];

      const now = performance.now();
      comboRef.current = now - lastMerge.current < COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
      lastMerge.current = now;
      setCombo(comboRef.current);

      const spec = specOf(grown);
      const points = Math.round(spec.points * (1 + COMBO_STEP * (comboRef.current - 1)));

      const merged = {
        id: nextId(),
        type: grown,
        position: at,
        velocity: [
          ((va.x + vb.x) / 2) * MERGE_VELOCITY_KEEP,
          ((va.y + vb.y) / 2) * MERGE_VELOCITY_KEEP,
          ((va.z + vb.z) / 2) * MERGE_VELOCITY_KEEP
        ],
        born: 'merge'
      };

      drop([idA, idB]);
      write((list) => [...list, merged]);

      consumed.current.delete(idA);
      consumed.current.delete(idB);

      addScore(points);
      playSound('merge', volumes.merge, spec.radius);
      emit(GameEvent.Merge, { at, radius: spec.radius, color: spec.air?.color ?? '#cfe6ff' });
      emit(GameEvent.Popup, { at, text: `+${points}`, combo: comboRef.current });
      emit(GameEvent.Shake, { trauma: Math.min(0.5, 0.14 + spec.radius * 0.05) });
    },
    [addScore, drop, setCombo, volumes.merge, write]
  );

  useEffect(() => {
    collide.current = handleCollide;
  }, [handleCollide]);

  const onCollide = useCallback((id, other) => collide.current?.(id, other), []);

  useEffect(() => {
    if (!running) return;

    const fire = () => {
      const now = performance.now();
      if (now - lastShot.current < SHOT_COOLDOWN_MS) return;
      lastShot.current = now;

      AIM.copy(camera.position).normalize();
      const { x, y, z } = AIM;
      const spec = specOf(queue[0].type);
      const muzzle = spawnRadiusAt(shots);
      const spawn = [x * muzzle, y * muzzle, z * muzzle];

      // Spawning inside another body makes Rapier fling both of them out of the
      // well, so a blocked muzzle simply does not fire.
      const blocked = planetsRef.current.some((other) => {
        const body = bodies.current.get(other.id);
        if (!body) return false;
        const at = body.translation();
        const gap = Math.hypot(at.x - spawn[0], at.y - spawn[1], at.z - spawn[2]);
        return gap < specOf(other.type).radius + spec.radius + 0.4;
      });
      if (blocked) return;

      const launched = {
        id: nextId(),
        type: queue[0].type,
        position: spawn,
        velocity: [-x * SHOT_SPEED, -y * SHOT_SPEED, -z * SHOT_SPEED],
        born: 'shot'
      };
      write((list) => [...list, launched]);

      takeFromQueue();
      playSound('shot', volumes.shot, spec.radius);
    };

    return on(GameEvent.Shoot, fire);
  }, [running, camera, queue, shots, takeFromQueue, volumes.shot, write]);

  // Derived, not stored: the field is a function of how many shots have been
  // fired, and useFrame is re-registered with the current value on every render.
  const boundary = dangerRadiusAt(shots);

  useFrame((_, rawDelta) => {
    if (!running) return;
    const delta = Math.min(rawDelta, 0.05);
    const doomed = [];

    for (const planet of planetsRef.current) {
      const body = bodies.current.get(planet.id);
      if (!body) continue;

      const at = body.translation();
      const distance = Math.hypot(at.x, at.y, at.z);

      if (distance > LOST_DISTANCE) {
        doomed.push({ id: planet.id, silent: true });
        continue;
      }

      const speed = body.linvel();
      const rate = Math.hypot(speed.x, speed.y, speed.z);
      if (rate > MAX_SPEED) {
        const scale = MAX_SPEED / rate;
        body.setLinvel({ x: speed.x * scale, y: speed.y * scale, z: speed.z * scale }, true);
      }

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
      const inside = distance <= boundary;
      const held = inside ? 0 : (outside.current.get(planet.id) ?? 0) + delta;
      outside.current.set(planet.id, held);
      // Visible the moment it means anything, which is once a launch has had
      // time to arrive. Then it is bright immediately rather than fading up.
      const shown =
        held <= WARNING_AFTER ? 0 : Math.min(1, 0.32 + (0.68 * (held - WARNING_AFTER)) / (GRACE_SECONDS - WARNING_AFTER));
      flags.current.set(planet.id, shown);

      if (held >= GRACE_SECONDS) {
        doomed.push({ id: planet.id, at: [at.x, at.y, at.z], type: planet.type, silent: false });
      }
    }

    // One event on each flip, never per frame: the HUD only needs the edge.
    let worst = 0;
    for (const value of flags.current.values()) worst = Math.max(worst, value);
    const alert = worst > 0.05;
    if (alert !== alerting.current) {
      alerting.current = alert;
      emit(GameEvent.Danger, alert);
    }

    if (doomed.length === 0) return;

    doomed.forEach(({ at, type, silent }) => {
      if (silent) return;
      const lost = specOf(type).radius;
      playSound('explosion', volumes.explosion, lost);
      emit(GameEvent.Explode, { at, radius: lost, color: '#ff7a2a' });
      emit(GameEvent.Shake, { trauma: 0.55 });
      loseLife();
    });

    drop(doomed.map((d) => d.id));
  });

  return (
    <Physics gravity={[0, 0, 0]} timeStep={1 / 60} paused={!running}>
      {planets.map((planet) => (
        <Planet key={planet.id} {...planet} bodies={bodies} flags={flags} onCollide={onCollide} />
      ))}
      <DangerShell flags={flags} boundary={boundary} />
    </Physics>
  );
}
