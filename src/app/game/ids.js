/* Ids that survive a hot reload.

   A module-level counter looks fine until Turbopack re-evaluates the module: it
   resets to 1 while the planets holding ids 1..n are still in React state, and
   React reports two children with the same key. A registered symbol keeps the
   counter monotonic across re-evaluation, and costs nothing in production,
   where modules are evaluated once. */

const KEY = Symbol.for('planet-crashers/ids');

const counter = globalThis[KEY] ?? (globalThis[KEY] = { last: 0 });

export const nextId = () => (counter.last += 1);
