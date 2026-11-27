// World: builds each stage from a seed and runs the farmer, the knives,
// the ovens and the pickups. The turkey itself lives in main.js.
import { GROUND_Y, SCORES, STAGES } from './config.js';
import { mulberry32, pick } from './random.js';

export function buildStage(stageIndex, seed) {
  const stage = STAGES[stageIndex];
  const rng = mulberry32(seed + stageIndex * 7919);
  const world = {
    stageIndex,
    stage,
    width: stage.width,
    haystacks: [],
    fences: [],
    ovens: [],
    pickups: [],
    knives: [],
    doorX: stage.width - 120,
  };
  // Haystacks to hide in, spread so one is always within a dash or two.
  for (let x = 420; x < stage.width - 320; x += 520 + Math.floor(rng() * 260)) {
    world.haystacks.push({ x, y: GROUND_Y, w: 86, h: 74 });
  }
  // Fences to jump: low in the farmyard, taller and closer in the kitchen.
  const gap = stageIndex === 0 ? 640 : stageIndex === 1 ? 540 : 470;
  for (let x = 700; x < stage.width - 300; x += gap + Math.floor(rng() * 200)) {
    world.fences.push({ x, y: GROUND_Y, w: 26, h: 58 + stageIndex * 8 });
  }
  // Ovens only belong in the kitchen: glowing heat zones on the floor.
  if (stageIndex === 2) {
    for (let x = 900; x < stage.width - 500; x += 900 + Math.floor(rng() * 300)) {
      world.ovens.push({ x, y: GROUND_Y, w: 130, h: 96 });
    }
  }
  // Corn everywhere, pie rarely, one golden feather per stage.
  for (let x = 300; x < stage.width - 200; x += 260 + Math.floor(rng() * 160)) {
    const kind = rng() < 0.72 ? 'corn' : rng() < 0.6 ? 'pie' : 'corn';
    world.pickups.push({ x, y: GROUND_Y - 46 - Math.floor(rng() * 60), kind, taken: false });
  }
  const featherX = 900 + Math.floor(rng() * (stage.width - 1600));
  world.pickups.push({ x: featherX, y: GROUND_Y - 120, kind: 'feather', taken: false });
  return world;
}

export class Farmer {
  constructor() {
    this.x = -260;
    this.y = GROUND_Y;
    this.speed = 3.3;
    this.state = 'searching'; // searching | chasing | cornered
    this.throwTimer = 0;
    this.stepPhase = 0;
  }

  reset(startX, speed) {
    this.x = startX;
    this.speed = speed;
    this.state = 'searching';
    this.throwTimer = 2.2;
  }

  // The farmer closes in when the turkey is spotted in the open, dawdles
  // when it hides, and sprints when the alert meter tops out.
  update(dt, turkey, world, alert) {
    const gap = turkey.x - this.x;
    const want = alert > 70 ? this.speed * 1.55 : alert > 35 ? this.speed * 1.15 : this.speed * 0.82;
    this.x += want * dt;
    this.stepPhase += dt * 0.35;
    this.state = alert > 70 ? 'cornered' : alert > 35 ? 'chasing' : 'searching';
    this.throwTimer -= dt / 60;
    if (this.throwTimer <= 0 && gap > 120 && gap < 620 && alert > 30) {
      this.throwTimer = world.stage.throwEverySec;
      return { throwKnife: true, fromX: this.x + 30, fromY: this.y - 96 };
    }
    return { throwKnife: false };
  }
}

export function spawnFallingKnife(world, rng) {
  world.knives.push({
    x: 200 + rng() * (world.width - 400),
    y: -30,
    vx: 0,
    vy: 5.2,
    spin: 0.2,
    falling: true,
  });
}

export function updateKnives(world, dt) {
  for (const k of world.knives) {
    k.x += k.vx * dt;
    k.y += k.vy * dt;
    k.vy += k.falling ? 0.02 : 0.3;
    k.spin += 0.12 * dt;
  }
  world.knives = world.knives.filter((k) => k.y < GROUND_Y + 40 && k.x > -80 && k.x < world.width + 80);
}

export function turkeyHitsKnife(turkey, world) {
  for (const k of world.knives) {
    const dx = Math.abs(k.x - turkey.x);
    const dy = Math.abs(k.y - (turkey.y - 26));
    if (dx < 34 && dy < 34) return true;
  }
  return false;
}

export function collectPickups(turkey, world) {
  let gained = 0;
  for (const p of world.pickups) {
    if (p.taken) continue;
    if (Math.abs(p.x - turkey.x) < 36 && Math.abs(p.y - (turkey.y - 26)) < 44) {
      p.taken = true;
      gained += SCORES[p.kind] || 0;
    }
  }
  return gained;
}

export function nearestHaystack(turkey, world) {
  for (const h of world.haystacks) {
    if (Math.abs(turkey.x - (h.x + h.w / 2)) < 70) return h;
  }
  return null;
}

export function onOven(turkey, world) {
  for (const o of world.ovens) {
    if (turkey.x > o.x - 10 && turkey.x < o.x + o.w + 10 && turkey.y > GROUND_Y - 8) return o;
  }
  return null;
}

export function fenceBlocks(turkey, world) {
  for (const f of world.fences) {
    const overlap = turkey.x + 20 > f.x && turkey.x - 20 < f.x + f.w;
    const low = turkey.y > GROUND_Y - f.h + 6;
    if (overlap && low) return f;
  }
  return null;
}

export function describeStage(stageIndex) {
  return pick(mulberry32(stageIndex + 5), STAGES[stageIndex].name.split(' '));
}
