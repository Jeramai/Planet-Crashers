'use client';

import { OrbitControls, PerspectiveCamera, Preload, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { NoToneMapping } from 'three';
import { textureUrl } from '../../game/assets';
import { emit, GameEvent } from '../../game/events';
import { TEXTURE_FILES } from '../../game/planets';
import { useGame } from '../../game/store';
import { GameState } from '../../game/state';
import { useReducedMotion } from '../../game/use-reduced-motion';
import { CAMERA, spawnRadiusFor } from '../../game/tuning';
import Aim from './Aim';
import Bursts from './Bursts';
import Effects from './Effects';
import MenuStage from './MenuStage';
import Nebula from './Nebula';
import PlanetField from './PlanetField';
import Popups from './Popups';
import ShakeGroup from './ShakeGroup';
import ShootingStars from './ShootingStars';
import Sunlight from './Sunlight';

if (typeof window !== 'undefined') useTexture.preload(TEXTURE_FILES.map(textureUrl));

const MAX_FOV = 76;
const TAP_SLOP_PX = 8;
const TAP_MS = 450;

export default function Scene() {
  const { gameState, queue, runId, field } = useGame();
  const still = useReducedMotion();
  const playing = gameState === GameState.Playing;
  // The board stays on screen while paused and after the run, so the card sits
  // over the arrangement the player actually built.
  const inRun = playing || gameState === GameState.Paused || gameState === GameState.Rules || gameState === GameState.Over;
  const press = useRef({ x: 0, y: 0, at: 0 });

  // One rule for mouse and touch: a press that neither moved nor lingered is a
  // shot, anything else belongs to the orbit control.
  const onPointerDown = (e) => {
    press.current = { x: e.clientX, y: e.clientY, at: performance.now() };
  };

  useEffect(() => {
    if (!playing) return;

    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      // A focused control owns the space bar. Hijacking it would break keyboard
      // access to pause and the rules.
      const active = document.activeElement;
      if (active && (active.tagName === 'BUTTON' || active.tagName === 'INPUT' || active.isContentEditable)) return;
      e.preventDefault();
      emit(GameEvent.Shoot);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const onPointerUp = (e) => {
    if (!playing) return;
    const moved = Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y);
    if (moved <= TAP_SLOP_PX && performance.now() - press.current.at < TAP_MS) emit(GameEvent.Shoot);
  };

  return (
    <Canvas
      className='!fixed inset-0'
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: 'high-performance' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <color attach='background' args={['#03040a']} />
      <GameCamera />

      <Suspense fallback={null}>
        <Nebula still={still} />
        <Drift still={still}>
          <Stars radius={240} depth={100} count={9000} factor={4.5} saturation={0} fade speed={0.35} />
        </Drift>
        {still ? null : <ShootingStars />}

        <ShakeGroup>
          <Sunlight />
          {inRun ? (
            <>
              <PlanetField key={runId} />
              <Bursts />
              {playing ? <Popups /> : null}
            </>
          ) : (
            <MenuStage />
          )}
        </ShakeGroup>

        {playing ? <Aim type={queue[0].type} field={field} /> : null}
        <Preload all />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.55}
        zoomSpeed={0.65}
        minDistance={spawnRadiusFor(field) + 5}
        maxDistance={Math.max(24, field * 5)}
        autoRotate={!inRun}
        autoRotateSpeed={0.35}
      />

      <Effects />
    </Canvas>
  );
}

/* A portrait phone crops a 50-degree vertical frame to a narrow slice and the
   boundary runs off both sides, so the lens widens until the sphere fits again. */
function GameCamera() {
  const size = useThree((state) => state.size);
  const aspect = size.width / size.height;
  const fov = aspect < 1 ? Math.min(MAX_FOV, CAMERA.fov / aspect) : CAMERA.fov;

  return <PerspectiveCamera makeDefault position={CAMERA.start} fov={fov} near={0.1} far={1200} />;
}

/* A whole-sky rotation slow enough that you never catch it moving, but the
   backdrop is never the same twice. */
function Drift({ children, still }) {
  const group = useRef(null);

  useFrame((_, delta) => {
    if (still || !group.current) return;
    group.current.rotation.y += delta * 0.0055;
    group.current.rotation.x += delta * 0.0021;
  });

  return <group ref={group}>{children}</group>;
}
