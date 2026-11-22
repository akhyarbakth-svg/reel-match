# Barcelona 3-2 Villarreal · match replay reel

Game State 1080×1920 reel for Barcelona v Villarreal (LaLiga MD13, 22 Nov 2026, Spotify Camp Nou). It uses the same 3D xG surface as the Chelsea reel: spike height is shot xG and colour is territory (Barça blaugrana stripes, Villarreal yellow). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Villarreal led 2-0 after 7 minutes from 0.10 xG (Buchanan 5', Oluwaseyi 7'). Lamine Yamal missed a VAR-awarded penalty on 23'. Barça then scored three in ten minutes: Gerard Martín 57', Fermín López 61', and a Pau Navarro own goal on 67'. Navarro was sent off for a second yellow on 90+3'. Final stats: xG 3.27–0.16, shots 30–4, possession 70–30.

Data comes from FotMob (Opta), match 5868133: the shot map, momentum, cards and team stats. The own goal has no shot xG, so its spike gets a fixed visual height (`OG_VIS` in `build_data.py`) and its tag reads "NO SHOT xG".

Crests are FotMob's team logos (192 px). `three.min.js` and `gs_logo.png` are shared from the repo root.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868133   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 60 128 330 650 812 1012 1240   # preview single frames to prev/
python -I render_par.py frames 5 1243                 # 5 parallel workers -> MP4 at 30 fps (1243 frames, 41.4 s)
```

Fonts: the page uses Agency FB, Bahnschrift and Consolas (Windows). On other systems it falls back to Oswald, Barlow and JetBrains Mono if they're installed.
