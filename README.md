# Man United 4-4 Aston Villa · match replay reel

Game State 1080×1920 reel for Manchester United v Aston Villa (Premier League MD10, 8 Nov 2026, Old Trafford). The main view is a 3D xG surface in three.js: spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. The story it tells: Villa lead 2–0 after four minutes, United level by half-time, Villa go 4–2 up by the 53rd, and Zirkzee (90+2) and Dorgu (90+6) rescue a point.

The previous reel in this repo (Chelsea 2-0 Man United, MD9) is in commit `1305a8b`.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795512   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

`build_data.py` holds the match-specific choices. These are the display names, the big chances that get their own beat (Mbeumo's 59' save and Mount's 89' post), and the clock end (`END`, 90+7). The insight ticker copy is in `index.html` (`insight()`).

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. If Playwright's bundled browser isn't installed, point `CHROMIUM` at a Chromium binary (for example `CHROMIUM=/opt/pw-browsers/chromium`).

```bash
python -I shot.py prev 125 812 1395                 # preview single frames to prev/
python -I render_par.py frames 4 1403               # 4 parallel workers -> Man_United_vs_Aston_Villa_PL_Reel.mp4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser. The reel uses Agency FB, Bahnschrift and Consolas where they're installed (Windows). Elsewhere it falls back to Oswald and Barlow Semi Condensed, bundled in `fonts/` (SIL OFL), and to JetBrains Mono.
