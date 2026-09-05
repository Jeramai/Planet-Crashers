'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdditiveBlending, Color, Quaternion, Vector3 } from 'three';
import { nextId } from '../../game/ids';

const TAIL = 72;
const DISTANCE = 150;
const SPREAD = 95;
const LENGTH = 46;
const SPEED = 165;
const LIFE_SECONDS = 1.6;
const MIN_GAP_MS = 2400;
const MAX_GAP_MS = 8000;

const COLOURS = ['#dbe9ff', '#ffffff', '#ffe4bd', '#b9d4ff'];

/* The tail is built once in local space, head at the origin and trailing down
   -Z, and shared by every streak. Travel happens in the vertex shader, so a
   streak costs two uniform writes a frame rather than 72 buffer writes. */
const TAIL_POSITIONS = new Float32Array(TAIL * 3);
const TAIL_FADES = new Float32Array(TAIL);
for (let i = 0; i < TAIL; i++) {
  const along = i / (TAIL - 1);
  TAIL_POSITIONS[i * 3 + 2] = -LENGTH * along;
  TAIL_FADES[i] = 1 - along;
}

const LOCAL_FORWARD = new Vector3(0, 0, -1);
const right = new Vector3();
const lift = new Vector3();
const facing = new Vector3();

const vertexShader = /* glsl */ `
  attribute float aFade;
  uniform float uTravel;
  varying float vFade;

  void main() {
    vFade = aFade;
    vec4 viewPosition = modelViewMatrix * vec4(position + vec3(0.0, 0.0, -uTravel), 1.0);
    gl_PointSize = clamp(1250.0 / -viewPosition.z, 2.0, 11.0) * (0.3 + 0.7 * aFade);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.05, d) * pow(vFade, 1.4) * uAlpha);
  }
`;

/* Spawned in front of whatever the camera is looking at, or most of them would
   streak past behind the player. */
function makeStreak(camera) {
  camera.getWorldDirection(facing);
  right.set(0, 1, 0).cross(facing).normalize();
  lift.copy(facing).cross(right).normalize();

  const across = (Math.random() * 2 - 1) * SPREAD;
  const up = (Math.random() * 2 - 1) * SPREAD * 0.6;
  const sweep = Math.random() * Math.PI * 2;

  const direction = new Vector3().addScaledVector(right, Math.cos(sweep)).addScaledVector(lift, Math.sin(sweep)).normalize();

  const at = new Vector3()
    .copy(camera.position)
    .addScaledVector(facing, DISTANCE)
    .addScaledVector(right, across)
    .addScaledVector(lift, up);

  return {
    id: nextId(),
    at: [at.x, at.y, at.z],
    quaternion: new Quaternion().setFromUnitVectors(LOCAL_FORWARD, direction),
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)]
  };
}

function Streak({ streak, onDone }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new Color(streak.colour) }, uTravel: { value: 0 }, uAlpha: { value: 0 } }),
    [streak.colour]
  );

  const material = useRef(null);
  const age = useRef(0);

  useFrame((_, delta) => {
    age.current += delta;
    if (age.current >= LIFE_SECONDS) {
      onDone();
      return;
    }
    if (!material.current) return;

    // Written on the live material, not on the object handed to the prop:
    // r3f copies that once and never looks at it again.
    const t = age.current / LIFE_SECONDS;
    material.current.uniforms.uTravel.value = SPEED * age.current;
    // In fast, out slow, so it reads as a streak rather than a blinking dot.
    material.current.uniforms.uAlpha.value = Math.min(1, t * 12) * (1 - t) ** 1.6;
  });

  return (
    <points position={streak.at} quaternion={streak.quaternion} raycast={null} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[TAIL_POSITIONS, 3]} />
        <bufferAttribute attach='attributes-aFade' args={[TAIL_FADES, 1]} />
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

export default function ShootingStars() {
  const camera = useThree((state) => state.camera);
  const [streaks, setStreaks] = useState([]);

  // A timer, not the frame loop: spawning is a once-every-few-seconds event and
  // has no business updating state sixty times a second.
  useEffect(() => {
    let timer = 0;

    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const born = makeStreak(camera);
          setStreaks((list) => [...list, born]);
          schedule();
        },
        MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS)
      );
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, [camera]);

  const retire = (id) => setStreaks((list) => list.filter((s) => s.id !== id));

  return streaks.map((streak) => <Streak key={streak.id} streak={streak} onDone={() => retire(streak.id)} />);
}
