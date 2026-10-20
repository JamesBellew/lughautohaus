import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
car=Image.open(P+"bmw-v3.webp").convert("RGBA"); W,H=car.size
arr=np.asarray(car).astype(np.float32)/255; rgb=arr[...,:3]; alpha=arr[...,3]
DY=6   # rows added above the roof; shapes below are traced in the original 717px frame
# shapes in 1600px space
SIDE_GLASS=[(160,168),(165,140),(180,90),(220,55),(270,35),(340,22),(420,22),(500,35),(530,50),(552,85),(572,125),(592,165),(608,210),(560,206),(470,200),(380,192),(300,183),(220,175)]
WINDSCREEN=[(560,46),(690,35),(840,30),(930,32),(965,45),(1040,110),(1100,165),(1140,190),(1090,193),(940,198),(790,206),(640,216),(600,140)]
LAMP_N=[(858,374),(880,364),(920,360),(970,361),(1030,372),(1100,384),(1170,395),(1200,404),(1208,412),(1198,424),(1150,431),(1090,437),(1040,437),(985,430),(945,421),(910,406),(882,390)]
LAMP_F=[(1512,383),(1525,362),(1548,348),(1565,342),(1570,355),(1566,378),(1552,392),(1530,396)]
REAR_WHEEL=[(95,288),(135,312),(152,355),(162,395),(170,470),(160,530),(130,560),(95,560),(60,520),(47,445),(50,390),(62,330)]
FRONT_WHEEL=[(700,382),(730,370),(760,368),(790,374),(813,390),(832,410),(845,433),(853,458),(859,490),(863,530),(864,580),(863,640),(860,690),(850,717),(720,717),(690,660),(670,580),(668,480),(680,420)]
KID_L=[(1260,420),(1267,395),(1310,385),(1360,387),(1385,420),(1392,490),(1390,590),(1370,610),(1300,610),(1265,565),(1257,480)]
KID_R=[(1402,455),(1410,385),(1445,372),(1490,372),(1510,395),(1520,460),(1515,540),(1490,590),(1445,602),(1410,602),(1400,540)]
INT_L=[(1095,575),(1120,545),(1200,538),(1258,545),(1268,600),(1275,630),(1180,632),(1110,615)]
INT_R=[(1500,520),(1530,505),(1558,497),(1562,540),(1552,585),(1520,600),(1500,590)]
def poly(pts, k=1):
    im=Image.new("L",(W,H),0); ImageDraw.Draw(im).polygon([(x*k,(y+DY)*k) for x,y in pts],fill=255); return np.asarray(im)>0
def ell(cx,cy,rx,ry):
    im=Image.new("L",(W,H),0); ImageDraw.Draw(im).ellipse([cx-rx,cy+DY-ry,cx+rx,cy+DY+ry],fill=255); return np.asarray(im)>0
WH=poly(REAR_WHEEL)|poly(FRONT_WHEEL)
ex=poly(SIDE_GLASS)|poly(WINDSCREEN)|poly(LAMP_N)|poly(LAMP_F)|ndi.binary_erosion(poly(KID_L)|poly(KID_R),iterations=5)|poly(INT_L)|poly(INT_R)
ex|=poly([(1357,363),(1360,358),(1366,356),(1374,356),(1382,359),(1389,364),(1393,370),(1393,376),(1389,381),(1382,383),(1373,382),(1365,378),(1359,372),(1356,367)])   # roundel
ex|=poly([(1462,390),(1489,389),(1489,405),(1462,406)])   # M badge
ex=ndi.binary_dilation(ex,iterations=1)
mx=rgb.max(-1); mn=rgb.min(-1); lum=rgb@np.array([0.2126,0.7152,0.0722])
sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
body=alpha>0.6
m=body&(lum>0.2)&(sat<0.3)&~ex
# inside the wheel outlines keep only clearly light body (arch lips); tyres/rims are dark
m&=~WH
m=ndi.binary_closing(m,structure=np.ones((5,5)))
holes=ndi.binary_fill_holes(m)&~m
lab,n=ndi.label(holes); sz=ndi.sum(holes,lab,range(1,n+1)); m|=np.isin(lab,np.where(sz<700)[0]+1)
m&=body&~ex&~WH
MIRROR_N=[(467,150),(475,143),(500,140),(530,140),(545,145),(560,158),(560,172),(552,180),(548,192),(544,202),(534,208),(510,210),(480,207),(468,198),(468,180),(465,165)]
m|=poly(MIRROR_N)&(alpha>0.5)
ROOF=[(520,-20),(990,-20),(990,42),(945,33),(900,30),(840,30),(760,33),(680,37),(600,42),(565,46),(520,47)]
m|=poly(ROOF)&(alpha>0.4)&~poly(SIDE_GLASS)
m|=poly([(1545,468),(1592,468),(1592,525),(1560,525)])&body&(lum>0.3)   # far bumper corner
m|=poly([(1250,612),(1592,555),(1592,645),(1250,685)])&body&(lum>0.3)&~ex   # lower bumper lip
lab,n=ndi.label(m); sz=ndi.sum(m,lab,range(1,n+1)); m=np.isin(lab,np.where(sz>500)[0]+1)
mask=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
mask=Image.fromarray(np.minimum(np.asarray(mask),(alpha*255).astype(np.uint8)))
o=Image.new("RGBA",(W,H),(0,0,0,0)); o.putalpha(mask); o.save(P+"bmw-paint-mask-v4.png",optimize=True)
lm=Image.new("L",(W,H),0); d=ImageDraw.Draw(lm); d.polygon([(x,y+DY) for x,y in LAMP_N],fill=255); d.polygon([(x,y+DY) for x,y in LAMP_F],fill=255)
lm=Image.fromarray((np.asarray(lm.filter(ImageFilter.GaussianBlur(0.9)))*(alpha>0.5)).astype(np.uint8))
o2=Image.new("RGBA",(W,H),(0,0,0,0)); o2.putalpha(lm); o2.save(P+"bmw-lights-mask-v4.png",optimize=True)
vis=(rgb*255*0.4).astype(np.uint8); vis[m]=[40,220,90]; vis[np.asarray(lm)>128]=[60,140,255]; vis[alpha<0.5]=[255,0,255]
Image.fromarray(vis).save("bmw_cov.png"); Image.fromarray(vis).resize((1000,int(1000*H/W))).save("bmw_cov.jpg")
print("ok",W,H)
