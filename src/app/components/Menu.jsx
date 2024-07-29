import { useGameContext } from './Context';

export default function Menu() {
  const { setGameState } = useGameContext();

  return (
    <div className='p-24 flex flex-col items-center gap-5'>
      <div className='text-4xl font-semibold mb-5 text-center'>Planet Crashers</div>
      <button
        className='px-7 py-4 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 hover:bg-cyan-300/40 duration-300 w-full max-w-[400px] text-center uppercase'
        onClick={() => setGameState('GAME')}
      >
        Start game
      </button>
      <button
        className='px-7 py-4 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 hover:bg-cyan-300/40 duration-300 w-full max-w-[400px] text-center uppercase'
        onClick={() => setGameState('OPTIONS')}
      >
        OPTIONS
      </button>
    </div>
  );
}
