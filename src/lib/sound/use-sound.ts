"use client";

import { useSyncExternalStore } from "react";
import { sound } from "./sound-manager";

export function useSoundPrefs() {
  return useSyncExternalStore(sound.subscribe, sound.getSnapshot, sound.getServerSnapshot);
}
