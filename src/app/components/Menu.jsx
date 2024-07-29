import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function Menu() {
  const { setGameState } = useGameContext();

  return (
    <div className='p-24 flex flex-col items-center gap-5'>
      <div className='text-4xl font-semibold mb-5 text-center'>Planet Crashers</div>
      <Button onClick={() => setGameState('GAME')}>Start game</Button>
      <Button onClick={() => setGameState('OPTIONS')}>OPTIONS</Button>
    </div>
  );
}
