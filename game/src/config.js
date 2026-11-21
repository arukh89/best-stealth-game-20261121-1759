// Shared constants for Pale Lantern — The Herbarium Heist.
// One place for every number the other files tune against, so a balance change
// never means hunting through render code.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 64;

// Player movement (pixels per second).
export const WALK_SPEED = 170;
export const SNEAK_SPEED = 95;

// Vision: a guard sees the player inside this range and half-angle, with a
// clear line of sight, unless the player is hidden inside fern cover.
export const VISION_RANGE = 230;
export const VISION_HALF_ANGLE = 0.61; // ~35 degrees
export const LAMPLIGHT_RANGE = 150;

// Suspicion: 0 calm, 100 full alarm. Rises while seen, falls while unseen,
// so a near miss is recoverable instead of instant failure.
export const SUSPICION_RISE_CLOSE = 95; // per second, player near the guard
export const SUSPICION_RISE_FAR = 45; // per second, player at cone edge
export const SUSPICION_RISE_LAMP = 30; // extra per second while in lamplight
export const SUSPICION_FALL = 22; // per second while unseen
export const ALARM_AT = 100;
export const CHASE_GIVE_UP = 3.5; // seconds without sight before giving up

// Guards.
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 148;
export const GUARD_CATCH_RADIUS = 26;
export const GUARD_HEAR_RADIUS = 260; // pebble noise reaches this far

// Pebbles: the player's one gadget. Click to throw; the clatter draws every
// guard in earshot to the landing spot for a few seconds.
export const PEBBLES_PER_LEVEL = 5;
export const PEBBLE_NOISE_SECONDS = 4.5;

// Palette: a night herbarium. Dark teal floor, warm lamplight, pale player
// lantern, amber cones that redden as suspicion rises, green exit door.
export const COLORS = {
  floorA: '#122019',
  floorB: '#0e1a14',
  wall: '#3f6b4e',
  wallTop: '#7fb892',
  fern: '#1d4a2e',
  fernDark: '#143722',
  lampGlow: 'rgba(255, 190, 90, 0.20)',
  lampCore: '#ffcf7d',
  coneCalm: 'rgba(255, 214, 110, 0.30)',
  coneWary: 'rgba(255, 160, 60, 0.42)',
  coneAlarm: 'rgba(255, 70, 50, 0.50)',
  guard: '#d8b25a',
  guardDark: '#8a6d2f',
  player: '#f2ead8',
  playerCloak: '#7d8aa8',
  seal: '#ffd76a',
  exit: '#58e08a',
  exitDark: '#1e7a44',
  text: '#efe8d2',
  textDim: '#9db3a4',
  danger: '#ff5a45',
};
