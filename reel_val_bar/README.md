# Valencia 0-5 Barcelona · match replay reel

Game State 1080×1920 reel for Valencia v Barcelona (LaLiga MD4, Sun 6 Sep 2026, Estadio de Mestalla). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG and colour is territory (Barça blaugrana, Valencia orange and black). It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob match 5868049 (Opta): the shot map, momentum, VAR call and team stats. Goals: Yamal 6', Fermín López 22', Raphinha 50', Pedri 79', Yamal 84'. Other beats: Yamal's 8' goal ruled out for offside, Danjuma's miss at 32', Rodri hitting the post at 56', Dimitrievski saving from Gordon at 58'.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868049   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render (Node Playwright + ffmpeg from `pip install imageio-ffmpeg`)

```bash
node shot.js prev 145 630 1250                 # preview single frames
node render.js frames 4 Valencia_vs_Barcelona_LaLiga_MD4_Reel.mp4   # 4 workers -> MP4 at 30 fps
```

The page shares `../three.min.js` and `../gs_logo.png`. Agency FB, Bahnschrift and Consolas are used when they're installed. Otherwise the open fonts in `fonts/` (Oswald, Barlow Semi Condensed, JetBrains Mono, SIL OFL) stand in.
