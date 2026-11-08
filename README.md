# Chelsea 2-0 Man United · match replay reel

Game State 1080×1920 reel for Chelsea v Manchester United (Premier League MD9, 31 Oct 2026, Stamford Bridge): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5795498   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`.

```bash
python -I shot.py prev 60 544 1240                  # preview single frames to prev/
python -I render_par.py frames 5 1245               # 5 parallel workers -> MP4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser.

---

# Inter Miami 3-3 Charlotte FC · match replay reel (`mia_clt/`)

The same Game State 1080×1920 reel for Inter Miami CF v Charlotte FC (MLS, 7 Nov 2026, Nu Stadium). Miami led 3-0 at half-time (Fray 14', Suárez 33', De Paul 42'). Charlotte came back to 3-3 through Abada (50', 55') and Aloko (90'). It's silent.

The data comes from FotMob (Opta) match 5071488: the shot map, momentum and team stats. Miami is pink and Charlotte is blue. Smalls's post (90'), Messi's post (90+2') and Aloko's miss (90+5') each get their own beat. The camera swings round to the other end during the half-time hold, so Charlotte's second-half comeback plays out at the near end.

The folder reuses `three.min.js` and `gs_logo.png` from the repo root. The crests come from football-logos.cc. When Bahnschrift, Agency FB and Consolas aren't installed, the fonts fall back to Barlow, Barlow Condensed and JetBrains Mono.

```bash
python -I mia_clt/fetch_data.py https://www.fotmob.com/match/5071488   # -> mia_clt/match_data.json
python -I mia_clt/build_data.py                                       # -> mia_clt/data.js
```

To render it, point `URL` in `render_par.py` (or `shot.py`) at `mia_clt/index.html`. The reel runs to 1322 frames (44 s at 30 fps).
