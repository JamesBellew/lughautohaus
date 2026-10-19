# Put a black plate holder back where the US plate sat: dark recess with a
# faint bevel catching light along its top and left edges.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
Q=[(1359,452),(1511,430),(1508,507),(1356,533)]
for src,dst,k in [("911-v5.webp","911-v6.webp",1),("911-v5@2x.webp","911-v6@2x.webp",2)]:
    im=Image.open(P+src).convert("RGBA"); W,H=im.size
    q=[(x*k,y*k) for x,y in Q]
    body=Image.new("L",(W,H),0); ImageDraw.Draw(body).polygon(q,fill=255)
    a=np.asarray(body.filter(ImageFilter.GaussianBlur(0.6*k))).astype(np.float32)/255
    yy=np.arange(H)[:,None].astype(np.float32)/k
    base=np.dstack([np.full((H,W),v,np.float32) for v in (17,18,21)])
    base*= (1.12-0.25*np.clip((yy-430)/100,0,1))[...,None]      # top slightly lighter
    rim=Image.new("L",(W,H),0); d=ImageDraw.Draw(rim)
    d.line(q[:2],fill=255,width=max(1,int(1.4*k))); d.line([q[3],q[0]],fill=160,width=max(1,int(1.2*k)))
    r=np.asarray(rim.filter(ImageFilter.GaussianBlur(0.4*k))).astype(np.float32)/255
    base=base+r[...,None]*np.array([55,58,66],np.float32)
    arr=np.asarray(im).astype(np.float32)
    arr[...,:3]=arr[...,:3]*(1-a[...,None])+base*a[...,None]
    Image.fromarray(np.clip(arr,0,255).astype(np.uint8)).save(P+dst,quality=88 if k==1 else 86,method=6)
    if k==2: Image.fromarray(np.clip(arr[...,:3],0,255).astype(np.uint8)).crop((2580,800,3200,1200)).save("holder.jpg")
print("ok")
