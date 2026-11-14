#!/usr/bin/env node
// Generates the KAMY UI sound library with ElevenLabs Sound Effects (server-side, development only).
//
//   ELEVENLABS_API_KEY=... node scripts/generate-sfx.mjs            # all sounds, 3 takes each
//   ELEVENLABS_API_KEY=... node scripts/generate-sfx.mjs hover error   # selected ids
//
// The key is read from the environment only. It is never written to disk, never bundled and never
// sent anywhere except api.elevenlabs.io. Takes land in .sfx-takes/ (git-ignored) for listening;
// `node scripts/process-sfx.mjs <id> <take>` trims, normalises and copies the approved take into
// public/assets/audio/ui/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is not set. Nothing was generated.");
  process.exit(1);
}
const lib = JSON.parse(readFileSync(path.join(process.cwd(), "src/lib/sound/library.json"), "utf8"));
const only = new Set(process.argv.slice(2));
const takes = Number(process.env.SFX_TAKES ?? 3);
const out = path.join(process.cwd(), ".sfx-takes");
mkdirSync(out, { recursive: true });

for (const s of lib.sounds) {
  if (only.size && !only.has(s.id)) continue;
  for (let n = 1; n <= takes; n++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/sound-generation?output_format=${lib.output_format}`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text: s.prompt,
        model_id: lib.model_id, // eleven_text_to_sound_v3, set explicitly
        duration_seconds: s.duration_seconds,
        prompt_influence: s.prompt_influence,
        loop: false,
      }),
    });
    if (!res.ok) {
      console.error(`${s.id} take ${n}: HTTP ${res.status} ${await res.text()}`);
      continue;
    }
    const file = path.join(out, `${s.id}-take${n}.mp3`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`${s.id} take ${n} -> ${path.relative(process.cwd(), file)}`);
  }
}
