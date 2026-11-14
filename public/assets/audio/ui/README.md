# KAMY UI sound library

Target files (see `src/lib/sound/library.json` for prompt, usage, volume and cooldown of each):
ui-hover-soft.mp3, ui-click-primary.mp3, ui-click-secondary.mp3, ui-add-to-cart.mp3, ui-success.mp3,
ui-panel-open.mp3, ui-error-soft.mp3, ui-notification.mp3, ui-transition-soft.mp3

Status: NOT GENERATED YET. No placeholder or silent files are committed. Until the real files exist the
SoundManager finds nothing, stays silent and the SOUND FX panel says so.

Generate (development machine, key stays in the environment):
  ELEVENLABS_API_KEY=... node scripts/generate-sfx.mjs
  node scripts/process-sfx.mjs hover .sfx-takes/hover-take2.mp3   # after listening, per sound
