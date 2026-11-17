# Germany 5-0 Netherlands · match replay reel

Game State 1080×1920 reel for Germany v Netherlands (UEFA Nations League A, Group 2, MD6, 16 Nov 2026, Olympiastadion Berlin). It uses the same three.js xG surface as the Chelsea v Man United reel. Spike height is shot xG and colour is territory: Germany is white/silver with a crest-gold trim, the Netherlands orange with a white trim. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Story beats (clock holds on each one): Malen's 0.69 xG miss (25'), Scherhant hitting the post (32'), then the five goals. Scherhant scores at 41', Wirtz at 60', Schlotterbeck heads in at 65', Wirtz scores again at 71' and Gruda at 78'. The five goals came from 0.71 xG combined.

Data comes from FotMob (Opta): the shot map, goal events, momentum and team stats. Goal minutes come from the match events, because the shot map has Gruda's goal at 77'. The live xG counter is scaled so it ends on FotMob's official 1.39 for Germany. The per-shot values add up to 1.41 because of rounding.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/matches/netherlands-vs-germany/1xhtgz   # -> match_data.json
python -I build_data.py                                                               # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. `three.min.js` and `gs_logo.png` are shared from the repo root.

```bash
python -I shot.py prev 60 236 414 1100          # preview single frames to prev/
python -I render_par.py frames 5 1182           # 5 parallel workers -> MP4 at 30 fps (39.4 s)
```

The fonts are Agency FB, Bahnschrift and Consolas, with Oswald, Barlow Semi Condensed and JetBrains Mono as fallbacks on machines without them.
