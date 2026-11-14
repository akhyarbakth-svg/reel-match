# Netherlands 7-0 Greece · match replay reel

This is a Game State reel for Netherlands v Greece (UEFA Nations League A Grp. 2, MD5, 13 Nov 2026, Johan Cruijff ArenA). It uses the same 3D xG surface as the Chelsea reel in the repo root: spike height is a shot's xG and colour is territory (Dutch orange, Greek blue). It shows:

- all seven goals: Summerville 6', Reijnders 12' 18' 33' (hat-trick), Timber 40' 59', Malen 61'
- Dumfries's 0.55 xG chance at 23', saved by Tzolakis
- Ioannidis's goal at 24', ruled out by VAR for a foul
- the full-time stats: xG 4.40–0.39, shots 17–9, on target 13–1, possession 53–47%

There's no audio.

Data comes from FotMob (Opta), match 5181833. The page reuses `../three.min.js` and `../gs_logo.png`. Crests are from football-logos.cc. Oswald (SIL OFL) is the fallback for Agency FB.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181833   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Node Playwright (Chromium) and `ffmpeg` on PATH.

```bash
node render.js preview prev 50 545 1150                          # full-size PNG frames
node render.js video Netherlands_vs_Greece_NL_Reel_180p.mp4 180 4 # 180x320 at 30 fps, 4 workers
```

Frames are captured at 1080×1920 and downscaled with Lanczos when encoding. Pass a different width to get a different size, for example `1080` gives full HD.
