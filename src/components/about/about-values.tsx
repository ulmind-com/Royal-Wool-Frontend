import { ABOUT_VALUES } from "@/data/about";

/** Borderless icon band — ink illustration over title over one line. */
export function AboutValues() {
  return (
    <section
      aria-label="How we work"
      className="mx-auto w-full max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20 lg:px-10"
    >
      <p className="font-data text-2xs text-marigold">How we work</p>
      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border/70 pt-10 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
        {ABOUT_VALUES.map((value) => (
          <li key={value.id} className="group flex flex-col items-center px-1 text-center lg:px-6">
            <span
              aria-hidden
              className="grid h-16 w-16 place-items-center rounded-full border border-border/60 bg-card/70 transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:-translate-y-0.5 group-hover:border-marigold/60"
            >
              <img
                src={value.icon}
                alt=""
                loading="lazy"
                decoding="async"
                width={512}
                height={512}
                className="h-10 w-10 object-contain opacity-85 transition-transform duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:scale-105"
              />
            </span>
            <p className="mt-4 font-display text-base font-normal leading-snug text-foreground">
              {value.title}
            </p>
            <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
              {value.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
