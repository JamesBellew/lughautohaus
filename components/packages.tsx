"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { packages, type ServiceId } from "@/lib/data";
import { Reveal } from "./motion";
import { useQuote } from "./quote-context";

export function Packages() {
  const [active, setActive] = useState(packages[0].id);
  const { startQuote } = useQuote();
  const group = packages.find((g) => g.id === active)!;

  return (
    <section id="packages" aria-labelledby="packages-title" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="eyebrow">Packages</p>
            <h2 id="packages-title" className="display mt-3 text-4xl sm:text-5xl">
              Transparent pricing
            </h2>
          </div>
          <p className="mt-4 max-w-sm text-silver lg:mt-0">
            Starting prices for every package. Each vehicle is assessed in person before work
            begins.
          </p>
        </Reveal>

        {/* Segmented control: four groups fit a phone without scrolling */}
        <Reveal delay={0.05}>
          <div
            role="tablist"
            aria-label="Package type"
            className="mt-9 grid grid-cols-4 gap-1 rounded-full border border-line bg-bg-2 p-1 sm:inline-grid sm:w-auto"
          >
            {packages.map((g) => {
              const on = g.id === active;
              return (
                <button
                  key={g.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="packages-panel"
                  onClick={() => setActive(g.id)}
                  className={`press relative h-11 rounded-full px-2 text-sm font-medium sm:px-6 ${
                    on ? "text-bg" : "text-silver hover:text-frost"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="package-tab"
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-frost"
                    />
                  )}
                  <span className="relative">{g.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div id="packages-panel" role="tabpanel" aria-label={`${group.label} packages`} className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            >
              <p className="text-sm text-muted">{group.intro}</p>

              <ul className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((p) => (
                  <li
                    key={p.name}
                    className={`relative flex flex-col overflow-hidden rounded-3xl border bg-bg-2 ${
                      p.popular ? "border-line-strong" : "border-line"
                    }`}
                  >
                    {p.image && (
                      <div className="relative aspect-[2/1] bg-surface">
                        <Image src={p.image} alt={`${p.name} coverage diagram`} fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="display text-2xl">{p.name}</h3>
                        {p.popular && (
                          <span className="mt-1 shrink-0 rounded-full bg-white/[0.08] px-2.5 py-1 text-xs font-medium text-frost">
                            Most popular
                          </span>
                        )}
                      </div>
                      {p.note && <p className="mt-0.5 text-sm text-muted">{p.note}</p>}
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-silver">{p.body}</p>
                      <p className="mt-auto pt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-frost lining-nums">
                        {p.price === "POA" ? "Price on application" : p.price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-start gap-3 rounded-3xl border border-line bg-bg-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-silver">Not sure which package suits your car? We&rsquo;ll advise honestly.</p>
                <button
                  type="button"
                  onClick={() => startQuote(group.id as ServiceId)}
                  className="press btn-primary inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm"
                >
                  Ask about {group.label === "PPF" ? "PPF" : group.label.toLowerCase()}
                  <ArrowUpRight className="size-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
