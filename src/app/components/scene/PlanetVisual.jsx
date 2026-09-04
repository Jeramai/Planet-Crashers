'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, DoubleSide, RingGeometry, Vector3 } from 'three';
import { textureUrl } from '../../game/assets';
import { PlanetType, specOf } from '../../game/planets';
import { setUpTexture } from '../../game/textures';
import Atmosphere from './Atmosphere';

const NO_GLOW = new Color('#000000');
const WARNING = new Color('#ff2d2d');

export default function PlanetVisual({ type, spin = 0.08, flags = null, flagKey = null }) {
  const spec = specOf(type);
  const map = useTexture(textureUrl(`2k_${type}.jpg`), setUpTexture);

  const mesh = useRef(null);
  const material = useRef(null);
  const base = useMemo(() => (spec.emissive ? new Color(spec.emissive) : NO_GLOW.clone()), [spec.emissive]);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += spin * delta;
    if (!material.current) return;

    const level = flags ? (flags.current.get(flagKey) ?? 0) : 0;
    const pulse = level > 0 ? level * (0.55 + 0.45 * Math.sin(performance.now() / 70)) : 0;

    material.current.emissive.copy(base);
    if (pulse > 0) material.current.emissive.lerp(WARNING, pulse);
    material.current.emissiveIntensity = (spec.emissiveIntensity ?? 0) + pulse * 1.8;
  });

  return (
    <>
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[spec.radius, 64, 48]} />
        <meshStandardMaterial
          ref={material}
          map={map}
          bumpMap={spec.bump > 0 ? map : null}
          bumpScale={spec.bump}
          roughness={spec.roughness}
          metalness={0}
          emissive={base}
          emissiveMap={spec.emissive ? map : null}
          emissiveIntensity={spec.emissiveIntensity ?? 0}
        />
      </mesh>

      {spec.air ? <Atmosphere radius={spec.radius} {...spec.air} /> : null}
      {type === PlanetType.Saturn ? <SaturnRing radius={spec.radius} /> : null}
    </>
  );
}

function SaturnRing({ radius }) {
  const map = useTexture(textureUrl('saturn-rings-top.png'), setUpTexture);

  // The stock ring UVs run around the ring, not across it, so the bands never
  // show until the coordinates are re-mapped radially.
  const geometry = useMemo(() => {
    const inner = radius * 1.35;
    const outer = radius * 2.25;
    const geo = new RingGeometry(inner, outer, 128, 1);
    const pos = geo.attributes.position;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      geo.attributes.uv.setXY(i, (v.length() - inner) / (outer - inner), 1);
    }
    return geo;
  }, [radius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2 + 0.16, 0, 0.1]} receiveShadow>
      <meshStandardMaterial map={map} transparent side={DoubleSide} roughness={0.9} metalness={0} alphaTest={0.02} />
    </mesh>
  );
}
