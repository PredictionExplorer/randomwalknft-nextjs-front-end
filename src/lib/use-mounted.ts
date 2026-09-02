"use client";

import { useSyncExternalStore } from "react";

function noop() {
  // The mounted flag never changes after hydration, so there is nothing to subscribe to.
}

const subscribe = () => noop;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** `false` during SSR and the hydration render, `true` afterwards — without a setState-in-effect. */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
