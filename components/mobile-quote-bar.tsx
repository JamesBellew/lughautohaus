"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/**
 * Phone-only quote bar in the thumb zone. Appears once the hero's own
 * actions have scrolled away; steps aside over Services and the quote form.
 */
export function MobileQuoteBar() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const vh = window.innerHeight;
    const quoteTop = document.getElementById("quote")?.getBoundingClientRect().top ?? Infinity;
    // Full-screen services slides carry their own quote button — step aside there.
    const svc = document.getElementById("services")?.getBoundingClientRect();
    const overServices = svc ? svc.top < vh * 0.5 && svc.bottom > vh * 0.5 : false;
    setShow(y > vh * 0.85 && quoteTop > vh * 0.9 && !overServices);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "130%" }}
          animate={{ y: 0 }}
          exit={{ y: "130%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.45 }}
          className="fixed inset-x-3 z-40 md:hidden"
          style={{ bottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
        >
          <div className="glass-strong flex items-center justify-between gap-3 rounded-full py-1.5 pl-5 pr-1.5 shadow-[0_12px_40px_rgb(0_0_0/0.5)]">
            <p className="truncate text-sm text-silver">No-obligation, free quote</p>
            <a
              href="#quote"
              className="press btn-primary inline-flex h-12 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 text-sm"
            >
              Get a quote
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
