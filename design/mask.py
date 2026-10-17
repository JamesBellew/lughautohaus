import numpy as np
from PIL import Image, ImageDraw, ImageFilter
im=Image.open("911clean.png").convert("RGBA"); W,H=im.size; s=3726/900  # coords measured on the uncropped 3726px cut
def P(pts): return [(x*s,y*s) for x,y in pts]
def E(cx,cy,rx,ry): return [(cx-rx)*s,(cy-ry)*s,(cx+rx)*s,(cy+ry)*s]
EXCL_E=[(52,224,47,80),(392,294,66,90),(528,193,49,39),(812,151,25,27)]
EXCL_R=[(750,242,838,296)]
EXCL_P=[[(116,66),(170,42),(292,27),(470,18),(556,44),(608,100),(330,126),(298,110),(116,102)],
        [(84,118),(112,118),(116,186),(90,186)]]  # side intake
def shapes(draw,fill):
    for e in EXCL_E: draw.ellipse(E(*e),fill=fill)
    for r in EXCL_R: draw.rectangle([v*s for v in r],fill=fill)
    for p in EXCL_P: draw.polygon(P(p),fill=fill)
if __name__=="__main__":
    prev=im.copy(); d=ImageDraw.Draw(prev,"RGBA"); shapes(d,(255,0,0,110))
    bg=Image.new("RGB",im.size,(30,30,32)); bg.paste(prev,(0,0),prev); bg.resize((900,int(900*H/W))).save("excl_prev.jpg")
