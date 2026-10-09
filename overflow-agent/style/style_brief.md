# Style brief — "The Overflow Agent, March to October"

Derived from the reference clip (55.6 s, 1080×1920 vertical, 60 fps). It was used only to measure
the look; no frames, characters, text, fonts or audio from it are used in the film.

## What the measurements say

**Palette (k-means, 8 clusters, ~166k sampled pixels, 2 frames/s).** Share of screen area in brackets.

| Role | Hex | Notes |
|---|---|---|
| Base background | `#120728` (36%) | near-black violet-navy |
| Indigo background | `#16024A` (15%) | |
| Violet glow | `#3D1A80` (10%) | soft radial glows behind subjects |
| Bright cyan field | `#68EFF0` (23%) | used as a full light background in the reference; we keep cyan for accents only |
| Sky blue | `#3C90BC` (5%) | |
| Amber | `#E87F17` (4%) | |
| Magenta | `#F0289C` (3%) | |

**Accent pass (saturated pixels only, 8 clusters):** amber `#EA8914`, magenta `#EB2390`,
cyan `#0CF3E1`/`#38F3E5`, sky `#1E92C0`, iris `#4539C3`, pale cyan `#5DE6F3`, green `#19E047`.
Accents cover under 15% of the frame; they sit on large dark fields.

**Pacing.** Scene detection at the requested threshold (0.3) finds 5 cuts, so 6 shots averaging 9.3 s. At 0.12
it finds 7 cuts, so 8 shots averaging 6.9 s. Hard cuts are rare. Most changes happen *within* a shot (camera push,
an element popping in), roughly every 2 s judging by the 1 fps contact sheet.

## The brief

1. **Working palette** (built from the measured values):
   background `#120A26` / `#0B0620` / `#16024A`; glows `#3C1285`, `#4539C3`;
   accents cyan `#2BF4E3`, amber `#EA8914`, gold `#FFC23D`, coral `#EE5A4C`, magenta `#EB2390` (sparingly),
   mint `#3DE89B` (softened from the measured green `#19E047` per the brief's "mint"); text `#FFFFFF`, muted text `#B8B0E6`.
2. **Colour roles are fixed:** cyan = calls, gold/amber = sales and the September highlight, mint = fixes and the upgrade,
   coral = the agent's headset, iris violet = neutral chart bars and furniture.
3. **Shapes:** rounded geometric primitives only (circles, capsules, rounded rectangles), with no outlines.
4. **Two-tone shading:** every object is a light face plus a darker face of the same hue, split by a clean
   offset-silhouette edge (shade sits lower-right). Bars use a vertical split: lighter left, darker right.
5. **Highlights and shadows:** a thin, faint inner highlight on the upper-left of round objects, and a soft blurred long shadow
   pushed down-right, plus a small contact shadow on the ground.
6. **Gradients only in light:** radial glows behind subjects and on lit elements (antenna, chest light, calls, coins).
   Flat fills on every character and object.
7. **Atmosphere:** drifting star/dust particles (some 4-point sparkles), 3.5% overlay film grain that changes every frame,
   and a gentle vignette.
8. **Depth:** each scene has 4 parallax layers (background ×0.15–0.3, particles ×0.35, mid ×0.6–0.7, hero ×1.0,
   defocused foreground ×1.4), and the camera always drifts slowly.
9. **Typography:** Fredoka SemiBold for headlines, Nunito ExtraBold for labels, both under the SIL Open Font License. White on dark with a soft
   drop shadow, at least 48 px, everything inside the 90% title-safe box (96–1824 × 54–1026).
10. **Motion:** ease-in-out by default; pop-ins use a damped spring (squash-and-stretch), and chart bars use an overshoot.
    Items in a group stagger 40–80 ms apart.
11. **Transitions:** camera moves only (push-in, zoom-through into the call bubble, pull-back, match cut on the chart bars).
    No wipes.
12. **Pacing for 20 s:** 6 scenes of 2–4 s, so shorter than the reference shots (it is a 55 s piece). A new visual beat
    lands every ~1 s within each scene, which matches the reference's in-shot rhythm.
13. **Hero:** the Overflow Agent, an original round robot with a white body, navy face screen, cyan eyes and a coral headset with mic,
    an amber antenna bulb and a chest light. It is drawn by one function (`src/robot.js`), so it is identical in every scene.
14. **Charts:** one series, one muted hue (iris); only the month the scene is about gets the accent colour.
    Bars are anchored to a recessive baseline and month labels are direct; values appear as headline text.
15. **Not used:** the reference's characters and bird, its logo and end card, its fonts, its music, and its light cyan full-frame
    backgrounds.
