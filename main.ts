// Pale Lantern — The Herbarium Heist (make.fun best-stealth-game-20261121-1759).
// Entry program (Node 22, standard library only): hands the game in by copying
// game/ and screenshots/ from beside this file to /output and writing
// /output/dossier.json with the vendored make.fun library. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The dossier must exist and be non-empty, or the hand-in is silently useless,
// so this program refuses to finish quietly when buildDossier gives nothing back.

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The sealed scorer's own caps: only text_max_bytes shapes the bytes; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in game/ or 48 MiB of game files in all, or a
// path under game/ over 1000 bytes — game/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
if (!(dossier instanceof Uint8Array) || dossier.length === 0) {
  throw new Error('buildDossier returned an empty dossier');
}
writeFileSync(join(out, 'dossier.json'), dossier);
if (statSync(join(out, 'dossier.json')).size === 0) {
  throw new Error('dossier.json was written empty');
}
