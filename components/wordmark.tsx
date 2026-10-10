/** Text wordmark: bronze "Lugh" (the logo's one colour) + quiet tracked caps. */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className={`bronze-text font-[family-name:var(--font-display)] font-semibold leading-none tracking-[-0.01em] ${
          lg ? "text-3xl" : "text-[1.375rem]"
        }`}
      >
        Lugh
      </span>
      <span
        className={`font-medium uppercase tracking-[0.24em] text-muted ${lg ? "text-xs" : "text-[0.6875rem]"}`}
      >
        Autohaus
      </span>
    </span>
  );
}
