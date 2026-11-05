<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Education AI Suite style guide

The look, feel, and voice of every app built on the suite. The values live in
[../assets/tokens.css](../assets/tokens.css); see them together in
[../assets/specimen.html](../assets/specimen.html). Device and input guidance is
in [devices.md](./devices.md).

## Principles

1. **The teacher stays in charge.** AI drafts; people decide. Every AI result is
   labeled, editable, and shows where it came from. Nothing goes to students or
   families without a person choosing to send it.
2. **Built for the room.** A screen may be a laptop on a desk or a panel on the
   wall. Design for the farthest viewer and the busiest moment: one main task
   per screen, big targets, short text.
3. **Colorful with a purpose.** Color tells you where you are in the teaching
   day, what is AI, and what needs attention. It is never decoration alone and
   never the only signal.
4. **Plain and warm.** Speak like a helpful colleague, in the words teachers
   use. No technical terms in the main flow.
5. **Private by default.** Student data stays on the device and off shared
   screens. The page makes no requests to other sites.

## Signature elements

These make an app recognizably part of the suite. Use all of them.

| Element | What it is | Where |
|---|---|---|
| Moment colors | Tangerine (before class), teal (during class), grape (after class), sunflower (insights) | Ribbon on the app bar, tool tile icons, section accents |
| Spark | Teal → Intel blue → grape gradient | Only on AI actions (`.btn-ai`) and the edge of AI output (`.ai-output`). Never decorative |
| Shelf | A solid ledge under pressable things that disappears when pressed | Buttons and tiles. Static cards use a soft shadow instead, so you can tell what is pressable without hover |
| Paper | Warm off-white canvas with white cards | Page background |
| Shape confetti | Circles, half-moons, rounded triangles, squiggles, and dots in the vivid colors | Empty states, welcome screens, headers. Decorative only (`aria-hidden="true"`) |

## Color

### Tokens

| Role | Token | Hex | Use |
|---|---|---|---|
| Text | `--ink` | `#1B1E3C` | Body text, headings, focus ring |
| Secondary text | `--ink-2` | `#4A4F6E` | Hints, descriptions, table headers |
| Canvas | `--paper` | `#FBF9F5` | Page background |
| Surface | `--surface` | `#FFFFFF` | Cards, inputs, app bar |
| Divider | `--line` | `#E6E2EE` | Decorative lines and disabled fills |
| Control border | `--line-strong` | `#858AA3` | Input and secondary button borders |
| Brand (Intel Classic Blue) | `--brand` | `#0068B5` | Primary buttons, links, selected states |
| Brand dark | `--brand-strong` | `#00467F` | Primary button shelf |
| Brand vivid (Energy Blue) | `--brand-vivid` | `#00C7FD` | Decoration only, with ink text |
| Brand tint | `--brand-tint` | `#E6F2FB` | Info notices, quiet button hover |

| Moment | Strong (text, icons) | Vivid (decoration, ink text) | Tint (backgrounds) |
|---|---|---|---|
| Before class: plan, prepare, upload | `#B23F12` | `#FF8A4C` | `#FFEDE3` |
| During class: live, teach, ask | `#0A6F6A` | `#2CC9B8` | `#DDF5F2` |
| After class: recap, assess, reflect | `#7A2DB8` | `#B57CF0` | `#F2E8FD` |
| Insights: school data, reports | `#7A5200` | `#FFC93C` | `#FFF4D4` |

| Meaning | Strong | Tint |
|---|---|---|
| Success | `#1D7A4A` | `#E2F5EA` |
| Warning | `#8F4A00` | `#FFF0DB` |
| Danger, recording | `#BF1F2F` | `#FDE8EA` |
| Info | brand | brand tint |

### Rules

- Mostly paper and white, with ink text; color in about one tenth of the screen.
- One moment per app (`data-moment` on `<html>`). A home screen that lists
  tools from several moments sets `data-moment` on each tile.
- Text uses only ink, ink-2, brand, or a **strong** color. Never put text in a
  vivid color; vivid fills carry ink text only.
- Contrast checked against white, paper, and the matching tint: all text pairs
  are 4.5:1 or more, `--line-strong` is 3:1 or more. Keep to these pairs and no
  check is needed.
- On projectors, tints wash out. In board mode, signal meaning with strong
  colors, icons, and words, not tints alone.
- Every state has a word or icon as well as a color.

### Charts

- Series order: brand, during, before, after, insights (strong colors for lines
  and text, vivid for bars and areas).
- Label series directly instead of with a legend when possible; add patterns or
  markers when series could be confused.
- Lead with a sentence that says what the chart shows ("Questions per class
  went up 20% this week").

## Typography

One family, bundled with every app so nothing is downloaded at run time and text
looks the same offline: **Clear Sans**, Intel's typeface designed for on-screen
legibility, published by Intel under Apache-2.0 (the suite's own license).

- Files: [../assets/fonts/](../assets/fonts/): `ClearSans-Regular.woff` (400),
  `ClearSans-Medium.woff` (500), `ClearSans-Bold.woff` (700), and `LICENSE.txt`.
  Ship `LICENSE.txt` with the fonts.
- Source: `github.com/intel/clear-sans` at commit
  `1993725b24a36af21e7ebaa8977103983b608572`, folder `WOFF/`. Intel has
  discontinued the project, so expect no updates; the font itself is complete.
- Code and numbers that must line up use `--font-mono`, led by Intel One Mono
  if it is installed (OFL-1.1; not bundled).
- Intel's brand fonts (IntelOne Display and Text) are not publicly licensed;
  don't reference them in suite apps.
- Clear Sans covers Latin, Greek, and Cyrillic. Other scripts (for example
  Chinese) fall back to the system font in the stack; check those layouts.

| Token | Desk | Board | Use |
|---|---|---|---|
| `--text-3xl` | 44 px | 77 px | Welcome and present-mode headlines |
| `--text-2xl` | 32 px | 56 px | Page title (`h1`) |
| `--text-xl` | 24 px | 42 px | Section title (`h2`) |
| `--text-lg` | 20 px | 35 px | Card and tile titles (`h3`), large buttons |
| `--text-md` | 16 px | 28 px | Body text, buttons, inputs |
| `--text-sm` | 14 px | 24.5 px | Hints, labels on pills, sources. Nothing smaller |

- Weights: `--weight-bold` (700) for headings, buttons, and pills;
  `--weight-medium` (500) for field labels and table headers; `--weight-regular`
  (400) for body. Nothing lighter: thin text breaks up on projectors.
- Sentence case everywhere: titles, buttons, tabs. No all-caps text.
- Lines at most `--measure` long (70 characters at a desk, 40 on the board).
- Numbers in tables use `.num` (tabular figures, right-aligned).

## Layout and spacing

- 4 px grid: `--space-1` (4) to `--space-8` (64). Board mode scales them all.
- Page width up to `75rem`, centered; text blocks up to `--measure`.
- One primary button per screen. Put it where the eye ends: bottom-right of a
  form at a desk, in the action bar on the board.
- Tool lists use `.tile-grid`, which reflows from one column on a phone to four
  or more on a desktop.
- Every screen reflows to 320 px wide (200% zoom on a laptop) without sideways
  scrolling, except data tables, which may scroll inside their card.
- Use logical properties (`margin-inline-start`, `inset-inline-end`) so layouts
  flip correctly for right-to-left languages.

## Shape and depth

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 10 px | Small chips, inner elements |
| `--radius` | 16 px | Inputs, icon blocks, notices |
| `--radius-lg` | 24 px | Cards, tiles, AI output |
| `--radius-pill` | full | Buttons, pills, segmented controls |
| `--shelf` | 4 px | Ledge under buttons and tiles |
| `--shadow-soft` | two-layer soft shadow | Static cards only |

Pressable = shelf. Not pressable = soft shadow or a plain border. Don't mix.

## Icons

- Line icons on a 24 px grid, 2 px stroke, round caps and joins,
  `stroke="currentColor"`, inline SVG. No icon fonts, no CDN.
- If you use an icon library, vendor only the icons you need and keep its
  license.
- Pair icons with a visible word. Icon-only buttons (close, play, more) need an
  `aria-label` and a tooltip on desk, and are not used on the board.
- In tiles, the icon sits in a rounded square of the moment tint, drawn in the
  moment's strong color.

## Illustration

- Shape confetti only: simple geometric shapes in the vivid colors, overlapping
  a little, with generous empty space.
- No mascots or characters, no photos of real students, no generated images of
  children.
- If people must appear, show a range of ages, skin tones, abilities, and
  settings, drawn simply.
- Illustrations are decorative: `aria-hidden="true"`, and the screen must work
  without them.

## Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120 ms | Press, hover, toggles |
| `--dur` | 200 ms | Panels, notices appearing |
| `--dur-slow` | 320 ms | Page-level changes |
| `--ease` | quick out, soft landing | Everything |

- Motion explains a change (something arrived, something is working). It never
  decorates.
- Celebrate sparingly: a short shape-confetti burst when a long job finishes is
  fine for teachers; no sound by default.
- `prefers-reduced-motion` turns animation off (handled in the tokens). Nothing
  flashes more than three times a second.

## Components

All classes are in [tokens.css](../assets/tokens.css); markup examples are in
[specimen.html](../assets/specimen.html).

| Component | Class | Notes |
|---|---|---|
| App bar | `.app-bar`, `.app-name`, `.spacer` | Moment ribbon on top. App name left; status, display toggle, and help right |
| Primary button | `.btn .btn-primary` | One per screen. Verb first: "Upload files", "Start listening" |
| Secondary button | `.btn .btn-secondary` | Other actions |
| Quiet button | `.btn .btn-quiet` | Low-emphasis actions in toolbars and cards |
| AI button | `.btn .btn-ai` | Starts AI generation. Spark gradient and a sparkle icon. At most one per screen |
| Danger button | `.btn .btn-danger` | Delete or stop recording. Ask to confirm, or offer undo |
| Large button | add `.btn-lg` | Push-to-talk and present-mode actions |
| Segmented control | `.segmented` + `aria-pressed` | Display toggle, view switches |
| Card | `.card` | Static content groups |
| Tool tile | `.tile`, `.tile-icon`, `.tile-title`, `.tile-desc` in `.tile-grid` | Home screens. A `<button>` or `<a>`; one-line description |
| Field | `.field`, `label`, `.hint` | Label above the input, hint below. Errors in `--danger` with an icon, linked by `aria-describedby` |
| Drop zone | `.dropzone`, `.is-over` | Always paired with a "Choose files" button; list accepted types and size limit |
| Status pill | `.pill[data-state]` | `ready`, `listening`, `thinking`, `speaking`, `offline`. Use `role="status"` so changes are announced |
| AI output | `.ai-output`, `.ai-label`, `.sources` | See AI patterns |
| Notice | `.notice[data-tone]` | `success`, `warning`, `danger`, or none for info. Icon plus a sentence plus an action |
| Progress | `.progress` (`--value` or `data-indeterminate`) | With `role="progressbar"`, a label, and the expected wait |
| Table | `table`, `.num` | Sticky header for long tables; per-student columns get `data-private` |
| Action bar | `.action-bar`, `data-side="end"` | Main actions. Docks to the bottom in board mode; let the teacher switch sides |

### States

- Hover (desk only) previews; it never reveals something you can't get by
  tapping or tabbing.
- Focus: 3 px ink ring with a 3 px gap, on every interactive element.
- Disabled: grey fill and a reason nearby ("Add a file first"). Prefer leaving
  the button enabled and explaining what's missing on press.
- Loading: keep the layout; show a pill or progress in place, not a full-screen
  spinner.
- Empty: shape confetti, one sentence on what goes here, and the action that
  fills it.

## AI patterns

- **Label it.** AI output sits in `.ai-output` with the label "AI draft". Add
  "Review before sharing" where the result could reach students or families.
- **Show sources.** List the documents, pages, or timestamps an answer came
  from. If there are none, say "No sources found; this answer may be wrong."
- **Keep it editable.** Offer Edit, Copy, and Regenerate. Edits stay with the
  teacher's version; regenerating never overwrites edits without asking.
- **Be honest about speed.** Local AI can take a while. Show what's happening
  and the usual wait ("Usually 30–60 seconds on this PC"), stream text as it
  arrives, and let people keep working or cancel.
- **Say what it can't do.** When a request is out of scope, say so plainly and
  suggest what it can do.
- **Not a person.** Call it "the assistant". No human names, faces, or claims
  of feelings.
- **Show the local advantage quietly.** "Runs on this PC. Your files stay
  here." belongs in the How it works panel or the footer.

## Voice and tone

Plain, warm, brief. Write like a capable colleague who respects the teacher's
time.

- Use the words teachers use: lesson, class, period, unit, standard, rubric,
  student, family.
- Lead with what the person can do. Buttons start with a verb and say what
  happens: "Make a quiz", not "Submit".
- Contractions are fine. Exclamation marks almost never.
- Errors: what happened, then what to do, with a button for it. Don't blame the
  user; don't show codes in the main message.
- Numbers as digits; times as "about 2 minutes".

| Say | Instead of |
|---|---|
| Add files | Ingest, upload to the index |
| Answer from your files | RAG response, retrieval result |
| Transcript | ASR output |
| Read aloud | TTS, synthesize |
| Getting ready. This takes about 2 minutes the first time. | Loading model… |
| The assistant | The bot, the AI teacher |
| Couldn't reach the speech service. Restart the app and try again. | Error 503: audio-analyzer unavailable |
| Not yet. Try again. (students) | Wrong |

Technical details (models, CPU/GPU/NPU, latency) belong in a collapsible **How
it works** panel: helpful for the curious and for demos, out of the way for
everyone else.

## Audiences

| Audience | Status | Guidance |
|---|---|---|
| Teachers | Current | Everything above. Optimize for speed: fewest steps from opening the app to a usable result |
| Administrators | Current | Insights moment color. Denser layouts are fine on desktops: tables, filters, export. Aggregates first; drill-down to individuals only with clear purpose |
| Students, K-2 | Provisional | Icons with words and a Read aloud button on every instruction; one action per screen; root size 112.5%; no typing required; no timers |
| Students, 3-5 | Provisional | Short sentences (grade 3 reading level); celebrate effort, not speed; no leaderboards |
| Students, 6-12 | Provisional | Closer to the teacher style; give control (pace, hints, read aloud); respect privacy among peers |
| University | Provisional | Teacher style with denser layouts; citations and keyboard shortcuts matter more |

For any student-facing app: growth-minded feedback ("Not yet"), no ranking
against classmates, no collecting personal details, no chat with strangers, and
an adult (teacher) controls what AI can do. Confirm student-facing work with
the product team before release.

## Accessibility baseline

Target WCAG 2.2 AA. In the US, public schools must meet WCAG 2.1 AA under the
ADA Title II rule, and 2.2 AA covers it.

- Semantic HTML first: `button`, `a`, `label`, `fieldset`, headings in order,
  `main`, `nav`. ARIA only to fill gaps.
- `lang` on `<html>`; a unique, descriptive `<title>` per screen.
- Live regions (`role="status"`) for pills, progress, and streamed AI text, so
  screen readers hear updates without losing their place.
- Targets of at least 24 px are required; the tokens use 44–48 px (77 px on the
  board).
- No time limits; anything that times out can be extended.
- Captions or transcripts for all audio and video; text for all spoken output.

## Internationalization

- Keep every user-visible string in one place (a strings object or the app's
  i18n files); no text in images.
- Leave room for 35% longer text; buttons and tiles must wrap, not clip.
- Format dates, times, and numbers with `Intl`.
- Test right-to-left with `dir="rtl"` if any target language needs it.
