"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { contact, faqs } from "@/lib/data";
import { Reveal } from "./motion";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="pt-24 sm:pt-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="display mt-3 text-4xl sm:text-5xl">
            Good to know
          </h2>
          <p className="mt-4 max-w-sm text-silver">
            Can&rsquo;t find your answer?{" "}
            <a href={contact.phoneHref} className="text-ice underline underline-offset-4">
              Give us a call
            </a>{" "}
            — we&rsquo;re happy to talk through your car.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <ul className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex min-h-16 w-full items-center justify-between gap-4 py-5 text-left text-[1.0625rem] font-medium text-frost"
                    >
                      {f.q}
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                        className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                          isOpen ? "border-frost bg-frost text-bg" : "border-line-strong text-silver"
                        }`}
                      >
                        <Plus className="size-4" aria-hidden />
                      </motion.span>
                    </button>
                  </h3>
                  {/* grid-rows 0fr → 1fr: height animates without measuring */}
                  <div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="max-w-prose pb-6 pr-12 leading-relaxed text-silver">{f.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
