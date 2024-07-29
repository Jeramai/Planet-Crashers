import { useGameContext } from './Context';

export default function Options() {
  const { setGameState } = useGameContext();

  return (
    <div>
      <div onClick={() => setGameState('MENU')}>MENU</div>
    </div>
  );
}
