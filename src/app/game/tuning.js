import { Vector3 } from 'three';

/* One place for every number that changes how the game feels. */

/* The field closes in. Central gravity means merges always keep pace with the
   shots, so a fixed boundary is never reached and the run cannot end. A field
   that contracts turns every run into a clock the player races. */
export const DANGER_START = 9;
export const DANGER_MIN = 4.2;
export const DANGER_SHRINK_PER_SHOT = 0.075;

export const dangerRadiusAt = (shots) => Math.max(DANGER_MIN, DANGER_START - shots * DANGER_SHRINK_PER_SHOT);
export const GRACE_SECONDS = 3;

export const GRAVITY = 6.5;

/* Launched from just outside the field, wherever the field currently is. A fixed
   spawn ring left every late shot coasting in from far outside the boundary,
   unharmed, while a settled planet a hair outside was already on the clock. */
export const LAUNCH_GAP = 1.6;
export const spawnRadiusAt = (shots) => dangerRadiusAt(shots) + LAUNCH_GAP;
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
