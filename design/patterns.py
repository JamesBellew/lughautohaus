import numpy as np, math
from PIL import Image, ImageDraw, ImageFilter
OUT="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
N=512
rng=np.random.default_rng(7)

def torus_noise(n, sigma, seed):
    r=np.random.default_rng(seed).standard_normal((n,n))
    f=np.fft.fft2(r); ky=np.fft.fftfreq(n)[:,None]; kx=np.fft.fftfreq(n)[None,:]
    g=np.exp(-(kx**2+ky**2)*(2*math.pi*sigma)**2/2)
    out=np.real(np.fft.ifft2(f*g)); return (out-out.mean())/out.std()

# ── Forged red wine ─────────────────────────────────────────────
S=2  # supersample
W=N*S
img=Image.new("RGB",(W,W),(0,0,0)); d=ImageDraw.Draw(img)
def shard(cx,cy,L,Wd,ang,col):
    # irregular quad: rectangle with one clipped corner, slight skew
    c,s=math.cos(ang),math.sin(ang)
    pts=[(-L/2,-Wd/2),(L/2*rng.uniform(.6,1),-Wd/2),(L/2,Wd/2*rng.uniform(-.2,1)),(L/2*rng.uniform(.3,1),Wd/2),(-L/2,Wd/2*rng.uniform(.4,1))]
    P=[(cx+x*c-y*s, cy+x*s+y*c) for x,y in pts]
    for ox in (-W,0,W):
        for oy in (-W,0,W):
            d.polygon([(x+ox,y+oy) for x,y in P],fill=col)
    # fibre streaks along the long axis
    for k in range(int(Wd/3)):
        t=-Wd/2+ (k+0.5)*Wd/max(1,int(Wd/3)); sh=rng.uniform(-14,14)
        a=(cx-L*0.45*c - t*s, cy-L*0.45*s + t*c); b=(cx+L*0.45*c - t*s, cy+L*0.45*s + t*c)
        lc=tuple(int(max(0,min(255,v+sh))) for v in col)
        for ox in (-W,0,W):
            for oy in (-W,0,W):
                d.line([(a[0]+ox,a[1]+oy),(b[0]+ox,b[1]+oy)],fill=lc,width=1)
dark=[(40,7,14),(52,9,18),(30,5,10),(62,12,22),(22,4,8)]
bright=[(170,30,58),(200,44,78),(150,24,48),(214,60,92),(120,20,40)]
for i in range(3600):
    x,y=rng.uniform(0,W,2); L=rng.uniform(14,46)*S/2; Wd=rng.uniform(6,20)*S/2; a=rng.uniform(0,math.pi)
    col=bright[rng.integers(5)] if rng.random()<0.28 else dark[rng.integers(5)]
    shard(x,y,L,Wd,a,col)
img=img.resize((N,N),Image.LANCZOS)
a=np.asarray(img).astype(np.float32)
a*= (1+0.10*torus_noise(N,40,3))[...,None]            # broad light falloff, like the reference
a=np.clip(a,0,255).astype(np.uint8); Image.fromarray(a).save(OUT+"forged-red-v3.webp",quality=88)

# ── Damascus black ──────────────────────────────────────────────
n=torus_noise(N,9,11)+0.45*torus_noise(N,4,12)
n+=0.6*torus_noise(N,26,13)
K=2.3
v=n*K
gy,gx=np.gradient(v); gm=np.hypot(gx,gy)+1e-3
dist=np.abs(v-np.round(v))/gm          # px distance to nearest contour
line=np.exp(-(dist/0.6)**2)*np.clip((gm-0.04)/0.12,0,1)
vary=0.55+0.45*(torus_noise(N,30,14)*0.5+0.5).clip(0,1)
base=np.array([0,0,0],np.float32); ink=np.array([210,214,220],np.float32)
out=base+ (ink-base)*(line*vary)[...,None]
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(OUT+"damascus-black-v3.webp",quality=90)

# previews: 2x2 tiles to check seams
for f in ["forged-red-v3","damascus-black-v3"]:
    t=Image.open(OUT+f+".webp"); g=Image.new("RGB",(N*2,N*2))
    for i in range(2):
        for j in range(2): g.paste(t,(i*N,j*N))
    g.save(f"/private/tmp/claude-501/-Users-jamesbellew-Documents-Websites-Freelance-006customs/afcea405-a8e5-48f3-bcd5-ecc4ee8b9e0a/scratchpad/prev-{f}.jpg")
print("ok")
