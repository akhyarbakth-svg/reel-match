# AEK Athens 2-3 Real Madrid · match replay reel

Game State 1080×1920 reel for AEK Athens v Real Madrid (Champions League MD4, 4 Nov 2026, Allwyn Arena, Athens): a 3D xG surface in three.js where spike height is shot xG and colour is territory. It also shows the scoreboard, the momentum timeline and the full-time stats. There's no audio. Runtime is 39.8 s (1195 frames at 30 fps).

Story beats: Koïta 12' (1-0), Bellingham 32' (1-1), Bernardo Silva's 0.55 xG miss at 45', Pilios 75' (2-1), Mbappé 78' (2-2), Valverde's 0.03 xG winner at 90+2' (2-3), and Koïta's red card at 90+5'.

Data comes from FotMob (Opta): the shot map, momentum, cards, VAR calls and team stats. The crests come from [football-logos.cc](https://football-logos.cc/).

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6106401   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Playwright (Chromium) and `imageio_ffmpeg`. Set `CHROMIUM=<path to chrome>` to use a specific Chromium build.

```bash
python -I shot.py prev 160 450 780 905 980 1100     # preview single frames to prev/
python -I render_par.py frames 4 1195               # 4 parallel workers -> AEK_vs_Real_Madrid_UCL_Reel.mp4 at 30 fps
```

`index.html` is deterministic per frame: `frame(f)` draws frame `f`. You can also open it directly in a browser. The fonts are Agency FB, Bahnschrift and Consolas, with Oswald, Barlow Semi Condensed and JetBrains Mono as fallbacks where the Windows fonts aren't installed.
