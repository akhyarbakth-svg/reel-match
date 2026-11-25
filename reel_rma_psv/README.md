# Real Madrid 5-1 PSV · match replay reel

A 1080×1920 Game State reel for Real Madrid v PSV Eindhoven (UEFA Champions League, league phase MD5, 24 Nov 2026, Santiago Bernabéu). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG, colour is territory. There's no audio.

The story the data tells: PSV led 1-0 at half-time from Perišić's 32' penalty (HT xG 0.26–1.50, Madrid had no shots on target). Then Madrid scored five in 37 minutes: Valverde 50', Bellingham 60', Mbappé 64' and 84', Vinícius 87'. Second-half xG was 4.53–0.18 and shots were 20–2.

Beats (the clock holds and a callout shows): every goal, Mbappé's 0.79 xG miss at 47', and Vinícius's 0.52 xG shot off the post at 66'. Mijnans's 3' header (0.25 xG) stays a plain spike because it lands while the intro crest lockup is still on screen.

Data comes from FotMob (Opta), match 6106243: the shot map, momentum, cards and team stats. Crests come from football-logos.cc.

## Build

```bash
python -I ../fetch_data.py https://www.fotmob.com/match/6106243 .   # -> match_data.json
python -I build_data.py                                             # -> data.js
```

## Preview and render

You need Playwright (Chromium) and `imageio_ffmpeg`. Both scripts resolve `index.html` next to themselves, so they run from anywhere. Set `CHROMIUM=/path/to/chrome` to use a specific browser binary.

```bash
python -I shot.py prev 280 520 905 1120             # preview single frames to prev/
python -I render_par.py frames 5 1236               # 5 parallel workers -> Real_Madrid_vs_PSV_UCL_Reel.mp4 at 30 fps
```

The page uses `../three.min.js` and `../gs_logo.png` from the repo root. Fonts are Bahnschrift, Agency FB and Consolas, as on Windows. Where those are missing, it falls back to Barlow, Barlow Condensed and JetBrains Mono.
