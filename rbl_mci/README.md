# RB Leipzig 2-3 Man City · match replay reel

Game State 1080×1920 reel for RB Leipzig v Manchester City (UEFA Champions League league phase MD4, 4 Nov 2026, Red Bull Arena). It uses the same template as the Chelsea v Man United reel in the repo root: a 3D xG surface in three.js where spike height is shot xG and colour is territory (Leipzig red, City sky blue), plus the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta, match 6106322): the shot map, momentum, events and team stats. FotMob's per-shot xG sums to its official totals (HT 0.35–0.50, FT 0.87–2.20).

Beats: Lukeba own goal 37' (0–1) · O'Reilly wide 40' · Baku 49' from 0.03 xG (1–1) · Haaland saved by Vandevoordt 53' · Enzo Fernández 58' (1–2) · Nusa 61' (2–2) · Haaland 78' from 0.62 xG (2–3) · Cherki off the post 84'.

The own goal has no shot xG. It counts towards the score but not towards City's xG or shot totals. Its spike is drawn at a nominal 0.30 so you can see it.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106322   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and ffmpeg (`imageio_ffmpeg` if it's installed, otherwise ffmpeg on PATH). `three.min.js` and `gs_logo.png` are shared from the repo root. Set `CHROMIUM_PATH` to use a specific Chromium binary.

```bash
python -I shot.py prev 70 305 880 1200        # preview single frames to prev/
python -I render_par.py frames 4 1229         # 4 parallel workers -> RB_Leipzig_vs_Man_City_UCL_Reel.mp4 at 30 fps
```

The fonts are Bahnschrift, Agency FB and Consolas, as in the original reel. Where those Windows fonts are missing, Barlow, Barlow Condensed and JetBrains Mono stand in.
