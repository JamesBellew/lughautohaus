"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, useReducedMotionSafe } from "./motion";

/**
 * Before → after, scrubbed by scroll. The corrected paint wipes across the
 * swirled paint as the frame crosses the screen, so the reader's own scroll
 * does the polishing. Reduced motion holds the frame at a half-and-half split.
 */
export function Results() {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  // Runs while the frame is comfortably on screen, not while it's entering or leaving.
  const reveal = useTransform(scrollYProgress, [0.28, 0.68], reduce ? [50, 50] : [0, 100], {
    clamp: true,
  });
  const clip = useTransform(reveal, (r) => `inset(0 ${100 - r}% 0 0)`);
  const seam = useTransform(reveal, (r) => `${r}%`);
  const seamFade = useTransform(reveal, [0, 4, 96, 100], [0, 1, 1, 0]);
  const afterLabel = useTransform(reveal, [8, 22], [0, 1]);
  const beforeLabel = useTransform(reveal, [78, 92], [1, 0]);

  return (
    <section id="results" aria-labelledby="results-title" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="eyebrow">Results</p>
            <h2 id="results-title" className="display mt-3 max-w-[14ch] text-4xl sm:text-5xl">
              Precision that shows in the details
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-silver lg:mt-0">
            Swirls and holograms from years of washing, removed by correction. Keep scrolling to
            see the difference.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            ref={frame}
            className="relative mt-10 aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-bg-2 sm:aspect-[16/10]"
          >
            <Image
              src="/work/correction-before.jpg"
              alt="Before: black metallic paint covered in swirl marks and holograms under a point light"
              fill
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="object-cover"
            />
            <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
              <Image
                src="/work/correction-after.jpg"
                alt="After: the same black metallic paint, clear and swirl-free"
                fill
                sizes="(min-width: 1152px) 1104px, 100vw"
                className="object-cover"
              />
            </motion.div>

            {/* The polishing edge: a thin line of light where the correction is */}
            <motion.div
              aria-hidden
              style={{ left: seam, opacity: seamFade }}
              className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#9ec9e1]/20 via-[#9ec9e1] to-[#9ec9e1]/20 shadow-[0_0_28px_8px_rgb(158_201_225/0.45)]"
            />

            <motion.span
              style={{ opacity: beforeLabel }}
              className="glass absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Before
            </motion.span>
            <motion.span
              style={{ opacity: afterLabel }}
              className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-frost"
            >
              After
            </motion.span>
          </div>
        </Reveal>
        <p className="mt-4 text-sm text-muted">Paint correction · client vehicle</p>
      </div>
    </section>
  );
}
