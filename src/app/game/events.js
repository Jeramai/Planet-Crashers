const listeners = new Map();

export function on(name, fn) {
  let set = listeners.get(name);
  if (!set) {
    set = new Set();
    listeners.set(name, set);
  }
  set.add(fn);
  return () => set.delete(fn);
}

export function emit(name, payload) {
  listeners.get(name)?.forEach((fn) => fn(payload));
}

export const GameEvent = {
  Merge: 'merge',
  Explode: 'explode',
  Shake: 'shake',
  Popup: 'popup',
  Shoot: 'shoot',
  Danger: 'danger'
};
