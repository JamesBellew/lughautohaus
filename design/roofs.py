# Restore roof tops clipped by the original crops, using the source photos.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
SRC="/Users/jamesbellew/Documents/Websites/Freelance/luxride/design/source-images/"
def polymask(size,pts):
    im=Image.new("L",size,0); ImageDraw.Draw(im).polygon(pts,fill=255); return im
def extend(old,src,affine,size,dy,pts):
    """old: RGBA image; paste at dy on canvas `size`; add roof polygon pts (canvas coords) using source pixels."""
    T=np.asarray(src.transform(size,Image.AFFINE,affine,Image.BICUBIC)).astype(np.float32)
    can=np.zeros((size[1],size[0],4),np.float32); o=np.asarray(old).astype(np.float32)
    can[dy:dy+o.shape[0],:o.shape[1]]=o
    r=np.asarray(polymask(size,pts).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
    a=can[...,3:]; w=(a/255)
    rgb=can[...,:3]*w+T*(1-w)            # keep the retouched pixels wherever the old cut had them
    alpha=np.maximum(a[...,0],r)
    return Image.fromarray(np.dstack([rgb,alpha]).clip(0,255).astype(np.uint8)), r
# ---- BMW: source crop at (132,316), k=3571/3200 x, 1601/1435 y at 2x; prepend 32 rows (2x)
S=Image.open(SRC+"m3-competition-g80-img1176-commons.jpg").convert("RGB")
kx,ky=3571/3200,1601/1435; DY=12
# M3 roof silhouette traced on the source photo (the band above it is the car parked behind)
edge=[(930,326),(960,323),(1000,321),(1100,320),(1200,318),(1250,316),(1300,314),(1360,311),(1400,309),(1470,307),(1550,306),(1650,306),(1700,307),(1750,308),(1800,311),(1850,314),(1900,318),(1950,326),(2000,331),(2050,337),(2100,345),(2150,355),(2200,368),(2240,380)]
roof=edge+[(x,y+60) for x,y in reversed(edge)]
to2=lambda x,y:((x-132)/kx,(y-316)/ky+DY)
old=Image.open(P+"bmw-v2@2x.webp").convert("RGBA")
size=(3200,old.size[1]+DY)
b2,_=extend(old,S,(kx,0,132,0,ky,316-DY*ky),size,DY,[to2(*p) for p in roof])
b2.save(P+"bmw-v3@2x.webp",quality=86,method=6)
b2.resize((1600,size[1]//2+size[1]%2),Image.LANCZOS).save(P+"bmw-v3.webp",quality=88,method=6)
print("bmw",b2.size,Image.open(P+"bmw-v3.webp").size)
# ---- Porsche: source crop at (83,142), k=3668/3200; same canvas
S=Image.open(SRC+"911-turbo-s-arctic-grey-commons.jpg").convert("RGB")
k=3668/3200
roof=[(860,32),(900,26),(950,21),(1000,16),(1050,12),(1100,9),(1150,7),(1200,5),(1250,3),(1300,2),(1400,1),(1470,2),(1500,5),(1540,8),(1600,12),(1650,18),(1700,24),(1720,28),(860,40)]
old=Image.open(P+"911-v7@2x.webp").convert("RGBA")
p2,r=extend(old,S,(k,0,83,0,k,142),old.size,0,roof)
p2.save(P+"911-v8@2x.webp",quality=86,method=6)
p1=p2.resize((1600,704),Image.LANCZOS); p1.save(P+"911-v8.webp",quality=88,method=6)
# paint mask: old mask plus the restored roof strip
m=np.asarray(Image.open(P+"911-paint-mask-v17.png"))[...,3].astype(np.float32)
r1=np.asarray(Image.fromarray(r.astype(np.uint8)).resize((1600,704),Image.LANCZOS)).astype(np.float32)
a1=np.asarray(p1)[...,3].astype(np.float32)
nm=np.minimum(np.maximum(m,r1),a1).astype(np.uint8)
o=Image.new("RGBA",(1600,704),(0,0,0,0)); o.putalpha(Image.fromarray(nm)); o.save(P+"911-paint-mask-v18.png",optimize=True)
Image.open(P+"911-lights-mask-v17.png").save(P+"911-lights-mask-v18.png",optimize=True)
print("911 ok")
