---
name: edu-frontend
description: >
  Change the user interface of an existing Education AI Suite app: the Smart
  Classroom browser UI and desktop app (React, Vite, Electron), the Smart
  Classroom Linux UI, the AI Teaching Assistant UI (React, Vite, Tailwind), or
  the Flutter RAG demo. Finds the right files and API client, keeps backend
  wiring and translations consistent, restyles apps to the suite style guide
  (edu-design), builds and lints, and offers to open the result in the
  browser. Use when the user says "change the UI", "add a button", "update the
  front end", "restyle", "restyle to the suite style", "add a page", "show X
  on the screen", or "translate the UI". For a brand-new app use edu-build-app
  instead.
metadata:
  argument-hint: >
    Which app and what change (e.g. "add a download button for the transcript
    in Smart Classroom", "show source documents under each answer in the
    teaching assistant")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Update a front end

**Run the commands yourself and report the results.** Paths are relative to the
repository root. Run `npm` commands inside the UI folder.

## The front ends

| UI | Folder | Stack | Talks to the backend through |
|---|---|---|---|
| Smart Classroom browser UI and desktop app (Windows) | `smart-classroom/Windows/ui` | React 19, Vite 8, TypeScript, Redux Toolkit, i18next (`src/i18n/en.json`, `zh.json`), Electron | `src/services/api.ts`: backend at `VITE_API_BASE_URL` (default `http://127.0.0.1:8000`, CORS open); Content Search at same-origin `/api/v1`, proxied to 9011 by `vite.config.ts` (dev) and `electron/server.cjs` (desktop app); grading at `/grading-api`, proxied to 9012 |
| Smart Classroom UI (Linux) | `smart-classroom/Linux/ui` | React 19, Vite 8, TypeScript (no Electron) | `vite.config.ts` proxies `/api/v1` to the backend on 8000, which forwards Content Search calls |
| AI Teaching Assistant UI | `ai-teaching-assistant/assistant-react-ui` | React 18, Vite 5, TypeScript, Tailwind | `src/config.ts` and `src/api.ts` call `/api/kiosk`, `/api/rag`, `/api/tts`, `/api/analyzer`; proxied by `vite.config.ts` in dev and by `ata_ui_server.py` (port 7860) in production |
| Flutter RAG demo | `utils/flutter` | Flutter, Riverpod, dio | `lib/app_config.dart` reads `CONTENT_SEARCH_API_URL` from `assets/.env`; calls go through `lib/services/content_search_api_service.dart` |

The Windows and Linux Smart Classroom UIs are separate copies. If a change should
apply to both, ask the user and make it in both.

## Step 1 — Understand the change

1. Identify the UI. Ask if it's ambiguous.
2. Find the components involved (search `src/components` or `lib/screens` and
   `lib/widgets`) and the API client function they use.
3. If the change needs data the backend doesn't provide, stop and tell the user:
   that is a backend change. Check the live API first at
   `http://127.0.0.1:<port>/docs` (all suite services are FastAPI).

## Step 2 — Plan (show before editing)

List the files you'll change and what changes in each. New screens and visual
changes follow [edu-design](../edu-design/SKILL.md) (the suite style guide).
Follow the existing patterns: Redux slices and `api.ts` helpers in Smart
Classroom, hooks and `api.ts` in the AI Teaching Assistant, Riverpod providers
in Flutter. In the Smart Classroom UI, add every new user-visible string to
both `en.json` and `zh.json`. Don't add dependencies unless the user agrees.

### Restyle to the suite style

Restyle one app per pull request; for Smart Classroom, Windows and Linux in
separate pull requests.

| UI | Styling today | How to adopt the edu-design tokens |
|---|---|---|
| Smart Classroom (Windows, Linux) | Plain CSS, one file per component in `src/assets/css/`, tokens in `src/index.css`; loads Inter, Roboto Mono, and IntelOne fonts from Google Fonts in `index.html` (the IntelOne request fails) | Copy `tokens.css` and `fonts/` to `src/styles/` and import it first in `src/main.tsx`. Point the existing `src/index.css` variables at the tokens, then replace hard-coded colors, sizes, and radii file by file. Remove the Google Fonts links. Replace every `outline: none` with the token focus ring |
| AI Teaching Assistant | Tailwind 3 (`tailwind.config.js` `colors.intel`, `fontFamily.sans`); Inter from Google Fonts in `src/index.css` | Copy to `src/styles/`, `@import` it at the top of `src/index.css` instead of the Google Fonts import, and map the Tailwind theme (`colors`, `fontFamily`, `borderRadius`) to the custom properties |
| Flutter RAG demo | `ThemeData` seeded from `0xFF0071C5` in `lib/main.dart` | Build the `ColorScheme` and text theme from the token values, bundle Clear Sans as a font asset in `pubspec.yaml` with its license, and use a text scale of 1.75 for board mode |

1. Screenshot every screen before changing anything.
2. Ask edu-design's Step 1 questions for the app as it is used today (Smart
   Classroom runs on classroom panels, so it needs board mode).
3. Shell first (app bar, buttons, focus ring), then each screen. Keep behavior,
   API calls, and translation keys unchanged.
4. Check the Chinese UI: Clear Sans has no Chinese glyphs, so it falls back to
   the system font.
5. Run edu-design's Step 4 review and show before and after screenshots side by
   side.

## Step 3 — Implement and verify

| UI | Type-check and build | Lint | Run to look at it |
|---|---|---|---|
| Smart Classroom (Windows) | `npm run build` | `npm run lint` | `npm run dev` (<http://localhost:5173>, backend must be running), or `npm run electron:dev` for the desktop app |
| Smart Classroom (Linux) | `npm run build` | `npm run lint` | `npm run dev` |
| AI Teaching Assistant | `npm run build` (writes `dist/`, which `ata_ui_server.py` serves on 7860) | — | `npm run dev` for hot reload, or rebuild and reload <http://127.0.0.1:7860> |
| Flutter RAG demo | `flutter build windows` | `flutter analyze`; `flutter test` | `flutter run -d windows` |

- Run `npm install` first if `node_modules` is missing.
- The Smart Classroom and AI Teaching Assistant dev servers both default to port
  5173; stop one before starting the other.
- Fix every type and lint error your change introduces before reporting.

## Step 4 — Hand back

Summarize the change, then ask whether to open the UI in the default browser
(`Start-Process "<url>"`). If the services aren't running, start them with
[edu-run](../edu-run/SKILL.md) first.
