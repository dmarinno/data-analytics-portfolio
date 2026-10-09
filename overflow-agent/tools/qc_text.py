"""Checks every text box drawn in every frame (from the renderer's text log):
size >= 48 px, inside the 90% title-safe area, on screen >= 1.2 s (36 frames),
and lists every distinct number shown so it can be ticked against the facts."""
import json
import re
import sys

SAFE = (96, 54, 1824, 1026)
log = json.load(open(sys.argv[1]))
problems, runs, numbers = [], {}, {}
for fr in log:
    f = fr["f"]
    for e in fr["text"]:
        if e["px"] < 48:
            problems.append(f"frame {f}: '{e['str']}' is {e['px']} px")
        if e["x0"] < SAFE[0] - 0.5 or e["x1"] > SAFE[2] + 0.5 or e["y0"] < SAFE[1] - 0.5 or e["y1"] > SAFE[3] + 0.5:
            problems.append(f"frame {f}: '{e['str']}' outside title-safe ({e['x0']:.0f},{e['y0']:.0f})-({e['x1']:.0f},{e['y1']:.0f})")
        r = runs.setdefault(e["id"], [])
        if r and r[-1][1] == f - 1:
            r[-1][1] = f
        else:
            r.append([f, f])
        if e["alpha"] > 0.95:
            numbers.setdefault(e["str"], 0)
            numbers[e["str"]] += 1
for k, r in runs.items():
    for a, b in r:
        if b - a + 1 < 36:
            problems.append(f"'{k}' visible only {b - a + 1} frames ({a}-{b})")
# de-duplicate the per-frame messages
seen, out = set(), []
for p in problems:
    key = re.sub(r"frame \d+: ", "", p)
    if key not in seen:
        seen.add(key)
        out.append(p)
print("QC text problems:", len(out))
for p in out:
    print("  -", p)
print("\nFully opaque strings containing digits (frames shown):")
for s, n in sorted(numbers.items()):
    if re.search(r"\d", s):
        print(f"  {n:4d}  {s}")
sys.exit(1 if out else 0)
