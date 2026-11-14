# England 2-1 Croatia · match replay reel

Game State 1080×1920 reel for England v Croatia (UEFA Nations League A, Group 3, MD5, 12 Nov 2026, Wembley). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root, where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Goals: Morgan Rogers 24' (0.81 xG), Petar Sučić 59' (from a corner, 0.57 xG) and Harry Kane 64' (pen). Big chances that didn't go in get their own beat: Kane 51' (0.37, blocked), Gvardiol 87', Budimir 90+2' and Rogers 90+4'. Full-time xG is 2.80–1.32, shots 15–13, on target 4–5 and possession 54–46%.

Data comes from FotMob (Opta), match 5181858: the shot map, momentum, cards and team stats. The per-shot xG sums to 2.74 / 1.31 against FotMob's official 2.80 / 1.32, so the running xG counter is scaled to land on the official totals. Each callout shows that shot's own xG.

Crests come from football-logos.cc. Croatia's territory is drawn as the red-and-white checkerboard.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181858   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright for Python (Chromium) and `imageio_ffmpeg`. `three.min.js` and `gs_logo.png` are shared from the repo root. Set `CHROMIUM=/path/to/chrome` to use a Chromium other than Playwright's own.

```bash
python -I render.py prev prev 232 562 640 1060          # preview single frames to prev/
python -I render.py mp4 frames 4 England_vs_Croatia_UNL_Reel.mp4   # 4 parallel workers -> MP4 at 30 fps (1179 frames, 39 s)
```

The fonts are Agency FB, Bahnschrift and Consolas. Where those aren't installed (Linux), the page falls back to Saira Condensed, Barlow and JetBrains Mono.
