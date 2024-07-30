import GameContextWrapper from './components/Context';
import GameWrapper from './components/GameWrapper';

export default function Home() {
  return (
    <main className='h-full w-full'>
      <div id='stars' />

      <GameContextWrapper>
        <GameWrapper />
      </GameContextWrapper>
    </main>
  );
}
