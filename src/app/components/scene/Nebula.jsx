'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
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
  uniform float uTime;

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

  vec3 spin(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  /* One star per cell, jittered inside it, sized in screen space.

     Drawn here rather than as point sprites because a point smaller than a pixel
     flickers as it crosses the pixel grid, and worse where an additive surface
     sits in front of it. fwidth gives every star a floor of about a pixel and a
     half of falloff, so it stays put however far it is. */
  float starLayer(vec3 dir, float scale, float threshold, float radius, out float shade) {
    vec3 p = dir * scale;
    vec3 cell = floor(p);
    vec3 within = p - cell;

    float pick = hash(cell + 47.3);
    shade = hash(cell + 91.7);
    if (pick < threshold) return 0.0;

    /* Kept a full radius clear of the cell walls. Sampling only the cell a pixel
       falls in is cheap, but a star jittered onto a boundary gets sliced by it,
       and a sky full of clipped discs reads as squares. */
    vec3 jitter = vec3(hash(cell + 3.1), hash(cell + 13.7), hash(cell + 29.9));
    vec3 at = radius + jitter * (1.0 - 2.0 * radius);
    float d = length(within - at);

    /* Clamped, because fwidth is a per-quad screen derivative and the direction
       it is measured on breaks across every triangle edge of this sphere. Left
       unbounded, the width explodes along those seams and paints the whole
       tessellation across the sky as thin white polygons. */
    float aa = clamp(fwidth(d) * 1.5, 0.0004, radius * 0.6);
    float core = 1.0 - smoothstep(radius - aa, radius + aa, d);
    return core * (pick - threshold) / (1.0 - threshold);
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

    // The two layers drift at different rates, so the cloud slowly changes shape
    // rather than sliding past as one sheet. Both are very slow on purpose.
    float clouds = fbm(d * 2.4 + vec3(uTime * 0.006, uTime * 0.004, -uTime * 0.005));
    float wisps = fbm(d * 6.1 + clouds * 1.6 + vec3(-uTime * 0.013, uTime * 0.009, uTime * 0.011));

    float breath = 0.88 + 0.12 * sin(uTime * 0.11);

    float warm = smoothstep(0.52, 0.92, clouds) * 0.9;
    float cool = smoothstep(0.44, 0.86, wisps) * 0.6;

    vec3 colour = uDeep + (uWarm * warm + uCool * cool) * breath;

    // Kept dim on purpose: this is a backdrop, and bloom lifts the bright wisps.
    colour *= 0.16;

    // The whole sky turns slowly enough that you never catch it moving.
    vec3 sky = spin(d, uTime * 0.004);

    /* Radii are in cell units and chosen so each layer lands near a pixel across.
       Smaller than that and a star is sub-pixel: dim, and back to flickering. */
    float shade;
    float near = starLayer(sky, 74.0, 0.9885, 0.13, shade);
    colour += mix(vec3(0.70, 0.81, 1.0), vec3(1.0, 0.89, 0.73), shade) * near * 1.6;

    float mid = starLayer(sky, 148.0, 0.9820, 0.20, shade);
    colour += mix(vec3(0.79, 0.86, 1.0), vec3(1.0, 0.94, 0.84), shade) * mid * 0.9;

    float dust = starLayer(sky, 290.0, 0.9730, 0.34, shade);
    colour += vec3(0.78, 0.84, 1.0) * dust * 0.45;

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export default function Nebula({ still = false }) {
  const material = useRef(null);

  const uniforms = useMemo(
    () => ({
      uDeep: { value: new Color('#05060f') },
      uWarm: { value: new Color('#4a2a6b') },
      uCool: { value: new Color('#123a6b') },
      uTime: { value: 0 }
    }),
    []
  );

  useFrame((_, delta) => {
    if (!still && material.current) material.current.uniforms.uTime.value += delta;
  });

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
