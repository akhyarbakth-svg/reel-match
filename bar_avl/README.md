# Barcelona 3-0 Aston Villa · match replay reel

Game State 1080×1920 reel for Barcelona v Aston Villa (Champions League league phase MD4, 3 Nov 2026, Spotify Camp Nou): the same 3D xG surface as the Chelsea v Man United reel at the repo root. It shows Yamal 7', Raphinha 52' and 64', plus beats for Yamal's 16' miss, Suzuki's save from Fermín (67') and Goretzka's 69' post. There's no audio.

Data comes from FotMob match 6106263 (Opta): the shot map, momentum and team stats. Per-shot xG sums to FotMob's official totals (HT 0.65–0.41, FT 1.86–0.71). Crests are from football-logos.cc. `three.min.js` and `gs_logo.png` are shared from the repo root.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106263   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Paths are relative to this folder.

```bash
python -I shot.py prev 50 128 640 1000              # preview single frames to prev/
python -I render_par.py frames 4 1117               # 4 parallel workers -> Barcelona_vs_Aston_Villa_UCL_MD4_Reel.mp4 at 30 fps
```

The page keeps the Windows fonts first (Agency FB, Bahnschrift, Consolas). Oswald, Barlow Semi Condensed and JetBrains Mono are fallbacks for rendering on Linux.
