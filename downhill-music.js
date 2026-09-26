/*
 * DownhillMusic – dynamische Abfahrtsmusik, reine Web Audio API, keine Abhängigkeiten.
 *
 *   const music = new DownhillMusic();
 *   await music.start();          // nach einer User-Geste aufrufen
 *   music.setIntensity(0.4);      // 0..1, darf jeden Frame gesetzt werden
 *   music.overtake();             // Stinger: Überholmanöver
 *   music.fall();                 // Stinger: Sturz, Musik bricht kurz weg
 *   music.finish();               // Zieleinfahrt, Schlussakkord auf nächstem Beat
 *   music.on('bar',  info => ...) // Taktinfo (Akkord, Würfel, BPM, Layer)
 *   music.on('step', s => ...)    // 16tel-Position, zeitgenau
 *
 * Aufbau:
 *   - Mozart-Prinzip: 8-taktige Phrase, pro Taktposition mehrere harmonisch
 *     gleichwertige Akkordvarianten, zwei Würfel wählen aus.
 *   - Vertical Layering: 7 Spuren blenden abhängig von der Intensität ein.
 *   - Tempo 104–144 BPM, Rhythmusdichte und Filteröffnung folgen der Intensität.
 *   - Finale: ab Intensität 0.85 Rückung um einen Ganzton an der Phrasengrenze.
 *   - Lookahead-Scheduler auf AudioContext.currentTime.
 */
class DownhillMusic {
  static LAYERS = [
    { id: 'pad',   name: 'Flächen',  th: 0.00, level: 0.9,  send: 0.55 },
    { id: 'bass',  name: 'Bass',     th: 0.12, level: 0.55, send: 0 },
    { id: 'hats',  name: 'Hi-Hats',  th: 0.25, level: 0.5,  send: 0.05 },
    { id: 'kick',  name: 'Kick',     th: 0.36, level: 0.9,  send: 0 },
    { id: 'arp',   name: 'Arpeggio', th: 0.50, level: 0.45, send: 0.35 },
    { id: 'snare', name: 'Snare',    th: 0.60, level: 0.6,  send: 0.15 },
    { id: 'lead',  name: 'Melodie',  th: 0.75, level: 0.5,  send: 0.3 },
  ];

  // Akkorde relativ zum Grundton (a-Moll): root = Stufe in Halbtönen, t = Intervalle
  static CHORDS = {
    i:   { root: 0,  t: [0, 3, 7] },
    III: { root: 3,  t: [0, 4, 7] },
    iv:  { root: 5,  t: [0, 3, 7] },
    V:   { root: 7,  t: [0, 4, 7] },
    VI:  { root: 8,  t: [0, 4, 7] },
    VII: { root: 10, t: [0, 4, 7] },
  };

  // Würfeltabelle: je Taktposition der Phrase austauschbare Varianten
  static PHRASE = [
    ['i', 'i', 'VI'],
    ['VI', 'iv', 'III'],
    ['III', 'VII', 'iv'],
    ['VII', 'V', 'VII'],
    ['i', 'VI', 'iv'],
    ['iv', 'VI', 'III'],
    ['VI', 'iv', 'VII'],
    ['V', 'VII', 'V'],
  ];

  static NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B', 'H'];

  constructor(opts = {}) {
    this.ctx = opts.context || null;
    this.intensity = 0;
    this.boost = 0;
    this.running = false;
    this.listeners = {};
  }

  // ---------- öffentliche API ----------
  on(ev, fn) { (this.listeners[ev] ||= []).push(fn); return this; }

  setIntensity(x) {
    this.intensity = Math.min(1, Math.max(0, x));
    if (this.wind && this.running) {
      const t = this.ctx.currentTime;
      this.wind.gain.gain.setTargetAtTime(0.05 + 0.16 * this.intensity, t, 0.3);
      this.wind.filter.Q.setTargetAtTime(0.8 + 2 * this.intensity, t, 0.3);
    }
  }

  async start() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!this.master) this._init();
    await this.ctx.resume();
    if (this.running) return;
    this.running = true;
    this.finishPending = false;
    this.bar = -1;
    this.step = 0;
    this.stepDur = 60 / 104 / 4;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.transpose = 0;
    this.lastPitch = 76;
    this.duckBars = 0;
    this.boost = 0;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.05);
    this.setIntensity(this.intensity);
    this.timer = setInterval(() => this._tick(), 25);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.timer);
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0, t, 0.25);
    for (const L of Object.values(this.layers)) { L.on = false; L.node.gain.setTargetAtTime(0, t, 0.25); }
    this.wind.gain.gain.setTargetAtTime(0, t, 0.4);
    this._emit('stop', null, t);
  }

  overtake() {
    if (!this.running || !this.chord) return;
    const t = this._nextGrid(2);
    const k = this._keyRoot();
    const tones = this._chordTones(this.chord);
    const seq = [0, 1, 2, 3, 4, 5].map(i => k + 12 + tones[i % 3] + 12 * Math.floor(i / 3));
    seq.forEach((m, i) => this._tone(this.master, {
      type: 'square', freq: this._f(m), t: t + i * this.stepDur / 2,
      dur: this.stepDur * 0.6, vol: 0.07, r: 0.08, cutoff: 3500,
    }));
    this._noise(this.master, { t, dur: 0.55, vol: 0.12, type: 'bandpass', f0: 400, f1: 6000, q: 1.5 });
    this.boost = Math.min(0.2, this.boost + 0.12);
    this._emit('stinger', 'overtake', t);
  }

  fall() {
    if (!this.running) return;
    const t = this.ctx.currentTime + 0.01;
    for (const L of Object.values(this.layers)) {
      if (L.id !== 'pad') { L.node.gain.setTargetAtTime(0, t, 0.04); L.on = false; }
    }
    this.duckBars = 1;
    this.boost = 0;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.7);
    f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.7);
    g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    o.connect(f); f.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.85);
    this._noise(this.master, { t, dur: 0.5, vol: 0.3, type: 'lowpass', f0: 900, f1: 120 });
    this._emit('stinger', 'fall', t);
  }

  finish() {
    if (this.running) this.finishPending = true;
  }

  // ---------- Setup ----------
  _init() {
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    this.master.connect(comp); comp.connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(2.6, 2.4);
    const rg = ctx.createGain(); rg.gain.value = 0.4;
    this.reverb.connect(rg); rg.connect(this.master);

    this.noiseBuf = this._noiseBuffer(2);

    this.layers = {};
    for (const L of DownhillMusic.LAYERS) {
      const node = ctx.createGain(); node.gain.value = 0; node.connect(this.master);
      if (L.send) { const s = ctx.createGain(); s.gain.value = L.send; node.connect(s); s.connect(this.reverb); }
      this.layers[L.id] = { ...L, node, on: false };
    }

    // Fahrtwind: gefiltertes Rauschen mit langsamem LFO
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 700; filter.Q.value = 0.8;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    lfo.frequency.value = 0.13; lfoG.gain.value = 350;
    lfo.connect(lfoG); lfoG.connect(filter.frequency);
    src.connect(filter); filter.connect(gain); gain.connect(this.master);
    src.start(); lfo.start();
    this.wind = { filter, gain };
  }

  _impulse(sec, decay) {
    const rate = this.ctx.sampleRate, len = Math.floor(rate * sec);
    const b = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  _noiseBuffer(sec) {
    const rate = this.ctx.sampleRate, len = Math.floor(rate * sec);
    const b = this.ctx.createBuffer(1, len, rate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // ---------- Scheduler ----------
  _tick() {
    const horizon = this.ctx.currentTime + 0.12;
    while (this.running && this.nextTime < horizon) {
      if (this.finishPending && this.step % 4 === 0) { this._finale(this.nextTime); return; }
      if (this.step === 0) this._newBar(this.nextTime);
      this._scheduleStep(this.step, this.nextTime);
      this._emit('step', { step: this.step, bar: this.bar }, this.nextTime);
      this.nextTime += this.stepDur;
      this.step = (this.step + 1) % 16;
    }
  }

  _nextGrid(every) {
    let t = this.nextTime, s = this.step;
    while (s % every !== 0) { t += this.stepDur; s++; }
    return t;
  }

  _newBar(t) {
    this.bar++;
    const I = this.I = Math.min(1, this.intensity + this.boost);
    this.boost *= 0.5;
    const pos = this.pos = this.bar % 8;

    if (pos === 0) {
      this.transpose = I > 0.85 ? 2 : 0;          // Rückung im Finale
      this.rhythm = this._euclid(Math.round(3 + 6 * I), 16);
    }
    this.bpm = Math.round(104 + 40 * I);
    this.stepDur = 60 / this.bpm / 4;

    const opts = DownhillMusic.PHRASE[pos];
    const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
    this.dice = [d1, d2];
    this.chordKey = opts[(d1 + d2) % opts.length];
    this.chord = DownhillMusic.CHORDS[this.chordKey];

    const duck = this.duckBars > 0;
    if (duck) this.duckBars--;
    const states = {};
    for (const L of Object.values(this.layers)) {
      const on = I >= L.th && (!duck || L.id === 'pad');
      const amt = on ? L.level * (0.6 + 0.4 * Math.min(1, (I - L.th) / 0.2)) : 0;
      L.node.gain.setTargetAtTime(amt, t, on ? 0.12 : 0.35);
      L.on = on; states[L.id] = on;
    }

    this.melody = this._makeMelody();
    this._pad(t, this.stepDur * 16, I);
    if (pos === 0 && I > 0.6 && !duck) this._cymbal(t, 0.35);

    this._emit('bar', {
      bar: this.bar, pos, bpm: this.bpm, dice: this.dice,
      degree: this.chordKey, chord: this._chordName(this.chord),
      layers: states, transpose: this.transpose, intensity: I,
    }, t);
  }

  _scheduleStep(s, t) {
    const I = this.I, sd = this.stepDur, L = this.layers, k = this._keyRoot();
    const ch = this.chord, tones = this._chordTones(ch);

    // Bass
    if (L.bass.on) {
      const root = k - 24 + ch.root;
      let hit = false, m = root, dur = sd * 1.8;
      if (I < 0.35) { hit = s === 0 || s === 8; dur = sd * 7; }
      else if (I < 0.6) { hit = s % 2 === 0; if (s === 6 || s === 14) m = root + 12; }
      else { hit = true; dur = sd * 0.9; if (s % 4 === 3) m = root + 12; }
      if (hit) this._tone(L.bass.node, {
        type: 'sawtooth', freq: this._f(m), t, dur, vol: s % 4 === 0 ? 0.5 : 0.38,
        r: 0.06, cutoff: 280 + 700 * I, fEnv: 3, q: 4,
      });
    }

    // Kick
    if (L.kick.on) {
      const hit = I < 0.6 ? (s === 0 || s === 8 || (I > 0.45 && s === 10))
                          : (s % 4 === 0 || (I > 0.85 && s === 14));
      if (hit) this._kick(L.kick.node, t);
    }

    // Snare mit Fill im letzten Phrasentakt
    if (L.snare.on) {
      if (s === 4 || s === 12) this._snare(L.snare.node, t, 0.8);
      else if (this.pos === 7 && I > 0.55 && s > 12) this._snare(L.snare.node, t, 0.35 + 0.15 * (s - 12));
      else if (I > 0.8 && s === 15) this._snare(L.snare.node, t, 0.2);
    }

    // Hi-Hats
    if (L.hats.on) {
      const hit = I < 0.5 ? s % 4 === 2 : I < 0.75 ? s % 2 === 0 : true;
      if (hit) this._hat(L.hats.node, t, s % 4 === 2 ? 0.5 : 0.3, I > 0.75 && s === 14);
    }

    // Arpeggio
    if (L.arp.on && (I >= 0.65 || s % 2 === 0)) {
      const seq = [0, 1, 2, 3, 4, 5, 4, 3];
      const i = seq[(I >= 0.65 ? s : s / 2) % 8];
      const m = k + 12 + tones[i % 3] + 12 * Math.floor(i / 3);
      this._tone(L.arp.node, {
        type: 'square', freq: this._f(m), t, dur: sd * 0.7, vol: 0.14,
        r: 0.05, cutoff: 1200 + 3000 * I, fEnv: 2,
      });
    }

    // Melodie
    const n = this.melody[s];
    if (L.lead.on && n) {
      this._tone(L.lead.node, {
        type: 'triangle', freq: this._f(n.m), t, dur: sd * n.len * 0.92, vol: 0.34, a: 0.01, r: 0.12,
      });
      this._tone(L.lead.node, {
        type: 'sawtooth', freq: this._f(n.m), t, dur: sd * n.len * 0.92, vol: 0.06, a: 0.02, r: 0.12,
        cutoff: 2200, detune: 7,
      });
    }
  }

  _finale(t) {
    this.running = false;
    clearInterval(this.timer);
    const k = this.ctx && this._keyRoot();
    for (const L of Object.values(this.layers)) {
      L.on = L.id === 'pad' || L.id === 'lead' || L.id === 'bass';
      L.node.gain.cancelScheduledValues(t);
      L.node.gain.setTargetAtTime(L.on ? L.level : 0, t, 0.02);
    }
    const tonic = DownhillMusic.CHORDS.i;
    this.chord = tonic;
    this._pad(t, 3.5, 1);
    [0, 7, 12, 15, 19].forEach(iv => this._tone(this.layers.lead.node, {
      type: 'sawtooth', freq: this._f(k + 12 + iv), t, dur: 3.2, vol: 0.07, a: 0.03, r: 1.2, cutoff: 3000,
    }));
    this._tone(this.layers.bass.node, { type: 'sawtooth', freq: this._f(k - 24), t, dur: 3, vol: 0.5, r: 1, cutoff: 600 });
    this._kick(this.master, t);
    this._cymbal(t, 0.5);
    this.master.gain.setTargetAtTime(0, t + 3.2, 0.6);
    this.wind.gain.gain.setTargetAtTime(0, t + 2, 0.8);
    this._emit('finish', { chord: this._chordName(tonic) }, t);
  }

  // ---------- Komposition ----------
  _keyRoot() { return 57 + (this.transpose || 0); }            // A3 + Rückung

  _chordTones(ch) { return ch.t.map(x => ch.root + x); }

  _chordName(ch) {
    const pc = (9 + ch.root + (this.transpose || 0)) % 12;
    return DownhillMusic.NOTE_NAMES[pc] + (ch.t[1] === 3 ? 'm' : '');
  }

  _euclid(k, n) {
    const r = []; let b = n - k;
    for (let i = 0; i < n; i++) { b += k; if (b >= n) { b -= n; r.push(1); } else r.push(0); }
    return r;
  }

  _makeMelody() {
    const k = this._keyRoot(), ch = this.chord;
    const scale = this.chordKey === 'V' ? [0, 2, 3, 5, 7, 8, 11] : [0, 2, 3, 5, 7, 8, 10];
    const pcs = new Set(this._chordTones(ch).map(x => ((x % 12) + 12) % 12));
    const notes = [];
    for (let m = 64; m <= 88; m++) if (scale.includes(((m - k) % 12 + 12) % 12)) notes.push(m);
    const isChord = m => pcs.has(((m - k) % 12 + 12) % 12);

    const out = new Array(16).fill(null);
    const hits = [];
    this.rhythm.forEach((h, i) => h && hits.push(i));
    let idx = notes.reduce((best, m, i) => Math.abs(m - this.lastPitch) < Math.abs(notes[best] - this.lastPitch) ? i : best, 0);

    hits.forEach((s, h) => {
      if (s % 4 === 0) {
        // schwere Zählzeit: nächstgelegener Akkordton
        const cands = notes.map((m, i) => ({ m, i })).filter(o => isChord(o.m))
          .sort((a, b) => Math.abs(a.i - idx) - Math.abs(b.i - idx));
        idx = cands[Math.random() < 0.7 ? 0 : Math.min(1, cands.length - 1)].i;
      } else {
        const center = notes.length / 2;
        let dir = Math.random() < 0.5 ? -1 : 1;
        if (Math.abs(idx - center) > 5) dir = idx > center ? -1 : 1;
        idx += dir * (Math.random() < 0.75 ? 1 : 2);
        idx = Math.max(0, Math.min(notes.length - 1, idx));
      }
      const next = h + 1 < hits.length ? hits[h + 1] : 16;
      out[s] = { m: notes[idx], len: Math.min(4, next - s) };
    });
    if (hits.length) this.lastPitch = notes[idx];
    return out;
  }

  // ---------- Klangerzeugung ----------
  _f(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  _tone(dest, { type = 'square', freq, t, dur, vol = 0.3, a = 0.005, r = 0.08, cutoff = null, fEnv = null, q = 1, detune = 0 }) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    let last = o;
    if (cutoff) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = q;
      if (fEnv) { f.frequency.setValueAtTime(cutoff * fEnv, t); f.frequency.exponentialRampToValueAtTime(cutoff, t + Math.max(0.05, dur)); }
      else f.frequency.value = cutoff;
      o.connect(f); last = f;
    }
    const hold = Math.max(t + a, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, hold);
    g.gain.setTargetAtTime(0, hold, r / 3);
    last.connect(g); g.connect(dest);
    o.start(t); o.stop(hold + r * 2 + 0.05);
  }

  _noise(dest, { t, dur, vol, type = 'highpass', f0 = 5000, f1 = null, q = 0.7 }) {
    const ctx = this.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noiseBuf;
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.02);
  }

  _pad(t, dur, I) {
    const k = this._keyRoot(), tones = this._chordTones(this.chord);
    const voiced = tones.map(x => { let m = k - 12 + x; while (m < 52) m += 12; while (m > 64) m -= 12; return m; });
    voiced.push(voiced[0] + 12);
    for (const m of voiced) for (const dt of [-8, 8]) {
      this._tone(this.layers.pad.node, {
        type: 'sawtooth', freq: this._f(m), t, dur, vol: 0.045, a: 0.35, r: 0.6,
        cutoff: 450 + 2200 * I, detune: dt,
      });
    }
  }

  _kick(dest, t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + 0.4);
  }

  _snare(dest, t, vel) {
    this._noise(dest, { t, dur: 0.18, vol: 0.5 * vel, type: 'highpass', f0: 1400 });
    this._tone(dest, { type: 'triangle', freq: 190, t, dur: 0.02, vol: 0.4 * vel, r: 0.08 });
  }

  _hat(dest, t, vol, open) {
    this._noise(dest, { t, dur: open ? 0.16 : 0.045, vol, type: 'highpass', f0: 7500 });
  }

  _cymbal(t, vol) {
    this._noise(this.master, { t, dur: 1.6, vol, type: 'highpass', f0: 4500 });
  }

  _emit(ev, data, time) {
    const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
    setTimeout(() => (this.listeners[ev] || []).forEach(fn => fn(data)), delay);
  }
}

if (typeof module !== 'undefined') module.exports = DownhillMusic;
