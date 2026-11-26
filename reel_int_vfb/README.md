# Inter 2-0 VfB Stuttgart · match replay reel

Game State 1080×1920 reel for Inter v VfB Stuttgart (Champions League league phase MD5, 25 Nov 2026, San Siro): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. It uses the same engine as the Chelsea 2-0 Man United reel in the repo root.

Data comes from FotMob (Opta), match 6106253: the shot map, momentum, cards and team stats. Crests come from football-logos.cc.

## Beats

| Clock | Beat | xG |
|---|---|---|
| 16' | Djed Spence, saved by Seimen | 0.34 |
| 43' | Nicolò Barella, off the post | 0.12 |
| 57' | **GOAL**: Petar Sučić (pen), 1-0 | 0.79 |
| 61' | Nikolas Nartey, saved by Josep Martínez | 0.36 |
| 74' | **GOAL**: Lautaro Martínez, 2-0 | 0.23 |

FT: xG 2.57–1.06 · shots 20–13 · on target 5–2 · possession 51–49%. Added time was +2 in the first half and +4 in the second, so the clock runs to 90+4 (`END=94`).

Theme: Inter has crest blue `#00239C` (brightened to lead) with blue-black stripes and a white trim line. Stuttgart has crest red `#D40723` with deep-red stripes, a crest-gold trim line and a white halo.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/matches/inter-vs-vfb-stuttgart/2yejdt   # -> match_data.json
python -I build_data.py                                                               # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Both scripts find `index.html` next to themselves.

```bash
python -I shot.py prev 60 180 545 735 1000      # preview single frames to prev/
python -I render_par.py frames 5 1072           # 5 parallel workers -> Inter_vs_Stuttgart_UCL_Reel.mp4 at 30 fps
```

The reel is 1072 frames (35.7 s). FT starts at frame 880. The beats trigger at frames 163, 358, 521, 597 and 712.
