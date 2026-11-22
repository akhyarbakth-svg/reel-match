# FotMob match page (__NEXT_DATA__, Opta data) -> match_data.json
# usage: python -I fetch_data.py <fotmob match url | saved .html>
import json,os,re,sys,urllib.request
H=os.path.dirname(os.path.abspath(__file__))
src=sys.argv[1]
if src.startswith('http'):
    req=urllib.request.Request(src,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'})
    html=urllib.request.urlopen(req,timeout=30).read().decode('utf-8')
else: html=open(src,encoding='utf-8').read()
pp=json.loads(re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',html,re.S).group(1))['props']['pageProps']
g,c=pp['general'],pp['content']
CODE={8634:'BAR',10205:'VIL'}
tid={g['homeTeam']['id']:CODE[g['homeTeam']['id']],g['awayTeam']['id']:CODE[g['awayTeam']['id']]}
home,away=CODE[g['homeTeam']['id']],CODE[g['awayTeam']['id']]
# an own goal sits in the shot map under the defender's team, in that team's attacking frame: keep it there, build_data flips it
shots=[{'team':tid[s['teamId']],'min':s['min'],'add':s.get('minAdded'),'type':s['eventType'],'situation':s['situation'],'shotType':s['shotType'],
        'xg':round(s['expectedGoals'] or 0,4),'x':s['x'],'y':s['y'],'player':s['playerName'],'onTarget':s.get('isOnTarget'),'blocked':s.get('isBlocked'),'ownGoal':s.get('isOwnGoal'),
        'keeperId':s.get('keeperId')}
       for s in c['shotmap']['shots']]
events=[]
for e in c['matchFacts']['events']['events']:
    t=home if e.get('isHome') else away
    if e['type']=='Card': events.append({'type':'card','card':e['card'],'min':e['time'],'add':e.get('overloadTime'),'team':t,'player':e['nameStr'],'reason':(e.get('cardReason') or {}).get('defaultText')})
    elif e['type']=='VAR': events.append({'type':'var','min':e['time'],'team':t,'player':e['nameStr'],'decision':e['VAR']['decision']['value']})
    elif e['type']=='MissedPenalty': events.append({'type':'missedPen','min':e['time'],'team':t,'player':e['nameStr']})
    elif e['type']=='Goal': events.append({'type':'goal','min':e['time'],'add':e.get('overloadTime'),'team':t,'player':e['nameStr'],'ownGoal':bool(e.get('ownGoal')),'score':e.get('newScore'),'assist':e.get('assistStr')})
    elif e['type']=='AddedTime': events.append({'type':'added','min':e['time'],'minutes':e['minutesAddedInput']})
stats={per:{r['key']:r['stats'] for grp in c['stats']['Periods'][per]['stats'] for r in grp['stats'] if r.get('stats') and r['stats'][0] is not None}
       for per in c['stats']['Periods']}
keepers={p['id']:p['name'] for side in ('homeTeam','awayTeam') for p in c['lineup'][side].get('starters',[])+c['lineup'][side].get('subs',[]) if p.get('id')}
sc=pp['header']['status']['scoreStr']
out={'source':f"FotMob match {g['matchId']} (Opta data)",
     'match':f"{g['homeTeam']['name']} {sc.replace(' ','')} {g['awayTeam']['name']}, {g['leagueName']} round {g['matchRound']}, {g['matchTimeUTC']}",
     'venue':(lambda v:f"{v['name']} · {v['city']}" if v else None)((c['matchFacts'].get('infoBox') or {}).get('Stadium')),
     'home':home,'away':away,'shots':shots,'momentum':[[d['minute'],d['value']] for d in c['momentum']['main']['data']],'events':events,'stats':stats,
     'keepers':{str(s['keeperId']):keepers.get(s['keeperId']) for s in shots if s['keeperId']}}
json.dump(out,open(os.path.join(H,'match_data.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1); print('wrote match_data.json:',out['match'],len(shots),'shots')
