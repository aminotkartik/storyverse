// @ts-nocheck
// Tiny synthesized sound engine — no audio files, everything is Web Audio.
// Layers: brown-noise city bed, honks, signal ticks, heartbeat, page turns.
// Nothing plays until enable() is called from a user gesture.
// (Kept untyped from the donor; every method is guarded by ok()/started.)

let ctx = null;
let master = null;
let cityGain = null;
let started = false;
let enabled = false;

function ensure() {
  if (started || typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  // Brown-ish noise loop = distant traffic / city bed
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.4;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 460;
  cityGain = ctx.createGain();
  cityGain.gain.value = 0;
  src.connect(lp); lp.connect(cityGain); cityGain.connect(master);
  src.start();
  started = true;
}

function ok() {
  return enabled && started && ctx && ctx.state !== "closed";
}

function env(g, t, a, peak, d) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

export const sound = {
  get enabled() { return enabled; },

  enable() {
    enabled = true;
    ensure();
    if (ctx && ctx.state === "suspended") ctx.resume();
  },
  disable() {
    enabled = false;
    if (cityGain && ctx) cityGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  },

  // 0..1 — how loud the city is under everything
  city(level) {
    if (!started || !ctx) return;
    const v = enabled ? Math.min(1, Math.max(0, level)) * 0.14 : 0;
    cityGain.gain.cancelScheduledValues(ctx.currentTime);
    cityGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.5);
  },

  honk(power = 1) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1250; bp.Q.value = 1.1;
    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 523;
    const o2 = ctx.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = 659;
    o2.detune.value = 8;
    env(g, t, 0.012, 0.085 * power, 0.32 * Math.min(power, 1.4));
    o1.connect(bp); o2.connect(bp); bp.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t + 0.6); o2.stop(t + 0.6);
  },

  tick(high = false) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = "square"; o.frequency.value = high ? 1318 : 988;
    env(g, t, 0.004, 0.05, 0.07);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.1);
  },

  chirp() {
    if (!ok()) return;
    this.tick(false);
    setTimeout(() => this.tick(true), 110);
  },

  heartbeat() {
    if (!ok()) return;
    const t = ctx.currentTime;
    [0, 0.16].forEach((off, i) => {
      const g = ctx.createGain();
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(58, t + off);
      o.frequency.exponentialRampToValueAtTime(34, t + off + 0.12);
      env(g, t + off, 0.008, i === 0 ? 0.34 : 0.2, 0.12);
      o.connect(g); g.connect(master);
      o.start(t + off); o.stop(t + off + 0.18);
    });
  },

  thud() {
    if (!ok()) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = "sine"; o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
    env(g, t, 0.01, 0.4, 0.55);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.7);
  },

  page() {
    if (!ok()) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const g = ctx.createGain(); g.gain.value = 0.1;
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(t);
  },
};
