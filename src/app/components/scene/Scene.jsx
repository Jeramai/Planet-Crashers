'use client';

import { OrbitControls, PerspectiveCamera, Preload, useProgress, useTexture } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect, useRef } from 'react';
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
import Popups from './Popups';
import { preloadField } from './preload-field';
import ShakeGroup from './ShakeGroup';
import ShootingStars from './ShootingStars';
import Sunlight from './Sunlight';

/* One url per call. useLoader keys its cache on [loader, ...urls], so preloading
   the whole list under one key fills a slot that a single-texture lookup never
   reads back, and every planet loads again the first time it is drawn. */
if (typeof window !== 'undefined') TEXTURE_FILES.forEach((name) => useTexture.preload(textureUrl(name)));

// Rapier and its wasm are half the payload and the menu never touches them.
const PlanetField = lazy(preloadField);

const MAX_FOV = 76;
const TAP_SLOP_PX = 8;
const TAP_MS = 450;

export default function Scene() {
  const { gameState, queue, runId, field, swapHold } = useGame();
  const still = useReducedMotion();
  const playing = gameState === GameState.Playing;
  // The board stays on screen while paused and after the run, so the card sits
  // over the arrangement the player actually built.
  const inRun = playing || gameState === GameState.Paused || gameState === GameState.Rules || gameState === GameState.Over;
  const press = useRef({ x: 0, y: 0, at: 0 });

  // Only once the textures are in. Fetching it earlier costs the menu its
  // largest paint, and nobody reads the menu and presses start inside a second.
  const loaded = useProgress((state) => !state.active && state.progress >= 100);

  useEffect(() => {
    if (!loaded) return;
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => void preloadField());
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => void preloadField(), 400);
    return () => clearTimeout(id);
  }, [loaded]);

  // One rule for mouse and touch: a press that neither moved nor lingered is a
  // shot, anything else belongs to the orbit control.
  const onPointerDown = (e) => {
    press.current = { x: e.clientX, y: e.clientY, at: performance.now() };
  };

  useEffect(() => {
    if (!playing) return;

    const onKey = (e) => {
      if (e.code === 'KeyH' && !e.repeat) {
        swapHold();
        return;
      }
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
  }, [playing, swapHold]);

  const onPointerUp = (e) => {
    if (!playing) return;
    const moved = Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y);
    if (moved <= TAP_SLOP_PX && performance.now() - press.current.at < TAP_MS) emit(GameEvent.Shoot);
  };

  return (
    <Canvas
      className='!fixed inset-0 touch-none'
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
        {still ? null : <ShootingStars />}

        <ShakeGroup>
          <Sunlight />
          {inRun ? (
            <>
              {/* Its own boundary: a cold physics chunk must not take the sky with it. */}
              <Suspense fallback={null}>
                <PlanetField key={runId} />
              </Suspense>
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
