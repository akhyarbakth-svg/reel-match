# Atlético Madrid 1-2 Barcelona · match replay reel

Game State 1080×1920 reel for Atlético Madrid v Barcelona (LaLiga MD12, 8 Nov 2026, Riyadh Air Metropolitano): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio, and it runs 34.7 s (1042 frames at 30 fps).

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. The crests are FotMob's team logos.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868121 ATM BAR   # or a saved match .html -> match_data.json
python -I build_data.py                                                 # -> data.js (beats, shots, momentum, END, STATS, XGS)
```

`build_data.py` is data-driven. Goals, red cards and VAR-disallowed goals become beats. So does any non-goal chance of 0.40 xG or more, and a save names the keeper. You can override this with `CHANCES` / `NAMES`. The insight ticker copy, header and team theme still live in `index.html`.

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Set `CHROMIUM=/path/to/chrome` if Playwright's bundled browser isn't installed. On Linux, the Barlow and JetBrains Mono fonts stand in for Agency FB, Bahnschrift and Consolas.

```bash
python -I shot.py prev 40 360 660 1041                          # preview single frames to prev/
python -I render_par.py frames 4 1042 Atletico_vs_Barcelona.mp4 # 4 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
