// Gobble Run tuning: every number the game balances on lives here.
export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 470;
export const GRAVITY = 0.62;
export const RUN_SPEED = 4.3;
export const DASH_SPEED = 9.2;
export const JUMP_VELOCITY = -13.2;

export const STAGES = [
  {
    name: 'Farmyard',
    sub: 'Stage 1 — slip past the fence',
    width: 3200,
    knivesPerSecond: 0.0,
    throwEverySec: 3.4,
    farmerSpeed: 3.35,
    palette: { sky: '#f7c873', far: '#d99a4e', ground: '#8a5a2b', grass: '#7fae4c' },
  },
  {
    name: 'The Barn',
    sub: 'Stage 2 — the farmer is on to you',
    width: 4000,
    knivesPerSecond: 0.12,
    throwEverySec: 2.5,
    farmerSpeed: 3.6,
    palette: { sky: '#e8a34c', far: '#a06a35', ground: '#6e4a24', grass: '#c9a24a' },
  },
  {
    name: 'The Kitchen',
    sub: 'Stage 3 — past the oven to the open door',
    width: 4800,
    knivesPerSecond: 0.22,
    throwEverySec: 1.9,
    farmerSpeed: 3.85,
    palette: { sky: '#d97b4f', far: '#7d4030', ground: '#5d3a28', grass: '#8c5a3c' },
  },
];

export const SCORES = { corn: 50, pie: 100, feather: 200, stageClear: 500 };
export const START_LIVES = 3;
export const MAX_ALERT = 100;
