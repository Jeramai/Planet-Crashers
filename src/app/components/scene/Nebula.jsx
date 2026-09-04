'use client';

import { useMemo } from 'react';
import { BackSide, Color } from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uWarm;
  uniform vec3 uCool;

  varying vec3 vDirection;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise(p);
      p *= 2.03;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec3 d = normalize(vDirection);

    float clouds = fbm(d * 2.4);
    float wisps = fbm(d * 6.1 + clouds * 1.6);

    float warm = smoothstep(0.52, 0.92, clouds) * 0.9;
    float cool = smoothstep(0.44, 0.86, wisps) * 0.6;

    vec3 colour = uDeep + uWarm * warm + uCool * cool;

    // Kept dim on purpose: this is a backdrop, and bloom lifts the bright wisps.
    gl_FragColor = vec4(colour * 0.16, 1.0);
  }
`;

export default function Nebula() {
  const uniforms = useMemo(
    () => ({
      uDeep: { value: new Color('#05060f') },
      uWarm: { value: new Color('#4a2a6b') },
      uCool: { value: new Color('#123a6b') }
    }),
    []
  );

  return (
    <mesh scale={[-1, 1, 1]} raycast={null} frustumCulled={false}>
      <sphereGeometry args={[420, 48, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
