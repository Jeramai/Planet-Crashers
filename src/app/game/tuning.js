import { Vector3 } from 'three';

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
export const SLACK_START = 1.35;
export const SLACK_MIN = 0.85;
export const SLACK_PER_SHOT = 0.008;
export const SLACK_PER_ROOT_POINT = 0.0028;

export const FIELD_MIN = 1.5;
export const FIELD_MAX = 7.5;

export const contentRadius = (volume) => (Math.max(0, volume) / PACKING) ** (1 / 3);

export function fieldRadius(volume, shots, score) {
  const slack = Math.max(SLACK_MIN, SLACK_START - shots * SLACK_PER_SHOT + Math.sqrt(Math.max(0, score)) * SLACK_PER_ROOT_POINT);
  return Math.min(FIELD_MAX, Math.max(FIELD_MIN, contentRadius(volume) * slack));
}

export const GRACE_SECONDS = 2.4;

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
export const spawnRadiusFor = (field) => field + LAUNCH_GAP;
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
