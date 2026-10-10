"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";

const links = [
  { href: "#top", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#packages", label: "Packages" },
  { href: "#about", label: "About" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Wayfinding: mark the section currently in the middle of the viewport.
  const [current, setCurrent] = useState("#top");
  useEffect(() => {
    const els = links.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
    >
      <nav
        aria-label="Primary"
        className={`relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-5 pr-1.5 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? "glass-strong shadow-[0_8px_30px_rgb(0_0_0/0.35)]"
            : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" aria-label="Lugh Autohaus home" className="press -my-1 py-1">
          <Wordmark />
        </a>

        {/* Centred link pill. Once the whole bar turns to glass on scroll, the pill
            drops its own material — glass is never stacked on glass. */}
        <ul
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1 transition-[background-color,border-color] duration-300 md:flex ${
            scrolled || open ? "border border-transparent" : "glass"
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={current === l.href ? "location" : undefined}
                className={`press relative flex h-11 items-center rounded-full px-4 text-sm hover:bg-white/[0.08] hover:text-frost ${
                  current === l.href ? "text-frost" : "text-silver"
                }`}
              >
                {l.label}
                {current === l.href && (
                  <motion.span
                    layoutId="nav-current"
                    transition={{ type: "spring", bounce: 0, duration: 0.45 }}
                    className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ice"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a
            href="#quote"
            className="press btn-primary group hidden h-11 items-center gap-3 rounded-full py-1 pl-4 pr-1 text-sm sm:inline-flex"
          >
            Get a quote
            <span className="grid size-9 place-items-center rounded-full bg-ice text-bg transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="press grid size-11 place-items-center rounded-full text-frost hover:bg-white/5 md:hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="grid place-items-center"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* Sheet grows down from the toggle it belongs to, and returns there */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, scale: 0.94, y: -8, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, y: -6, filter: "blur(4px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              style={{ transformOrigin: "top right" }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] border border-line bg-bg-2/95 backdrop-blur-xl overflow-hidden rounded-3xl p-2 shadow-[0_24px_60px_rgb(0_0_0/0.5)] md:hidden"
            >
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.35, delay: 0.03 * i }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="press flex min-h-12 items-center rounded-2xl px-4 text-lg text-frost active:bg-white/5"
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <a
                href="#quote"
                onClick={() => setOpen(false)}
                className="press btn-primary mt-2 flex h-12 items-center justify-center gap-1.5 rounded-2xl"
              >
                Get a quote
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Dim to focus while the menu is open; tap anywhere to dismiss */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>
    </header>
  );
}
