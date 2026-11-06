# Slavia Prague 1-2 Arsenal · match replay reel

Game State 1080×1920 reel for Slavia Prague v Arsenal (UEFA Champions League league phase MD4, 4 Nov 2026, Fortuna Arena, Prague). It runs 36.5 s (1094 frames at 30 fps) and has no audio. It uses the same template as the Chelsea v Man United reel in the repo root: a 3D xG surface in three.js where spike height is shot xG and colour is territory, plus the scoreboard, the momentum timeline and the full-time stats.

Both clubs play in red, so Slavia take the white half of their red-and-white shirt: silver-white territory with a thin red trim. Arsenal are red with a thin cannon-gold trim.

Data comes from FotMob (Opta, match 6106389): the shot map, momentum, events and team stats. FotMob's per-shot xG sums to its official totals (HT 0.11–1.28, FT 2.11–1.49).

Beats:
- Madueke 9' from 0.21 xG (0–1)
- Merino wide 24' (0.30)
- Merino saved by Domchak 27' (0.22)
- Gyökeres 38' from 0.05 xG (0–2)
- Nowak 90' from 0.97 xG (1–2)

The clock runs to 90+6, because five minutes were added and Konečný's last shot came in the 96th minute.

Crests are from https://football-logos.cc. The fonts are Bahnschrift, Agency FB and Consolas, as in the original reel. Where those Windows fonts are missing, the bundled Barlow and Barlow Condensed (`fonts/`, SIL OFL) and JetBrains Mono stand in.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106389   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and ffmpeg (`imageio_ffmpeg` if it's installed, otherwise ffmpeg on PATH). `three.min.js` and `gs_logo.png` are shared from the repo root. Set `CHROMIUM_PATH` to use a specific Chromium binary.

```bash
python -I shot.py prev 160 450 860 1010       # preview single frames to prev/
python -I render_par.py frames 4 1094         # 4 parallel workers -> Slavia_Prague_vs_Arsenal_UCL_Reel.mp4 at 30 fps
```
