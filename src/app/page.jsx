'use client';

import { Physics, useSphere } from '@react-three/cannon';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';

export default function Home() {
  return (
    <main className='h-full w-full'>
      <Game />
    </main>
  );
}

function Game() {
  const [shotPlanets, setShotPlanets] = useState([]);

  const onClick = (e) => {
    const planetNames = Object.values(planetTypes);
    const randomIndex = Math.floor(Math.random() * planetNames.length);
    const type = planetNames[randomIndex];

    const newPlanet = {
      timestamp: Date.now(),
      type
    };

    // On right click, shoot
    if (e.button === 2) {
      // setShotPlanets((sp) => [...sp, newPlanet]);
      setShotPlanets([newPlanet]);
    }
  };

  // Set test planets
  const showPlanets = false;
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
        { timestamp: 10, type: planetTypes.JUPITER, position: [15, 0, 0] }
      ]);
    }
  }, [showPlanets]);

  return (
    <Canvas className='w-full h-full flex flex-1' onPointerUp={onClick}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls maxDistance={100} enablePan={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Physics gravity={[0, 0, 0]}>
        {shotPlanets.map((planet) => (
          <ShootablePlanet key={planet.timestamp} type={planet.type} position={planet.position} />
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
    <Sphere ref={ref} name='DANGER_ZONE' args={[50]} position={[0, 0, 0]}>
      <meshBasicMaterial color='red' opacity={0.05} transparent />
    </Sphere>
  );
}
function ShootablePlanet({ type = planetTypes.MOON, position = undefined }) {
  const camera = useThree((state) => state.camera);
  const planetArgs = getPlanetArgs(type);

  // Create the shootable planet
  const [ref, api] = useSphere(() => ({
    type: 'Dynamic',
    position: position ?? [camera.position.x, camera.position.y, camera.position.z],
    linearDamping: 0.5,
    angularDamping: 0.5,
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
      <meshBasicMaterial color={planetArgs.color ?? 'orange'} />
    </mesh>
  );
}

const planetTypes = {
  MERCURY: 'mercury',
  VENUS: 'venus',
  EARTH: 'earth',
  MARS: 'mars',
  JUPITER: 'jupiter',
  SATURN: 'saturn',
  URANUS: 'uranus',
  NEPTUNE: 'neptune',
  PLUTO: 'pluto',
  MOON: 'moon'
};
const getPlanetArgs = (type) => {
  switch (type) {
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
        color: '#040d42'
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
