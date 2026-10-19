import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
car=Image.open(P+"911-v7.webp").convert("RGBA"); cw,ch=car.size
arr=np.asarray(car).astype(np.float32)/255; rgb=arr[...,:3]; alpha=arr[...,3]

# Shapes traced in 1600px space
SIDE_GLASS=[(196,146),(230,120),(270,90),(310,72),(360,60),(410,55),(455,60),(478,68),(500,120),(520,170),(534,212),(420,202),(360,181),(310,175),(280,170),(240,162),(205,151)]
WINDSCREEN=[(518,62),(522,56),(560,53),(600,49),(650,45),(700,41),(750,37),(800,33),(850,30),(893,34),(960,105),(1022,178),(1000,190),(900,198),(800,205),(700,210),(578,214),(565,180),(548,140),(532,100),(520,70)]
FAR_GLASS=[(1600,0),(1601,0),(1601,1)]  # replaced by FAR_PILLAR rule below
REAR_WHEEL=[(27,300),(32,265),(48,252),(70,246),(95,252),(115,268),(130,292),(142,330),(150,380),(156,430),(160,480),(163,522),(150,548),(80,552),(42,522),(30,450),(27,380)]
FRONT_WHEEL=[(700,350),(730,357),(754,365),(770,382),(781,398),(790,420),(797,448),(802,478),(806,510),(809,540),(798,612),(772,673),(731,703),(689,703),(648,673),(617,612),(602,540),(602,470),(612,418),(638,372),(670,354)]
PLATE=[(1360,454),(1510,432),(1507,506),(1357,532)]
BADGE=[(1342.5,369.5),(1347.5,365.8),(1356,365.6),(1363,367.3),(1370,371.5),(1375.5,376.5),(1377.3,382.5),(1375.5,386.8),(1369,388),(1362,386),(1352,380.5),(1345,375)]
GRILLE_C=[(962,503),(1262,496),(1258,594),(990,598),(962,562)]
GRILLE_R=[(1298,522),(1545,514),(1542,578),(1303,598)]
# bands of body-coloured bumper in deep shadow: always paint
FORCE=[[(948,480),(1300,474),(1300,496),(950,506)],[(1292,462),(1356,460),(1356,522),(1294,524)],[(1512,520),(1598,505),(1600,560),(1552,580),(1514,536)],[(965,595),(1300,590),(1300,628),(975,632)],[(1305,588),(1552,584),(1555,606),(1310,610)]]
LAMP_N=[(853.8, 318.8), (857.5, 303.8), (865.0, 292.5), (875.0, 283.0), (887.5, 279.5), (905.0, 279.0), (925.0, 281.0), (945.0, 285.5), (965.0, 292.5), (985.0, 302.0), (1002.5, 313.0), (1017.5, 327.5), (1030.0, 342.5), (1040.0, 360.0), (1044.5, 375.0), (1043.8, 390.0), (1038.8, 404.5), (1030.0, 413.8), (1017.5, 420.0), (1000.0, 422.0), (980.0, 420.0), (960.0, 415.0), (940.0, 405.0), (920.0, 392.5), (902.5, 380.0), (885.0, 366.2), (870.0, 351.2), (860.0, 337.5)]
LAMP_F=[(1414, 214), (1450, 227), (1478, 241), (1497, 258), (1512, 279), (1525, 301), (1534, 321), (1538, 342), (1535, 343), (1515, 331), (1492.5, 317.5), (1470, 302.5), (1450, 285), (1432.5, 265), (1420, 242.5), (1415, 225)]
EXCL=[SIDE_GLASS,WINDSCREEN,FAR_GLASS,REAR_WHEEL,FRONT_WHEEL,LAMP_N,LAMP_F]

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

# ── Front bumper: hand-traced. Body-coloured parts here sit in deep shadow, so
# brightness can't tell them from trim. Paint the whole bumper except the black
# trim, which is traced explicitly (1600px space).
BUMPER_ZONE=[(930,468),(1150,462),(1355,452),(1600,415),(1600,704),(930,704)]
TRIM=[
  # left intake: black side block + grille, up to the body-coloured strut
  [(958,620),(954,560),(958,528),(966,514),(980,507),(1003,505),(1005,489),(1100,485),(1168,486),(1205,492),(1222,504),(1240,512),(1249,528),(1240,592),(1220,600),(1100,605),(1000,614),(975,621)],
  # black strip above the centre intake
  [(1222,505),(1350,505),(1516,481),(1516,502),(1350,526),(1250,528),(1240,512)],
  # centre intake under the plate, plus the black panel right of the plate
  [(1298,528),(1350,526),(1516,502),(1516,484),(1522,484),(1541,486),(1543,560),(1440,578),(1360,588),(1303,600)],
  # right side intake with its slats
  [(1550,525),(1548,478),(1562,456),(1588,444),(1592,494),(1575,512),(1560,522)],
]
bz=Image.new("L",car.size,0); ImageDraw.Draw(bz).polygon(BUMPER_ZONE,fill=255)
tr=Image.new("L",car.size,0); dt=ImageDraw.Draw(tr)
for p in TRIM: dt.polygon(p,fill=255)
bz=np.asarray(bz)>0; tr=np.asarray(tr)>0
m=np.where(bz, body&~tr&~ex, m)

def poly(pts):
    im=Image.new("L",car.size,0); ImageDraw.Draw(im).polygon(pts,fill=255); return np.asarray(im)>0
# Far A-pillar: only its light edges are paint; dark band between is glass
# Far A-pillar: one clean body-coloured band from the windscreen edge outward
FAR_PILLAR=[(893,30),(906,40),(938,100),(988,150),(1022,182),(1045,180),(1060,190),(1110,190),(1110,90),(1000,30),(905,18)]
m=m|(poly(FAR_PILLAR)&body)
# Rear wheel arch lips (shadowed body either side of the tyre)
LIP_R=[(118,262),(135,272),(150,300),(160,350),(166,400),(170,450),(172,500),(160,530),(125,530),(132,500),(138,450),(141,400),(138,350),(130,300),(120,275)]
LIP_L=[(40,240),(55,232),(48,262),(40,300),(34,350),(33,400),(38,450),(48,490),(40,495),(25,450),(20,400),(20,330),(25,280)]
# only where the pixel has the paint's blue tint — tyre rubber is neutral
tint=(arr[...,2]-arr[...,0])*255
m=m|((poly(LIP_R)|poly(LIP_L))&body&(tint>=8))
# Roof band above the windscreen seal: always paint
ROOF=[(420,48),(430,0),(905,0),(893,32),(850,30),(800,33),(700,41),(600,49),(522,56),(470,52),(440,52)]
m=m|(poly(ROOF)&body)
# Mirror heads (body-coloured caps); the black foot below stays unpainted
MIRROR_N=[(360,198),(366,188),(380,180),(400,172),(425,164),(445,160),(462,164),(477,174),(489,190),(497,206),(493,212),(470,214),(430,214),(395,214),(370,214),(362,208)]
MIRROR_F=[(1042,128),(1055,116),(1075,112),(1093,118),(1106,130),(1112,147),(1110,163),(1100,172),(1080,176),(1060,176),(1046,168),(1040,150)]
m=m|((poly(MIRROR_N)|poly(MIRROR_F))&body)
# Indicator lens stays its own colour
INDICATOR=[(772,392),(800,398),(830,404),(846,410),(849,417),(842,423),(806,421),(782,417)]
m=m&~poly(INDICATOR)
# Old plate area (now filled): upper half is bumper paint, lower half intake
# (no plate or holder — the bumper area is rebuilt in the photo itself)

mask=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
mask=Image.fromarray(np.minimum(np.asarray(mask),(alpha*255).astype(np.uint8)))
o=Image.new("RGBA",car.size,(0,0,0,0)); o.putalpha(mask); o.save(P+"911-paint-mask-v17.png",optimize=True)
lm=Image.new("L",car.size,0); dl=ImageDraw.Draw(lm); dl.polygon(LAMP_N,fill=255); dl.polygon(LAMP_F,fill=255)
lm=Image.fromarray((np.asarray(lm.filter(ImageFilter.GaussianBlur(0.9)))*(alpha>0.5)).astype(np.uint8))
ol=Image.new("RGBA",car.size,(0,0,0,0)); ol.putalpha(lm); ol.save(P+"911-lights-mask-v17.png",optimize=True)

bg=Image.new("RGB",car.size,(20,20,22)); bg.paste(car,(0,0),car); bg.paste((40,170,230),(0,0),mask.point(lambda v:int(v*0.75)))
bg.save("cov_full.png"); bg.resize((900,396)).save("cov.jpg"); print("ok")
