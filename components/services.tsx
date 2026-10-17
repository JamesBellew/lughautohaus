"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type PanInfo,
} from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { services, type Service, type ServiceId } from "@/lib/data";
import { useReducedMotionSafe } from "./motion";
import { useQuote } from "./quote-context";

const count = services.length;
const wrap = (i: number) => (i + count) % count;

/* Apple's momentum projection: where a flick would come to rest. */
const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);

export function Services() {
  const [index, setIndex] = useState(0);
  const [jumped, setJumped] = useState(false);
  const busy = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduce = useReducedMotionSafe();

  // The frame opens from a rounded inset to full bleed as the section arrives.
  const { scrollYProgress: arrive } = useScroll({ target: stage, offset: ["start end", "start start"] });
  const inset = useTransform(arrive, [0.35, 1], reduce ? [0, 0] : [7, 0]);
  const radius = useTransform(arrive, [0.35, 1], reduce ? [32, 32] : [48, 32]);
  const clip = useTransform(() => `inset(${inset.get()}% ${inset.get() * 0.6}% round ${radius.get()}px)`);
  const { startQuote } = useQuote();

  const width = () => stage.current?.offsetWidth ?? window.innerWidth;

  /**
   * Finish a move to the neighbouring slide. The spring starts from wherever
   * the finger left the track and inherits its velocity, so drag and settle
   * read as one continuous gesture.
   */
  const settle = useCallback(
    (step: 1 | -1, velocity = 0) => {
      if (busy.current) return;
      busy.current = true;
      setJumped(false);
      const done = () => {
        flushSync(() => setIndex((i) => wrap(i + step)));
        x.set(0);
        busy.current = false;
      };
      if (reduce) return done();
      animate(x, -step * width(), { type: "spring", bounce: 0, duration: 0.55, velocity }).then(done);
    },
    [reduce, x],
  );

  /** Jump straight to any slide (tabs, deep links). Neighbours still glide. */
  const goTo = useCallback(
    (target: number) => {
      if (target === index || busy.current) return;
      if (target === wrap(index + 1)) return settle(1);
      if (target === wrap(index - 1)) return settle(-1);
      setJumped(true);
      setIndex(target);
    },
    [index, settle],
  );

  // Deep links from elsewhere on the page (hero strip, About gallery).
  useEffect(() => {
    const open = (e: Event) => {
      const i = services.findIndex((s) => s.id === (e as CustomEvent<ServiceId>).detail);
      if (i >= 0) goTo(i);
    };
    window.addEventListener("lugh:service", open);
    return () => window.removeEventListener("lugh:service", open);
  }, [goTo]);

  // Two-finger horizontal swipes on a trackpad page through the slides.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 60) {
        settle(acc > 0 ? 1 : -1);
        acc = 0;
        lock = performance.now() + 700;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [settle]);

  function onDragEnd(_: unknown, info: PanInfo) {
    const w = width();
    const landing = info.offset.x + project(info.velocity.x);
    if (landing < -w * 0.3) settle(1, info.velocity.x);
    else if (landing > w * 0.3) settle(-1, info.velocity.x);
    else animate(x, 0, { type: "spring", bounce: 0.15, duration: 0.45, velocity: info.velocity.x });
  }

  const roles = [
    { i: wrap(index - 1), pos: "-100%" },
    { i: index, pos: "0%" },
    { i: wrap(index + 1), pos: "100%" },
  ];
  const current = services[index];

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      aria-roledescription="carousel"
      className="relative mt-20 sm:mt-28"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") settle(1);
        if (e.key === "ArrowLeft") settle(-1);
      }}
    >
      <h2 id="services-title" className="sr-only">
        Our services
      </h2>

      <motion.div
        ref={stage}
        style={{ clipPath: clip }}
        className="relative h-[100svh] min-h-[640px] overflow-hidden bg-bg lg:mx-3 lg:h-[calc(100svh-1.5rem)] lg:rounded-[32px] lg:border lg:border-white/[0.06]"
      >
        {/* The track: previous, current and next sit side by side and move together */}
        <motion.div
          style={{ x }}
          drag={reduce ? false : "x"}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        >
          {roles.map(({ i, pos }) => (
            <Slide
              key={services[i].id}
              s={services[i]}
              pos={pos}
              active={i === index}
              animateIn={jumped && i === index}
              onQuote={() => startQuote(services[i].id)}
            />
          ))}
        </motion.div>

        {/* ── Fixed chrome ─────────────────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-24 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:pt-[6.5rem]">
          <p className="eyebrow !text-silver">Our services</p>
          <div role="tablist" aria-label="Services" className="rail -mx-5 gap-1.5 px-5 sm:mx-0 sm:px-0">
            {services.map((s, i) => {
              const on = i === index;
              return (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls={`slide-${s.id}`}
                  onClick={() => goTo(i)}
                  className={`press relative h-10 shrink-0 rounded-full px-4 text-[0.8125rem] font-medium ${
                    on ? "text-bg" : "glass text-silver hover:text-frost"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="service-tab"
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-frost"
                    />
                  )}
                  <span className="relative">{s.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress + arrows, bottom right */}
        <div className="absolute bottom-6 right-5 z-20 flex items-center gap-4 sm:right-8 lg:bottom-10 lg:right-10">
          <div className="flex items-center gap-3 text-xs tabular-nums text-muted">
            <span className="text-frost">{String(index + 1).padStart(2, "0")}</span>
            <span className="relative h-px w-16 overflow-hidden bg-white/20 sm:w-24">
              <motion.span
                className="absolute inset-y-0 left-0 bg-copper-text"
                animate={{ width: `${((index + 1) / count) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </span>
            <span>{String(count).padStart(2, "0")}</span>
          </div>
          <div className="hidden gap-2 sm:flex">
            {[
              { step: -1 as const, label: "Previous service", Icon: ChevronLeft },
              { step: 1 as const, label: "Next service", Icon: ChevronRight },
            ].map(({ step, label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => settle(step)}
                className="press glass grid size-12 place-items-center rounded-full text-copper-text hover:bg-white/10"
              >
                <Icon className="size-5" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {`${current.name}, ${index + 1} of ${count}`}
        </p>
      </motion.div>
    </section>
  );
}

function Slide({
  s,
  pos,
  active,
  animateIn,
  onQuote,
}: {
  s: Service;
  pos: string;
  active: boolean;
  animateIn: boolean;
  onQuote: () => void;
}) {
  return (
    <motion.article
      id={`slide-${s.id}`}
      role="tabpanel"
      aria-hidden={!active}
      inert={!active}
      initial={animateIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 overflow-hidden"
      style={{ x: pos }}
    >
      {s.video ? (
        <SlideVideo s={s} active={active} />
      ) : (
        <Image
          src={s.image}
          alt={s.imageAlt}
          fill
          draggable={false}
          sizes="100vw"
          quality={85}
          priority={active}
          className={`pointer-events-none select-none object-cover ${s.imagePos ?? ""}`}
        />
      )}
      {/* Legibility: a deep fade where the copy sits, lighter elsewhere */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent sm:via-bg/45" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-bg/75 via-bg/25 to-transparent lg:block" />
      {s.dim && (
        <>
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-bg via-bg/80 to-transparent" />
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-20 sm:px-8 lg:px-5 lg:pb-12">
        <div className="max-w-xl">
          <h3 className="display text-[2.5rem] sm:text-6xl lg:text-[4rem]">{s.name}</h3>
          <p className="mt-3 text-lg text-silver">{s.tagline}</p>
          <p className="mt-4 hidden max-w-lg leading-relaxed text-muted sm:block">{s.body}</p>
        </div>

        <dl className="mt-7 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
          {s.specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-faint">
                {spec.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-frost">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={onQuote}
            className="press btn-primary inline-flex h-12 items-center gap-3 rounded-full py-1 pl-5 pr-1.5 text-sm"
          >
            Get a quote
            <span className="grid size-9 place-items-center rounded-full bg-ice text-bg">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </button>
          <p className="display text-xl text-silver">{s.from}</p>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Portrait footage. On portrait screens it fills the slide as shot. On
 * landscape screens a tall panel sits on the right (where photo subjects
 * usually are) over a blurred, darkened still of the same clip, so the
 * 9:16 frame is never stretched or soft. Plays only while its slide is
 * showing; reduced motion keeps the still.
 */
function SlideVideo({ s, active }: { s: Service; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [active, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
      {/* Landscape backdrop: the clip's own still, blurred into atmosphere */}
      <Image
        src={s.image}
        alt=""
        fill
        sizes="50vw"
        className="hidden scale-125 object-cover opacity-50 blur-2xl [@media(min-aspect-ratio:1/1)]:block"
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={s.image}
        className="absolute inset-0 size-full object-cover [@media(min-aspect-ratio:1/1)]:left-auto [@media(min-aspect-ratio:1/1)]:right-0 [@media(min-aspect-ratio:1/1)]:w-[min(52%,calc(100svh*0.75))] [@media(min-aspect-ratio:1/1)]:[mask-image:linear-gradient(to_right,transparent,black_28%)]"
      >
        <source src={s.video!.webm} type="video/webm" />
        <source src={s.video!.mp4} type="video/mp4" />
      </video>
    </div>
  );
}
