import { Simulation } from './simulation.js';
import { parseRecording, MAX_TICKS } from './recording.js';
import { parseSumo, sumoResult } from '../modes/sumo.js';

export class Session {
  constructor(world) { this.load(world); }
  load(world) {
    const sim = new Simulation(world);
    const input = typeof world === 'string' ? JSON.parse(world) : world;
    const scenario = parseSumo(input.scenario, sim.world);
    this.sim = sim; this.scenario = scenario; this.running = false; this.replay = null; this.cursor = 0; this.recording = null; this.lastRecording = null; this.notice = ''; this.selected = sim.robots[0].id;
  }
  get world() { return this.replay ? this.replay.world : { ...this.sim.world, ...(this.scenario ? { scenario:this.scenario } : {}) }; }
  get state() { return this.replay ? structuredClone(this.replay.frames[this.cursor]) : this.sim.snapshot(); }
  get result() { return sumoResult(this.replay ? this.replay.scenario : this.scenario, this.state); }
  play() { if (!this.replay && this.result?.finished) return; this.running = true; }
  pause() { this.running = false; }
  step() {
    if (this.replay) {
      this.cursor = Math.min(this.cursor + 1, this.replay.frames.length - 1);
      if (this.cursor === this.replay.frames.length - 1) this.pause();
    } else {
      if (this.result?.finished) { this.pause(); return this.state; }
      try { this.sim.step(); } catch (e) { this.pause(); throw e; }
      if (this.recording) {
        this.recording.frames.push(this.sim.snapshot());
        if (this.recording.frames.length === MAX_TICKS + 1) { this.lastRecording = this.recording; this.recording = null; this.notice = 'Limite de 5.000 ticks: gravação finalizada.'; }
      }
      if (this.result?.finished) { this.pause(); this.notice = this.result.reason; }
    }
    return this.state;
  }
  reset() { this.pause(); if (this.replay) this.cursor = 0; else this.sim.reset(); this.recording = null; }
  startRecording() {
    if (this.replay) throw new Error('Encerre o replay antes de gravar');
    this.reset(); this.lastRecording = null;
    this.recording = { version:1, world:structuredClone(this.world), frames:[this.sim.snapshot()] };
  }
  stopRecording() { if (this.recording) { this.lastRecording = this.recording; this.recording = null; } return structuredClone(this.lastRecording ?? null); }
  importReplay(input) {
    const replay = parseRecording(input);
    const raw = typeof input === 'string' ? JSON.parse(input) : input;
    replay.scenario = parseSumo(raw.world.scenario, replay.world);
    if (replay.scenario) replay.world.scenario = replay.scenario;
    this.pause(); this.recording = null; this.replay = replay; this.cursor = 0; this.selected = replay.world.robots[0].id;
  }
  exitReplay() { this.replay = null; this.reset(); this.selected = this.sim.world.robots[0].id; }
  seek(value) {
    if (!this.replay || !Number.isInteger(value) || value < 0 || value >= this.replay.frames.length) throw new Error('Replay: tick fora da gravação');
    this.pause(); this.cursor = value;
  }
  applyController(source) {
    if (this.replay) throw new Error('Encerre o replay para editar controlador');
    if (this.recording) throw new Error('Finalize a gravação antes de editar controlador');
    this.sim.setController(this.selected, source); this.pause();
  }
}
