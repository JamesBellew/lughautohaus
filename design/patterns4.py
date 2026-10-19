import numpy as np, math
from PIL import Image, ImageDraw, ImageFilter
OUT="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"; N=512
def torus_noise(n, sigma, seed):
    r=np.random.default_rng(seed).standard_normal((n,n))
    f=np.fft.fft2(r); ky=np.fft.fftfreq(n)[:,None]; kx=np.fft.fftfreq(n)[None,:]
    g=np.exp(-(kx**2+ky**2)*(2*math.pi*sigma)**2/2)
    o=np.real(np.fft.ifft2(f*g)); return (o-o.mean())/o.std()

# ── Camo gray: neutral 0.5 base (for overlay blending), crisp organic blotches
def blobs(seed, thr):
    n=torus_noise(N,11,seed)+0.45*torus_noise(N,4,seed+1)+0.18*torus_noise(N,1.6,seed+2)
    return n>thr
light=blobs(41,0.75); dark=blobs(51,0.8)&~light; mid=blobs(61,0.95)&~light&~dark
a=np.full((N,N),0.5,np.float32)
a[mid]=0.43; a[dark]=0.36; a[light]=0.66
img=Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
img.convert("RGB").save(OUT+"camo-v2.webp",quality=92)

# ── Forged shards on black (light-driven like the other dark films)
def forged(seed, shade_lo, shade_hi, bright_p, tint, count):
    rng=np.random.default_rng(seed); S=2; W=N*S
    im=Image.new("RGB",(W,W),(0,0,0)); d=ImageDraw.Draw(im)
    for _ in range(count):
        cx,cy=rng.uniform(0,W,2); L=rng.uniform(36,110)*S/2; Wd=rng.uniform(11,30)*S/2
        ang=rng.normal(rng.choice([0.35,2.0,1.15]),0.5)
        v=rng.uniform(shade_lo,shade_hi)
        if rng.random()<bright_p: v=rng.uniform(170,235)
        base=np.array(tint)*v
        c,s=math.cos(ang),math.sin(ang)
        # ragged ends: trapezoid with cut corners
        pts=[(-L/2,-Wd/2*rng.uniform(.5,1)),(L/2*rng.uniform(.7,1),-Wd/2),(L/2,Wd/2*rng.uniform(.3,1)),(-L/2*rng.uniform(.6,1),Wd/2)]
        P_=[(cx+x*c-y*s,cy+x*s+y*c) for x,y in pts]
        for ox in (-W,0,W):
            for oy in (-W,0,W):
                d.polygon([(x+ox,y+oy) for x,y in P_],fill=tuple(int(min(255,max(0,q))) for q in base))
        # fibre strands along the shard
        k=max(3,int(Wd/1.6))
        for i in range(k):
            t=-Wd/2+(i+.5)*Wd/k; sh=rng.uniform(-0.18,0.18)*v
            col=tuple(int(min(255,max(0,q))) for q in np.array(tint)*(v+sh))
            a_=(cx-L*0.48*c-t*s, cy-L*0.48*s+t*c); b_=(cx+L*0.48*c-t*s, cy+L*0.48*s+t*c)
            for ox in (-W,0,W):
                for oy in (-W,0,W):
                    d.line([(a_[0]+ox,a_[1]+oy),(b_[0]+ox,b_[1]+oy)],fill=col,width=1)
    im=im.resize((N,N),Image.LANCZOS)
    return im
forged(71,14,90,0.10,(1.0,1.0,1.03),1900).save(OUT+"forged-gloss-v1.webp",quality=90)
forged(81,55,165,0.18,(0.98,1.0,1.04),2100).save(OUT+"forged-metal-v1.webp",quality=90)

# Forged matte: same flakes, softer and lower contrast (satin, light scattered)
forged(91,20,110,0.06,(1.0,1.0,1.02),1900).filter(ImageFilter.GaussianBlur(0.5)).save(OUT+"forged-matte-v1.webp",quality=90)

for f in ["camo-v2","forged-gloss-v1","forged-metal-v1","forged-matte-v1"]:
    t=Image.open(OUT+f+".webp"); g=Image.new("RGB",(N*2,N*2))
    for i in range(2):
        for j in range(2): g.paste(t,(i*N,j*N))
    g.resize((560,560)).save(f"prev-{f}.jpg")
g=Image.new("RGB",(1700,560),"white")
for i,f in enumerate(["camo-v2","forged-gloss-v1","forged-metal-v1"]): g.paste(Image.open(f"prev-{f}.jpg"),(i*570,0))
g.save("prev4.jpg"); print("ok")
