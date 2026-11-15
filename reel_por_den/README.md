# Portugal 1-4 Denmark · match replay reel

A 1080×1920 Game State reel for Portugal v Denmark (UEFA Nations League A, Group 4, MD5, 14 Nov 2026, Estádio Municipal de Braga). It uses the same 3D xG surface as the Chelsea reel: spike height is shot xG and colour is territory. It adds the scoreboard, momentum timeline and full-time stats. There's no audio.

Goals: Højbjerg 43' (P), Højlund 50' and 57', Andersen 75' for Denmark; Bernardo Silva 90+3' for Portugal.
Data comes from FotMob (Opta, match 5181870): the shot map, momentum and team stats. Portugal is drawn in flag green with crest gold, because both teams wear red. Denmark is red with white.

## Build

```bash
python -I fetch_data.py https://www.fotmob.com/match/5181870   # -> match_data.json
python -I build_data.py                                       # -> data.js
```

## Preview and render

Needs Python Playwright (Chromium) and ffmpeg (`imageio_ffmpeg` or `ffmpeg` on PATH). Set `CHROME=/path/to/chromium` to use a specific browser binary.

```bash
python -I shot.py prev 340 572 1150             # preview single frames
python -I render_par.py frames 4                # 4 parallel workers -> Portugal_vs_Denmark_UNL_Reel.mp4
```

The page loads `../three.min.js` and `../gs_logo.png` from the repo root. Fonts fall back to the bundled OFL Oswald and Barlow, plus JetBrains Mono, when the Windows faces (Agency FB, Bahnschrift, Consolas) are missing.
