# Synthesised soundtrack (numpy only, no samples): 120 BPM bed + whistles + goal roars, timed from index.html's TIMES.
# usage: python -I gen_audio.py times.json out.wav
import json,sys,wave
import numpy as np
SR=48000
TM=json.load(open(sys.argv[1])); END=TM['END']; N=int(END*SR)+SR
t=np.arange(N)/SR; rng=np.random.default_rng(7)
mix=np.zeros((N,2))
def add(sig,t0,gain=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(sig),N-i)
    if n<=0: return
    mix[i:i+n,0]+=sig[:n]*gain*(1-max(0,pan)); mix[i:i+n,1]+=sig[:n]*gain*(1+min(0,pan))
def band(x,lo,hi):
    F=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); F[(f<lo)|(f>hi)]=0; return np.fft.irfft(F,len(x))
def lowpass(x,fc):
    F=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); return np.fft.irfft(F/np.sqrt(1+(f/fc)**4),len(x))
mtof=lambda m:440*2**((m-69)/12)
BEAT=0.5; T2=TM['T2']; HT=TM['HT_T']; FT=TM['FT_T']; GOALS=TM['goals']
# chords per 2 s bar: Am F C G (root midi, triad)
PROG=[(57,[57,60,64]),(53,[53,57,60]),(48,[52,55,60]),(55,[55,59,62])]
# --- pad (detuned saws, low-passed), whole length
pad=np.zeros(N)
for b in range(int(END/2)+1):
    root,ch=PROG[b%4]; i0=int(b*2*SR); n=min(2*SR,N-i0)
    if n<=0: break
    tt=np.arange(n)/SR; seg=np.zeros(n)
    for m in ch:
        for d in(-0.08,0.08):
            ph=(mtof(m+d)*tt)%1; seg+=2*ph-1
    env=np.minimum(1,tt/0.08)*np.minimum(1,(2-tt)/0.08)
    pad[i0:i0+n]+=seg*env/6
pad=lowpass(pad,900)*0.22
mix[:,0]+=pad; mix[:,1]+=pad
# --- drums + bass from kickoff to the story section
def kick():
    n=int(.35*SR); tt=np.arange(n)/SR; f=45+80*np.exp(-tt*28); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)
def hat():
    n=int(.06*SR); return band(rng.standard_normal(n),7000,16000)*np.exp(-np.arange(n)/SR*70)
def clap():
    n=int(.18*SR); return band(rng.standard_normal(n),900,5000)*np.exp(-np.arange(n)/SR*22)
K,Hh,C=kick(),hat(),clap()
DR0,DR1=4.6,TM['T6']+3.0
b=0
while b*BEAT<END:
    tb=b*BEAT
    if tb<DR0: # intro: soft kick on bar downbeats only
        if b%4==0: add(K,tb,.35)
    elif tb<DR1:
        inHT=HT<=tb<HT+3.6
        add(K,tb,.0 if inHT else .55)
        add(Hh,tb+BEAT/2,.18,pan=.3)
        if b%2==1 and not inHT: add(C,tb,.22,pan=-.2)
        root=PROG[int(tb/2)%4][0]-24
        for k in range(2):
            n=int(BEAT/2*SR); tt=np.arange(n)/SR
            bs=np.sin(2*np.pi*mtof(root)*tt)+.3*np.sin(4*np.pi*mtof(root)*tt)
            add(bs*np.exp(-tt*5)*np.minimum(1,tt/.005),tb+k*BEAT/2,.22)
    b+=1
# --- whistles
def whistle(dur):
    n=int(dur*SR); tt=np.arange(n)/SR; f=3150+60*np.sin(2*np.pi*38*tt)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)+.25*band(rng.standard_normal(n),2500,4500)
    return s*np.minimum(1,tt/.02)*np.minimum(1,(dur-tt)/.03)
add(whistle(.7),T2+.75,.18)
add(whistle(.35),HT,.18); add(whistle(.9),HT+.5,.18)
for k,d in enumerate([.35,.35,1.1]): add(whistle(d),FT-.1+k*.5,.2)
# --- goals: riser into an impact + crowd roar
def roar(dur):
    n=int(dur*SR); tt=np.arange(n)/SR
    s=band(rng.standard_normal(n),250,3500)+.5*band(rng.standard_normal(n),80,400)
    s*=(1+.25*np.sin(2*np.pi*1.7*tt)); return s/np.abs(s).max()*np.minimum(1,tt/.15)*np.exp(-tt/1.6)
def impact():
    n=int(1.2*SR); tt=np.arange(n)/SR; f=30+70*np.exp(-tt*10)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*3.5)+.4*band(rng.standard_normal(n),100,2000)*np.exp(-tt*12)
def riser(dur):
    n=int(dur*SR); tt=np.arange(n)/SR; s=band(rng.standard_normal(n),1500,9000)*(tt/dur)**2.5; return s/np.abs(s).max()
for i,g in enumerate(GOALS):
    home=(i==2) # Álvarez: the home crowd at La Bombonera; Uruguay goals get a smaller away-end roar
    add(riser(.6),g-.35,.12); add(impact(),g+.25,.9); add(roar(3.4),g+.2,.55 if home else .32)
    # duck the beat a touch under the roar
    i0,i1=int((g+.2)*SR),int((g+3.2)*SR); mix[i0:i1]*=0.85
add(roar(2.5),FT+.2,.2); add(impact(),TM['T6']+.4,.7)
# --- master: fade in/out, normalise, soft clip
env=np.minimum(1,t/1.0)*np.clip((END-t)/1.2,0,1); mix*=env[:,None]
mix=np.tanh(mix/np.abs(mix).max()*1.6)*0.8
mix=mix[:int(END*SR)]
with wave.open(sys.argv[2],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes())
print('wrote',sys.argv[2],round(len(mix)/SR,2),'s')
