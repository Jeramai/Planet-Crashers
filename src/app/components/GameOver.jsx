import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function GameOver() {
  const { score, setGameState } = useGameContext();

  return (
    <div className='py-24 px-8 flex flex-col items-center gap-5'>
      <div>
        <div className='text-4xl font-semibold mb-2 text-center'>GAME OVER</div>
        <div className='text-sm mb-5 text-center uppercase text-white/60'>Final result: {score}</div>
      </div>
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
