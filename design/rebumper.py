# Rebuild the old plate area as a clean bumper: smooth body panel above the
# intake line (interpolated between the panel either side), dark intake below.
import numpy as np
from PIL import Image
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
X0,X1=1351,1515                      # columns to rebuild (1600px space)
top=lambda x: 452+(429-452)*(x-1356)/(1511-1356)-4
bnd=lambda x: 526+(488-526)*(x-1352)/(1514-1352)
BOT=538
for src,dst,k in [("911-v4.webp","911-v5.webp",1),("911-v4@2x.webp","911-v5@2x.webp",2)]:
    im=np.asarray(Image.open(P+src).convert("RGBA")).astype(np.float32); out=im.copy()
    L,R=int(X0*k)-1,int(X1*k)+1
    dark=im[int(548*k):int(570*k),int(1440*k):int(1500*k),:3].reshape(-1,3).mean(0)*0.92
    for Y in range(int(min(top(X0),top(X1))*k)-2,int(BOT*k)):
        y=Y/k
        for X in range(L+1,R):
            x=X/k
            if y<top(x): continue
            t=(X-L)/(R-L)
            if y<bnd(x)-0.6:
                c=im[Y,L,:3]*(1-t)+im[Y,R,:3]*t           # smooth panel
                if y>bnd(x)-3: c=c*0.82                    # soft shadow under the lip
            elif y<bnd(x)+0.8:
                c=np.minimum(255,dark+14)                 # lip edge, barely lit
            else:
                if y>BOT-6:                               # feather into original intake
                    w=(y-(BOT-6))/6; c=dark*(1-w)+im[Y,X,:3]*w
                else: c=dark*(0.85+0.3*((Y//(2*k))%3==0))   # faint horizontal slats
            out[Y,X,:3]=c
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(P+dst,quality=88 if k==1 else 86,method=6)
    if k==2: Image.fromarray(out[...,:3].astype(np.uint8)).crop((2580,800,3200,1200)).save("rebumper.jpg")
print("ok")
