"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ServiceId } from "@/lib/data";

type QuoteState = {
  service: ServiceId | "";
  /** Pre-select a service, then bring the quote form into view and focus it. */
  startQuote: (service?: ServiceId) => void;
  setService: (service: ServiceId | "") => void;
};

const QuoteContext = createContext<QuoteState | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<ServiceId | "">("");

  const startQuote = useCallback((next?: ServiceId) => {
    if (next) setService(next);
    const form = document.getElementById("quote");
    if (!form) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Focus after the scroll settles so the keyboard doesn't fight it on iOS.
    window.setTimeout(() => document.getElementById("vehicle")?.focus({ preventScroll: true }), 600);
  }, []);

  return (
    <QuoteContext.Provider value={{ service, setService, startQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}
