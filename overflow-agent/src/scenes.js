// Scenes and the master renderAt(t). Every visual is a pure function of time.

// Facts (section 4 of the brief). The only numbers used anywhere in the film.
const DATA = {
  months: [
    { m: 'MAR', rate: 0.82 }, { m: 'APR', rate: 0.40 }, { m: 'MAY', rate: 0.48 },
    { m: 'JUN', rate: 0.65 }, { m: 'JUL', rate: 1.43 }, { m: 'AUG', rate: 1.50 },
    { m: 'SEP', rate: 2.37 }, { m: 'OCT', rate: 1.00 },
  ],
  calls: 37444, sales: 397, overall: 1.06,
};

const STARS = makeParticles(160, 11);
const DUST = makeParticles(60, 23);
const BOKEH = makeParticles(14, 31);

// ---------------------------------------------------------------- Scene 1: after hours
function drawOfficeWall(ctx, t) {
  backdrop(ctx, 900, 520, C.violet, 1000, 0.55);
  // floor
  ctx.fillStyle = '#0E0730';
  ctx.fillRect(-400, 730, W + 800, 600);
  ctx.fillStyle = hexA(C.iris, 0.12);
  ctx.fillRect(-400, 728, W + 800, 6);

  // window with night sky
  const wx = 190, wy = 230, ww = 560, wh = 340;
  twoTone(ctx, () => rr(ctx, wx - 22, wy - 22, ww + 44, wh + 44, 44), '#2E1A70', '#22135A', 0.02, 0.03, 600, 0.0);
  ctx.save();
  rr(ctx, wx, wy, ww, wh, 28); ctx.clip();
  const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#0A0420'); sky.addColorStop(1, '#241068');
  ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
  ctx.translate(wx, wy);
  drawParticles(ctx, STARS.slice(0, 70).map((p) => ({ ...p, x: (p.x + 300) % ww, y: (p.y + 300) % (wh * 0.9), vx: 0, vy: 0 })), t, '#EDE8FF', 0.9);
  // crescent moon
  glow(ctx, 450, 110, 160, '#BFB4FF', 0.35);
  circle(ctx, 450, 110, 46); ctx.fillStyle = '#F4EFFF'; ctx.fill();
  circle(ctx, 472, 96, 42); ctx.fillStyle = '#100630'; ctx.fill();
  // distant city silhouette
  ctx.fillStyle = '#170A44';
  const bx = [0, 70, 120, 200, 260, 330, 400, 470, 530];
  const bh = [120, 180, 90, 210, 140, 100, 170, 120, 150];
  bx.forEach((x, i) => { rr(ctx, x, wh - bh[i], 64, bh[i] + 30, 10); ctx.fill(); });
  ctx.restore();
  // mullions
  ctx.fillStyle = '#2E1A70';
  ctx.fillRect(wx + ww / 2 - 9, wy, 18, wh);
  ctx.fillRect(wx, wy + wh / 2 - 9, ww, 18);

  // wall clock showing 5:50 (early morning)
  const cx = 1560, cy = 250, r = 92;
  longShadow(ctx, () => circle(ctx, cx, cy, r + 12), 0.35, 14, 18, 16);
  twoTone(ctx, () => circle(ctx, cx, cy, r + 12), '#2E1A70', '#22135A', 0.05, 0.05, 100, 0);
  twoTone(ctx, () => circle(ctx, cx, cy, r), '#CFC7FA', '#A49BE0', 0.08, 0.08, 100, 0.0);
  ctx.fillStyle = '#4A3C99';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, i % 3 ? 4 : 7);
    ctx.fill();
  }
  const hand = (ang, len, wdt, col) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke(); ctx.restore();
  };
  const mins = 50 + t / 60;
  hand(((5 + mins / 60) / 12) * Math.PI * 2 - Math.PI / 2, r * 0.48, 12, '#2A1D6E');
  hand((mins / 60) * Math.PI * 2 - Math.PI / 2, r * 0.7, 8, '#2A1D6E');
  hand(((Math.floor(t) + 12) / 60) * Math.PI * 2 - Math.PI / 2, r * 0.74, 4, C.coral);
  circle(ctx, cx, cy, 8); ctx.fillStyle = C.coral; ctx.fill();
}

function drawDesk(ctx, x, y, w, o = {}) {
  const top = '#3A2788', topDark = '#2A1B69', leg = '#1E124F';
  // chair (behind the desk), empty
  if (o.chair !== false) {
    const chx = x + w * 0.5 + (o.chairOff || 0);
    twoTone(ctx, () => rr(ctx, chx - 62, y - 120, 124, 150, 46), '#2A1A63', '#1E1250', 0.06, 0.04, 124, 0);
  }
  // monitor (off)
  if (o.monitor !== false) {
    const mx = x + w * (o.monX || 0.35);
    ctx.fillStyle = leg; ctx.fillRect(mx - 8, y - 46, 16, 46);
    twoTone(ctx, () => rr(ctx, mx - 92, y - 170, 184, 124, 18), '#2B1D66', '#1C1150', 0.04, 0.05, 184, 0);
    rr(ctx, mx - 78, y - 158, 156, 100, 10); ctx.fillStyle = '#120A33'; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(mx - 78, y - 158); ctx.lineTo(mx - 20, y - 158); ctx.lineTo(mx - 70, y - 58); ctx.lineTo(mx - 78, y - 58); ctx.fill();
    ctx.restore();
  }
  // legs + top
  ctx.fillStyle = leg;
  rr(ctx, x + 24, y + 10, 22, 150, 10); ctx.fill();
  rr(ctx, x + w - 46, y + 10, 22, 150, 10); ctx.fill();
  longShadow(ctx, () => rr(ctx, x, y, w, 30, 15), 0.3, 16, 20, 14);
  twoTone(ctx, () => rr(ctx, x, y, w, 30, 15), top, topDark, 0.0, 0.1, 100, 0.12);
}

function drawDeskPhone(ctx, x, y, t, ring) {
  // ring glow + ring arcs
  const pulse = ring * (0.5 + 0.5 * Math.sin(t * 22));
  glow(ctx, x, y - 30, 190, C.cyan, 0.15 + 0.4 * pulse);
  twoTone(ctx, () => rr(ctx, x - 62, y - 44, 124, 46, 20), '#3F2C92', '#2A1B69', 0.04, 0.08, 124, 0.15);
  const lift = ring * Math.abs(Math.sin(t * 22)) * 6;
  ctx.save();
  ctx.translate(0, -lift);
  handsetIcon(ctx, x, y - 52, 92, ring > 0.05 ? C.cyan : '#5A47B8', 0);
  ctx.restore();
  if (ring > 0.01) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const k = (t * 1.6 + i / 3) % 1;
      ctx.globalAlpha = ring * (1 - k) * 0.9;
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 6;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        const a0 = side > 0 ? 0 : Math.PI;
        ctx.arc(x, y - 60, 70 + k * 60, a0 - 0.5, a0 + 0.5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function cam1(t, T) {
  return { x: Math.sin(T * 0.45) * 14, y: Math.cos(T * 0.35) * 6, z: lerp(1.0, 1.07, easeInOut(t / 3)), fx: 980, fy: 600 };
}

function scene1Body(ctx, t, T) {
  const cam = cam1(t, T);

  // robot pop-in (squash and stretch)
  const pk = prog(t, 0.9, 1.6);
  const rise = pk <= 0 ? 0 : springOut(pk, 2.0, 6);
  const robotY = lerp(1120, 830, rise);
  const vel = pk > 0 && pk < 1 ? Math.exp(-6 * pk) * Math.sin(2 * Math.PI * pk) : 0;
  const sy = 1 + vel * 0.45, sx = 1 - vel * 0.3;
  const catchK = smooth(prog(t, 1.75, 2.15));

  // bubble flight phone -> hand
  const phone = { x: 1360, y: 620 };
  const hand = { x: 1010, y: 560 };
  const bk = easeInOut(prog(t, 1.25, 2.15));
  const bx = lerp(phone.x, hand.x, bk);
  const by = lerp(phone.y - 90, hand.y, bk) - Math.sin(Math.PI * bk) * 150;

  withLayer(ctx, cam, 0.3, () => drawOfficeWall(ctx, T));
  withLayer(ctx, cam, 0.6, () => {
    drawDesk(ctx, 60, 640, 420, { monX: 0.45 });
    drawDesk(ctx, 1200, 640, 470, { monX: 0.72, chairOff: 40 });
    drawDeskPhone(ctx, phone.x, 640, T, t < 2.0 ? 1 - smooth(prog(t, 1.2, 1.9)) * 0.6 : 0.2);
  });
  withLayer(ctx, cam, 0.8, () => drawParticles(ctx, DUST, T, '#B9AEFF', 0.35));
  withLayer(ctx, cam, 1.0, () => {
    glow(ctx, 880, 620, 520, C.iris, 0.45 * rise);
    if (pk > 0) {
      drawRobot(ctx, 880, robotY, 1.0, {
        sx, sy, look: lerp(0, 1, smooth(prog(t, 1.2, 1.6))) - catchK * 0.3,
        arm: catchK, bulb: 0.5 + 0.5 * rise, blink: t > 2.45 && t < 2.6 ? 1 : 0,
      });
    }
    // pop burst on entrance
    drawBurst(ctx, 880, 650, prog(t, 1.0, 1.5), 190, C.cyan, 10, 3);
    // front desk (robot pops up from behind it)
    const dx = 600, dy = 770, dw = 620;
    longShadow(ctx, () => rr(ctx, dx, dy, dw, 360, 26), 0.4, 24, 14, 22);
    twoTone(ctx, () => rr(ctx, dx + 26, dy + 24, dw - 52, 360, 24), '#2C1B6C', '#1E1152', -0.0, 0, 100, 0);
    ctx.save();
    rr(ctx, dx + 26, dy + 24, dw - 52, 360, 24); ctx.clip();
    ctx.fillStyle = '#1E1152';
    ctx.fillRect(dx + dw * 0.62, dy, dw, 400);
    // drawer fronts
    for (const [x0, w0] of [[dx + 70, 220], [dx + dw * 0.62 + 30, 170]]) {
      twoTone(ctx, () => rr(ctx, x0, dy + 80, w0, 90, 18), '#3A2788', '#2A1B69', 0.0, 0.06, 100, 0);
      rr(ctx, x0 + w0 / 2 - 34, dy + 118, 68, 14, 7); ctx.fillStyle = '#5B47C0'; ctx.fill();
    }
    ctx.restore();
    twoTone(ctx, () => rr(ctx, dx, dy, dw, 40, 20), '#4A36AC', '#34237F', 0.0, 0.12, 100, 0.14);
    // mug on the desk
    twoTone(ctx, () => rr(ctx, dx + dw - 120, dy - 64, 56, 64, 14), C.coral, C.coralDark, 0.08, 0.04, 56, 0.2);
    ctx.save(); ctx.lineWidth = 9; ctx.strokeStyle = C.coralDark;
    ctx.beginPath(); ctx.arc(dx + dw - 60, dy - 32, 16, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.restore();
    // call bubble
    if (t >= 1.25) {
      const caught = prog(t, 2.15, 2.3);
      drawCallBubble(ctx, bx, by, 46 * (1 + 0.15 * Math.sin(Math.PI * caught)), { glow: 1 });
    }
  });
  // foreground silhouettes (plant + chair back), slightly defocused
  withLayer(ctx, cam, 1.4, () => {
    ctx.save();
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = '#211258';
    const leaves = [[-10, 960, 90, 230, -0.5], [70, 900, 70, 200, -0.15], [150, 960, 70, 190, 0.35], [40, 1000, 110, 140, 0.1]];
    for (const [x, y, rx, ry, a] of leaves) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); ctx.fill(); }
    rr(ctx, 1640, 880, 360, 300, 80); ctx.fill();
    ctx.restore();
  });

  // label
  const la = smooth(prog(t, 0.3, 0.8)) * (1 - smooth(prog(t, 2.2, 2.45)));
  if (la > 0) {
    ctx.save();
    ctx.translate(0, (1 - la) * 20);
    ctx.font = FONTS.label(52);
    const lw = ctx.measureText('Weekends · early mornings').width;
    pill(ctx, SAFE.x0 + 24, 82, lw + 118, 96, '#1A0E45', 0.9 * la);
    circle(ctx, SAFE.x0 + 74, 130, 10); ctx.fillStyle = hexA(C.cyan, la); ctx.fill();
    text(ctx, 'Weekends · early mornings', SAFE.x0 + 98, 148, { size: 52, alpha: la });
    ctx.restore();
  }
}

// Zoom-through: the camera dives into the caught call bubble (screen point P).
function zoomPoint() {
  const c = cam1(2.45, 2.45);
  const s = 1 + (c.z - 1);
  return { x: c.fx + s * (1010 - c.fx - c.x), y: c.fy + s * (560 - c.fy - c.y) };
}

function scene1(ctx, t, T) {
  const P = zoomPoint();
  const k = prog(t, 2.45, 3.0);
  const Z = 1 + 5 * easeIn(k);
  ctx.save();
  ctx.translate(P.x, P.y); ctx.scale(Z, Z); ctx.translate(-P.x, -P.y);
  scene1Body(ctx, t, T);
  ctx.restore();
  if (k > 0) {
    const R = 46 * Z * (1 + 40 * easeIn(k));
    circle(ctx, P.x, P.y, R);
    ctx.fillStyle = hexA(C.cyan, smooth(prog(k, 0, 0.35)));
    ctx.fill();
  }
}

// ---------------------------------------------------------------- shared chart
const CH = { x0: 860, pitch: 132, bw: 86, base: 800, scale: 172 }; // 172 px per percentage point
const AGENT = { x: 430, y: 800, s: 1.1 };       // shared hero placement for scenes 2-4 (match cuts)
const AGENT_C = { x: AGENT.x, y: AGENT.y - 150 * AGENT.s }; // body centre
const drift = (T) => ({ x: Math.sin(T * 0.45) * 14, y: Math.cos(T * 0.35) * 7 });

function drawBar(ctx, x, base, w, h, light, dark) {
  if (h <= 0.5) return;
  const path = () => {
    ctx.beginPath();
    const r = Math.min(12, h / 2, w / 2);
    ctx.moveTo(x, base);
    ctx.lineTo(x, base - h + r);
    ctx.arcTo(x, base - h, x + r, base - h, r);
    ctx.lineTo(x + w - r, base - h);
    ctx.arcTo(x + w, base - h, x + w, base - h + r, r);
    ctx.lineTo(x + w, base);
    ctx.closePath();
  };
  // two-tone: lighter left face, darker right face, clean vertical split
  ctx.save();
  path(); ctx.fillStyle = dark; ctx.fill();
  path(); ctx.clip();
  ctx.fillStyle = light;
  ctx.fillRect(x - 2, base - h - 2, w * 0.58, h + 4);
  ctx.restore();
}

const BAR = { light: '#5B4FD6', dark: '#3F35A8', hiLight: '#8C82F5', hiDark: '#6157D0' };
function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (n, sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, k));
  return '#' + [16, 8, 0].map((sh) => ch(0, sh).toString(16).padStart(2, '0')).join('');
}

// Draws the Mar..Sep chart. `bars[i]` = { g: growth 0..1+ (may overshoot), hi: 0..1 gold, soft: 0..1 light highlight }
function drawChart(ctx, bars, T, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  bars.forEach((b, i) => {
    if (!b || b.g <= 0) return;
    const x = CH.x0 + i * CH.pitch;
    const h = DATA.months[i].rate * CH.scale * b.g;
    const hi = b.hi || 0, soft = b.soft || 0;
    if (hi > 0) glow(ctx, x + CH.bw / 2, CH.base - h / 2, 260, C.gold, 0.35 * hi);
    const light = mixHex(BAR.light, BAR.hiLight, soft);
    const dark = mixHex(BAR.dark, BAR.hiDark, soft);
    drawBar(ctx, x, CH.base, CH.bw, h, light, dark);
    if (hi > 0) {
      ctx.save(); ctx.globalAlpha *= hi;
      drawBar(ctx, x, CH.base, CH.bw, h, C.gold, C.amber);
      ctx.restore();
    }
    circle(ctx, x + CH.bw / 2, CH.base, 7);
    ctx.fillStyle = hi > 0.5 ? C.gold : light; ctx.fill();
  });
  ctx.restore();
}

function chartLabels(ctx, bars, camx, alpha = 1, marchNote = 1) {
  bars.forEach((b, i) => {
    if (!b || b.la <= 0) return;
    const x = CH.x0 + i * CH.pitch + CH.bw / 2 - camx * 0.7;
    const on = (b.hi || 0) > 0.5;
    text(ctx, DATA.months[i].m, x, CH.base + 66, { size: 48, align: 'center', color: on ? C.ink : C.inkMuted, alpha: b.la * alpha, id: 'm' + i });
  });
  const b0 = bars[0];
  if (b0 && b0.g > 0 && marchNote > 0) {
    const top = CH.base - DATA.months[0].rate * CH.scale * Math.min(1, b0.g);
    text(ctx, 'from 12 Mar', CH.x0 + CH.bw / 2 - camx * 0.7 - 20, top - 26, { size: 48, align: 'left', color: C.inkMuted, alpha: marchNote * alpha, id: 'from12' });
  }
}

function spaceBackdrop(ctx, cam, gx, gy, T, extra) {
  withLayer(ctx, cam, 0.15, () => {
    backdrop(ctx, gx, gy, C.violet, 1100, 0.7);
    if (extra) extra();
    ctx.strokeStyle = hexA(C.iris, 0.11);
    ctx.lineWidth = 3;
    for (let i = 1; i <= 6; i++) { circle(ctx, gx, gy + 60, 140 * i + (T * 12) % 140); ctx.stroke(); }
  });
  withLayer(ctx, cam, 0.35, () => drawParticles(ctx, STARS, T, '#D7D0FF', 0.7));
}

function foregroundBokeh(ctx, cam, T, a = 0.22) {
  withLayer(ctx, cam, 1.4, () => {
    ctx.save(); ctx.filter = 'blur(6px)';
    drawParticles(ctx, BOKEH.map((p) => ({ ...p, r: p.r * 4 })), T, C.cyan, a);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- Scene 2: launch and the low point (3-7 s)
const GRID = { x0: 1030, y0: 440, cols: 25, rows: 10, pitch: 29, lit: 4 * 25 + 17 };
const S2_STREAM = Array.from({ length: 12 }, (_, i) => ({ t0: 3.05 + i * 0.25, yo: [0, -60, 40, -30, 70, -80, 20, -50, 60, -20, 30, -70][i], sale: i === 1 }));
const S2_TRAVEL = 2.2;
function s2SaleTime(b) { return b.t0 + ((AGENT.x + 80) / 1080) * S2_TRAVEL; }

function scene2(ctx, t, T) {
  const d = drift(T);
  const cam = { x: d.x, y: d.y, z: 1, fx: 960, fy: 540 };
  const P = zoomPoint();
  const intro = prog(T, 3.0, 3.6);
  const Z = lerp(1.35, 1, easeOut(intro));
  const outK = prog(T, 6.45, 7.0);

  ctx.save();
  ctx.translate(P.x, P.y); ctx.scale(Z, Z); ctx.translate(-P.x, -P.y);
  spaceBackdrop(ctx, cam, AGENT.x, 560, T);

  withLayer(ctx, cam, 0.7, () => {
    // timeline from launch
    const tl = easeInOut(prog(T, 3.1, 4.4));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.inkMuted, 0.4);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(200, CH.base); ctx.lineTo(lerp(200, 1860, tl), CH.base); ctx.stroke();
    ctx.restore();
    const np = easeOutBack(prog(T, 3.1, 3.5));
    if (np > 0) {
      glow(ctx, 200, CH.base, 90, C.cyan, 0.5);
      circle(ctx, 200, CH.base, 13 * np); ctx.fillStyle = C.cyan; ctx.fill();
    }
    // 250-dot grid: one dot per call, a single gold one
    for (let r = 0; r < GRID.rows; r++) {
      const rk = prog(T, 4.45 + r * 0.07, 4.65 + r * 0.07);
      if (rk <= 0) continue;
      for (let c = 0; c < GRID.cols; c++) {
        const i = r * GRID.cols + c;
        let x = GRID.x0 + c * GRID.pitch, y = GRID.y0 + r * GRID.pitch;
        let rad = 8.5 * easeOutBack(rk, 2.5);
        const lit = i === GRID.lit;
        const lk = lit ? prog(T, 5.5, 5.75) : 0;
        if (outK > 0) {
          // fall into the chart baseline (match cut into scene 3's bars)
          const col = i % 4;
          const k = easeIn(clamp(outK * 1.25 - (i % 9) * 0.025));
          x = lerp(x, CH.x0 + col * CH.pitch + CH.bw / 2 + ((i * 37) % 60) - 30, k);
          y = lerp(y, CH.base - 4, k);
          rad *= 1 - 0.5 * k;
        }
        if (lit && lk > 0) {
          glow(ctx, x, y, 90 * lk, C.gold, 0.6);
          circle(ctx, x, y, rad * (1 + 0.5 * easeOutBack(lk))); ctx.fillStyle = C.gold; ctx.fill();
          drawBurst(ctx, x, y, prog(T, 5.5, 5.95), 40, C.gold, 8, 9);
        } else {
          circle(ctx, x, y, rad); ctx.fillStyle = hexA('#6A5FE0', 0.75); ctx.fill();
        }
      }
    }
  });

  withLayer(ctx, cam, 1.0, () => {
    glow(ctx, AGENT_C.x, AGENT_C.y, 360, C.iris, 0.35);
    let flash = 0;
    for (const b of S2_STREAM) if (b.sale) flash = Math.max(flash, 1 - prog(T, s2SaleTime(b), s2SaleTime(b) + 0.45) || 0) * (T >= s2SaleTime(b) ? 1 : 0);
    const robot2 = () => drawRobot(ctx, AGENT.x, AGENT.y, AGENT.s, { look: -0.6 + 0.9 * smooth(prog(T, 3.4, 4.6)), bulb: 0.7, chest: flash, chestBurst: flash, blink: T > 5.9 && T < 6.05 ? 1 : 0 });
    for (const b of S2_STREAM) {
      const k = (T - b.t0) / S2_TRAVEL;
      if (k <= 0 || k >= 1) continue;
      const x = lerp(-80, 1000, k);
      const y = AGENT_C.y - 40 + b.yo + Math.sin(k * 6 + b.t0) * 14;
      if (b.sale && T >= s2SaleTime(b)) continue;
      const fade = smooth(prog(k, 0.8, 1));
      drawCallBubble(ctx, x, y, 28 * smooth(prog(k, 0, 0.08)) * (1 - fade), { alpha: 1 - fade * 0.5 });
    }
    robot2();
    // the one sale: coin rises in front of the agent
    for (const b of S2_STREAM) if (b.sale && T >= s2SaleTime(b)) {
      const ck = prog(T, s2SaleTime(b), s2SaleTime(b) + 0.9);
      drawBurst(ctx, AGENT.x + 150, AGENT_C.y - 170, prog(T, s2SaleTime(b), s2SaleTime(b) + 0.35), 50, C.gold, 8, 5);
      if (ck < 1) drawCoin(ctx, AGENT.x + 150, AGENT_C.y - 170 - 110 * easeOut(ck), 26, { alpha: 1 - smooth(prog(ck, 0.7, 1)), squish: Math.cos(ck * 10) * 0.35 + 0.65 });
    }
  });
  foregroundBokeh(ctx, cam, T);
  ctx.restore();

  // screen-space text
  const na = smooth(prog(T, 3.35, 3.7)) * (1 - smooth(prog(T, 6.3, 6.6)));
  text(ctx, 'MAR 12', 200 - cam.x * 0.7, CH.base + 66, { size: 48, align: 'center', alpha: na, color: C.ink });
  const ha = smooth(prog(T, 4.85, 5.2)) * (1 - smooth(prog(T, 6.65, 6.9)));
  text(ctx, 'April: 0.40%', GRID.x0 - 4, 250, { font: FONTS.head, size: 100, alpha: ha });
  const sa = smooth(prog(T, 5.45, 5.75)) * (1 - smooth(prog(T, 6.65, 6.9)));
  text(ctx, '1 sale in 250 calls', GRID.x0, 345, { size: 60, color: C.inkMuted, alpha: sa });

  if (intro < 1) {
    // inside the bubble: cyan with an opening hole
    const R = 2300 * easeOut(intro);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(P.x, P.y, R, 0, Math.PI * 2, true);
    ctx.fillStyle = C.cyan; ctx.fill('evenodd');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- Scene 3: July, a team joins in (7-11 s)
const HELPERS = [
  { x: 300, y: 770, s: 0.8, col: '#2FB487', dark: '#1F8763', head: '#9BEFCB', headDark: '#6BCFA6', in: 7.3 },  // back
  { x: 150, y: 800, s: 0.95, col: '#1E92C0', dark: '#156C93', head: '#9FDDF6', headDark: '#6FBCDE', in: 7.38 },
  { x: 700, y: 800, s: 0.95, col: '#C0307E', dark: '#8E1F5D', head: '#F7A9D2', headDark: '#DB7FB0', in: 7.46 },
];
const S3_FEED = Array.from({ length: 7 }, (_, i) => ({ t0: 6.9 + i * 0.42, i }));
const S3_RESCUE = { 1: 1, 2: 2, 3: 0 }; // feed index -> helper index
const S3_TRAVEL = 0.8;

function helperPos(h, T) {
  const kin = springOut(prog(T, h.in, h.in + 0.7), 1.6, 5);
  const kout = easeIn(prog(T, 10.35 + (h.in - 7.3), 10.85 + (h.in - 7.3)));
  return { x: lerp(-220, h.x, kin) - kout * (h.x + 260), y: h.y };
}
function helperHands(h, p) { return { x: p.x, y: p.y - 300 * h.s }; }

function rescueState(T, fi, hp) {
  const ta = S3_FEED[fi].t0 + S3_TRAVEL;
  return { ta, catchK: prog(T, ta, ta + 0.45), coinK: prog(T, ta + 1.0, ta + 1.6) };
}

function julyTop(T) {
  const g = easeOutBack(prog(T, 8.8, 9.6), 2.2);
  return { x: CH.x0 + 4 * CH.pitch + CH.bw / 2, y: CH.base - DATA.months[4].rate * CH.scale * g };
}

function s3Bars(T) {
  const bars = [0, 1, 2, 3].map((i) => {
    const k = prog(T, 7.0 + i * 0.06, 7.45 + i * 0.06);
    return { g: k <= 0 ? 0 : easeOutBack(k, 2), la: smooth(k), soft: i === 3 ? smooth(prog(T, 8.5, 8.9)) : 0 };
  });
  const jk = prog(T, 8.8, 9.6);
  bars.push({ g: jk <= 0 ? 0 : easeOutBack(jk, 2.2), la: smooth(prog(T, 8.75, 9.1)), hi: smooth(prog(T, 8.9, 9.4)) });
  return bars;
}

function scene3(ctx, t, T) {
  const d = drift(T);
  const cam = { x: d.x, y: d.y, z: 1, fx: 960, fy: 540 };
  const bars = s3Bars(T);
  spaceBackdrop(ctx, cam, AGENT.x, 560, T, () => glow(ctx, julyTop(T).x, CH.base - 150, 420, C.gold, 0.12 * smooth(prog(T, 8.9, 9.5))));

  withLayer(ctx, cam, 0.7, () => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.inkMuted, 0.4);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(200, CH.base); ctx.lineTo(1860, CH.base); ctx.stroke();
    ctx.restore();
    drawChart(ctx, bars, T);
  });

  withLayer(ctx, cam, 1.0, () => {
    glow(ctx, AGENT_C.x, AGENT_C.y, 380, C.iris, 0.35);
    // helpers stand behind the agent
    HELPERS.forEach((h, hi) => {
      const p = helperPos(h, T);
      let reach = 0;
      for (const [fi, hix] of Object.entries(S3_RESCUE)) if (hix === hi) {
        const r = rescueState(T, +fi);
        reach = Math.max(reach, smooth(prog(T, r.ta + 0.1, r.ta + 0.4)) * (1 - smooth(prog(T, r.ta + 1.0, r.ta + 1.3))));
      }
      drawHelper(ctx, p.x, p.y, h.s, h.col, h.dark, { reach, head: h.head, headDark: h.headDark });
    });
    let flash = 0;
    drawRobot(ctx, AGENT.x, AGENT.y, AGENT.s, { look: -0.4, bulb: 0.7, chest: flash, blink: T > 7.6 && T < 7.75 ? 1 : 0 });

    for (const f of S3_FEED) {
      const k = (T - f.t0) / S3_TRAVEL;
      const hix = S3_RESCUE[f.i];
      if (k > 0 && k < 1) {
        const x = lerp(-60, AGENT_C.x - 20, easeOut(k));
        const y = lerp(260, AGENT_C.y - 40, easeIn(k));
        drawCallBubble(ctx, x, y, 28 * (hix == null ? 1 - smooth(prog(k, 0.8, 1)) : 1));
      } else if (k >= 1 && hix != null) {
        const h = HELPERS[hix];
        const hand = helperHands(h, helperPos(h, T));
        const r = rescueState(T, f.i);
        if (r.coinK <= 0) {
          // fumbled: arcs out of the agent's reach and into a helper's hands
          const e = easeInOut(r.catchK);
          const x = lerp(AGENT_C.x - 20, hand.x, e);
          const y = lerp(AGENT_C.y - 40, hand.y - 30, e) - Math.sin(Math.PI * e) * 150;
          const wrench = smooth(prog(T, r.ta + 0.5, r.ta + 0.62)) * (1 - smooth(prog(T, r.ta + 0.76, r.ta + 0.8)));
          const check = smooth(prog(T, r.ta + 0.8, r.ta + 0.92));
          drawCallBubble(ctx, x, y, 30, {
            alpha: 1, light: r.catchK < 1 ? '#7FD6DE' : C.cyan,
            badge: check > 0 ? 'check' : 'wrench', badgeAlpha: check > 0 ? check : wrench,
          });
        } else if (r.coinK < 1) {
          const e = easeInOut(r.coinK);
          const jt = julyTop(T);
          const sx = hand.x, sy = hand.y - 30;
          drawBurst(ctx, sx, sy, prog(T, r.ta + 1.0, r.ta + 1.35), 56, C.gold, 8, f.i * 13);
          drawCoin(ctx, lerp(sx, jt.x, e), lerp(sy, jt.y - 30, e) - Math.sin(Math.PI * e) * 200, 24, { squish: Math.cos(r.coinK * 9) * 0.35 + 0.65, alpha: 1 - smooth(prog(r.coinK, 0.85, 1)) });
        }
      }
    }
  });
  foregroundBokeh(ctx, cam, T);

  chartLabels(ctx, bars, cam.x, 1, smooth(prog(T, 7.2, 7.5)));
  const ta = smooth(prog(T, 9.0, 9.35));
  if (ta > 0) {
    const y = 230, size = 84, x0 = CH.x0;
    const w1 = text(ctx, 'June 0.65%', x0, y, { font: FONTS.head, size, alpha: ta, color: C.inkMuted });
    // drawn arrow (the font has no arrow glyph)
    const ax = x0 + w1 + 30;
    ctx.save();
    ctx.globalAlpha = ta;
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ax, y - 30); ctx.lineTo(ax + 62, y - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax + 50, y - 52); ctx.lineTo(ax + 76, y - 30); ctx.lineTo(ax + 50, y - 8); ctx.stroke();
    ctx.restore();
    text(ctx, 'July 1.43%', ax + 110, y, { font: FONTS.head, size, alpha: ta });
  }
}

// ---------------------------------------------------------------- Scene 4: September's update (11-15 s)
const S4_STREAM = (() => {
  const rnd = mulberry32(404);
  return Array.from({ length: 17 }, (_, i) => ({
    t0: 10.4 + i * 0.22, y: 470 + rnd() * 220, sale: [6, 8, 10, 12, 14].includes(i),
  }));
})();
const S4_TRAVEL = 1.0;
const sepTopFinal = () => ({ x: CH.x0 + 6 * CH.pitch + CH.bw / 2, y: CH.base - DATA.months[6].rate * CH.scale });

function s4Bars(T) {
  const fadeHi = 1 - smooth(prog(T, 11.0, 11.4));
  const bars = [0, 1, 2, 3, 4].map((i) => ({ g: 1, la: 1, soft: i === 3 ? fadeHi : 0, hi: i === 4 ? fadeHi : 0 }));
  const ak = prog(T, 11.05, 11.5);
  bars.push({ g: ak <= 0 ? 0 : easeOutBack(ak, 2), la: smooth(ak) });
  const sk = prog(T, 12.5, 13.3);
  bars.push({ g: sk <= 0 ? 0 : easeOutBack(sk, 2.2), la: smooth(prog(T, 12.45, 12.8)), hi: smooth(prog(T, 12.6, 13.1)) });
  return bars;
}

function pullBack(T) { return easeInOut(prog(T, 14.45, 15.0)); }

function scene4(ctx, t, T) {
  const d = drift(T);
  const cam = { x: d.x, y: d.y, z: 1, fx: 960, fy: 540 };
  const up = prog(T, 11.4, 12.4);
  const powered = smooth(prog(T, 11.8, 12.4));
  const bars = s4Bars(T);
  const pb = pullBack(T);
  const Z = lerp(1, 0.72, pb);
  const st = sepTopFinal();
  const chartA = 1 - smooth(prog(T, 14.45, 14.85));

  ctx.save();
  ctx.translate(AGENT_C.x, AGENT_C.y); ctx.scale(Z, Z); ctx.translate(-AGENT_C.x, -AGENT_C.y);
  spaceBackdrop(ctx, cam, AGENT.x, 560, T, () => glow(ctx, st.x, st.y + 160, 520, C.amber, (0.12 + 0.12 * bars[6].hi) * chartA));

  withLayer(ctx, cam, 0.7, () => {
    ctx.save();
    ctx.globalAlpha = chartA;
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.inkMuted, 0.4);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(200, CH.base); ctx.lineTo(1860, CH.base); ctx.stroke();
    ctx.restore();
    drawChart(ctx, bars, T, chartA);
  });

  withLayer(ctx, cam, 1.0, () => {
    let flash = 0;
    for (const b of S4_STREAM) {
      const lt = T - b.t0;
      const k = lt / S4_TRAVEL;
      if (k <= 0) continue;
      if (k < 1) {
        const x = lerp(-80, AGENT_C.x - 40, easeIn(k) * 0.4 + k * 0.6);
        const y = lerp(b.y, AGENT_C.y, k) - Math.sin(Math.PI * k) * 40;
        drawCallBubble(ctx, x, y, 28 * (1 - smooth(prog(k, 0.75, 1))));
      } else if (b.sale) {
        const ck = prog(lt, S4_TRAVEL, S4_TRAVEL + 0.9);
        flash = Math.max(flash, 1 - prog(lt, S4_TRAVEL, S4_TRAVEL + 0.4));
        if (ck < 1) {
          const e = easeInOut(ck);
          const sepNow = { x: st.x, y: CH.base - (CH.base - st.y) * bars[6].g };
          const x = lerp(AGENT_C.x + 60, sepNow.x, e);
          const y = lerp(AGENT_C.y - 40, sepNow.y - 30, e) - Math.sin(Math.PI * e) * 220;
          drawCoin(ctx, x, y, 24 + 6 * Math.sin(Math.PI * ck), { squish: Math.cos(ck * 9) * 0.35 + 0.65, alpha: chartA * (1 - smooth(prog(ck, 0.85, 1))) });
        }
        drawBurst(ctx, AGENT_C.x + 60, AGENT_C.y - 40, prog(lt, S4_TRAVEL, S4_TRAVEL + 0.35), 60, C.gold, 8, Math.round(b.t0 * 100));
      }
    }
    glow(ctx, AGENT_C.x, AGENT_C.y, 380, C.cyan, 0.08 + 0.2 * powered);
    drawRobot(ctx, AGENT.x, AGENT.y, AGENT.s, {
      look: 0.6 - 0.6 * pb, bulb: 0.7 + 0.8 * powered, chest: flash, chestBurst: flash, upgrade: up > 0 && up < 1 ? up : null,
      sx: 1 + 0.04 * Math.sin(Math.PI * up), sy: 1 + 0.05 * Math.sin(Math.PI * up),
    });
    if (powered > 0) {
      const rnd = mulberry32(77);
      for (let i = 0; i < 9; i++) {
        const a = rnd() * Math.PI * 2, dd = 180 + rnd() * 90;
        const tw = Math.sin(T * 3 + i) * 0.5 + 0.5;
        ctx.save(); ctx.globalAlpha = powered * tw * 0.9 * chartA;
        starPath(ctx, AGENT_C.x + Math.cos(a) * dd, AGENT_C.y + Math.sin(a) * dd * 0.9, 9 + 6 * tw, 0.35, 4, 0);
        ctx.fillStyle = C.mint; ctx.fill(); ctx.restore();
      }
    }
  });
  foregroundBokeh(ctx, cam, T);
  ctx.restore();

  if (chartA > 0) chartLabels(ctx, bars, cam.x, chartA, 1);
  const out = 1 - smooth(prog(T, 14.45, 14.75));
  text(ctx, 'September: 2.37%', CH.x0, 230, { font: FONTS.head, size: 100, alpha: smooth(prog(T, 12.9, 13.25)) * out });
  text(ctx, '1 sale in 42 calls', CH.x0 + 4, 320, { size: 60, color: C.inkMuted, alpha: smooth(prog(T, 13.05, 13.4)) * out });
}

// ---------------------------------------------------------------- Scene 5: the total (15-18 s)
// 1,132 call particles and 12 gold coins: 12 / 1,132 = 1.06%, the real overall close rate.
const GALAXY = (() => {
  const rnd = mulberry32(555);
  const calls = Array.from({ length: 1132 }, () => {
    const arm = Math.floor(rnd() * 3);
    const r = Math.pow(rnd(), 0.7);
    return { r, a: arm * (Math.PI * 2 / 3) + r * 3.2 + (rnd() - 0.5) * 0.9 * (1 - r * 0.4), size: 1.4 + rnd() * 2.6, tw: rnd() * 6 };
  });
  const coins = Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2 + rnd() * 0.2 }));
  return { calls, coins };
})();

function agent5(T) {
  // from scene 4's pulled-back position to centre, then to scene 6's position
  const a = { x: AGENT.x, y: AGENT_C.y + (AGENT.y - AGENT_C.y) * 0.72, s: AGENT.s * 0.72 };
  const b = { x: 960, y: 690, s: 0.62 };
  const c = { x: 470, y: TL6.base, s: 1.15 };
  const k1 = easeInOut(prog(T, 15.0, 15.7));
  const k2 = easeInOut(prog(T, 17.45, 18.0));
  return {
    x: lerp(lerp(a.x, b.x, k1), c.x, k2),
    y: lerp(lerp(a.y, b.y, k1), c.y, k2),
    s: lerp(lerp(a.s, b.s, k1), c.s, k2),
  };
}

function rollCounter(T, t0, t1, target) {
  const k = prog(T, t0, t1);
  return target * (1 - Math.pow(1 - k, 3));
}
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

function scene5(ctx, t, T) {
  const d = drift(T);
  const cam = { x: d.x, y: d.y, z: 1, fx: 960, fy: 540 };
  const ag = agent5(T);
  const flat = easeInOut(prog(T, 17.45, 18.0));
  const grow = easeOut(prog(T, 15.1, 16.1));
  const gc = { x: lerp(ag.x, lerp(960, 960, flat), 1), y: lerp(ag.y - 150 * ag.s, TL6.base, flat) };
  gc.x = lerp(ag.x, 960, flat);

  withLayer(ctx, cam, 0.15, () => backdrop(ctx, gc.x, gc.y, C.violet, 1100, 0.75));
  withLayer(ctx, cam, 0.35, () => drawParticles(ctx, STARS, T, '#D7D0FF', 0.6));
  withLayer(ctx, cam, 0.8, () => {
    const RX = lerp(760, 1500, flat) * grow, RY = lerp(250, 0, flat) * grow;
    glow(ctx, gc.x, gc.y, 640 * grow, C.cyan, 0.16 * (1 - flat));
    // back half of the disk first, then the agent, then the front half
    const drawCalls = (front) => {
      for (const p of GALAXY.calls) {
        const a = p.a + T * (0.9 - p.r * 0.55);
        const sy = Math.sin(a);
        if ((sy > 0) !== front) continue;
        const x = gc.x + Math.cos(a) * (0.08 + p.r) * RX;
        const y = gc.y + sy * (0.08 + p.r) * RY;
        ctx.globalAlpha = (0.45 + 0.4 * Math.sin(p.tw + T * 2) ** 2) * (1 - 0.5 * flat);
        circle(ctx, x, y, p.size * (0.7 + 0.3 * grow)); ctx.fillStyle = p.r < 0.25 ? '#B7FBF5' : C.cyan; ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const c of GALAXY.coins) {
        const a = c.a + T * 0.6;
        const sy = Math.sin(a);
        if ((sy > 0) !== front) continue;
        const rr0 = 0.3;
        drawCoin(ctx, gc.x + Math.cos(a) * rr0 * RX, gc.y + sy * rr0 * RY, 13 + 3 * sy, { glow: 0.8, alpha: grow * (1 - flat), squish: 0.75 + 0.25 * Math.cos(a * 2) });
      }
    };
    ctx.save(); drawCalls(false); ctx.restore();
    glow(ctx, ag.x, ag.y - 150 * ag.s, 300 * ag.s / 0.62, C.iris, 0.3);
    drawRobot(ctx, ag.x, ag.y, ag.s, { look: lerp(0, -0.2, flat), bulb: 1.0, chest: 0.3 + 0.3 * Math.sin(T * 3), blink: T > 16.3 && T < 16.45 ? 1 : 0 });
    ctx.save(); drawCalls(true); ctx.restore();
  });
  foregroundBokeh(ctx, cam, T);

  const out = 1 - smooth(prog(T, 17.35, 17.6));
  const stats = [
    { id: 'calls', x: 420, t0: 15.3, val: () => fmtInt(rollCounter(T, 15.3, 16.75, DATA.calls)), label: 'calls' },
    { id: 'sales', x: 960, t0: 15.45, val: () => fmtInt(rollCounter(T, 15.45, 16.75, DATA.sales)), label: 'sales' },
    { id: 'overall', x: 1500, t0: 15.6, val: () => rollCounter(T, 15.6, 16.75, DATA.overall).toFixed(2) + '%', label: 'overall' },
  ];
  for (const s of stats) {
    const k = prog(T, s.t0, s.t0 + 0.5);
    if (k <= 0) continue;
    const a = smooth(k) * out;
    const pop = T >= 16.75 ? 1 + 0.08 * Math.sin(Math.PI * prog(T, 16.75, 17.0)) : 1;
    ctx.save();
    ctx.translate(s.x, 200); ctx.scale(pop, pop); ctx.translate(-s.x, -200);
    text(ctx, s.val(), s.x, 200, { font: FONTS.num, size: 110, align: 'center', alpha: a, id: s.id, color: s.id === 'sales' ? '#FFE08A' : C.ink });
    ctx.restore();
    text(ctx, s.label, s.x, 268, { size: 52, align: 'center', alpha: a, color: C.inkMuted, id: s.id + 'L' });
  }
}

// ---------------------------------------------------------------- Scene 6: still being written (18-20 s)
const TL6 = { x0: 760, pitch: 132, base: 800, scale: 72 };

function scene6(ctx, t, T) {
  const d = drift(T);
  const cam = { x: d.x, y: d.y, z: 1, fx: 960, fy: 540 };
  const octX = TL6.x0 + 7 * TL6.pitch;

  withLayer(ctx, cam, 0.15, () => {
    backdrop(ctx, 470, 620, C.violet, 1000, 0.75);
    glow(ctx, octX, TL6.base - 60, 420, C.cyan, 0.16);
  });
  withLayer(ctx, cam, 0.35, () => drawParticles(ctx, STARS, T, '#D7D0FF', 0.7));

  withLayer(ctx, cam, 0.7, () => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.inkMuted, 0.45);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-200, TL6.base); ctx.lineTo(octX, TL6.base); ctx.stroke();
    ctx.setLineDash([2, 26]);
    ctx.lineDashOffset = -T * 40;
    ctx.lineWidth = 8;
    ctx.strokeStyle = hexA(C.cyan, 0.75 * smooth(prog(T, 18.4, 18.8)));
    ctx.beginPath(); ctx.moveTo(octX + 30, TL6.base); ctx.lineTo(W + 300, TL6.base); ctx.stroke();
    ctx.restore();
    DATA.months.forEach((dm, i) => {
      const x = TL6.x0 + i * TL6.pitch;
      const k = prog(T, 18.05 + i * 0.06, 18.5 + i * 0.06);
      if (k <= 0) return;
      const g = easeOutBack(k, 2);
      const isOct = i === 7, isSep = i === 6;
      const h = dm.rate * TL6.scale * g;
      const bw = 60;
      if (isOct) {
        drawBar(ctx, x - bw / 2, TL6.base, bw, h, '#7FF7EC', C.cyanDark);
        glow(ctx, x, TL6.base, 70 + 20 * (0.5 + 0.5 * Math.sin(T * 4)), C.cyan, 0.5 * smooth(k));
      } else {
        drawBar(ctx, x - bw / 2, TL6.base, bw, h, isSep ? C.gold : BAR.light, isSep ? C.amber : BAR.dark);
      }
      circle(ctx, x, TL6.base, (isOct ? 13 : 8) * smooth(k));
      ctx.fillStyle = isOct ? C.cyan : isSep ? C.gold : '#7C71E8'; ctx.fill();
    });
  });

  withLayer(ctx, cam, 1.0, () => {
    glow(ctx, 470, 640, 380, C.cyan, 0.18);
    drawRobot(ctx, 470, TL6.base, 1.15, {
      look: lerp(-0.2, 0, smooth(prog(T, 18.0, 18.4))), bulb: 1.2, blink: T > 18.6 && T < 18.75 ? 1 : 0,
      chest: 0.25 + 0.25 * Math.sin(T * 3),
    });
  });
  foregroundBokeh(ctx, cam, T, 0.2);

  DATA.months.forEach((dm, i) => {
    const x = TL6.x0 + i * TL6.pitch - cam.x * 0.7;
    const a = smooth(prog(T, 18.1 + i * 0.06, 18.4 + i * 0.06));
    text(ctx, dm.m, x, TL6.base + 66, { size: 48, align: 'center', color: i === 7 ? C.ink : C.inkMuted, alpha: a, id: 'm' + i });
  });
  const ma = smooth(prog(T, 18.2, 18.5));
  text(ctx, 'from 12 Mar', TL6.x0 - 20 - cam.x * 0.7, TL6.base - DATA.months[0].rate * TL6.scale - 26, { size: 48, color: C.inkMuted, alpha: ma, id: 'from12' });
  const ca = smooth(prog(T, 18.35, 18.7));
  const ox = octX - cam.x * 0.7;
  ctx.save();
  ctx.globalAlpha = ca;
  ctx.strokeStyle = hexA(C.cyan, 0.8); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ox, TL6.base - DATA.months[7].rate * TL6.scale - 18); ctx.lineTo(ox, 664); ctx.stroke();
  ctx.restore();
  text(ctx, 'October so far: 1.00%', SAFE.x1 - 20, 580, { size: 56, align: 'right', alpha: ca });
  text(ctx, '(1–6 Oct)', SAFE.x1 - 20, 644, { size: 48, align: 'right', color: C.inkMuted, alpha: ca });

  const ta = smooth(prog(T, 18.15, 18.5));
  ctx.save();
  ctx.translate(0, (1 - ta) * 24);
  text(ctx, 'The Overflow Agent', W / 2, 200, { font: FONTS.head, size: 112, align: 'center', alpha: ta });
  text(ctx, 'March–October 2026', W / 2, 290, { size: 60, align: 'center', color: C.inkMuted, alpha: smooth(prog(T, 18.3, 18.65)) });
  ctx.restore();
}

// ---------------------------------------------------------------- captions (narration, burned in only on the captioned cut)
const NARRATION = [
  { a: 0.3, b: 2.7, s: 'When the sales floor goes quiet, the Overflow Agent picks up.' },
  { a: 3.3, b: 4.9, s: 'It started in March.' },
  { a: 4.9, b: 6.8, s: 'By April, one call in 250 became a sale.' },
  { a: 7.2, b: 9.0, s: 'In July, a team began rescuing the deals it couldn’t finish.' },
  { a: 9.0, b: 10.8, s: 'The rate more than doubled.' },
  { a: 11.3, b: 14.7, s: 'September’s update: one sale in every 42 calls.' },
  { a: 15.3, b: 17.7, s: '37,444 calls. 397 sales.' },
  { a: 18.3, b: 19.5, s: 'And counting.' },
];

function drawCaption(ctx, T) {
  const cue = NARRATION.find((c) => T >= c.a && T < c.b);
  if (!cue) return;
  const a = smooth(prog(T, cue.a, cue.a + 0.12)) * (1 - smooth(prog(T, cue.b - 0.12, cue.b)));
  const size = 48;
  ctx.font = FONTS.label(size);
  const w = ctx.measureText(cue.s).width;
  const y = 990;
  pill(ctx, W / 2 - w / 2 - 34, y - 54, w + 68, 76, '#0B0620', 0.78 * a);
  text(ctx, cue.s, W / 2, y, { size, align: 'center', alpha: a, shadow: false, id: 'cap' + NARRATION.indexOf(cue) });
}

// ---------------------------------------------------------------- sound cues (read by audio/build_audio.py)
function soundCues() {
  const q = [];
  const add = (t, kind, o = {}) => q.push({ t: +t.toFixed(3), kind, ...o });
  add(0.15, 'ring'); add(0.75, 'ring');
  add(0.95, 'pop'); add(1.25, 'whoosh', { dur: 0.6, gain: 0.5 });
  add(2.15, 'catch'); add(2.45, 'whoosh', { dur: 0.6, gain: 0.9, rise: true });
  add(3.0, 'swell');
  add(3.15, 'tick');
  for (const b of S2_STREAM) if (b.sale) add(s2SaleTime(b), 'coin', { gain: 0.6 });
  for (let r = 0; r < GRID.rows; r++) add(4.45 + r * 0.07, 'tick', { gain: 0.45 });
  add(5.5, 'chime');
  add(6.45, 'whoosh', { dur: 0.55, gain: 0.6 });
  for (let i = 0; i < 4; i++) add(7.0 + i * 0.06, 'tick', { gain: 0.5 });
  add(7.3, 'whoosh', { dur: 0.5, gain: 0.4 });
  for (const fi of Object.keys(S3_RESCUE)) {
    const ta = S3_FEED[+fi].t0 + S3_TRAVEL;
    add(ta + 0.5, 'fix'); add(ta + 0.8, 'fix', { hi: true }); add(ta + 1.0, 'coin', { gain: 0.7 });
  }
  add(8.8, 'rise', { dur: 0.8 });
  add(11.05, 'tick', { gain: 0.6 });
  add(11.4, 'shimmer', { dur: 1.0 });
  add(12.5, 'rise', { dur: 0.8, gain: 0.7 });
  for (const b of S4_STREAM) if (b.sale) add(b.t0 + S4_TRAVEL, 'coin', { gain: 0.75 });
  add(14.45, 'whoosh', { dur: 0.6, gain: 0.7 });
  add(15.0, 'swell');
  for (let x = 15.3; x < 16.7; x += 0.055 + 0.06 * prog(x, 15.3, 16.75)) add(x, 'tick', { gain: 0.35 });
  add(16.75, 'hit');
  add(17.4, 'whoosh', { dur: 0.6, gain: 0.6 });
  for (let i = 0; i < 8; i++) add(18.05 + i * 0.06, 'tick', { gain: 0.45 });
  add(18.4, 'chime', { gain: 0.6, low: true });
  return q.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- master timeline
const SCENES = [
  { a: 0, b: 3, fn: scene1 },
  { a: 3, b: 7, fn: scene2 },
  { a: 7, b: 11, fn: scene3 },
  { a: 11, b: 15, fn: scene4 },
  { a: 15, b: 18, fn: scene5 },
  { a: 18, b: 20, fn: scene6 },
];
const HOLD_AT = 19.0, FADE_AT = 19.5;

function renderAt(tIn, opts = {}) {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  TEXT_LOG = [];
  // final hold: freeze the picture at 19.0 s, then fade to the background colour
  const t = Math.min(tIn, HOLD_AT);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, W, H);
  const sc = SCENES.find((s) => t >= s.a && t < s.b) || SCENES[SCENES.length - 1];
  ctx.save();
  sc.fn(ctx, t - sc.a, t);
  ctx.restore();
  vignette(ctx, 0.5);
  grain(ctx, Math.round(t * FPS), 0.035);
  if (opts.captions) drawCaption(ctx, tIn);
  const f = smooth(prog(tIn, FADE_AT, DURATION - 1 / FPS));
  if (f > 0) {
    ctx.fillStyle = hexA(C.navy, f);
    ctx.fillRect(0, 0, W, H);
    for (const e of TEXT_LOG) e.alpha = (e.alpha ?? 1) * (1 - f);
  }
  return TEXT_LOG;
}
