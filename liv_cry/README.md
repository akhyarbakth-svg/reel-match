# Liverpool 3-1 Crystal Palace · match replay reel

Game State 1080×1920 reel for Liverpool v Crystal Palace (Premier League MD34, 25 Apr 2026, Anfield). It uses the same three.js xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG and colour is territory (Liverpool red, Palace blue). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob match 4813710 (Opta): all 23 shots with xG and location, momentum, the VAR call and team stats.

| Beat | Minute | Data |
|---|---|---|
| Chris Richards heads wide from a corner | 11' | 0.62 xG |
| VAR cancels Mohamed Salah's penalty | 23' | |
| **Alexander Isak** · 1–0 | 35' | 0.43 xG |
| **Andrew Robertson** on the break · 2–0 | 40' | 0.37 xG |
| Ismaïla Sarr saved by Freddie Woodman | 71' | 0.38 xG |
| **Daniel Muñoz** · 2–1 | 71' | 0.04 xG |
| Jørgen Strand Larsen hits the post | 84' | 0.32 xG |
| **Florian Wirtz** · 3–1 | 90+6' | 0.04 xG |

At full time it shows shots 9–14, on target 3–7, xG 1.14–2.30 and possession 53–47%. The xG figure is the sum of FotMob's per-shot values. FotMob's headline team xG for Palace is 2.28. Using the per-shot sum keeps the live counters and the full-time panel in agreement.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/4813710 liv_cry   # -> liv_cry/match_data.json
python -I liv_cry/build_data.py                                        # -> liv_cry/data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg` (or `ffmpeg` on PATH).

```bash
python -I render_reel.py liv_cry prev 60 375 1150          # single frames to liv_cry/prev/
python -I render_reel.py liv_cry mp4 Liverpool_vs_Crystal_Palace_PL_Reel.mp4 4   # 4 parallel workers -> MP4 at 30 fps (1246 frames, 41.5 s)
```

Set `CHROMIUM=/path/to/chrome` to use a specific browser build.

The page loads `../three.min.js`, `../gs_logo.png` and `../fonts/`. The bundled OFL fonts (Oswald, Barlow Semi Condensed and Inconsolata) only stand in when Agency FB, Bahnschrift and Consolas aren't installed.

The crests (`logo_liv.png` and `logo_cry.png`) are FotMob's 192px team logos. For sharper crests in the VS lockup, swap in the 700px PNGs from football-logos.cc under the same filenames.
