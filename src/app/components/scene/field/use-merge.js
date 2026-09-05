'use client';

import { useCallback, useEffect, useRef } from 'react';
import { playSound } from '../../../game/audio';
import { emit, GameEvent } from '../../../game/events';
import { buzz, HAPTICS } from '../../../game/haptics';
import { nextId } from '../../../game/ids';
import { nextInChain, PlanetType, specOf } from '../../../game/planets';
import { COMBO_STEP, COMBO_WINDOW_MS, MERGE_VELOCITY_KEEP } from '../../../game/tuning';

/* Two planets of one type become the next one up. Returns the collision handler
   the planets are given, which is stable for the life of the run: the rule
   changes as the score does, and a planet must not re-render because of it. */
export default function useMerge({ world, addScore, countMerge, gainLife, setCombo, haptics, volume }) {
  const consumed = useRef(new Set());
  const lastMerge = useRef(0);
  const combo = useRef(0);
  const resolve = useRef(null);

  /* Only the lower id resolves a pair, and both ids are locked before any state
     is written, so one impact can never produce two planets. */
  const merge = useCallback(
    (idA, otherData) => {
      const idB = otherData?.id;
      if (!idB || idA >= idB) return;
      if (consumed.current.has(idA) || consumed.current.has(idB)) return;

      const a = world.list.current.find((planet) => planet.id === idA);
      const b = world.list.current.find((planet) => planet.id === idB);
      if (!a || !b || a.type !== b.type) return;

      const grown = nextInChain(a.type);
      if (!grown) return;

      const bodyA = world.bodies.current.get(idA);
      const bodyB = world.bodies.current.get(idB);
      if (!bodyA || !bodyB) return;

      consumed.current.add(idA);
      consumed.current.add(idB);

      const pa = bodyA.translation();
      const pb = bodyB.translation();
      const va = bodyA.linvel();
      const vb = bodyB.linvel();
      const at = [(pa.x + pb.x) / 2, (pa.y + pb.y) / 2, (pa.z + pb.z) / 2];

      const now = performance.now();
      combo.current = now - lastMerge.current < COMBO_WINDOW_MS ? combo.current + 1 : 1;
      lastMerge.current = now;
      setCombo(combo.current);

      const spec = specOf(grown);
      const points = Math.round(spec.points * (1 + COMBO_STEP * (combo.current - 1)));

      world.drop([idA, idB]);
      world.add({
        id: nextId(),
        type: grown,
        position: at,
        velocity: [
          ((va.x + vb.x) / 2) * MERGE_VELOCITY_KEEP,
          ((va.y + vb.y) / 2) * MERGE_VELOCITY_KEEP,
          ((va.z + vb.z) / 2) * MERGE_VELOCITY_KEEP
        ],
        born: 'merge'
      });

      consumed.current.delete(idA);
      consumed.current.delete(idB);

      addScore(points);
      countMerge(grown, combo.current);
      playSound('merge', volume, spec.radius);
      emit(GameEvent.Merge, { at, radius: spec.radius, color: spec.air?.color ?? '#cfe6ff' });
      emit(GameEvent.Popup, { at, text: `+${points}`, combo: combo.current });
      emit(GameEvent.Shake, { trauma: Math.min(0.5, 0.14 + spec.radius * 0.05) });
      buzz(combo.current >= 3 ? HAPTICS.chain : HAPTICS.merge, haptics);

      /* The top of the chain, and the only thing that gives a life back. A Sun
         cannot merge again, so without this it is just a large piece of furniture
         at the end of a good run. */
      if (grown === PlanetType.Sun) {
        gainLife();
        emit(GameEvent.Merge, { at, radius: spec.radius * 2.4, color: '#ffcf6a' });
        emit(GameEvent.Popup, { at, text: 'A star, +1 life', combo: 0 });
        emit(GameEvent.Shake, { trauma: 0.7 });
        buzz(HAPTICS.star, haptics);
      }
    },
    [world, addScore, countMerge, gainLife, setCombo, haptics, volume]
  );

  useEffect(() => {
    resolve.current = merge;
  }, [merge]);

  return useCallback((id, other) => resolve.current?.(id, other), []);
}
