# Atlético Madrid 1-2 Barcelona · match replay reel

Game State 1080×1920 reel for Atlético Madrid v Barcelona (LaLiga MD12, 8 Nov 2026, Riyadh Air Metropolitano): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. It runs 36 s (1082 frames at 30 fps).

Story beats: Pedri hits the post (7'), Simeone opens the scoring (9'), Joan García saves from Baena's 0.58 xG chance (38'), then Fermín López scores on the stroke of half-time (45') and again for the winner (66').

Data comes from FotMob (Opta): the shot map, momentum, goals, cards, VAR calls and team stats. The crests come from football-logos.cc.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868121   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. To use a specific Chromium binary, set `CHROMIUM=/path/to/chrome`.

```bash
python -I shot.py prev 60 185 485 700 1000           # preview single frames to prev/
python -I render_par.py frames 5 1082 [out.mp4]      # 5 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
