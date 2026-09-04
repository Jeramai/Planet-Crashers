'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, Vector3 } from 'three';
import { specOf } from '../../game/planets';
import { spawnRadiusAt } from '../../game/tuning';

const DOTS = 18;
const ZERO = new Vector3(0, 0, 0);

/* One Aim exists at a time, so its buffers are module state rather than refs
   the renderer would have to read back during render. */
const TRAIL_POSITIONS = new Float32Array(DOTS * 3);
const TRAIL_FADES = Float32Array.from({ length: DOTS }, (_, i) => 1 - i / DOTS);

/* A camera-facing ring at the exact size of the incoming planet. A solid ghost —
   or a fresnel shell this close to the lens — just paints over the pile. */
export default function Aim({ type, shots }) {
  const spec = specOf(type);
  const camera = useThree((state) => state.camera);

  const reticle = useRef(null);
  const trail = useRef(null);
  const muzzle = useMemo(() => new Vector3(), []);
  const point = useMemo(() => new Vector3(), []);

  const uniforms = useMemo(() => ({ uColor: { value: new Color('#9fd8ff') } }), []);

  useFrame(() => {
    // Matches the launch exactly: on the boundary, on the camera's own ray.
    muzzle.copy(camera.position).normalize().multiplyScalar(spawnRadiusAt(shots));
    if (reticle.current) {
      reticle.current.position.copy(muzzle);
      reticle.current.quaternion.copy(camera.quaternion);
    }

    if (!trail.current) return;
    for (let i = 0; i < DOTS; i++) {
      point.copy(muzzle).lerp(ZERO, ((i + 1) / DOTS) * 0.85);
      TRAIL_POSITIONS[i * 3] = point.x;
      TRAIL_POSITIONS[i * 3 + 1] = point.y;
      TRAIL_POSITIONS[i * 3 + 2] = point.z;
    }
    trail.current.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={reticle} raycast={null}>
        <ringGeometry args={[spec.radius * 1.02, spec.radius * 1.14, 64]} />
        <meshBasicMaterial
          color='#9fd8ff'
          transparent
          opacity={0.85}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <points raycast={null} frustumCulled={false}>
        <bufferGeometry ref={trail}>
          <bufferAttribute attach='attributes-position' args={[TRAIL_POSITIONS, 3]} />
          <bufferAttribute attach='attributes-aFade' args={[TRAIL_FADES, 1]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={
            /* glsl */ `
            attribute float aFade;
            varying float vFade;
            void main() {
              vFade = aFade;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              // Clamped: the muzzle sits a few units from the lens, where an
              // unclamped perspective size becomes a screen-filling disc.
              gl_PointSize = clamp(140.0 / -mv.z, 2.0, 9.0) * aFade;
              gl_Position = projectionMatrix * mv;
            }
          `
          }
          fragmentShader={
            /* glsl */ `
            uniform vec3 uColor;
            varying float vFade;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              gl_FragColor = vec4(uColor, smoothstep(0.5, 0.1, d) * vFade * 0.75);
            }
          `
          }
        />
      </points>
    </>
  );
}
