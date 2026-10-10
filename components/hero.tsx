"use client";

import { getImageProps } from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Droplets, Hand, Shield, SprayCan, Sparkles, SunDim } from "lucide-react";
import type { ServiceId } from "@/lib/data";
import { spring, useReducedMotionSafe } from "./motion";

/**
 * At-a-glance strip along the foot of the hero — one cell per craft, each a
 * link that opens that craft in Services. The last cell is the studio promise.
 */
const strip: { label: string; value: string; icon: typeof Shield; service?: ServiceId }[] = [
  { label: "Paint protection film", value: "10–12 yr warranty", icon: Shield, service: "ppf" },
  { label: "Ceramic coating", value: "1 · 5 · 10 years", icon: Droplets, service: "ceramic" },
  { label: "Paint correction", value: "4 levels", icon: Sparkles, service: "correction" },
  { label: "Window tints", value: "5% – 80% VLT", icon: SunDim, service: "tint" },
  { label: "Detailing", value: "2 – 8 hours", icon: SprayCan, service: "detailing" },
  { label: "Every job", value: "Finished by hand", icon: Hand },
];

// PLACEHOLDER — swap "#" for the client's real profiles.
const socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: <path d="M15 3c.4 2.4 1.9 4 4.5 4.2v3.1A7.6 7.6 0 0 1 15 8.9v6.4a5.6 5.6 0 1 1-5.6-5.6h.6V13a2.4 2.4 0 1 0 1.8 2.3V3Z" />,
  },
  {
    label: "Facebook",
    href: "#",
    icon: <path d="M14 21v-7.5h2.6l.4-3.2h-3V8.4c0-.9.3-1.6 1.6-1.6H17V4a20 20 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.3H8v3.2h2.6V21" />,
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10.5 9.5 4 2.5-4 2.5Z" fill="currentColor" />
      </>
    ),
  },
];

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, duration: 0.8, delay },
});

/*
 * Art direction: a portrait frame for phones and portrait tablets (the car
 * stays whole), the rain-soaked 911 for landscape screens. Each device
 * downloads only the image it shows.
 */
const common = { alt: "", sizes: "100vw", quality: 85, priority: true } as const;
const {
  props: { srcSet: wide },
} = getImageProps({ ...common, src: "/images/hero-911-graded.jpg", width: 2000, height: 1333 });
const {
  props: { srcSet: tall, ...img },
} = getImageProps({ ...common, src: "/images/911-street-graded.jpg", width: 1600, height: 2047 });

export function Hero() {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  // 0 when the hero fills the screen, 1 when it has scrolled fully away.
  const { scrollYProgress: p } = useScroll({ target: frame, offset: ["start start", "end start"] });
  // The photo drifts slower than the page (depth); the copy lifts and fades as it leaves.
  const photoY = useTransform(p, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const copyY = useTransform(p, [0, 0.6], [0, reduce ? 0 : -48]);
  const copyFade = useTransform(p, [0, 0.55], [1, 0]);

  return (
    <section id="top" className="lg:p-3">
      {/* Inset, rounded frame on desktop; full-bleed on phones */}
      <div ref={frame} className="relative isolate flex h-[100svh] min-h-[680px] flex-col overflow-hidden pt-[calc(env(safe-area-inset-top)+5.5rem)] lg:h-[calc(100svh-1.5rem)] lg:min-h-[700px] lg:rounded-[32px] lg:border lg:border-white/[0.06]">
        <motion.div
          aria-hidden
          className="absolute inset-x-0 -top-[4%] bottom-[22%] -z-10 [@media(min-aspect-ratio:1/1)]:inset-y-0"
          initial={{ scale: 1.06, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.picture className="block size-full" style={{ y: photoY }}>
            <source media="(min-width: 768px) and (min-aspect-ratio: 1/1)" srcSet={wide} />
            <source srcSet={tall} />
            {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element -- decorative; art-directed via getImageProps */}
            <img
              {...img}
              className="size-full object-cover object-[50%_62%] [@media(min-aspect-ratio:1/1)]:object-[50%_40%]"
            />
          </motion.picture>
        </motion.div>

        {/* Scrims: a light veil up top for the nav, a deep fade where the type sits */}
        <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[72%] bg-gradient-to-t from-bg via-bg/80 to-transparent lg:h-[62%]" />

        {/*
          Atmosphere from the Lugh mural: storm-cloud cool from above, bronze
          warmth rising from below — kept faint so the photo stays the subject.
        */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_88%_6%,rgb(125_176_201/0.14),transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(65%_55%_at_8%_100%,rgb(201_123_95/0.14),transparent_70%)]" />

        {/* Social rail — desktop only, vertically centred on the left edge */}
        <ul
          aria-label="Follow Lugh Autohaus"
          className="absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col gap-1 lg:flex xl:left-8"
        >
          {socials.map((s, i) => (
            <motion.li key={s.label} {...enter(0.5 + i * 0.05)}>
              <a
                href={s.href}
                aria-label={s.label}
                className="press grid size-11 place-items-center rounded-full text-silver transition-colors hover:bg-white/[0.06] hover:text-ice"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {s.icon}
                </svg>
              </a>
            </motion.li>
          ))}
        </ul>

        <motion.div
          style={{ y: copyY, opacity: copyFade }}
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 sm:px-8 lg:px-5"
        >
          {/* Upper right: the headline number */}
          <motion.div {...enter(0.4)} className="ml-auto mt-4 hidden text-right sm:block lg:mt-16">
            <p className="flex items-baseline justify-end gap-2">
              <span className="display text-4xl lg:text-5xl">50+</span>
              <span className="text-silver">film finishes</span>
            </p>
            <p className="mt-1 max-w-[14rem] text-silver">Stek, Feynlab &amp; Titan accredited</p>
          </motion.div>

          {/* Headline left, supporting copy right */}
          <div className="mt-auto grid gap-5 pb-8 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-12 lg:pb-12">
            <motion.h1
              {...enter(0.2)}
              className="display text-[2.375rem] [text-shadow:0_2px_24px_rgb(0_0_0/0.4)] sm:text-6xl lg:whitespace-nowrap lg:text-[2.75rem] xl:text-[3.375rem]"
            >
              Where ancient mastery <br className="hidden lg:block" />
              meets modern protection
            </motion.h1>
            <motion.div {...enter(0.3)} className="lg:justify-self-end lg:pb-1.5">
              <p className="max-w-md text-[0.9375rem] leading-relaxed text-silver sm:text-base lg:max-w-sm">
                Paint protection film, correction, ceramic coatings and tints — every vehicle
                prepared in our custom-built detail bay, wrapped in a dust-free studio and finished
                by hand.
              </p>
              <a
                href="#quote"
                className="press btn-primary mt-6 inline-flex h-12 items-center gap-3 rounded-full py-1 pl-5 pr-1.5 text-sm lg:hidden"
              >
                Get a quote
                <span className="grid size-9 place-items-center rounded-full bg-ice text-bg">
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Summary strip: swipeable on phones, six even columns on desktop */}
        <motion.div {...enter(0.45)} className="border-t border-white/10">
          <ul className="rail mx-auto max-w-6xl px-5 [scroll-padding-inline:1.25rem] sm:px-8 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-5">
            {strip.map((s) => {
              const Icon = s.icon;
              const body = (
                <>
                  <span className="flex items-center justify-between gap-3 whitespace-nowrap text-xs text-muted transition-colors duration-300 group-hover:text-silver lg:gap-2">
                    {s.label}
                    <Icon
                      className="size-4 shrink-0 text-faint transition-colors duration-300 group-hover:text-copper-text"
                      strokeWidth={1.6}
                      aria-hidden
                    />
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-frost">
                    {s.value}
                    {s.service && (
                      <ArrowUpRight
                        className="size-3.5 -translate-x-1 text-ice opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden
                      />
                    )}
                  </span>
                </>
              );
              return (
                <li
                  key={s.label}
                  className="flex shrink-0 border-r border-white/10 last:border-r-0 lg:shrink"
                >
                  {s.service ? (
                    <a
                      href="#services"
                      onClick={() => window.dispatchEvent(new CustomEvent("lugh:service", { detail: s.service }))}
                      className="group flex w-full flex-col py-5 pl-4 pr-5 [li:first-child_&]:pl-0 lg:pr-4"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="group flex w-full flex-col py-5 pl-4 pr-5 lg:pr-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
