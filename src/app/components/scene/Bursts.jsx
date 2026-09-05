'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdditiveBlending, Color } from 'three';
import { GameEvent, on } from '../../game/events';
import { nextId } from '../../game/ids';

const LIFE_SECONDS = 1.1;

const vertexShader = /* glsl */ `
  attribute vec3 aDirection;
  attribute float aSeed;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;

  varying float vFade;

  void main() {
    float drag = 1.0 - exp(-uTime * 2.7);
    vec3 offset = aDirection * uSpeed * drag * (0.45 + 0.55 * aSeed);

    vFade = clamp(1.0 - uTime, 0.0, 1.0);
    vFade *= vFade;

    vec4 viewPosition = modelViewMatrix * vec4(offset, 1.0);
    gl_PointSize = clamp(uSize * (26.0 / -viewPosition.z), 1.5, 22.0) * (0.35 + 0.65 * aSeed) * vFade;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float mask = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(uColor, mask * vFade);
  }
`;

/* Even-ish sphere sampling, so a burst is a shell rather than a blob. Built
   outside the component: it is random, and random belongs nowhere near render. */
function shell(count) {
  const positions = new Float32Array(count * 3);
  const directions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    directions[i * 3] = r * Math.cos(theta);
    directions[i * 3 + 1] = u;
    directions[i * 3 + 2] = r * Math.sin(theta);
    seeds[i] = Math.random();
  }

  return { positions, directions, seeds };
}

function Burst({ at, geometry, radius, color, speed, onDone }) {
  const material = useRef(null);
  const age = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: Math.max(6, radius * 9) },
      uColor: { value: new Color(color) }
    }),
    [color, radius, speed]
  );

  useFrame((_, delta) => {
    age.current += delta;
    if (material.current) material.current.uniforms.uTime.value = age.current / LIFE_SECONDS;
    if (age.current >= LIFE_SECONDS) onDone();
  });

  return (
    <points position={at} raycast={null} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[geometry.positions, 3]} />
        <bufferAttribute attach='attributes-aDirection' args={[geometry.directions, 3]} />
        <bufferAttribute attach='attributes-aSeed' args={[geometry.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function Bursts() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const add = (kind) => (payload) => {
      const burst = {
        id: nextId(),
        at: payload.at,
        radius: payload.radius,
        color: payload.color,
        geometry: shell(kind === 'explode' ? 220 : 140),
        speed: kind === 'explode' ? payload.radius * 5 + 6 : payload.radius * 3.4 + 3
      };
      setBursts((list) => [...list, burst]);
    };

    const offMerge = on(GameEvent.Merge, add('merge'));
    const offExplode = on(GameEvent.Explode, add('explode'));
    return () => {
      offMerge();
      offExplode();
    };
  }, []);

  return bursts.map((burst) => (
    <Burst key={burst.id} {...burst} onDone={() => setBursts((list) => list.filter((b) => b.id !== burst.id))} />
  ));
}
