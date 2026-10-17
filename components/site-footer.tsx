import { contact, partners, services } from "@/lib/data";
import { Wordmark } from "./wordmark";

const explore = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Results", href: "#results" },
  { label: "Packages", href: "#packages" },
  { label: "FAQ", href: "#faq" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 pb-32 pt-16 sm:px-8 md:pb-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#top" aria-label="Lugh Autohaus home">
              <Wordmark size="lg" />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Where ancient mastery meets modern protection. Paint protection film, correction,
              ceramic coatings, tints and detailing — finished by hand.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="eyebrow">Explore</h3>
              <ul className="mt-3">
                {explore.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="inline-flex min-h-11 items-center text-silver transition-colors hover:text-frost">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow">Services</h3>
              <ul className="mt-3">
                {services.map((s) => (
                  <li key={s.id}>
                    <a href="#services" className="inline-flex min-h-11 items-center text-silver transition-colors hover:text-frost">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="eyebrow">Contact</h3>
              <ul className="mt-3">
                <li>
                  <a href={contact.phoneHref} className="inline-flex min-h-11 items-center text-silver transition-colors hover:text-frost">
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center break-all text-silver transition-colors hover:text-frost">
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="hairline mt-14" />
        <div className="flex flex-col gap-3 pt-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Lugh Autohaus. All rights reserved.</p>
          <p>Accredited: {partners.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
