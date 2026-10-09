# QC report: overflow_agent_evolution

## Technical

| Check | Result |
|---|---|
| Resolution / frame rate | 1920×1080, 30 fps ✅ |
| Duration | 20.000 s, **600 frames** (counted with ffprobe) ✅ |
| Audio length | 20.000 s ✅ |
| Video codec | H.264 High, CRF 18, yuv420p, `+faststart` (moov before mdat) ✅ |
| Audio codec | AAC-LC 192 kbps, 48 kHz stereo ✅ |
| Loudness | −18.1 LUFS integrated, true peak −1.9 dBFS (target ≈ −18 LUFS, ≤ −1 dBFS) ✅ |
| End | picture holds 19.0–19.5 s, then fades to `#120A26`; audio fades 19.5–20.0 s ✅ |
| Deterministic | the same frames rendered twice are byte-identical (md5) ✅ |

## Text (automated, every frame, `tools/qc_text.py`)

- 0 problems: every text box is at least 48 px, inside the 90% title-safe area (96–1824 × 54–1026),
  and on screen for at least 1.2 s (36 frames). Captions are included.

## Facts (every number held on screen, checked against section 4)

| On screen | Fact | |
|---|---|---|
| MAR 12 · "from 12 Mar" | launched 12 March (part month) | ✅ |
| April: 0.40% · 1 sale in 250 calls | April 0.40% ≈ 1 in 250 | ✅ |
| June 0.65% → July 1.43% | June 0.65%, July 1.43% | ✅ |
| September: 2.37% · 1 sale in 42 calls | September 2.37% ≈ 1 in 42 | ✅ |
| 37,444 calls · 397 sales · 1.06% overall | whole period | ✅ |
| October so far: 1.00% (1–6 Oct) | October, 1–6 Oct only | ✅ |
| March–October 2026 | period | ✅ |
| Bar heights | proportional to 0.82 / 0.40 / 0.48 / 0.65 / 1.43 / 1.50 / 2.37 / 1.00 | ✅ |
| Scene 5 swirl | 1,132 call particles and 12 coins = 1.06% | ✅ |

The scene 5 counters roll up as the storyboard asks, so in-between values show for 1–2 frames each
before settling on the exact figures above. No other numbers, dates, causes or projections appear.
Tone: neutral wording. July's rise is credited to the review team's follow-up, September's to the updated agent.

## Originality

- All characters (robot, review team), props and icons are drawn in code in `src/`. Nothing is traced
  or copied from the reference clip, and it has no bird, logo, end card or reference shots.
- Fonts: Nunito and Fredoka (SIL OFL), not the reference's typeface. No company logos.
- Music and SFX are synthesised in `audio/build_audio.py`. No samples, nothing from the reference audio.

## Visual review

`contact_sheet_1fps.png` was reviewed. Issues found and fixed before delivery: coins crossing the September
subtitle, call bubbles covering the agent's face, a muddy brown in the July bar's colour change, translucent
"ghost" bubbles, and the final caption 1 frame short of 1.2 s.
