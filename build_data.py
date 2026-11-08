# match_data.json -> data.js (loaded by index.html)
# home = team 'A', away = team 'E'. Names are the FotMob player names in caps unless overridden below.
import json,os
H=os.path.dirname(os.path.abspath(__file__))
D=json.load(open(os.path.join(H,'match_data.json'),encoding='utf-8'))
HOME=D['home']
NAMES={}    # optional overrides: FotMob player name -> callout name
# big chances that didn't go in get their own beat (clock holds, callout): (minute, added, team code) -> beat ('miss' | 'post' | 'save')
# left empty, every non-goal shot of BIG_XG or more becomes a beat (saves name the keeper FotMob credits)
CHANCES={}
BIG_XG=0.40
def nm(p): return NAMES.get(p,p).upper().replace("'","’")
ev,sh=[],[]
OUT=[]
def emit(t): OUT.append(t)
added={e['min']:e['minutes'] for e in D['events'] if e['type']=='added'}
END=90+max(added.get(90,0),max([s['add'] or 0 for s in D['shots'] if s['min']==90]+[0]))
def kind(s):
    k=(s['min'],s['add'] or 0,s['team'])
    if k in CHANCES: return CHANCES[k]
    if CHANCES or s['type']=='Goal' or s['xg']<BIG_XG: return None
    if s['type']=='Miss': return 'miss'
    if s['type']=='Post': return 'post'
    if s['type']=='AttemptSaved' and not s['blocked'] and s.get('keeper'): return 'save'
    return None
def clock(s): # 45+N sits inside the first-half stoppage before the HT hold at 45.9; 90+N runs on the clock to END
    a=s['add'] or 0
    return 45+0.25*min(a,3.5) if s['min']==45 and a else (90+a if s['min']==90 and a else s['min'])
def label(s):
    a=s['add']; return f"{s['min']}+{a}'" if a else f"{s['min']}'"
def emin(e): # event minute on the reel clock (FotMob gives 90+N cards as min 90 + overloadTime)
    a=e.get('add') or 0; return 45+0.25*min(a,3.5) if e['min']==45 and a else (90+a if e['min']==90 and a else e['min'])
def elab(e):
    a=e.get('add'); return f"{e['min']}+{a}'" if a else f"{e['min']}'"
shots=sorted(D['shots'],key=lambda s:(s['min'],s['add'] or 0))
for e in D['events']:
    T='A' if e.get('team')==HOME else 'E'
    if e['type']=='var' and e['decision'] and e['decision'][0]=='Goal ruled out':
        why=e['decision'][1].upper() if len(e['decision'])>1 else ''
        m=emin(e); ev.append((m+0.01,f"{{m:{m},team:'{T}',type:'var',name:'{nm(e['player'])}',min:\"{elab(e)}\",why:'{why}'}}"))
    elif e['type']=='card' and e['card'] in('Red','YellowRed'):
        why='SECOND YELLOW' if e['card']=='YellowRed' else (e['reason'] or 'STRAIGHT RED').upper()
        m=emin(e); ev.append((m+0.01,f"{{m:{m},team:'{T}',type:'red',name:'{nm(e['player'])}',min:\"{elab(e)}\",why:'{why}'}}"))
for s in shots:
    T='A' if s['team']==HOME else 'E'
    # FotMob x: 0..105 towards the goal attacked, y: 0..68. The home side attacks +x, the away side -x.
    sg=1 if T=='A' else -1; x=round(sg*(s['x']-52.5),2); z=round(sg*(s['y']-34),2)
    k=kind(s)
    if s['type']=='Goal':
        m=clock(s); lab=label(s)+(' (P)' if s['situation']=='Penalty' else '')+(' (OG)' if s['ownGoal'] else '')
        ev.append((m,f"{{m:{m},team:'{T}',type:'goal',name:'{nm(s['player'])}',min:\"{lab}\",xg:{s['xg']:.4f},x:{x},z:{z}}}"))
    elif k:
        m=clock(s); by=f",by:'{nm(s['keeper'])}'" if k=='save' else ''
        ev.append((m,f"{{m:{m},team:'{T}',type:'{k}',name:'{nm(s['player'])}',min:\"{label(s)}\",xg:{s['xg']:.4f},x:{x},z:{z}{by}}}"))
    else:
        # same-minute shots pop in sequence just before the minute (and before any beat on it)
        same=[o for o in shots if o['min']==s['min'] and (o['add'] or 0)==(s['add'] or 0) and o['type']!='Goal' and not kind(o)]
        m=clock(s)-0.5-0.3*(len(same)-1-same.index(s))
        c={'Post':'W','AttemptSaved':'B' if s['blocked'] else 'S','Miss':'M'}[s['type']]
        sh.append(f"[{round(m,2)},'{T}',{s['xg']:.4f},{x},{z},'{c}']")
ev=[s for _,s in sorted(ev)]
# FotMob gives stoppage time as fractional minutes (45.5, 90.5, 90.75 …): first-half ones stay inside 45–46, second-half ones spread over 90–END
mom=[[m,v] for m,v in D['momentum'] if v is not None]
st2=sorted(m for m,_ in mom if m>90 and m!=int(m)); sp={m:round(90+(END-90)*(i+1)/(len(st2)+1),2) for i,m in enumerate(st2)}
mom=[[sp.get(m,m),round(v/100,2)] for m,v in mom]+[[END,0]]
A=D['stats']['All']; f=lambda k:A[k] if k in A else None
def num(v): return float(str(v).split(' ')[0].rstrip('%'))
STATS=[]
for key,lab,dec in [('total_shots','SHOTS',0),('ShotsOnTarget','ON TARGET',0),('expected_goals','xG',2),('BallPossesion','POSSESSION',0)]:
    v=f(key)
    if v: a,b=num(v[0]),num(v[1]); pct='%' if lab=='POSSESSION' else ''; STATS.append([f"{a:.{dec}f}{pct}",lab,f"{b:.{dec}f}{pct}",a,b,dec])
emit(f'const END={END}; // clock runs to 90+{END-90}')
emit('const EVENTS=[ // team: A = '+D['home']+', E = '+D['away']+' · xG + shot location from FotMob (Opta)\n '+',\n '.join(ev)+'];')
emit('// every other shot: [clock minute, team, xG, x, z, W=woodwork S=saved B=blocked M=off target]')
emit('const OTHER=['+','.join(sh)+'];')
emit('// FotMob attacking momentum (xT model) per minute, + = '+D['home']+' on top; fractional minutes = stoppage time')
emit('const MOM='+json.dumps(mom,separators=(',',':'))+';')
emit('// full-time stats (FotMob / Opta): [home label, name, away label, home value, away value, decimals]')
emit('const STATS='+json.dumps(STATS,ensure_ascii=False,separators=(',',':'))+';')
NL=chr(10)
open(os.path.join(H,'data.js'),'w',encoding='utf-8').write('// generated by build_data.py from match_data.json'+NL+NL.join(OUT)+NL); print('wrote data.js · END',END,'·',len(ev),'beats ·',len(sh),'other shots')
