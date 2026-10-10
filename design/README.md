# Hero colour grade

The hero photos are split-toned to match the Lugh mural: storm-slate blue in
the shadows, warm bronze where the light falls (the 911s' tail-lights).

- Masters: `source-images/` (originals from Unsplash). `hero-911.jpg` is desktop/landscape, `911-street-portrait.jpg` is phones/portrait tablets
- Script: `grade.cjs` (sharp; run from the project root so it resolves `node_modules`)

```bash
node -e '
const {grade}=require("./design/grade.cjs");
const cool={cool:"#3d6a86",coolAmt:0.72,sky:"#8fb4cc",skyAmt:0.14,sat:0.9,bright:1,q:84};
grade("design/source-images/hero-911.jpg","public/images/hero-911-graded.jpg",{...cool,width:2000,warm:"#ea8a40",warmAmt:0.8,wx:0.5,wy:0.455,wr:0.48,wsy:0.16,vig:0.42});
grade("design/source-images/911-street-portrait.jpg","public/images/911-street-graded.jpg",{...cool,width:1600,warm:"#ea8a40",warmAmt:0.85,wx:0.5,wy:0.54,wr:0.55,wsy:0.09,vig:0.4});
'
```

`coolAmt` sets how blue the image goes; `warmAmt` sets the strength of the amber glow.
