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

# Racing Santander 0-3 Real Madrid · match replay reel

`reel_rac_rma/` is the same Game State 1080×1920 reel for Racing Santander v Real Madrid (LaLiga MD11, 1 Nov 2026, El Sardinero). Madrid were 3-0 up by the 36th minute: Mbappé (11', pen), Bellingham (21', Güler assist) and Diomande (36', a 0.03 xG chance). The reel also shows Güler's 0.32 xG chance saved by Agirrezabala, Zabiri's miss (Racing's best chance), Mbappé's shot off the post, and the 72' VAR call. FotMob logs that call against Racing with the ruling "Penalty cancelled". At full time: xG 0.97–3.36, shots 10–22, on target 1–7, possession 46–54%. It runs 1179 frames (about 39 s at 30 fps).

Data comes from FotMob match 5868118 (Opta). The crests are FotMob's 256 px team logos. The page loads the shared `three.min.js`, `gs_logo.png` and `fonts/` from the repo root. Barlow Condensed (SIL OFL, `fonts/OFL-BarlowCondensed.txt`) is the fallback for Agency FB when it isn't installed, and Inter / JetBrains Mono stand in for Bahnschrift / Consolas.

```bash
python -I fetch_data.py https://www.fotmob.com/match/5868118 reel_rac_rma   # -> reel_rac_rma/match_data.json
python -I reel_rac_rma/build_data.py                                      # -> reel_rac_rma/data.js
REEL=reel_rac_rma/index.html python -I shot.py prev 160 440 1100           # preview frames
python -I render_par.py frames 5 1179 reel_rac_rma/index.html Racing_vs_Real_Madrid_LaLiga_MD11_Reel.mp4
```
