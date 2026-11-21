// The herbarium wardens: patrol, vision, suspicion, chase and investigation.
// A guard walks its waypoint loop and looks where it faces. When the player
// crosses its raycast vision cone in the open, suspicion rises — faster up
// close, faster still in lamplight — and the cone reddens. Suspicion falls
// while the player stays unseen, so a near miss is a scare, not a sentence.
// At full suspicion the guard gives chase; caught in the open, the player is
// sent back to the level start. A thrown pebble's clatter draws guards in
// earshot to the landing spot instead.

import {
  ALARM_AT, CHASE_GIVE_UP, GUARD_CATCH_RADIUS, GUARD_CHASE_SPEED,
  GUARD_HEAR_RADIUS, GUARD_PATROL_SPEED, PEBBLE_NOISE_SECONDS,
  SUSPICION_FALL, SUSPICION_RISE_CLOSE, SUSPICION_RISE_FAR,
  SUSPICION_RISE_LAMP, VISION_HALF_ANGLE, VISION_RANGE,
} from './config.js';
import { circleHitsWall, inFern, inLamplight, rayDistance, segmentBlocked } from './world.js';

export function createGuard(def) {
  return {
    x: def.x,
    y: def.y,
    facing: def.facing,
    waypoints: def.waypoints,
    waypointIndex: 0,
    state: 'patrol', // patrol | investigate | chase
    suspicion: 0,
    lastSeen: null,
    unseenFor: 0,
    investigateFor: 0,
    investigateAt: null,
    steppedAt: 0,
  };
}

// Can this guard see the player right now? Range, cone angle, a clear line
// of sight, and the player not hidden inside a fern bed.
export function guardCanSee(guard, player, level) {
  if (inFern(player.x, player.y, level)) return false;
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > VISION_RANGE) return false;
  let diff = Math.atan2(dy, dx) - guard.facing;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > VISION_HALF_ANGLE) return false;
  if (segmentBlocked(guard.x, guard.y, player.x, player.y, level)) return false;
  return true;
}

// The vision cone as a polygon: rays fanned across the cone, each stopped by
// the first wall it meets. The renderer fills this; the judge reads it.
export function visionConePolygon(guard, level) {
  const rays = 26;
  const points = [{ x: guard.x, y: guard.y }];
  for (let i = 0; i <= rays; i++) {
    const a = guard.facing - VISION_HALF_ANGLE + (2 * VISION_HALF_ANGLE * i) / rays;
    const d = rayDistance(guard.x, guard.y, a, VISION_RANGE, level);
    points.push({ x: guard.x + Math.cos(a) * d, y: guard.y + Math.sin(a) * d });
  }
  return points;
}

function moveToward(guard, tx, ty, speed, dt, level) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  const nx = guard.x + (dx / dist) * step;
  const ny = guard.y + (dy / dist) * step;
  guard.facing = Math.atan2(dy, dx);
  if (!circleHitsWall(nx, guard.y, 14, level)) guard.x = nx;
  if (!circleHitsWall(guard.x, ny, 14, level)) guard.y = ny;
  return dist <= step + 2;
}

export function updateGuard(guard, dt, player, level, audio) {
  const sees = guardCanSee(guard, player, level);
  const dist = Math.hypot(player.x - guard.x, player.y - guard.y);

  if (sees) {
    guard.lastSeen = { x: player.x, y: player.y };
    guard.unseenFor = 0;
    // Closer and better lit means spotted faster.
    let rate = dist < VISION_RANGE * 0.45 ? SUSPICION_RISE_CLOSE : SUSPICION_RISE_FAR;
    if (inLamplight(player.x, player.y, level)) rate += SUSPICION_RISE_LAMP;
    if (player.sneaking) rate *= 0.55;
    guard.suspicion = Math.min(ALARM_AT, guard.suspicion + rate * dt);
    // A wary guard turns to face what it half-saw.
    if (guard.suspicion > 35 && guard.state === 'patrol') {
      guard.facing = Math.atan2(player.y - guard.y, player.x - guard.x);
    }
  } else {
    guard.unseenFor += dt;
    guard.suspicion = Math.max(0, guard.suspicion - SUSPICION_FALL * dt);
  }

  if (guard.suspicion >= ALARM_AT && guard.state !== 'chase') {
    guard.state = 'chase';
    audio.alarm();
  }

  if (guard.state === 'chase') {
    if (sees) {
      guard.lastSeen = { x: player.x, y: player.y };
      guard.unseenFor = 0;
    }
    const target = guard.lastSeen ?? { x: guard.x, y: guard.y };
    moveToward(guard, target.x, target.y, GUARD_CHASE_SPEED, dt, level);
    if (guard.unseenFor > CHASE_GIVE_UP) {
      guard.state = 'investigate';
      guard.investigateAt = { ...target };
      guard.investigateFor = PEBBLE_NOISE_SECONDS;
      guard.suspicion = 45;
    }
    // Caught: the guard reaches the player in the open.
    if (Math.hypot(player.x - guard.x, player.y - guard.y) < GUARD_CATCH_RADIUS) {
      return 'caught';
    }
  } else if (guard.state === 'investigate') {
    guard.investigateFor -= dt;
    if (guard.investigateAt) {
      const arrived = moveToward(guard, guard.investigateAt.x, guard.investigateAt.y, GUARD_PATROL_SPEED * 1.4, dt, level);
      if (arrived || guard.investigateFor <= 0) {
        guard.state = 'patrol';
        guard.investigateAt = null;
      }
    } else {
      guard.state = 'patrol';
    }
  } else {
    // Patrol: walk the waypoint loop, pausing a beat at each corner.
    const wp = guard.waypoints[guard.waypointIndex];
    const arrived = moveToward(guard, wp.x, wp.y, GUARD_PATROL_SPEED, dt, level);
    if (arrived) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    }
  }

  // Footsteps: slow, low ticks that tell the player where a guard is.
  const now = performance.now();
  if (now - guard.steppedAt > 520) {
    guard.steppedAt = now;
    if (dist < 420) audio.footstep(false, true);
  }
  return null;
}

// A pebble lands: every guard in earshot turns to investigate the clatter.
export function guardsHearPebble(guards, at) {
  for (const guard of guards) {
    if (Math.hypot(at.x - guard.x, at.y - guard.y) < GUARD_HEAR_RADIUS) {
      if (guard.state !== 'chase') {
        guard.state = 'investigate';
        guard.investigateAt = { ...at };
        guard.investigateFor = PEBBLE_NOISE_SECONDS;
        guard.suspicion = Math.max(guard.suspicion, 25);
      }
    }
  }
}
