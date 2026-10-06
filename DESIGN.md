---
# gstack: design-md-format=spec
name: iqrra.com
description: An evidence-first Arabic marketing site for a teacher-facing AI tool — real product screenshots over illustration, contrast-audited teal, editorial restraint.
colors:
  primary: "#006D65"          # teal-ink — every button, link, active state; 6.22:1 white-on-fill
  on-primary: "#ffffff"
  surface: "#ffffff"           # card
  background: "#F6F5F1"
  text: "#0B1B33"               # navy
  text-muted: "#5C6675"
  accent: "#34D6C6"             # aqua — AI/highlight moments (dots, closing-panel CTA), never body text
  brand: "#00A99D"              # logo teal — decorative/logo only, 2.93:1, fails text contrast
  border: "#E6E3DB"
  error: "#B4232A"
typography:
  display:
    fontFamily: "IBM Plex Sans Arabic"
    fontWeight: 700
    fontSize: "clamp(32px, 5.5vw, 52px)"
    lineHeight: 1.45
  body:
    fontFamily: "IBM Plex Sans Arabic"
    fontWeight: 400
    fontSize: 1rem
    lineHeight: 1.75
  label:
    fontFamily: "IBM Plex Sans Arabic"
    fontWeight: 600
    fontSize: 0.875rem
rounded:
  sm: 10px
  md: 12px
  lg: 20px
  xl: 24px
  full: 999px
spacing:
  xs: 6px
  sm: 14px
  md: 20px
  lg: 32px
  xl: 44px
  2xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "#00564F"
  button-ghost:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "#E3F2EF"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
  input:
    backgroundColor: "{colors.background}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
  nav-link:
    textColor: "{colors.text-muted}"
---

# iqrra.com

## Overview

**Creative North Star:** Show, don't decorate — the product's own screens are the persuasion, so the page gets out of their way.

**Product context:** اقرأ (Iqraa) — an Arabic-native AI assistant that helps Jordanian teachers prepare lesson plans, worksheets, quizzes, and slides aligned to the NCCD/MoE national curriculum. This site is the free-trial marketing funnel; audience is teachers and schools in Jordan, read right-to-left in Arabic.

**Mode per surface:** Persuade (this site) — evidence-led, not hype-led. The in-app product (separate repo, shared color system) is Operate mode.

**Reference sites:** None — no live research was run this session (built-in knowledge only, by user choice). This file documents the system as it already exists in `index.html`, not a net-new proposal.

**Key characteristics (what a visitor notices in five seconds):**
- Real phone screenshots of the actual app, not illustration or stock photography
- A single confident teal-on-white system, no gradients competing for attention
- Feature cards are plain cards beside a real screenshot; the only numbers on the page are the three "how it works" steps
- Copy states outcomes plainly ("lesson prep in minutes, not hours") — no "unlock the power of..." filler
- RTL Arabic throughout, IBM Plex Sans Arabic at a readable line-height (1.75 body / 1.45 headline)

## Colors

**Strategy:** Restrained — one hue (teal) carries every interactive and brand moment; navy and a warm off-white neutral do the rest; aqua is reserved for AI-flavored accents.

**Light or dark:** Light only, deliberately. The use scene is a teacher skimming this page on a phone in daylight to decide whether to try the app — not a low-light "dev tool" context. The in-app product (different mode, different scene) has its own light/dark handling; this marketing site does not need to match it.

Named rules:
- `primary` (`#006D65`) carries every interactive element: links, buttons, active nav state, focus rings.
- `brand` (`#00A99D`, the literal logo hue) is decoration-only — used for the header mark's background and nothing that carries text, because it fails WCAG AA as a text color (2.93:1).
- `accent` (aqua `#34D6C6`) marks "AI is doing something" moments: the lead phone's dot in the header mark, the closing panel's CTA button, active pagination dots. It never carries body text.
- `text-muted` (`#5C6675`) is for secondary copy only; primary copy always uses `text` (navy) or white-on-teal, never gray-on-gray.
- Dark surfaces (the closing CTA panel) use `navy` as a solid fill with white/aqua text — not a lightness-inverted version of the light palette, a deliberate dark card sitting inside an otherwise light page.

## Typography

IBM Plex Sans Arabic is doing double duty as both display and body voice right now — functional, legible, RTL-correct, and *not* the ecosystem's most overused face the way Inter is for Latin (the pool of well-designed free Arabic webfonts is much smaller, so this carve-out is real, not a shortcut). Line-height is deliberately generous (1.75 body, 1.45 for `h1`) because Arabic is a connected script and tight leading crowds the joins and diacritics — this is stated explicitly in the source CSS and should not be "optimized" down by anyone who hasn't checked a real Arabic paragraph at the new value.

**Open decision — explored, not yet adopted:** giving `h1`/hero moments a distinct display face (Markazi Text or El Messiri, see Decisions Log) while keeping every other role on IBM Plex Sans Arabic. Do not implement either without a live Google Fonts check first — this session did not verify availability.

## Layout

Single centered column, `max-width: 1040px`. Section padding steps up to 64–72px between major sections — a bigger jump than the 4/8px component-level rhythm, and that's intentional: it's what makes each section (hero, features, steps, FAQ, closing) read as its own beat rather than a uniform scroll. The feature section deliberately breaks the grid with `features-split` (a fixed-width screenshot beside a flexible card grid) instead of forcing everything into the same column count as the hero.

Mobile: the three-screenshot hero row becomes a horizontal snap-scroll strip rather than stacking vertically or hiding cards — every screen stays reachable with one gesture, and nothing auto-advances under a reading teacher.

## Elevation & Depth

Shadows are offset and soft, never a zero-offset glow: phone screenshots use `0 14px 26px -6px rgba(8,27,58,.22)` with a negative spread that pulls the blur in from the edges. Cards use a 1px border (`--border`) plus this same soft-shadow family, not a flat drop-shadow-only look.

## Shapes

- `sm` (10px) — small buttons, chips, form inputs
- `md` (12px) — primary/secondary buttons, step badges
- `lg`–`xl` (20–24px) — cards, phone screenshot frames, the closing panel
- `full` (999px) — pills (`.beta`, `.eyebrow`), circular step numbers, social icons

Nested elements keep inner radius smaller than outer (e.g. a 24px card never contains an element with an equal or larger radius).

## Components

- **button-primary**: solid teal-ink fill, white text, 12px radius. Hover darkens to `#00564F` (never a gradient). Focus-visible gets a 3px teal outline offset 3px.
- **button-ghost**: white fill, bordered, navy text; hover only changes border/text color to teal-ink — no background shift.
- **chip** (`.eyebrow`, `.beta`): light teal tint background, teal-ink text, full radius. Functional labels (audience targeting, trial status), not decoration — see Do's and Don'ts on the kicker pattern.
- **card** (`.feat`, `.faq-item`, `.ask`): white surface, 1px border, soft shadow, 20–24px radius. Never nested inside another card.
- **input**: warm-gray background (not white), border, 12–16px padding; focus gets the same 3px teal outline as buttons.
- **nav-link**: muted gray, hovers to teal-ink; current section is not otherwise marked (single-page site, no active-route state needed).

## Do's and Don'ts

- Do: keep every new interactive element on the `primary` (teal-ink) token — do not introduce a second "brand" color for buttons.
- Do: use real product screenshots for anything claiming "this is what the app does" — never a mockup, illustration, or stock photo standing in for the product.
- Do: keep body line-height ≥1.7 for Arabic paragraphs; do not tighten it to match a Latin-typography instinct.
- Do: give each major section its own device (screenshot, counter-badge) rather than repeating the same icon-in-circle card shape site-wide.
- Don't: add a gradient CTA button, a purple/violet accent, or a second unrelated brand hue.
- Don't: add emoji as icons or bullet points anywhere on this page — every icon on the page today is either a real screenshot or a hand-built SVG mark (the header logo), and that's the standard to hold.
- Don't: let a stock illustrated "character" template (the kind every AI-tool landing page reaches for) replace the screenshot-led hero — if a custom illustration is added, it must be commissioned/drawn in this palette, restrained in size, and never the load-bearing hero visual.
- Don't: stack a new kicker pill above every heading by default — `.eyebrow` above `h1` is already present and accepted (it states real audience targeting), but it shouldn't propagate to `h2`s without a reason.

## Motion

- **Approach:** minimal-functional — transitions exist only where they aid comprehension (hover color shifts, FAQ chevron rotation, mobile caption fade), nothing decorative or scroll-driven yet.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out) — consistent with the existing `.15s`–`.25s` transition durations in the CSS.
- **Duration:** micro(80ms, tap/hover) short(150–250ms, chevron/caption) — nothing longer is currently used.
- **The one authored moment:** the FAQ chevron rotates 180° on open/close; everything else is a plain color/border transition.
- Not proposed this session: scroll-triggered reveals or stagger. Would be a legitimate future risk (see Decisions Log) but wasn't in scope for this pass.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-28 | DESIGN.md created by /design-consultation, documenting the existing system rather than proposing a new one | The site (`index.html`) already carries a deliberate, contrast-audited, anti-slop-aware system — consultation's job here was extraction + gap-check, not redesign |
| 2026-09-28 | Reference image ("Brew Learning Activities with AI" — dark-green marketing screenshot with a stock illustrated character and emoji pill badges) rejected as a template | Different hue family from brand teal, emoji-as-icons is a flagged anti-pattern, generic self-serve-SaaS tone doesn't fit a curriculum-trust product for Jordanian teachers |
| 2026-09-28 | Proposed, not yet adopted: distinct Arabic display face for `h1` only (Markazi Text or El Messiri candidates) | Needs a live Google Fonts availability/weight check before implementation — skipped this session by user choice |
| 2026-09-28 | Proposed, not yet adopted: one small custom-illustrated "hours→minutes" motif, teal/aqua/navy only, no face/emoji | Real asset to commission/draw, not to fake with CSS shapes; kept out of scope for this pass |
| 2026-09-28 | Declined this session: AI-generated visual mockup variants via gstack's design tool | User chose to document + drill into fonts/illustration only, not generate rendered comparisons |
| 2026-10-04 | Palette now equals the app's (`artifacts/mobile/constants/colors.ts`): teal-ink #007A72→#006D65, navy #081B3A→#0B1B33, bg #F5F7FA→#F6F5F1 (warm), muted, border and chip tint likewise | Theme review: the near-copy made the site cool-grey and the app warm-grey, so a teacher tapping «جرّب اقرأ مجانًا» saw the product change colour. Teal/navy/paper kept over chalkboard-green and notebook-blue alternatives; the app's values win because they are contrast-audited in both themes |
| 2026-10-06 | Hero has one solid call to action (the web trial); the Android waitlist submit is a ghost button under a muted lead line. Phones get a menu button that opens the section links, with the Android link moved inside it. The video poster is our own `img/video-poster.jpg` (navy card, new logo), with the aqua-on-navy play button | Review found three solid teal buttons above the fold, no way to reach the section links on a phone, and a YouTube-frame poster carrying the old IQRA artwork (and fetching from i.ytimg.com on load, against the facade's own comment) |
| 2026-10-06 | Feature-card numerals removed. Hero screenshots: the empty chat screen is replaced by a generated lesson plan with its edit controls (`img/plan-edit.jpg`), the orange chemistry screen beside the features by the lesson's textbook figures (`img/plan-lesson.jpg`), and the three screens are shown about 20% larger | Review found two numbered lists back to back (read as one sequence of seven), an empty-state screen as the third proof point, a solid-orange screen clashing with the teal brand, and screenshot text too small to read. New captures are from the web app in demo mode (the same output app.iqrra.com gives a teacher), 360x800 at 1.5x |
| 2026-10-06 | Polish pass. Headings and short blocks use `text-wrap: balance` and paragraphs `text-wrap: pretty`, so no line ends on a stranded word. Phone screenshot strip gets a one-line swipe hint (gone after the first swipe) and 44px dots. Small footer and blog links get a 44px hit area (invisible pseudo-element). Homepage blog cards get a navy band showing the post's own number as text (٨ طرق, ٩ طرق, ١٠٠ أمر), taken from the title by `tools-build-blog.mjs`; the share-card images were not used because they repeat the title. The feedback form sits behind an «اكتب اقتراحك» button, and `/#feedback` opens it | Review items 6–10: stranded words, a weak swipe cue, tap targets of 22–30px, text-only blog cards, and the longest block on a phone being a four-field form beneath two email sign-ups |
