// Gobble Run — main loop and game state. The turkey escapes the farmyard,
// the barn and the kitchen; the farmer chases, throws carving knives, and
// the oven bites anyone who stands on it.
import { GRAVITY, GROUND_Y, JUMP_VELOCITY, RUN_SPEED, DASH_SPEED, SCORES, STAGES, START_LIVES, VIEW_W } from './config.js';
import { SoundFX } from './audio.js';
import { Input } from './input.js';
import { buildStage, Farmer, collectPickups, fenceBlocks, nearestHaystack, onOven, spawnFallingKnife, turkeyHitsKnife, updateKnives } from './world.js';
import { drawBackground, drawCenterPanel, drawDoor, drawEnd, drawFarmer, drawFence, drawHaystack, drawHud, drawKnife, drawOven, drawPickup, drawTitle, drawTurkey } from './render.js';
import { stateForShot } from './shots.js';
import { hashSeed, mulberry32 } from './random.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7') || 7;
const autoplay = params.get('autoplay') === '1';

class GobbleGame {
  constructor() {
    this.input = new Input(canvas);
    this.sfx = new SoundFX();
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem('gobble-best') || 0) || 0;
    } catch { this.best = 0; }
    this.resetRun();
    this.state = 'title';
    this.t = 0;
    this.fallTimer = 0;
    this.alarmed = false;
    this.input.watch((code) => this.onMenuKey(code));
    document.getElementById('btn-start').addEventListener('click', () => this.start());
    document.getElementById('btn-restart').addEventListener('click', () => this.resetRun());
    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const muted = this.sfx.toggleMute();
      e.target.textContent = muted ? 'Sound: off (M)' : 'Sound: on (M)';
    });
  }

  resetRun() {
    this.stageIndex = 0;
    this.world = buildStage(0, seed);
    this.stage = STAGES[0];
    this.turkey = { x: 80, y: GROUND_Y, vy: 0, onGround: true, stepPhase: 0, invuln: 0, dashTimer: 0, dashCd: 0 };
    this.farmer = new Farmer();
    this.farmer.reset(-420, this.stage.farmerSpeed);
    this.score = 0;
    this.lives = START_LIVES;
    this.distance = 0;
    this.alert = 0;
    this.heat = 0;
    this.hidden = false;
    this.camX = 0;
    this.state = 'title';
    this.alarmed = false;
  }

  start() {
    if (this.state === 'title' || this.state === 'escaped' || this.state === 'caught') this.resetRun();
    this.state = 'playing';
    this.sfx.ensure();
    this.sfx.gobble();
  }

  onMenuKey(code) {
    if (code === 'Enter' && (this.state === 'title' || this.state === 'escaped' || this.state === 'caught')) this.start();
    if (code === 'KeyR') this.resetRun();
    if (code === 'KeyM') {
      const muted = this.sfx.toggleMute();
      document.getElementById('btn-mute').textContent = muted ? 'Sound: off (M)' : 'Sound: on (M)';
    }
    if (code === 'KeyP' && this.state === 'playing') this.state = 'paused';
    else if (code === 'KeyP' && this.state === 'paused') this.state = 'playing';
  }

  loseLife(reason) {
    if (this.turkey.invuln > 0) return;
    this.lives -= 1;
    this.turkey.invuln = 120;
    this.sfx.hurt();
    if (this.lives <= 0) {
      this.state = 'caught';
      this.saveBest();
      return;
    }
    if (reason === 'caught') {
      this.farmer.reset(this.turkey.x - 340, this.stage.farmerSpeed);
      this.alert = 45;
    }
    if (reason === 'oven') {
      this.heat = 0;
      this.turkey.x = Math.max(80, this.turkey.x - 160);
    }
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      try { window.localStorage.setItem('gobble-best', String(this.best)); } catch { /* private mode */ }
    }
  }

  nextStage() {
    this.score += SCORES.stageClear + this.lives * 100;
    this.saveBest();
    if (this.stageIndex >= 2) {
      this.state = 'escaped';
      this.sfx.escaped();
      this.saveBest();
      return;
    }
    this.stageIndex += 1;
    this.stage = STAGES[this.stageIndex];
    this.world = buildStage(this.stageIndex, seed);
    this.turkey.x = 80;
    this.turkey.y = GROUND_Y;
    this.turkey.vy = 0;
    this.farmer.reset(-420, this.stage.farmerSpeed);
    this.alert = 20;
    this.heat = 0;
    this.sfx.gobble();
  }

  autoDrive() {
    // Playtest driver: run right, jump fences and knives, dash on straights.
    const tk = this.turkey;
    this.input.right = true;
    for (const f of this.world.fences) {
      if (f.x - tk.x > 30 && f.x - tk.x < 110 && tk.onGround) this.input.jumpPressed = true;
    }
    for (const k of this.world.knives) {
      if (Math.abs(k.x - tk.x) < 130 && Math.abs(k.y - tk.y) < 90 && tk.onGround) this.input.jumpPressed = true;
    }
    if (tk.onGround && this.t % 240 < 12) this.input.dashPressed = true;
  }

  update() {
    this.t += 1;
    const dt = 1;
    const tk = this.turkey;
    const input = this.input;
    if (autoplay) this.autoDrive();
    if (tk.invuln > 0) tk.invuln -= dt;
    if (tk.dashCd > 0) tk.dashCd -= dt;

    const hay = nearestHaystack(tk, this.world);
    this.hidden = Boolean(hay && input.down && tk.onGround);
    let vx = 0;
    if (!this.hidden) {
      if (input.left) vx -= RUN_SPEED;
      if (input.right) vx += RUN_SPEED;
    }
    if (input.consumeDash() && tk.dashCd <= 0 && !this.hidden) {
      tk.dashTimer = 11;
      tk.dashCd = 55;
    }
    if (tk.dashTimer > 0) {
      tk.dashTimer -= dt;
      vx = (vx >= 0 ? 1 : -1) * DASH_SPEED;
    }
    tk.x += vx * dt;
    tk.x = Math.max(40, Math.min(this.world.width - 40, tk.x));
    const fence = fenceBlocks(tk, this.world);
    if (fence && tk.onGround) tk.x = vx > 0 ? fence.x - 20 : fence.x + fence.w + 20;

    if (input.consumeJump() && tk.onGround && !this.hidden) {
      tk.vy = JUMP_VELOCITY;
      tk.onGround = false;
      this.sfx.jump();
    }
    tk.vy += GRAVITY * dt;
    tk.y += tk.vy * dt;
    if (tk.y >= GROUND_Y) { tk.y = GROUND_Y; tk.vy = 0; tk.onGround = true; }
    if (vx !== 0 && tk.onGround) tk.stepPhase += 0.24 * dt;
    if (vx > 0) this.score += 0.08 * dt;
    this.distance = Math.max(this.distance, (tk.x - 60) / 4);

    // Alert: the farmer spots a turkey in the open, loses one in the hay.
    if (this.hidden) this.alert = Math.max(0, this.alert - 1.1 * dt);
    else if (this.farmer.x > tk.x - 560) this.alert = Math.min(100, this.alert + (this.farmer.x > tk.x - 300 ? 0.5 : 0.28) * dt);
    else this.alert = Math.max(0, this.alert - 0.18 * dt);
    if (this.alert > 70 && !this.alarmed) { this.alarmed = true; this.sfx.alarm(); }
    if (this.alert < 50) this.alarmed = false;

    const thrown = this.farmer.update(dt, tk, this.world, this.alert);
    if (thrown.throwKnife) {
      this.world.knives.push({ x: thrown.fromX, y: thrown.fromY, vx: -4.6, vy: -5.4, spin: 0.35, falling: false });
    }
    this.fallTimer += dt;
    if (this.world.stage.knivesPerSecond > 0 && this.fallTimer > 60 / this.world.stage.knivesPerSecond / 6) {
      this.fallTimer = 0;
      spawnFallingKnife(this.world, mulberry32((seed + this.t) >>> 0));
    }
    updateKnives(this.world, dt);
    if (turkeyHitsKnife(tk, this.world)) this.loseLife('knife');
    if (this.state !== 'playing') return;

    const gained = collectPickups(tk, this.world);
    if (gained > 0) { this.score += gained; this.sfx.pickup(); }

    const oven = onOven(tk, this.world);
    if (oven && tk.onGround) {
      this.heat = Math.min(100, this.heat + 1.4 * dt);
      if (this.heat >= 100) this.loseLife('oven');
    } else {
      this.heat = Math.max(0, this.heat - 0.8 * dt);
    }

    if (this.farmer.x > tk.x - 30) this.loseLife('caught');
    if (tk.x >= this.world.doorX) this.nextStage();
    this.camX = Math.max(0, Math.min(this.world.width - VIEW_W, tk.x - 320));
  }

  render() {
    const g = this;
    drawBackground(ctx, g.camX, g.stage);
    const inView = (x) => x - g.camX > -160 && x - g.camX < VIEW_W + 160;
    for (const h of g.world.haystacks) if (inView(h.x)) drawHaystack(ctx, h, g.camX);
    for (const f of g.world.fences) if (inView(f.x)) drawFence(ctx, f, g.camX);
    for (const o of g.world.ovens) if (inView(o.x)) drawOven(ctx, o, g.camX, g.t);
    for (const p of g.world.pickups) if (!p.taken && inView(p.x)) drawPickup(ctx, p, g.camX, g.t);
    drawDoor(ctx, g.world.doorX, g.camX, g.stageIndex === 2 ? 'FREEDOM!' : 'NEXT →');
    for (const k of g.world.knives) drawKnife(ctx, k, g.camX);
    if (g.state !== 'title') drawFarmer(ctx, g.farmer, g.camX);
    drawTurkey(ctx, g.turkey, g.camX, g.hidden);
    if (g.state === 'playing' || g.state === 'paused') drawHud(ctx, g);
    if (g.state === 'title') drawTitle(ctx, g.best);
    if (g.state === 'paused') drawCenterPanel(ctx, 'PAUSED', ['Take a breath. The farmer is still out there.', '', 'Press P to keep running.'], '#ffe9c4');
    if (g.state === 'escaped' || g.state === 'caught') drawEnd(ctx, g);
  }
}

// Screenshot mode: one frozen frame, no loop, so headless captures match.
const shot = params.get('shot');
if (shot) {
  const snap = stateForShot(shot, seed);
  const frozen = new GobbleGame();
  Object.assign(frozen, snap);
  frozen.turkey = snap.turkey || { x: 300, y: GROUND_Y, stepPhase: 0, invuln: 0 };
  frozen.camX = snap.camX || 0;
  frozen.render();
  window.__gobble = frozen;
  document.title = `Gobble Run — ${shot}`;
} else {
  const game = new GobbleGame();
  if (autoplay) game.start();
  window.__gobble = game;
  const loop = () => {
    if (game.state === 'playing') game.update();
    else game.t += 1;
    game.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
