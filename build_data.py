# match_data.json -> data.js (loaded by index.html)
import json,os
H=os.path.dirname(os.path.abspath(__file__))
D=json.load(open(os.path.join(H,'match_data.json'),encoding='utf-8'))
HOME=D['home'] # home side = team 'A' (attacks +x, the end nearest the camera); away = 'E'
END=95 # the clock runs to 90+5 (Karl's 90+5' shot off the post)
NAMES={(38,'BAY'):'KONRAD LAIMER',(60,'BVB'):'SERHOU GUIRASSY',(66,'BAY'):'DAYOT UPAMECANO',(89,'BVB'):'FÁBIO SILVA'}
# big chances that didn't go in get their own beat (clock holds, callout): (minute, team, FotMob type) -> fields
CHANCES={(10,'BAY','Miss'):{'type':'miss','name':'ISMAEL SAIBARI'},
         (24,'BAY','AttemptSaved'):{'type':'save','name':'ISMAEL SAIBARI','by':'KOBEL'},
         # Kane's penalty crossed the line at 2.50 m (bar at 2.44 m) beside the post: FotMob 'Post', reports: off the crossbar
         (56,'BAY','Post'):{'type':'post','name':'HARRY KANE','word':'CROSSBAR','how':'PENALTY OFF THE BAR','pen':1}}
VARN={'Jobe Bellingham':'JOBE BELLINGHAM'}
REDN={}
ev,sh=[],[]
OUT=[]
def emit(t): OUT.append(t)
def beat(s): return (s['min'],s['team'],s['type']) in CHANCES
def clock(s): # 45+N sits inside the first-half stoppage before the HT hold at 45.9; 90+N runs on the clock to END
    a=s['add'] or 0
    return 45+0.25*a if s['min']==45 and a else (90+a if s['min']==90 and a else s['min'])
def label(s):
    a=s['add']; return (f"{s['min']}+{a}'" if a else f"{s['min']}'")+(' (P)' if s['situation']=='Penalty' else '')
def js(v): return json.dumps(v,ensure_ascii=False).replace('"',"'") if isinstance(v,str) else (f"{v:.4f}" if isinstance(v,float) else str(v))
shots=sorted(D['shots'],key=lambda s:(s['min'],s['add'] or 0))
for e in D['events']:
    T='A' if e.get('team')==HOME else 'E'
    if e['type']=='var': # FotMob decision e.g. ['Goal ruled out', 'offside']
        ev.append((e['min']+0.01,f"{{m:{e['min']},team:'{T}',type:'var',name:'{VARN[e['player']]}',min:\"{e['min']}'\",why:'{e['decision'][1].upper()}'}}"))
    elif e['type']=='card' and e['card'] in('Red','YellowRed'):
        why='SECOND YELLOW' if e['card']=='YellowRed' else (e['reason'] or '').upper()
        ev.append((e['min']+0.01,f"{{m:{e['min']},team:'{T}',type:'red',name:'{REDN[e['player']]}',min:\"{e['min']}'\",why:'{why}'}}"))
for s in shots:
    T='A' if s['team']==HOME else 'E'
    # FotMob x: 0..105 towards the goal attacked, y: 0..68. Home attacks +x, away attacks -x.
    sg=1 if T=='A' else -1; x=round(sg*(s['x']-52.5),2); z=round(sg*(s['y']-34),2); h=1 if s['min']<=45 else 2
    if s['type']=='Goal':
        m=clock(s); k=(s['min'],s['team'])
        ev.append((m,f"{{m:{m},team:'{T}',type:'goal',name:'{NAMES[k]}',min:\"{label(s)}\",xg:{s['xg']:.4f},x:{x},z:{z},h:{h}}}"))
    elif beat(s):
        c=dict(CHANCES[(s['min'],s['team'],s['type'])]); m=clock(s)
        extra=''.join(f",{k}:{js(v)}" for k,v in c.items() if k not in('type','name'))
        ev.append((m,f"{{m:{m},team:'{T}',type:'{c['type']}',name:'{c['name']}',min:\"{label(s)}\",xg:{s['xg']:.4f},x:{x},z:{z},h:{h}{extra}}}"))
    else:
        # same-minute shots pop in sequence just before the minute (and before any beat on it)
        same=[o for o in shots if o['min']==s['min'] and (o['add'] or 0)==(s['add'] or 0) and o['type']!='Goal' and not beat(o)]
        m=clock(s)-0.5-0.3*(len(same)-1-same.index(s))
        k={'Post':'W','AttemptSaved':'B' if s['blocked'] else 'S','Miss':'M'}[s['type']]
        sh.append(f"[{round(m,2)},'{T}',{s['xg']:.4f},{x},{z},'{k}',{h}]")
ev=[s for _,s in sorted(ev)]
# FotMob's official xG nets out rebound sequences, so per-shot xG can sum higher (Bayern 1st half: 2.34 per shot vs 2.08 official).
# The live HUD scales each half so it reads FotMob's HT figure at the break and its FT figure at the end.
st=D['stats']; xs={}
for T,i,code in (('A',0,HOME),('E',1,D['away'])):
    s1=sum(s['xg'] for s in D['shots'] if s['team']==code and s['min']<=45); s2=sum(s['xg'] for s in D['shots'] if s['team']==code and s['min']>45)
    h1=float(st['FirstHalf']['expected_goals'][i]); ft=float(st['All']['expected_goals'][i])
    xs[T]=[round(h1/s1,4) if s1 else 1,round((ft-h1)/s2,4) if s2 else 1]
# 45.5 = first-half stoppage; 90.x = second-half stoppage, spread evenly over 90' .. END
stp=sorted({m for m,_ in D['momentum'] if 90<m<91})
smap={m:round(90+(END-90)*(i+1)/(len(stp)+1)*1.0,2) for i,m in enumerate(stp)}
mom=[[smap.get(m,m),round(v/100,2)] for m,v in D['momentum']]+[[END,0]]
emit(f"// {D['match']} · {D['source']}")
emit(f'const END={END};')
emit(f"const EVENTS=[ // team: A = {HOME}, E = {D['away']} · xG + shot location from FotMob (Opta) · h = half\n "+',\n '.join(ev)+'];')
emit('// every other shot: [clock minute, team, xG, x, z, W=woodwork S=saved B=blocked M=off target, half]')
emit('const OTHER=['+','.join(sh)+'];')
emit('// live-xG scale per half so the HUD lands on FotMob\'s official HT / FT totals')
emit('const XGS='+json.dumps(xs,separators=(',',':'))+';')
emit(f'// FotMob attacking momentum (xT model) per minute, + = {HOME} on top; 45.5 / 90+ = stoppage time')
emit('const MOM='+json.dumps(mom,separators=(',',':'))+';')
NL=chr(10)
open(os.path.join(H,'data.js'),'w',encoding='utf-8').write('// generated by build_data.py from match_data.json'+NL+NL.join(OUT)+NL); print('wrote data.js')
