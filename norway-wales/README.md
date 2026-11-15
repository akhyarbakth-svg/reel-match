# Norway 3-1 Wales · match replay reel

Game State 1080×1920 reel for Norway v Wales (UEFA Nations League A, Group 4, MD5, 14 Nov 2026, Ullevaal Stadion, Oslo). It uses the same engine as the Chelsea v Man United reel in the repo root: a 3D xG surface in three.js where spike height is shot xG and colour is territory, with the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum, cards and team stats (FotMob match 5181869).

| | Norway | Wales |
|---|---|---|
| Goals | Nusa 59', Schjelderup 68' (ast. Haaland), Haaland 88' (P) | Brooks 79' (ast. Wilson) |
| xG | 2.45 (HT 0.39) | 0.95 (HT 0.42) |
| Shots / on target | 15 / 6 | 12 / 5 |
| Possession | 55% | 45% |

Beats: Daniel James wide at 18', the four goals, and Darlow saving from Haaland (0.34 xG) at 90+3.
Both sides wear red, so Norway is red/navy/white (the flag) and Wales is dragon green with a red trim line.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181869   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and ffmpeg (`imageio_ffmpeg` if installed, otherwise `ffmpeg` on PATH). The page loads `../three.min.js` and `../gs_logo.png` from the repo root.
Agency FB, Bahnschrift and Consolas are used where installed (Windows); otherwise the bundled Barlow Condensed / Barlow Semi Condensed (`fonts/`, SIL OFL) and JetBrains Mono stand in.

```bash
python -I shot.py prev 60 514 912 1140              # preview single frames to prev/
python -I render_par.py frames 4 1146               # 4 parallel workers -> Norway_vs_Wales_UNL_Reel.mp4 at 30 fps
```
