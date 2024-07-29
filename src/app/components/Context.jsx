'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import planetTypes from '../Enums/planets';

const GameContext = createContext();

export default function GameContextWrapper({ children }) {
  const [score, setScore] = useState(0);
  const [planetTypeQueue, setPlanetTypeQueue] = useState([planetTypes.MOON]);

  // Create the next item for the planetTypeQueu
  useEffect(() => {
    if (planetTypeQueue.length === 1) {
      const planetNames = Object.values(planetTypes)
        // Filter out all unshootable planets
        .filter(
          (pt) =>
            ![planetTypes.SUN, planetTypes.JUPITER, planetTypes.SATURN, planetTypes.URANUS, planetTypes.NEPTUNE].includes(pt)
        );

      const randomIndex = Math.floor(Math.random() * planetNames.length);
      setPlanetTypeQueue((ptq) => [...ptq, planetNames[randomIndex]]);
    }
  }, [planetTypes, planetTypeQueue.length]);

  const value = useMemo(
    () => ({
      score,
      setScore,
      planetTypeQueue,
      setPlanetTypeQueue
    }),
    [score, planetTypeQueue]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  return useContext(GameContext);
}
