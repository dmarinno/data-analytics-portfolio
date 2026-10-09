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

function scene1(ctx, t, T) {
  const k = t / 3;
  const cam = { x: Math.sin(T * 0.45) * 14, y: Math.cos(T * 0.35) * 6, z: lerp(1.0, 1.07, easeInOut(k)), fx: 980, fy: 600 };

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
  const la = smooth(prog(t, 0.3, 0.8));
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

// ---------------------------------------------------------------- shared chart
const CHART4 = { x0: 860, pitch: 132, bw: 86, base: 860, scale: 172 }; // px per 1 percentage point

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

// ---------------------------------------------------------------- Scene 4: September's update
const S4_STREAM = (() => {
  const rnd = mulberry32(404);
  return Array.from({ length: 18 }, (_, i) => ({
    t0: -0.6 + i * 0.24, y: 560 + rnd() * 220, sale: [2, 5, 8, 10, 13, 16].includes(i),
  }));
})();

function scene4(ctx, t, T) {
  const cam = { x: Math.sin(T * 0.4) * 16 - t * 6, y: Math.cos(T * 0.3) * 8, z: 1.02 + 0.03 * smooth(t / 4), fx: 960, fy: 640 };
  const robot = { x: 420, y: 860, s: 1.2 };
  const rc = { x: robot.x, y: robot.y - 150 * robot.s };
  const up = prog(t, 0.2, 1.4);
  const powered = smooth(prog(t, 0.6, 1.4));
  const sepK = prog(t, 1.5, 2.4);
  const sepTop = { x: CHART4.x0 + 6 * CHART4.pitch + CHART4.bw / 2, y: CHART4.base - DATA.months[6].rate * CHART4.scale };

  withLayer(ctx, cam, 0.15, () => {
    backdrop(ctx, 520, 600, C.violet, 1100, 0.7);
    glow(ctx, sepTop.x, sepTop.y + 120, 520, C.amber, 0.12 + 0.12 * smooth(sepK));
    ctx.strokeStyle = hexA(C.iris, 0.12);
    ctx.lineWidth = 3;
    for (let i = 1; i <= 5; i++) { circle(ctx, 420, 690, 140 * i + (T * 12) % 140); ctx.stroke(); }
  });
  withLayer(ctx, cam, 0.35, () => drawParticles(ctx, STARS, T, '#D7D0FF', 0.7));

  // chart (mid layer)
  withLayer(ctx, cam, 0.7, () => {
    ctx.save();
    ctx.strokeStyle = hexA(C.inkMuted, 0.35);
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CHART4.x0 - 50, CHART4.base); ctx.lineTo(W + 200, CHART4.base); ctx.stroke();
    ctx.restore();
    DATA.months.slice(0, 7).forEach((d, i) => {
      const x = CHART4.x0 + i * CHART4.pitch;
      let h = d.rate * CHART4.scale;
      const isSep = i === 6;
      if (isSep) h *= sepK <= 0 ? 0 : easeOutBack(sepK, 2.2);
      if (isSep) glow(ctx, x + CHART4.bw / 2, CHART4.base - h / 2, 260, C.gold, 0.35 * smooth(sepK));
      drawBar(ctx, x, CHART4.base, CHART4.bw, h,
        isSep ? C.gold : '#5B4FD6', isSep ? C.amber : '#3F35A8');
      circle(ctx, x + CHART4.bw / 2, CHART4.base, 7);
      ctx.fillStyle = isSep ? C.gold : '#5B4FD6'; ctx.fill();
    });
  });

  // stream of calls into the agent, sales fly out to September's bar
  withLayer(ctx, cam, 1.0, () => {
    let flash = 0;
    for (const b of S4_STREAM) {
      const lt = t - b.t0;
      const k = prog(lt, 0, 1.0);
      if (lt < 0) continue;
      if (k < 1) {
        const x = lerp(-80, rc.x - 40, easeIn(k) * 0.4 + k * 0.6);
        const y = lerp(b.y, rc.y, k) - Math.sin(Math.PI * k) * 40;
        drawCallBubble(ctx, x, y, 30 * (1 - 0.5 * smooth(prog(k, 0.8, 1))), { alpha: 1 - smooth(prog(k, 0.9, 1)) });
      } else if (b.sale) {
        const ck = prog(lt, 1.0, 1.9);
        flash = Math.max(flash, 1 - prog(lt, 1.0, 1.4));
        if (ck < 1) {
          const e = easeInOut(ck);
          const x = lerp(rc.x + 60, sepTop.x, e);
          const y = lerp(rc.y - 40, sepTop.y - 30, e) - Math.sin(Math.PI * e) * 220;
          drawCoin(ctx, x, y, 26 + 6 * Math.sin(Math.PI * ck), { squish: Math.cos(ck * 9) * 0.35 + 0.65 });
        }
        drawBurst(ctx, rc.x + 60, rc.y - 40, prog(lt, 1.0, 1.35), 60, C.gold, 8, b.t0 * 100);
      }
    }
    glow(ctx, rc.x, rc.y, 360, C.cyan, 0.25 * powered);
    drawRobot(ctx, robot.x, robot.y, robot.s, {
      look: 0.6, bulb: 0.6 + 0.9 * powered, chest: flash, chestBurst: flash, upgrade: up > 0 && up < 1 ? up : null,
      sx: 1 + 0.04 * Math.sin(Math.PI * up), sy: 1 + 0.05 * Math.sin(Math.PI * up),
    });
    // shimmer sparkles around the upgrade
    if (powered > 0) {
      const rnd = mulberry32(77);
      for (let i = 0; i < 9; i++) {
        const a = rnd() * Math.PI * 2, d = 170 + rnd() * 90;
        const tw = Math.sin(T * 3 + i) * 0.5 + 0.5;
        ctx.save(); ctx.globalAlpha = powered * tw * 0.9;
        starPath(ctx, rc.x + Math.cos(a) * d, rc.y + Math.sin(a) * d * 0.9, 9 + 6 * tw, 0.35, 4, 0);
        ctx.fillStyle = C.mint; ctx.fill(); ctx.restore();
      }
    }
  });
  withLayer(ctx, cam, 1.4, () => {
    ctx.save(); ctx.filter = 'blur(6px)';
    drawParticles(ctx, BOKEH.map((p) => ({ ...p, r: p.r * 4 })), T, C.cyan, 0.25);
    ctx.restore();
  });

  // screen-space labels
  DATA.months.slice(0, 7).forEach((d, i) => {
    const x = CHART4.x0 + i * CHART4.pitch + CHART4.bw / 2 - cam.x * 0.7;
    text(ctx, d.m, x, CHART4.base + 74, { size: 48, align: 'center', color: i === 6 ? C.ink : C.inkMuted, alpha: 1 });
  });
  const ta = smooth(prog(t, 1.7, 2.2));
  text(ctx, 'September: 2.37%', 860, 200, { font: FONTS.head, size: 100, alpha: ta });
  text(ctx, '1 sale in 42 calls', 864, 290, { size: 60, color: C.inkMuted, alpha: smooth(prog(t, 1.85, 2.35)) });
}

// ---------------------------------------------------------------- Scene 6: still being written
const TL6 = { x0: 760, pitch: 132, base: 880, scale: 72 };

function scene6(ctx, t, T) {
  const cam = { x: Math.sin(T * 0.4) * 12 + t * 8, y: Math.cos(T * 0.3) * 6, z: 1.0 + 0.02 * t, fx: 960, fy: 600 };
  const octX = TL6.x0 + 7 * TL6.pitch;

  withLayer(ctx, cam, 0.15, () => {
    backdrop(ctx, 470, 620, C.violet, 1000, 0.75);
    glow(ctx, octX, TL6.base - 60, 420, C.cyan, 0.16);
  });
  withLayer(ctx, cam, 0.35, () => drawParticles(ctx, STARS, T, '#D7D0FF', 0.7));

  withLayer(ctx, cam, 0.7, () => {
    // timeline: solid to OCT, dashed beyond (still being written)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.inkMuted, 0.45);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(140, TL6.base); ctx.lineTo(octX, TL6.base); ctx.stroke();
    ctx.setLineDash([2, 26]);
    ctx.lineDashOffset = -T * 40;
    ctx.lineWidth = 8;
    ctx.strokeStyle = hexA(C.cyan, 0.75);
    ctx.beginPath(); ctx.moveTo(octX + 30, TL6.base); ctx.lineTo(W + 300, TL6.base); ctx.stroke();
    ctx.restore();
    DATA.months.forEach((d, i) => {
      const x = TL6.x0 + i * TL6.pitch;
      const isOct = i === 7, isSep = i === 6;
      const h = d.rate * TL6.scale;
      const bw = 60;
      if (isOct) {
        // part month: lighter, open-topped bar with a pulsing node
        ctx.save(); ctx.globalAlpha = 0.85;
        drawBar(ctx, x - bw / 2, TL6.base, bw, h, '#7FF7EC', C.cyanDark);
        ctx.restore();
        const p = 0.5 + 0.5 * Math.sin(T * 4);
        glow(ctx, x, TL6.base, 70 + 20 * p, C.cyan, 0.5);
      } else {
        drawBar(ctx, x - bw / 2, TL6.base, bw, h, isSep ? C.gold : '#5B4FD6', isSep ? C.amber : '#3F35A8');
      }
      circle(ctx, x, TL6.base, isOct ? 13 : 8);
      ctx.fillStyle = isOct ? C.cyan : isSep ? C.gold : '#7C71E8'; ctx.fill();
    });
  });

  withLayer(ctx, cam, 1.0, () => {
    glow(ctx, 470, 700, 380, C.cyan, 0.18);
    drawRobot(ctx, 470, TL6.base, 1.15, {
      look: 0, turn: 0, bulb: 1.2, blink: t > 0.6 && t < 0.75 ? 1 : 0,
      chest: 0.25 + 0.25 * Math.sin(T * 3),
    });
  });
  withLayer(ctx, cam, 1.4, () => {
    ctx.save(); ctx.filter = 'blur(6px)';
    drawParticles(ctx, BOKEH.map((p) => ({ ...p, r: p.r * 4 })), T, C.cyan, 0.2);
    ctx.restore();
  });

  // screen-space text
  DATA.months.forEach((d, i) => {
    const x = TL6.x0 + i * TL6.pitch - cam.x * 0.7;
    text(ctx, d.m, x, TL6.base + 74, { size: 48, align: 'center', color: i === 7 ? C.ink : C.inkMuted });
  });
  const ox = octX - cam.x * 0.7;
  // callout for October with a short leader line
  ctx.save();
  ctx.strokeStyle = hexA(C.cyan, 0.8); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ox, TL6.base - DATA.months[7].rate * TL6.scale - 18); ctx.lineTo(ox, 740); ctx.stroke();
  ctx.restore();
  text(ctx, 'October so far: 1.00%', SAFE.x1 - 20, 650, { size: 56, align: 'right' });
  text(ctx, '(1–6 Oct)', SAFE.x1 - 20, 716, { size: 48, align: 'right', color: C.inkMuted });

  text(ctx, 'The Overflow Agent', W / 2, 200, { font: FONTS.head, size: 112, align: 'center' });
  text(ctx, 'March–October 2026', W / 2, 290, { size: 60, align: 'center', color: C.inkMuted });
}

// ---------------------------------------------------------------- placeholders (built after style approval)
function placeholder(label) {
  return (ctx, t, T) => {
    backdrop(ctx, W / 2, H / 2, C.violet, 900, 0.5);
    text(ctx, label, W / 2, H / 2, { size: 60, align: 'center', color: C.inkMuted });
  };
}

const SCENES = [
  { a: 0, b: 3, fn: scene1 },
  { a: 3, b: 7, fn: placeholder('Scene 2 (pending style approval)') },
  { a: 7, b: 11, fn: placeholder('Scene 3 (pending style approval)') },
  { a: 11, b: 15, fn: scene4 },
  { a: 15, b: 18, fn: placeholder('Scene 5 (pending style approval)') },
  { a: 18, b: 20, fn: scene6 },
];

function renderAt(t) {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  TEXT_LOG = [];
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
  return TEXT_LOG;
}
