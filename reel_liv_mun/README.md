# Liverpool 4-0 Man United · match replay reel

Game State 1080×1920 reel for Liverpool v Manchester United (Premier League MD11, 22 Nov 2026, Anfield). It uses the same 3D xG surface as the Chelsea v United reel in the repo root: spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Both clubs play in red, so United lead with the devil gold from their crest, and Liverpool keep red with a white trim.

Beats: Isak denied by Lammens (6'), Yoro's red card (8'), Szoboszlai free kick (10'), Wirtz (13'), Ngumoha (66'), Víctor Muñoz (82') and Bruno denied by Alisson (90+2').

Data comes from FotMob match 5795521 (Opta): the shot map, momentum, cards and team stats. Per-shot xG sums to FotMob's totals: 4.35 to 0.65 at full time and 1.64 to 0.13 at half-time.

The page loads `three.min.js`, `gs_logo.png` and `logo_mun.png` from the repo root (`../`). `logo_liv.png` comes from football-logos.cc.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795521   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 128 236 700 1180               # preview single frames to prev/
python -I render_par.py frames 5 1183                 # 5 parallel workers -> Liverpool_vs_Man_United_PL_Reel.mp4 at 30 fps
```

The reel runs 1183 frames, about 39 s. Full time is at frame 991.
