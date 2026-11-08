# FotMob match page (__NEXT_DATA__, Opta data) -> match_data.json
# usage: python -I fetch_data.py <fotmob match url | saved .html> [HOME AWAY]  (3-letter codes, default CHE MUN)
import json,os,re,sys,urllib.request
H=os.path.dirname(os.path.abspath(__file__))
src=sys.argv[1]
if src.startswith('http'):
    req=urllib.request.Request(src,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'})
    html=urllib.request.urlopen(req,timeout=30).read().decode('utf-8')
else: html=open(src,encoding='utf-8').read()
pp=json.loads(re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',html,re.S).group(1))['props']['pageProps']
g,c=pp['general'],pp['content']
CODE={8455:'CHE',10260:'MUN',9906:'ATM',8634:'BAR'}
if len(sys.argv)>=4: CODE.update({g['homeTeam']['id']:sys.argv[2],g['awayTeam']['id']:sys.argv[3]})
tid={g['homeTeam']['id']:CODE[g['homeTeam']['id']],g['awayTeam']['id']:CODE[g['awayTeam']['id']]}
PL={q['id']:q['name'] for side in ('homeTeam','awayTeam') for grp in ('starters','subs') for q in (c.get('lineup') or {}).get(side,{}).get(grp,[])}
shots=[{'team':tid[s['teamId']],'min':s['min'],'add':s.get('minAdded'),'type':s['eventType'],'situation':s['situation'],'shotType':s['shotType'],
        'xg':round(s['expectedGoals'] or 0,4),'x':s['x'],'y':s['y'],'player':s['playerName'],'onTarget':s.get('isOnTarget'),'blocked':s.get('isBlocked'),'ownGoal':s.get('isOwnGoal'),'keeper':PL.get(s.get('keeperId'))}
       for s in c['shotmap']['shots']]
home,away=CODE[g['homeTeam']['id']],CODE[g['awayTeam']['id']]
events=[]
for e in c['matchFacts']['events']['events']:
    t=home if e.get('isHome') else away
    if e['type']=='Card': events.append({'type':'card','card':e['card'],'min':e['time'],'add':e.get('overloadTime'),'team':t,'player':e['nameStr'],'reason':(e.get('cardReason') or {}).get('defaultText')})
    elif e['type']=='VAR': events.append({'type':'var','min':e['time'],'add':e.get('overloadTime'),'team':t,'player':e['nameStr'],'decision':e['VAR']['decision']['value']})
    elif e['type']=='Goal': events.append({'type':'goal','min':e['time'],'add':e.get('overloadTime'),'team':t,'player':e['nameStr'],'ownGoal':e.get('ownGoal'),'penalty':e.get('goalDescriptionKey')=='penalty'})
    elif e['type']=='AddedTime': events.append({'type':'added','min':e['time'],'minutes':e['minutesAddedInput']})
stats={per:{r['key']:r['stats'] for grp in c['stats']['Periods'][per]['stats'] for r in grp['stats'] if r.get('stats') and r['stats'][0] is not None}
       for per in c['stats']['Periods']}
sc=pp['header']['status']['scoreStr']
out={'source':f"FotMob match {g['matchId']} (Opta data)",
     'match':f"{g['homeTeam']['name']} {sc.replace(' ','')} {g['awayTeam']['name']}, {g['leagueName']} round {g['matchRound']}, {g['matchTimeUTC']}",
     'home':home,'away':away,'shots':shots,'momentum':[[d['minute'],d['value']] for d in c['momentum']['main']['data']],'events':events,'stats':stats}
json.dump(out,open(os.path.join(H,'match_data.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1); print('wrote match_data.json:',out['match'],len(shots),'shots')
