# Remove the photo's square US plate: mirror the bumper above the plate down to
# its midline; below the midline, extend the intake edge upward. The EU plate overlay hides the seam.
import numpy as np
from PIL import Image
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
TL,TR,BR,BL=(1360,454),(1510,432),(1507,506),(1357,532)
def edge(p,q,x): return p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0])
for src,dst,k in [("911-v3.webp","911-v4.webp",1),("911-v3@2x.webp","911-v4@2x.webp",2)]:
    im=np.asarray(Image.open(P+src).convert("RGBA")).copy(); out=im.copy()
    pad=3*k
    for X in range(int((min(TL[0],BL[0])-2)*k), int((max(TR[0],BR[0])+3)*k)):
        x=X/k
        yt=edge(TL,TR,x)*k-pad; yb=edge(BL,BR,x)*k+pad; mid=(yt+yb)/2
        for Y in range(int(yt),int(yb)+1):
            sy = int(2*yt-Y) if Y<mid else int(yb)+pad   # above: mirror; below: extend the intake edge
            out[Y,X,:3]=im[sy,X,:3]
    Image.fromarray(out).save(P+dst,quality=88 if k==1 else 86,method=6)
    if k==2: Image.fromarray(out[...,:3]).crop((2600,780,3200,1150)).save("deplate.jpg")
print("ok")
