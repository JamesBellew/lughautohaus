# Clean, plate-free bumper. The intake's top edge continues the trim line from
# the left of the old plate at the same angle as the bumper's other lines
# (perspective slope ~-0.145), so nothing appears to bend.
import numpy as np
from PIL import Image
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
X0,X1=1350,1516
SLOPE=-0.145
bnd=lambda x: 505+SLOPE*(x-1350)            # top of the black trim strip
top=lambda x: 452+(429-452)*(x-1356)/(1511-1356)-5
BOT=540
for src,dst,k in [("911-v6.webp","911-v7.webp",1),("911-v6@2x.webp","911-v7@2x.webp",2)]:
    im=np.asarray(Image.open(P+src).convert("RGBA")).astype(np.float32); out=im.copy()
    L,R=int(X0*k),int(X1*k)
    Rtop=int(463*k)                                   # right-side body ends here
    grille=im[int(530*k):int(560*k),int(1300*k):int(1345*k),:3].mean(1)   # rows of real grille
    for Y in range(int(top(X1)*k)-2,int(BOT*k)):
        y=Y/k
        for X in range(L+1,R):
            x=X/k
            if y<top(x): continue
            t=(X-L)/(R-L); b=bnd(x)
            if y<b-0.5:
                rc=im[min(Y,Rtop),R,:3]
                c=im[Y,L,:3]*(1-t)+rc*t
                if y>b-4: c=c*(0.78+0.055*(b-y))      # soft shadow under the panel edge
            elif y<b+21:
                # carry the trim strip (with its chrome line) across along the slope
                c=im[int((505+(y-b))*k),L,:3]
            else:
                gy=int((y-b-21)*k)%grille.shape[0]
                c=grille[gy]
                if y>BOT-6:
                    w=(y-(BOT-6))/6; c=c*(1-w)+im[Y,X,:3]*w
            out[Y,X,:3]=c
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(P+dst,quality=88 if k==1 else 86,method=6)
    if k==2: Image.fromarray(out[...,:3].astype(np.uint8)).crop((2360,840,3200,1220)).save("rebumper2.jpg")
print("ok")
