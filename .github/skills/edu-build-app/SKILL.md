---
name: edu-build-app
description: >
  Build a new education app on top of the Education AI Suite's running
  services (Smart Classroom and AI Teaching Assistant) in user-apps/<name>/,
  without touching the suite's own code. Plans first: maps the request to suite
  services, draws an ASCII pipeline diagram, and shows which Intel-optimized
  runtime (OpenVINO, OpenVINO GenAI, DL Streamer, OVMS) and device (CPU, GPU,
  NPU) each stage uses. After approval it generates the app, asks whether to run
  it, runs it, and offers to open it in the browser. Use when the user says
  "build an app", "create a sample app", "make a demo", "prototype", "new app
  that uses Smart Classroom", "voice app", "quiz generator", "lesson Q&A app",
  or "class recap app".
metadata:
  argument-hint: >
    Describe the app (e.g. "a web page where a teacher uploads lesson PDFs and
    students ask questions with cited sources")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Build an app on the Education AI Suite

New apps reuse the suite's running services, so they inherit its Intel-optimized
pipelines instead of loading models themselves. Facts about apps, ports, models,
and devices are in the repository-root [AGENTS.md](../../../AGENTS.md); the
routes are in [references/service-apis.md](./references/service-apis.md).

```
Step 0  gather requirements          (chat / plan mode)
Step 1  map the request to services
Step 2  present the plan             <- stop here in plan mode and wait for approval
Step 3  generate the app in user-apps/<name>/
Step 4  verify
Step 5  ask to run -> run -> offer to open the browser
```

## Example prompts

| Prompt | Teaching moment | Services |
|---|---|---|
| [lesson-qa-assistant.md](./example-prompts/lesson-qa-assistant.md) | Before and after class | Content Search (Smart Classroom) |
| [lecture-recap.md](./example-prompts/lecture-recap.md) | After class | Smart Classroom backend: ASR, summary, mind map |
| [voice-study-buddy.md](./example-prompts/voice-study-buddy.md) | After class | AI Teaching Assistant: ASR, RAG, TTS |
| [engagement-dashboard.md](./example-prompts/engagement-dashboard.md) | During class | Smart Classroom video analytics |

## Step 0 — Gather requirements

| Ask about | Default if the user doesn't say |
|---|---|
| Who uses it and what they get out of it | Ask; this decides everything else |
| Input: documents, a recording, the microphone, a video file or camera stream, text | Ask |
| Output: answers with sources, transcript, summary, mind map, audio, live statistics | Ask |
| App name | Derive a short kebab-case name; confirm it |
| Form | A single web page served by a small Python server |

Don't ask more than you need; propose defaults and let the user correct them.

## Step 1 — Map the request to services

Pick the highest-level service that already does the job:

| Capability | Service (port) | App that must be running |
|---|---|---|
| Index documents, images, or videos; grounded Q&A with sources | Content Search (9011) | Smart Classroom with `content_search` and `qa` enabled, or the Flutter RAG demo backend |
| Transcribe a class recording; summary; mind map; class report | Smart Classroom backend (8000) | Smart Classroom with `asr`, `summary`, `mindmap`, `report` enabled |
| Chat with the VLM about text or images | Smart Classroom backend `/v1/chat/completions` (8000) | Smart Classroom |
| Live class engagement from video | Smart Classroom backend video analytics (8000) | Smart Classroom with `video_analytics` enabled |
| Transcribe speech (file or live) | audio-analyzer (8010) | AI Teaching Assistant |
| Speak text aloud | text-to-speech (8011) | AI Teaching Assistant |
| Q&A over a voice assistant knowledge base | rag-service (8020) | AI Teaching Assistant |
| A full voice turn (speech in, spoken answer out) | kiosk-core (8012) | AI Teaching Assistant |

- Smart Classroom's Content Search and the AI Teaching Assistant's `rag-service`
  are separate knowledge bases; choose one per app.
- If a needed feature is disabled, say so and offer [edu-configure](../edu-configure/SKILL.md).
- If the request needs a model the suite doesn't serve, say so. Only then propose
  adding one to the app, using OpenVINO (OpenVINO GenAI or Optimum Intel) on the
  best available device, and flag it in the plan.

## Step 2 — Present the plan

Show all of the following, then stop and wait for approval:

1. **Pipeline diagram** in ASCII: input → user-app server → each suite service
   (with port and route) → model → output. For example:

   ```
   Browser --upload PDF--> user-app :8600 --POST /api/v1/object/upload-ingest--> Content Search :9011
                                                                                   text: multilingual-e5-small  (OpenVINO GenAI, CPU)
                                                                                   images: CLIP                  (OpenVINO, CPU)
   Browser --question----> user-app :8600 --POST /api/v1/object/qa-------------> Content Search :9011
                                                                                   rerank: bge-reranker-base     (OpenVINO GenAI, GPU)
                                                                                   answer: Qwen3-VL-8B int4      (OpenVINO GenAI on :8000, GPU)
   ```

2. **Intel hardware mapping**: a table of stage | service | model | Intel runtime |
   device. If the services are running, take model and device from
   `GET :8000/health`, `GET :8010/v1/model-info`, `GET :8011/v1/model-info`, and
   `GET :8020/api/v1/model-info`; otherwise use the AGENTS.md defaults and say so.
   Point out any stage that isn't on OpenVINO and the option that would be.
3. **Files** to create under `user-apps/<name>/`.
4. **Prerequisites**: which suite apps and features must be running, and the port
   the app will use (a free port outside the suite's, for example 8600; check with
   `Get-NetTCPConnection -State Listen -LocalPort <port>`).

End with: "Reply **go** (or switch to agent mode) and I'll build it."

## Step 3 — Generate the app

Default layout (no Node.js or build step needed):

```
user-apps/<name>/
  README.md          purpose, pipeline diagram, Intel mapping table, prerequisites, run and stop commands
  requirements.txt   pinned versions
  server.py          FastAPI: serves static/, exposes /healthz, calls the suite services
  static/index.html  the UI (HTML, CSS, and JavaScript in one file)
  .env.example       service URLs and port; no secrets
```

Rules:

- Only create files under `user-apps/<name>/`. Never edit the suite's app folders or configs.
- The browser talks only to `server.py`; `server.py` calls the suite services. This
  avoids CORS (several services block other origins) — don't change service CORS settings.
- Read each route's schema from `http://127.0.0.1:<port>/openapi.json` before calling it.
- Read service URLs and the port from environment variables, defaulting to the
  suite's local URLs. Bind to `127.0.0.1`.
- Pass streaming responses (NDJSON or SSE) through to the browser so text appears
  as it is generated. Use long timeouts for LLM and VLM calls, and retry on 503 or
  429 after the `Retry-After` delay.
- Validate uploads (extension and size) and request bodies (Pydantic models). No
  `shell=True`, no `eval`, no secrets in code or logs.
- Start every source file with the SPDX header from AGENTS.md.
- Pin `requirements.txt` to the versions already installed in a suite virtual environment, for example:
  `smart-classroom\smartclassroom\Scripts\pip.exe freeze | Select-String "^(fastapi|uvicorn|httpx|python-multipart)=="`.
- Put the pipeline diagram and Intel mapping table in the app's README.

## Step 4 — Verify

From `user-apps/<name>/`:

```powershell
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
.\.venv\Scripts\python.exe -m py_compile server.py
```

Then run the health check from [edu-run](../edu-run/SKILL.md) for the services the
app depends on, and report any that are down.

## Step 5 — Run

1. Ask: "Do you want me to run the app now?" Stop if the user says no, and tell them the run command from the README.
2. If the suite services it needs are down, start them with [edu-run](../edu-run/SKILL.md).
3. Start the app as a background process: `.\.venv\Scripts\python.exe server.py`.
4. Poll `http://127.0.0.1:<port>/healthz` until it answers.
5. Ask: "Open it in your default browser?" If yes: `Start-Process "http://127.0.0.1:<port>"`.
6. Report the URL, how to stop the app, and next steps: measure it with
   [edu-perf](../edu-perf/SKILL.md) or move a stage to another device with
   [edu-configure](../edu-configure/SKILL.md).
