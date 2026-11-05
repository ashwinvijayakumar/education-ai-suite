---
name: edu-configure
description: >
  Change how an existing Education AI Suite app runs: enable or disable
  features, switch models, move a stage to OpenVINO, or move it between CPU,
  GPU, and NPU. Covers Smart Classroom (Windows and Linux) and the AI Teaching
  Assistant, checks which devices are available, shows the before/after
  pipeline, applies the config change, restarts the right services, and
  verifies. Use when the user says "run it on the NPU", "use the GPU", "make it
  Intel-optimized", "switch to OpenVINO", "change the model", "enable grading",
  "turn off video analytics", or "use a smaller model".
metadata:
  argument-hint: >
    The change you want (e.g. "move ASR to OpenVINO on GPU in the teaching
    assistant", "disable video analytics in Smart Classroom")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Configure models, devices, and features

Default models, runtimes, and devices are in the "Intel-optimized stack" table of
the repository-root [AGENTS.md](../../../AGENTS.md). Change configuration, never
code, for these requests. **Run the commands yourself and report the results.**

## Step 1 — Check what the hardware offers

Ask OpenVINO which devices it sees, using the app's own virtual environment:

```powershell
smart-classroom\smartclassroom\Scripts\python.exe -c "import openvino as ov; print(ov.Core().available_devices)"
```

For the AI Teaching Assistant, use the virtual environment of the service you are
changing (for example `ai-teaching-assistant\edge-ai-libraries\microservices\audio-analyzer\venv`).
If the running services are up, `/health` (Smart Classroom) and `/v1/model-info`
or `/api/v1/model-info` (AI Teaching Assistant) show the device actually in use.

## Step 2 — Find the setting

### Smart Classroom (Windows) — `smart-classroom/Windows/config.yaml`

| Change | Key | Allowed values |
|---|---|---|
| Turn a feature on or off | `features.<name>.enabled` | `asr`, `summary`, `mindmap`, `topic_segmentation`, `video_analytics`, `board_ocr`, `content_search`, `qa`, `grading`, `report` |
| ASR engine and model | `models.asr.provider`, `models.asr.name` | `openai`, `openvino`, `funasr`; `whisper-base`, `whisper-small`, ..., `paraformer-zh` |
| ASR device | `models.asr.device` | `CPU` (Whisper supports only CPU here) |
| Summary, mind map, segmentation, Q&A, report model | `models.text_gen.vlm_name`, `.device`, `.weight_format` | device `GPU` or `CPU`; `int4`, `int8` |
| Video analytics | `models.va.device`, pose models | `NPU`, `GPU`, `CPU` |
| OCR | `models.ocr.provider`, `.device` | `native` or `openvino`; `CPU` or `GPU` |
| Content Search embeddings and reranker | `content_search.file_ingest.doc_embedding_device`, `content_search.file_ingest.reranker.device` | `CPU`, `GPU` |
| GPU scheduling priority | `models.gpu_queue_priority` | `LOW`, `MEDIUM`, `HIGH` |

See [advanced-setup-guide.md Step 2](../../../smart-classroom/docs/user-guide/advanced-setup-guide.md#step-2-configuration)
for feature details. The desktop app's **Configuration** screen edits the same file.

### Smart Classroom (Linux) — `smart-classroom/Linux/config.yaml`

Same structure. `setup.sh` regenerates Compose profiles and model lists from it.
The VLM is served by OVMS (`models.text_gen.ovms.*`), and the Content Search
reranker requires a GPU.

### AI Teaching Assistant — runtime files in the submodules

| Service | File (under `ai-teaching-assistant/`) | Keys |
|---|---|---|
| ASR | `edge-ai-libraries/microservices/audio-analyzer/config.yaml` | `models.asr.provider` (`openai`, `openvino`, `whispercpp`, `funasr`), `.name`, `.device` (`CPU`, `GPU`, `NPU` with `openvino`; `CPU` only otherwise) |
| TTS | `edge-ai-libraries/microservices/text-to-speech/config.yaml` | `models.tts.name`, `.runtime`, `.device` (Kokoro: ONNX Runtime on CPU; SpeechT5: OpenVINO on CPU or GPU) |
| LLM, embeddings, reranker | `voice-enabled-interactions/smart-kiosk-assistant/rag-service/config.yaml` | `models.llm.hf_id`, `.device`, `.weight_format`; `models.embedding.device`; `retrieval.reranker.device` (`CPU` or `GPU`) |
| Launcher overrides | `.env` | `SMART_KIOSK_RAG__MODELS__LLM__BACKEND` and the `KIOSK_CORE_*` variables in [configuration.md](../../../ai-teaching-assistant/docs/user-guide/get-started/configuration.md) |

These files belong to submodules. Edit them locally to change the runtime, but
don't commit them to the submodule; mirror intentional defaults in
[ai-teaching-assistant/configs](../../../ai-teaching-assistant/configs/README.md) instead.
For deeper ASR or TTS changes, use the upstream
[audio-analyzer-dev](../../../ai-teaching-assistant/edge-ai-libraries/microservices/audio-analyzer/.github/skills/audio-analyzer-dev/SKILL.md)
and [text-to-speech-dev](../../../ai-teaching-assistant/edge-ai-libraries/microservices/text-to-speech/.github/skills/text-to-speech-dev/SKILL.md)
skills; the TTS skill lists models that currently don't work.

## Step 3 — Plan (show before applying)

Show the user:

1. An ASCII diagram of the pipeline with each stage's model, runtime, and device, before and after.
2. A table: stage | current | proposed | why.
3. Trade-offs in words (for example, NPU frees the GPU for the VLM; int4 uses less memory than int8). Don't invent numbers; offer to measure with [edu-perf](../edu-perf/SKILL.md).

Apply only after the user agrees.

## Step 4 — Apply and restart

1. Edit the YAML key(s); keep comments and indentation. Show `git diff` (or
   `git -C <submodule> diff`) afterwards.
2. Restart only what's needed:

| App | Restart |
|---|---|
| Smart Classroom (Windows) | Stop and start with [edu-run](../edu-run/SKILL.md). The desktop app offers a restart when you save from its Configuration screen. |
| Smart Classroom (Linux) | `./setup.sh` |
| AI Teaching Assistant | Stop only the changed service by its port (see edu-run), then rerun `.\start_ata.ps1 -NoBrowser`; it reuses services that are still healthy. Avoid `stop_ata.ps1` unless needed, because it deletes the knowledge base. |

3. A new model or precision may download and compile on first start; wait for health.

## Step 5 — Verify

Confirm the new model and device from `/health` or `/model-info`, run one request
through the changed stage, and report the result. If the device isn't available
or the service fails to start, revert the change and report the error.
