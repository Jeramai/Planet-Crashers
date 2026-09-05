/* The physics engine is the largest thing the app ships, and the menu does not
   need it. One promise, shared by the lazy boundary and every preload trigger,
   so intent and idle cannot start two downloads. */
let started = null;

export const preloadField = () => (started ??= import('./PlanetField'));
