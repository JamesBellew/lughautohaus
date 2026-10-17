import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from mask import im, W, H, s, EXCL_E, EXCL_R, EXCL_P
OUT="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes"; TW=1600
car=im.resize((TW,int(TW*H/W)),Image.LANCZOS); k=TW/W; cw,ch=car.size

# Headlamp outlines traced in 1600px space
LAMP_N=[(853,320),(866,296),(880,280),(920,274),(960,281),(997,299),(1023,326),(1040,356),(1046,383),(1039,408),(1020,421),(993,424),(963,419),(933,406),(903,384),(877,361),(858,340)]
LAMP_F=[(1410,217),(1450,228),(1478,242),(1497,259),(1512,280),(1525,302),(1534,322),(1538,343),(1521,346),(1495,331),(1465,311),(1438,286),(1418,262),(1405,239)]

# ── clean silhouette ──
A=car.getchannel("A")
d=ImageDraw.Draw(A)
roof=[(330,26),(360,17),(420,11),(520,8),(700,8),(800,11),(870,17),(905,28),(960,60)]
d.polygon([(0,0),(330,0)]+[(x,y) for x,y in roof]+[(960,0)],fill=0)   # strip above the roofline
d.polygon([(330,0),(330,26),(300,40),(0,40)],fill=0) if False else None
d.polygon([(0,538),(250,538),(250,ch),(0,ch)],fill=0)                  # shadow under rear tyre
a=np.asarray(A).astype(np.float32)/255
hard=Image.fromarray(((a>0.5)*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7))
A2=hard.filter(ImageFilter.GaussianBlur(1.1))
car.putalpha(A2)

# ── paint mask ──
arr=np.asarray(car).astype(np.float32)/255; rgb=arr[...,:3]; alpha=arr[...,3]
mx=rgb.max(-1); mn=rgb.min(-1); lum=rgb@np.array([0.2126,0.7152,0.0722])
sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
m=((alpha>0.6)&(lum>0.13)&(lum<0.99)&(sat<0.32)).astype(np.float32)
ex=Image.new("L",car.size,0); d=ImageDraw.Draw(ex)
for cx,cy,rx,ry in EXCL_E[:2]: d.ellipse([(cx-rx)*s*k,(cy-ry)*s*k,(cx+rx)*s*k,(cy+ry)*s*k],fill=255)
for r in EXCL_R: d.rectangle([v*s*k for v in r],fill=255)
for p in EXCL_P: d.polygon([(x*s*k,y*s*k) for x,y in p],fill=255)
d.polygon(LAMP_N,fill=255); d.polygon(LAMP_F,fill=255)
m*=(np.asarray(ex)==0)
mask=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.3))
mask=Image.fromarray(np.minimum(np.asarray(mask),np.asarray(A2)).astype(np.uint8))
o=Image.new("RGBA",car.size,(0,0,0,0)); o.putalpha(mask); o.save(OUT+"/911-paint-mask-v3.png",optimize=True)

# ── lens mask: exactly the traced lamps ──
lm=Image.new("L",car.size,0); d2=ImageDraw.Draw(lm); d2.polygon(LAMP_N,fill=255); d2.polygon(LAMP_F,fill=255)
lm=lm.filter(ImageFilter.GaussianBlur(1.2))
o2=Image.new("RGBA",car.size,(0,0,0,0)); o2.putalpha(lm); o2.save(OUT+"/911-lights-mask-v3.png",optimize=True)
car.save(OUT+"/911-v3.webp",quality=88,method=6)

bg=Image.new("RGB",car.size,(20,20,22)); bg.paste(car,(0,0),car)
bg.paste((255,40,40),(0,0),mask.point(lambda v:int(v*0.55))); bg.paste((60,140,255),(0,0),lm.point(lambda v:int(v*0.6)))
bg.save("mask_full.png"); print("ok", car.size)
