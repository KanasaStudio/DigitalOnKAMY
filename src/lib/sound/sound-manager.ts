"use client";

import library from "./library.json";

export type SoundId = (typeof library.sounds)[number]["id"];
export type SoundPrefs = { enabled: boolean; volume: number; hover: boolean; notifications: boolean };

const KEY = "kamy:sound:v1";
const DEFAULTS: SoundPrefs = { enabled: false, volume: 0.6, hover: true, notifications: true };
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + library.basePath;
const SOUNDS = new Map(library.sounds.map((s) => [s.id, s]));
// Loaded eagerly once sound is on, because they answer direct user actions.
const PRELOAD: SoundId[] = ["hover", "click-primary", "click-secondary", "add-to-cart"];

/**
 * KAMY sound controller (prompt §15). Off until the user turns it on; audio is only created after a
 * real gesture; files are fetched lazily and cached; each sound has a cooldown so it can't stack;
 * every failure is swallowed so a missing or blocked file never breaks the action that played it.
 */
class SoundManager {
  private prefs: SoundPrefs = DEFAULTS;
  private loaded = false;
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer | "missing" | Promise<AudioBuffer | "missing">>();
  private lastPlayed = new Map<SoundId, number>();
  private listeners = new Set<() => void>();
  private snapshot: SoundPrefs & { available: number; checked: boolean } = { ...DEFAULTS, available: 0, checked: false };

  private load() {
    if (this.loaded || typeof window === "undefined") return;
    this.loaded = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<SoundPrefs>;
        this.prefs = {
          enabled: p.enabled === true,
          volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : DEFAULTS.volume,
          hover: p.hover !== false,
          notifications: p.notifications !== false,
        };
      }
    } catch {
      this.prefs = DEFAULTS;
    }
    this.emit();
    // Browsers keep audio suspended until a gesture; resume on the first one.
    const unlock = () => {
      if (this.prefs.enabled) void this.ensureContext();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
  }

  private emit() {
    const available = [...this.buffers.values()].filter((b) => b instanceof AudioBuffer).length;
    const checked = PRELOAD.every((id) => this.buffers.get(id) instanceof AudioBuffer || this.buffers.get(id) === "missing");
    this.snapshot = { ...this.prefs, available, checked };
    this.listeners.forEach((l) => l());
  }

  subscribe = (l: () => void) => {
    this.load();
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = () => {
    this.load();
    return this.snapshot;
  };
  getServerSnapshot = () => this.snapshot;

  set(patch: Partial<SoundPrefs>) {
    this.load();
    this.prefs = { ...this.prefs, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(this.prefs));
    } catch {
      /* preference stays for this tab */
    }
    if (this.gain) this.gain.gain.value = this.prefs.volume;
    if (this.prefs.enabled) {
      void this.ensureContext().then(() => PRELOAD.forEach((id) => void this.buffer(id)));
    }
    this.emit();
  }

  private async ensureContext() {
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        this.ctx = new Ctor();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = this.prefs.volume;
        this.gain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private buffer(id: SoundId): Promise<AudioBuffer | "missing"> | AudioBuffer | "missing" {
    const cached = this.buffers.get(id);
    if (cached) return cached;
    const meta = SOUNDS.get(id);
    if (!meta || !this.ctx) return "missing";
    const ctx = this.ctx;
    const p = fetch(`${BASE}/${meta.file}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => "missing" as const)
      .then((result) => {
        this.buffers.set(id, result);
        this.emit();
        return result;
      });
    this.buffers.set(id, p);
    return p;
  }

  /** Fire and forget. Never throws, never awaits on the caller's path. */
  play(id: SoundId) {
    this.load();
    const meta = SOUNDS.get(id);
    if (!meta || !this.prefs.enabled || this.prefs.volume <= 0) return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (meta.group === "hover" && !this.prefs.hover) return;
    if (meta.group === "notification" && !this.prefs.notifications) return;
    const now = performance.now();
    if (now - (this.lastPlayed.get(id) ?? -Infinity) < meta.cooldownMs) return;
    this.lastPlayed.set(id, now);
    void (async () => {
      const ctx = await this.ensureContext();
      if (!ctx || !this.gain || ctx.state !== "running") return;
      const buf = await this.buffer(id);
      if (!(buf instanceof AudioBuffer)) return;
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = meta.volume;
      src.buffer = buf;
      src.connect(g).connect(this.gain);
      src.start();
    })().catch(() => undefined);
  }
}

export const sound = new SoundManager();
export const SOUND_LIBRARY = library;
