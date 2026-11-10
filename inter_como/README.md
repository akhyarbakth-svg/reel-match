# Inter 2-0 Como · match replay reel

Game State 1080×1920 reel for Inter v Como (Serie A MD11, 8 Nov 2026, San Siro). It uses the same template as the Chelsea v Man United reel in the repo root: a 3D xG surface in three.js where spike height is shot xG and colour is territory (Inter cobalt/black, Como azure/navy). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta), match 5749744: all 19 shots, momentum, cards and team stats.

- **12'** Pio Esposito, assisted by Djed Spence: 1-0 (xG 0.91)
- **17'** Thuram (0.20) and Dimarco (0.17) both miss big chances
- **19'** Marcus Thuram: 2-0 (xG 0.08)
- **83'** Nico Paz hits the post, Como's best chance (0.12)
- **FT** xG 1.81–0.21 · shots 14–5 · on target 4–1 · possession 43%–57%

## Build

From the repo root:

```bash
python -I fetch_data.py https://www.fotmob.com/matches/inter-vs-como/2xaxi8 inter_como   # -> inter_como/match_data.json
python -I inter_como/build_data.py                                                      # -> inter_como/data.js
```

## Preview and render

The page loads `../three.min.js` and `../gs_logo.png` from the repo root.

```bash
python -I shot.py inter_como/index.html prev 60 160 790 1000
python -I render_par.py frames 5 1065 inter_como/index.html Inter_vs_Como_SerieA_Reel.mp4   # 1065 frames = 35.5 s at 30 fps
```

Crests: football-logos.cc (Inter, Como 1907).
