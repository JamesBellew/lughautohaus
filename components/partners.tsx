import { partners } from "@/lib/data";

export function Partners() {
  // Repeat so one copy always overfills the viewport, then loop two copies.
  const set = [...partners, ...partners];
  const row = () => (
    <ul aria-hidden className="flex shrink-0 items-center gap-12 pr-12 sm:gap-20 sm:pr-20">
      {set.map((p, i) => (
        <li
          key={`${p}-${i}`}
          className="whitespace-nowrap font-[family-name:var(--font-display)] text-lg font-medium uppercase tracking-[0.18em] text-faint sm:text-xl"
        >
          {p}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="partners-title" className="pt-20 sm:pt-28">
      <p id="partners-title" className="eyebrow text-center">
        Accredited partners
      </p>
      <ul className="sr-only">
        {partners.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-6 overflow-hidden border-y border-line py-7 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee flex w-max">
          {row()}
          {row()}
        </div>
      </div>
    </section>
  );
}
