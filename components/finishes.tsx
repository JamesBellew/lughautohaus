"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, RotateCcw, X } from "lucide-react";
import { series, type Finish, type Series } from "@/lib/finishes";
import { KineticLines, Reveal, useReducedMotionSafe } from "./motion";
import { useQuote } from "./quote-context";

/** Deterministic pseudo-random so textures are stable between renders */
function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function forgedShards(ink: string) {
  const r = rand(7);
  return Array.from({ length: 34 }, (_, i) => {
    const x = r() * 140;
    const y = r() * 140;
    const pts = Array.from({ length: 4 + Math.floor(r() * 3) }, () => {
      const a = r() * Math.PI * 2;
      const d = 6 + r() * 16;
      return `${(x + Math.cos(a) * d).toFixed(1)},${(y + Math.sin(a) * d).toFixed(1)}`;
    }).join(" ");
    return <polygon key={i} points={pts} fill={ink} opacity={0.25 + r() * 0.65} />;
  });
}

function camoBlobs(ink: string, shade: string) {
  const r = rand(19);
  return Array.from({ length: 16 }, (_, i) => {
    const cx = r() * 220;
    const cy = r() * 220;
    const rx = 14 + r() * 30;
    const ry = 9 + r() * 18;
    return (
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={`rotate(${(r() * 180).toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})`}
        fill={i % 3 === 0 ? shade : ink}
        opacity={0.85}
      />
    );
  });
}

function Texture({ f }: { f: Finish }) {
  const id = `tex-${f.id}`;
  const ink = f.ink ?? "#000";
  switch (f.pattern) {
    case "carbon":
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="14" fill={ink} opacity="0.85" />
          <rect x="7" width="7" height="7" fill={ink} opacity="0.45" />
          <rect x="7" y="7" width="7" height="7" fill="#fff" opacity="0.06" />
        </pattern>
      );
    case "forged":
      return (
        <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
          {forgedShards(ink)}
        </pattern>
      );
    case "camo":
      return (
        <pattern id={id} width="220" height="220" patternUnits="userSpaceOnUse">
          {camoBlobs(ink, f.shade ?? ink)}
        </pattern>
      );
    case "damascus":
      return (
        <pattern id={id} width="60" height="24" patternUnits="userSpaceOnUse">
          {[0, 6, 12, 18].map((y) => (
            <path
              key={y}
              d={`M0 ${y + 3} Q15 ${y - 2} 30 ${y + 3} T60 ${y + 3}`}
              stroke={ink}
              strokeWidth="1.4"
              fill="none"
              opacity={0.35 + (y / 24) * 0.4}
            />
          ))}
        </pattern>
      );
    default:
      return null;
  }
}

/* ── Photographic car ───────────────────────────────────────────────
 * A real 911 Turbo S in Arctic Grey, cut out, with a paint mask that
 * covers only body panels. Finishes are layered over the photo inside an
 * isolated group so the real reflections, glass, tyres and chrome survive:
 *   1. matte  – a softened copy of the paint knocks back the speculars
 *   2. tone   – multiply/screen grey moves paint brightness to the target
 *   3. colour – `color` blend sets hue + saturation, keeping the shading
 *   4. texture– pattern films drawn on top, then the photo's own light
 *               soft-lit back over them so they read as wrapped panels
 */
const CAR = "/finishes/911-v3.webp";
const PAINT = "url(/finishes/911-paint-mask-v8.png)";
const LIGHTS = "url(/finishes/911-lights-mask-v8.png)";
/** Satin shading pre-computed from the photo: body form + every crease, no sky reflections */
const MATTE = "/finishes/911-matte-v8.webp";
/** Fine-line map (0.5 = neutral): panel gaps, shut lines and creases */
const DETAIL = "/finishes/911-detail-v8.webp";
const BASE_LUM = 0.5;

/**
 * Per-film tile scale and how strongly the photo's light reveals the pattern.
 * Higher brightness = the pattern shows further into the shadows.
 */
const TILE: Record<string, { size: string; light: string }> = {
  "forged-red": { size: "8% auto", light: "grayscale(1) contrast(1.7) brightness(1.15)" },
  "damascus-black": { size: "12% auto", light: "grayscale(1) contrast(1.9) brightness(0.75)" },
  "carbon-gloss": { size: "7% auto", light: "grayscale(1) contrast(2.1) brightness(0.8)" },
  "carbon-matte": { size: "9% auto", light: "grayscale(1) contrast(1.4) brightness(0.68)" },
  "camo-black": { size: "26% auto", light: "grayscale(1) contrast(1.8) brightness(0.62)" },
}; // average sRGB luminance of the original paint

const masked = (m: string): React.CSSProperties => ({
  maskImage: m,
  WebkitMaskImage: m,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});

function luminance(hex: string) {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return BASE_LUM;
  const n = parseInt(m[1], 16);
  return (((n >> 16) & 255) * 0.2126 + ((n >> 8) & 255) * 0.7152 + (n & 255) * 0.0722) / 255;
}

function Car({
  f,
  lens,
  zoom = false,
  sweepKey,
}: {
  f: Finish;
  lens?: string;
  zoom?: boolean;
  sweepKey: string;
}) {
  const reduce = useReducedMotionSafe();
  const matte = f.surface === "matte";
  const lt = luminance(f.color);
  const tone =
    lt < BASE_LUM
      ? { mode: "multiply" as const, g: Math.max(0.12, lt / BASE_LUM) }
      : { mode: "screen" as const, g: (lt - BASE_LUM) / (1 - BASE_LUM) };
  const grey = Math.round(tone.g * 255);
  const dark = Math.min(1, Math.max(0, (BASE_LUM - lt) / BASE_LUM));
  const light = Math.min(1, Math.max(0, (lt - BASE_LUM) / (1 - BASE_LUM)));
  const paint = masked(PAINT);
  const ease = "background 600ms ease, opacity 600ms ease";

  return (
    <motion.div
      role="img"
      aria-label={zoom ? "Porsche 911 headlight close-up" : `Porsche 911 shown in ${f.name}`}
      className="relative isolate aspect-[1600/704] w-full"
      // Lights series: turn slightly and push in on the near headlamp,
      // centred in the frame. Origin is the lamp's centre in the photo.
      style={{ transformOrigin: "59.3% 49.7%" }}
      animate={
        zoom
          ? { scale: 3.1, x: "-11%", rotate: -4, rotateY: -32 }
          : { scale: 1, x: "0%", rotate: 0, rotateY: 0 }
      }
      transition={{ type: "spring", bounce: 0, duration: reduce ? 0 : 1.1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- layered with CSS masks at the same box */}
      <img src={CAR} alt="" className="absolute inset-0 size-full" draggable={false} />

      {/* 1 · matte: swap the glossy paint for the satin shading map */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MATTE}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 size-full transition-opacity duration-500"
        style={{ ...paint, opacity: matte ? 1 : 0 }}
      />

      {/* 1b · bodywork detail: keeps panel gaps and creases legible in every colour */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={DETAIL}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 size-full transition-opacity duration-500"
        style={{ ...paint, mixBlendMode: "overlay", opacity: matte ? 0.85 : 0.55 }}
      />

      {/* 2 · tone */}
      <div
        className="absolute inset-0"
        style={{ ...paint, background: `rgb(${grey} ${grey} ${grey})`, mixBlendMode: tone.mode, transition: ease }}
      />

      {/* 3 · colour */}
      <div
        className="absolute inset-0"
        style={{
          ...paint,
          background: f.flip ? `linear-gradient(100deg, ${f.flip[0]}, ${f.flip[1]} 50%, ${f.flip[0]})` : f.color,
          mixBlendMode: "color",
          transition: ease,
        }}
      />

      {/* 3b · extremes: very dark paint gets its reflections back, very light paint its shadows */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CAR}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 size-full transition-opacity duration-500"
        style={{
          ...paint,
          filter: "grayscale(1) contrast(2.8) brightness(0.45)",
          mixBlendMode: "screen",
          opacity: dark * (matte ? 0.2 : 0.7),
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MATTE}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 size-full transition-opacity duration-500"
        style={{ ...paint, mixBlendMode: "multiply", opacity: light * 0.6 }}
      />

      {/* 4 · texture films */}
      {f.pattern && (
        <>
          {f.tile ? (
            // Photographic film: seamless tile, scaled so flakes/swirls read at car scale
            // Light-driven film: the tile (light pattern on pure black) is multiplied by the
            // photo's own luminance, then screened onto the dark body. The pattern only
            // glints where light hits the paint and disappears into the shadows.
            <div aria-hidden className="absolute inset-0 isolate" style={{ ...paint, mixBlendMode: "screen" }}>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${f.tile})`,
                  backgroundSize: TILE[f.id]?.size ?? "12% auto",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CAR}
                alt=""
                draggable={false}
                className="absolute inset-0 size-full"
                style={{
                  filter: TILE[f.id]?.light ?? "grayscale(1) contrast(1.9) brightness(0.75)",
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          ) : (
            <svg
              viewBox="0 0 1600 704"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              style={{ ...paint, opacity: 0.9 }}
              aria-hidden
            >
              <defs>
                <Texture f={{ ...f, id: `car-${f.id}` }} />
              </defs>
              <rect width="1600" height="704" fill={`url(#tex-car-${f.id})`} />
            </svg>
          )}
          {/* the photo's own light and shade, laid back over the film */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CAR}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 size-full"
            style={{ ...paint, filter: "grayscale(1) contrast(1.5)", mixBlendMode: "soft-light", opacity: f.tile ? 0.35 : matte ? 0.55 : 0.9 }}
          />
        </>
      )}

      {/* Lights series: tint the headlamp lenses */}
      {lens && (
        <div
          className="absolute inset-0"
          style={{ ...masked(LIGHTS), background: lens, mixBlendMode: "multiply", transition: ease }}
        />
      )}

      {/* Light sweep across the paint on every change */}
      {!reduce && (
        <motion.div
          key={sweepKey}
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          style={{ ...paint, mixBlendMode: "screen" }}
        >
          <motion.div
            className="absolute inset-y-0 w-1/4 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent"
            initial={{ left: "-30%" }}
            animate={{ left: "110%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ opacity: matte ? 0.25 : 1 }}
          />
        </motion.div>
      )}

      {/* grounding shadow */}
      <div className="absolute inset-x-[4%] -bottom-[3%] -z-10 h-[10%] rounded-[50%] bg-black/70 blur-xl" />
    </motion.div>
  );
}

/** Small swatch dot for the build summary */
function BuildDot({ f }: { f: Finish }) {
  const bg = f.flip ? `linear-gradient(135deg, ${f.flip[0]}, ${f.flip[1]})` : f.color;
  return (
    <span
      aria-hidden
      className="size-7 shrink-0 rounded-full ring-1 ring-white/15"
      style={{ background: f.pattern ? `repeating-linear-gradient(45deg, ${f.color} 0 4px, ${f.ink} 4px 8px)` : bg }}
    />
  );
}

function Swatch({ f, on, onPick }: { f: Finish; on: boolean; onPick: () => void }) {
  const bg = f.flip
    ? `linear-gradient(135deg, ${f.flip[0]}, ${f.flip[1]} 55%, ${f.flip[0]})`
    : f.color;
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={onPick}
      aria-pressed={on}
      aria-label={f.name}
      className="group flex flex-col items-start gap-1.5 text-left"
    >
      <span
        className={`press relative block aspect-square w-full overflow-hidden rounded-xl ring-1 transition-[box-shadow,transform] duration-300 ${
          on ? "ring-2 ring-frost ring-offset-2 ring-offset-bg" : "ring-white/10 group-hover:ring-white/30"
        }`}
        style={{ background: bg }}
      >
        {f.tile && (
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: `url(${f.tile})`, backgroundSize: "160%" }}
          />
        )}
        {f.pattern && !f.tile && (
          <svg className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <Texture f={{ ...f, id: `sw-${f.id}` }} />
            </defs>
            <rect width="100%" height="100%" fill={`url(#tex-sw-${f.id})`} />
          </svg>
        )}
        {/* Gloss gets a highlight; matte stays flat */}
        <span
          className={`absolute inset-0 ${
            f.surface === "gloss"
              ? "bg-[linear-gradient(150deg,rgb(255_255_255/0.35),transparent_45%)]"
              : "bg-[linear-gradient(150deg,rgb(255_255_255/0.08),transparent_60%)]"
          }`}
        />
        {on && (
          <Check className="absolute bottom-1.5 right-1.5 size-4 rounded-full bg-frost p-0.5 text-bg" aria-hidden />
        )}
      </span>
      <span className={`text-xs leading-tight ${on ? "text-frost" : "text-muted"}`}>{f.name}</span>
    </button>
  );
}

export function Finishes() {
  const [sid, setSid] = useState<Series["id"]>("color");
  const s = series.find((x) => x.id === sid)!;
  const all = useMemo(() => s.groups.flatMap((g) => g.finishes), [s]);
  const { startQuote } = useQuote();
  const everything = useMemo(() => series.flatMap((x) => x.groups.flatMap((g) => g.finishes)), []);

  // The build: one body finish and one lens tint, remembered across tabs.
  const [bodyId, setBodyId] = useState("miami-blue");
  const [lensId, setLensId] = useState<string | null>(null);
  const body = everything.find((f) => f.id === bodyId)!;
  const lensF = lensId ? everything.find((f) => f.id === lensId) ?? null : null;
  const bodySeries = series.find((x) => x.groups.some((g) => g.finishes.some((f) => f.id === bodyId)))!;

  const isLight = sid === "light";
  // What the header and quote button talk about on this tab
  const current: Finish | null = isLight ? lensF : all.some((f) => f.id === bodyId) ? body : null;
  const pick = (f: Finish) => (isLight ? setLensId(f.id) : setBodyId(f.id));

  return (
    <section id="finishes" aria-labelledby="finishes-title" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-5">
        <Reveal className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="eyebrow">Stek DYNO film</p>
            <h2 id="finishes-title" className="display mt-3 text-4xl sm:text-5xl">
              <KineticLines lines={[{ text: "Choose your" }, { text: "finish." }]} />
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-silver lg:mt-0">
            Every film we fit is Stek DYNO. Tap a swatch to see it on the car — then come and see
            the real sample in the studio.
          </p>
        </Reveal>

        {/* Series selector */}
        <Reveal delay={0.05}>
          <div role="tablist" aria-label="Film series" className="rail -mx-5 mt-9 gap-2 px-5 sm:mx-0 sm:px-0">
            {series.map((x) => {
              const on = x.id === sid;
              return (
                <button
                  key={x.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="finish-panel"
                  onClick={() => setSid(x.id)}
                  className={`press relative h-11 shrink-0 rounded-full px-5 text-sm font-medium ${
                    on ? "text-bg" : "text-silver hover:text-frost"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="finish-tab"
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-frost"
                    />
                  )}
                  {!on && <span className="absolute inset-0 rounded-full border border-line-strong" />}
                  <span className="relative">{x.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          id="finish-panel"
          role="tabpanel"
          className="mt-6 grid gap-6 overflow-hidden rounded-[28px] border border-line bg-bg-2 p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:p-10"
        >
          {/* Stage */}
          <div className="relative flex flex-col lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline justify-between gap-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={(current?.id ?? "none") + sid}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  className="display text-2xl sm:text-3xl"
                >
                  {isLight ? (lensF?.name ?? "Factory lenses") : body.name}
                </motion.p>
              </AnimatePresence>
              <span className="shrink-0 rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted">
                {isLight ? "Lens tint" : body.surface}
              </span>
            </div>

            <div className="relative mt-4 flex aspect-[16/10] items-center overflow-hidden rounded-2xl [perspective:1100px] bg-[radial-gradient(70%_60%_at_50%_65%,rgb(255_255_255/0.08),transparent_70%)] px-2">
              <Car f={body} lens={lensF?.color} zoom={isLight} sweepKey={`${bodyId}-${lensId}`} />
            </div>
            {/* Your build: everything chosen so far, kept across tabs */}
            <div className="mt-4 rounded-2xl border border-line bg-bg/60 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-faint">
                  Your build
                </p>
                {(bodyId !== "miami-blue" || lensId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBodyId("miami-blue");
                      setLensId(null);
                    }}
                    className="press inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-xs text-muted hover:text-frost"
                  >
                    <RotateCcw className="size-3" aria-hidden />
                    Reset
                  </button>
                )}
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setSid(bodySeries.id)}
                    className="press inline-flex h-10 items-center gap-2 rounded-full border border-line-strong pl-1.5 pr-3.5 text-sm text-frost hover:border-faint"
                  >
                    <BuildDot f={body} />
                    <span className="text-muted">Body</span>
                    {body.name}
                  </button>
                </li>
                <li>
                  {lensF ? (
                    <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong pl-1.5 pr-1.5 text-sm text-frost">
                      <button
                        type="button"
                        onClick={() => setSid("light")}
                        className="inline-flex items-center gap-2"
                      >
                        <BuildDot f={lensF} />
                        <span className="text-muted">Lights</span>
                        {lensF.name}
                      </button>
                      <button
                        type="button"
                        aria-label="Remove light tint"
                        onClick={() => setLensId(null)}
                        className="press grid size-7 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-frost"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSid("light")}
                      className="press inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-line-strong px-3.5 text-sm text-muted hover:text-frost"
                    >
                      + Add light tint
                    </button>
                  )}
                </li>
              </ul>
            </div>
            <p className="mt-3 text-xs text-faint">
              On-screen preview. Colours are approximate — see real samples in the studio.
            </p>
            <p className="mt-1 text-[0.6875rem] text-faint/80">
              Car photo:{" "}
              <a
                className="underline underline-offset-2 hover:text-muted"
                href="https://commons.wikimedia.org/wiki/File:Porsche_911_992.1_Turbo_S_(US-spec)_Arctic_Grey_02.jpg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ethan Llamas
              </a>
              ,{" "}
              <a
                className="underline underline-offset-2 hover:text-muted"
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY-SA 4.0
              </a>
              , background removed and recoloured.
            </p>
          </div>

          {/* Copy + swatches */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              className="flex flex-col"
            >
              <h3 className="display text-2xl sm:text-3xl">{s.title}</h3>
              <p className="mt-2 text-silver">{s.lede}</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{s.body}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {s.features.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-silver"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-5">
                {s.groups.map((grp, gi) => (
                  <div key={gi}>
                    {grp.label && (
                      <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.14em] text-faint">
                        {grp.label}
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-5">
                      {grp.finishes.map((f) => (
                        <Swatch
                          key={f.id}
                          f={f}
                          on={f.id === (isLight ? lensId : bodyId)}
                          onPick={() => pick(f)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
                <button
                  type="button"
                  onClick={() => startQuote(isLight && !current ? "tint" : "ppf")}
                  className="press btn-primary inline-flex h-12 items-center gap-3 rounded-full py-1 pl-5 pr-1.5 text-sm"
                >
                  Ask about this build
                  <span className="grid size-9 place-items-center rounded-full bg-ice text-bg">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </button>
                {sid !== "light" && sid !== "black" && (
                  <p className="text-xs text-muted">More options available beyond these.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
