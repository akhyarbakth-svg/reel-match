# Newcastle 2-2 Arsenal · match replay reel

Game State 1080×1920 reel for Newcastle United v Arsenal (Premier League MD11, 21 Nov 2026, St James' Park). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG and colour is territory (Newcastle's black-and-white stripes against Arsenal red). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta, match 5795523): the shot map, momentum and team stats.

The beats, in order:

| Minute | Event | xG |
|---|---|---|
| 6' | Madueke hits the post | 0.03 |
| 28' | Bruno Guimarães misses | 0.43 |
| 33' | **Eze scores, 0-1** | 0.49 |
| HT | xG 0.07 to 1.39 | |
| 49' | **Barnes scores, 1-1** | 0.25 |
| 62' | Willock fires over from a corner scramble (the biggest chance of the match) | 0.66 |
| 62' | **Thiaw scores from the same scramble, 2-1** | 0.29 |
| 78' | **Madueke scores Arsenal's first shot of the second half, 2-2** | 0.08 |
| FT | xG 1.71 to 1.49 · shots 12 to 13 · on target 3 to 4 · possession 34% to 66% | |

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795523   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

`three.min.js` and `gs_logo.png` are shared with the root reel (`../`).

## Preview and render

Needs Playwright for Python (Chromium). It also needs `imageio_ffmpeg`, or `ffmpeg` on PATH. Set `PW_CHROMIUM` to a Chromium binary if Playwright's own isn't installed. Paths are relative to this folder.

```bash
python -I shot.py prev 122 362 548 712 860 1100   # preview single frames to prev/
python -I render_par.py frames 5                  # 5 parallel workers -> Newcastle_vs_Arsenal_PL_Reel.mp4 at 30 fps
```

Fonts: the page uses Agency FB, Bahnschrift and Consolas (Windows). It falls back to Oswald, Barlow and Inconsolata where those are installed.
