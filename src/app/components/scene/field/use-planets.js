'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { specOf, volumeOf } from '../../../game/planets';

/* Every planet on the board, and the rapier body behind each one. The list is
   held twice on purpose: as state, so the scene renders it, and as a ref, so the
   frame loop can see what it added without waiting for a render. */
export default function usePlanets(setBoard) {
  const [planets, setPlanets] = useState([]);
  const list = useRef([]);
  const bodies = useRef(new Map());
  const flags = useRef(new Map());
  const outside = useRef(new Map());
  const inbound = useRef(new Map());

  const write = useCallback(
    (update) => {
      list.current = update(list.current);
      setPlanets(list.current);
      // Published on change, not per frame: the field is sized from this. The two
      // largest radii matter as much as the total, because they set how far apart
      // the centres of the biggest bodies have to be.
      let volume = 0;
      let biggest = 0;
      let second = 0;
      for (const planet of list.current) {
        volume += volumeOf(planet.type);
        const r = specOf(planet.type).radius;
        if (r > biggest) {
          second = biggest;
          biggest = r;
        } else if (r > second) {
          second = r;
        }
      }
      setBoard({ volume, biggest, second });
    },
    [setBoard]
  );

  const add = useCallback((planet) => write((current) => [...current, planet]), [write]);

  const drop = useCallback(
    (ids) => {
      const gone = new Set(ids);
      gone.forEach((id) => {
        bodies.current.delete(id);
        flags.current.delete(id);
        outside.current.delete(id);
        inbound.current.delete(id);
      });
      write((current) => current.filter((planet) => !gone.has(planet.id)));
    },
    [write]
  );

  const world = useMemo(() => ({ list, bodies, flags, outside, inbound, add, drop }), [add, drop]);

  return { planets, world };
}
