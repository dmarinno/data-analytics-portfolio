"""Writes narration.srt from the renderer's narration timings (out/meta.json)."""
import json
import sys


def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


meta = json.load(open(sys.argv[1]))
with open(sys.argv[2], "w", encoding="utf-8") as f:
    for i, c in enumerate(meta["narration"], 1):
        f.write(f"{i}\n{ts(c['a'])} --> {ts(c['b'])}\n{c['s']}\n\n")
print("wrote", sys.argv[2])
