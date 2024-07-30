'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import planetTypes from '../Enums/planets';

const GameContext = createContext();

export default function GameContextWrapper({ children }) {
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [planetTypeQueue, setPlanetTypeQueue] = useState([planetTypes.MOON]);
  const [lives, setLives] = useState(3);

  // Keep track of local highscore
  const [highscore, setHighscore] = useState(0);
  useEffect(() => {
    let localHighscore = localStorage.getItem('highscore');
    if (isNaN(localHighscore)) localHighscore = 0;

    setHighscore(Math.max(score, localHighscore));

    if (score > localHighscore) {
      localStorage.setItem('highscore', score);
    }
  }, [score]);

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
  }, [planetTypeQueue.length]);

  const value = useMemo(
    () => ({
      gameState,
      setGameState,
      score,
      setScore,
      highscore,
      setHighscore,
      planetTypeQueue,
      setPlanetTypeQueue,
      lives,
      setLives
    }),
    [gameState, score, planetTypeQueue, lives, highscore]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  return useContext(GameContext);
}
