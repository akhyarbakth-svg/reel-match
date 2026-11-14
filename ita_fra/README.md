# Italy 3-1 France · match replay reel

A Game State reel at 1080×1920 for Italy v France (UEFA Nations League A, Group 1, MD5, 12 Nov 2026, San Siro, Milan). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root. Spike height is the xG of each shot and the colour shows territory. The reel also has the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum and team stats.

| Min | Moment | xG |
|---|---|---|
| 10' | **Goal**: Michael Olise (0–1) | 0.40 |
| 26' | **Goal**: Pio Esposito (1–1) | 0.20 |
| 35' | Bradley Barcola hits the post | 0.14 |
| 60' | Sebastiano Esposito sends a penalty off target | 0.79 |
| 63' | **Goal**: Davide Frattesi (2–1) | 0.17 |
| 75' | **Goal**: Pio Esposito, penalty, his second (3–1) | 0.79 |

At full time Italy led xG 2.35 to 1.63 and France led shots 18 to 11. Shots on target were 5 each, and France had 65% of the ball.

Colours come from the crests. Italy uses FIGC azzurro with a white halo. Both teams play in blue, so France uses the FFF rooster's red comb with a crest-gold halo so the two sides stay easy to tell apart.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181797   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

This needs Playwright for Node (Chromium) and `ffmpeg` on the PATH. `three.min.js` and `gs_logo.png` are shared from the repo root.

```bash
NODE_PATH=$(npm root -g) node render.cjs prev 150 800 1010   # single frames -> prev/
NODE_PATH=$(npm root -g) node render.cjs video 4             # 4 workers -> Italy_vs_France_Nations_League_Reel.mp4 (30 fps)
```

Agency FB, Bahnschrift and Consolas are used when they're installed (Windows). Otherwise the page falls back to the bundled Barlow fonts in `fonts/` (SIL OFL) and JetBrains Mono.

Crests are from football-logos.cc.
