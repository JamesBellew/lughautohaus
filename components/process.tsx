import Image from "next/image";
import { process } from "@/lib/data";
import { Reveal, RevealItem } from "./motion";

const numerals = ["01", "02", "03", "04"];

export function Process() {
  return (
    <section id="studio" aria-labelledby="studio-title" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-3 sm:px-5">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-line bg-bg-2">
          <Image
            src="/images/studio-suv.jpg"
            alt=""
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="-z-10 object-cover object-[50%_60%] opacity-30"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg-2/50 via-bg-2/90 to-bg-2 lg:bg-gradient-to-r lg:from-bg-2/40 lg:via-bg-2/85 lg:to-bg-2" />

          <div className="grid gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:p-16">
            <Reveal className="flex flex-col">
              <p className="eyebrow">The studio</p>
              <h2 id="studio-title" className="display mt-3 max-w-[13ch] text-4xl sm:text-5xl">
                Every job is finished by hand
              </h2>
              <p className="mt-5 max-w-sm leading-relaxed text-silver">
                Each vehicle is prepped in our custom-built detail bay and wrapped in our dust-free
                wrap studio — using only industry-leading products from our accredited partners.
              </p>
              <div className="hairline mt-8 w-32" />
              <p className="display mt-6 text-xl text-muted">Where precision meets finish.</p>
            </Reveal>

            <ol className="grid gap-3">
              {process.map((step, i) => (
                <RevealItem
                  key={step.title}
                  delay={0.07 * i}
                  className="glass flex gap-4 rounded-3xl p-5 sm:p-6"
                >
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong font-[family-name:var(--font-display)] text-sm font-semibold text-silver"
                  >
                    {numerals[i]}
                  </span>
                  <div>
                    <h3 className="display text-2xl">{step.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-silver">{step.body}</p>
                  </div>
                </RevealItem>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
