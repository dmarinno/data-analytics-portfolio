# The Overflow Agent, March to October: 20-second explainer

A deterministic motion-graphics film. Every frame is a pure function of time (`renderAt(t)` in
`src/scenes.js`) drawn on an HTML canvas, captured frame by frame with headless Chromium and encoded
with ffmpeg. All randomness is seeded, so every render is identical. The soundtrack is synthesised from code
(`audio/build_audio.py`), with no samples. Its sound effects are placed from cue times that the renderer exports
from the same timeline as the visuals.

## Re-render everything (one command)

```bash
npm install && bash render_all.sh
```

Outputs land in `out/`. The delivered copies, plus `qc_report.md`, are in `deliverables/`:

| File | What |
|---|---|
| `overflow_agent_evolution.mp4` | 1920×1080, 30 fps, 20.0 s, H.264 CRF 18 yuv420p +faststart, AAC 192 kbps, burned-in captions |
| `overflow_agent_evolution_clean.mp4` | the same film without captions |
| `narration.srt` | narration script with timings |
| `contact_sheet_1fps.png` | one frame per second |

`render_all.sh` ends by running `tools/qc_text.py`. It checks every text box in every frame for
size (at least 48 px), the 90% title-safe area and minimum time on screen (1.2 s), and lists every number shown.

### Requirements

- Node 18+, ffmpeg, and Python 3 with numpy.
- A Chromium or Chrome binary. `render.mjs` uses `$CHROME_PATH` if set, otherwise
  `/opt/pw-browsers/chromium`. On another machine, set `CHROME_PATH` to your Chrome or Chromium
  executable, or run `npx playwright install chromium`.

### Handy commands

```bash
node render.mjs stills 2.0 13.6 19.4 --out out/stills   # PNG stills at given times
node render.mjs video out/test.mp4 --captions             # picture only, with captions
open index.html#t=12.5                                    # preview a moment in a browser
```

## Where things live

| Path | Contents |
|---|---|
| `src/scenes.js` | facts (`DATA`), the six scenes, transitions, captions, sound-cue list, `renderAt` |
| `src/robot.js` | the Overflow Agent and the review-team figures (one drawing function each) |
| `src/lib.js` | palette, easing, two-tone shading, glows, grain, particles, parallax camera |
| `audio/build_audio.py` | music bed (pad, plucked arpeggio, soft pulse on a tempo map) and SFX |
| `style/` | style brief and the three approved style frames |
| `fonts/` | Nunito and Fredoka, SIL Open Font License (licence texts included) |

To change a number, edit `DATA` at the top of `src/scenes.js`. On-screen strings are written out in
the scene functions so they can be checked by eye against the brief's facts table.
