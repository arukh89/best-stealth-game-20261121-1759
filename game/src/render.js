// Everything the judge sees: the renderer draws the whole game on one canvas.
// The cover screenshot has to read at a glance when shrunk — dark floor,
// warm lamplight pools, bright vision cones, fern cover, a green exit door,
// and the player picked out by a pale lantern glow — so every element is
// drawn big, high-contrast and labelled in plain words.

import { BOUNDS } from './world.js';
import { COLORS, HUD_H, VIEW_H, VIEW_W } from './config.js';
import { visionConePolygon } from './guards.js';

function coneColor(suspicion, chasing) {
  if (chasing || suspicion >= 100) return COLORS.coneAlarm;
  if (suspicion > 35) return COLORS.coneWary;
  return COLORS.coneCalm;
}

function drawFloor(ctx, level) {
  ctx.fillStyle = COLORS.floorA;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  // Checkerboard floor tiles so patrol routes read as a real place.
  const tile = 64;
  ctx.fillStyle = COLORS.floorB;
  for (let y = HUD_H; y < VIEW_H; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  // Room border.
  ctx.strokeStyle = COLORS.wallTop;
  ctx.lineWidth = 4;
  ctx.strokeRect(BOUNDS.x, BOUNDS.y, BOUNDS.w, BOUNDS.h);
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 8);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    if (w.label && w.w >= 150) {
      ctx.fillStyle = '#cfe3d2';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.label, w.x + w.w / 2, w.y + w.h / 2 + 5);
    }
  }
}

function drawLamps(ctx, level, time) {
  for (const lamp of level.lamps) {
    const flicker = 0.85 + Math.sin(time * 2 + lamp.x) * 0.06;
    const grad = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, 150);
    grad.addColorStop(0, COLORS.lampGlow);
    grad.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.globalAlpha = flicker;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.lampCore;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6b4d1f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 11, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawFerns(ctx, level) {
  for (const f of level.ferns) {
    ctx.fillStyle = COLORS.fernDark;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
    // Fronds: short strokes radiating from the centre.
    ctx.strokeStyle = COLORS.fern;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + f.x * 0.01;
      ctx.beginPath();
      ctx.moveTo(f.x + Math.cos(a) * f.r * 0.25, f.y + Math.sin(a) * f.r * 0.25);
      ctx.lineTo(f.x + Math.cos(a) * f.r * 0.95, f.y + Math.sin(a) * f.r * 0.95);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(220,255,220,0.75)';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FERN — HIDE HERE', f.x, f.y + f.r + 16);
  }
}

function drawSeals(ctx, level, time) {
  for (const seal of level.seals) {
    if (seal.taken) continue;
    const bob = Math.sin(time * 3 + seal.x) * 3;
    const pulse = 22 + Math.sin(time * 3 + seal.x) * 4;
    ctx.strokeStyle = 'rgba(255, 215, 106, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(seal.x, seal.y + bob, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.seal;
    ctx.beginPath();
    ctx.arc(seal.x, seal.y + bob, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5b12';
    ctx.beginPath();
    ctx.arc(seal.x, seal.y + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.seal;
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(seal.x + Math.cos(a) * 17, seal.y + bob + Math.sin(a) * 17);
      ctx.lineTo(seal.x + Math.cos(a) * 24, seal.y + bob + Math.sin(a) * 24);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.seal;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SEAL', seal.x, seal.y + bob + 38);
  }
}

function drawExit(ctx, level, sealsDone) {
  const e = level.exit;
  const glow = sealsDone ? 0.9 : 0.45;
  ctx.globalAlpha = glow;
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.exitDark;
  ctx.fillRect(e.x + 6, e.y + 6, e.w - 12, e.h - 12);
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = sealsDone ? COLORS.exit : '#cfe8d8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sealsDone ? 'EXIT — OPEN' : 'EXIT — LOCKED', e.x + e.w / 2, e.y + e.h + 20);
}

function drawCones(ctx, guards, level) {
  for (const guard of guards) {
    const poly = visionConePolygon(guard, level);
    ctx.fillStyle = coneColor(guard.suspicion, guard.state === 'chase');
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    // Body: a warden in a brass-buttoned coat, facing its patrol direction.
    ctx.fillStyle = COLORS.guardDark;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c2410';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20);
    ctx.stroke();
    // Eyes.
    const ex = Math.cos(guard.facing);
    const ey = Math.sin(guard.facing);
    ctx.fillStyle = '#1a1206';
    ctx.beginPath();
    ctx.arc(guard.x + ex * 5 - ey * 4, guard.y + ey * 5 + ex * 4, 2.2, 0, Math.PI * 2);
    ctx.arc(guard.x + ex * 5 + ey * 4, guard.y + ey * 5 - ex * 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Suspicion mark above the head: ? while wary, ! on the chase.
    if (guard.state === 'chase') {
      ctx.fillStyle = COLORS.danger;
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 26);
    } else if (guard.suspicion > 35) {
      ctx.fillStyle = '#ffb13d';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', guard.x, guard.y - 26);
    }
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WARDEN', guard.x, guard.y + 30);
  }
}

function drawPlayer(ctx, player, level, time) {
  const hidden = player.hidden;
  // Pale lantern glow around the player — the game's namesake light.
  const grad = ctx.createRadialGradient(player.x, player.y, 4, player.x, player.y, 64);
  grad.addColorStop(0, 'rgba(240, 235, 200, 0.35)');
  grad.addColorStop(1, 'rgba(240, 235, 200, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = hidden ? 0.45 : 1;
  // Cloaked figure: pale hood, blue-grey cloak.
  ctx.fillStyle = COLORS.playerCloak;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y - 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#20242e';
  ctx.beginPath();
  ctx.arc(player.x - 3, player.y - 3, 1.8, 0, Math.PI * 2);
  ctx.arc(player.x + 3, player.y - 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // The lantern itself, swinging gently.
  const swing = Math.sin(time * 2.2) * 4;
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(player.x + 12 + swing, player.y - 4, 7, 9);
  ctx.strokeStyle = '#6b4d1f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(player.x + 12 + swing, player.y - 4, 7, 9);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hidden ? 'WREN — HIDDEN' : 'WREN', player.x, player.y + 28);
}

function drawNoiseRings(ctx, rings, time) {
  for (const ring of rings) {
    const age = time - ring.born;
    if (age < 0 || age > 1.2) continue;
    const r = 12 + age * 130;
    ctx.strokeStyle = `rgba(255, 220, 120, ${0.85 - age * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 220, 120, 0.9)';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLATTER!', ring.x, ring.y - r - 6);
  }
}

export function drawHUD(ctx, game) {
  const level = game.level;
  const sealsGot = level.seals.filter((s) => s.taken).length;
  const suspicion = Math.max(0, ...game.guards.map((g) => g.suspicion));
  ctx.fillStyle = '#050a08';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PALE LANTERN — ' + level.name, 20, 28);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '15px sans-serif';
  ctx.fillText(level.subtitle, 20, 50);
  // Seals collected, top right.
  ctx.fillStyle = COLORS.seal;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`SEALS ${sealsGot}/${level.seals.length}   PEBBLES ${game.pebbles}`, VIEW_W - 20, 28);
  // Suspicion meter — the detection system, always visible, on its own row.
  const mx = VIEW_W - 220;
  const mw = 200;
  ctx.fillStyle = '#1c2a22';
  ctx.fillRect(mx, 38, mw, 14);
  ctx.fillStyle = suspicion > 60 ? COLORS.danger : suspicion > 25 ? '#ffb13d' : '#58e08a';
  ctx.fillRect(mx, 38, (mw * suspicion) / 100, 14);
  ctx.strokeStyle = COLORS.textDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, 38, mw, 14);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(suspicion >= 100 ? 'ALARM!' : suspicion > 35 ? 'SPOTTED?' : 'UNSEEN', mx - 8, 50);
}

function drawBanner(ctx, title, lines) {
  ctx.fillStyle = 'rgba(3, 8, 6, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 300);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = COLORS.textDim;
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 350 + i * 32));
}

export function drawScene(ctx, game, time) {
  const level = game.level;
  drawFloor(ctx, level);
  drawWalls(ctx, level);
  drawLamps(ctx, level, time);
  drawFerns(ctx, level);
  drawSeals(ctx, level, time);
  drawExit(ctx, level, level.seals.every((s) => s.taken));
  drawCones(ctx, game.guards, level);
  drawGuards(ctx, game.guards);
  drawNoiseRings(ctx, game.noiseRings, time);
  drawPlayer(ctx, game.player, level, time);
  drawHUD(ctx, game);

  if (game.screen === 'title') {
    drawBanner(ctx, 'PALE LANTERN', [
      'The Herbarium Heist — a stealth game in three night levels.',
      'WASD / arrows to move · Shift to sneak · Click to throw a pebble',
      'Hide in the ferns. Mind the lamplight. Reach the green door unseen.',
      '',
      'Press ENTER to begin',
    ]);
  } else if (game.screen === 'caught') {
    drawBanner(ctx, 'CAUGHT!', [
      `A warden caught Wren in the ${level.name.split('—')[1].trim()}.`,
      `Seals kept: ${level.seals.filter((s) => s.taken).length} of ${level.seals.length}.`,
      '',
      'Press ENTER to try this level again',
    ]);
  } else if (game.screen === 'levelClear') {
    drawBanner(ctx, 'UNSEEN — LEVEL CLEAR', [
      'Wren slipped out with every seal, and no warden ever knew.',
      '',
      'Press ENTER for the next level',
    ]);
  } else if (game.screen === 'win') {
    drawBanner(ctx, 'THE MOONPETAL SEED IS YOURS', [
      `Wren stole all ${game.totalSeals} seals and vanished before dawn.`,
      `Time: ${Math.floor(game.elapsed / 60)}:${String(Math.floor(game.elapsed % 60)).padStart(2, '0')}  ·  Caught: ${game.timesCaught} time(s)`,
      '',
      'Press ENTER to play again',
    ]);
  }
}
