# Chelsea 2-0 Man United · match replay reel

Game State 1080×1920 reel for Chelsea v Manchester United (Premier League MD9, 31 Oct 2026, Stamford Bridge): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795498   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 60 544 1240                  # preview single frames to prev/
python -I render_par.py frames 5 1245               # 5 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.

---

# Atalanta 4-4 Inter · match replay reel (`ata_int/`)

The same Game State 1080×1920 format for Atalanta v Inter (Serie A MD12, 22 Nov 2026, New Balance Arena, Bergamo). Pio Esposito scores a hat-trick and Sučić converts a penalty to put Inter 2–4 up at 76'. De Ketelaere scores at 80' and Kessié equalises with a 90+1' penalty. The reel runs 42.6 s (1277 frames at 30 fps).

- Data: FotMob match 5749751 (Opta). It covers 31 shots, momentum and team stats. FT: xG 2.92–3.33, shots 15–16, on target 10–6, possession 41–59%.
- Per-shot xG is scaled per team and half to FotMob's official half totals, because Inter's first-half shots sum to 1.70 against an official 1.68. This keeps the live scoreboard counter and the FT panel in agreement.
- Both clubs play in nerazzurri colours, so they are separated by hue: Atalanta azure with a white halo, Inter ultramarine with a gold halo.
- The reel shares `three.min.js` and `gs_logo.png` with the root. The crests come from football-logos.cc.

```bash
python -I fetch_data.py https://www.fotmob.com/match/5749751 ata_int/match_data.json
python -I ata_int/build_data.py                                  # -> ata_int/data.js
REEL=ata_int python -I shot.py prev 60 600 1270                  # preview frames
REEL=ata_int OUT=Atalanta_vs_Inter_SerieA_Reel.mp4 python -I render_par.py frames 5 1277
```

On Windows, set the variables first (`set REEL=ata_int`), then run the command.
