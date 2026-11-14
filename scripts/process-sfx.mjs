#!/usr/bin/env node
// Trim leading silence, cap length, normalise loudness (-20 LUFS, -1.5 dBTP), short fade-out, and
// export a small MP3 into public/assets/audio/ui/. Requires ffmpeg.
//   node scripts/process-sfx.mjs <sound-id> <input-file>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const [id, input] = process.argv.slice(2);
const lib = JSON.parse(readFileSync(path.join(process.cwd(), "src/lib/sound/library.json"), "utf8"));
const s = lib.sounds.find((x) => x.id === id);
if (!s || !input) {
  console.error("usage: node scripts/process-sfx.mjs <sound-id> <input-file>");
  process.exit(1);
}
const dest = path.join(process.cwd(), "public", lib.basePath, s.file);
mkdirSync(path.dirname(dest), { recursive: true });
const len = s.trimSeconds;
const fade = Math.min(0.12, len / 3);
execFileSync("ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error", "-i", input,
  "-af",
  [
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.005",
    `atrim=0:${len}`,
    "loudnorm=I=-20:TP=-1.5:LRA=7",
    `afade=t=out:st=${(len - fade).toFixed(3)}:d=${fade.toFixed(3)}`,
  ].join(","),
  "-ar", "44100", "-ac", "2", "-b:a", "128k", dest,
]);
const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dest]).toString().trim();
console.log(`${s.file}: ${Number(probe).toFixed(2)} s, ${(statSync(dest).size / 1024).toFixed(1)} KB`);
