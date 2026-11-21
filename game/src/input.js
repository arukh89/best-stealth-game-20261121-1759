// Keyboard and mouse input for Pale Lantern.
// WASD / arrows to move, Shift to sneak, mouse click to throw a pebble at
// that spot, M to mute, Enter / Space to start and to continue past screens.

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    // Set once per click (in canvas pixels); the game consumes and clears it.
    click: null,
    // Set once per key press; the game consumes and clears it.
    pressed: null,
  };

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
  };

  window.addEventListener('keydown', (event) => {
    const action = KEYMAP[event.code];
    if (action) {
      keys.add(action);
      event.preventDefault();
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      state.pressed = 'confirm';
      event.preventDefault();
    }
    if (event.code === 'KeyM') state.pressed = 'mute';
    if (event.code === 'KeyR') state.pressed = 'restart';
  });
  window.addEventListener('keyup', (event) => {
    const action = KEYMAP[event.code];
    if (action) keys.delete(action);
  });
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    state.click = { x, y };
  });

  // Unit movement vector from the held keys (0,0 when idle).
  state.moveVector = () => {
    let x = 0;
    let y = 0;
    if (keys.has('left')) x -= 1;
    if (keys.has('right')) x += 1;
    if (keys.has('up')) y -= 1;
    if (keys.has('down')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  };
  state.sneaking = () => keys.has('sneak');
  return state;
}
