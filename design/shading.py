import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
P="/Users/jamesbellew/Documents/Websites/Freelance/luxride/public/finishes/"
car=np.asarray(Image.open(P+"911-v8.webp").convert("RGBA")).astype(np.float32)/255
m=np.asarray(Image.open(P+"911-paint-mask-v18.png"))[...,3].astype(np.float32)/255
L=car[...,:3]@np.array([0.2126,0.7152,0.0722],np.float32)

def blur_in_mask(x,sig):
    # normalised blur so the paint edge doesn't pull in background/glass values
    w=gaussian_filter(m,sig)+1e-4
    return gaussian_filter(x*m,sig)/w

# fine structure: panel gaps, shut lines, creases (dark thin lines + crisp edges)
fine=L-blur_in_mask(L,2.5)
# broad form: overall light/shade of the body, reflections rolled off
broad=blur_in_mask(L,10)
hi=np.percentile(broad[m>0.5],70)
broad=np.where(broad>hi, hi+(broad-hi)*0.25, broad)        # compress sky reflections
lo,hi2=np.percentile(broad[m>0.5],[2,98])
broad=(broad-lo)/(hi2-lo)
matte=np.clip(0.30+0.42*broad+1.6*fine,0,1)               # satin base + form + creases
# detail overlay: 0.5 neutral, darker in gaps/creases, lighter on crisp edges
detail=np.clip(0.5+2.4*fine,0,1)

def save(arr,name):
    g=(arr*255).astype(np.uint8); Image.fromarray(np.dstack([g,g,g])).save(P+name,quality=90,method=6)
save(matte,"911-matte-v18.webp"); save(detail,"911-detail-v18.webp")
# preview: matte masked on dark bg, and detail
bg=np.full(L.shape,0.08); prev=bg*(1-m)+matte*m
Image.fromarray((prev*255).astype(np.uint8)).resize((900,396)).save("matte_prev.jpg")
Image.fromarray((detail*255).astype(np.uint8)).resize((900,396)).save("detail_prev.jpg")
print("ok")
