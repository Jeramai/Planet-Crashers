import { MERGE_CHAIN, PlanetType } from './planets';
import { GameState, MAX_LIVES, START_LIVES } from './state';

/* One run of the game, as a single transition table.

   Everything here is pure. Anything that is not — dealing from the seeded
   random, minting an id, reading the URL — happens in the caller and arrives in
   the action, because React invokes a reducer twice in development and a deal
   drawn twice would break a seeded run. */

const blank = () => ({
  score: 0,
  lives: START_LIVES,
  hold: null,
  best: { type: null, chain: 0 },
  combo: 0,
  shots: 0,
  merges: 0,
  suns: 0,
  board: { volume: 0, biggest: 0, second: 0 }
});

export const startingRun = ({ seed, rng, queue, highscore }) => ({
  ...blank(),
  gameState: GameState.Menu,
  returnTo: GameState.Menu,
  runId: 0,
  highscore,
  seed,
  rng,
  queue
});

export function runReducer(state, action) {
  switch (action.type) {
    case 'goto':
      return state.gameState === action.to ? state : { ...state, gameState: action.to };

    // Reading the rules puts you back where you were, and pauses the run while
    // you read, which falls out of the state machine for free.
    case 'openRules':
      return { ...state, returnTo: action.from, gameState: GameState.Rules };

    case 'closeRules':
      return { ...state, gameState: state.returnTo };

    case 'start':
      return {
        ...state,
        ...blank(),
        gameState: GameState.Playing,
        runId: state.runId + 1,
        seed: action.seed,
        rng: action.rng,
        queue: action.queue
      };

    case 'score': {
      const score = state.score + action.points;
      return { ...state, score, highscore: Math.max(state.highscore, score) };
    }

    /* The run ends inside the transition that took the last life, so nothing can
       ever read three lives and a finished run at the same time. */
    case 'burn': {
      const lives = Math.max(0, state.lives - 1);
      return { ...state, lives, gameState: lives === 0 ? GameState.Over : state.gameState };
    }

    case 'star':
      return state.lives >= MAX_LIVES ? state : { ...state, lives: state.lives + 1 };

    case 'shoot':
      return { ...state, shots: state.shots + 1, queue: [...state.queue.slice(1), action.dealt] };

    /* An empty slot takes the planet you are holding and deals you the next one.
       A full slot trades. Either way the shot count is untouched: a swap is not
       a shot, and the field only closes for shots. */
    case 'hold': {
      const current = state.queue[0];
      if (!current) return state;
      const rest = state.queue.slice(1);
      return {
        ...state,
        hold: current.type,
        queue: action.traded ? [action.traded, ...rest] : [...rest, action.dealt]
      };
    }

    case 'merge': {
      const { best } = state;
      const furthest = MERGE_CHAIN.indexOf(action.planet) > MERGE_CHAIN.indexOf(best.type) ? action.planet : best.type;
      const held = furthest === best.type && action.chain <= best.chain;
      return {
        ...state,
        merges: state.merges + 1,
        suns: state.suns + (action.planet === PlanetType.Sun ? 1 : 0),
        best: held ? best : { type: furthest, chain: Math.max(best.chain, action.chain) }
      };
    }

    case 'board': {
      const { volume, biggest, second } = action.board;
      const was = state.board;
      if (volume === was.volume && biggest === was.biggest && second === was.second) return state;
      return { ...state, board: action.board };
    }

    case 'combo':
      return state.combo === action.value ? state : { ...state, combo: action.value };

    default:
      return state;
  }
}
