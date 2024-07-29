import { useGameContext } from './Context';
import Button from './Helpers/Button';

export default function Options() {
  const { setGameState } = useGameContext();

  return (
    <div className='p-24 flex flex-col items-center gap-5'>
      <div className='text-4xl font-semibold mb-5 text-center'>Options</div>
      <Button onClick={() => setGameState('MENU')}>Back to menu</Button>
    </div>
  );
}
