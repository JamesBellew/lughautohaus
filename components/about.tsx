"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type PanInfo,
} from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Hand, Phone, Share2, ShieldCheck, Warehouse } from "lucide-react";
import { contact, type ServiceId } from "@/lib/data";
import { CountUp, KineticLines, Reveal, spring, useReducedMotionSafe } from "./motion";

/** One slide per craft. `line` is the floating label; `word` runs vertically. */
const slides: { id: ServiceId; word: string; line: [string, string]; image: string; alt: string; pos?: string }[] = [
  {
    id: "ppf",
    word: "Protection",
    line: ["Protected", "for a decade"],
    image: "/images/ppf-install-xl.jpg",
    alt: "Paint protection film being squeegeed onto a panel",
    pos: "object-[40%_50%]",
  },
  {
    id: "correction",
    word: "Correction",
    line: ["Swirls,", "erased"],
    image: "/work/correction-after.jpg",
    alt: "Deep, swirl-free black metallic paint after correction",
  },
  {
    id: "ceramic",
    word: "Ceramic",
    line: ["Gloss,", "locked in"],
    image: "/images/ceramic-beading-xl.jpg",
    alt: "Water beading on coated paint",
  },
  {
    id: "tint",
    word: "Tints",
    line: ["Cooler, darker,", "sharper"],
    image: "/images/tint-headlights-xl.jpg",
    alt: "Dark car with tinted glass and lit headlights",
    pos: "object-[60%_50%]",
  },
  {
    id: "detailing",
    word: "Detailing",
    line: ["Clean, down", "to the detail"],
    image: "/images/foam-wash-xl.jpg",
    alt: "Car covered in snow foam during a detail wash",
    pos: "object-[55%_50%]",
  },
];

/** What the studio is, in three facts from the brief. */
const credentials = [
  { icon: ShieldCheck, text: "Accredited Stek, Feynlab & Titan Coatings installer" },
  { icon: Warehouse, text: "Custom-built detail bay and dust-free wrap studio" },
  { icon: Hand, text: "Every job finished by hand — no shortcuts" },
];

/* Swatches from the Stek DYNO range: gloss black, nardo grey, satin blue, bronze, frozen white */
const swatches = ["#0f0f10", "#8b9095", "#2f4d66", "#8a4a32", "#e7e8ea"];

const swipe = 60; // px of drag that commits to the next slide

export function About() {
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const s = slides[index];

  // The photo drifts gently against its frame as the card crosses the screen.
  const card = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: card, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-5%", "5%"]);

  const go = useCallback(
    (step: number) =>
      setSlide(([i]) => [(i + step + slides.length) % slides.length, step]),
    [],
  );

  // Flick or drag the card: velocity counts as much as distance, like a native carousel.
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -swipe || info.velocity.x < -400) go(1);
    else if (info.offset.x > swipe || info.velocity.x > 400) go(-1);
  };

  async function share() {
    const data = { title: "Lugh Autohaus", url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* dismissed share sheet — nothing to do */
    }
  }

  return (
    <section id="about" aria-labelledby="about-title" className="pt-20 sm:pt-28 min-[700px]:pt-32 lg:pt-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 min-[700px]:grid-cols-[1fr_minmax(0,300px)] min-[700px]:max-[799px]:grid-cols-[1fr_minmax(0,280px)] min-[700px]:items-stretch min-[700px]:gap-10 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-14 lg:px-5">
        {/* ── Copy ─────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col">
          <Reveal>
            {/* The emblem, shown once, beside the section label */}
            <div className="flex items-center gap-5">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full shadow-[0_10px_30px_rgb(0_0_0/0.45)] ring-1 ring-white/10 min-[700px]:size-24 lg:size-[72px]">
                <Image
                  src="/brand/logo.jpg"
                  alt="Lugh Autohaus emblem"
                  fill
                  sizes="96px"
                  className="scale-[1.12] object-cover"
                />
              </span>
              <span className="inline-flex rounded-full border-b border-copper-text/80 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-frost">
                About us
              </span>
            </div>

            <h2
              id="about-title"
              className="display mt-6 min-[700px]:mt-9 lg:mt-6 text-[2.75rem] uppercase leading-[0.98] sm:max-[699px]:text-6xl min-[700px]:text-[clamp(2.25rem,6.8vw,3.5rem)] lg:text-[3.5rem]"
            >
              <KineticLines
                lines={[
                  { text: "One studio." },
                  {
                    text: "Every craft.",
                    className: "bg-gradient-to-b from-silver/80 to-faint bg-clip-text text-transparent",
                  },
                ]}
              />
            </h2>

            <p className="mt-6 max-w-md leading-relaxed text-silver min-[700px]:mt-8 min-[700px]:text-lg lg:mt-6 lg:text-base">
              A specialist paint protection and detailing studio. Every vehicle is perfected in our
              detail bay, protected with industry-leading film and coatings, and finished by hand.
            </p>

            {/* Progressive disclosure: the full story is one tap away, not on the page by default */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="about-more"
              onClick={() => setOpen((v) => !v)}
              className="group mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-frost min-[700px]:mt-6 min-[700px]:text-base lg:mt-4 lg:text-sm"
            >
              {open ? "Show less" : "More about us"}
              <ArrowRight
                className={`size-4 text-copper-text transition-transform duration-300 ${
                  open ? "-rotate-90" : "group-hover:translate-x-1"
                }`}
                aria-hidden
              />
            </button>
            <div
              id="about-more"
              className={`grid max-w-md transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden" inert={!open}>
                <div className="space-y-4 pt-2 text-[0.9375rem] leading-relaxed text-muted">
                  <ul className="space-y-2.5 min-[700px]:hidden lg:block">
                    {credentials.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-3 text-silver">
                        <Icon className="mt-0.5 size-[18px] shrink-0 text-copper-text" strokeWidth={1.6} aria-hidden />
                        {text}
                      </li>
                    ))}
                  </ul>
                  <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                    The story behind the name
                  </p>
                  <p>
                    In Irish mythology, Lugh — deity of light, skill and brilliance — was known as the
                    Samildánach, the Master of All Arts. When he sought entry to the hall of Tara, he
                    was told every position was filled by a master of a single trade. He asked one
                    question:
                  </p>
                  <p className="border-l border-copper-text/60 pl-4 text-silver">
                    &ldquo;Do you have anyone who possesses all of these skills combined?&rdquo;
                  </p>
                  <p>
                    Finding no equal, he was welcomed to lead. We embody that spirit: true vehicle
                    preservation isn&rsquo;t a single process — it&rsquo;s a collection of distinct,
                    highly technical crafts that must work in complete harmony.
                  </p>
                </div>
              </div>
            </div>

            {/* Tablets have the height for the credentials up front */}
            <ul className="mt-8 hidden space-y-3.5 min-[700px]:block lg:hidden">
              {credentials.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[1.0625rem] text-silver">
                  <Icon className="mt-0.5 size-5 shrink-0 text-copper-text" strokeWidth={1.6} aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Stat card + round actions, anchored to the bottom like the reference */}
          <Reveal delay={0.08} className="mt-9 flex items-center gap-2 sm:max-[699px]:gap-3 min-[700px]:mt-auto min-[700px]:gap-2 min-[700px]:pt-8 lg:gap-3">
            <div className="flex items-center gap-4 rounded-[24px] bg-bg-2 py-3.5 pl-3.5 pr-5 sm:max-[699px]:gap-5 sm:max-[699px]:py-4 sm:max-[699px]:pl-4 sm:max-[699px]:pr-7 min-[700px]:gap-5 min-[700px]:py-4 min-[700px]:pl-4 min-[700px]:pr-6 lg:gap-5 lg:py-4 lg:pl-4 lg:pr-7">
              <ul className="flex" aria-label="Film finish swatches">
                {swatches.map((c, i) => (
                  <li
                    key={c}
                    className="size-9 rounded-full ring-[3px] ring-bg-2 last:hidden sm:max-[699px]:size-11 sm:max-[699px]:last:block [&:not(:first-child)]:-ml-2.5 sm:max-[699px]:[&:not(:first-child)]:-ml-3 min-[700px]:size-12 min-[700px]:max-[799px]:size-10 min-[700px]:last:block min-[700px]:[&:nth-child(n+4)]:hidden min-[700px]:[&:not(:first-child)]:-ml-3 lg:size-11 lg:[&:nth-child(n+4)]:block"
                    style={{ background: `radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.28), transparent 55%), ${c}`, zIndex: swatches.length - i }}
                  />
                ))}
              </ul>
              <p className="leading-tight">
                <span className="display block text-2xl min-[700px]:text-3xl lg:text-2xl">
                  <CountUp to={50} />
                  <span className="text-copper-text">+</span>
                </span>
                <span className="whitespace-nowrap text-xs text-muted min-[700px]:text-sm lg:text-xs">Film finishes</span>
              </p>
            </div>

            <button
              type="button"
              onClick={share}
              aria-label={shared ? "Link copied" : "Share Lugh Autohaus"}
              className="press relative grid size-11 shrink-0 place-items-center rounded-full bg-bg-2 text-silver hover:bg-surface hover:text-ice sm:max-[699px]:size-12 min-[700px]:size-14 min-[700px]:max-[799px]:size-12 lg:size-12"
            >
              <Share2 className="size-[18px]" aria-hidden />
              <AnimatePresence>
                {shared && (
                  <motion.span
                    role="status"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-9 whitespace-nowrap rounded-full bg-surface px-3 py-1 text-xs text-frost"
                  >
                    Link copied
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <a
              href={contact.phoneHref}
              aria-label={`Call Lugh Autohaus on ${contact.phone}`}
              className="press grid size-11 shrink-0 place-items-center rounded-full bg-bg-2 text-silver hover:bg-surface hover:text-ice sm:max-[699px]:size-12 min-[700px]:size-14 min-[700px]:max-[799px]:size-12 lg:size-12"
            >
              <Phone className="size-[18px]" aria-hidden />
            </a>
          </Reveal>
        </div>

        {/* ── Craft carousel ───────────────────────────────── */}
        <Reveal delay={0.05} className="relative min-[700px]:h-full lg:h-auto lg:self-start lg:pr-11">
          <div
            ref={card}
            role="region"
            aria-roledescription="carousel"
            aria-label="Our crafts"
            className="relative mx-auto aspect-[4/5] w-full max-w-[460px] sm:aspect-[5/6] min-[700px]:aspect-auto min-[700px]:h-full min-[700px]:min-h-[min(820px,70svh)] min-[700px]:max-w-none lg:h-[min(560px,calc(100svh-10rem))] lg:min-h-[440px] lg:max-w-[460px]"
          >
            {/* Image, draggable on touch */}
            <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-bg-2">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={s.id}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d * 48, opacity: 0, scale: 1.04 }),
                    center: { x: 0, opacity: 1, scale: 1 },
                    exit: (d: number) => ({ x: d * -48, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ ...spring, duration: 0.55 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={onDragEnd}
                  className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  {/* Oversized so the scroll drift never shows an edge */}
                  <motion.div className="absolute inset-x-0 -inset-y-[7%]" style={{ y: drift }}>
                    <Image
                      src={s.image}
                      alt={s.alt}
                      fill
                      draggable={false}
                      sizes="(min-width: 1024px) 460px, 100vw"
                      className={`pointer-events-none object-cover ${s.pos ?? ""}`}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/*
              The notch: page-coloured block in the top-left corner, with two
              inverse-radius pieces so the card's edge curves around it.
            */}
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-[76px] w-[132px] rounded-br-[28px] bg-bg" />
            <div aria-hidden className="pointer-events-none absolute left-[132px] top-0 size-7 bg-[radial-gradient(circle_at_100%_100%,transparent_27.5px,var(--bg)_28px)]" />
            <div aria-hidden className="pointer-events-none absolute left-0 top-[76px] size-7 bg-[radial-gradient(circle_at_100%_100%,transparent_27.5px,var(--bg)_28px)]" />

            {/* Arrows live in the notch */}
            <div className="absolute left-0 top-0 flex h-[64px] w-[120px] items-start gap-2">
              {[
                { step: -1, label: "Previous craft", Icon: ChevronLeft },
                { step: 1, label: "Next craft", Icon: ChevronRight },
              ].map(({ step, label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => go(step)}
                  className="press grid size-12 place-items-center rounded-full bg-bg-2 text-copper-text hover:bg-surface hover:text-[#e0a07e]"
                >
                  <Icon className="size-5" aria-hidden />
                </button>
              ))}
            </div>

            {/* Floating glass label — overhangs the card's leading edge on desktop */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.a
                key={s.id}
                href="#services"
                onClick={() => window.dispatchEvent(new CustomEvent("lugh:service", { detail: s.id }))}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.15 } }}
                transition={{ ...spring, duration: 0.45, delay: 0.1 }}
                className="glass-strong group absolute bottom-6 left-4 block min-w-[168px] rounded-[22px] px-5 pb-4 pt-5 shadow-[0_20px_50px_rgb(0_0_0/0.45)] sm:bottom-[26%] lg:-left-[72px]"
              >
                <span className="block font-[family-name:var(--font-display)] text-[0.9375rem] font-medium uppercase leading-snug tracking-[0.04em] text-frost">
                  {s.line[0]}
                  <br />
                  {s.line[1]}
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-xs text-muted group-hover:text-frost">
                  <ArrowRight
                    className="size-3.5 text-ice transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                  Explore
                </span>
              </motion.a>
            </AnimatePresence>

            {/* Vertical craft name with a progress rule (desktop) */}
            <div className="absolute -right-11 bottom-0 hidden flex-col items-center gap-4 lg:flex">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={s.word}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                  transition={{ ...spring, duration: 0.4 }}
                  className="text-sm text-silver [writing-mode:vertical-rl]"
                >
                  {s.word}
                </motion.span>
              </AnimatePresence>
              <span className="relative h-16 w-px overflow-hidden bg-white/15">
                <motion.span
                  className="absolute inset-x-0 top-0 bg-copper-text"
                  animate={{ height: `${((index + 1) / slides.length) * 100}%` }}
                  transition={{ ...spring, duration: 0.5 }}
                />
              </span>
            </div>

            {/* Screen readers hear which craft is showing */}
            <p aria-live="polite" className="sr-only">
              {`${s.word}, ${index + 1} of ${slides.length}`}
            </p>
          </div>

          {/* Progress rules: under the card on phones, tucked into its corner on tablets */}
          <div className="mt-4 flex justify-center gap-1.5 min-[700px]:absolute min-[700px]:bottom-6 min-[700px]:right-5 min-[700px]:mt-0 lg:hidden" aria-hidden>
            {slides.map((x, i) => (
              <span
                key={x.id}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  i === index ? "w-6 bg-copper-text" : "w-3 bg-white/20"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
