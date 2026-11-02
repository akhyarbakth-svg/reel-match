# Liverpool 0-1 Arsenal · match replay reel

Game State 1080×1920 reel for Liverpool v Arsenal (Premier League MD9, 1 Nov 2026, Anfield): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runtime: 34.3 s (1029 frames at 30 fps).

Beats: Havertz goal (16', 0.64 xG) · Wirtz free kick off the post (39') · Wirtz blocked (66', 0.18) · Araujo blocked (77', 0.18). Liverpool finished with 17 shots, 0 on target, 9 blocked.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. Crests are FotMob's team logos (football-logos.cc, listed in `All Football Logos.txt`, is the preferred source when its CDN can be reached).

Colours: both clubs wear red, so Liverpool keep red/white and Arsenal take their crest's navy border (brightened to royal) with the cannon gold.

## Build

```bash
python -I fetch_data.py <fotmob match url | saved .html>   # -> match_data.json (add new team ids to CODE)
python -I build_data.py                                    # -> data.js (beats, names, END clock)
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. `fonts/` holds open-licence stand-ins (Saira Extra Condensed, Barlow) used only when Agency FB / Bahnschrift / Consolas aren't installed.

```bash
python -I shot.py prev 60 544 900                                        # preview single frames to prev/
python -I render_par.py frames 4 0 Liverpool_vs_Arsenal_PL_Reel.mp4      # 4 parallel workers -> MP4 at 30 fps (0 = all frames)
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
