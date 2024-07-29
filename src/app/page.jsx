import GameContextWrapper from './components/Context';
import Game from './components/Game';
import Overlays from './components/Overlays';

export default function Home() {
  return (
    <main className='h-full w-full'>
      <GameContextWrapper>
        <Game />
        <Overlays />
      </GameContextWrapper>
    </main>
  );
}
