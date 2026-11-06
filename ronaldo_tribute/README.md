# Obrigado, Cristiano: Portugal tribute reel

This is a 50-second Game State reel in 1080×1920 at 30 fps, made for YouTube Shorts. It covers Cristiano Ronaldo's 23-year Portugal career and marks his international retirement, announced on 5 Nov 2026. The video has no audio, so you can add a track from YouTube's audio library when you upload.

| # | Time | Scene | Content |
|---|------|-------|---------|
| Hook | 0–5.2s | "He said goodbye to Portugal." | Name reveal, "23 years · one shirt · Nº7" |
| 01 | 5.2–10.6s | The beginning | Debut on 20.08.2003 vs Kazakhstan, aged 18. Inset photo of his first World Cup goal (vs Iran, 2006) |
| 02 | 10.6–18s | The goals | **146** goals. 10 hat-tricks · 45 assists · 0.62 goals per game |
| 03 | 18–24s | The caps | **234** caps, with a dot grid that fills as the count rises. Video of Ronaldo at the 2022 World Cup press conference |
| 04 | 24–32.6s | The silverware | Euro 2016 · Nations League 2019 · Nations League 2025 |
| 05 | 32.6–40.6s | The records | Scored at 6 World Cups · 14 Euro goals · 11 World Cup goals |
| 06 | 40.6–45.6s | The last dance | Aged 41: penalty vs Croatia, World Cup 2026 round of 32 |
| Outro | 45.6–50s | Obrigado, Cristiano. | 234 / 146 / 3, Game State subscribe card |

## Output

`Ronaldo_Portugal_Tribute.mp4` (about 37 MB) is the finished render.

## Render

This needs Node with Playwright (Chromium) and ffmpeg.

```bash
node shot.js prev 120 500 880          # preview single frames into prev/
node render.js frames 4 Ronaldo_Portugal_Tribute.mp4   # 4 parallel workers -> MP4
```

`index.html` draws the same image for a given frame number every time: `frame(f)` draws frame `f` and seeks the video clip to match. Fonts (Anton, Inter, JetBrains Mono, Instrument Serif; all under the OFL) are bundled in `fonts/`, so the render looks the same on Windows and Linux.

## Stats (as of 5 Nov 2026)

- 234 caps, 146 goals, first cap 20 Aug 2003 vs Kazakhstan, last cap 24 Sep 2026 vs Wales. Source: Wikipedia, *Portugal national football team records and statistics*, and retirement coverage from 5 Nov 2026.
- 10 hat-tricks, 11 World Cup goals, 14 Euro goals (the all-time Euro record). Source: Wikipedia records page.
- He scored at 6 World Cups (2006–2026); his brace vs Uzbekistan on 23 Jun 2026 made him the first player ever to do it. Source: AP and Flashscore.
- Penalty vs Croatia (2–1, 2 Jul 2026, round of 32). He is the oldest scorer in a World Cup knockout match. Source: ESPN and Bleacher Report.
- Titles: Euro 2016 (1–0 aet vs France), Nations League 2019 (1–0 vs Netherlands), Nations League 2025 (2–2 vs Spain, 5–3 on penalties).
- **45 assists** comes from Sofascore only. Assist counts for national teams vary between data providers. To change it, edit `data-count="45"` in `index.html` and re-render.

## Media credits

Paste this into the YouTube description. Every image and clip comes from Wikimedia Commons under a Creative Commons licence, and attribution is required.

```
Photos & video via Wikimedia Commons:
• "Cristiano Ronaldo Croatia v Portugal 2 July 2026" (-075, -086, -070) – Bryan Berlin, CC BY-SA 4.0
• "Cristiano Ronaldo - Croatia vs. Portugal, 10th June 2013 cropped" – Fanny Schertzer, CC BY-SA 3.0
• "FIFA World Cup 2006, Iran 0-2 Portugal (10)" – Mahdi Zare / Mehr News, CC BY 4.0
• "Cristiano Ronaldo 0895" – YantsImages, CC BY-SA 4.0
• "1 cristiano ronaldo 2016" – Chensiyuan, CC BY-SA 4.0
• "Уругвай Португалия ЧМ 2018 Сочи" – Aleksandr Veprev, CC BY-SA 4.0
• Video: "Ronaldo tem 'feeling' de que Portugal pode ser campeão" – Agência LUSA, CC BY 3.0
Images were cropped, colour-graded and animated. This video is shared under CC BY-SA 4.0.
```

The CC BY-SA ShareAlike terms apply to the edited photos, which is why the credit block puts the reel itself under CC BY-SA 4.0. That doesn't stop you uploading or monetising it on YouTube.
