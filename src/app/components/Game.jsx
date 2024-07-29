'use client';

import { Physics, useSphere } from '@react-three/cannon';
import { OrbitControls, Outlines, Sphere, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import planetTypes from '../Enums/planets';

// https://www.solarsystemscope.com/textures/
useTexture.preload([
  '/textures/2k_mercury.jpg',
  '/textures/2k_venus.jpg',
  '/textures/2k_mars.jpg',
  '/textures/2k_jupiter.jpg',
  '/textures/2k_saturn.jpg',
  '/textures/2k_uranus.jpg',
  '/textures/2k_neptune.jpg',
  '/textures/2k_earth.jpg',
  '/textures/2k_moon.jpg',
  '/textures/2k_sun.jpg',
  '/textures/2k_pluto.jpg'
]);

export default function Game() {
  const [shotPlanets, setShotPlanets] = useState([]);
  // useEffect(() => console.log(shotPlanets), [shotPlanets]);

  const onClick = (e) => {
    const planetNames = Object.values(planetTypes)
      // Filter out all unshootable planets
      .filter(
        (pt) => ![planetTypes.SUN, planetTypes.JUPITER, planetTypes.SATURN, planetTypes.URANUS, planetTypes.NEPTUNE].includes(pt)
      );

    const randomIndex = Math.floor(Math.random() * planetNames.length);
    const type = planetNames[randomIndex];

    const newPlanet = {
      timestamp: Date.now(),
      type
    };

    // On right click, shoot
    if (e.button === 2) {
      setShotPlanets((sp) => [...sp, newPlanet]);
    }
  };

  // Set test planets
  const showPlanets = !false;
  useEffect(() => {
    if (showPlanets) {
      setShotPlanets([
        { timestamp: 1, type: planetTypes.MOON, position: [0, 0, 0] },
        { timestamp: 2, type: planetTypes.PLUTO, position: [1, 0, 0] },
        { timestamp: 3, type: planetTypes.MERCURY, position: [2, 0, 0] },
        { timestamp: 4, type: planetTypes.MARS, position: [3, 0, 0] },
        { timestamp: 5, type: planetTypes.VENUS, position: [4, 0, 0] },
        { timestamp: 6, type: planetTypes.EARTH, position: [6, 0, 0] },
        { timestamp: 7, type: planetTypes.NEPTUNE, position: [8, 0, 0] },
        { timestamp: 8, type: planetTypes.URANUS, position: [9, 0, 0] },
        { timestamp: 9, type: planetTypes.SATURN, position: [12, 0, 0] },
        { timestamp: 10, type: planetTypes.JUPITER, position: [15, 0, 0] },
        { timestamp: 11, type: planetTypes.SUN, position: [20, 0, 0] }
      ]);
    }
  }, [showPlanets]);

  return (
    <Canvas className='w-full h-full flex flex-1' onPointerUp={onClick}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls maxDistance={25} enablePan={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Physics gravity={[0, 0, 0]}>
        {shotPlanets.map((planet) => (
          <ShootablePlanet key={planet.timestamp} {...planet} setShotPlanets={setShotPlanets} />
        ))}

        {/* Helper objects */}
        <DangerZone />
      </Physics>
    </Canvas>
  );
}
function DangerZone() {
  const ref = useRef();

  // Update mesh opacity based on frame clock
  useFrame(({ clock }) => {
    // Opacity between 0.05 and 0.25
    const maxOpacity = 0.25;
    const minOpacity = 0.1;
    const speed = 2;
    const elapsedTime = clock.elapsedTime * speed;
    const opacity = (Math.sin(elapsedTime) * (maxOpacity - minOpacity)) / 2 + (maxOpacity + minOpacity) / 2;
    ref.current.material.opacity = opacity;
  });

  return (
    <Sphere ref={ref} name='DANGER_ZONE' args={[15]} position={[0, 0, 0]}>
      <meshBasicMaterial color='red' opacity={0.05} transparent />
    </Sphere>
  );
}
function ShootablePlanet({ timestamp, setShotPlanets, type = planetTypes.MOON, position = undefined }) {
  const camera = useThree((state) => state.camera);
  const planetArgs = getPlanetArgs(type);
  const map = useTexture(`./textures/2k_${type}.jpg`);
  const outlineThickness = Math.min(0.05 * planetArgs.args[0], 0.1);

  // Merge planets when touching
  const posVec3 = new Vector3();
  const onCollide = ({ body, target }) => {
    if (body.userData.type === target.userData.type) {
      // Don't merge on suns
      if (body.userData.type === planetTypes.SUN || target.userData.type === planetTypes.SUN) return;

      setShotPlanets((sp) => {
        const bodyPlanet = sp.find((_sp) => _sp.timestamp === body.userData.timestamp);
        if (bodyPlanet) {
          const bodyPlanetTypeIndex = Object.values(planetTypes).findIndex((v) => v === bodyPlanet.type);
          if (bodyPlanetTypeIndex !== -1) {
            const newSP = sp.filter((p) => p.timestamp !== target.userData.timestamp && p.timestamp !== body.userData.timestamp);

            const worldPosition = body.getWorldPosition(posVec3);
            const newPlanet = {
              timestamp: bodyPlanet.timestamp - 1,
              type: Object.values(planetTypes)[bodyPlanetTypeIndex - 1],
              position: [worldPosition.x, worldPosition.y, worldPosition.z]
            };
            return [...newSP, newPlanet];
          }
        }
        return sp;
      });
    }
  };

  // Create the shootable planet
  const [ref, api] = useSphere(() => ({
    type: 'Dynamic',
    position: position ?? [camera.position.x, camera.position.y, camera.position.z],
    linearDamping: 0.5,
    angularDamping: 0.5,
    onCollideBegin: onCollide,
    userData: { timestamp, type },
    // Planet overwrites
    ...planetArgs,
    mass: 1 // Force same mass for now, so the planets go at the same speed
  }));

  // Aply gravity towards the gravity point
  const moonForce = useRef(new Vector3());
  useEffect(() => {
    const applyGravityToCenter = (planetPosition) => {
      const moon_to_planet = new Vector3(-planetPosition[0], -planetPosition[1], -planetPosition[2]);
      moon_to_planet.normalize();
      moon_to_planet.multiplyScalar(50);

      moonForce.current.copy(moon_to_planet);
      api.applyForce([moonForce.current.x, moonForce.current.y, moonForce.current.z], [0, 0, 0]);
    };

    const unsubscribe = api.position.subscribe(applyGravityToCenter);
    return () => unsubscribe();
  }, [api.position]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={planetArgs.args} />
      <meshBasicMaterial color={0xffffff} map={map} />
      <Outlines thickness={outlineThickness} color='white' screenspace />
    </mesh>
  );
}

const getPlanetArgs = (type) => {
  switch (type) {
    case planetTypes.SUN:
      return {
        args: [6], // Approximate size relative to Earth
        mass: 1, // Mass relative to Earth
        color: '#f49f16'
      };
    case planetTypes.JUPITER:
      return {
        args: [4], // Approximate size relative to Earth
        mass: 318, // Mass relative to Earth
        color: '#c1a375'
      };
    case planetTypes.SATURN:
      return {
        args: [3], // Approximate size relative to Earth
        mass: 95, // Mass relative to Earth
        color: '#d3cba9'
      };
    case planetTypes.URANUS:
      return {
        args: [2.25], // Approximate size relative to Earth
        mass: 14.5, // Mass relative to Earth
        color: '#98cdd0'
      };
    case planetTypes.NEPTUNE:
      return {
        args: [1.5], // Approximate size relative to Earth
        mass: 17.1, // Mass relative to Earth
        color: '#76aef7'
      };
    case planetTypes.EARTH:
      return {
        args: [1], // Size of Earth
        mass: 1, // Mass of Earth
        color: '#FFFFFF'
      };
    case planetTypes.VENUS:
      return {
        args: [0.75], // Approximate size relative to Earth
        mass: 0.815, // Mass relative to Earth
        color: '#c49863'
      };
    case planetTypes.MARS:
      return {
        args: [0.5], // Approximate size relative to Earth
        mass: 0.107, // Mass relative to Earth
        color: '#be7757'
      };
    case planetTypes.MERCURY:
      return {
        args: [0.3], // Approximate size relative to Earth
        mass: 0.055, // Mass relative to Earth
        color: '#8a878d'
      };
    case planetTypes.PLUTO:
      return {
        args: [0.2], // Approximate size relative to Earth
        mass: 0.0022, // Mass relative to Earth
        color: '#55332e'
      };
    case planetTypes.MOON:
    default:
      return {
        args: [0.1], // Approximate size of the Moon relative to Earth
        mass: 0.0123, // Mass of the Moon relative to Earth
        color: '#74798c'
      };
  }
};
