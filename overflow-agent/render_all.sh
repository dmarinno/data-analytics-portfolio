#!/usr/bin/env bash
# Re-renders every deliverable into ./out:  bash render_all.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
node render.mjs meta out/meta.json
python3 -I audio/build_audio.py out/meta.json out/audio_raw.wav
# master: high-pass, +7.2 dB, peak limiter -> about -18 LUFS integrated, true peak below -1 dBFS
ffmpeg -v error -y -i out/audio_raw.wav \
  -af "highpass=f=35,volume=7.2dB,alimiter=limit=0.8:attack=3:release=60:level=false" \
  -c:a pcm_s24le out/audio_master.wav
python3 -I tools/make_srt.py out/meta.json out/narration.srt

node render.mjs video out/video_clean.mp4
node render.mjs video out/video_captions.mp4 --captions

for v in clean captions; do
  name=overflow_agent_evolution; [ "$v" = clean ] && name=overflow_agent_evolution_clean
  ffmpeg -v error -y -i out/video_$v.mp4 -i out/audio_master.wav -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k -ar 48000 -t 20 -movflags +faststart out/$name.mp4
done
# contact sheet, 1 frame per second
ffmpeg -v error -y -i out/overflow_agent_evolution.mp4 -vf "fps=1,scale=480:270,tile=5x4:padding=6:color=0x120A26" -frames:v 1 out/contact_sheet_1fps.png
python3 -I tools/qc_text.py out/video_captions.textlog.json
