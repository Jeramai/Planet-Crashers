'use client';

import { Physics, useSphere } from '@react-three/cannon';
import { OrbitControls, Outlines, Sphere, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import planetTypes from '../Enums/planets';
import { useGameContext } from './Context';
import { imgPrefix } from './Overlays';

// https://www.solarsystemscope.com/textures/
useTexture.preload([
  `${imgPrefix}textures/2k_mercury.jpg`,
  `${imgPrefix}textures/2k_venus.jpg`,
  `${imgPrefix}textures/2k_mars.jpg`,
  `${imgPrefix}textures/2k_jupiter.jpg`,
  `${imgPrefix}textures/2k_saturn.jpg`,
  `${imgPrefix}textures/2k_uranus.jpg`,
  `${imgPrefix}textures/2k_neptune.jpg`,
  `${imgPrefix}textures/2k_earth.jpg`,
  `${imgPrefix}textures/2k_moon.jpg`,
  `${imgPrefix}textures/2k_sun.jpg`,
  `${imgPrefix}textures/2k_pluto.jpg`
]);

const dangerZoneRadius = 13;

export default function Game() {
  const { planetTypeQueue, setPlanetTypeQueue, setScore } = useGameContext();

  const [shotPlanets, setShotPlanets] = useState([]);

  const onClick = (e) => {
    // On right click or touch end, shoot
    if (e.button === 2) {
      // Unset the collision pairs
      setCollisionPairs([]);

      // Add the shot planet
      const newPlanet = {
        timestamp: Date.now(),
        type: planetTypeQueue[0]
      };
      setShotPlanets((sp) => [...sp, newPlanet]);

      // Remove first item from queue
      setPlanetTypeQueue((ptq) => {
        const [, ...rest] = ptq;
        return rest;
      });
    }
  };

  const cursorPos = useRef([0, 0]);
  const onTouchStart = (e) => {
      cursorPos.current = [e.pageX, e.pageY];
    },
    onTouchEnd = (e) => {
      if (cursorPos.current[0] === e.pageX && cursorPos.current[1] === e.pageY) {
        if (e.pointerType === 'touch') e.button = 2;
        onClick(e);
      }
      cursorPos.current = [e.pageX, e.pageY];
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
        { timestamp: 10, type: planetTypes.JUPITER, position: [15, 0, 0] },
        { timestamp: 11, type: planetTypes.SUN, position: [20, 0, 0] }
      ]);
    }
  }, [showPlanets]);

  // Update score based on collided planets
  const [collisionPairs, setCollisionPairs] = useState([]);
  useEffect(() => {
    collisionPairs.forEach((planetType) => {
      setScore((s) => s + getPlanetArgs(planetType).points / 2);
    });
  }, [setScore, collisionPairs]);

  return (
    <Canvas className='w-full h-full flex flex-1 bg-black' onPointerDown={onTouchStart} onPointerUp={onTouchEnd}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls minDistance={10} maxDistance={25} enablePan={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Physics gravity={[0, 0, 0]}>
        {shotPlanets.map((planet) => (
          <ShootablePlanet
            key={planet.timestamp}
            {...planet}
            setShotPlanets={setShotPlanets}
            collisionPairs={collisionPairs}
            setCollisionPairs={setCollisionPairs}
          />
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
    <Sphere ref={ref} name='DANGER_ZONE' args={[dangerZoneRadius]} position={[0, 0, 0]}>
      <meshBasicMaterial color='red' opacity={0.05} transparent />
    </Sphere>
  );
}
function ShootablePlanet({ timestamp, setShotPlanets, setCollisionPairs, type = planetTypes.MOON, position = undefined }) {
  const planetArgs = getPlanetArgs(type);
  const map = useTexture(`./textures/2k_${type}.jpg`);
  const outlineThickness = Math.min(0.05 * planetArgs.args[0], 0.1);

  // Get planet shoot position
  const camera = useThree((state) => state.camera);
  const direction = useMemo(() => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    return direction;
  }, [camera]);
  const startPosition = useMemo(() => {
    if (position) return position;

    const objectPosition = new Vector3();
    objectPosition.copy(camera.position).addScaledVector(direction, (planetArgs?.args[0] ?? 0) * 2);
    return [objectPosition.x ?? 0, objectPosition.y ?? 0, objectPosition.z ?? 0];
  }, [camera, direction, planetArgs?.args, position]);

  const positionRef = useRef(startPosition);

  // Merge planets when touching
  const posVec3 = new Vector3();
  const onCollide = ({ body, target }) => {
    if (body?.userData?.type === target?.userData?.type) {
      // Don't merge on suns
      if (body.userData.type === planetTypes.SUN || target.userData.type === planetTypes.SUN) return;

      // Merge the colliding planets
      setShotPlanets((sp) => {
        const bodyPlanet = sp.find((_sp) => _sp.timestamp === body.userData.timestamp);
        if (bodyPlanet) {
          const bodyPlanetTypeIndex = Object.values(planetTypes).findIndex((v) => v === bodyPlanet.type);
          if (bodyPlanetTypeIndex !== -1) {
            // Remove old planets and create a new one
            const newSP = sp.filter((p) => p.timestamp !== target.userData.timestamp && p.timestamp !== body.userData.timestamp);
            const worldPosition = body.getWorldPosition(posVec3);
            const newPlanet = {
              timestamp: bodyPlanet.timestamp - 1,
              type: Object.values(planetTypes)[bodyPlanetTypeIndex - 1],
              position: [worldPosition.x ?? 0, worldPosition.y ?? 0, worldPosition.z ?? 0]
            };
            return [...newSP, newPlanet];
          }
        }
        return sp;
      });

      // Add the collision to the CP flag
      setCollisionPairs((cp) => [...cp, body.userData.type]);
    }
  };

  // Create the shootable planet
  const [ref, api] = useSphere(() => ({
    type: 'Dynamic',
    linearDamping: 0.1,
    angularDamping: 0.1,
    position: positionRef.current,
    onCollideBegin: onCollide,
    userData: { timestamp, type },
    velocity: [direction.x, direction.y, direction.z],
    // Planet overwrites
    ...planetArgs
  }));

  // Aply gravity towards the gravity point
  const { setLives } = useGameContext();
  const moonForce = useRef(new Vector3());
  useEffect(() => {
    const applyGravityToCenter = (planetPosition) => {
      const moon_to_planet = new Vector3(-planetPosition[0], -planetPosition[1], -planetPosition[2]);
      moon_to_planet.normalize();
      moon_to_planet.multiplyScalar(Math.max(1, planetArgs?.mass || 1));

      moonForce.current.copy(moon_to_planet);
      api.applyForce([moonForce.current.x, moonForce.current.y, moonForce.current.z], [0, 0, 0]);
    };

    // If sphere is outside of the dangerzone for longer than 3 seconds. Remove a live.
    const dangerZoneCenter = new Vector3();
    const planetPosVector3 = new Vector3();
    const checkOutsideOfDangerZone = (planetPosition) => {
      planetPosVector3.set(planetPosition[0], planetPosition[1], planetPosition[2]);
      const distance = planetPosVector3.distanceTo(dangerZoneCenter);

      if (distance > dangerZoneRadius) {
        setLives((l) => l - 1);
        setShotPlanets((sp) => sp.filter((_sp) => _sp.timestamp !== timestamp));
      }
    };

    // Update position ref
    const updatePlanetPosition = (planetPosition) => {
      positionRef.current = planetPosition;
    };

    // Subscribe to position changes
    api.position.subscribe((pos) => {
      applyGravityToCenter(pos);
      checkOutsideOfDangerZone(pos);
      updatePlanetPosition(pos);
    });
  }, [api, timestamp, planetArgs.mass, setLives, setShotPlanets]);

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
        color: '#f49f16',
        points: 0
      };
    case planetTypes.JUPITER:
      return {
        args: [4], // Approximate size relative to Earth
        mass: 318, // Mass relative to Earth
        color: '#c1a375',
        points: 256
      };
    case planetTypes.SATURN:
      return {
        args: [3], // Approximate size relative to Earth
        mass: 95, // Mass relative to Earth
        color: '#d3cba9',
        points: 256
      };
    case planetTypes.URANUS:
      return {
        args: [2.25], // Approximate size relative to Earth
        mass: 14.5, // Mass relative to Earth
        color: '#98cdd0',
        points: 128
      };
    case planetTypes.NEPTUNE:
      return {
        args: [1.5], // Approximate size relative to Earth
        mass: 17.1, // Mass relative to Earth
        color: '#76aef7',
        points: 64
      };
    case planetTypes.EARTH:
      return {
        args: [1], // Size of Earth
        mass: 1, // Mass of Earth
        color: '#FFFFFF',
        points: 32
      };
    case planetTypes.VENUS:
      return {
        args: [0.75], // Approximate size relative to Earth
        mass: 0.815, // Mass relative to Earth
        color: '#c49863',
        points: 16
      };
    case planetTypes.MARS:
      return {
        args: [0.5], // Approximate size relative to Earth
        mass: 0.107, // Mass relative to Earth
        color: '#be7757',
        points: 8
      };
    case planetTypes.MERCURY:
      return {
        args: [0.3], // Approximate size relative to Earth
        mass: 0.055, // Mass relative to Earth
        color: '#8a878d',
        points: 4
      };
    case planetTypes.PLUTO:
      return {
        args: [0.2], // Approximate size relative to Earth
        mass: 0.0022, // Mass relative to Earth
        color: '#55332e',
        points: 2
      };
    case planetTypes.MOON:
    default:
      return {
        args: [0.1], // Approximate size of the Moon relative to Earth
        mass: 0.0123, // Mass of the Moon relative to Earth
        color: '#74798c',
        points: 1
      };
  }
};
