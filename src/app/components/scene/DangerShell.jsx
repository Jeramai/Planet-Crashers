'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide } from 'three';
import { DANGER_START } from '../../game/tuning';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Double-sided, because the camera crosses this shell as it zooms. A fresnel rim
   reads as nothing from the inside, so the boundary is drawn as a grid. */
const fragmentShader = /* glsl */ `
  uniform vec3 uCalm;
  uniform vec3 uAlarm;
  uniform float uAlert;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vec2 cells = vUv * vec2(32.0, 16.0);
    vec2 grid = abs(fract(cells) - 0.5) / fwidth(cells);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);

    float pulse = 0.55 + 0.45 * sin(uTime * 7.0);
    float alpha = line * mix(0.42, 1.0 * pulse, uAlert) + 0.02;

    gl_FragColor = vec4(mix(uCalm, uAlarm, uAlert) * alpha, alpha);
  }
`;

export default function DangerShell({ flags, boundary }) {
  const shell = useRef(null);
  const material = useRef(null);

  const uniforms = useMemo(
    () => ({
      uCalm: { value: new Color('#63c8f0') },
      uAlarm: { value: new Color('#ff2d2d') },
      uAlert: { value: 0 },
      uTime: { value: 0 }
    }),
    []
  );

  useFrame((state, delta) => {
    // Drawn at the start radius and scaled, so the field closing in is one number.
    if (shell.current) {
      const target = boundary.current / DANGER_START;
      shell.current.scale.setScalar(shell.current.scale.x + (target - shell.current.scale.x) * Math.min(1, delta * 3));
    }
    if (!material.current) return;
    let worst = 0;
    for (const value of flags.current.values()) worst = Math.max(worst, value);
    const current = material.current.uniforms.uAlert.value;
    material.current.uniforms.uAlert.value = current + (worst - current) * Math.min(1, delta * 8);
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={shell} raycast={null}>
      <sphereGeometry args={[DANGER_START, 64, 40]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={DoubleSide}
      />
    </mesh>
  );
}
