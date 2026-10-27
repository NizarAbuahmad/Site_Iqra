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
  primary-deep: "#00564F"       # hover fill for primary buttons; 8.59:1 with white
  chip-tint: "#E3F2EF"          # chips and the success banner; primary on it is 5.40:1
  on-navy: "#E8F4F2"            # text on the dark closing panel; 15.30:1
  on-navy-muted: "#8BA0B8"      # secondary text on navy; 6.41:1
  on-navy-line: "#33506F"       # border of the ghost button on navy
  success-line: "#B7DDD7"       # success banner border
  error-bg: "#FDECEC"           # error banner fill
  error-line: "#F3C4C6"         # error banner border
  error-text: "#9B1C22"         # on error-bg 7.12:1
  warning-bg: "#FFF7E6"         # the /download "remove the old version" step
  warning-line: "#F0DCB4"
  warning-text: "#8A6100"       # on warning-bg 5.20:1
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
  # Fluid roles. Inner pages (curriculum, download, blog) set their own h1/h2
  # clamps within 2px of page-title and section-title; the canonical ones are here.
  page-title:
    fontWeight: 700
    fontSize: "clamp(28px, 4.4vw, 42px)"
    lineHeight: 1.35
  headline:
    fontWeight: 700
    fontSize: "clamp(24px, 3.5vw, 34px)"
  section-title:
    fontWeight: 700
    fontSize: "clamp(21px, 3vw, 28px)"
  hero-lead:
    fontSize: "clamp(17px, 2.2vw, 20px)"
  lede:
    fontSize: "clamp(16px, 1.8vw, 18px)"
  numeral:
    fontWeight: 700
    fontSize: 44px
  # The fixed steps the CSS actually uses, largest to smallest.
  title-lg:
    fontSize: 22px
  title-md:
    fontSize: 21px
  title:
    fontSize: 20px
  title-sm:
    fontSize: 19px
  title-xs:
    fontSize: 18px
  body-lg:
    fontSize: 17px
  body-sm:
    fontSize: 15.5px
  compact:
    fontSize: 15px
  meta:
    fontSize: 13.5px
  caption:
    fontSize: 13px
  micro:
    fontSize: 12px
rounded:
  xs: 6px
  sm: 10px
  md: 12px
  md-plus: 14px
  lg-minus: 16px
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
    backgroundColor: "{colors.primary-deep}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "{colors.chip-tint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  panel-dark:
    backgroundColor: "{colors.text}"
    textColor: "{colors.on-navy}"
    rounded: "{rounded.xl}"
  banner-success:
    backgroundColor: "{colors.chip-tint}"
    borderColor: "{colors.success-line}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md-plus}"
  banner-error:
    backgroundColor: "{colors.error-bg}"
    borderColor: "{colors.error-line}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.md-plus}"
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

**Product context:** إقرأ (Iqrra) — an Arabic-native AI assistant that helps Jordanian teachers prepare lesson plans, worksheets, quizzes, and slides aligned to the NCCD/MoE national curriculum. This site is the free-trial marketing funnel; audience is teachers and schools in Jordan, read right-to-left in Arabic.

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
- On that panel the only text colors are `on-navy` (`#E8F4F2`, headings and button text) and `on-navy-muted` (`#8BA0B8`, the supporting line); `on-navy-line` (`#33506F`) is the ghost button's border there.
- Form results are banners: success reuses `chip-tint` with `success-line` and `primary` text; errors use `error-bg`, `error-line` and `error-text`. `warning-*` is used once, for the `/download` step that tells people to remove an old install, and is not decoration.

## Typography

IBM Plex Sans Arabic is doing double duty as both display and body voice right now — functional, legible, RTL-correct, and *not* the ecosystem's most overused face the way Inter is for Latin (the pool of well-designed free Arabic webfonts is much smaller, so this carve-out is real, not a shortcut). Line-height is deliberately generous (1.75 body, 1.45 for `h1`) because Arabic is a connected script and tight leading crowds the joins and diacritics — this is stated explicitly in the source CSS and should not be "optimized" down by anyone who hasn't checked a real Arabic paragraph at the new value.

**Type scale.** Fluid roles (`display`, `page-title`, `headline`, `section-title`, `hero-lead`, `lede`) carry headings and lead paragraphs; below them the CSS uses fixed steps from `micro` (12px) to `title-lg` (22px). Most UI text is `label` (14px) or `compact` (15px), and the paragraphs in feature cards, steps and FAQ answers are `body-sm` (15.5px). Three one-offs are deliberately not tokens: 12.5px (the curriculum `.lbl`), 14.5px (curriculum pills) and `.92em` (inline code in blog posts). The curriculum, download and blog pages each set their own h1/h2 clamp within 2px of `page-title` and `section-title`; that drift is known and left alone.

**Open decision — explored, not yet adopted:** giving `h1`/hero moments a distinct display face (Markazi Text or El Messiri, see Decisions Log) while keeping every other role on IBM Plex Sans Arabic. Do not implement either without a live Google Fonts check first — this session did not verify availability.

## Layout

Single centered column, `max-width: 1040px`. Section padding steps up to 64–72px between major sections — a bigger jump than the 4/8px component-level rhythm, and that's intentional: it's what makes each section (hero, features, steps, FAQ, closing) read as its own beat rather than a uniform scroll. The feature section deliberately breaks the grid with `features-split` (a fixed-width screenshot beside a flexible card grid) instead of forcing everything into the same column count as the hero.

Mobile: the three-screenshot hero row becomes a horizontal snap-scroll strip rather than stacking vertically or hiding cards — every screen stays reachable with one gesture, and nothing auto-advances under a reading teacher.

## Elevation & Depth

Shadows are offset and soft, never a zero-offset glow: phone screenshots use `0 14px 26px -6px rgba(11,27,51,.22)` with a negative spread that pulls the blur in from the edges. Cards use a 1px border (`--border`) plus this same soft-shadow family, not a flat drop-shadow-only look.

## Shapes

- `xs` (6px) — focus rings on text links, inline code
- `sm` (10px) — small buttons, the menu button, social icons, search fields
- `md` (12px) — primary/secondary buttons, form fields, blog tabs
- `md-plus` (14px) — curriculum unit cards and the jump-nav panel, form result banners, blog timeline items
- `lg-minus` (16px) — how-it-works steps, FAQ items, download steps, blog callouts (`.tldr`, `.toc`), the curriculum closing panel
- `lg` (20px) — homepage feature cards, blog-strip cards, the video, download screenshots
- `xl` (24px) — phone screenshot frames, the dark closing panel, the feedback card
- `full` (999px) — pills (`.beta`, `.eyebrow`, `.term`), pagination dots; circles (`50%`) for step number badges

Two curriculum values are one-offs and not tokens: 13px on the curriculum index tiles and 3px on that stylesheet's focus ring.

Nested elements keep inner radius smaller than outer (e.g. a 24px card never contains an element with an equal or larger radius).

## Components

- **button-primary**: solid teal-ink fill, white text, 12px radius. Hover darkens to `#00564F` (never a gradient). Focus-visible gets a 3px teal outline offset 3px.
- **button-ghost**: white fill, bordered, navy text; hover only changes border/text color to teal-ink — no background shift.
- **chip** (`.eyebrow`, `.beta`): light teal tint background, teal-ink text, full radius. Functional labels (audience targeting, trial status), not decoration — see Do's and Don'ts on the kicker pattern.
- **card** (`.feat`, `.faq-item`, `.ask`): white surface, 1px border, soft shadow, 16–24px radius (`.faq-item` 16, `.feat` 20, `.ask` 24). Never nested inside another card.
- **panel-dark** (`.closing`): navy fill, `on-navy` text, 24px radius; the aqua primary button is the one place aqua carries a button.
- **subject tile, held** (`ul.cards .soon` on `/manhaj`): the same 13px-radius tile as a published subject but with no white fill and a muted name, a non-link `div` that says «نتاجات التعلّم قريبًا». It marks a subject the app has whose learning outcomes are not published yet; it never gets a URL, a sitemap entry or a link.
- **banner-success / banner-error** (`.say.ok`, `.say.bad`): the result of a form submit, 14px radius, colors per Colors above.
- **input**: warm-gray background (not white), border, 12–16px padding; focus gets the same 3px teal outline as buttons.
- **nav-link**: muted gray, hovers to teal-ink; current section is not otherwise marked (single-page site, no active-route state needed).
- **question assistant** (`.iqchat-*`, `ask.js` / `ask.css`; every class is prefixed `iqchat-` because the page already uses `.ask` for the suggestion card): a round 56px launcher in teal-ink with a white hand-built bubble icon, bottom-left of the viewport (`inset-inline-end` on this RTL page); it opens a `card` panel (24px radius, 360px wide on desktop, a full-width bottom sheet at 640px and below) with a white bot bubble (1px border, 16px radius), a teal-ink user bubble with white text, `chip` starter questions, the `input` and `button-primary` styles for the form, and the `banner-error` colours for a notice. Every standalone tap target (chips, links, buttons) is at least 44px; the one exception is a link inside the running text of an answer (`.iqchat-link`, about 27px tall), which is an inline text link. Focus rings follow the usual 3px teal outline, offset 3px, with documented exceptions: the notice link's ring is `error-text` (`#9B1C22`) because it sits on the red notice, and in the compact layout the close button's ring uses offset 0 and the chips' a 2px offset, so the rings stay inside the panel (`overflow: hidden`). Short screens (up to 520px high, and phone sheets up to 600px high) tighten the layout: the chips become one scrolling row and the log gives space first, so the title, the input and the AI/privacy line under it stay visible; the line is never clipped. Where the panel covers the site header (measured at 1280px wide with the 85px header; the header's own wrap at about 720-1000px is not accounted for): on a desktop-width window (over 640px) the 360px card covers the header's left-hand buttons, before the first question, at window heights of about 521-559px and again below about 429px (and the header band at 521-580px and below about 450px); it clears them at 429-520px, where the compact layout applies, and from 560px (buttons) / 581px (band) upward; once a conversation has filled the card it covers the buttons at every height below about 641px and the band below about 661px, the compact range included; the phone sheet (640px wide or less) stays under the 70px header at 353px of height and above, and covers it at 352px and below, because under that the privacy line would not fit otherwise. The panel must set `padding: 0`, because the page's global `section{padding:64px 0}` would otherwise apply to it. A link inside an answer (only to https://iqrra.com, https://www.iqrra.com and https://app.iqrra.com, built from the reply's text by `linkify` in `ask.js`) is `.iqchat-link`: teal-ink, underlined, with the usual 3px ring at offset 3px, opening in a new tab. The open animation is 200ms (a fade and an 8px rise) and is off under `prefers-reduced-motion`; the launcher also fades its colour on hover over 150ms, off under the same setting. It is hidden when printing.

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
- **The two authored moments:** the FAQ chevron rotates 180° on open/close, and the hero is a silent, looping tour of the real app under the headline (`img/hero-desktop.mp4` 16:9; phones ≤640px get `img/hero-phone.mp4` 9:16): «اليوم» → lesson plan with the textbook's figures → worksheet → slides on screen. It plays while on screen, pauses off screen, and a labelled «إيقاف الفيديو» button under the frame stops it (WCAG 2.2.2). The `<picture>` is its poster and the fallback for no JS, `prefers-reduced-motion` and Save-Data. Everything else is a plain color/border transition.
- Not proposed this session: scroll-triggered reveals or stagger. Would be a legitimate future risk (see Decisions Log) but wasn't in scope for this pass.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-28 | DESIGN.md created by /design-consultation, documenting the existing system rather than proposing a new one | The site (`index.html`) already carries a deliberate, contrast-audited, anti-slop-aware system — consultation's job here was extraction + gap-check, not redesign |
| 2026-09-28 | Reference image ("Brew Learning Activities with AI" — dark-green marketing screenshot with a stock illustrated character and emoji pill badges) rejected as a template | Different hue family from brand teal, emoji-as-icons is a flagged anti-pattern, generic self-serve-SaaS tone doesn't fit a curriculum-trust product for Jordanian teachers |
| 2026-09-28 | Proposed, not yet adopted: distinct Arabic display face for `h1` only (Markazi Text or El Messiri candidates) | Needs a live Google Fonts availability/weight check before implementation — skipped this session by user choice |
| 2026-09-28 | Proposed, not yet adopted: one small custom-illustrated "hours→minutes" motif, teal/aqua/navy only, no face/emoji | Real asset to commission/draw, not to fake with CSS shapes; kept out of scope for this pass |
| 2026-09-28 | Declined this session: AI-generated visual mockup variants via gstack's design tool | User chose to document + drill into fonts/illustration only, not generate rendered comparisons |
| 2026-10-04 | Palette now equals the app's (`artifacts/mobile/constants/colors.ts`): teal-ink #007A72→#006D65, navy #081B3A→#0B1B33, bg #F5F7FA→#F6F5F1 (warm), muted, border and chip tint likewise | Theme review: the near-copy made the site cool-grey and the app warm-grey, so a teacher tapping «جرّب إقرأ مجانًا» saw the product change colour. Teal/navy/paper kept over chalkboard-green and notebook-blue alternatives; the app's values win because they are contrast-audited in both themes |
| 2026-10-06 | Hero has one solid call to action (the web trial); the Android waitlist submit is a ghost button under a muted lead line. Phones get a menu button that opens the section links, with the Android link moved inside it. The video poster is our own `img/video-poster.jpg` (navy card, new logo), with the aqua-on-navy play button | Review found three solid teal buttons above the fold, no way to reach the section links on a phone, and a YouTube-frame poster carrying the old IQRA artwork (and fetching from i.ytimg.com on load, against the facade's own comment) |
| 2026-10-06 | Feature-card numerals removed. Hero screenshots: the empty chat screen is replaced by a generated lesson plan with its edit controls (`img/plan-edit.jpg`), the orange chemistry screen beside the features by the lesson's textbook figures (`img/plan-lesson.jpg`), and the three screens are shown about 20% larger | Review found two numbered lists back to back (read as one sequence of seven), an empty-state screen as the third proof point, a solid-orange screen clashing with the teal brand, and screenshot text too small to read. New captures are from the web app in demo mode (the same output app.iqrra.com gives a teacher), 360x800 at 1.5x |
| 2026-10-08 | Hero clip re-recorded from the web app in demo mode (what app.iqrra.com serves) at 360×800, scaled 1.5× to 540×1200 like the two stills beside it: 9.1 s, 118 KB. Same beats — pinned lesson, «أريد خطة درس» typed, sent, the mock's «يراجع إقرأ طلبك…» held 1.4 s then a 0.4 s fade, the plan card. Poster is a crisp 1.5× screenshot of the same home state | The Android take showed the plan's first objective as «تعرُّف مفهوم…»; the app now reads it «معرفة» (Iqraa#916), and the header reads «إقرأ» (Iqraa#915). Recording from the web build also matches the other two hero screens, which are web captures. The demo badge «وضع العرض · محتوى تجريبي» is in frame because it is what a web visitor sees |
| 2026-10-07 | The hero's lead screenshot becomes a 190 KB silent H.264 clip (`img/hero-plan.mp4`, 540×1200, 9.9 s) cut from the 2026-10-06 Android recording: the pinned lesson, «أريد خطة درس» typed and sent, a 0.5 s fade over the generation wait, the plan appearing. Plays once at ≥60% visibility, holds the last frame; `img/hero-plan.jpg` (its first frame) is the poster and the still for no-JS / reduced-motion / Save-Data. The YouTube explainer stays under the steps | «Shall we add video?» — yes, but as the product moving inside the frame that already exists, not a player: a hero embed would push the screens back below the fold and cost ~500 KB before paint, and a loop would keep moving beside the headline. The wait is elided with a fade rather than sped up, so the clip does not pretend generation is instant. Known: the plan's first objective reads «تعرُّف مفهوم…»; the app is to say «معرفة», so re-cut once that ships |
| 2026-10-07 | Hero has one job again: the Android waitlist form leaves the hero for `#android` and the hero keeps a single teal text link to it. Desktop (≥1024px) hero is two columns — copy on the right, the three screens on the left — so the product is on the first screen; phones keep the centered stack with the screenshot strip right after the buttons. Body paragraph cut to the promise. One label per destination: the header and hero trial buttons both read «حضّر حصّتك الأولى مجانًا» (phones get «جرّب مجانًا» in the header for width), the curriculum link is «تصفَّح المناهج» everywhere. A one-line proof strip under the buttons (grades · subjects · learning outcomes) is written by `tools-build-curriculum.mjs` from the published snapshot, so it cannot overstate. The free/browser note moved under the web buttons, which it describes | Review found four actions above the fold (header trial, hero trial, curriculum, Android form), the product 900px down on desktop, two labels for the same destination, no proof, and «التجربة» meaning both the web trial and the Android invite list. The 2026-10-06 ghost-button compromise kept the form in the hero; this removes it. The proof strip is the one number line added since the feature-card numerals went |
| 2026-10-06 | Polish pass. Headings and short blocks use `text-wrap: balance` and paragraphs `text-wrap: pretty`, so no line ends on a stranded word. Phone screenshot strip gets a one-line swipe hint (gone after the first swipe) and 44px dots. Small footer and blog links get a 44px hit area (invisible pseudo-element). Homepage blog cards get a navy band showing the post's own number as text (٨ طرق, ٩ طرق, ١٠٠ أمر), taken from the title by `tools-build-blog.mjs`; the share-card images were not used because they repeat the title. The feedback form sits behind an «اكتب اقتراحك» button, and `/#feedback` opens it | Review items 6–10: stranded words, a weak swipe cue, tap targets of 22–30px, text-only blog cards, and the longest block on a phone being a four-field form beneath two email sign-ups |
| 2026-10-08 | `/download` tour: the third screen is the editable lesson plan (`plan-edit.jpg`), not the empty chat screen; `chat.jpg` deleted. `plan-edit.jpg` re-captured from the current app, so the first objective reads «معرفة» rather than «تعرُّف» (the homepage uses the same file) | The tour still showed the empty-chat screen the homepage dropped on 2026-10-06; the old `plan-edit.jpg` predated the «معرفة» decision and contradicted the re-recorded hero clip on the same page |
| 2026-10-11 | Polish pass. The header's primary button reads «ابدأ الآن» on the homepage, the curriculum pages and the blog (it said four different things); on phones the curriculum header now fits one row (84px, was 140px). `html{scroll-padding-top}` on the homepage (88px) and `manhaj.css` (100px) so nav and unit-pill jumps land below the sticky header (a unit's title used to sit entirely behind it); below 340px the curriculum header scrolls away instead. Fallback `:focus-visible` ring on the homepage, `::selection` in teal at 22%, teal caret in the forms. Shadow tints moved from the pre-palette navy (8,27,58) to the current one (11,27,51); curriculum button radii 9/11px → 10/12px (the scale's `sm`/`md`). «مجاناً / تماماً / قريباً» → «مجانًا / تمامًا / قريبًا», the form the rest of the page uses | Audit of the homepage and curriculum pages at 375, 768 and 1280px. Deliberately left: the detector's design-system-color/font-size/radius hits (the front matter documents only part of the real scale, so that is a documentation gap for `/impeccable document`, not a defect), its dark-glow and wide-shadow hits (no glow exists; the screenshot shadow is offset with negative spread, per Elevation above) and `privacy.html`, whose header still wraps to 140px |
| 2026-10-11 | Documented the real scale in the frontmatter instead of changing the CSS: 12 colors (hover navy, chip tint, the on-navy trio, success/error/warning banner colors), a 17-step type scale next to the three roles that existed, three more radii (6, 14 and 16px), and the dark panel and the two form banners as components. Prose merged to match (Colors, Typography, Shapes, Components); `.faq-item` corrected from 20–24px to 16px. Untokenized on purpose: 12.5px, 14.5px, `.92em`, 13px and 3px radii, the `#000` in two CSS masks (the screenshot fade and the banner icons), blog `#EEF3F5`, and the 2px drift between inner pages' h1/h2 clamps | The detector flagged these as off-scale, but every one is a value the site really ships (most used 3–23 times), so the file was wrong, not the CSS. Snapping them (e.g. curriculum cards 14px → 20px) would change ~60 pages visibly and was not chosen. Merged into the existing file; no earlier decision or rule was removed |
| 2026-10-11 | `/manhaj` lists every subject the app has (106 grade/subject pairs; 57 are pages, 49 are held tiles) instead of only the ones with a page, and the per-grade line reads «المواد المتاحة» to match. The snapshot was refreshed (it was from 2026-09-29): Grade 9 Creative Arts is now a page, Grade 9 Vocational gained its second semester, and English lesson titles come through in Arabic | Teachers asked why they could not see all grades and subjects. 24 subjects with only lesson titles in the app were being dropped by the export and 25 with key terms but no outcomes by the site's 50% gate, so half the catalog looked absent. Held subjects stay unpublished on purpose (a page of bare titles is thin content) but are now visible; the tile says the outcomes are what is coming, not the subject, since the app already has them |
| 2026-10-16 | The hero's three phone screenshots are replaced by one wide, silent, looping video of the real app under the headline: `img/hero-desktop.mp4` (1280×720, 31.6 s, 871 KB) and, at ≤640px, `img/hero-phone.mp4` (720×1280, 34.6 s, 1.5 MB). Both are cut from headless recordings of the web build in demo mode (lesson «تركيب الاقترانات»: «اليوم» → lesson plan with the textbook's figures → worksheet → slides in the «إقرأ» theme, presented), with generation waits cut rather than sped up and a crossfade back to the first frame so the loop has no seam. Plays only while on screen; a labelled «إيقاف الفيديو» button under the frame (not over it: every corner covers an app control) stops it. Poster = the opening frame; no JS / reduced motion / Save-Data keep the still. The desktop hero is centered again: the headline on one line, and the proof line + Android link move under the video so it starts ~520px down at 1440×900 instead of ~750px. `hero-plan.*` deleted; `curriculum.jpg` / `plan-edit.jpg` stay for `/download` | Nizar asked for a big wide video of the app's features in place of the three phones, playing in the background, muted and looping, with no text — overriding the 2026-10-07 "no loop beside the headline" call. The old YouTube walkthrough is a training video (and carries the old wordmark), not a feature tour. The phone gets its own 9:16 cut because a 16:9 desktop recording shrunk to 340px is unreadable. The demo badge «وضع العرض · محتوى تجريبي» stays in frame, as before |
| 2026-10-26 | The home page gets a question assistant: a round teal launcher bottom-left and a card panel, no new colour, no emoji, hand-built icons, nothing animated except a 200ms fade-and-rise on open and the launcher's 150ms colour transition on hover. Starter questions cover what it is, which grades and subjects, and whether it is free (the three questions the spec names; which questions visitors actually ask most has not been measured). Replies are plain text only, and a notice reuses the form-error banner colours with a link to the suggestion form | A short answer in place is quicker than reading the whole page for the few things most visitors want to know (what it is, which grades, whether it is free). It follows the existing system rather than adding to it, which is why this row is the only change to DESIGN.md besides the component line. The launcher sits bottom-left because the page is RTL and its primary actions are on the right |
