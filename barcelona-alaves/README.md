# Barcelona 6-1 Alavés · match replay reel

A Game State reel at 1080×1920 for Barcelona v Deportivo Alavés (LaLiga MD11, 31 Oct 2026, Spotify Camp Nou). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG and colour is territory. Barça are garnet and gold, Alavés royal blue and white. The reel also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta), [match 5868115](https://www.fotmob.com/match/5868115): the shot map, momentum, cards, subs and team stats.

| | Barcelona | Alavés |
|---|---|---|
| Goals | Raphinha 8', 41' · Fermín López 23' · Lamine Yamal 45+1', 64' · Anthony Gordon 81' | Mariano Díaz 84' |
| xG | 3.26 | 0.76 |
| Shots (on target) | 13 (7) | 7 (3) |
| Possession | 77% | 23% |

The reel has a beat for each goal and three for big chances: Rebbach's miss at 11' (0.27 xG), Raphinha's miss at 34' (0.91 xG) and Sivera's save from Yamal at 35' (0.32 xG).

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868115   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

`index.html` loads `../three.min.js`, `../gs_logo.png` and `../fonts/` from the repo root. It's deterministic per frame: `frame(f)` draws frame `f`. On Windows it uses Agency FB, Bahnschrift and Consolas. Elsewhere it falls back to the bundled Barlow and Barlow Condensed (SIL OFL) and to JetBrains Mono.

You need Node with Playwright (Chromium) and ffmpeg on PATH:

```bash
python3 -m http.server 8765 --bind 127.0.0.1        # from the repo root
node barcelona-alaves/render.js frames 4 Barcelona_vs_Alaves_LaLiga_MD11_Reel.mp4
```

The output is 1,328 frames, about 44 s at 30 fps.

Both crests are FotMob's 192 px team logos. To get sharper crests in the VS lockup, swap in the 700 px versions from football-logos.cc.
