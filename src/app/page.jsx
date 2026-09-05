import GameProvider from './game/store';
import GameWrapper from './components/GameWrapper';

export default function Home() {
  return (
    <main className='h-full w-full'>
      <GameProvider>
        <GameWrapper />
      </GameProvider>
    </main>
  );
}
