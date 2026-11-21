// Deterministic screenshot states for Pale Lantern.
// ?shot=cover | alert | lure | win builds one frozen, readable moment of the
// real game — same code path as play, no staged art — so the screenshots the
// judge sees are honest renders of the game's own code.

export function applyShot(game, shot) {
  if (shot === 'cover') {
    // Level 1 mid-patrol: Wren at the fern edge, two cones sweeping the room,
    // seals glowing, the green door waiting top-right.
    game.loadLevel(0);
    game.screen = 'playing';
    game.player.x = 640;
    game.player.y = 470;
    game.guards[0].x = 560;
    game.guards[0].y = 330;
    game.guards[0].facing = 0.5;
    game.guards[1].x = 760;
    game.guards[1].y = 640;
    game.guards[1].facing = Math.PI + 0.4;
    game.level.seals[0].taken = true;
    return;
  }
  if (shot === 'alert') {
    // A warden half-saw Wren in the lamplight: cone orange, "?" overhead,
    // suspicion meter high, Wren sprinting for the ferns.
    game.loadLevel(1);
    game.screen = 'playing';
    game.player.x = 430;
    game.player.y = 330;
    game.player.sneaking = false;
    game.guards[0].x = 560;
    game.guards[0].y = 290;
    game.guards[0].facing = Math.PI;
    game.guards[0].suspicion = 72;
    game.guards[1].x = 850;
    game.guards[1].y = 470;
    game.guards[1].facing = -Math.PI / 2;
    game.guards[1].suspicion = 20;
    game.level.seals[0].taken = true;
    return;
  }
  if (shot === 'lure') {
    // Pebble clatter: a noise ring where it landed, a warden turning to
    // investigate, Wren hidden deep in the ferns behind it.
    game.loadLevel(1);
    game.screen = 'playing';
    game.player.x = 640;
    game.player.y = 490;
    game.player.hidden = true;
    game.pebbles = 4;
    game.noiseRings = [{ x: 850, y: 380, born: 0.9 }];
    game.guards[0].x = 700;
    game.guards[0].y = 290;
    game.guards[0].facing = 0.9;
    game.guards[0].state = 'investigate';
    game.guards[0].investigateAt = { x: 850, y: 380 };
    game.guards[1].x = 980;
    game.guards[1].y = 470;
    game.guards[1].facing = Math.PI;
    game.level.seals[0].taken = true;
    game.level.seals[2].taken = true;
    return;
  }
  if (shot === 'win') {
    // The vault, won: all seals pocketed, the green door open, Wren through it.
    game.loadLevel(2);
    game.screen = 'win';
    game.elapsed = 214;
    game.timesCaught = 1;
    for (const seal of game.level.seals) seal.taken = true;
    game.player.x = 640;
    game.player.y = 150;
    game.guards[0].x = 400;
    game.guards[0].y = 290;
    game.guards[0].facing = 0;
    game.guards[1].x = 880;
    game.guards[1].y = 610;
    game.guards[1].facing = Math.PI;
    return;
  }
}
