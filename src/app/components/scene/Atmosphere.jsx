'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, BackSide, Color, Vector3 } from 'three';
import { SUN_DIRECTION } from '../../game/tuning';

const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldView;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDirection;
  uniform float uPower;
  uniform float uStrength;

  varying vec3 vWorldNormal;
  varying vec3 vWorldView;

  void main() {
    vec3 n = normalize(vWorldNormal);
    float rim = pow(1.0 - abs(dot(n, normalize(vWorldView))), uPower);

    // The halo is brightest where the sun hits, but never fully dark, so the
    // night limb still separates the planet from the starfield.
    float sun = max(dot(n, normalize(uSunDirection)), 0.0);
    float lit = mix(0.16, 1.0, sun);

    float alpha = rim * lit * uStrength;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

export default function Atmosphere({ radius, color, power, strength }) {
  const material = useRef(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uSunDirection: { value: new Vector3().copy(SUN_DIRECTION) },
      uPower: { value: power },
      uStrength: { value: strength }
    }),
    [color, power, strength]
  );

  useFrame(() => {
    if (material.current) material.current.uniforms.uSunDirection.value.copy(SUN_DIRECTION);
  });

  return (
    <mesh scale={1.06} raycast={null}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={BackSide}
      />
    </mesh>
  );
}
