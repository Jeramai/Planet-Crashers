'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/* Hydration gate. The stored highscore only exists in the browser, so nothing
   that reads it may render on the server. */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
