'use client';

import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import DangerShell from './DangerShell';
import useLauncher from './field/use-launcher';
import useMerge from './field/use-merge';
import usePlanets from './field/use-planets';
import useSimulation from './field/use-simulation';
import Planet from './Planet';

export default function PlanetField() {
  const {
    gameState,
    addScore,
    loseLife,
    gainLife,
    takeFromQueue,
    queue,
    field,
    setBoard,
    countMerge,
    haptics,
    volumes,
    setCombo
  } = useGame();
  const camera = useThree((state) => state.camera);
  const running = gameState === GameState.Playing;

  const { planets, world } = usePlanets(setBoard);

  const onCollide = useMerge({ world, addScore, countMerge, gainLife, setCombo, haptics, volume: volumes.merge });
  useLauncher({ world, camera, field, queue, running, takeFromQueue, volume: volumes.shot });
  useSimulation({ world, field, running, loseLife, haptics, volume: volumes.explosion });

  return (
    <Physics gravity={[0, 0, 0]} timeStep={1 / 60} paused={!running}>
      {planets.map((planet) => (
        <Planet key={planet.id} {...planet} bodies={world.bodies} flags={world.flags} onCollide={onCollide} />
      ))}
      <DangerShell flags={world.flags} boundary={field} />
    </Physics>
  );
}
