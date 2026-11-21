// Game state for Pale Lantern: screens, movement, seals, pebbles, the alarm
// and level progression. One object owns the whole run so the renderer and
// the screenshot states can both read it without reaching into each other.

import { LEVELS, circleHitsWall, inFern } from './world.js';
import { createGuard, guardsHearPebble, updateGuard } from './guards.js';
import {
  PEBBLES_PER_LEVEL, SNEAK_SPEED, WALK_SPEED,
} from './config.js';

export function createGame(input, audio) {
  const game = {
    input,
    audio,
    screen: 'title', // title | playing | caught | levelClear | win
    levelIndex: 0,
    level: null,
    guards: [],
    player: { x: 0, y: 0, sneaking: false, hidden: false },
    pebbles: PEBBLES_PER_LEVEL,
    noiseRings: [],
    elapsed: 0,
    timesCaught: 0,
    totalSeals: LEVELS.reduce((n, l) => n + l.seals.length, 0),
  };

  game.loadLevel = (index) => {
    game.levelIndex = index;
    // Fresh copies: a restart must never remember taken seals.
    const def = LEVELS[index];
    game.level = JSON.parse(JSON.stringify(def));
    game.guards = def.guards.map((g) => createGuard(g));
    game.player.x = def.playerStart.x;
    game.player.y = def.playerStart.y;
    game.player.hidden = false;
    game.pebbles = PEBBLES_PER_LEVEL;
    game.noiseRings = [];
  };

  game.start = () => {
    game.elapsed = 0;
    game.timesCaught = 0;
    game.loadLevel(0);
    game.screen = 'playing';
  };

  game.loadLevel(0);

  game.throwPebble = (at) => {
    if (game.screen !== 'playing' || game.pebbles <= 0) return;
    game.pebbles -= 1;
    game.noiseRings.push({ x: at.x, y: at.y, born: game.now });
    game.audio.pebble();
    guardsHearPebble(game.guards, at);
  };

  game.update = (dt) => {
    if (game.screen !== 'playing') return;
    game.elapsed += dt;

    // Movement with wall collision, axis by axis so corners slide.
    const mv = input.moveVector();
    const speed = input.sneaking() ? SNEAK_SPEED : WALK_SPEED;
    const p = game.player;
    p.sneaking = input.sneaking();
    const nx = p.x + mv.x * speed * dt;
    const ny = p.y + mv.y * speed * dt;
    if (!circleHitsWall(nx, p.y, 14, game.level)) p.x = nx;
    if (!circleHitsWall(p.x, ny, 14, game.level)) p.y = ny;
    p.hidden = inFern(p.x, p.y, game.level);
    if ((mv.x !== 0 || mv.y !== 0)) {
      audio.footstep(p.sneaking);
      if (p.hidden) audio.rustle();
    }

    // Pebble throws from the mouse.
    if (input.click) {
      const at = input.click;
      input.click = null;
      game.throwPebble(at);
    }

    // Seals: walk over a pressed flower to pocket it.
    for (const seal of game.level.seals) {
      if (!seal.taken && Math.hypot(seal.x - p.x, seal.y - p.y) < 26) {
        seal.taken = true;
        audio.pickup();
      }
    }

    // The exit opens only once every seal is pocketed.
    const e = game.level.exit;
    const allSeals = game.level.seals.every((s) => s.taken);
    if (allSeals && p.x > e.x - 10 && p.x < e.x + e.w + 10 && p.y > e.y - 10 && p.y < e.y + e.h + 10) {
      if (game.levelIndex + 1 >= LEVELS.length) {
        game.screen = 'win';
        audio.win();
      } else {
        game.screen = 'levelClear';
        audio.levelClear();
      }
      return;
    }

    // Wardens patrol, watch, chase and investigate.
    for (const guard of game.guards) {
      const result = updateGuard(guard, dt, p, game.level, audio);
      if (result === 'caught') {
        game.timesCaught += 1;
        game.screen = 'caught';
        audio.caught();
        return;
      }
    }
  };

  // Enter / Space moves between screens; R restarts the current level.
  game.confirm = () => {
    if (game.screen === 'title') game.start();
    else if (game.screen === 'caught') {
      game.loadLevel(game.levelIndex);
      game.screen = 'playing';
    } else if (game.screen === 'levelClear') {
      game.loadLevel(game.levelIndex + 1);
      game.screen = 'playing';
    } else if (game.screen === 'win') game.start();
  };

  game.restartLevel = () => {
    if (game.screen === 'playing' || game.screen === 'caught') {
      game.loadLevel(game.levelIndex);
      game.screen = 'playing';
    }
  };

  return game;
}
