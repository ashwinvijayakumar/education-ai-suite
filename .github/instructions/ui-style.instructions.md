---
description: "Use when creating or editing UI files (HTML, CSS, JavaScript) in user-apps: suite style tokens, components, display modes, AI output, privacy, and UI wording."
applyTo: "user-apps/**/*.{html,css,js}"
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Suite style for user-app UIs

Short version of [edu-design](../skills/edu-design/SKILL.md). Load that skill
when designing a screen, choosing devices, or reviewing a UI.

- Link `static/tokens.css` (an unchanged copy of the skill's `assets/tokens.css`, with `fonts/` beside it) before the app's CSS.
- Use tokens, not literals: `var(--brand)`, `var(--space-4)`, `var(--radius-lg)`, `var(--text-lg)`. No new hex colors, px font sizes, or font families. Sizes in `rem` so board mode scales them.
- Use the token components: `.app-bar`, `.btn .btn-primary|secondary|quiet|ai|danger`, `.tile`, `.card`, `.field`, `.dropzone`, `.pill[data-state]`, `.ai-output`, `.notice[data-tone]`, `.progress`, `.action-bar`.
- `<html>` sets `lang`, `data-moment` (before, during, after, insights), and `data-display` (desk or board).
- One primary button per screen; `.btn-ai` only for AI actions.
- Mark per-student data `data-private` (hidden in board mode).
- AI output goes in `.ai-output` with the "AI draft" label, sources, and Edit, Copy, Regenerate.
- Keep `:focus-visible` rings; never `outline: none`. Real `<button>` and `<label>` elements; inline SVG icons with `aria-hidden="true"` next to visible text.
- No requests to other sites: no CDN fonts, scripts, icons, or images.
- UI text: sentence case, verb-first buttons, teachers' words (no "ingest", "RAG", "TTS", "ASR", model names, or ports in the main flow; put those in a How it works panel). Errors say what happened and what to do next.
