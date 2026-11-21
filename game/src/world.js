// The three levels of Pale Lantern — Fern Greenhouse, Pressed-Flower Archive,
// Moonpetal Vault. Each level is one plain object: walls the player and the
// guards cannot cross, fern beds that hide the player, lamps whose light makes
// the player easier to spot, pressed-flower seals to collect, guards on patrol
// loops, a player spawn and a green exit door. Nothing here is copied from
// another game: the herbarium, its wardens and its names are this game's own.

export const BOUNDS = { x: 24, y: 88, w: 1232, h: 688 };

export const LEVELS = [
  {
    name: 'Level 1 — Fern Greenhouse',
    subtitle: 'Collect 3 pressed seals, then slip out the green door unseen.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1160, y: 88, w: 96, h: 34, label: 'EXIT — GARDEN DOOR' },
    seals: [
      { x: 640, y: 170, taken: false },
      { x: 180, y: 180, taken: false },
      { x: 1120, y: 700, taken: false },
    ],
    walls: [
      { x: 340, y: 220, w: 300, h: 46, label: 'PLANTER BED' },
      { x: 640, y: 220, w: 300, h: 46, label: 'PLANTER BED' },
      { x: 340, y: 520, w: 300, h: 46, label: 'PLANTER BED' },
      { x: 640, y: 520, w: 300, h: 46, label: 'PLANTER BED' },
      { x: 90, y: 330, w: 46, h: 180 },
      { x: 1144, y: 330, w: 46, h: 180 },
    ],
    ferns: [
      { x: 490, y: 400, r: 78 },
      { x: 790, y: 400, r: 78 },
      { x: 180, y: 430, r: 62 },
      { x: 1100, y: 430, r: 62 },
      { x: 640, y: 660, r: 70 },
    ],
    lamps: [
      { x: 300, y: 140 },
      { x: 980, y: 140 },
      { x: 640, y: 400 },
      { x: 300, y: 720 },
      { x: 980, y: 720 },
    ],
    guards: [
      {
        x: 640, y: 330, facing: 0,
        waypoints: [{ x: 300, y: 330 }, { x: 980, y: 330 }],
      },
      {
        x: 640, y: 640, facing: Math.PI,
        waypoints: [{ x: 980, y: 640 }, { x: 300, y: 640 }],
      },
    ],
  },
  {
    name: 'Level 2 — Pressed-Flower Archive',
    subtitle: 'Three wardens walk the aisles. Ferns hide you; lamplight betrays you.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 24, y: 88, w: 96, h: 34, label: 'EXIT — ARCHIVE DOOR' },
    seals: [
      { x: 640, y: 150, taken: false },
      { x: 1150, y: 430, taken: false },
      { x: 240, y: 430, taken: false },
    ],
    walls: [
      { x: 220, y: 200, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 640, y: 200, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 220, y: 380, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 640, y: 380, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 220, y: 560, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 640, y: 560, w: 420, h: 40, label: 'ARCHIVE SHELF' },
      { x: 1080, y: 120, w: 40, h: 200 },
    ],
    ferns: [
      { x: 640, y: 310, r: 66 },
      { x: 640, y: 490, r: 66 },
      { x: 150, y: 300, r: 60 },
      { x: 1130, y: 660, r: 60 },
      { x: 430, y: 660, r: 60 },
    ],
    lamps: [
      { x: 430, y: 290 },
      { x: 850, y: 290 },
      { x: 430, y: 470 },
      { x: 850, y: 470 },
      { x: 640, y: 660 },
    ],
    guards: [
      {
        x: 300, y: 290, facing: 0,
        waypoints: [{ x: 300, y: 290 }, { x: 980, y: 290 }],
      },
      {
        x: 980, y: 470, facing: Math.PI,
        waypoints: [{ x: 980, y: 470 }, { x: 300, y: 470 }],
      },
      {
        x: 640, y: 660, facing: -Math.PI / 2,
        waypoints: [{ x: 200, y: 660 }, { x: 1080, y: 660 }],
      },
    ],
  },
  {
    name: 'Level 3 — Moonpetal Vault',
    subtitle: 'The Moonpetal Seed waits behind four wardens. One mistake wakes them all.',
    playerStart: { x: 640, y: 720 },
    exit: { x: 592, y: 88, w: 96, h: 34, label: 'EXIT — VAULT DOOR' },
    seals: [
      { x: 150, y: 160, taken: false },
      { x: 1130, y: 160, taken: false },
      { x: 640, y: 430, taken: false },
    ],
    walls: [
      { x: 300, y: 200, w: 200, h: 40, label: 'VAULT PLINTH' },
      { x: 780, y: 200, w: 200, h: 40, label: 'VAULT PLINTH' },
      { x: 300, y: 520, w: 200, h: 40, label: 'VAULT PLINTH' },
      { x: 780, y: 520, w: 200, h: 40, label: 'VAULT PLINTH' },
      { x: 590, y: 300, w: 100, h: 100, label: 'THE SEED CASE' },
    ],
    ferns: [
      { x: 250, y: 400, r: 62 },
      { x: 1030, y: 400, r: 62 },
      { x: 640, y: 620, r: 66 },
    ],
    lamps: [
      { x: 400, y: 150 },
      { x: 880, y: 150 },
      { x: 400, y: 640 },
      { x: 880, y: 640 },
      { x: 640, y: 250 },
      { x: 640, y: 500 },
    ],
    guards: [
      {
        x: 400, y: 290, facing: 0,
        waypoints: [{ x: 250, y: 290 }, { x: 1030, y: 290 }],
      },
      {
        x: 880, y: 610, facing: Math.PI,
        waypoints: [{ x: 1030, y: 610 }, { x: 250, y: 610 }],
      },
      {
        x: 200, y: 480, facing: Math.PI / 2,
        waypoints: [{ x: 200, y: 180 }, { x: 200, y: 640 }],
      },
      {
        x: 1080, y: 480, facing: -Math.PI / 2,
        waypoints: [{ x: 1080, y: 640 }, { x: 1080, y: 180 }],
      },
    ],
  },
];

// --- Geometry helpers shared by the player, the guards and the renderer. ---

export function circleHitsWall(x, y, r, level) {
  if (x - r < BOUNDS.x || x + r > BOUNDS.x + BOUNDS.w) return true;
  if (y - r < BOUNDS.y || y + r > BOUNDS.y + BOUNDS.h) return true;
  for (const w of level.walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}

export function pointInWall(x, y, level) {
  for (const w of level.walls) {
    if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return true;
  }
  return false;
}

// True when the straight segment between two points crosses a wall (or
// leaves the room): guards cannot see through walls.
export function segmentBlocked(x1, y1, x2, y2, level) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointInWall(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, level)) return true;
  }
  return false;
}

export function inFern(x, y, level) {
  for (const f of level.ferns) {
    if ((x - f.x) ** 2 + (y - f.y) ** 2 < f.r * f.r) return true;
  }
  return false;
}

export function inLamplight(x, y, level) {
  for (const lamp of level.lamps) {
    if ((x - lamp.x) ** 2 + (y - lamp.y) ** 2 < 150 * 150) return true;
  }
  return false;
}

// Distance from a point along a direction until a wall or the room edge.
export function rayDistance(x, y, angle, maxDist, level) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let d = 8;
  while (d < maxDist) {
    const px = x + dx * d;
    const py = y + dy * d;
    if (px < BOUNDS.x || px > BOUNDS.x + BOUNDS.w || py < BOUNDS.y || py > BOUNDS.y + BOUNDS.h) return d;
    if (pointInWall(px, py, level)) return d;
    d += 8;
  }
  return maxDist;
}
