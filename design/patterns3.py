import numpy as np
from PIL import Image, ImageFilter
N=512; c=4
y,x=np.mgrid[0:N,0:N].astype(np.float32)
i=(x//c).astype(int); j=(y//c).astype(int)
warp=((i-j)%4)<2
u=(x%c)/c; v=(y%c)/c
pw=np.sin(np.pi*v)**0.7; pf=np.sin(np.pi*u)**0.7
# neutral 0.5 grey: strands lift above, gaps dip below — for overlay blending
val=np.where(warp, 0.5+0.42*pw-0.16, 0.5+0.18*pf-0.22)
img=Image.fromarray((np.clip(val,0,1)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.35))
img.convert("RGB").save("/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/carbon-clear-v2.webp",quality=92)
t=img.convert("RGB"); g=Image.new("RGB",(N*2,N*2))
for a in range(2):
    for b in range(2): g.paste(t,(a*N,b*N))
g.crop((0,0,400,400)).resize((800,800),Image.NEAREST).save("prev-cc.jpg"); print("ok")
