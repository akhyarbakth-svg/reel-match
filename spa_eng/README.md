# Spain 2-3 England · match replay reel

This is the 1080×1920 Game State reel for Spain v England (UEFA Nations League A, Group 3, MD6, 15 Nov 2026, Metropolitano, Madrid). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root. Spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. It runs 43 s at 30 fps.

Data comes from FotMob match 5181860 (Opta): the shot map, momentum, cards and team stats. Two lines come from match reports rather than FotMob: Kane's 93rd England goal and the end of Spain's 43-game unbeaten run.

Team A is Spain (home, red/gold, attacks +x, nearest the camera). Team E is England (white/blue).

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181860   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright for Python (Chromium) and ffmpeg (`imageio_ffmpeg` or on PATH). Set `CHROME=/path/to/chrome` to use a specific Chromium binary.

```bash
python -I shot.py prev 122 412 1170          # preview single frames to prev/
python -I render_par.py frames 4             # 4 parallel workers -> Spain_vs_England_UNL_Reel.mp4
```

`index.html` loads `../three.min.js` and `../gs_logo.png` from the repo root. It is deterministic per frame: `frame(f)` draws frame `f`.
