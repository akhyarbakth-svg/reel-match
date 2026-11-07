# Nottingham Forest 3-1 Man City · match replay reel

Game State 1080×1920 reel for Nottingham Forest v Manchester City (Premier League MD10, 7 Nov 2026, The City Ground): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. Crests come from football-logos.cc (700×700).

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795513   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 60 544 1240                  # preview single frames to prev/
python -I render_par.py frames 5 1135 [out.mp4]     # 5 parallel workers -> MP4 at 30 fps (37.8 s)
```

Set `CHROMIUM_PATH` to use a specific Chromium binary (e.g. on Linux). `index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
