# Education AI Suite — Skills

Agent skills for the Education AI Suite (Smart Classroom, AI Teaching Assistant,
and the demos). Each skill teaches the agent one developer task — installing,
running, building an app, changing a front end, configuring models and devices,
measuring performance — so it runs the same way every time.

These skills live under `.github/skills/` as the shared location usable by
GitHub Copilot, Claude Code, Cursor, OpenAI Codex, and any local agent script.
Because they are plain Markdown with no tool-specific syntax, the same skill
file works identically regardless of which AI tool loads it.

A skill is a directory containing:
- `SKILL.md` — YAML front matter (name, description, triggers) + the workflow body
- `references/` (optional) — deep-dive reference docs loaded only when the skill points to them
- `example-prompts/` (optional) — prompts users can paste into a coding assistant
- `scripts/` (optional) — PowerShell helpers the agent runs directly

---

## Cross-Harness Discovery

- All agents start at [`AGENTS.md`](../../AGENTS.md) at the repository root; its Task routing table links each skill.
- Tools that prefer structured metadata read [`skill-catalog.json`](./skill-catalog.json).
- All catalog paths are relative to the repository root (`education-ai-suite/`).
- Keep the skill body in one place: update each `SKILL.md`, then keep the catalog description and triggers in sync.

---

## Catalog

### Suite-wide developer tasks

| Skill | Purpose | Apps |
|---|---|---|
| `edu-install` | Install the full suite or one app | All |
| `edu-run` | Start, stop, health-check, open in the browser | All, plus `user-apps/` |
| `edu-build-app` | Build a new app on the suite's services in `user-apps/<name>/` | Smart Classroom, AI Teaching Assistant |
| `edu-design` | Suite style guide: devices, design tokens, components, voice, accessibility review | `user-apps/`, any web UI |
| `edu-frontend` | Change an existing app's UI | Smart Classroom, AI Teaching Assistant, Flutter RAG demo |
| `edu-configure` | Change features, models, and devices (CPU/GPU/NPU) | Smart Classroom, AI Teaching Assistant |
| `edu-perf` | Measure latency, utilization, and power | Smart Classroom, AI Teaching Assistant |

### Content Search and the Flutter RAG demo

| Skill | Purpose | Key interfaces |
|---|---|---|
| `sc-setup` | One-time setup of Flutter deps + Python venv | `flutter create`, `flutter pub get`, `python -m venv` |
| `sc-up` | Start the backend and Flutter app together | Direct Python + Flutter commands |
| `sc-doctor` | Health check, connectivity debug, backend logs | `GET /api/v1/system/health`, Python venv |
| `sc-upload` | Upload a file and poll until ingestion completes | `POST /api/v1/object/upload-ingest`, `GET /api/v1/task/query/{id}` |
| `sc-qa` | Ask a multi-turn RAG question against indexed content | `POST /api/v1/object/qa` |
| `sc-files` | List, filter, delete indexed files; list tags | `GET /api/v1/object/files/list`, `GET /api/v1/object/tags`, `DELETE /api/v1/object/files/{file_hash}` |

---

## Conventions

- **Agent: execute all commands directly** using your terminal tool and relay the
  result to the user. Do not print commands for the user to copy-paste — the
  entire point of these skill files is that the agent drives the workflow
  autonomously. Only hand a command to the user when a skill step explicitly
  requires their interactive shell (e.g. typing a secret).
- Probe before acting. For the `sc-*` skills, hit `GET /api/v1/system/health` before any API workflow. It returns 200 only when every Content Search service is ready, and 503 with a per-service `services` map otherwise; if it fails either way, route to `sc-up` or `sc-doctor`.
- For the `sc-*` skills, the backend API base URL is `http://127.0.0.1:9011` (or whatever `CONTENT_SEARCH_API_URL` is set to in `utils/flutter/assets/.env`).
- Run repo-local commands from the repository root (`education-ai-suite/`) unless a skill says otherwise.
- Run Flutter commands from `utils/flutter/`.
