// Split-tone grade: cool slate shadows, warm amber bloom, gentle vignette.
const sharp = require("sharp");
async function grade(src, out, o) {
  const base = sharp(src);
  const { width: W, height: H } = await base.metadata();
  const w = o.width || W, h = Math.round(H * (w / W));
  const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
  const cool = svg(`<rect width="100%" height="100%" fill="${o.cool}" fill-opacity="${o.coolAmt}"/>`);
  const sky = svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${o.sky}" stop-opacity="${o.skyAmt}"/><stop offset="0.55" stop-color="${o.sky}" stop-opacity="0"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>`);
  const warm = svg(`<defs><radialGradient id="r" cx="${o.wx}" cy="${o.wy}" r="${o.wr}" gradientTransform="translate(${o.wx} ${o.wy}) scale(1 ${o.wsy || 0.55}) translate(-${o.wx} -${o.wy})">
      <stop offset="0" stop-color="${o.warm}" stop-opacity="${o.warmAmt}"/><stop offset="1" stop-color="${o.warm}" stop-opacity="0"/></radialGradient></defs>
      <rect width="100%" height="100%" fill="url(#r)"/>`);
  const low = svg(`<defs><linearGradient id="l" x1="${o.lx1||0}" y1="1" x2="${o.lx2||0.35}" y2="${o.ly2||0.35}">
      <stop offset="0" stop-color="${o.low||'#000'}" stop-opacity="${o.lowAmt||0}"/><stop offset="1" stop-color="${o.low||'#000'}" stop-opacity="0"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#l)"/>`);
  const vig = svg(`<defs><radialGradient id="v" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o.vig}"/></radialGradient></defs>
      <rect width="100%" height="100%" fill="url(#v)"/>`);
  await base
    .resize(w)
    .modulate({ saturation: o.sat, brightness: o.bright })
    .composite([
      { input: cool, blend: "soft-light" },
      { input: sky, blend: "screen" },
      { input: warm, blend: o.warmBlend || "screen" },
      { input: low, blend: o.lowBlend || "soft-light" },
      { input: vig, blend: "multiply" },
    ])
    .jpeg({ quality: o.q || 84, mozjpeg: true })
    .toFile(out);
}
module.exports = { grade };
if (require.main === module) {
  const [src, out, json] = process.argv.slice(2);
  grade(src, out, JSON.parse(json)).then(() => console.log("ok", out));
}
