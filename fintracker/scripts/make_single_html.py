"""Packs the web export into one self-contained HTML file (scripts and fonts inlined).

Usage: npx expo export --platform web && python3 scripts/make_single_html.py dist fintracker.html
"""
import base64, re, sys, pathlib
dist = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
html = (dist / 'index.html').read_text()
m = re.search(r'<script src="(/_expo/static/js/web/[^"]+\.js)" defer></script>', html)
js = (dist / m.group(1).lstrip('/')).read_text()
fonts = 0
for w in ['400Regular', '500Medium', '600SemiBold', '700Bold']:
    for f in (dist / 'assets/node_modules/@expo-google-fonts/outfit' / w).glob('*.ttf'):
        url = '/' + str(f.relative_to(dist))
        data = 'data:font/ttf;base64,' + base64.b64encode(f.read_bytes()).decode()
        n = js.count(url); fonts += n
        js = js.replace(url, data)
js = js.replace('</script', '<\\/script').replace('<!--', '<\\!--')
shim = ("<script>try{if(location.pathname!=='/'){history.replaceState(null,'','/'+location.hash)}}catch(e){}</script>")
html = html.replace(m.group(0), '<script>' + js + '</script>')
html = html.replace('<link rel="icon" href="/favicon.ico"/>', '')
html = html.replace('<meta httpEquiv="X-UA-Compatible" content="IE=edge" />', '')
html = html.replace('</title>', '</title>\n' + shim, 1)
out.write_text(html)
print('font refs replaced:', fonts, 'size MB:', round(len(html) / 1e6, 2))
