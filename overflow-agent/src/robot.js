// The Overflow Agent: one drawing function used in every scene so the design never drifts.
// Origin is the ground point between the feet; `s` is the scale (1 = ~300 px tall).
//
// st = {
//   look:    -1..1  horizontal eye direction
//   blink:   0..1   (1 = closed)
//   sx, sy:  squash/stretch about the ground point
//   arm:     0..1   right arm raised (catching)
//   bulb:    0..1+  antenna glow strength
//   chest:   0..1   chest light flash
//   upgrade: 0..1   ring of light sweeping top to bottom (null = none)
//   turn:    -1..1  slight head tilt toward the camera / side
// }
const ROBOT = {
  body: '#EEF3FF', bodyDark: '#AFC0EE',
  screen: '#1B1147', screenDark: '#120A33',
  eye: C.cyan, phones: C.coral, phonesDark: C.coralDark,
  metal: '#8E9BD8', metalDark: '#6370B8',
};

function drawRobot(ctx, x, y, s, st = {}) {
  const look = st.look || 0, blink = st.blink || 0;
  const sx = st.sx || 1, sy = st.sy || 1;
  const arm = st.arm || 0, bulb = st.bulb == null ? 0.6 : st.bulb;
  const chest = st.chest || 0, tilt = (st.turn || 0) * 0.06;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // ground contact shadow + soft long shadow on the floor
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = '#05001A';
  ctx.beginPath(); ctx.ellipse(0, 4, 96 * sx, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.14;
  ctx.filter = 'blur(10px)';
  ctx.beginPath(); ctx.ellipse(90, 12, 150 * sx, 20, 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.scale(sx, sy);

  // feet
  for (const fx of [-40, 40]) {
    twoTone(ctx, () => rr(ctx, fx - 26, -30, 52, 32, 16), ROBOT.metal, ROBOT.metalDark, 0.06, 0.08, 52, 0.15);
  }

  ctx.translate(0, -150);
  ctx.rotate(tilt);

  const bodyPath = () => { ctx.beginPath(); ctx.ellipse(0, 0, 108, 118, 0, 0, Math.PI * 2); };
  longShadow(ctx, bodyPath, 0.3, 26, 30, 24);

  // left arm (static, relaxed)
  ctx.save();
  ctx.translate(-104, 30);
  ctx.rotate(0.35);
  twoTone(ctx, () => rr(ctx, -18, -8, 36, 66, 18), ROBOT.body, ROBOT.bodyDark, 0.1, 0.06, 40, 0.15);
  ctx.restore();

  // antenna stalk + bulb
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = ROBOT.metal;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(0, -112); ctx.lineTo(0, -150); ctx.stroke();
  glow(ctx, 0, -162, 60 + 40 * bulb, C.gold, 0.25 + 0.45 * Math.min(1, bulb));
  twoTone(ctx, () => circle(ctx, 0, -162, 16), bulb > 0.3 ? '#FFD66B' : '#E9A93A', C.amber, 0.08, 0.08, 30, 0.35);
  ctx.restore();

  // body
  twoTone(ctx, bodyPath, ROBOT.body, ROBOT.bodyDark, 0.14, 0.12, 108, 0.0);

  // headset band over the top
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = ROBOT.phonesDark;
  ctx.lineWidth = 15;
  ctx.beginPath(); ctx.ellipse(0, -8, 120, 128, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.strokeStyle = ROBOT.phones;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.ellipse(-2, -11, 120, 128, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.restore();

  // face screen
  const scr = () => rr(ctx, -78, -70, 156, 96, 40);
  twoTone(ctx, scr, ROBOT.screen, ROBOT.screenDark, -0.04, -0.05, 100, 0);
  ctx.save();
  scr(); ctx.clip();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(-40, -62, 70, 22, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // eyes
  const ex = look * 10;
  for (const side of [-1, 1]) {
    const cx = side * 34 + ex, cy = -26;
    glow(ctx, cx, cy, 46, C.cyan, 0.35);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, Math.max(0.08, 1 - blink));
    circle(ctx, 0, 0, 23);
    ctx.fillStyle = ROBOT.eye;
    ctx.fill();
    circle(ctx, 3, 3, 14);
    ctx.fillStyle = '#0E8FA6';
    ctx.fill();
    circle(ctx, -7, -7, 6.5);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
  // smile
  ctx.save();
  ctx.strokeStyle = ROBOT.eye;
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(ex * 0.6, 2, 14, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  ctx.restore();

  // chest light
  glow(ctx, 0, 66, 40 + 110 * chest, C.gold, 0.15 + 0.7 * chest);
  twoTone(ctx, () => circle(ctx, 0, 66, 15), chest > 0.15 ? '#FFE07A' : '#C9A25A', chest > 0.15 ? C.amber : '#8C6A3A', 0.08, 0.08, 30, 0.3);
  if (st.chestBurst) drawBurst(ctx, 0, 66, 1 - st.chestBurst, 46, '#FFE07A', 8, 7);

  // ear cups
  for (const side of [-1, 1]) {
    twoTone(ctx, () => rr(ctx, side * 112 - 17, -44, 34, 66, 17), ROBOT.phones, ROBOT.phonesDark, 0.1, 0.06, 40, 0.2);
  }
  // mic boom (right side) + mic
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = ROBOT.phonesDark;
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(116, 8); ctx.quadraticCurveTo(108, 52, 52, 50); ctx.stroke();
  twoTone(ctx, () => circle(ctx, 46, 50, 12), '#3B2F7A', '#251B57', 0.08, 0.08, 24, 0.3);
  ctx.restore();

  // right arm (rotates up to catch)
  ctx.save();
  ctx.translate(100, 34);
  ctx.rotate(-0.35 - arm * 2.2);
  twoTone(ctx, () => rr(ctx, -18, -8, 36, 66, 18), ROBOT.body, ROBOT.bodyDark, 0.1, 0.06, 40, 0.15);
  ctx.restore();

  // upgrade ring sweeping down
  if (st.upgrade != null && st.upgrade > 0 && st.upgrade < 1) {
    const k = st.upgrade;
    const ry = lerp(-200, 140, easeInOut(k));
    const a = Math.sin(Math.PI * k);
    ctx.save();
    ctx.globalAlpha = a;
    glow(ctx, 0, ry, 200, C.cyan, 0.35);
    ctx.lineWidth = 10;
    ctx.strokeStyle = C.mint;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.ellipse(0, ry, 150, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, ry, 150, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// Rounded, faceless helper figure for the review team (July).
function drawHelper(ctx, x, y, s, color, dark, st = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
  ctx.save();
  ctx.globalAlpha *= 0.3;
  ctx.fillStyle = '#05001A';
  ctx.beginPath(); ctx.ellipse(0, 4, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const body = () => rr(ctx, -55, -170, 110, 172, 52);
  longShadow(ctx, body, 0.25, 20, 22, 20);
  twoTone(ctx, body, color, dark, 0.12, 0.08, 110, 0.1);
  const head = () => circle(ctx, 0, -215, 42);
  twoTone(ctx, head, st.head || '#E9E4FF', st.headDark || '#BDB4F0', 0.12, 0.1, 84, 0.15);
  // arms reaching up when catching
  const reach = st.reach || 0;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 48, -130);
    ctx.rotate(-side * (0.25 + reach * 2.3));
    twoTone(ctx, () => rr(ctx, -15, -6, 30, 78, 15), color, dark, 0.1, 0.06, 30, 0.1);
    ctx.restore();
  }
  ctx.restore();
}
