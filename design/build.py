import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from mask import *
OUT="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes"; TW=1600
car=im.resize((TW,int(TW*H/W)),Image.LANCZOS); k=TW/W
a=np.asarray(car).astype(np.float32)/255; rgb=a[...,:3]; alpha=a[...,3]
mx=rgb.max(-1); mn=rgb.min(-1); lum=rgb@np.array([0.2126,0.7152,0.0722])
sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
m=((alpha>0.6)&(lum>0.13)&(lum<0.99)&(sat<0.32)).astype(np.float32)
ex=Image.new("L",car.size,0); d=ImageDraw.Draw(ex)
for cx,cy,rx,ry in EXCL_E: d.ellipse([(cx-rx)*s*k,(cy-ry)*s*k,(cx+rx)*s*k,(cy+ry)*s*k],fill=255)
for r in EXCL_R: d.rectangle([v*s*k for v in r],fill=255)
for p in EXCL_P: d.polygon([(x*s*k,y*s*k) for x,y in p],fill=255)
m*=(np.asarray(ex)==0)
mask=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.6))
o=Image.new("RGBA",car.size,(0,0,0,0)); o.putalpha(mask); o.save(OUT+"/911-paint-mask.png",optimize=True)
lm=Image.new("L",car.size,0); d2=ImageDraw.Draw(lm)
for cx,cy,rx,ry in [EXCL_E[2],EXCL_E[3]]: d2.ellipse([(cx-rx*0.92)*s*k,(cy-ry*0.85)*s*k,(cx+rx*0.92)*s*k,(cy+ry*0.85)*s*k],fill=255)
lm=Image.fromarray((np.asarray(lm)*(alpha>0.5)).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
o2=Image.new("RGBA",car.size,(0,0,0,0)); o2.putalpha(lm); o2.save(OUT+"/911-lights-mask.png",optimize=True)
car.save(OUT+"/911.webp",quality=86,method=6)
bg=Image.new("RGB",car.size,(20,20,22)); red=Image.new("RGB",car.size,(255,40,40)); bg.paste(car,(0,0),car); bg.paste(red,(0,0),mask.point(lambda v:int(v*0.6))); bg.paste((60,140,255),(0,0),lm.point(lambda v:int(v*0.6))); bg.resize((900,int(900*car.size[1]/car.size[0]))).save("mask_prev.jpg")
print(car.size)
