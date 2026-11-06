# Chelsea 2-0 Man United · match replay reel

Other reels: [Slavia Prague 1-2 Arsenal (UCL MD4)](sla_ars/README.md)

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
