<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Devices and interaction

Where an app runs decides its display mode, sizes, and inputs. Always ask the
developer (see [SKILL.md](../SKILL.md) Step 1); one app often has two targets,
such as a teacher laptop for setup and a classroom panel for use.

## Display modes

| Mode | Set by | Root size | Min target | For |
|---|---|---|---|---|
| Desk | default, `data-display="desk"` | 16 px | 44 px (48 px with a touch pointer) | Anyone at arm's length from the screen |
| Board | `data-display="board"`, the Desk/Board toggle, or `?display=board` | 28 px | 77 px (84 px with a touch pointer) | A screen the whole class watches |

Board mode must be chosen, not detected: a 4K panel at 200% scaling reports
1920×1080, the same as a desktop monitor. Touch is detected automatically
(`pointer: coarse`) and enlarges targets in either mode.

## Device profiles

| Device | Typical hardware | Viewing distance | Mode | Input | Usual jobs |
|---|---|---|---|---|---|
| Teacher laptop | 13–15", 1366×768 to 1920×1200 at 125–150% scaling | 50–70 cm | Desk | Trackpad, keyboard, often a touchscreen | Planning, uploading, reviewing, grading. Often mirrored to a projector or panel |
| Teacher or office desktop | 22–27", 1920×1080 to 2560×1440 | 60–80 cm | Desk | Mouse, keyboard | Admin dashboards and reports; often half-screen beside other windows (design for 960 px wide) |
| Interactive flat panel or smart board | 65–86", 4K, touch (many points) and pen; Windows on a slot-in PC or the teacher's laptop over one cable | 1–8 m | Board | Touch, pen, presentation clicker, sometimes a keyboard on a cart | Live class: show, ask, answer, vote |
| Projector | Laptop mirrored, 1280×720 to 1920×1080 | 2–10 m | Board | The laptop's input or a clicker | Same as the panel, without touch |
| Student laptop or Chromebook | 11.6–14", 1366×768, often shared and managed | 40–60 cm | Desk | Keyboard, trackpad, often touch; headphones | Practice, reading, asking questions. Policies may block the mic, camera, or downloads |
| Tablet | 10–11", about 820×1180 | 30–50 cm | Desk | Touch, on-screen keyboard, sometimes pen | Younger students, small groups |
| Kiosk or voice station | 15–24" touchscreen with mic and speaker, standing height | 50–100 cm | Desk (board if read from afar) | Voice, touch | Walk-up questions in a library, lab, or hallway |
| Phone | 360–430 px wide | 30 cm | Desk | Touch | Quick checks on the go; not a primary target yet |

## Interactive panels and projectors

- **Read from the back row.** Board mode sets body text to 28 px. If a line
  can't be read from the farthest seat, show less, not smaller. Aim for six to
  eight lines of reading text per view.
- **One thing at a time.** One question, one answer, one chart per view. Use a
  present view with Next and Back.
- **Within reach.** Panels are often mounted with their top edge above an
  adult's comfortable reach and far above a young student's. Put controls in the
  bottom action bar; keep the top of the screen for content.
- **Out of the way.** The teacher stands to one side so they don't block the
  view. Let the action bar switch sides (`data-side="end"`).
- **Clear of the edges.** Panel software uses edge swipes, side menus, and
  floating toolbars. Keep `--space-6` clear of every edge and never rely on an
  edge gesture. No small close buttons in corners.
- **Avoid typing.** The on-screen keyboard covers half the panel. Prefer
  choices, voice, or entering text on the teacher's laptop.
- **Forgive stray touches.** Palms, sleeves, and two students at once all make
  touches. Confirm destructive actions or offer undo.
- **Private by default.** Everyone can see the screen. Board mode hides
  `data-private` content (names, scores, per-student engagement) until the
  teacher chooses to show it. Show class-level totals instead.
- **Projectors wash out color.** Rely on ink text, strong colors, icons, and
  words; never on tints or thin lines alone.
- **Clickers.** Presentation clickers send Page Down/Page Up (some send arrow
  keys or B). In present views, map them to Next, Back, and blank screen.

## Input methods

| Input | Do | Avoid |
|---|---|---|
| Mouse and trackpad | Hover to preview; right-click only as a shortcut | Hover-only menus or tooltips that hold needed information |
| Keyboard | Logical tab order; visible focus; Enter/Space on all controls; Esc closes; shortcuts shown in tooltips | Single-key shortcuts without a modifier while typing is possible (WCAG 2.1.4) |
| Touch | `--target` or bigger with `--space-2` gaps; `touch-action: manipulation` on controls; tap to act | Double-tap, long-press, pinch, or drag as the only way; blocking page zoom |
| Pen | Pointer Events (`pointerdown`, not `mousedown`); pen works anywhere touch does; `touch-action: none` only on drawing areas | Assuming pen pressure or hover exists |
| Voice in | Tap-to-talk button (large, same place to stop); a wake word only if the app is set up for one and it's shown on screen | Recording without a visible indicator; voice as the only way to do something |
| Audio out | Show every spoken sentence as text too; Stop and Replay buttons; speed control for students; start only after a tap | Autoplay on load; sound as the only feedback |
| Presentation clicker | Next, Back, blank screen in present views | Requiring a pointer to advance |
| Screen reader, switch, voice control | Semantic HTML, labels that match visible text, `role="status"` updates | Custom widgets without keyboard support; visible text that differs from the accessible name |

## Voice and audio in a classroom

- Classrooms are loud. Show the transcript of what was heard and let the person
  fix it or try again before acting on it.
- The listening state must be visible from across the room: a large
  `.pill[data-state="listening"]` with the word "Listening", in the danger
  color (the recording convention), and a Stop button in the same place as
  Start.
- Never listen or record without the indicator. Tell people where audio goes
  ("Audio stays on this PC").
- Student devices: assume headphones and that the browser may block the
  microphone; explain how to allow it and always offer typing instead.
- Keep spoken answers short (two or three sentences) and put the full answer on
  screen.

## Test viewports

Screenshot each target the developer chose:

| Target | Viewport (CSS px) | Mode | Also check |
|---|---|---|---|
| Chromebook or small laptop | 1366×768 | Desk | Keyboard only |
| Laptop at 150% scaling | 1280×800 | Desk | 200% zoom (reflow) |
| Desktop | 1920×1080 | Desk | Half width (960×1080) |
| Interactive panel (4K at 200%) | 1920×1080 | Board | Touch emulation; action bar reach; private data hidden |
| Projector | 1280×720 | Board | Grayscale or low contrast, to simulate washout |
| Tablet | 820×1180 | Desk | Touch emulation; on-screen keyboard space |
| Phone | 390×844 | Desk | Only if chosen |
