# Lens 1-9 Como · match replay reel

Game State 1080×1920 reel for RC Lens v Como 1907 (Champions League MD4, 4 Nov 2026, Stade Bollaert-Delelis). It uses the same three.js xG surface as the Chelsea v Man United reel in the repo root: spike height is shot xG, colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runtime is 1493 frames (≈50 s at 30 fps).

Data comes from FotMob (Opta): the shot map (29 shots), momentum, the VAR call and team stats.

- 10 goals. Douvikas's third (57') gets the HAT-TRICK callout.
- 16' VAR: a Lens penalty is cancelled. FotMob lists Maxence Caqueret on the event, so the callout reads "PENALTY TO LENS" and doesn't name a player.
- Two saved big chances get their own beats: Ivanović 34' (0.37 xG, saved by Butez) and Da Cunha 52' (0.42 xG, saved by Risser).
- Lens is team A (home, attacks +x) and Como is team E. The camera is turned half a turn so Como's end, where nine of the ten goals land, is nearest the viewer.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106416   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Paths resolve from this folder.

```bash
python -I shot.py prev 135 845 1490          # preview single frames to prev/
python -I render_par.py frames 5             # 5 parallel workers -> Lens_vs_Como_UCL_Reel.mp4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.

The fonts are Agency FB, Bahnschrift and Consolas (Windows). Oswald, Barlow Semi Condensed and JetBrains Mono are the fallbacks on other machines.
