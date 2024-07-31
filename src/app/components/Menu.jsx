import planetTypes from '../Enums/planets';
import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function Menu() {
  const { setGameState, highscore, setLives, setPlanetTypeQueue, setScore } = useGameContext();

  const resetAndStart = () => {
    setGameState('GAME');
    setLives(3);
    setScore(0);
    setPlanetTypeQueue([planetTypes.MOON]);
  };

  return (
    <div className='py-24 px-8 flex flex-col items-center gap-5'>
      <div>
        <div className='text-4xl font-semibold text-center mb-2'>Planet Crashers</div>
        <div className='text-sm mb-5 text-center uppercase text-white/60'>Highscore: {highscore}</div>
      </div>

      <Button onClick={resetAndStart}>Start game</Button>
      <Button onClick={() => setGameState('OPTIONS')}>OPTIONS</Button>
    </div>
  );
}
