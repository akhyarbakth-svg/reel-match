# Game State · match replay reels

1080×1920 reels in three.js. Each one shows a 3D xG surface, where spike height is shot xG and colour is territory, plus the scoreboard, a momentum timeline and the full-time stats. There's no audio. All data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats.

| Reel | Folder | FotMob |
|---|---|---|
| Chelsea 2-0 Man United · PL MD9, 31 Oct 2026 | `.` (root) | [5795498](https://www.fotmob.com/match/5795498) |
| Chelsea 1-4 Leeds United · PL MD11, 21 Nov 2026 | `che_lee/` | [5795518](https://www.fotmob.com/match/5795518) |

Shared assets live at the root: `three.min.js`, the crests (`logo_*.png`), `gs_logo.png` and `fonts/`. The fonts are Oswald and Barlow (SIL OFL), which stand in for Agency FB and Bahnschrift on machines that don't have them.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795518 che_lee   # -> che_lee/match_data.json
python -I che_lee/build_data.py                                       # -> che_lee/data.js
```

Each reel has its own `build_data.py` because the story beats (named scorers, big chances, keeper) are chosen per match.

## Preview and render

Needs Playwright for Python (Chromium) and ffmpeg (`imageio_ffmpeg` if installed, otherwise ffmpeg on PATH). Set `CHROMIUM_PATH` to use a preinstalled Chromium.

```bash
python -I shot.py che_lee/index.html prev 60 255 1110                              # preview single frames to prev/
python -I render_par.py che_lee/index.html frames 4 1239 che_lee/Chelsea_1-4_Leeds_PL_Reel.mp4   # 4 parallel workers -> MP4 at 30 fps
```

The frame count is `TOTAL` on the page; `shot.py` prints it. `index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
