// Entry point for Pale Lantern — The Herbarium Heist.
// Boots the canvas, runs the fixed-step loop, and honours ?shot= for the
// deterministic screenshot states in shots.js. In shot mode the game renders
// one frozen frame and stops, so a screenshot is the same every run.

import { VIEW_H, VIEW_W } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createGame } from './game.js';
import { drawScene } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const game = createGame(input, audio);
// Exposed for playtesting and debugging only; the game never reads it.
window.__paleLantern = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? 1);
if (shot) {
  // Deterministic clock for screenshots: time is fixed, not wall-clock.
  game.now = 1.2;
  applyShot(game, shot);
  drawScene(ctx, game, 1.2);
  document.title = `Pale Lantern — shot ${shot} (seed ${seed})`;
} else {
  game.now = 0;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.now += dt;
    audio.unlock();
    if (input.pressed === 'confirm') {
      input.pressed = null;
      game.confirm();
    } else if (input.pressed === 'mute') {
      input.pressed = null;
      audio.toggleMute();
    } else if (input.pressed === 'restart') {
      input.pressed = null;
      game.restartLevel();
    }
    game.update(dt);
    drawScene(ctx, game, game.now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
