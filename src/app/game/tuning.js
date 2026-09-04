import { Vector3 } from 'three';

/* One place for every number that changes how the game feels. */

/* The field answers to progress, not to the clock. Every shot closes it in and
   every point earned opens it back up, so merging well buys room and spamming
   does not. It also starts tight, because a field the early pile cannot get
   near is a field the early game can ignore. */
export const FIELD_MAX = 7.5;
export const FIELD_START = 5.6;
export const FIELD_MIN = 2.8;
export const FIELD_SHRINK_PER_SHOT = 0.1;
/* Diminishing, on the root of the score. Points buy room, so a run that merges
   well is given the space to keep going, but they buy less and less of it, so
   every run still ends. Paid linearly, a good run simply outran the shrink. */
export const FIELD_EXPAND_PER_ROOT = 0.115;

export const fieldRadiusAt = (shots, score) =>
  Math.min(
    FIELD_MAX,
    Math.max(FIELD_MIN, FIELD_START - shots * FIELD_SHRINK_PER_SHOT + Math.sqrt(Math.max(0, score)) * FIELD_EXPAND_PER_ROOT)
  );

export const GRACE_SECONDS = 3;

/* A launch is half outside on its way in — a quarter of a second usually, up to
   about eight tenths when it has to shoulder into a full field. The clock still
   runs the whole time, no exceptions and no loopholes, but the warning waits, so
   a shot does not paint itself and the whole field red on the way to the pile.
   Anything genuinely stuck still gets more than two seconds of red. */
export const WARNING_AFTER = 0.9;

export const GRAVITY = 6.5;

/* Launched from just outside the field, wherever the field currently is. A fixed
   spawn ring left every late shot coasting in from far outside the boundary,
   unharmed, while a settled planet a hair outside was already on the clock. */
export const LAUNCH_GAP = 1.6;
export const LAUNCH_STEP = 0.7;
export const LAUNCH_STEPS_MAX = 12;
export const spawnRadiusAt = (shots, score) => fieldRadiusAt(shots, score) + LAUNCH_GAP;
export const SHOT_SPEED = 6.5;
export const SHOT_COOLDOWN_MS = 220;

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
