# M3 (IMG_1176): 1600px + 2x, German plate removed by copying the kidney
# slats down from two periods above (row by row, so they repeat cleanly); divider interpolated.
import numpy as np
from PIL import Image
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
cut=Image.open("m3cut2c.png").convert("RGBA"); W,H=cut.size
TL,TR,BR,BL=(1300,485),(1495,462),(1492,517),(1302,540)
x0,x1=1294,1500
top=lambda x: TL[1]+(TR[1]-TL[1])*(x-TL[0])/(TR[0]-TL[0])-5
bot=lambda x: BL[1]+(BR[1]-BL[1])*(x-BL[0])/(BR[0]-BL[0])+5
for name,k in [("bmw-v2.webp",1),("bmw-v2@2x.webp",2)]:
    w=1600*k; h=round(w*H/W)
    im=np.asarray(cut.resize((w,h),Image.LANCZOS)).copy(); src=im.copy()
    for X in range(int(x0*k),int(x1*k)):
        x=X/k; t,b=top(x)*k,bot(x)*k; mid=(t+b)/2; D=int(40*k)
        for Y in range(int(t),int(b)+1):
            if 1387<=x<=1411:
                a=(Y-t)/max(1,(b-t)); im[Y,X]=(src[int(t)-2,X]*(1-a)+src[int(b)+2,X]*a).astype(np.uint8); continue
            im[Y,X]=im[Y-D,X]   # propagate slats downward from already-filled rows
    Image.fromarray(im).save(P+name,quality=88 if k==1 else 86,method=6)
    if k==1: Image.fromarray(im[...,:3]).crop((1220,330,1600,620)).resize((760,580)).save("bmw2_plate.jpg")
print("ok",h)
