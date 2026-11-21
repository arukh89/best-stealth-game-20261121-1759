// Synthesised sound for Pale Lantern — WebAudio only, no audio files.
// Footsteps that tell you where a guard is, a rustle for fern cover, a chime
// for a seal, a rising sting when the alarm trips, a soft arpeggio on escape.

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;
  let lastStepAt = 0;
  let lastRustleAt = 0;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, filterFreq, when = 0) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  }

  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() { return muted; },
    // Soft alternating footstep ticks; guards' steps are lower and slower.
    footstep(sneaking, guard = false) {
      const now = performance.now();
      if (now - lastStepAt < (guard ? 340 : sneaking ? 300 : 210)) return;
      lastStepAt = now;
      if (guard) tone(90, 0.09, 'sine', 0.10);
      else if (sneaking) noise(0.05, 0.05, 900);
      else noise(0.07, 0.11, 1400);
    },
    rustle() {
      const now = performance.now();
      if (now - lastRustleAt < 450) return;
      lastRustleAt = now;
      noise(0.18, 0.10, 2400);
    },
    pebble() { tone(1400, 0.05, 'square', 0.06); tone(900, 0.08, 'square', 0.05, 0.09); },
    pickup() { tone(660, 0.12, 'sine', 0.12); tone(990, 0.18, 'sine', 0.12, 0.08); },
    alarm() {
      tone(220, 0.5, 'sawtooth', 0.10, 0, 440);
      tone(220, 0.5, 'sawtooth', 0.08, 0.15, 440);
    },
    caught() { tone(180, 0.7, 'sawtooth', 0.12, 0, 70); },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 'sine', 0.11, i * 0.11));
    },
    levelClear() { [392, 523, 659].forEach((f, i) => tone(f, 0.25, 'sine', 0.10, i * 0.09)); },
  };
}
