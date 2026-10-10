"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, LoaderCircle, Mail, Phone } from "lucide-react";
import { contact, services, type ServiceId } from "@/lib/data";
import { Reveal } from "./motion";
import { useQuote } from "./quote-context";

const field =
  "w-full min-w-0 rounded-xl border border-line bg-surface/70 px-3.5 text-base text-frost placeholder:text-muted/70 outline-none transition-colors focus:border-faint focus:bg-surface";

type Errors = Partial<Record<"vehicle" | "name" | "reach", string>>;

export function Quote() {
  const { service, setService } = useQuote();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(data.get("vehicle")).trim()) next.vehicle = "Tell us the make and model.";
    if (!String(data.get("name")).trim()) next.name = "Please add your name.";
    if (!String(data.get("reach")).trim()) next.reach = "Add a phone number or email so we can reply.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    // Demo only: wire to the client's inbox or CRM before launch.
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  }

  const err = (id: keyof Errors) =>
    errors[id] && (
      <p id={`${id}-error`} className="mt-1.5 text-sm text-copper-text">
        {errors[id]}
      </p>
    );

  return (
    <section
      id="quote"
      aria-labelledby="quote-title"
      className="pb-20 pt-24 sm:pb-28 sm:pt-32"
    >

      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Get a quote</p>
          <h2 id="quote-title" className="display mt-3 max-w-[12ch] text-4xl sm:text-5xl">
            Protect what you love to drive
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-silver">
            Tell us about your car and what you&rsquo;re after. We&rsquo;ll come back with honest
            advice and a clear price.
          </p>

          <ul className="mt-8 space-y-2">
            <li>
              <a href={contact.phoneHref} className="press inline-flex min-h-11 items-center gap-3 text-frost hover:text-white">
                <span className="grid size-10 place-items-center rounded-full border border-line-strong">
                  <Phone className="size-4" aria-hidden />
                </span>
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="press inline-flex min-h-11 items-center gap-3 text-frost hover:text-white">
                <span className="grid size-10 place-items-center rounded-full border border-line-strong">
                  <Mail className="size-4" aria-hidden />
                </span>
                {contact.email}
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.06}>
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-[28px] border border-line bg-bg-2 p-5 sm:p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-silver">
                  Service
                </label>
                <select
                  id="service"
                  name="service"
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceId | "")}
                  className={`${field} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23b8b4ae' stroke-width='1.5'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")] bg-[position:right_0.9rem_center] bg-no-repeat pr-10`}
                >
                  <option value="">Not sure yet — advise me</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="vehicle" className="mb-1.5 block text-sm font-medium text-silver">
                  Vehicle
                </label>
                <input
                  id="vehicle"
                  name="vehicle"
                  autoComplete="off"
                  placeholder="e.g. 2024 BMW M3"
                  aria-invalid={!!errors.vehicle}
                  aria-describedby={errors.vehicle ? "vehicle-error" : undefined}
                  className={`${field} h-12`}
                />
                {err("vehicle")}
              </div>

              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-silver">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`${field} h-12`}
                />
                {err("name")}
              </div>

              <div>
                <label htmlFor="reach" className="mb-1.5 block text-sm font-medium text-silver">
                  Phone or email
                </label>
                <input
                  id="reach"
                  name="reach"
                  autoComplete="tel"
                  aria-invalid={!!errors.reach}
                  aria-describedby={errors.reach ? "reach-error" : undefined}
                  className={`${field} h-12`}
                />
                {err("reach")}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-silver">
                  Anything else? <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Condition of the paint, colour change ideas, timing…"
                  className={`${field} resize-none py-3 leading-relaxed`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="press btn-primary relative mt-6 h-13 w-full overflow-hidden rounded-xl px-6 py-3.5 disabled:opacity-90"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : status === "sent" ? (
                    <>
                      <CircleCheck className="size-4" aria-hidden />
                      Request sent
                    </>
                  ) : (
                    "Request my quote"
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            <p aria-live="polite" className="text-sm text-silver empty:hidden">
              {status === "sent" && (
                <span className="mt-4 block">Thank you — we&rsquo;ll be in touch shortly with your quote.</span>
              )}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
