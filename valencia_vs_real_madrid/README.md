# Valencia 0-3 Real Madrid · match replay reel

Game State 1080×1920 reel for Valencia v Real Madrid (LaLiga MD12, 7 Nov 2026, Estadio de Mestalla). It's the same three.js xG surface as the Chelsea reel: spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta), match 5868129: the shot map, momentum, cards and team stats.

| | |
|---|---|
| Goals | Valverde 28' (0.05 xG, set piece) · Güler 36' (0.32) · Mbappé 75' (0.79, Güler assist) |
| Red card | José Gayà (Valencia) 79', serious foul play |
| Beat | Endrick 90+2' (0.24) saved by Dimitrievski, his 8th save |
| FT (VAL–RMA) | xG 0.18–2.34 · shots 4–19 · on target 2–11 · possession 32–68% |

Team A in the scene is Real Madrid (attacking the end nearest the camera); team E is Valencia. The scoreboard, the VS lockup and the stats table put the home side (Valencia) first. The scene shares `../three.min.js` and `../gs_logo.png` with the root reel. The crests (`logo_val.png`, `logo_rma.png`) are FotMob's team logos.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/matches/real-madrid-vs-valencia/2ycigb   # -> match_data.json
python -I build_data.py                                                               # -> data.js
```

## Preview and render

Needs Playwright for Python (Chromium) and either `imageio_ffmpeg` or `ffmpeg` on PATH. Paths are relative to this folder.

```bash
python -I shot.py prev 60 245 665 1010            # preview single frames to prev/
python -I render_par.py frames 5                  # 5 parallel workers -> Valencia_vs_Real_Madrid_LaLiga_MD12_Reel.mp4 (30 fps, 1091 frames, ~36 s)
```

The fonts are Bahnschrift, Agency FB and Consolas on Windows. Where those are missing, Inter, Oswald and JetBrains Mono stand in.
