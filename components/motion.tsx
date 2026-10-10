"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  type HTMLMotionProps,
} from "motion/react";

/**
 * House spring: critically damped (no overshoot), ~0.6s response.
 * Nothing on this page is thrown or flicked, so nothing bounces.
 */
export const spring = { type: "spring", bounce: 0, duration: 0.6 } as const;

const reducedQuery = "(prefers-reduced-motion: reduce)";

/**
 * Reduced-motion preference that is hydration-safe: false on the server and on
 * the first client render (so markup matches), then the real setting — and it
 * follows the OS toggle live.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(reducedQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
}

/** Entry curve for scroll reveals: ease-out, ~620ms. Restraint is the signal. */
const enter = { duration: 0.62, ease: [0.22, 1, 0.36, 1] } as const;

/** Fires slightly inside the viewport, so it runs when the reader is looking. */
const inView = { once: true, amount: 0.2, margin: "0px 0px -12% 0px" } as const;

/** Respects the OS reduced-motion setting: transforms drop, fades remain. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {children}
    </MotionConfig>
  );
}

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Fades and lifts content ~14px as it enters the viewport — once, never re-hiding. */
export function Reveal({ delay = 0, y = 14, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ ...enter, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type RevealItemProps = HTMLMotionProps<"li"> & { delay?: number; y?: number };

/** Same as Reveal, rendered as a list item so lists keep valid structure. */
export function RevealItem({ delay = 0, y = 14, children, ...rest }: RevealItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ ...enter, delay }}
      {...rest}
    >
      {children}
    </motion.li>
  );
}

/**
 * A heading that assembles line by line: each line rises from behind its own
 * mask. Lines are given explicitly so the break is designed, not measured.
 * The mask pads below the line so descenders are never sheared.
 */
export function KineticLines({
  lines,
  className = "",
}: {
  lines: { text: string; className?: string }[];
  className?: string;
}) {
  return (
    <motion.span
      className={`block ${className}`}
      initial="hidden"
      whileInView="shown"
      viewport={inView}
      transition={{ staggerChildren: 0.09 }}
    >
      {lines.map((l) => (
        <span key={l.text} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <motion.span
            className={`block ${l.className ?? ""}`}
            variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * A real figure that ticks up once, at half visibility, with a hard ease-out.
 * The server renders the final value (correct without JS, no hydration
 * mismatch); the client zeroes it while still off-screen and counts up on
 * entry by writing text directly. Reduced motion keeps the final value.
 */
export function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotionSafe();

  // Zero it before it is seen, so the tick starts from nothing.
  useEffect(() => {
    if (!reduce && !seen && ref.current) ref.current.textContent = "0";
  }, [reduce, seen]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = String(to);
      return;
    }
    if (!seen) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [seen, reduce, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {to}
    </span>
  );
}
