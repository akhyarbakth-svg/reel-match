# Argentina 1-2 Uruguay · match reel

A 1080×1920 reel for the international friendly at La Bombonera on 13 Nov 2026. It runs 66 s at 30 fps, H.264 with an AAC soundtrack.
Scenes: intro, starting XIs with FotMob ratings, the match clock with an event feed and a takeover for each goal, a half-time card, full-time stats, "possession vs result", player of the match, and the final score.

Data comes from FotMob (Opta): FotMob match 6462728. It covers goals, cards, subs, lineups, ratings and team stats per half.
FotMob has no shot map or momentum for this friendly, so this reel doesn't use the xG surface from the Chelsea reel.
Flags and the soundtrack (beat, whistles, goal roars) are generated in code. No third-party assets are used.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/6462728   # -> match_data.json + data.js
NODE_PATH=$(npm root -g) node shot.js prev 3 8.5 20 45        # preview frames at given seconds
NODE_PATH=$(npm root -g) node render.js frames 4 Argentina_1-2_Uruguay_Reel.mp4
```

`render.js` needs Playwright (Chromium), Python with numpy (for `gen_audio.py`), and ffmpeg.
`index.html` is deterministic: `frame(f)` draws frame `f`.
