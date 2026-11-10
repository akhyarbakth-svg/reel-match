# Atlético Madrid 1-2 Barcelona · match replay reel

Game State 1080×1920 reel for Atlético Madrid v Barcelona (LaLiga MD12, 8 Nov 2026, Metropolitano): a 3D xG surface in three.js where spike height is shot xG and colour is territory (Atlético rojiblanco stripes vs Barça blaugrana). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runs 34.7 s (1042 frames at 30 fps).

Story: Giuliano Simeone 9' (0.66 xG), Joan García saves Baena's 0.58 chance at 38', then a Fermín López brace (45', 66') turns it round.

Data comes from FotMob (Opta): the shot map, momentum, goals, cards, VAR calls and team stats. Crests from football-logos.cc.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868121   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Set `CHROMIUM=/path/to/chrome` to use a specific Chromium binary.

```bash
python -I shot.py prev 60 140 365 445 665 1035      # preview single frames to prev/
python -I render_par.py frames 5 1042               # 5 parallel workers -> MP4 at 30 fps (optional 4th arg: output path)
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
