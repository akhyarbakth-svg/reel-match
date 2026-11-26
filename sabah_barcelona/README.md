# Sabah 1-4 Barcelona · match replay reel

A 1080×1920 Game State reel for Sabah v Barcelona (UEFA Champions League league phase, MD5, 25 Nov 2026, Baku). It uses the same three.js 3D xG surface as the Chelsea v Man United reel in the repo root. Spike height is shot xG and colour is territory: Sabah are pink and black, Barça are blue and garnet with a gold trim. The scoreboard, momentum timeline and full-time stats are on screen too. There's no audio. It runs 46 s at 30 fps (1,382 frames).

Story beats: Əliyev's early chance saved by Joan García (9'), Lepinjica's header off the post (27'), **Gordon 31'**, Adeyemi's miss (43'), **Gordon 51' (brace)**, Jesus's miss (54'), **Adeyemi 55'**, Jesus's 0.76 xG chance cleared off the line and then **Jesus scoring the rebound 60'**, **Mickels 63'**, Mickels's miss on the break (72'), and Adeyemi hitting the post (80').

The data comes from FotMob (Opta): the shot map with xG and location, the momentum, and the team stats (FotMob match 6106421). The live xG counter scales Barça's second half to FotMob's official 3.10. The per-shot values add up to 3.98 because they count the 60' cleared chance and its rebound separately. That way the scoreboard ends on the official 4.13.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/matches/barcelona-vs-sabah-fk/5vx6ki4t   # -> match_data.json
python -I build_data.py                                                                 # -> data.js
```

## Preview and render

You need Playwright (Chromium) and `imageio_ffmpeg`. The page loads `../three.min.js` and `../gs_logo.png` from the repo root.

```bash
python -I shot.py prev 60 350 840 1250        # preview single frames to prev/
python -I render_par.py frames 5 1382         # 5 parallel workers -> Sabah_vs_Barcelona_UCL_Reel.mp4
```

The fonts list the Windows faces first (Agency FB, Bahnschrift, Consolas). `fonts.css` bundles Barlow Condensed, Barlow and JetBrains Mono (SIL OFL) as fallbacks, so the reel renders the same on machines without the Windows faces.

Crests come from football-logos.cc.
