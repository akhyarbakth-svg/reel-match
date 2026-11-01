# Bayern München 2-2 Borussia Dortmund · match replay reel

Game State 1080×1920 reel for Bayern München v Borussia Dortmund (Bundesliga MD8, 31 Oct 2026, Allianz Arena). It's a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. It runs 39.2 s at 30 fps, with no audio.

Story: Bayern created 4.48 xG to Dortmund's 0.74 (big chances 6–0) and still drew. Beats: Saibari wide (10'), Kobel saves from Saibari (24'), Bellingham goal ruled out for offside (34'), Laimer 1–0 (38'), Kane's penalty off the bar (56'), Guirassy 1–1 (60'), Upamecano 2–1 (66'), Fábio Silva 2–2 (89').

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. FotMob's official xG nets out rebounds, so the live xG counter is scaled per half (`XGS` in `data.js`) to land on its HT (2.08–0.45) and FT (4.48–0.74) totals. Spikes and callouts use each shot's own xG.

Crests: [football-logos.cc](https://football-logos.cc/). Fallback fonts in `fonts/` (Barlow, SIL OFL) are used where Bahnschrift / Agency FB aren't installed.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5881208   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

For another match, add the team ids to `CODE` in `fetch_data.py`, set the names, beats and `END` in `build_data.py`, and update the copy, colours and crests in `index.html`.

## Preview and render

Needs Playwright (Chromium) and ffmpeg (`imageio_ffmpeg`, or `ffmpeg` on PATH). On Linux the pre-installed Chromium at `/opt/pw-browsers/chromium` is used when present (override with `CHROMIUM_PATH`).

```bash
python -I shot.py prev 60 420 1176                  # preview single frames to prev/
python -I render_par.py frames 4 out/reel.mp4        # 4 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.
