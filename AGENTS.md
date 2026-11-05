# Education AI Suite — Agent Instructions

Canonical instructions for AI coding agents (GitHub Copilot, Claude Code, Cursor,
Codex, and others) working in this repository. [CLAUDE.md](CLAUDE.md),
[.github/copilot-instructions.md](.github/copilot-instructions.md), and
[.cursor/rules/sc.mdc](.cursor/rules/sc.mdc) only point here.

- **This file holds facts:** what exists, where it lives, ports, models, and Intel libraries.
- **Skills hold procedures:** how to do a task. See [Task routing](#task-routing).
- When a change alters an app's services, ports, models, or scripts, update the matching table here in the same change.

## Applications

| App | Folder | Platform | What it does | Start here |
|---|---|---|---|---|
| Smart Classroom | [smart-classroom/Windows](smart-classroom/Windows), [smart-classroom/Linux](smart-classroom/Linux) | Windows: native Python + PowerShell. Linux: Docker Compose | Records or ingests a class, then transcribes, summarizes, builds mind maps, segments topics, generates class reports, analyzes classroom video, indexes content for search and Q&A, and (optionally) grades | [Get started](smart-classroom/docs/user-guide/get-started.md) |
| AI Teaching Assistant | [ai-teaching-assistant](ai-teaching-assistant) | Windows: native Python + PowerShell | Voice-first Q&A over uploaded documents: speech → retrieval + local LLM → speech | [Get started](ai-teaching-assistant/docs/user-guide/get-started.md) |
| Flutter RAG demo | [utils/flutter](utils/flutter) | Windows: Flutter + Smart Classroom backend in RAG-only mode | Lightweight Content Search upload and Q&A UI | [README](utils/flutter/README.md) |
| Teacher Assistant (OpenClaw) demo | [teacher-assistant-claw-demo](teacher-assistant-claw-demo) | Ubuntu 24.04: OpenClaw + OVMS in Docker | Chat agent that answers questions about saved Smart Classroom session outputs | [README](teacher-assistant-claw-demo/README.md) |

### Install and run

| App | Scripts |
|---|---|
| Smart Classroom (Windows) | `smart-classroom/Windows/start-desktop-app.ps1` (desktop app), or `setup-smart-classroom.ps1` then `start-smart-classroom.ps1` (browser UI) |
| Smart Classroom (Linux) | `smart-classroom/Linux/setup.sh` |
| AI Teaching Assistant | `ai-teaching-assistant/setup_windows.ps1`, `start_ata.ps1`, `stop_ata.ps1`, `uninstall_ata.ps1` |
| Flutter RAG demo | `utils/flutter/setup.ps1`, `utils/flutter/start.ps1` |
| OpenClaw demo | `teacher-assistant-claw-demo/setup-ovms.sh`, `setup-openclaw-workspace.sh`, `run-agent.sh` |

## How the pieces relate

```
Smart Classroom  (Windows: native Python | Linux: Docker Compose)

  Browser UI :5173 / desktop app
     |                         \
     v                          v
  Backend :8000  <--- VLM ---  Content Search :9011  <---  Flutter RAG demo
     ASR, summary, mind map,      ChromaDB :9090
     segmentation, board OCR,     file ingest :9990
     report, video analytics,     video preprocess :8001
     VLM (/v1/chat/completions)
     ^
     +--- VLM ---  Grading :9012 (optional)  --->  layout detection :9902

  Session outputs (summary, topics, engagement)  --->  OpenClaw demo (Ubuntu)  --->  OVMS (Qwen3-8B)
                                                       (uses sample session data by default)

AI Teaching Assistant  (Windows: native Python)

  Browser ---> UI + proxy :7860 ---> kiosk-core :8012 ---> audio-analyzer :8010   (edge-ai-libraries)
                                                      ---> rag-service :8020      (voice-enabled-interactions)
                                                      ---> text-to-speech :8011   (edge-ai-libraries)
               metrics-collector :9000
```

- Content Search and Grading call the backend's VLM, so the backend must be healthy first.
- Smart Classroom's Content Search and the AI Teaching Assistant's `rag-service` are separate knowledge bases with different models. Documents ingested into one are not visible to the other.
- Smart Classroom on Linux runs ASR in the same `audio-analyzer` microservice the AI Teaching Assistant uses.
- The Flutter RAG demo runs the Smart Classroom backend in RAG-only mode with its own config and its own virtual environment (`smartclassroom/` at the repository root; Smart Classroom uses `smart-classroom/smartclassroom/`).
- Smart Classroom (Windows) and the AI Teaching Assistant use different ports and can run side by side, but both load models onto the GPU.

## By teaching moment

Use this to find the right app and service for a request. Folders stay organized by app.

| Moment | Smart Classroom | AI Teaching Assistant | Other |
|---|---|---|---|
| **Before class** | Content Search: upload and index lesson materials (documents, images, videos) | Upload documents to the knowledge base (`rag-service`); samples in [knowledge-base-samples](ai-teaching-assistant/knowledge-base-samples) | Flutter RAG demo: upload |
| **During class** | Recording and transcription (ASR); video analytics on camera streams (pose, hand-raise, stand-up); board OCR | Voice Q&A: `audio-analyzer` → `rag-service` → `text-to-speech`, coordinated by `kiosk-core` | — |
| **After class** | Summary, mind map, topic segmentation, class report, grading; Content Search Q&A over session content | Voice study assistant over the knowledge base | Flutter RAG demo: Q&A. OpenClaw demo: questions about session outputs |

## Services and ports

Windows defaults. Ports, models, and devices come from each app's config files, not code.

**Smart Classroom (Windows)** — [smart-classroom/Windows/config.yaml](smart-classroom/Windows/config.yaml)

| Service | Port | Health |
|---|---|---|
| Backend (FastAPI): ASR, summary, mind map, segmentation, board OCR, report; hosts the VLM | 8000 | `/health` |
| Content Search API | 9011 | `/api/v1/system/health` (200 only when all sub-services are ready) |
| Content Search sub-services: ChromaDB, file ingest, video preprocess | 9090, 9990, 8001 | — |
| Grading, layout detection (only when `features.grading.enabled`) | 9012, 9902 | `/api/v1/health`, `/health` |
| Browser UI (React + Vite) | 5173 | — |
| Video streams (MediaMTX): RTSP, HLS, WebRTC | 8554, 8888, 8889 | — |

**Smart Classroom (Linux)** runs the same features as containers; the VLM is served by OVMS and ASR by the `audio-analyzer` container. See [linux-docker-architecture.md](smart-classroom/docs/user-guide/linux-docker-architecture.md).

**AI Teaching Assistant** — services read their runtime config from the submodules: `edge-ai-libraries/microservices/audio-analyzer/config.yaml`, `edge-ai-libraries/microservices/text-to-speech/config.yaml`, and `voice-enabled-interactions/smart-kiosk-assistant/rag-service/config.yaml`, with overrides in the `.env` that `setup_windows.ps1` writes. [ai-teaching-assistant/configs](ai-teaching-assistant/configs/README.md) holds reference copies only.

| Service | Port | Health |
|---|---|---|
| UI server + API proxy | 7860 | `/healthz` |
| `kiosk-core` (session orchestrator) | 8012 | `/health` |
| `audio-analyzer` (ASR) | 8010 | `/health` |
| `text-to-speech` | 8011 | `/health` |
| `rag-service` (ingest, retrieval, LLM) | 8020 | `/health` |
| `metrics-collector` | 9000 | `/health` |

**Flutter RAG demo** reuses the Smart Classroom backend (8000) and Content Search (9011), started with [utils/flutter/config.yaml](utils/flutter/config.yaml).

## Intel-optimized stack

Defaults from the config files above.

| App | Stage | Default model | Runtime | Device | Config |
|---|---|---|---|---|---|
| Smart Classroom | Summary, mind map, segmentation, report, Q&A, video summaries | Qwen3-VL-8B-Instruct (int4) | OpenVINO GenAI in the backend (Windows); OVMS (Linux) | GPU | `models.text_gen` |
| Smart Classroom | ASR | whisper-small (Windows); whisper-base (Linux) | `openai` PyTorch (Windows); OpenVINO GenAI `openvino` (Linux) | CPU | `models.asr`; on Linux the `audio-analyzer` container reads `smart-classroom/Linux/edge-ai-libraries/microservices/audio-analyzer/config.yaml` |
| Smart Classroom | Video analytics | YOLOv8m/s-pose + classifiers | DL Streamer + OpenVINO | NPU | `models.va` |
| Smart Classroom | Board and document OCR | PP-OCRv6 | OpenVINO | CPU | `models.ocr` |
| Smart Classroom | Content Search retrieval | CLIP (visual), multilingual-e5-small (text), bge-reranker-base | OpenVINO, OpenVINO GenAI | CPU (embeddings), GPU (reranker) | `content_search.file_ingest` |
| AI Teaching Assistant | ASR | whisper-base | OpenVINO GenAI (`provider: openvino`) | CPU | `audio-analyzer/config.yaml` `models.asr` |
| AI Teaching Assistant | Knowledge-base LLM | Qwen3-4B-Instruct-2507 (int8) | OpenVINO (`.env` sets the backend) | GPU | `rag-service/config.yaml` `models.llm` |
| AI Teaching Assistant | Embeddings | bge-large-en-v1.5 (int8) | OpenVINO | GPU | `rag-service/config.yaml` `models.embedding` |
| AI Teaching Assistant | Text-to-speech | Kokoro | ONNX Runtime; SpeechT5 runs on OpenVINO | CPU | `text-to-speech/config.yaml` `models.tts` |
| OpenClaw demo | Chat agent LLM | Qwen3-8B | OVMS | GPU | `teacher-assistant-claw-demo/setup-ovms.sh` |

Not every default stage runs on OpenVINO: Smart Classroom ASR on Windows defaults to `openai`
(PyTorch), and Kokoro uses ONNX Runtime. When the user asks for an Intel-optimized
pipeline, propose the OpenVINO option and the device it should run on.

## Task routing

Skills live in [.github/skills/](.github/skills/README.md); [skill-catalog.json](.github/skills/skill-catalog.json) is the machine-readable index.

| Task | Use |
|---|---|
| Install the full suite or one app | [edu-install](.github/skills/edu-install/SKILL.md) |
| Start, stop, health-check, or open an app in the browser | [edu-run](.github/skills/edu-run/SKILL.md) |
| Build a new app on top of the suite's services | [edu-build-app](.github/skills/edu-build-app/SKILL.md) |
| Design or review a UI in the suite style (devices, colors, type, components, accessibility) | [edu-design](.github/skills/edu-design/SKILL.md); quick review: [edu-design-review prompt](.github/prompts/edu-design-review.prompt.md) |
| Change an existing app's front end | [edu-frontend](.github/skills/edu-frontend/SKILL.md) |
| Change models, devices (CPU/GPU/NPU), or features of an existing app | [edu-configure](.github/skills/edu-configure/SKILL.md) |
| Measure performance (latency, CPU/GPU/NPU utilization, power) | [edu-perf](.github/skills/edu-perf/SKILL.md) |
| Set up, start, or health-check the Flutter RAG demo | [sc-setup](.github/skills/sc-setup/SKILL.md), [sc-up](.github/skills/sc-up/SKILL.md), [sc-doctor](.github/skills/sc-doctor/SKILL.md) |
| Upload, ask about, list, or delete Content Search files | [sc-upload](.github/skills/sc-upload/SKILL.md), [sc-qa](.github/skills/sc-qa/SKILL.md), [sc-files](.github/skills/sc-files/SKILL.md) |
| Call or reconfigure the ASR service | [audio-analyzer-user](ai-teaching-assistant/edge-ai-libraries/microservices/audio-analyzer/.github/skills/audio-analyzer-user/SKILL.md), [audio-analyzer-dev](ai-teaching-assistant/edge-ai-libraries/microservices/audio-analyzer/.github/skills/audio-analyzer-dev/SKILL.md) (submodule) |
| Call or reconfigure the TTS service | [text-to-speech-user](ai-teaching-assistant/edge-ai-libraries/microservices/text-to-speech/.github/skills/text-to-speech-user/SKILL.md), [text-to-speech-dev](ai-teaching-assistant/edge-ai-libraries/microservices/text-to-speech/.github/skills/text-to-speech-dev/SKILL.md) (submodule) |
| Review a security-sensitive change | [security-review](.github/skills/security-review/SKILL.md) |
| Validate a get-started guide end to end | [onboarding-validation](.github/skills/onboarding-validation/SKILL.md) |

## Working rules

- **Stay in scope.** Change only the app folder the task is about, and read its README first. Don't add features, dependencies, or API changes beyond the request.
- **New apps go in `user-apps/<name>/`.** When asked to build an app on top of the suite, create it there and call the existing services over their HTTP APIs. Don't modify the app folders unless asked.
- **UIs use the suite style.** New and restyled UIs use the [edu-design](.github/skills/edu-design/SKILL.md) tokens, components, and voice; ask where the app runs before designing. [ui-style.instructions.md](.github/instructions/ui-style.instructions.md) is the short version for `user-apps/` files.
- **Plans show the pipeline.** When planning a new or changed pipeline, include an ASCII diagram of the data flow and a table of the models, Intel runtimes, and devices it uses.
- **Submodules are read-only.** `ai-teaching-assistant/edge-ai-libraries`, `ai-teaching-assistant/voice-enabled-interactions`, `smart-classroom/Linux/edge-ai-libraries`, and `smart-classroom/Linux/performance-tools` track upstream repositories. Propose code changes upstream instead. The one exception is local edits to the AI Teaching Assistant's runtime `config.yaml` files, which are expected but never committed (see [edu-configure](.github/skills/edu-configure/SKILL.md)).
- **Platform.** Windows apps run in PowerShell (not CMD) with native Python virtual environments. Smart Classroom on Linux and the OpenClaw demo use Docker.
- **Run commands yourself.** Execute setup, start, and API calls with your terminal tool and report the result. Hand a command to the user only when it needs a secret or an elevation (UAC) prompt.
- **Config, not code.** Features, models, devices (CPU/GPU/NPU), and ports come from each app's `config.yaml` or `.env`. Don't hardcode them.
- **Proxy.** Respect `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY`. Smart Classroom on Windows stores proxy settings in `.proxy-config`.
- **Not instructions for you.** [teacher-assistant-claw-demo/workspace/](teacher-assistant-claw-demo/workspace) (its `AGENTS.md` and `skills/`) configures the OpenClaw runtime agent. Treat it as app content.
- **Tests.** Python tests use pytest; run them from the folder that contains `pytest.ini` (for example `smart-classroom/Windows`).
- **License header.** New source files start with these two lines, in the file's comment syntax, using the current year:

  ```
  # SPDX-FileCopyrightText: (C) <YEAR> Intel Corporation
  # SPDX-License-Identifier: Apache-2.0
  ```

## Security guardrails

Treat AI-generated output as untrusted draft code until it is reviewed and tested.
Prefer least privilege, fail safely and visibly, and never bypass or weaken existing
security checks. Load [security-review](.github/skills/security-review/SKILL.md) when a
change touches authentication, input parsing, file handling, secrets, Dockerfiles,
Compose files, or CI workflows.

- **Secrets:** never hardcode, print, log, or commit secrets or `.env` contents (for example `HF_TOKEN`). Use environment variables, and keep sensitive data out of logs, errors, and test artifacts.
- **Input:** validate external input at trust boundaries. In FastAPI, validate request bodies with Pydantic models.
- **Python:** never use `subprocess(..., shell=True)` with external input; pass an argument list. Never use `eval()`, `exec()`, or `pickle.loads()` on untrusted data. Use `secrets`, not `random`, for security-sensitive values.
- **Shell and PowerShell:** quote variables and never build commands from unvalidated input. Bash scripts use `set -euo pipefail`; `sh` scripts use `set -eu`.
- **Containers:** Dockerfiles set a non-root `USER` before the final `CMD`/`ENTRYPOINT`. No `--privileged`, `--cap-add=ALL`, or `--network=host` without documented justification. Pin image tags; avoid `:latest` in new references.
- **Dependencies:** prefer maintained packages and pin versions. Never use `pip install --trusted-host`, `--no-verify`, or unauthenticated index URLs.
- **CI:** pin GitHub Actions to full commit SHAs and keep `persist-credentials: false` unless required.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for pull request guidelines and commit signing requirements.

## Maintaining these instructions

- To add a skill: create `.github/skills/<name>/SKILL.md`, add it to [skill-catalog.json](.github/skills/skill-catalog.json) and the [skills README](.github/skills/README.md), and add a row to [Task routing](#task-routing).
- Keep [CLAUDE.md](CLAUDE.md), [.github/copilot-instructions.md](.github/copilot-instructions.md), and [.cursor/rules/sc.mdc](.cursor/rules/sc.mdc) as pointers to this file.