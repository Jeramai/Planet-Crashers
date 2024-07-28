import Game from './components/Game';
import Overlays from './components/Overlays';

export default function Home() {
  return (
    <main className='h-full w-full'>
      <Game />
      <Overlays />
    </main>
  );
}
