# France 2-1 Türkiye · match replay reel

Game State 1080×1920 reel for France v Türkiye (UEFA Nations League A, Group 1, MD6, 15 Nov 2026, Stade Atlantique, Bordeaux). It uses the same 3D xG surface as the Chelsea v Man United reel in the repo root. Spike height is shot xG and colour is territory: France blue with a gold trim, Türkiye red with a white trim.

Beats (FotMob / Opta):

| Min | Beat |
|---|---|
| 21' | Barcola 0.42 xG, saved by Özer |
| 35' | Yüksek 0.37 xG, saved by Maignan |
| 39' | Mbappé goal ruled out by VAR (offside) |
| 49' | **1-0** Emirhan Topçu own goal (from a corner) |
| 49' | Barcola misses from 0.86 xG |
| 53' | Arda Güler goal ruled out by VAR (offside) |
| 64' | Mbappé 0.30 xG, saved by Özer |
| 80' | **2-0** Junior Kroupi (0.15 xG, Cherki assist) |
| 90' | **2-1** Abdülkerim Bardakcı header (0.43 xG, Güler assist) |

At full time: xG 3.36–1.54, shots 23–14, on target 8–3, possession 60–40. The own goal counts on France's scoreboard. It has no spike and is left out of France's shot count, because FotMob doesn't record it as a France shot.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181799   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

`index.html` loads `../three.min.js` and `../gs_logo.png` from the repo root.

```bash
python -I shot.py prev 60 541 900                   # preview single frames to prev/
python -I render_par.py frames 5 1253               # 5 parallel workers -> France_vs_Turkiye_UNL_Reel.mp4 at 30 fps (~42 s)
```

Crests come from football-logos.cc.
