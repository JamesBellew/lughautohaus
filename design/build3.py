import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
car=Image.open(P+"911-v3.webp").convert("RGBA"); cw,ch=car.size
arr=np.asarray(car).astype(np.float32)/255; rgb=arr[...,:3]; alpha=arr[...,3]

# Shapes traced in 1600px space
SIDE_GLASS=[(198,160),(230,120),(270,90),(310,72),(360,60),(410,55),(455,60),(478,68),(500,120),(520,170),(534,212),(420,202),(360,193),(300,187),(240,181),(205,170)]
WINDSCREEN=[(516,42),(620,30),(760,24),(880,28),(1060,180),(1062,190),(900,206),(760,214),(580,214),(562,170),(538,95)]
FAR_GLASS=[(905,30),(960,40),(1050,100),(1110,160),(1112,192),(1075,186)]
REAR_WHEEL=[(27,300),(32,265),(48,252),(70,246),(95,252),(115,268),(130,292),(142,330),(150,380),(156,430),(160,480),(163,522),(150,548),(80,552),(42,522),(30,450),(27,380)]
FRONT_WHEEL=[(700,350),(730,357),(750,367),(766,384),(776,399),(786,421),(792,448),(797,478),(802,510),(805,540),(798,612),(772,673),(731,703),(689,703),(648,673),(617,612),(602,540),(602,470),(612,418),(638,372),(670,354)]
PLATE=[(1360,454),(1510,432),(1507,506),(1357,532)]
BADGE=[(1342.5,369.5),(1347.5,365.8),(1356,365.6),(1363,367.3),(1370,371.5),(1375.5,376.5),(1377.3,382.5),(1375.5,386.8),(1369,388),(1362,386),(1352,380.5),(1345,375)]
GRILLE_C=[(962,503),(1262,496),(1258,594),(990,598),(962,562)]
GRILLE_R=[(1298,522),(1545,514),(1542,578),(1303,598)]
# bands of body-coloured bumper in deep shadow: always paint
FORCE=[[(948,480),(1300,474),(1300,496),(950,506)],[(1292,462),(1356,460),(1356,522),(1294,524)],[(1512,520),(1598,505),(1600,560),(1552,580),(1514,536)],[(965,595),(1300,590),(1300,628),(975,632)],[(1305,588),(1552,584),(1555,606),(1310,610)]]
LAMP_N=[(853.8, 318.8), (857.5, 303.8), (865.0, 292.5), (875.0, 283.0), (887.5, 279.5), (905.0, 279.0), (925.0, 281.0), (945.0, 285.5), (965.0, 292.5), (985.0, 302.0), (1002.5, 313.0), (1017.5, 327.5), (1030.0, 342.5), (1040.0, 360.0), (1044.5, 375.0), (1043.8, 390.0), (1038.8, 404.5), (1030.0, 413.8), (1017.5, 420.0), (1000.0, 422.0), (980.0, 420.0), (960.0, 415.0), (940.0, 405.0), (920.0, 392.5), (902.5, 380.0), (885.0, 366.2), (870.0, 351.2), (860.0, 337.5)]
LAMP_F=[(1414, 214), (1450, 227), (1478, 241), (1497, 258), (1512, 279), (1525, 301), (1534, 321), (1538, 342), (1535, 343), (1515, 331), (1492.5, 317.5), (1470, 302.5), (1450, 285), (1432.5, 265), (1420, 242.5), (1415, 225)]
EXCL=[GRILLE_C,GRILLE_R,SIDE_GLASS,WINDSCREEN,FAR_GLASS,REAR_WHEEL,FRONT_WHEEL,PLATE,LAMP_N,LAMP_F]

ex=Image.new("L",car.size,0); d=ImageDraw.Draw(ex)
for p in EXCL: d.polygon(p,fill=255)
ex=ex.filter(ImageFilter.MaxFilter(3))   # 1px safety margin
ImageDraw.Draw(ex).polygon(BADGE,fill=255)   # badge traced exactly, no margin
ex=np.asarray(ex)>0

mx=rgb.max(-1); mn=rgb.min(-1); lum=rgb@np.array([0.2126,0.7152,0.0722])
sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
body=alpha>0.6
m=body&(lum>0.11)&(sat<0.34)&~ex
# close small gaps and fill speckle holes (keeps grilles/intakes, which are big)
m=ndi.binary_closing(m,structure=np.ones((5,5)),iterations=1)
holes=ndi.binary_fill_holes(m)&~m
lab,n=ndi.label(holes); sizes=ndi.sum(holes,lab,range(1,n+1))
small=np.isin(lab,np.where(sizes<900)[0]+1)
fz=Image.new("L",car.size,0); dz=ImageDraw.Draw(fz)
for p in FORCE: dz.polygon(p,fill=255)
m=(m|small|(np.asarray(fz)>0))&body&~ex
# drop tiny islands (specks of "paint" inside grilles/tyres)
lab,n=ndi.label(m); sizes=ndi.sum(m,lab,range(1,n+1)); m=np.isin(lab,np.where(sizes>400)[0]+1)

mask=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
mask=Image.fromarray(np.minimum(np.asarray(mask),(alpha*255).astype(np.uint8)))
o=Image.new("RGBA",car.size,(0,0,0,0)); o.putalpha(mask); o.save(P+"911-paint-mask-v8.png",optimize=True)
lm=Image.new("L",car.size,0); dl=ImageDraw.Draw(lm); dl.polygon(LAMP_N,fill=255); dl.polygon(LAMP_F,fill=255)
lm=Image.fromarray((np.asarray(lm.filter(ImageFilter.GaussianBlur(0.9)))*(alpha>0.5)).astype(np.uint8))
ol=Image.new("RGBA",car.size,(0,0,0,0)); ol.putalpha(lm); ol.save(P+"911-lights-mask-v8.png",optimize=True)

bg=Image.new("RGB",car.size,(20,20,22)); bg.paste(car,(0,0),car); bg.paste((40,170,230),(0,0),mask.point(lambda v:int(v*0.75)))
bg.save("cov_full.png"); bg.resize((900,396)).save("cov.jpg"); print("ok")
