'use client';

import { BEATS_PER_CHORD, bellNote, chordNotes, composeScore, midiToHz, subNote } from './compose';

const LOOKAHEAD_MS = 60;
const SCHEDULE_AHEAD = 0.8;
const REVERB_SECONDS = 4;

/* Exponentially decaying noise. A convolver fed with this is the difference
   between "a synth" and "a synth in a very large empty place". */
function impulseResponse(ctx) {
  const frames = Math.floor(ctx.sampleRate * REVERB_SECONDS);
  const buffer = ctx.createBuffer(2, frames, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2.6;
    }
  }

  return buffer;
}

function noiseBuffer(ctx, seconds) {
  const frames = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    // Leaky-integrated white noise: pink enough to read as solar wind rather
    // than as static.
    last = (last + (Math.random() * 2 - 1) * 0.06) * 0.985;
    data[i] = last;
  }
  return buffer;
}

export class SpaceScore {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.dry = null;
    this.wet = null;
    this.padFilter = null;
    this.wind = null;
    this.windFilter = null;
    this.timer = null;
    this.beat = 0;
    this.nextBeatAt = 0;
    this.score = composeScore(Math.floor(Math.random() * 1e9));
    this.volume = 0.35;
    this.tension = 0;
    this.playing = false;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
  }

  /* 0 is an empty field, 1 is the containment field at its tightest. */
  setTension(value) {
    this.tension = Math.min(1, Math.max(0, value));
    if (!this.ctx || !this.padFilter) return;
    const now = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(560 + this.tension * 1700, now, 1.5);
    this.padFilter.Q.setTargetAtTime(0.7 + this.tension * 3.5, now, 1.5);
    if (this.windFilter) this.windFilter.frequency.setTargetAtTime(420 + this.tension * 1800, now, 2);
  }

  reseed(run = 0) {
    this.score = composeScore(Math.floor(Math.random() * 1e9) + run * 7919);
    this.beat = 0;
  }

  // The context can only be created inside a user gesture, so start() owns it.
  async start() {
    if (this.playing) return;

    if (!this.ctx) {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.build();
    }

    await this.ctx.resume();
    this.playing = true;
    this.nextBeatAt = this.ctx.currentTime + 0.15;
    this.timer = window.setInterval(() => this.schedule(), LOOKAHEAD_MS);
  }

  stop() {
    this.playing = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    void this.ctx?.suspend();
  }

  build() {
    const ctx = this.ctx;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.25;
    limiter.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(limiter);

    this.dry = ctx.createGain();
    this.dry.gain.value = 0.8;
    this.dry.connect(this.master);

    const convolver = ctx.createConvolver();
    convolver.buffer = impulseResponse(ctx);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.9;
    this.wet.connect(convolver).connect(this.master);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 560;
    this.padFilter.Q.value = 0.7;
    this.padFilter.connect(this.dry);
    this.padFilter.connect(this.wet);

    // Solar wind: one long noise loop, always running, barely audible.
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 420;
    this.windFilter.Q.value = 0.8;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.2;

    this.wind = ctx.createBufferSource();
    this.wind.buffer = noiseBuffer(ctx, 8);
    this.wind.loop = true;
    this.wind.connect(this.windFilter).connect(windGain);
    windGain.connect(this.dry);
    windGain.connect(this.wet);
    this.wind.start();
  }

  beatDuration() {
    // The clock leans forward a little as the field closes in.
    return 60 / (this.score.bpm + this.tension * 10);
  }

  schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.playing) return;

    while (this.nextBeatAt < ctx.currentTime + SCHEDULE_AHEAD) {
      this.emit(this.beat, this.nextBeatAt);
      this.nextBeatAt += this.beatDuration();
      this.beat += 1;
    }
  }

  emit(beat, at) {
    const step = beat % BEATS_PER_CHORD;
    const chord = Math.floor(beat / BEATS_PER_CHORD);
    const beatLength = this.beatDuration();

    if (step === 0) this.pad(chord, at, beatLength * BEATS_PER_CHORD);

    if (step === 0 || (step === 4 && this.tension > 0.25)) {
      this.sub(subNote(this.score, chord), at);
    }

    const degree = this.score.motif[step];
    if (degree !== null && Math.random() < 0.45 + this.tension * 0.45) {
      this.bell(midiToHz(bellNote(this.score, chord, degree)), at, beatLength * 3);
    }

    // Late in a run a semitone rubs against the root. It is quiet, and it is
    // the reason the last thirty seconds feel different.
    if (this.tension > 0.62 && step === 6) {
      this.bell(midiToHz(chordNotes(this.score, chord)[0] + 13), at, beatLength * 2, 0.09);
    }
  }

  pad(chord, at, duration) {
    const ctx = this.ctx;
    if (!ctx) return;

    chordNotes(this.score, chord).forEach((note, voice) => {
      const frequency = midiToHz(note);
      // Two oscillators a few cents apart per voice: the beating between them
      // is what stops a sustained chord sounding like a test tone.
      [-4, 4].forEach((cents) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = voice === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.value = frequency;
        osc.detune.value = cents;

        const level = (voice === 0 ? 0.3 : 0.12) * (1 - voice * 0.12);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(level, at + duration * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

        osc.connect(gain).connect(this.padFilter);
        osc.start(at);
        osc.stop(at + duration + 0.1);
      });
    });
  }

  bell(frequency, at, duration, level = 0.18) {
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    osc.connect(gain);
    gain.connect(this.dry);
    gain.connect(this.wet);
    osc.start(at);
    osc.stop(at + duration + 0.05);
  }

  sub(note, at) {
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiToHz(note);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.34 + this.tension * 0.12, at + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);

    osc.connect(gain).connect(this.dry);
    osc.start(at);
    osc.stop(at + 1.7);
  }
}
