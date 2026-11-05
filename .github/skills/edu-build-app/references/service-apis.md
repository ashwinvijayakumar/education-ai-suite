<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Suite service APIs

Key routes a new app can call. Every service is a FastAPI app, so the exact
request and response schemas are at `http://127.0.0.1:<port>/openapi.json`
(and an interactive page at `/docs`) while it runs. Read those before writing
client code; this page tells you which routes to look at.

## Contents

- [Calling the services from a browser](#calling-the-services-from-a-browser)
- [Smart Classroom backend :8000](#smart-classroom-backend-8000)
- [Content Search :9011](#content-search-9011)
- [Grading :9012](#grading-9012)
- [AI Teaching Assistant services](#ai-teaching-assistant-services)
- [Errors and timing](#errors-and-timing)

## Calling the services from a browser

| Service | Browser calls from another port |
|---|---|
| Smart Classroom backend :8000 | Allowed (CORS `*`) |
| Content Search :9011 | Blocked (no CORS) |
| audio-analyzer :8010 | Allowed (CORS `*`) |
| text-to-speech :8011, rag-service :8020 | Blocked unless the origin is in their allow-list (defaults are `http://127.0.0.1` and `http://localhost` without a port) |
| kiosk-core :8012 | Blocked (no CORS) |

So a user app should route browser calls through its own server (same-origin
proxy), the way `ai-teaching-assistant/ata_ui_server.py` does. Don't change the
services' CORS settings.

## Smart Classroom backend :8000

Feature routes exist only when the feature is enabled in `config.yaml`; check
`GET /features`. Most session routes take an `x-session-id` header: 32 lowercase
letters and digits, from `GET /create-session`.

| Need | Route | Notes |
|---|---|---|
| Health and model state | `GET /health` | `hub.<asr\|ocr\|text_gen>.state`, `provider`, `device` |
| Enabled features | `GET /features` | |
| New session | `GET /create-session` | Returns `{"session-id": "..."}` |
| Upload a recording | `POST /upload-audio` (multipart `file`; `.wav`, `.mp3`, `.m4a`) | Returns `{filename, path}`; pass `path` on |
| Transcribe | `POST /transcribe` with `x-session-id`, JSON `{"audio_filename": "<path>", "source_type": "audio_file"}` | NDJSON stream of transcript chunks; `source_type: "microphone"` records from the server's microphone |
| Summary | `POST /summarize` JSON `{"session_id": "..."}` | NDJSON `{"token", "error"}`; needs the session's transcript |
| Mind map | `POST /mindmap` JSON `{"session_id": "..."}` | JSON `{"mindmap", "error"}` (Mermaid text) |
| Class report | `POST /report/generate` JSON `{"session_id", "selected_fields", "manual_fields"}`; `GET /report/template-fields`; `GET /report/{session_id}/download` | NDJSON stream; fields come from `template-fields` |
| VLM chat (text and images) | `POST /v1/chat/completions` | OpenAI-compatible; `stream: true` gives SSE |
| Video analytics | `POST /start-video-analytics-pipeline` with `x-session-id`, JSON `[{"pipeline_name": "front"\|"back"\|"content", "source": "<video file path or RTSP URL>", "output_stream": true}]`; `POST /stop-video-analytics-pipeline` | Returns HLS/WebRTC stream URLs |
| Live class statistics | `GET /class-statistics` with `x-session-id` | NDJSON every 5 s: `student_count`, `stand_count`, `raise_up_count`, `stand_reid` |
| Sessions and outputs | `GET /v1/sessions`, `GET /v1/sessions/{id}/status`, `GET /v1/sessions/{id}/artifacts`, `GET /v1/sessions/{id}/artifacts/{stage}` | Read stored transcript, summary, and other stage outputs |
| Performance | `GET /processing-stats`, `GET /metrics`, `GET /platform-info` | See the edu-perf skill |

## Content Search :9011

Upload, poll, and Q&A are documented step by step in the
[sc-upload](../../sc-upload/SKILL.md), [sc-qa](../../sc-qa/SKILL.md), and
[sc-files](../../sc-files/SKILL.md) skills; reuse their request shapes.

| Need | Route |
|---|---|
| Readiness | `GET /api/v1/system/health` (503 until every sub-service is ready) |
| Upload and index a file (documents, images, videos) | `POST /api/v1/object/upload-ingest` (multipart `file`, optional `meta` JSON string) → `task_id` |
| Index raw text | `POST /api/v1/object/ingest-text` |
| Poll indexing | `GET /api/v1/task/query/{task_id}` until `COMPLETED` or `FAILED` |
| Grounded Q&A with sources | `POST /api/v1/object/qa` `{"question", "history", "filter": {"tags"}}` (generation can take 30–90 s) |
| Semantic search without generation | `POST /api/v1/object/search` |
| Files and tags | `GET /api/v1/object/files/list`, `DELETE /api/v1/object/files/{file_hash}`, `GET /api/v1/object/tags` |

## Grading :9012

Optional (`features.grading.enabled`). Rubrics under `/api/v1/rubrics`; create a
task with `POST /api/v1/grading/tasks`, poll `GET /api/v1/grading/tasks/{task_id}`,
and read `GET /api/v1/grading/tasks/{task_id}/summary`. Check `/openapi.json` for
the request body.

## AI Teaching Assistant services

| Service | Need | Route |
|---|---|---|
| audio-analyzer :8010 | Transcribe a file | `POST /v1/audio/transcriptions` (OpenAI-compatible; `stream=true` gives SSE) |
| | Live audio | `WS /v1/realtime?intent=transcription` |
| | Details | [audio-analyzer-user skill](../../../../ai-teaching-assistant/edge-ai-libraries/microservices/audio-analyzer/.github/skills/audio-analyzer-user/SKILL.md) |
| text-to-speech :8011 | Speak text | `POST /v1/audio/speech` (OpenAI-compatible), `POST /v1/audio/speech/stream`, `GET /v1/audio/voices` |
| | Details | [text-to-speech-user skill](../../../../ai-teaching-assistant/edge-ai-libraries/microservices/text-to-speech/.github/skills/text-to-speech-user/SKILL.md) |
| rag-service :8020 | Add documents to the knowledge base | `POST /api/v1/context/file` (multipart, `.txt`, `.md`, `.docx`, `.pdf`), `POST /api/v1/context` (JSON text) |
| | Ask | `POST /api/v1/query` JSON `{"transcription": "<question>", "history", "top_k", "include_sources": true}` → SSE `data: {"token"}` … `[DONE]`; or `POST /v1/chat/completions` (OpenAI-compatible) |
| | Manage | `GET /api/v1/context/stats`, `DELETE /api/v1/context` (clears the knowledge base) |
| kiosk-core :8012 | Full voice or text turn (ASR → RAG → TTS) | `POST /api/v1/query/text`; voice sessions under `/api/v1/sessions/*`; reply audio at `GET /api/v1/sessions/{session_id}/response-audio/{index}` |
| | Turn latencies | `GET /api/v1/pipeline/latest`, `GET /api/v1/pipeline/recent?n=` |
| metrics-collector :9000 | Utilization | `GET /metrics`, `GET /platform-info`, `GET /memory` |

## Errors and timing

- 503 from the Smart Classroom backend means a model queue is full or memory is
  short; honor the `Retry-After` header. `/transcribe` can return 429 when busy.
- VLM and LLM calls are slow (tens of seconds). Use timeouts of several minutes
  (`ata_ui_server.py` uses 600 s) and stream tokens to the UI instead of waiting.
- The first request after a start includes model compile and warmup.
