// Shared constants, maths, easing and drawing helpers.
// Everything is a pure function of its inputs; randomness is seeded.

const W = 1920, H = 1080, FPS = 30, DURATION = 20;
const SAFE = { x0: 96, y0: 54, x1: 1824, y1: 1026 }; // 90% title-safe

// Working palette (derived from the reference analysis, see style_brief.md)
const C = {
  night: '#0B0620',   // deepest background
  navy: '#120A26',    // base background
  indigo: '#16024A',  // background mid
  violet: '#3C1285',  // glow / dim surfaces
  iris: '#4539C3',    // secondary surfaces, chart bars
  irisLight: '#6A5FE0',
  cyan: '#2BF4E3',
  cyanDark: '#12B5C4',
  sky: '#1E92C0',
  amber: '#EA8914',
  gold: '#FFC23D',
  goldDark: '#E0870F',
  coral: '#EE5A4C',
  coralDark: '#B8343A',
  magenta: '#EB2390',
  mint: '#3DE89B',
  ink: '#FFFFFF',
  inkMuted: '#B8B0E6',
};

// ---------- maths ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeIn = (k) => k * k * k;
const easeOutBack = (k, s = 1.7) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const smooth = (k) => k * k * (3 - 2 * k);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Damped spring settle used for squash-and-stretch: returns 0 at k=0, ~1 at k=1 with wobble.
function springOut(k, wobbles = 2.2, damp = 5) {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  return 1 - Math.exp(-damp * k) * Math.cos(wobbles * Math.PI * k);
}

// ---------- colour ----------
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ---------- shapes ----------
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
}

// Two-tone fill: `path` is a function that builds the path. The dark tone fills the
// shape, then the light tone is the same shape shifted up-left, clipped to the
// original, leaving a clean crescent of shade on the lower-right.
function twoTone(ctx, path, light, dark, dx = 0.12, dy = 0.12, size = 100, highlight = 0.22) {
  ctx.save();
  path(); ctx.fillStyle = dark; ctx.fill();
  path(); ctx.clip();
  ctx.translate(-dx * size, -dy * size);
  path(); ctx.fillStyle = light; ctx.fill();
  if (highlight > 0) {
    // subtle inner highlight, upper-left
    ctx.translate(-dx * size * 0.9, -dy * size * 0.9);
    ctx.globalAlpha = highlight;
    ctx.lineWidth = size * 0.06;
    ctx.strokeStyle = '#ffffff';
    path(); ctx.stroke();
  }
  ctx.restore();
}

// Soft long shadow: the silhouette, blurred and pushed down-right.
function longShadow(ctx, path, alpha = 0.35, ox = 22, oy = 26, blur = 26) {
  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.translate(ox, oy);
  path();
  ctx.fillStyle = `rgba(4,0,18,${alpha})`;
  ctx.fill();
  ctx.restore();
}

function glow(ctx, x, y, r, color, a = 0.6) {
  if (r <= 0 || a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a));
  g.addColorStop(0.35, hexA(color, a * 0.45));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------- text (screen space only) ----------
const FONTS = {
  head: (px) => `600 ${px}px Fredoka`,
  label: (px) => `800 ${px}px Nunito`,
  num: (px) => `900 ${px}px Nunito`,
};

// Records every text box drawn in a frame so the QC pass can check size + title-safe.
let TEXT_LOG = [];

function text(ctx, str, x, y, o = {}) {
  const px = o.size || 56;
  ctx.save();
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  ctx.font = (o.font || FONTS.label)(px);
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  const m = ctx.measureText(str);
  if (o.shadow !== false) {
    ctx.shadowColor = 'rgba(5,0,25,0.55)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 5;
  }
  ctx.fillStyle = o.color || C.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
  const left = o.align === 'center' ? x - m.width / 2 : o.align === 'right' ? x - m.width : x;
  if ((o.alpha == null ? 1 : o.alpha) > 0.05) {
    TEXT_LOG.push({
      str, px, x0: left, x1: left + m.width,
      y0: y - m.actualBoundingBoxAscent, y1: y + m.actualBoundingBoxDescent,
    });
  }
  return m.width;
}

// Rounded pill behind a label.
function pill(ctx, x, y, w, h, color, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ---------- icons ----------
function handsetIcon(ctx, x, y, s, color, rot = -0.6) {
  // Original receiver glyph: curved handle with two chunky rounded pads.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.2;
  ctx.beginPath();
  ctx.arc(0, s * 0.3, s * 0.46, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.translate(sx * s * 0.4, s * 0.12);
    ctx.rotate(sx * 0.55);
    rr(ctx, -s * 0.2, -s * 0.1, s * 0.4, s * 0.3, s * 0.13);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function starPath(ctx, x, y, r, inner = 0.48, n = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r * inner : r;
    const a = rot + (i * Math.PI) / n;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}

// ---------- props ----------
// Call bubble: rounded speech bubble with a handset glyph.
function drawCallBubble(ctx, x, y, r, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (r <= 0.5 || a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  glow(ctx, x, y, r * 2.6, C.cyan, 0.35 * (o.glow == null ? 1 : o.glow));
  const path = () => {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.62, Math.PI * 2.38);
    ctx.lineTo(x - r * 0.95, y + r * 1.08);
    ctx.closePath();
  };
  twoTone(ctx, path, o.light || C.cyan, o.dark || C.cyanDark, 0.1, 0.1, r * 1.6, 0.25);
  handsetIcon(ctx, x - r * 0.02, y + r * 0.06, r * 1.15, o.icon || C.indigo, -0.45);
  if (o.badge) drawFixBadge(ctx, x + r * 0.8, y - r * 0.8, r * 0.55, o.badge, o.badgeAlpha);
  ctx.restore();
}

// Small round badge with a check mark or wrench.
function drawFixBadge(ctx, x, y, r, kind, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  twoTone(ctx, () => circle(ctx, x, y, r), C.mint, '#22B477', 0.1, 0.1, r * 2, 0.2);
  ctx.strokeStyle = C.night;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = r * 0.28;
  ctx.beginPath();
  if (kind === 'check') {
    ctx.moveTo(x - r * 0.42, y + r * 0.02);
    ctx.lineTo(x - r * 0.1, y + r * 0.34);
    ctx.lineTo(x + r * 0.45, y - r * 0.3);
    ctx.stroke();
  } else {
    // wrench: shaft + open jaw
    ctx.moveTo(x - r * 0.4, y + r * 0.4);
    ctx.lineTo(x + r * 0.12, y - r * 0.12);
    ctx.stroke();
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.arc(x + r * 0.26, y - r * 0.26, r * 0.24, Math.PI * 0.95, Math.PI * 2.55);
    ctx.stroke();
  }
  ctx.restore();
}

// Gold coin with a small embossed star.
function drawCoin(ctx, x, y, r, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (r <= 0.5 || a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  glow(ctx, x, y, r * 2.8, C.gold, 0.4 * (o.glow == null ? 1 : o.glow));
  const squish = o.squish == null ? 1 : o.squish; // horizontal squish for spin
  ctx.translate(x, y);
  ctx.scale(squish, 1);
  twoTone(ctx, () => circle(ctx, 0, 0, r), C.gold, C.goldDark, 0.1, 0.1, r * 1.6, 0.3);
  ctx.globalAlpha *= 0.85;
  starPath(ctx, -r * 0.04, -r * 0.04, r * 0.48);
  ctx.fillStyle = C.goldDark;
  ctx.fill();
  starPath(ctx, -r * 0.08, -r * 0.08, r * 0.48);
  ctx.fillStyle = '#FFE08A';
  ctx.fill();
  ctx.restore();
}

// Radial burst of rounded lines (for sales / pops).
function drawBurst(ctx, x, y, k, r, color, n = 8, seed = 1) {
  if (k <= 0 || k >= 1) return;
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.globalAlpha *= 1 - smooth(k);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.4;
    const r0 = r * (0.5 + easeOut(k) * 0.9);
    const r1 = r0 + r * (0.45 * (1 - k) + 0.08);
    ctx.lineWidth = r * 0.14 * (1 - k * 0.6);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- atmosphere ----------
let NOISE = null;
function makeNoise() {
  NOISE = [];
  for (let s = 0; s < 4; s++) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 512;
    const g = cv.getContext('2d');
    const img = g.createImageData(512, 512);
    const rnd = mulberry32(1000 + s);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    NOISE.push(cv);
  }
}

function grain(ctx, frame, amount = 0.03) {
  if (!NOISE) makeNoise();
  const rnd = mulberry32(frame * 7919 + 13);
  const cv = NOISE[frame % NOISE.length];
  const ox = -Math.floor(rnd() * 512), oy = -Math.floor(rnd() * 512);
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  for (let x = ox; x < W; x += 512) for (let y = oy; y < H; y += 512) ctx.drawImage(cv, x, y);
  ctx.restore();
}

function vignette(ctx, a = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(5,0,20,0)');
  g.addColorStop(1, `rgba(5,0,20,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Seeded starfield / dust particles that drift slowly with time.
function makeParticles(n, seed, w = W * 1.4, h = H * 1.4) {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => ({
    x: rnd() * w - (w - W) / 2, y: rnd() * h - (h - H) / 2,
    r: 0.8 + rnd() * rnd() * 3.2, tw: rnd() * Math.PI * 2,
    vx: (rnd() - 0.5) * 8, vy: -2 - rnd() * 6, cross: rnd() < 0.08,
  }));
}

function drawParticles(ctx, ps, t, color = '#CFC8FF', alpha = 0.7) {
  ctx.save();
  for (const p of ps) {
    const x = p.x + p.vx * t, y = p.y + p.vy * t;
    const a = alpha * (0.45 + 0.55 * Math.sin(p.tw + t * 1.7) ** 2);
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    if (p.cross) {
      const s = p.r * 2.6;
      ctx.fillRect(x - s, y - p.r * 0.35, s * 2, p.r * 0.7);
      ctx.fillRect(x - p.r * 0.35, y - s, p.r * 0.7, s * 2);
    } else {
      circle(ctx, x, y, p.r);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Background: flat dark base + soft radial glow behind the subject.
function backdrop(ctx, gx, gy, glowColor = C.violet, glowR = 900, glowA = 0.75) {
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowR);
  g.addColorStop(0, hexA(glowColor, glowA));
  g.addColorStop(0.45, hexA(glowColor, glowA * 0.35));
  g.addColorStop(1, hexA(glowColor, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Parallax camera. depth 0 = fixed, 1 = moves fully with camera, >1 = foreground.
function withLayer(ctx, cam, depth, fn) {
  ctx.save();
  const s = 1 + (cam.z - 1) * depth;
  ctx.translate(cam.fx ?? W / 2, cam.fy ?? H / 2);
  ctx.scale(s, s);
  ctx.translate(-(cam.fx ?? W / 2) - cam.x * depth, -(cam.fy ?? H / 2) - cam.y * depth);
  fn();
  ctx.restore();
}
