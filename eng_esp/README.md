# England 2-3 Spain · match replay reel

Game State 1080×1920 reel for England v Spain (UEFA Nations League A, Group 3, matchday 1, 26 Sep 2026, Wembley). Spain came from behind to win 3-2. It uses the same three.js xG surface as the Chelsea reel in the repo root: spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta), match 5181850: 28 shots, momentum, cards and team stats.

- Goals: Yamal 2', Gordon 36', Kane 40', Baena 60', Oyarzabal 74'
- Big moments that didn't go in: Torres 16' (saved by Trafford), Torres 27' (wide), Kane 54' penalty (off the bar)
- FT: xG 1.74–3.12, shots 13–15, on target 5–5, possession 47–53%

## Build

```bash
python -I ../fetch_data.py https://www.fotmob.com/match/5181850 .   # -> match_data.json
python -I build_data.py                                            # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Set `CHROME` to use a Chromium binary other than Playwright's own.

```bash
python -I shot.py prev 100 680 1210              # preview single frames to prev/
python -I render_par.py frames 4 1235            # 4 parallel workers -> England_vs_Spain_UNL_Reel.mp4 at 30 fps
```

The page loads `../three.min.js` and `../gs_logo.png` from the repo root. Fonts: Agency FB / Bahnschrift / Consolas on Windows, with Oswald / Barlow / JetBrains Mono as fallbacks elsewhere.
