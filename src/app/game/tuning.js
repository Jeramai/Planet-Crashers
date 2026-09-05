import { Vector3 } from 'three';

import { LARGEST_DEALT } from './planets';

/* One place for every number that changes how the game feels. */

/* The field is sized to what it holds.

   A fixed radius is loose when the field is nearly empty and brutal when it is
   full, which is why the first fifty shots used to carry no consequence at all.
   Sizing it from the volume inside keeps it tight at every stage, so the slack
   it allows is the only dial — and the slack decays.

   The numbers come from measurement. Across a run the furthest planet centre
   sits at 1.0 to 1.2x the radius of a sphere holding the same volume packed, so
   slack above about 1.2 is breathing room and slack below 1.0 is a field the
   pile is already spilling out of. Starting slack is deliberately close to that
   line: the field should look full from the first handful of shots. */
export const PACKING = 0.6;
export const SLACK_START = 1.22;
export const SLACK_MIN = 0.7;
export const SLACK_PER_SHOT = 0.011;
export const SLACK_PER_ROOT_POINT = 0.0018;

/* The floor is not decoration: with one or two planets on the board the volume
   is tiny, and a field sized purely from it would put the opening shot in danger
   the moment it drifted. Big enough to hold the first handful comfortably. */
export const FIELD_MIN = 2;
export const FIELD_MAX = 7.5;

/* Merging buys the field back, but less than a shot costs it. Well below
   SLACK_PER_SHOT on purpose: a board that keeps merging closes at about half
   speed, which is a reward you feel without ever reversing the squeeze. */
export const SLACK_PER_MERGE = 0.002;

export const contentRadius = (volume) => (Math.max(0, volume) / PACKING) ** (1 / 3);

/* Room for one more planet beside the largest body, and no more.

   Big bodies sink to the middle, so a newly dealt planet comes to rest with its
   centre at the sum of the two radii. Below that the newcomer is over the line
   the instant it lands, with nothing it could have done differently — which is
   how an Earth stops fitting once a giant owns the centre.

   Sized from the largest that can be *dealt*, not the second largest on the
   board: that version was fair per planet and ruinous overall, since a Saturn
   and a Jupiter together forced a field wider than the pile ever grows and
   nothing could burn at all. This depends on one body, so it stays bounded. */
export const geometricFloor = (biggest) => biggest + LARGEST_DEALT + 0.15;

export function fieldRadius(board, shots, score, merges) {
  const slack = Math.max(
    SLACK_MIN,
    SLACK_START - shots * SLACK_PER_SHOT + merges * SLACK_PER_MERGE + Math.sqrt(Math.max(0, score)) * SLACK_PER_ROOT_POINT
  );

  return Math.min(FIELD_MAX, Math.max(FIELD_MIN, geometricFloor(board.biggest), contentRadius(board.volume) * slack));
}

export const GRACE_SECONDS = 2.4;

/* One burn at a time. Several planets can cross the line together, and losing
   three lives in two seconds is not a loss the player had any say in. A burn
   clears every other clock and buys this long before anything else can go. */
export const BURN_COOLDOWN_MS = 2600;

/* A launch is half outside on its way in — a quarter of a second usually, up to
   about eight tenths when it has to shoulder into a full field. The clock still
   runs the whole time, no exceptions and no loopholes, but the warning waits, so
   a shot does not paint itself and the whole field red on the way to the pile.
   Anything genuinely stuck still gets more than two seconds of red. */
export const WARNING_AFTER = 0.9;

export const GRAVITY = 6.5;

/* Mass lives in planets.js as MASS_EXPONENT, next to the radii it is derived
   from, so tuning does not have to import from a module that imports it back. */

/* Planets pull on each other, faintly. Central gravity alone leaves two twins
   resting on opposite sides of a giant in perfect equilibrium with no reason to
   ever meet, so this exists to break that stalemate over several seconds — not
   to do the merging. Knocking planets together stays the player's job. */
export const MUTUAL_GRAVITY = 0.22;

/* Launched from just outside the field, wherever the field currently is. A fixed
   spawn ring left every late shot coasting in from far outside the boundary,
   unharmed, while a settled planet a hair outside was already on the clock. */
export const LAUNCH_GAP = 1.6;
export const LAUNCH_STEP = 0.7;
export const LAUNCH_STEPS_MAX = 12;
export const spawnRadiusFor = (field) => field + LAUNCH_GAP;
export const SHOT_SPEED = 6.5;
export const SHOT_COOLDOWN_MS = 220;

/* One planet in flight at a time. A shot spends about a quarter of a second
   getting inside the field, out of a two and a half second clock, so firing
   again immediately cost nothing and spamming beat aiming. Waiting for the last
   one to land makes every shot deliberate, and throttles itself: a crowded field
   takes longer to accept a planet, so a full board slows the player down exactly
   when that matters. Released after this long regardless, or a shot that can
   never get in would lock the game. */
export const INBOUND_MAX_MS = 1600;

/* Nothing may move faster than this. An impulse spike from a merge resolving an
   overlap is what used to fling planets clean out of the well. */
export const MAX_SPEED = 12;

export const RESTITUTION = 0;
export const MERGE_VELOCITY_KEEP = 0.3;
export const LINEAR_DAMPING = 0.9;
export const ANGULAR_DAMPING = 0.6;

export const COMBO_WINDOW_MS = 1400;
export const COMBO_STEP = 0.25;

export const LOST_DISTANCE = 200;

/* One star, off to one side and slightly above. Everything reads from this. */
export const SUN_DIRECTION = new Vector3(0.62, 0.42, 0.66).normalize();
export const SUN_DISTANCE = 90;

export const CAMERA = {
  start: [0, 5, 19],
  fov: 50,
  min: 15,
  max: 32
};
