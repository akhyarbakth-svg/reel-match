# Real Madrid 2-1 Celta Vigo · match replay reel

Game State 1080×1920 reel for Real Madrid v Celta Vigo (LaLiga MD13, 21 Nov 2026, Estadio Bernabéu): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Story beats: Durán 6' (0–1), Bernardo's 0.53 header wide 14', Mbappé's penalty over the bar 39', Bellingham 66' (1–1), Radu blocks Espí's header and Espí scores the rebound 85' (2–1), Radu denies Endrick 89'.

Data comes from FotMob (Opta): the shot map, momentum, cards and team stats. The live xG counter treats Espí's header and rebound as one chance, the same way FotMob's official total does (3.76–1.51).

Previous reel (Chelsea 2-0 Man United) is in git history at commit `c8816f8`.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868139   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. If Playwright's own Chromium isn't installed, set `CHROME_PATH` to a Chromium binary.

```bash
python -I shot.py prev 60 135 420 850 1150          # preview single frames to prev/
python -I render_par.py frames 4 1170               # 4 parallel workers -> Real_Madrid_vs_Celta_LaLiga_MD13_Reel.mp4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser. It's set in Agency FB, Bahnschrift and Consolas. Where those are missing, it falls back to Barlow Condensed, Barlow and JetBrains Mono from `fonts/` (SIL OFL).
