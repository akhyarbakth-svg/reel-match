# Liverpool 0-1 Arsenal · match replay reel

Game State 1080×1920 reel for Liverpool v Arsenal (Premier League MD9, 1 Nov 2026, Anfield): a 3D xG surface in three.js where spike height is shot xG and colour is territory (Liverpool red / gold trim, Arsenal white / red trim). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runtime is 1075 frames, 35.8 s at 30 fps.

Beats: Havertz goal 16' (0.63 xG), Kerkez wide 31', Wirtz free kick off the post 39', Wirtz blocked 66', Araujo blocked 77'. Liverpool had 17 shots and none on target.

Data comes from FotMob (Opta): the shot map, momentum, cards and team stats.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795501   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Set `CHROMIUM=/path/to/chrome` to use a preinstalled browser, and `REEL_OUT` to choose the MP4 path (the default is `Liverpool_vs_Arsenal_PL_Reel.mp4` next to `index.html`).

```bash
python -I shot.py prev 60 175 400 950                # preview single frames to prev/
python -I render_par.py frames 4 1075                # 4 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser. On machines without the Windows faces (Agency FB, Bahnschrift, Consolas) it falls back to Oswald, Barlow and JetBrains Mono.

Football Logos: https://football-logos.cc/
