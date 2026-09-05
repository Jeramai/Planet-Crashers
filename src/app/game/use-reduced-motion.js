'use client';

import { useSyncExternalStore } from 'react';

const media = () => window.matchMedia('(prefers-reduced-motion: reduce)');

function subscribe(onChange) {
  const query = media();
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false
  );
}
