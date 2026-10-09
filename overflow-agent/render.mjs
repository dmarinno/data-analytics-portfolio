// Usage:
//   node render.mjs stills 2.0 13.6 19.4 --out dir   -> PNG stills at given times
//   node render.mjs video out.mp4                     -> 600-frame silent video (H.264)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30, FRAMES = +(process.env.FRAMES || 600);

function browserPath() {
  const candidates = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);
  return candidates.find((p) => existsSync(p)); // undefined -> Playwright's own browser
}

async function open() {
  const browser = await chromium.launch({ executablePath: browserPath(), args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => { console.error('page error:', e); process.exit(1); });
  await page.goto(pathToFileURL(resolve(here, 'index.html')).href);
  await page.evaluate(() => window.ready);
  await page.evaluate((c) => { window.__captions = c; }, process.argv.includes('--captions'));
  return { browser, page };
}

async function frame(page, t) {
  const url = await page.evaluate((t) => {
    const log = renderAt(t, { captions: window.__captions });
    window.__textLog = log;
    return document.getElementById('c').toDataURL('image/png');
  }, t);
  return Buffer.from(url.split(',')[1], 'base64');
}

const [mode, ...rest] = process.argv.slice(2);
const captions = rest.includes('--captions');
const { browser, page } = await open();

if (mode === 'stills') {
  const oi = rest.indexOf('--out');
  const out = oi >= 0 ? rest[oi + 1] : 'stills';
  const times = rest.filter((a, i) => i !== oi && i !== oi + 1 && !a.startsWith('--')).map(Number);
  mkdirSync(out, { recursive: true });
  for (const t of times) {
    writeFileSync(`${out}/t${t.toFixed(2)}.png`, await frame(page, t));
    console.log('wrote', `${out}/t${t.toFixed(2)}.png`, JSON.stringify(await page.evaluate(() => window.__textLog)));
  }
} else if (mode === 'meta') {
  // sound cues + narration timings, single source of truth for audio and SRT
  const out = rest[0] || 'out/meta.json';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(await page.evaluate(() => ({ cues: soundCues(), narration: NARRATION })), null, 1));
  console.log('wrote', out);
} else if (mode === 'video') {
  const out = rest.find((a) => !a.startsWith('--')) || 'video.mp4';
  const textLog = [];
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FRAMES; f++) {
    const buf = await frame(page, f / FPS);
    textLog.push({ f, text: await page.evaluate(() => window.__textLog) });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${FRAMES}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  writeFileSync(out.replace(/\.mp4$/, '') + '.textlog.json', JSON.stringify(textLog));
  console.log('wrote', out);
}
await browser.close();
