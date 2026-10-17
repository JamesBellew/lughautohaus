import numpy as np, math
from PIL import Image, ImageFilter
OUT="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"; N=512
def torus_noise(n, sigma, seed):
    r=np.random.default_rng(seed).standard_normal((n,n))
    f=np.fft.fft2(r); ky=np.fft.fftfreq(n)[:,None]; kx=np.fft.fftfreq(n)[None,:]
    g=np.exp(-(kx**2+ky**2)*(2*math.pi*sigma)**2/2)
    o=np.real(np.fft.ifft2(f*g)); return (o-o.mean())/o.std()

def twill(c, hi, lo, soft, seed):
    y,x=np.mgrid[0:N,0:N].astype(np.float32)
    i=(x//c).astype(int); j=(y//c).astype(int)
    warp=((i-j)%4)<2                        # 2/2 twill → diagonal steps
    u=(x%c)/c; v=(y%c)/c
    # each tow is a rounded bundle: bright along its axis, dark at its edges
    prof_w=np.sin(np.pi*v)**0.8; prof_f=np.sin(np.pi*u)**0.8
    fib=np.random.default_rng(seed).standard_normal((N,N)).astype(np.float32)
    fib_w=Image.fromarray(fib).filter(ImageFilter.BoxBlur(0)); fib=np.asarray(fib_w)
    streak_w=0.85+0.15*np.sin(2*np.pi*(v*c/1.6)+fib*0.4)   # fine strands across the tow
    streak_f=0.85+0.15*np.sin(2*np.pi*(u*c/1.6)+fib*0.4)
    val=np.where(warp, hi*prof_w*streak_w, lo*prof_f*streak_f)
    img=Image.fromarray(np.clip(val*255,0,255).astype(np.uint8))
    if soft: img=img.filter(ImageFilter.GaussianBlur(soft))
    a=np.asarray(img).astype(np.float32)/255
    return np.dstack([a*0.96,a*0.98,a])          # faint cool cast, like real carbon

def save(a,name):
    Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).save(OUT+name,quality=90)

save(twill(8,0.95,0.45,0.0,1),"carbon-gloss-v1.webp")
save(twill(12,0.62,0.36,1.1,2),"carbon-matte-v1.webp")

# camo black: two tones of organic blobs with ragged edges
n=torus_noise(N,22,31)+0.35*torus_noise(N,5,32)
m=torus_noise(N,18,33)+0.35*torus_noise(N,5,34)
light=(n>0.55); mid=(m>0.65)&~light
a=np.zeros((N,N),np.float32); a[mid]=0.38; a[light]=0.78
a=np.asarray(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)/255
save(np.dstack([a,a,a*1.02]),"camo-black-v1.webp")

for f in ["carbon-gloss-v1","carbon-matte-v1","camo-black-v1"]:
    t=Image.open(OUT+f+".webp"); g=Image.new("RGB",(N*2,N*2))
    for i in range(2):
        for j in range(2): g.paste(t,(i*N,j*N))
    g.resize((640,640)).save(f"prev-{f}.jpg")
print("ok")
