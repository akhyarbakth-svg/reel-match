# Barcelona 7-2 Racing Santander · match replay reel

A Game State reel at 1080×1920 for Barcelona v Racing Santander: LaLiga MD6, Wed 16 Sep 2026, 21:30 CEST (19:30 UTC), Spotify Camp Nou. It's the same 3D xG surface as the Chelsea v Man United reel in the repo root. Spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta), match 5868066: all 36 shots with xG and location, momentum, cards and team stats.

| | |
|---|---|
| Barcelona | Cancelo 8', Raphinha 25' (P), 42', 67' (P), Villalibre 36' (OG), Gabriel Jesus 79', Yamal 89' |
| Racing | Gueye 30', Zabiri 65' |
| Other beats | Adeyemi wide 19' (0.32 xG) · Yamal penalty saved by Agirrezabala 45' · Adeyemi miss 45+1' (0.96 xG) |
| FT | xG 6.74–1.98 · shots 30–5 · on target 9–3 · possession 69–31 |

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868066   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Uses Node Playwright (Chromium) and `ffmpeg` on PATH. `three.min.js` and `gs_logo.png` are shared from the repo root.

```bash
node render.js shot prev 60 500 960 1420                    # single frames to prev/
node render.js video Barcelona_vs_Racing_Santander_LaLiga_Reel.mp4 4   # 4 workers -> MP4 at 30 fps
```

Fonts: on Windows the page uses Bahnschrift, Agency FB and Consolas. Elsewhere it falls back to the bundled Barlow and Barlow Condensed (SIL OFL, from @fontsource) and JetBrains Mono.
