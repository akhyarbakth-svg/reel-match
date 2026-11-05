# AEK Athens 2-3 Real Madrid · match replay reel

Game State 1080×1920 reel for AEK Athens v Real Madrid (Champions League MD4, 4 Nov 2026, Allwyn Arena, Athens): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runtime 38.5 s (1156 frames at 30 fps).

The story: Koïta puts AEK ahead (12'), Bellingham levels (32'), Bernardo Silva misses a 0.51 xG chance before half-time, Pilios restores AEK's lead on the break (75'), Mbappé equalises three minutes later (0.77 xG), Valverde wins it from 0.02 xG in the 92nd minute, and Koïta is sent off at 90+5.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. Crests come from football-logos.cc.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106401   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 60 425 740 862 1150          # preview single frames to prev/
python -I render_par.py frames 5 1156               # 5 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
