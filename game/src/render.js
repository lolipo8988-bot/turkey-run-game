// Render: every pixel of Gobble Run is drawn here — turkey, farmer, farm,
// kitchen, HUD and the title / end screens. No images, no fonts to fetch.
import { GROUND_Y, VIEW_W, VIEW_H } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawBackground(ctx, camX, stage) {
  const p = stage.palette;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, p.sky);
  sky.addColorStop(0.62, '#f2b25c');
  sky.addColorStop(1, p.far);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Sun and lazy clouds.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(820 - camX * 0.04, 74, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,0.85)';
  for (const cx of [150, 430, 700]) {
    const x = ((cx - camX * 0.12) % 1100 + 1100) % 1100 - 80;
    ctx.beginPath();
    ctx.ellipse(x, 92, 52, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 34, 100, 38, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Far hills, barn roofline and fence posts scrolling slower than the ground.
  ctx.fillStyle = p.far;
  ctx.beginPath();
  ctx.moveTo(0, 400);
  for (let x = 0; x <= VIEW_W; x += 60) {
    ctx.lineTo(x, 392 - Math.sin((x + camX * 0.3) / 90) * 22);
  }
  ctx.lineTo(VIEW_W, VIEW_H); ctx.lineTo(0, VIEW_H); ctx.closePath(); ctx.fill();
  // Ground.
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = p.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  for (let x = -((camX % 48) + 48) % 48; x < VIEW_W; x += 48) {
    ctx.moveTo(x, GROUND_Y + 22); ctx.lineTo(x + 18, GROUND_Y + 58);
  }
  ctx.stroke();
}

export function drawHaystack(ctx, h, camX) {
  const x = h.x - camX;
  ctx.fillStyle = '#d9a83c';
  ctx.beginPath();
  ctx.moveTo(x, h.y);
  ctx.quadraticCurveTo(x + h.w / 2, h.y - h.h - 18, x + h.w, h.y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#a87c1e';
  ctx.beginPath();
  ctx.moveTo(x + 14, h.y - 8); ctx.lineTo(x + 30, h.y - 52);
  ctx.moveTo(x + 44, h.y - 6); ctx.lineTo(x + 52, h.y - 58);
  ctx.moveTo(x + 70, h.y - 10); ctx.lineTo(x + 62, h.y - 46);
  ctx.stroke();
}

export function drawOven(ctx, o, camX, t) {
  const x = o.x - camX;
  ctx.fillStyle = '#3d3d46';
  roundRect(ctx, x, o.y - o.h, o.w, o.h, 8); ctx.fill();
  const glow = 0.55 + Math.sin(t / 9) * 0.25;
  ctx.fillStyle = `rgba(255,${Math.floor(120 + glow * 80)},20,${glow})`;
  roundRect(ctx, x + 16, o.y - o.h + 26, o.w - 32, 44, 6); ctx.fill();
  ctx.fillStyle = '#1c1c22';
  ctx.fillRect(x + 16, o.y - o.h + 12, o.w - 32, 8);
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.fillText('OVEN — HOT!', x + 18, o.y - o.h + 88);
  ctx.fillStyle = `rgba(255,140,40,${0.25 + glow * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x + o.w / 2, o.y + 4, o.w / 2 + 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawFence(ctx, f, camX) {
  const x = f.x - camX;
  ctx.fillStyle = '#7c4a21';
  ctx.fillRect(x, f.y - f.h, f.w, f.h);
  ctx.fillStyle = '#96602e';
  ctx.fillRect(x - 4, f.y - f.h, f.w + 8, 8);
}

export function drawPickup(ctx, p, camX, t) {
  const x = p.x - camX;
  const bob = Math.sin((t + p.x) / 14) * 4;
  const y = p.y + bob;
  if (p.kind === 'corn') {
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath(); ctx.ellipse(x, y, 12, 18, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7fae4c';
    ctx.beginPath(); ctx.ellipse(x - 8, y + 8, 8, 12, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (p.kind === 'pie') {
    ctx.fillStyle = '#c96a2e';
    ctx.beginPath(); ctx.moveTo(x - 16, y + 8); ctx.lineTo(x + 16, y + 8); ctx.lineTo(x, y - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(x, y - 12, 5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x, y - 16); ctx.quadraticCurveTo(x + 12, y, x, y + 16); ctx.quadraticCurveTo(x - 12, y, x, y - 16);
    ctx.fill();
  }
}

export function drawKnife(ctx, k, camX) {
  const x = k.x - camX;
  ctx.save();
  ctx.translate(x, k.y);
  ctx.rotate(k.spin);
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, 4); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-4, 4, 8, 12);
  ctx.restore();
}

export function drawTurkey(ctx, turkey, camX, hidden) {
  const x = turkey.x - camX;
  const y = turkey.y;
  ctx.save();
  if (turkey.invuln > 0 && Math.floor(turkey.invuln / 4) % 2 === 0) ctx.globalAlpha = 0.45;
  if (hidden) ctx.globalAlpha = 0.55;
  // Tail fan.
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(x - 16, y - 30);
    ctx.rotate(i * 0.42);
    ctx.beginPath(); ctx.ellipse(0, -22, 9, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Body, wing, head.
  ctx.fillStyle = '#6e4520';
  ctx.beginPath(); ctx.ellipse(x, y - 26, 26, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(x - 4, y - 26, 15, 11, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a8763e';
  ctx.beginPath(); ctx.arc(x + 20, y - 52, 13, 0, Math.PI * 2); ctx.fill();
  // Beak + wattle + eye.
  ctx.fillStyle = '#e07830';
  ctx.beginPath(); ctx.moveTo(x + 30, y - 54); ctx.lineTo(x + 42, y - 50); ctx.lineTo(x + 30, y - 46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath(); ctx.ellipse(x + 26, y - 42, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(x + 24, y - 56, 2.6, 0, Math.PI * 2); ctx.fill();
  // Legs, mid-stride.
  ctx.strokeStyle = '#e07830';
  ctx.lineWidth = 4;
  const stride = Math.sin(turkey.stepPhase) * 8;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 8); ctx.lineTo(x - 8 + stride, y);
  ctx.moveTo(x + 8, y - 8); ctx.lineTo(x + 8 - stride, y);
  ctx.stroke();
  ctx.restore();
}

export function drawFarmer(ctx, farmer, camX) {
  const x = farmer.x - camX;
  const y = farmer.y;
  const bob = Math.sin(farmer.stepPhase) * 3;
  ctx.save();
  // Legs + overalls + shirt.
  ctx.strokeStyle = '#2e3a5c';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 52 + bob); ctx.lineTo(x - 10, y);
  ctx.moveTo(x + 6, y - 52 - bob); ctx.lineTo(x + 12, y);
  ctx.stroke();
  ctx.fillStyle = '#3a5a8c';
  roundRect(ctx, x - 18, y - 108, 36, 60, 8); ctx.fill();
  ctx.fillStyle = '#c94f32';
  ctx.fillRect(x - 18, y - 108, 36, 22);
  // Arms reaching forward, clutching a carving knife.
  ctx.strokeStyle = '#c94f32';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 96); ctx.lineTo(x + 34, y - 78);
  ctx.moveTo(x - 10, y - 96); ctx.lineTo(x + 26, y - 70);
  ctx.stroke();
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath(); ctx.moveTo(x + 34, y - 82); ctx.lineTo(x + 52, y - 66); ctx.lineTo(x + 44, y - 58); ctx.closePath(); ctx.fill();
  // Head, moustache, straw hat.
  ctx.fillStyle = '#f2c89a';
  ctx.beginPath(); ctx.arc(x, y - 122, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(x - 12, y - 120, 24, 5);
  ctx.fillStyle = '#d9a83c';
  ctx.beginPath(); ctx.ellipse(x, y - 134, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 14, y - 148, 28, 14);
  // Angry eyes.
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(x + 5, y - 126, 2.4, 0, Math.PI * 2); ctx.arc(x + 11, y - 126, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawDoor(ctx, x, camX, label) {
  const dx = x - camX;
  ctx.fillStyle = '#3f7a3a';
  roundRect(ctx, dx - 30, GROUND_Y - 120, 60, 120, 8); ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, dx, GROUND_Y - 132);
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath(); ctx.arc(dx + 18, GROUND_Y - 60, 4, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'left';
}

export function drawHud(ctx, game) {
  ctx.fillStyle = 'rgba(43,26,16,0.82)';
  roundRect(ctx, 12, 10, 330, 74, 10); ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 19px Trebuchet MS, sans-serif';
  ctx.fillText(`SCORE ${Math.floor(game.score)}`, 24, 34);
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  ctx.fillText(`${game.stage.name}  ·  ${Math.max(0, Math.floor(game.distance))} m`, 24, 58);
  ctx.fillText(`Lives ${'♥'.repeat(Math.max(0, game.lives))}${'♡'.repeat(Math.max(0, 3 - game.lives))}`, 24, 76);
  // Alert meter on the right.
  ctx.fillStyle = 'rgba(43,26,16,0.82)';
  roundRect(ctx, VIEW_W - 232, 10, 220, 74, 10); ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 14px Trebuchet MS, sans-serif';
  ctx.fillText(game.farmer.state === 'cornered' ? 'SPOTTED! RUN!' : game.farmer.state === 'chasing' ? 'Farmer chasing…' : 'Farmer searching…', VIEW_W - 220, 32);
  ctx.fillStyle = '#5d3a28';
  ctx.fillRect(VIEW_W - 220, 44, 196, 12);
  ctx.fillStyle = game.alert > 70 ? '#d23b2e' : game.alert > 35 ? '#e07830' : '#7fae4c';
  ctx.fillRect(VIEW_W - 220, 44, 196 * (game.alert / 100), 12);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = '13px Trebuchet MS, sans-serif';
  ctx.fillText(game.hidden ? 'Hidden in the hay — hold still!' : 'Hide in hay with S', VIEW_W - 220, 74);
  if (game.heat > 0) {
    ctx.fillStyle = 'rgba(43,26,16,0.85)';
    roundRect(ctx, VIEW_W / 2 - 140, 94, 280, 30, 8); ctx.fill();
    ctx.fillStyle = '#ff8a5c';
    ctx.font = 'bold 15px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OVEN HEAT! Jump clear!', VIEW_W / 2, 115);
    ctx.textAlign = 'left';
  }
}

export function drawCenterPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(43,26,16,0.78)';
  roundRect(ctx, 130, 84, VIEW_W - 260, 372, 16); ctx.fill();
  ctx.fillStyle = accent || '#ffd23e';
  ctx.font = 'bold 44px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 150);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = '17px Trebuchet MS, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 196 + i * 30));
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, best) {
  drawCenterPanel(ctx, 'GOBBLE RUN', [
    'The Great Turkey Escape — Thanksgiving is coming.',
    'Outrun the farmer through the farmyard, the barn and the kitchen.',
    'Dodge his carving knives. Jump the fences. Never stand on an oven.',
    'Grab corn and pie. Hide in the haystacks when he spots you.',
    '',
    'A / D or ← → to run · Space to jump · Shift to dash · S to hide',
    'Press Enter or click Start — and gobble like you mean it.',
    best > 0 ? `Best escape so far: ${best} points` : 'No escape yet. The farmer is sharpening his knife…',
  ], '#ffd23e');
}

export function drawEnd(ctx, game) {
  if (game.state === 'escaped') {
    drawCenterPanel(ctx, 'ESCAPED!', [
      'You burst through the kitchen door into the autumn woods.',
      'No Thanksgiving dinner this year — this turkey lives to gobble.',
      '',
      `Final score: ${Math.floor(game.score)}   ·   Distance: ${Math.floor(game.distance)} m`,
      `Lives left: ${game.lives}   ·   Best: ${Math.floor(Math.max(game.best, game.score))}`,
      '',
      'Press R or click Restart to run again.',
    ], '#7fae4c');
  } else {
    drawCenterPanel(ctx, 'CAUGHT!', [
      'The farmer finally corners you by the carving board…',
      '…but a turkey that got this far deserves another run.',
      '',
      `Score: ${Math.floor(game.score)}   ·   Distance: ${Math.floor(game.distance)} m`,
      `Best: ${Math.floor(Math.max(game.best, game.score))}`,
      '',
      'Press R or click Restart to try again.',
    ], '#d23b2e');
  }
}
