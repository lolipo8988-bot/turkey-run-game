// Shots: deterministic frozen states for the screenshots. The page reads
// ?shot=title|farm|kitchen|escaped|caught and ?seed=1, builds that exact
// moment with the seeded world, and draws one frame — so a screenshot is
// always a real render of the game's own code, never a mock-up.
import { buildStage, Farmer } from './world.js';

export function stateForShot(shot, seed) {
  const stageIndex = shot === 'kitchen' ? 2 : shot === 'farm' ? 0 : 0;
  const world = buildStage(stageIndex, seed);
  const farmer = new Farmer();
  const base = {
    state: 'playing',
    score: 0,
    lives: 3,
    distance: 0,
    alert: 0,
    heat: 0,
    hidden: false,
    best: 1250,
    stage: world.stage,
    stageIndex,
    world,
    farmer,
    camX: 0,
    t: 42,
  };
  if (shot === 'title') {
    return { ...base, state: 'title', score: 0, alert: 0, distance: 0 };
  }
  if (shot === 'farm') {
    farmer.reset(440, world.stage.farmerSpeed);
    farmer.state = 'chasing';
    return {
      ...base,
      score: 740,
      lives: 3,
      distance: 612,
      alert: 58,
      camX: 260,
      turkey: { x: 700, y: 470, stepPhase: 1.2, invuln: 0 },
      farmer,
    };
  }
  if (shot === 'kitchen') {
    farmer.reset(680, world.stage.farmerSpeed);
    farmer.state = 'cornered';
    world.knives.push({ x: 760, y: 180, vx: -3.4, vy: 1.2, spin: 0.9, falling: false });
    world.knives.push({ x: 900, y: 90, vx: 0, vy: 5.2, spin: 0.4, falling: true });
    return {
      ...base,
      score: 1890,
      lives: 2,
      distance: 2140,
      alert: 86,
      heat: 40,
      camX: 420,
      turkey: { x: 860, y: 470, stepPhase: 2.4, invuln: 0 },
      farmer,
    };
  }
  if (shot === 'escaped') {
    return {
      ...base,
      state: 'escaped',
      score: 3420,
      lives: 2,
      distance: 4680,
      alert: 0,
      turkey: { x: 700, y: 470, stepPhase: 0, invuln: 0 },
    };
  }
  // caught
  farmer.reset(640, world.stage.farmerSpeed);
  farmer.state = 'cornered';
  return {
    ...base,
    state: 'caught',
    score: 1130,
    lives: 0,
    distance: 980,
    alert: 100,
    turkey: { x: 700, y: 470, stepPhase: 0, invuln: 0 },
    farmer,
  };
}

// A shot's turkey always starts near the camera so the scene reads.
export function shotTurkeyX(shot) {
  if (shot === 'farm') return 700;
  if (shot === 'kitchen') return 860;
  return 700;
}
