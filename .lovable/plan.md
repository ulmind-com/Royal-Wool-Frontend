## Goal

Banner-ta ekhon onek lomba, ar duipashe gutter/faka jayga ache. Duitoi thik kora hobe — edge-to-edge full-bleed, ar height onek kom.

## Change (`src/components/commerce/brand-banner.tsx`)

1. **Side faka na thakuk** — `max-w-[1600px]` container ar `px-4 sm:px-6 lg:px-10` padding bad. Section-ta full-bleed hobe (`w-full`), tai image screen-er bam theke dan porjonto pouchabe. Rounded corner + border + shadow-o bad (edge-to-edge-e oi frame bemanan lagbe).
2. **Lombay choto** — `aspect-[1656/931]` bad; tar jaygay fixed responsive height: mobile ~`h-[38vw]` cap kore `h-40`, tablet `sm:h-56`, desktop `lg:h-72` (approx 200–290px). Image `object-cover object-center` — tai banner-er majhkhaner "Feel the softness / Royaall Wool" lekha-ta center-e thakbe, sudhu upor-niche crop hobe.
3. Upor-nicher spacing-o komano hobe (`mt-24` → `mt-16 sm:mt-20`) jate section-ta aro compact lage. Fade-in animation ar alt text jemon ache tolo thakbe.

Kono heading/text add hobe na — sudhu image.
