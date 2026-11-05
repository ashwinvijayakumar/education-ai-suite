---
name: edu-design
description: >
  The Education AI Suite style guide and design system: a modern, colorful,
  accessible look for apps used by K-12 teachers and administrators (student
  and university audiences are planned). Asks the developer where the app runs
  (teacher laptop, desktop, interactive flat panel or smart board, projector,
  student laptop or Chromebook, tablet, kiosk) and how people use it (mouse,
  keyboard, touch, pen, voice, audio), writes a design brief, applies the shared
  design tokens and components, and reviews the result against an
  accessibility and classroom checklist. Use with edu-build-app for every new
  app and with edu-frontend for restyles, and when the user asks for "the style
  guide", "design system", "design tokens", "colors", "fonts", "look and
  feel", "make it look good", "board mode", "smart board layout",
  "touch-friendly", "teacher-friendly", "kid-friendly", or "accessibility
  review" of a UI.
metadata:
  argument-hint: >
    The app or screen to design, and where it runs if you know (e.g. "lesson
    recap app for teacher laptops and the classroom panel")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Design with the suite style

Every suite app should feel like part of one family: colorful and friendly, but
calm enough for a teacher's busy day, and readable from the back of a classroom.

| File | Holds |
|---|---|
| [references/style-guide.md](./references/style-guide.md) | Principles, color, type, layout, components, AI patterns, voice and tone, audiences, accessibility |
| [references/devices.md](./references/devices.md) | Device and input profiles: laptop, desktop, interactive panel, projector, student devices, kiosk; voice and audio |
| [assets/tokens.css](./assets/tokens.css) | Design tokens and base components. Copy it into the app unchanged |
| [assets/fonts/](./assets/fonts/) | Intel Clear Sans (Apache-2.0) and its license. Copy the folder next to `tokens.css` |
| [assets/specimen.html](./assets/specimen.html) | Every component on one page. Open it in a browser to see the style |

```
Step 1  ask who uses it and where it runs   <- always ask; never assume the device
Step 2  write the design brief              <- goes into the edu-build-app plan
Step 3  apply tokens and components
Step 4  review against the checklist and screenshot each target
```

## Step 1 — Ask who uses it and where it runs

Ask these before designing (use the ask-questions tool if available, with
multi-select where noted). Offer the default, but don't skip the questions.

| Question | Options | Default |
|---|---|---|
| Who uses it? | Teachers; administrators; students (K-2, 3-5, 6-8, 9-12); university | Teachers |
| Where does it run? (multi-select) | Teacher laptop; teacher or office desktop; interactive flat panel or smart board; projector from a laptop; student laptop or Chromebook; tablet; kiosk with mic and speaker; phone | Teacher laptop |
| How do people interact? (multi-select) | Mouse or trackpad; keyboard; touch; pen; voice (microphone); audio out (speakers or headphones); presentation clicker | Mouse, keyboard, and touch-safe |
| Does the whole class see the screen? | Yes (projected or on a panel); no | No |
| Which teaching moment? | Before class; during class; after class; insights (school data) | From the app's purpose |
| Languages? | English only; others (which); right-to-left needed | English, translation-ready |

If students are the audience, say that student guidance is provisional and
follow the matching band in the style guide's **Audiences** section.

## Step 2 — Write the design brief

Map each target in [references/devices.md](./references/devices.md) to a
display mode, then write the brief. In edu-build-app, add it to the Step 2 plan
and the app's README.

```
Design brief
  Users          Teachers, grades 6-8
  Runs on        Teacher laptop (desk mode); 75" interactive panel (board mode)
  Input          Mouse, keyboard, touch, presentation clicker
  Shared screen  Yes -> student names and scores hidden in board mode
  Moment         During class (teal)
  Screens        Home (tool tiles) -> Live question -> Answer with sources
  Key parts      Display toggle, status pill, AI output block, action bar
```

## Step 3 — Apply

1. Copy [assets/tokens.css](./assets/tokens.css) and the
   [assets/fonts/](./assets/fonts/) folder unchanged to the app (for example
   `user-apps/<name>/static/tokens.css` and `static/fonts/`) and link the CSS
   before the app's own. Override tokens only through custom properties in the
   app's CSS. Keep `LICENSE.txt` with the fonts.
2. Set the root element: `<html lang="en" data-moment="during" data-display="desk">`.
3. If board mode is a target, add the display toggle (Desk | Board). It reads
   `?display=board`, remembers the choice, and only accepts known values:

   ```html
   <div class="segmented" role="group" aria-label="Display">
     <button type="button" data-set-display="desk">Desk</button>
     <button type="button" data-set-display="board">Board</button>
   </div>
   <script>
     const modes = ["desk", "board"];
     function setDisplay(mode) {
       if (!modes.includes(mode)) mode = "desk";
       document.documentElement.dataset.display = mode;
       localStorage.setItem("display", mode);
       document.querySelectorAll("[data-set-display]").forEach((b) =>
         b.setAttribute("aria-pressed", String(b.dataset.setDisplay === mode)));
     }
     document.querySelectorAll("[data-set-display]").forEach((b) =>
       b.addEventListener("click", () => setDisplay(b.dataset.setDisplay)));
     setDisplay(new URLSearchParams(location.search).get("display") || localStorage.getItem("display"));
   </script>
   ```

4. Build screens from the components in the style guide (`.app-bar`, `.btn-*`,
   `.tile`, `.card`, `.pill`, `.ai-output`, `.notice`, `.action-bar`). Copy
   markup from [assets/specimen.html](./assets/specimen.html).
5. Mark per-student data (names, scores, engagement) with `data-private`; board
   mode hides it.
6. Show AI output in `.ai-output` with the **AI draft** label, sources, and
   Edit, Copy, and Regenerate actions.
7. No external requests from the page: no CDN fonts, icon fonts, scripts, or
   images. Use the bundled font and inline SVG icons.
8. Write all text by the style guide's **Voice and tone** rules. Put technical
   details (models, devices, latency) in a collapsible **How it works** panel,
   not in the main flow.

This skill is app-agnostic: it says how a UI should look and behave. To restyle
an existing suite app, use [edu-frontend](../edu-frontend/SKILL.md), which knows
each app's code and applies this guide.

## Step 4 — Review

Check each item and report any you couldn't meet:

- [ ] Text contrast at least 4.5:1, or 3:1 for large text; input borders and icons at least 3:1. The token pairs in the style guide already meet this.
- [ ] Every control is at least `--target` in size, with `--space-2` or more between neighbors.
- [ ] Everything works by keyboard in a logical order, with a visible focus ring.
- [ ] Nothing depends on hover, right-click, double-tap, long-press, or drag alone.
- [ ] Color is never the only signal; states have an icon or a word too.
- [ ] Board mode (if targeted): readable from the back row, main actions in the bottom action bar, `data-private` content hidden, no small controls in corners, little or no typing on the panel.
- [ ] Voice and audio (if used): the mic state is shown with an icon and a word, every spoken output also appears as text, and nothing plays automatically.
- [ ] AI output is labeled, editable, and shows its sources; slow steps show progress and the expected wait; errors say what to do next.
- [ ] Respects `prefers-reduced-motion`; nothing flashes more than three times a second.
- [ ] Usable in a Windows contrast theme (`forced-colors`) and at 200% browser zoom.
- [ ] No requests to other sites (check the browser's network panel).

Then screenshot every target from Step 1 at the viewports in
[references/devices.md](./references/devices.md#test-viewports) (use the browser
tools if available) and show them to the user.
