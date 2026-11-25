# Man City 2-2 Napoli · match replay reel

Game State 1080×1920 reel for Manchester City v Napoli (UEFA Champions League league phase MD5, 24 Nov 2026, Etihad Stadium). It uses the same three.js xG surface as the Chelsea reel in the folder above, sharing `../three.min.js` and `../gs_logo.png`. There's no audio.

- Goals: Højlund 55' (0-1), Bouaddi 67' (1-1), Lang 76' (1-2), Cherki 86' (2-2)
- Chance beats: McTominay 7' (miss), Beukema 44' (saved by Donnarumma), Anderson 66' (0.41 xG, saved by Milinković-Savić), Gvardiol 81' (post)
- Colours: City sky blue / white. Napoli white / azzurro, because both home kits are blue and white is FotMob's clash colour for Napoli in this fixture.
- Spike height is 105 per 1.0 xG (the Chelsea reel uses 70), because every chance in this match is small.
- Fonts: the Windows faces (Agency FB, Bahnschrift, Consolas) come first, with Barlow Condensed / Barlow / JetBrains Mono as fallbacks for Linux renders.

Data comes from FotMob (Opta): the shot map, momentum, events and team stats. Crests are from FotMob's image CDN.

## Build

```bash
python -I ../fetch_data.py https://www.fotmob.com/match/6106256 .   # -> match_data.json
python -I build_data.py                                             # -> data.js
python -I ../render_par.py frames 5 1210 index.html Man_City_vs_Napoli_UCL_MD5_Reel.mp4
```
