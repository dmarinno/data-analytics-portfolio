"""Synthesises the soundtrack from code: an original ambient bed plus SFX.

No samples are used. Sound effects are placed from out/meta.json, which the renderer
exports from the same timeline as the visuals (node render.mjs meta).

Usage: python3 audio/build_audio.py out/meta.json out/audio_raw.wav
Loudness is set afterwards with ffmpeg (see render_all.sh).
"""
import json
import sys
import wave

import numpy as np

SR = 48000
DUR = 20.0
N = int(SR * DUR)  # exactly 960,000 samples
rng = np.random.default_rng(2026)
t_all = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ------------------------------------------------------------------ tempo map
# Scene changes (3, 7, 11, 15, 18 s) all land on beats: 100 BPM for 3 s = 5 beats,
# 105 BPM for 12 s = 21 beats, 100 BPM for 3 s = 5 beats, 105 BPM to the end.
SEGMENTS = [(0, 3, 100), (3, 15, 105), (15, 18, 100), (18, 20, 105)]


def beat_times():
    out = []
    for a, b, bpm in SEGMENTS:
        step = 60 / bpm
        x = a
        while x < b - 1e-6:
            out.append((x, step))
            x += step
    return out


BEATS = beat_times()

# ------------------------------------------------------------------ chords per scene
CHORDS = [
    (0.0, 3.0, [50, 57, 61, 64, 66]),   # Dmaj9
    (3.0, 7.0, [47, 54, 57, 61, 62]),   # Bm9
    (7.0, 11.0, [43, 50, 54, 57, 59]),  # Gmaj7(9)
    (11.0, 15.0, [45, 52, 54, 59, 61]), # A6/9
    (15.0, 18.0, [50, 57, 64, 66, 73]), # Dmaj9, open voicing
    (18.0, 19.0, [43, 50, 59, 66]),     # Gmaj7
    (19.0, 20.0, [50, 57, 62, 66]),     # D (resolve)
]


def env_window(a, b, fade=0.45):
    """Smooth gate from a to b with raised-cosine fades (overlapping crossfades)."""
    e = np.zeros(N)
    i0, i1 = int(max(0, a - fade / 2) * SR), int(min(DUR, b + fade / 2) * SR)
    seg = t_all[i0:i1]
    up = np.clip((seg - (a - fade / 2)) / fade, 0, 1)
    dn = np.clip(((b + fade / 2) - seg) / fade, 0, 1)
    e[i0:i1] = (0.5 - 0.5 * np.cos(np.pi * up)) * (0.5 - 0.5 * np.cos(np.pi * dn))
    return e


def pad():
    L = np.zeros(N)
    R = np.zeros(N)
    for a, b, notes in CHORDS:
        e = env_window(a, b, 0.6 if a > 0 else 0.01)
        for n in notes:
            f = midi(n)
            for det, pan in ((-0.07, 0.3), (0.0, 0.5), (0.07, 0.7)):
                ff = f * 2 ** (det / 12)
                ph = rng.uniform(0, 2 * np.pi)
                v = np.zeros(N)
                for h in range(1, 7):  # soft, filtered-saw-like
                    v += np.sin(2 * np.pi * ff * h * t_all + ph * h) / h ** 1.8
                v *= e
                L += v * (1 - pan)
                R += v * pan
    # gentle swell of the whole bed with the story
    lvl = np.interp(t_all, [0, 3, 7, 11, 15, 16.75, 18, 20], [0.55, 0.7, 0.8, 0.9, 1.0, 1.0, 0.85, 0.8])
    return L * lvl, R * lvl


def pluck(f, dur=0.6, bright=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    v = (np.sin(2 * np.pi * f * tt) + 0.35 * bright * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 9)
         + 0.12 * bright * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 14))
    att = np.clip(tt / 0.004, 0, 1)
    return v * att * np.exp(-tt * 6.5)


def add(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= N:
        return
    j = min(N, i + len(x))
    buf[i:j] += x[: j - i] * gain


def chord_at(t):
    for a, b, notes in CHORDS:
        if a <= t < b:
            return notes
    return CHORDS[-1][2]


def arp():
    L = np.zeros(N)
    R = np.zeros(N)
    pattern = [0, 2, 1, 3, 2, 4, 3, 1]
    k = 0
    for bt, step in BEATS:
        subs = 1 if bt < 3 else 2  # quarters in scene 1, eighths after
        for s in range(subs):
            t0 = bt + s * step / subs
            if t0 >= 19.4:
                continue
            notes = chord_at(t0 + 0.01)
            n = notes[pattern[k % len(pattern)] % len(notes)] + 12
            k += 1
            g = 0.16 if t0 < 3 else 0.2
            pan = 0.35 if k % 2 else 0.65
            p = pluck(midi(n), 0.7, 0.8)
            add(L, p, t0, g * (1 - pan) * 2)
            add(R, p, t0, g * pan * 2)
    return L, R


def kick():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 48 + 70 * np.exp(-tt * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 11) * np.clip(tt / 0.003, 0, 1)


def shaker():
    n = int(0.06 * SR)
    tt = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n + 1))  # crude high-pass
    return x * np.exp(-tt * 70) * 0.25


def pulse():
    b = np.zeros(N)
    K = kick()
    for bt, step in BEATS:
        if 3.0 <= bt < 18.0:
            g = 0.32 if bt < 7 else 0.4
            add(b, K, bt, g)
            add(b, shaker(), bt + step / 2, 0.5)
        elif bt >= 18.0 and bt < 19.0:
            add(b, K, bt, 0.25)
    return b


# ------------------------------------------------------------------ SFX
def tone_env(n, attack=0.005, decay=8.0):
    tt = np.arange(n) / SR
    return tt, np.clip(tt / attack, 0, 1) * np.exp(-tt * decay)


def sfx_ring():
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    trem = (np.sin(2 * np.pi * 18 * tt) > 0).astype(float) * 0.5 + 0.5
    v = (np.sin(2 * np.pi * 1320 * tt) + 0.7 * np.sin(2 * np.pi * 1650 * tt)) * trem
    e = np.clip(tt / 0.02, 0, 1) * np.clip((0.5 - tt) / 0.08, 0, 1)
    return v * e * 0.18


def sfx_pop():
    n = int(0.18 * SR)
    tt, e = tone_env(n, 0.002, 22)
    f = 260 + 700 * (1 - np.exp(-tt * 35))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * e * 0.7


def lowpass_var(x, cut):
    """One-pole low-pass with a time-varying cutoff (Hz array)."""
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def sfx_whoosh(dur=0.6, rise=False):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    k = tt / dur
    x = rng.standard_normal(n)
    cut = 300 + (3500 * k ** 2 if rise else 2200 * np.sin(np.pi * k))
    y = lowpass_var(x, cut)
    y = lowpass_var(y, cut)
    e = np.sin(np.pi * k) ** 1.5 if not rise else (k ** 1.6) * np.clip((1 - k) / 0.08, 0, 1)
    return y * e * 1.4


def bell(f, decay=2.5, partials=((1, 1), (2.76, 0.35), (5.4, 0.12), (8.9, 0.05)), dur=1.6):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    v = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * decay * (1 + r * 0.4)) for r, a in partials)
    return v * np.clip(tt / 0.003, 0, 1)


def sfx_coin():
    a = bell(midi(83), 5, dur=0.8) * 0.35
    b = bell(midi(88), 4, dur=0.9) * 0.4
    out = np.zeros(int(1.0 * SR))
    out[: len(a)] += a
    i = int(0.075 * SR)
    out[i:i + len(b)] += b[: len(out) - i]
    return out


def sfx_chime(low=False):
    return bell(midi(74 if low else 81), 1.6, dur=2.0) * 0.45


def sfx_tick():
    n = int(0.03 * SR)
    tt, e = tone_env(n, 0.0005, 160)
    return np.sin(2 * np.pi * 2100 * tt) * e * 0.4


def sfx_fix(hi=False):
    n = int(0.12 * SR)
    tt, e = tone_env(n, 0.0005, 45)
    click = rng.standard_normal(n) * np.exp(-tt * 300) * 0.3
    ping = np.sin(2 * np.pi * (3400 if hi else 2600) * tt) * e * 0.35
    return click + ping


def sfx_catch():
    x = pluck(midi(76), 0.5, 1.0) * 0.35
    p = sfx_pop() * 0.4
    x[: len(p)] += p
    return x


def sfx_rise(dur=0.8):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    k = tt / dur
    f = 330 * 2 ** (k * 1.2)
    ph = 2 * np.pi * np.cumsum(f) / SR
    v = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    return v * (np.sin(np.pi * np.clip(k * 1.1, 0, 1)) ** 1.2) * 0.22


def sfx_shimmer(dur=1.0):
    n = int((dur + 0.6) * SR)
    out = np.zeros(n)
    for i in range(26):
        f = rng.uniform(2200, 6200)
        t0 = rng.uniform(0, dur)
        b = bell(f, 7, partials=((1, 1),), dur=0.5) * rng.uniform(0.04, 0.09)
        j = int(t0 * SR)
        out[j:j + len(b)] += b[: n - j]
    tt = np.arange(n) / SR
    sweep = np.sin(2 * np.pi * np.cumsum(900 + 1800 * np.clip(tt / dur, 0, 1)) / SR)
    out += sweep * np.sin(np.pi * np.clip(tt / dur, 0, 1)) * 0.06
    return out


def sfx_swell():
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    k = tt / 0.9
    v = sum(np.sin(2 * np.pi * midi(m) * tt) for m in (62, 69, 74)) / 3
    return v * np.sin(np.pi * k) ** 2 * 0.22


def sfx_hit():
    n = int(2.2 * SR)
    tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(42 + 40 * np.exp(-tt * 12)) / SR) * np.exp(-tt * 2.5)
    chord = sum(np.sin(2 * np.pi * midi(m) * tt) / (1 + i) for i, m in enumerate((50, 57, 62, 66, 69)))
    chord *= np.clip(tt / 0.01, 0, 1) * np.exp(-tt * 1.6)
    bl = bell(midi(86), 2.2, dur=2.2) * 0.25
    return sub * 0.8 + chord * 0.35 + bl[:n]


def build_sfx(cues):
    b = np.zeros(N)
    for c in cues:
        k, t0, g = c["kind"], c["t"], c.get("gain", 1.0)
        if k == "ring":
            x = sfx_ring()
        elif k == "pop":
            x = sfx_pop()
        elif k == "whoosh":
            x = sfx_whoosh(c.get("dur", 0.6), c.get("rise", False)) * 0.25
        elif k == "catch":
            x = sfx_catch()
        elif k == "swell":
            x = sfx_swell()
        elif k == "tick":
            x = sfx_tick()
        elif k == "coin":
            x = sfx_coin()
        elif k == "chime":
            x = sfx_chime(c.get("low", False))
        elif k == "fix":
            x = sfx_fix(c.get("hi", False))
        elif k == "rise":
            x = sfx_rise(c.get("dur", 0.8))
        elif k == "shimmer":
            x = sfx_shimmer(c.get("dur", 1.0))
        elif k == "hit":
            x = sfx_hit()
        else:
            raise ValueError(k)
        add(b, x, t0, g)
    return b


def reverb(x, secs=1.2, decay=4.0):
    n = int(secs * SR)
    tt = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt * decay)
    ir[0] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    size = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return y


def main(meta_path, out_path):
    meta = json.load(open(meta_path))
    pl, pr = pad()
    al, ar = arp()
    pu = pulse()
    sf = build_sfx(meta["cues"])

    # simple ping-pong delay on the arp
    d = int(0.3 * SR)
    al2, ar2 = al.copy(), ar.copy()
    al2[d:] += ar[:-d] * 0.32
    ar2[2 * d:] += al[:-2 * d] * 0.22

    L = pl * 0.06 + al2 * 0.5 + pu * 0.55 + sf * 0.9
    R = pr * 0.06 + ar2 * 0.5 + pu * 0.55 + sf * 0.9
    wet_l, wet_r = reverb(L, 1.4, 3.0), reverb(R, 1.4, 3.1)
    L = L + wet_l * 0.35
    R = R + wet_r * 0.35

    # fades: 30 ms in, 0.5 s out (matches the picture fade from 19.5 s)
    fade = np.ones(N)
    fade[: int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
    i = int(19.5 * SR)
    fade[i:] = np.cos(np.linspace(0, np.pi / 2, N - i)) ** 2
    L *= fade
    R *= fade

    st = np.stack([L, R], 1)
    st /= np.max(np.abs(st)) / 0.5  # headroom; loudness is set by ffmpeg afterwards
    pcm = (st * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", out_path, pcm.shape[0], "samples")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
