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

# Villarreal 0-6 Paris Saint-Germain · match replay reel

`reel_vil_psg/` is the same Game State 1080×1920 reel for Villarreal v PSG (Champions League league phase MD4, 3 Nov 2026, Estadio de la Cerámica). PSG were 4-0 up after 17 minutes: João Neves (9', from a corner), Désiré Doué (12'), Senny Mayulu (13') and Fabián Ruiz (17'). Ruiz added a second (50', Vitinha assist), and David Boly scored two minutes after coming off the bench (78'). At full time: xG 0.66–2.69, shots 14–22, on target 2–12, possession 29–71%. The reel runs 1160 frames (38.7 s at 30 fps) with no audio.

Data comes from FotMob match 6106326 (Opta). The crests are from [football-logos.cc](https://football-logos.cc/), scaled to 256 px. Villarreal is themed in yellow with a red trim, and PSG in royal blue with Eiffel-tower red. The camera is turned so PSG's attacking end, where all six goals were scored, is nearest the lens. Goals scored from almost the same spot (13' and 50') share one ring at full time.

`render.js` is a Node + Playwright renderer, so the render runs on Linux without Python Playwright.

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106326 reel_vil_psg   # -> reel_vil_psg/match_data.json
python -I reel_vil_psg/build_data.py                                      # -> reel_vil_psg/data.js
node render.js reel_vil_psg/index.html prev 1 x.mp4 140,345,640,1159       # preview frames as PNGs
node render.js reel_vil_psg/index.html frames 4 Villarreal_vs_PSG_UCL_MD4_Reel.mp4
```
