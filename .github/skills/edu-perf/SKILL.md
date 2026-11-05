---
name: edu-perf
description: >
  Measure performance of the Education AI Suite on Intel hardware: per-stage
  and per-model latency (p50/p95), CPU/GPU/NPU/memory utilization, power, and
  which device each model actually runs on. Covers Smart Classroom (Windows
  and Linux) and the AI Teaching Assistant, and produces a comparable report so
  runs on different devices or models can be compared. Use when the user says
  "measure performance", "benchmark", "how fast is it", "latency", "is it using
  the NPU", "GPU utilization", "power consumption", or "compare CPU vs GPU".
metadata:
  argument-hint: >
    What to measure (e.g. "summary latency on GPU vs CPU", "end-to-end voice
    turn latency in the AI Teaching Assistant", "NPU utilization during video
    analytics")
---

<!--
SPDX-FileCopyrightText: (C) 2026 Intel Corporation
SPDX-License-Identifier: Apache-2.0
-->

# Measure performance

Service ports and default devices are in the repository-root
[AGENTS.md](../../../AGENTS.md). **Run the commands yourself and report the
results.** The services must be running; use [edu-run](../edu-run/SKILL.md) first.

## Step 0 — Agree on the measurement

Ask, if not given:

| Question | Why |
|---|---|
| Which app and which stages (ASR, summary, mind map, video analytics, Q&A, voice turn...) | Decides the endpoints below |
| What input (a specific audio/video/document, or a sample) | Results are only comparable with the same input |
| What to compare (devices, models, precision), if anything | Each variant is a config change via [edu-configure](../edu-configure/SKILL.md) plus a rerun |
| How many runs | Report p50/p95 over several runs; the first run includes model compile and warmup |

## Step 1 — Record the environment

```powershell
Invoke-RestMethod http://127.0.0.1:8000/platform-info        # Smart Classroom: CPU, GPU, NPU
(Invoke-RestMethod http://127.0.0.1:8000/health).hub          # Smart Classroom: state, provider, device per model
Invoke-RestMethod http://127.0.0.1:9000/platform-info        # AI Teaching Assistant metrics-collector
Invoke-RestMethod http://127.0.0.1:8010/v1/model-info        # ASR model, provider, device
Invoke-RestMethod http://127.0.0.1:8011/v1/model-info        # TTS model and device
Invoke-RestMethod http://127.0.0.1:8020/api/v1/model-info    # RAG LLM, embedding, reranker
```

Use these responses, not the config files, to state which device each model runs on.

## Smart Classroom (Windows)

### Latency per stage and per model

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/processing-stats?session_id=<id>"   # omit session_id for all sessions; add &raw=true for raw records
```

Returns count, total, mean, min/max, p50, and p95 per workflow stage and per model
call, with queue wait and time to first output. Failed and cancelled attempts are
counted separately; unavailable measurements are `null`, never zero. Records are
kept in memory and reset when the backend restarts. Details:
[processing-time-statistics.md](../../../smart-classroom/docs/dev-guide/processing-time-statistics/processing-time-statistics.md).

### Utilization (CPU, GPU, NPU, memory, power)

Session IDs come from `GET /create-session` (32 lowercase letters and digits).

```powershell
$sid = (Invoke-RestMethod http://127.0.0.1:8000/create-session).'session-id'
Invoke-RestMethod -Method Post http://127.0.0.1:8000/start-monitoring -Headers @{ 'x-session-id' = $sid }
# ... run the workload with this session ID ...
Invoke-RestMethod http://127.0.0.1:8000/metrics -Headers @{ 'x-session-id' = $sid }
Invoke-RestMethod -Method Post http://127.0.0.1:8000/stop-monitoring
```

- Samples every `monitoring.interval` seconds (default 2) into CSV files for the session.
- Power uses SoCWatch at `monitoring.socwatch_path` and needs an elevated backend.
  NPU utilization uses `npu_utilization.exe` at `monitoring.npu_exe_path`. If
  either tool is missing, report that series as unavailable instead of zero.
- The UI's resource utilization panel shows the same data.

### LLM throughput under different context lengths

Use the context benchmark in `smart-classroom/Windows/components/context_bench`
(`run_benchmark.ps1`); see
[context-bench-guide.md](../../../smart-classroom/docs/dev-guide/context-bench/context-bench-guide.md).

## Smart Classroom (Linux)

- Utilization comes from the `metrics-collector` container, published on host port 9100.
- The backend exposes `GET /metrics` and `GET /performance-metrics`; it does not
  have `/processing-stats`.
- See [linux-docker-architecture.md](../../../smart-classroom/docs/user-guide/linux-docker-architecture.md).

## AI Teaching Assistant

### Latency per voice turn

```powershell
Invoke-RestMethod http://127.0.0.1:8012/api/v1/pipeline/latest        # last completed turn, per-stage latencies
Invoke-RestMethod "http://127.0.0.1:8012/api/v1/pipeline/recent?n=10" # up to 20 recent turns
Invoke-RestMethod http://127.0.0.1:8010/v1/performance                # last ASR call
Invoke-RestMethod http://127.0.0.1:8011/v1/performance                # TTS
Invoke-RestMethod http://127.0.0.1:8020/api/v1/performance            # retrieval and LLM latency stats
```

To generate repeatable turns without a microphone, feed a 16-bit mono PCM WAV
through the full ASR → RAG → TTS pipeline from `ai-teaching-assistant`, with any
Python environment that has `httpx` installed:

```powershell
python virtual_mic_session.py question.wav --loop 5
```

### Utilization

`GET http://127.0.0.1:9000/metrics` (CPU, GPU, NPU, memory, power time series),
`/memory` (latest sample), and `/platform-info`.

## Step 2 — Report

Present one table per run, and a comparison table if there were variants:

| Stage | Model | Runtime | Device | Runs | p50 | p95 | Notes |
|---|---|---|---|---|---|---|---|

Then add peak and average CPU, GPU, NPU, memory, and power during the run, the
input used, and anything that makes runs not comparable (first-run warmup, a
missing tool, another app sharing the GPU). Don't present estimated numbers as
measurements.
